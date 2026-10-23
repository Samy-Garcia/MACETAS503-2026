import postModel from "../models/post.js";
import candlesModel from "../models/candles.js";
import plantsModel from "../models/plants.js";
import otherProductModel from "../models/otherProduct.js";
import comboModel from "../models/combo.js";

const catalogController = {};

// GET /api/catalog/newest (público) — lo último que se agregó al catálogo,
// sin importar si es maceta, vela o planta. Lo usa "Nuevos Productos" en el inicio.
catalogController.getNewest = async (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 6, 20);

        // Traemos un poco más de cada colección de lo que vamos a mostrar,
        // para no perder productos recientes de una categoría si otra
        // categoría tiene muchísimos productos nuevos.
        const perCollection = limit;

        const [posts, candles, plants] = await Promise.all([
            postModel.find({ isActive: { $ne: false } }).sort({ createdAt: -1 }).limit(perCollection),
            candlesModel.find({ isActive: { $ne: false } }).sort({ createdAt: -1 }).limit(perCollection),
            plantsModel.find().sort({ createdAt: -1 }).limit(perCollection)
        ]);

        const merged = [
            ...posts.map(p => ({ ...p.toObject(), productType: "maceta" })),
            ...candles.map(c => ({ ...c.toObject(), productType: "vela" })),
            ...plants.map(p => ({ ...p.toObject(), productType: "planta" }))
        ];

        const newest = merged
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);

        return res.status(200).json(newest);

    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// ---------------------------------------------------------------------------
// BUSCADOR
// ---------------------------------------------------------------------------

// Cada vocal acepta todas sus variantes con tilde/diéresis, así "maceta
// terracota" encuentra "Terracota" y "cafe" encuentra "Café" (y viceversa).
// Los demás caracteres se escapan para que lo escrito por el usuario nunca se
// interprete como una expresión regular (ej: "(" o "*" no deben romper nada).
const ACCENT_CLASSES = {
    a: "[aáàäâ]", e: "[eéèëê]", i: "[iíìïî]", o: "[oóòöô]", u: "[uúùüû]", n: "[nñ]"
};

const buildWordRegex = (word) => {
    const pattern = word
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split("")
        .map(ch => ACCENT_CLASSES[ch] || ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("");
    return new RegExp(pattern, "i");
};

// GET /api/catalog/search?q=... (público)
// Busca en TODAS las categorías (macetas, velas, plantas, otros y combos) por
// nombre, descripción y otros datos propios de cada una. Si la búsqueda tiene
// varias palabras, el producto debe contener todas (en cualquier campo).
catalogController.search = async (req, res) => {
    try {
        const rawQuery = String(req.query.q || "").trim().replace(/\s+/g, " ");

        if (rawQuery.length < 2) {
            return res.status(400).json({ message: "Escribe al menos 2 caracteres para buscar" });
        }
        if (rawQuery.length > 60) {
            return res.status(400).json({ message: "La búsqueda no puede tener más de 60 caracteres" });
        }

        const words = rawQuery.split(" ").slice(0, 6);
        const wordRegexes = words.map(buildWordRegex);

        // Para cada palabra: debe aparecer en AL MENOS uno de los campos
        const buildFilter = (fields) => ({
            $and: wordRegexes.map(rx => ({ $or: fields.map(f => ({ [f]: rx })) }))
        });

        const activeOnly = { isActive: { $ne: false } };
        const LIMIT = 20;

        const [posts, candles, plants, others, combos] = await Promise.all([
            postModel.find({ ...activeOnly, ...buildFilter(["name", "description", "color"]) }).limit(LIMIT),
            candlesModel.find({ ...activeOnly, ...buildFilter(["name", "description", "scent", "color"]) }).limit(LIMIT),
            plantsModel.find(buildFilter(["name", "careLight", "careWater", "careSoil", "careTemperature"])).limit(LIMIT),
            otherProductModel.find({ ...activeOnly, ...buildFilter(["name", "description", "color"]) }).limit(LIMIT),
            comboModel.find({ ...activeOnly, ...buildFilter(["name", "description"]) }).limit(LIMIT)
        ]);

        const toResult = (doc, productType) => ({
            _id: doc._id,
            name: doc.name,
            price: doc.price,
            image: doc.image,
            stock: doc.stock,
            productType
        });

        const results = [
            ...posts.map(d => toResult(d, "maceta")),
            ...candles.map(d => toResult(d, "vela")),
            ...plants.map(d => toResult(d, "planta")),
            ...others.map(d => toResult(d, "otro")),
            ...combos.map(d => toResult(d, "combo"))
        ];

        // Los que empiezan con lo buscado van primero; luego por nombre
        const first = rawQuery.toLowerCase();
        results.sort((a, b) => {
            const aStarts = (a.name || "").toLowerCase().startsWith(first) ? 0 : 1;
            const bStarts = (b.name || "").toLowerCase().startsWith(first) ? 0 : 1;
            return aStarts - bStarts || (a.name || "").localeCompare(b.name || "", "es");
        });

        return res.status(200).json(results);
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default catalogController;
