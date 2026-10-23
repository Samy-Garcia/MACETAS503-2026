import postModel from "../models/post.js";
import plantsModel from "../models/plants.js";
import candleModel from "../models/candles.js";
import reviewModel from "../models/review.js";

import { v2 as cloudinary } from "cloudinary";


// ARRAY de funciones
const postController = {};


// Los campos de variantes (sizes, plantOptions, colorOptions) viajan como
// JSON.stringify(...) dentro del FormData (multipart no soporta arrays/objetos
// directamente), así que los parseamos con seguridad; si vienen vacíos o mal
// formados, seguimos con un array vacío en vez de tronar la petición.
const parseJsonField = (value, fallback = []) => {
    if (!value) return fallback;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch (err) {
        return fallback;
    }
};


// Valida que los ids de plantas recibidos existan de verdad en el catálogo.
// Si alguno no existe, lo descartamos silenciosamente en vez de tronar toda
// la petición (por si el admin seleccionó una planta que alguien más borró
// justo en ese momento).
const filterValidPlantIds = async (ids) => {
    if (!ids || ids.length === 0) return [];
    const found = await plantsModel.find({ _id: { $in: ids } }).select("_id");
    const validIds = new Set(found.map(p => p._id.toString()));
    return ids.filter(id => validIds.has(id));
};

// Mismo patrón que filterValidPlantIds, para las velas que se puedan
// vincular como opción de esta maceta.
const filterValidCandleIds = async (ids) => {
    if (!ids || ids.length === 0) return [];
    const found = await candleModel.find({ _id: { $in: ids } }).select("_id");
    const validIds = new Set(found.map(c => c._id.toString()));
    return ids.filter(id => validIds.has(id));
};


//GET ALL
postController.getAll = async (req, res) => {
    try {

        const posts = await postModel.find().populate("plantOptions", "name price image stock").populate("candleOptions", "name price image stock");

        // Calificación promedio real (de Review) por maceta, para mostrarla
        // junto al precio en el catálogo -- mismo patrón que ya se usa en
        // "Más vendidos" (ordersController.getBestSellers), agrupado en una
        // sola consulta en vez de una por producto.
        const ratingAgg = await reviewModel.aggregate([
            { $match: { productType: "maceta" } },
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

        const postsConRating = posts.map(post => {
            const ratingInfo = ratingMap.get(post._id.toString());
            const obj = post.toObject();
            obj.rating = ratingInfo ? ratingInfo.rating : null;
            obj.reviewCount = ratingInfo ? ratingInfo.reviewCount : 0;
            return obj;
        });

        res.status(200).json(postsConRating);

    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }
};


//GET ONE (por id, lo usa la página de detalle del cliente)
postController.getById = async (req, res) => {
    try {

        const { id } = req.params;

        const post = await postModel.findById(id).populate("plantOptions", "name price image stock").populate("candleOptions", "name price image stock");

        if (!post) {
            return res.status(404).json({ message: "Maceta no encontrada" });
        }

        res.status(200).json(post);

    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }
};



//POST
postController.create = async (req, res) => {

    try {

        const {
            name,
            description,
            dimensions,
            weight,
            drainageType,
            price,
            stock,
            color
        } = req.body;



        //================ VALIDACIONES =================


        //Campos obligatorios
        if (!name || !description || !dimensions || !weight || !drainageType || !price || !stock || !color) {

            return res.status(400).json({
                message: "Todos los campos son obligatorios"
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
        if (!Number.isInteger(Number(stock)) || stock < 0) {

            return res.status(400).json({
                message: "El stock debe ser un número entero mayor o igual a 0"
            });

        }



        //Color solo letras
        const colorRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;


        if (!colorRegex.test(color)) {

            return res.status(400).json({
                message: "El color solo debe contener letras"
            });

        }



        //===============================================



        const sizes = parseJsonField(req.body.sizes);
        const plantOptions = await filterValidPlantIds(parseJsonField(req.body.plantOptions));
        const candleOptions = await filterValidCandleIds(parseJsonField(req.body.candleOptions));
        const colorOptions = parseJsonField(req.body.colorOptions);
        const isCustomizable = req.body.isCustomizable === 'true';

        // La primera imagen subida es la "portada": queda también en
        // image/public_id para que todo lo que ya usa ese campo (carrito,
        // dashboard, reportes, más vendidos, etc.) siga funcionando igual.
        const images = req.files.map(file => ({ url: file.path, public_id: file.filename }));



        const newPost = new postModel({

            name,

            description,

            dimensions,

            weight,

            drainageType,

            price,

            stock,

            color,

            sizes,

            plantOptions,

            candleOptions,

            colorOptions,

            isCustomizable,

            images,

            image: images[0].url,

            public_id: images[0].public_id,

            isActive: true

        });



        await newPost.save();



        res.status(201).json({

            message: "Maceta creada exitosamente",

            post: newPost

        });



    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }

};




//DELETE
postController.delete = async (req, res) => {

    try {

        const { id } = req.params;


        const postToDelete = await postModel.findById(id);



        if (!postToDelete) {

            return res.status(404).json({
                message: "Maceta no encontrada"
            });

        }



        //Eliminar imagen de Cloudinary
        await cloudinary.uploader.destroy(
            postToDelete.public_id
        );



        //Eliminar documento
        await postModel.findByIdAndDelete(id);



        res.status(200).json({

            message: "Maceta eliminada exitosamente"

        });



    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }

};




//PUT
postController.update = async (req, res) => {

    try {

        const { id } = req.params;


        const {
            name,
            description,
            dimensions,
            weight,
            drainageType,
            price,
            stock,
            color
        } = req.body;



        const postToUpdate = await postModel.findById(id);



        if (!postToUpdate) {

            return res.status(404).json({
                message: "Maceta no encontrada"
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

            dimensions,

            weight,

            drainageType,

            price,

            stock,

            color,

            sizes: parseJsonField(req.body.sizes),

            plantOptions: await filterValidPlantIds(parseJsonField(req.body.plantOptions)),

            candleOptions: await filterValidCandleIds(parseJsonField(req.body.candleOptions)),

            colorOptions: parseJsonField(req.body.colorOptions),

            isCustomizable: req.body.isCustomizable === 'true'

        };





        //Si vienen imágenes nuevas, reemplazamos toda la galería anterior
        if (req.files && req.files.length > 0) {

            // Borramos todas las imágenes anteriores de Cloudinary (si el
            // producto es de antes de este cambio y no tenía "images",
            // borramos al menos la única que tenía en public_id)
            const oldPublicIds = postToUpdate.images && postToUpdate.images.length > 0
                ? postToUpdate.images.map(img => img.public_id)
                : [postToUpdate.public_id].filter(Boolean);

            await Promise.all(
                oldPublicIds.map(id => cloudinary.uploader.destroy(id))
            );

            const images = req.files.map(file => ({ url: file.path, public_id: file.filename }));

            updatedData.images = images;
            updatedData.image = images[0].url;
            updatedData.public_id = images[0].public_id;

        }




        const updatedPost = await postModel.findByIdAndUpdate(

            id,

            updatedData,

            {
                new: true
            }

        );



        return res.status(200).json({

            message: "Maceta actualizada exitosamente",

            post: updatedPost

        });



    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }

};



export default postController;