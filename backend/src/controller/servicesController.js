import servicesModel from "../models/services.js";


// ARRAY de funciones
const servicesController = {};


//GET
servicesController.getAll = async (req, res) => {
    try {

        const services = await servicesModel.find();

        res.status(200).json(services);

    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }
};



//POST
servicesController.create = async (req, res) => {

    try {

        const {
            name,
            description,
            price
        } = req.body;



        //============== VALIDACIONES ==============


        //Campos obligatorios
        if (!name || !description || !price) {

            return res.status(400).json({
                message: "Todos los campos son obligatorios"
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
                message: "El precio debe ser mayor a 0"
            });

        }



        //==========================================



        const newServices = new servicesModel({

            name,

            description,

            price

        });



        await newServices.save();



        res.status(201).json({

            message: "Servicio creado exitosamente",

            service: newServices

        });



    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }

};




//DELETE
servicesController.delete = async (req, res) => {

    try {

        const { id } = req.params;


        const servicesToDelete = await servicesModel.findById(id);



        if (!servicesToDelete) {

            return res.status(404).json({
                message: "Servicio no encontrado"
            });

        }



        await servicesModel.findByIdAndDelete(id);



        res.status(200).json({

            message: "Servicio eliminado exitosamente"

        });



    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }

};




//PUT
servicesController.update = async (req, res) => {

    try {

        const { id } = req.params;


        const {
            name,
            description,
            price
        } = req.body;



        const servicesToUpdate = await servicesModel.findById(id);



        if (!servicesToUpdate) {

            return res.status(404).json({
                message: "Servicio no encontrado"
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
                message: "El precio debe ser mayor a 0"
            });

        }




        const updatedData = {

            name,

            description,

            price

        };



        const updatedService = await servicesModel.findByIdAndUpdate(

            id,

            updatedData,

            {
                new:true
            }

        );



        return res.status(200).json({

            message: "Servicio actualizado exitosamente",

            service: updatedService

        });



    } catch (error) {

        console.log("error" + error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }

};



export default servicesController;