import express from "express";
import ordersController from "../controller/ordersController.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/bestsellers")
    .get(ordersController.getBestSellers); // Top productos más vendidos (público, para la tienda)

router.route("/")
    .get(validateAuthCookie(["admin"]), ordersController.getAll); // Listar todas las órdenes (admin)

router.route("/:id")
    .delete(validateAuthCookie(["admin"]), ordersController.delete); // Eliminar una orden

router.route("/:id/status")
    .patch(validateAuthCookie(["admin"]), ordersController.updateStatus); // Cambiar solo el estatus de una orden

router.route("/:id/force-pickup")
    .patch(validateAuthCookie(["admin"]), ordersController.forcePickup); // Pasar una orden de envío a recogida en tienda

export default router;
