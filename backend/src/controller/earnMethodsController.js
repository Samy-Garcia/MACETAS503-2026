import earnMethodModel from "../models/earnMethod.js";

const earnMethodsController = {};

// Valores por defecto de los 4 mecanismos reales. Se crean solos la primera
// vez que alguien pide el listado, así el admin nunca ve una tabla vacía
// y nunca puede "perder" uno de estos por accidente.
const CORE_DEFAULTS = [
    { actionType: "purchase", title: "Compra", description: "Gana hojas por cada $1 en compras. Se acreditan solas al confirmar tu pedido.", points: 1, order: 1 },
    { actionType: "review", title: "Reseñas", description: "Comparte tu experiencia sobre un producto que ya recibiste.", points: 25, order: 2 },
    { actionType: "referral", title: "Refiere a un amigo", description: "Comparte tu código de referido. Ganas hojas apenas tu amigo haga su primera compra.", points: 200, order: 3 },
    { actionType: "birthday", title: "Cumpleaños", description: "Reclama tu bono el día de tu cumpleaños.", points: 100, order: 4 },
];

const ensureCoreMethods = async () => {
    for (const core of CORE_DEFAULTS) {
        const exists = await earnMethodModel.findOne({ actionType: core.actionType });
        if (!exists) {
            await earnMethodModel.create(core);
        }
    }
};

// Lee cuántas hojas otorga un mecanismo real (purchase/review/referral/birthday).
// La usan cartController, reviewController y loyaltyController en vez de números
// quemados, así el admin controla los valores de verdad desde un solo lugar.
export const getEarnMethod = async (actionType) => {
    await ensureCoreMethods();
    return earnMethodModel.findOne({ actionType });
};

// GET (admin) — todas, activas e inactivas
earnMethodsController.getAll = async (req, res) => {
    try {
        await ensureCoreMethods();
        const methods = await earnMethodModel.find().sort({ order: 1, createdAt: 1 });
        res.status(200).json(methods);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// GET (público/cliente) — solo activas
earnMethodsController.getActive = async (req, res) => {
    try {
        await ensureCoreMethods();
        const methods = await earnMethodModel.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        res.status(200).json(methods);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// POST — solo se pueden crear entradas "custom" (los 4 mecanismos reales ya existen siempre)
earnMethodsController.create = async (req, res) => {
    try {
        const { title, description, points, linkTo, isActive, order } = req.body;

        if (!title || !description || points === undefined || points === null || points === "") {
            return res.status(400).json({ message: "Título, descripción y hojas son obligatorios" });
        }

        if (isNaN(points) || points <= 0) {
            return res.status(400).json({ message: "Las hojas deben ser un número mayor a 0" });
        }

        const newMethod = new earnMethodModel({
            actionType: "custom",
            title,
            description,
            points,
            linkTo,
            isActive: isActive !== undefined ? isActive : true,
            order: order || 0,
        });

        await newMethod.save();
        res.status(201).json({ message: "Método para ganar hojas creado exitosamente", method: newMethod });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// PUT — editar cualquier entrada (título, descripción, hojas, activa/inactiva). El
// actionType nunca se toca desde aquí, así no se puede "convertir" una custom en purchase.
earnMethodsController.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, points, linkTo, isActive, order } = req.body;

        const method = await earnMethodModel.findById(id);
        if (!method) {
            return res.status(404).json({ message: "Método para ganar hojas no encontrado" });
        }

        if (points !== undefined && (isNaN(points) || points <= 0)) {
            return res.status(400).json({ message: "Las hojas deben ser un número mayor a 0" });
        }

        if (title !== undefined) method.title = title;
        if (description !== undefined) method.description = description;
        if (points !== undefined) method.points = points;
        if (isActive !== undefined) method.isActive = isActive;
        if (order !== undefined) method.order = order;
        if (method.actionType === "custom" && linkTo !== undefined) method.linkTo = linkTo;

        await method.save();
        res.status(200).json({ message: "Método para ganar hojas actualizado exitosamente", method });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// DELETE — solo entradas "custom"; las 4 reales solo se pueden desactivar, no borrar
earnMethodsController.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const method = await earnMethodModel.findById(id);

        if (!method) {
            return res.status(404).json({ message: "Método para ganar hojas no encontrado" });
        }

        if (method.actionType !== "custom") {
            return res.status(400).json({ message: "Este mecanismo es parte del sistema; solo puedes desactivarlo, no eliminarlo" });
        }

        await earnMethodModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Método para ganar hojas eliminado exitosamente" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default earnMethodsController;
