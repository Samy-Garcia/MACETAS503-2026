import jsonwebtoken from "jsonwebtoken";
import { config } from "../../config.js";

import testimonialModel from "../models/testimonial.js";
import clientModel from "../models/client.js";

const testimonialController = {};

const getLoggedClientId = (req) => {
    const token = req.cookies.authCookie;
    if (!token) return null;
    try {
        const decoded = jsonwebtoken.verify(token, config.JWT.secret);
        if (decoded.userType !== "client") return null;
        return decoded.id;
    } catch (err) {
        return null;
    }
};

// GET /api/testimonials (público) — los mejores primero, luego los más recientes
testimonialController.getAll = async (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 8, 30);

        const testimonials = await testimonialModel
            .find()
            .sort({ rating: -1, createdAt: -1 })
            .limit(limit);

        return res.status(200).json(testimonials);

    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// GET /api/testimonials/mine — para precargar el formulario si el cliente ya dejó uno
testimonialController.getMine = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const testimonial = await testimonialModel.findOne({ clientId });
        return res.status(200).json(testimonial || null);

    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// POST /api/testimonials — crea el testimonio del cliente, o actualiza el
// que ya tenía (no permitimos más de uno por cliente)
testimonialController.upsert = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión para dejar una reseña" });
        }

        const { rating, text } = req.body;

        const ratingNum = Number(rating);
        if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ message: "La calificación debe ser un número entre 1 y 5" });
        }

        const cleanText = (text || "").trim();
        if (cleanText.length < 10 || cleanText.length > 300) {
            return res.status(400).json({ message: "La reseña debe tener entre 10 y 300 caracteres" });
        }

        const client = await clientModel.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        const testimonial = await testimonialModel.findOneAndUpdate(
            { clientId },
            {
                clientId,
                clientName: client.name,
                clientPhoto: client.photo || null,
                rating: ratingNum,
                text: cleanText
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json(testimonial);

    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// GET /api/testimonials/admin — TODOS los testimonios sin límite, para la
// pantalla de administración (a diferencia de getAll, que es público y
// limitado, pensado para el carrusel del inicio)
testimonialController.getAllAdmin = async (req, res) => {
    try {
        const testimonials = await testimonialModel
            .find()
            .sort({ createdAt: -1 });

        return res.status(200).json(testimonials);

    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// DELETE /api/testimonials/:id — el admin puede borrar cualquier testimonio
// (por ejemplo, si alguien deja una calificación mala solo para dañar la
// reputación del negocio, sin relación real con una compra)
testimonialController.adminDelete = async (req, res) => {
    try {
        const { id } = req.params;

        const testimonial = await testimonialModel.findByIdAndDelete(id);
        if (!testimonial) {
            return res.status(404).json({ message: "Testimonio no encontrado" });
        }

        return res.status(200).json({ message: "Testimonio eliminado" });

    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default testimonialController;
