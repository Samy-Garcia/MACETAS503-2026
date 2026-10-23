import plantsModel from "../models/plants.js";

import { v2 as cloudinary } from "cloudinary";


// ARRAY de funciones
const plantsController = {};


//GET ALL
plantsController.getAll = async (req, res) => {
    try {

        const plants = await plantsModel.find();

        res.status(200).json(plants);

    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }
};


//GET ONE (por id, lo usa la página de detalle de la planta)
plantsController.getById = async (req, res) => {
    try {

        const { id } = req.params;

        const plant = await plantsModel.findById(id);

        if (!plant) {
            return res.status(404).json({ message: 'Planta no encontrada' });
        }

        res.status(200).json(plant);

    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }
};



//POST
plantsController.create = async (req, res) => {

    try {

        const {
            name,
            careLight,
            careWater,
            careSoil,
            careTemperature,
            size,
            price,
            stock
        } = req.body;



        //================ VALIDACIONES =================


        //Campos obligatorios
        if (!name || !careLight || !careWater || !careSoil || !careTemperature || !size || !price || !stock) {

            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });

        }



        //Imagen obligatoria
        if (!req.file) {

            return res.status(400).json({
                message: "La imagen es obligatoria"
            });

        }



        //Nombre 3-50 caracteres
        if (name.trim().length < 3 || name.trim().length > 50) {

            return res.status(400).json({
                message: "El nombre debe tener entre 3 y 50 caracteres"
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



        //===============================================



        const newPlants = new plantsModel({

            name,

            careLight,

            careWater,

            careSoil,

            careTemperature,

            size,

            price,

            stock,

            image: req.file.path,

            public_id: req.file.filename

        });



        await newPlants.save();



        res.status(201).json({

            message: "Planta creada exitosamente",

            plants: newPlants

        });



    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }

};




//DELETE
plantsController.delete = async (req, res) => {

    try {

        const { id } = req.params;


        const plantsToDelete = await plantsModel.findById(id);



        if (!plantsToDelete) {

            return res.status(404).json({
                message: "Planta no encontrada"
            });

        }



        //Eliminar imagen de Cloudinary
        await cloudinary.uploader.destroy(
            plantsToDelete.public_id
        );



        //Eliminar documento
        await plantsModel.findByIdAndDelete(id);



        res.status(200).json({

            message: "Planta eliminada exitosamente"

        });



    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }

};




//PUT
plantsController.update = async (req, res) => {

    try {

        const { id } = req.params;


        const {
            name,
            careLight,
            careWater,
            careSoil,
            careTemperature,
            size,
            price,
            stock
        } = req.body;



        const plantsToUpdate = await plantsModel.findById(id);



        if (!plantsToUpdate) {

            return res.status(404).json({
                message: "Planta no encontrada"
            });

        }



        //Validaciones si se actualizan campos


        if (name && (name.trim().length < 3 || name.trim().length > 50)) {

            return res.status(400).json({
                message: "El nombre debe tener entre 3 y 50 caracteres"
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

            careLight,

            careWater,

            careSoil,

            careTemperature,

            size,

            price,

            stock

        };





        //Si viene una imagen nueva
        if (req.file) {


            //Eliminar imagen anterior
            await cloudinary.uploader.destroy(
                plantsToUpdate.public_id
            );



            //Guardar nueva imagen
            updatedData.image = req.file.path;

            updatedData.public_id = req.file.filename;

        }



        const updatedPlants = await plantsModel.findByIdAndUpdate(

            id,

            updatedData,

            {
                new: true
            }

        );



        return res.status(200).json({

            message: "Planta actualizada exitosamente",

            plants: updatedPlants

        });


    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }

};



export default plantsController;