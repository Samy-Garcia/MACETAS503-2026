import clientModel from "../models/client.js";
import {v2 as cloudinary} from "cloudinary";

//Array de funciones

const clientController = {};

//SELECT
clientController.getAllClients = async (req, res) => {
    try {
        const clients = await clientModel.find();

        res.status(200).json(clients);

    } catch (error) {
        console.log("error"+ error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

//UPDATE
clientController.updateClient = async (req, res) => {
    try {
       //solicito los datos
        const {name, phone, lastName, email, password, address} = req.body;

        //identifico a quien estoy actualixando
        const clientFound = await clientModel.findById(req.params.id);

        const updatedData = {
            name,
            phone,
            lastName,
            email,
            password,
            address
        }

        //si viene alguna imagen
        if(req.file){
            //eliminar la imagen anterior
            await cloudinary.uploader.destroy(clientFound.public_id)
            
            //guardar la nueva imagen
            updatedData.image = req.file.path;
            updatedData.public_id = req.file.filename;
        }

        //actualizo en la base de datos
        await clientModel.findByIdAndUpdate(req.params.id,
            updatedData,
            {new: true});

        return res.status(200).json({message: "Cliente actualizado exitosamente"})

    } catch (error) {
        console.log("error"+ error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

//DELETE
clientController.deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedClient = await clientModel.findByIdAndDelete(id);
        if (!deletedClient) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

         // Eliminar la imagen de Cloudinary
        await cloudinary.uploader.destroy(clientFound.public_id);

        res.status(200).json({ message: "Cliente eliminado exitosamente" });
        
    } catch (error) {
        console.log("error"+ error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default clientController;