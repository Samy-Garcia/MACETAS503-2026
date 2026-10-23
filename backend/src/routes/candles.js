import express from "express";
import candlesController from "../controller/candlesController.js";
import upload from "../utils/CloudinaryConfig.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rutas para las velas
router.route("/")
    .get(candlesController.getAll) // Obtener todas las velas
    .post(validateAuthCookie(["admin"]), upload.array("images", 6), candlesController.create); // Crear una nueva vela con hasta 6 imágenes

router.route("/:id")
    .get(candlesController.getById) // Obtener una vela por ID (para la página de detalle del cliente)
    .delete(validateAuthCookie(["admin"]), candlesController.delete) // Eliminar una vela por ID
    .put(validateAuthCookie(["admin"]), upload.array("images", 6), candlesController.update); // Actualizar una vela por ID

export default router;
