import comboModel from "../models/combo.js";
import reviewModel from "../models/review.js";

import { v2 as cloudinary } from "cloudinary";

const comboController = {};

const parseJsonField = (value, fallback = []) => {
    if (!value) return fallback;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch (err) {
        return fallback;
    }
};

// GET
comboController.getAll = async (req, res) => {
    try {

        const combos = await comboModel.find();

        const ratingAgg = await reviewModel.aggregate([
            { $match: { productType: "combo" } },
            {
                $group: {
                    _id: "$productId",
                    avgRating: { $avg: "$rating" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const ratingMap = new Map();
        ratingAgg.forEach(r => {
            ratingMap.set(r._id.toString(), {
                rating: Math.round(r.avgRating * 10) / 10,
                reviewCount: r.count
            });
        });

        const combosConRating = combos.map(combo => {
            const ratingInfo = ratingMap.get(combo._id.toString());
            const obj = combo.toObject();
            obj.rating = ratingInfo ? ratingInfo.rating : null;
            obj.reviewCount = ratingInfo ? ratingInfo.reviewCount : 0;
            return obj;
        });

        res.status(200).json(combosConRating);

    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// GET ONE (por id, lo usa la página de detalle del cliente)
comboController.getById = async (req, res) => {
    try {

        const { id } = req.params;
        const combo = await comboModel.findById(id);

        if (!combo) {
            return res.status(404).json({ message: "Combo no encontrado" });
        }

        res.status(200).json(combo);

    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// POST
comboController.create = async (req, res) => {
    try {

        const { name, description, price, stock } = req.body;

        if (!name || !description || price === undefined || price === null || price === '' || stock === undefined || stock === null || stock === '') {
            return res.status(400).json({
                message: "Nombre, descripción, precio y stock son obligatorios"
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: "Debes subir al menos una imagen"
            });
        }

        if (name.trim().length < 3 || name.trim().length > 50) {
            return res.status(400).json({
                message: "El nombre debe tener entre 3 y 50 caracteres"
            });
        }

        if (description.length < 10 || description.length > 300) {
            return res.status(400).json({
                message: "La descripción debe tener entre 10 y 300 caracteres"
            });
        }

        if (isNaN(price) || price <= 0) {
            return res.status(400).json({
                message: "El precio debe ser un número mayor a 0"
            });
        }

        if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
            return res.status(400).json({
                message: "El stock debe ser un número entero mayor o igual a 0"
            });
        }

        const items = parseJsonField(req.body.items);
        if (items.length === 0) {
            return res.status(400).json({
                message: "Un combo debe incluir al menos un producto"
            });
        }

        const images = req.files.map(file => ({ url: file.path, public_id: file.filename }));

        const newCombo = new comboModel({
            name,
            description,
            price,
            stock,

            items,

            images,
            image: images[0].url,
            public_id: images[0].public_id,

            isActive: true
        });

        await newCombo.save();

        res.status(201).json({
            message: "Combo creado exitosamente",
            combo: newCombo
        });

    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// DELETE
comboController.delete = async (req, res) => {
    try {

        const { id } = req.params;
        const comboToDelete = await comboModel.findById(id);

        if (!comboToDelete) {
            return res.status(404).json({ message: "Combo no encontrado" });
        }

        await cloudinary.uploader.destroy(comboToDelete.public_id);

        await comboModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Combo eliminado exitosamente" });

    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// PUT
comboController.update = async (req, res) => {
    try {

        const { id } = req.params;
        const { name, description, price, stock } = req.body;

        const comboToUpdate = await comboModel.findById(id);

        if (!comboToUpdate) {
            return res.status(404).json({ message: "Combo no encontrado" });
        }

        if (name && (name.trim().length < 3 || name.trim().length > 50)) {
            return res.status(400).json({
                message: "El nombre debe tener entre 3 y 50 caracteres"
            });
        }

        if (description && (description.length < 10 || description.length > 300)) {
            return res.status(400).json({
                message: "La descripción debe tener entre 10 y 300 caracteres"
            });
        }

        if (price && (isNaN(price) || price <= 0)) {
            return res.status(400).json({
                message: "El precio debe ser un número mayor a 0"
            });
        }

        if (stock && (!Number.isInteger(Number(stock)) || stock < 0)) {
            return res.status(400).json({
                message: "El stock debe ser un número entero mayor o igual a 0"
            });
        }

        const updatedData = {
            name,
            description,
            price,
            stock
        };

        if (req.body.items !== undefined) {
            const items = parseJsonField(req.body.items);
            if (items.length === 0) {
                return res.status(400).json({
                    message: "Un combo debe incluir al menos un producto"
                });
            }
            updatedData.items = items;
        }

        if (req.files && req.files.length > 0) {
            const oldPublicIds = comboToUpdate.images && comboToUpdate.images.length > 0
                ? comboToUpdate.images.map(img => img.public_id)
                : [comboToUpdate.public_id].filter(Boolean);

            await Promise.all(
                oldPublicIds.map(pid => cloudinary.uploader.destroy(pid))
            );

            const images = req.files.map(file => ({ url: file.path, public_id: file.filename }));

            updatedData.images = images;
            updatedData.image = images[0].url;
            updatedData.public_id = images[0].public_id;
        }

        const updatedCombo = await comboModel.findByIdAndUpdate(
            id,
            updatedData,
            { new: true }
        );

        return res.status(200).json({
            message: "Combo actualizado exitosamente",
            combo: updatedCombo
        });

    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default comboController;
