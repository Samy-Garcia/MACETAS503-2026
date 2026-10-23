import candleModel from "../models/candles.js";
import reviewModel from "../models/review.js";

import { v2 as cloudinary } from "cloudinary";


// ARRAY de funciones
const candlesController = {};


// Los campos de variantes (sizes, scents, colorOptions) viajan como
// JSON.stringify(...) dentro del FormData; los parseamos con seguridad.
const parseJsonField = (value, fallback = []) => {
    if (!value) return fallback;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch (err) {
        return fallback;
    }
};


//GET
candlesController.getAll = async (req, res) => {
    try {

        const candles = await candleModel.find();

        // Calificación promedio real (de Review) por vela, mismo patrón que
        // en postController.getAll y en "Más vendidos".
        const ratingAgg = await reviewModel.aggregate([
            { $match: { productType: "vela" } },
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

        const candlesConRating = candles.map(candle => {
            const ratingInfo = ratingMap.get(candle._id.toString());
            const obj = candle.toObject();
            obj.rating = ratingInfo ? ratingInfo.rating : null;
            obj.reviewCount = ratingInfo ? ratingInfo.reviewCount : 0;
            return obj;
        });

        res.status(200).json(candlesConRating);

    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }
};


//GET ONE (por id, lo usa la página de detalle del cliente)
candlesController.getById = async (req, res) => {
    try {

        const { id } = req.params;

        const candle = await candleModel.findById(id);

        if (!candle) {
            return res.status(404).json({ message: "Vela no encontrada" });
        }

        res.status(200).json(candle);

    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }
};



//POST
candlesController.create = async (req, res) => {

    try {

        const {
            name,
            description,
            scent,
            size,
            price,
            stock,
            color
        } = req.body;



        //================ VALIDACIONES =================


        //Campos obligatorios (color ya no es obligatorio: es opcional si usas el selector de variantes)
        if (!name || !description || price === undefined || price === null || price === '' || stock === undefined || stock === null || stock === '') {

            return res.status(400).json({
                message: "Nombre, descripción, precio y stock son obligatorios"
            });

        }


        //Al menos una imagen es obligatoria
        if (!req.files || req.files.length === 0) {

            return res.status(400).json({
                message: "Debes subir al menos una imagen"
            });

        }


        //Nombre 3-50 caracteres
        if (name.trim().length < 3 || name.trim().length > 50) {

            return res.status(400).json({
                message: "El nombre debe tener entre 3 y 50 caracteres"
            });

        }


        //Descripción 10-300 caracteres
        if (description.length < 10 || description.length > 300) {

            return res.status(400).json({
                message: "La descripción debe tener entre 10 y 300 caracteres"
            });

        }


        //Precio mayor a 0
        if (isNaN(price) || price <= 0) {

            return res.status(400).json({
                message: "El precio debe ser un número mayor a 0"
            });

        }


        //Stock entero mayor o igual a 0
        if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {

            return res.status(400).json({
                message: "El stock debe ser un número entero mayor o igual a 0"
            });

        }


        //Color: opcional. Si se proporciona, solo letras
        if (color) {

            const colorRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

            if (!colorRegex.test(color)) {

                return res.status(400).json({
                    message: "El color solo debe contener letras"
                });

            }

        }


        //===============================================



        // La primera imagen subida es la "portada": queda también en
        // image/public_id para que todo lo que ya usa ese campo (carrito,
        // dashboard, reportes, más vendidos, etc.) siga funcionando igual.
        const images = req.files.map(file => ({ url: file.path, public_id: file.filename }));

        const newCandle = new candleModel({

            name,
            description,
            scent,
            size,
            price,
            stock,
            color,

            sizes: parseJsonField(req.body.sizes),
            scents: parseJsonField(req.body.scents),
            colorOptions: parseJsonField(req.body.colorOptions),

            images,

            image: images[0].url,

            public_id: images[0].public_id,

            isActive: true

        });



        await newCandle.save();



        res.status(201).json({

            message: "Vela creada exitosamente",

            candle: newCandle

        });



    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }

};



//DELETE
candlesController.delete = async (req, res) => {

    try {

        const { id } = req.params;


        const candleToDelete = await candleModel.findById(id);


        if (!candleToDelete) {

            return res.status(404).json({
                message: "Vela no encontrada"
            });

        }


        //Eliminar imagen de Cloudinary
        await cloudinary.uploader.destroy(
            candleToDelete.public_id
        );


        //Eliminar documento
        await candleModel.findByIdAndDelete(id);



        res.status(200).json({

            message: "Vela eliminada exitosamente"

        });



    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }

};




//PUT
candlesController.update = async (req, res) => {

    try {

        const { id } = req.params;


        const {
            name,
            description,
            scent,
            size,
            price,
            stock,
            color
        } = req.body;



        const candleToUpdate = await candleModel.findById(id);



        if (!candleToUpdate) {

            return res.status(404).json({
                message: "Vela no encontrada"
            });

        }



        //Validaciones si se actualizan campos

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

            scent,

            size,

            price,

            stock,

            color,

            sizes: parseJsonField(req.body.sizes),

            scents: parseJsonField(req.body.scents),

            colorOptions: parseJsonField(req.body.colorOptions)

        };




        //Si vienen imágenes nuevas, reemplazamos toda la galería anterior
        if (req.files && req.files.length > 0) {

            // Borramos todas las imágenes anteriores de Cloudinary (si la
            // vela es de antes de este cambio y no tenía "images", borramos
            // al menos la única que tenía en public_id)
            const oldPublicIds = candleToUpdate.images && candleToUpdate.images.length > 0
                ? candleToUpdate.images.map(img => img.public_id)
                : [candleToUpdate.public_id].filter(Boolean);

            await Promise.all(
                oldPublicIds.map(id => cloudinary.uploader.destroy(id))
            );

            const images = req.files.map(file => ({ url: file.path, public_id: file.filename }));

            updatedData.images = images;
            updatedData.image = images[0].url;
            updatedData.public_id = images[0].public_id;

        }




        const updatedCandle = await candleModel.findByIdAndUpdate(

            id,

            updatedData,

            {
                new: true
            }

        );



        return res.status(200).json({

            message: "Vela actualizada exitosamente",

            candle: updatedCandle

        });



    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }

};



export default candlesController;

//nota: este archivo contiene el controlador de las velas, que es el que se encarga de manejar las solicitudes HTTP relacionadas con las velas, como crear, actualizar, eliminar y obtener velas. Este controlador se conecta con el modelo de velas (candleModel) para realizar operaciones en la base de datos y con Cloudinary para manejar las imágenes de las velas.