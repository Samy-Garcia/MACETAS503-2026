import otherProductModel from "../models/otherProduct.js";
import reviewModel from "../models/review.js";

import { v2 as cloudinary } from "cloudinary";

const otherProductController = {};

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
otherProductController.getAll = async (req, res) => {
    try {

        const others = await otherProductModel.find();

        const ratingAgg = await reviewModel.aggregate([
            { $match: { productType: "otro" } },
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

        const othersConRating = others.map(item => {
            const ratingInfo = ratingMap.get(item._id.toString());
            const obj = item.toObject();
            obj.rating = ratingInfo ? ratingInfo.rating : null;
            obj.reviewCount = ratingInfo ? ratingInfo.reviewCount : 0;
            return obj;
        });

        res.status(200).json(othersConRating);

    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// GET ONE (por id, lo usa la página de detalle del cliente)
otherProductController.getById = async (req, res) => {
    try {

        const { id } = req.params;
        const item = await otherProductModel.findById(id);

        if (!item) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.status(200).json(item);

    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// POST
otherProductController.create = async (req, res) => {
    try {

        const { name, description, price, stock, color } = req.body;

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

        if (color) {
            const colorRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
            if (!colorRegex.test(color)) {
                return res.status(400).json({
                    message: "El color solo debe contener letras"
                });
            }
        }

        const images = req.files.map(file => ({ url: file.path, public_id: file.filename }));

        const newItem = new otherProductModel({
            name,
            description,
            price,
            stock,
            color,

            sizes: parseJsonField(req.body.sizes),
            colorOptions: parseJsonField(req.body.colorOptions),

            images,
            image: images[0].url,
            public_id: images[0].public_id,

            isActive: true
        });

        await newItem.save();

        res.status(201).json({
            message: "Producto creado exitosamente",
            item: newItem
        });

    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// DELETE
otherProductController.delete = async (req, res) => {
    try {

        const { id } = req.params;
        const itemToDelete = await otherProductModel.findById(id);

        if (!itemToDelete) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        await cloudinary.uploader.destroy(itemToDelete.public_id);

        await otherProductModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Producto eliminado exitosamente" });

    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// PUT
otherProductController.update = async (req, res) => {
    try {

        const { id } = req.params;
        const { name, description, price, stock, color } = req.body;

        const itemToUpdate = await otherProductModel.findById(id);

        if (!itemToUpdate) {
            return res.status(404).json({ message: "Producto no encontrado" });
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

        if (color) {
            const colorRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
            if (!colorRegex.test(color)) {
                return res.status(400).json({
                    message: "El color solo debe contener letras"
                });
            }
        }

        const updatedData = {
            name,
            description,
            price,
            stock,
            color,
            sizes: parseJsonField(req.body.sizes),
            colorOptions: parseJsonField(req.body.colorOptions)
        };

        if (req.files && req.files.length > 0) {
            const oldPublicIds = itemToUpdate.images && itemToUpdate.images.length > 0
                ? itemToUpdate.images.map(img => img.public_id)
                : [itemToUpdate.public_id].filter(Boolean);

            await Promise.all(
                oldPublicIds.map(pid => cloudinary.uploader.destroy(pid))
            );

            const images = req.files.map(file => ({ url: file.path, public_id: file.filename }));

            updatedData.images = images;
            updatedData.image = images[0].url;
            updatedData.public_id = images[0].public_id;
        }

        const updatedItem = await otherProductModel.findByIdAndUpdate(
            id,
            updatedData,
            { new: true }
        );

        return res.status(200).json({
            message: "Producto actualizado exitosamente",
            item: updatedItem
        });

    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default otherProductController;
