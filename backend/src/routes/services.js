import express from "express";
import servicesController from "../controller/servicesController.js";
import upload from "../utils/CloudinaryConfig.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rutas para las velas
router.route("/")
    .get(servicesController.getAll) // Obtener todas las velas
    .post(validateAuthCookie(["admin"]), upload.single("image"), servicesController.create); // Crear una nueva vela con imagen

router.route("/:id")
    .delete(validateAuthCookie(["admin"]), servicesController.delete) // Eliminar una vela por ID
    .put(validateAuthCookie(["admin"]), upload.single("image"), servicesController.update); // Actualizar una vela por ID

export default router;