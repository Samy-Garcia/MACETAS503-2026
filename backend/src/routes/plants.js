import express from "express";
import plantsController from "../controller/plantsController.js";
import upload from "../utils/CloudinaryConfig.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rutas para las velas
router.route("/")
    .get(plantsController.getAll) // Obtener todas las velas
    .post(validateAuthCookie(["admin"]), upload.single("image"), plantsController.create); // Crear una nueva vela con imagen

router.route("/:id")
    .get(plantsController.getById) // Obtener una planta por ID (para la página de detalle del cliente)
    .delete(validateAuthCookie(["admin"]), plantsController.delete) // Eliminar una vela por ID
    .put(validateAuthCookie(["admin"]), upload.single("image"), plantsController.update); // Actualizar una vela por ID

export default router;
