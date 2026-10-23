import { v2 as cloudinary } from "cloudinary";

import rewardModel from "../models/reward.js";
import { todayInElSalvador, toDateOnly } from "../utils/dateUtils.js";

// Valida el rango de fechas de una recompensa por tiempo limitado.
// - Formato de fecha válido.
// - No se puede empezar ni terminar en el pasado (se permite conservar una
//   fecha de inicio que ya tenía la recompensa al editarla).
// - La fecha final no puede ser anterior a la inicial.
// Devuelve un mensaje de error, o null si todo está bien.
const validateRewardDates = (startDate, endDate, previous = {}) => {
    const hoy = todayInElSalvador();
    const start = startDate ? toDateOnly(startDate) : null;
    const end = endDate ? toDateOnly(endDate) : null;

    if (startDate && !start) return "La fecha de inicio no es válida";
    if (endDate && !end) return "La fecha final no es válida";

    const prevStart = previous.startDate ? toDateOnly(previous.startDate) : null;
    const prevEnd = previous.endDate ? toDateOnly(previous.endDate) : null;

    if (start && start < hoy && start !== prevStart) return "La fecha de inicio no puede ser una fecha pasada";
    if (end && end < hoy && end !== prevEnd) return "La fecha final no puede ser una fecha pasada";
    if (start && end && end < start) return "La fecha final no puede ser anterior a la fecha de inicio";
    return null;
};

const rewardsController = {};

// GET (admin) — todas, activas e inactivas, para gestionarlas
rewardsController.getAll = async (req, res) => {
    try {
        const rewards = await rewardModel.find().sort({ createdAt: -1 });
        res.status(200).json(rewards);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// POST — crear recompensa nueva (con imagen)
rewardsController.create = async (req, res) => {
    try {
        const { title, description, cost, category, type, discountPercent, isActive, startDate, endDate } = req.body;

        if (!title || !description || !cost || !category || !type) {
            return res.status(400).json({ message: "Título, descripción, costo, categoría y tipo son obligatorios" });
        }

        if (isNaN(cost) || cost <= 0) {
            return res.status(400).json({ message: "El costo en hojas debe ser un número mayor a 0" });
        }

        if (type === "coupon" && (!discountPercent || discountPercent <= 0 || discountPercent > 100)) {
            return res.status(400).json({ message: "Un cupón necesita un porcentaje de descuento entre 1 y 100" });
        }

        const datesError = validateRewardDates(startDate, endDate);
        if (datesError) {
            return res.status(400).json({ message: datesError });
        }

        if (!req.file) {
            return res.status(400).json({ message: "La imagen es obligatoria" });
        }

        const newReward = new rewardModel({
            title,
            description,
            cost,
            category,
            type,
            discountPercent: type === "coupon" ? discountPercent : undefined,
            image: req.file.path,
            public_id: req.file.filename,
            isActive: isActive !== undefined ? isActive : true,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        });

        await newReward.save();

        res.status(201).json({ message: "Recompensa creada exitosamente", reward: newReward });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// PUT — actualizar (imagen opcional)
rewardsController.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, cost, category, type, discountPercent, isActive, startDate, endDate } = req.body;

        const rewardToUpdate = await rewardModel.findById(id);
        if (!rewardToUpdate) {
            return res.status(404).json({ message: "Recompensa no encontrada" });
        }

        if (cost !== undefined && (isNaN(cost) || cost <= 0)) {
            return res.status(400).json({ message: "El costo en hojas debe ser un número mayor a 0" });
        }

        const datesError = validateRewardDates(startDate, endDate, rewardToUpdate);
        if (datesError) {
            return res.status(400).json({ message: datesError });
        }

        const updatedData = {
            title,
            description,
            cost,
            category,
            type,
            discountPercent: type === "coupon" ? discountPercent : undefined,
            isActive: isActive !== undefined ? isActive : rewardToUpdate.isActive,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        };

        if (req.file) {
            if (rewardToUpdate.public_id) {
                await cloudinary.uploader.destroy(rewardToUpdate.public_id);
            }
            updatedData.image = req.file.path;
            updatedData.public_id = req.file.filename;
        }

        await rewardModel.findByIdAndUpdate(id, updatedData, { new: true });

        res.status(200).json({ message: "Recompensa actualizada exitosamente" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// DELETE
rewardsController.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const rewardToDelete = await rewardModel.findById(id);

        if (!rewardToDelete) {
            return res.status(404).json({ message: "Recompensa no encontrada" });
        }

        if (rewardToDelete.public_id) {
            await cloudinary.uploader.destroy(rewardToDelete.public_id);
        }

        await rewardModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Recompensa eliminada exitosamente" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default rewardsController;
