import express from "express";
import offersController from "../controller/offersController.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rutas para las ofertas (ya no llevan imagen propia: la oferta apunta a un producto real)
router.route("/")
    .get(offersController.getAll) // Obtener todas las ofertas (con los datos del producto ya incluidos)
    .post(validateAuthCookie(["admin"]), offersController.create); // Crear una nueva oferta ligada a un producto existente

router.route("/:id")
    .delete(validateAuthCookie(["admin"]), offersController.delete) // Eliminar una oferta por ID
    .put(validateAuthCookie(["admin"]), offersController.update); // Actualizar una oferta por ID

export default router;
