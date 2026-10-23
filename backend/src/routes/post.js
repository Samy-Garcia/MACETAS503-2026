import express from "express";
import postController from "../controller/postController.js";
import upload from "../utils/CloudinaryConfig.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rutas para las velas
router.route("/")
    .get(postController.getAll) // Obtener todas las macetas
    .post(validateAuthCookie(["admin"]), upload.array("images", 6), postController.create); // Crear una nueva maceta con hasta 6 imágenes

router.route("/:id")
    .get(postController.getById) // Obtener una maceta por ID (para la página de detalle del cliente)
    .delete(validateAuthCookie(["admin"]), postController.delete) // Eliminar una maceta por ID
    .put(validateAuthCookie(["admin"]), upload.array("images", 6), postController.update); // Actualizar una maceta por ID

export default router;