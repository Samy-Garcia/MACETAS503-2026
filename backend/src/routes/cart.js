import express from "express";
import cartController from "../controller/cartController.js";

const router = express.Router();

// Flujo real del carrito del cliente logueado (por cookie, no por :id)
router.route("/mine").get(cartController.getMyCart);
router.route("/orders").get(cartController.getMyOrders);
router.route("/add").post(cartController.addToCart);
router.route("/add-custom-order").post(cartController.addCustomOrderToCart);
router.route("/checkout").post(cartController.checkout);
router.route("/item/:itemId")
    .put(cartController.updateCartItem)
    .delete(cartController.removeFromCart);

// CRUD genérico (lo usa el panel de admin para ver/editar carritos directamente)
router.route("/")
    .get(cartController.getCart)
    .post(cartController.createCart);

router.route("/:id")
    .put(cartController.updateCart)
    .delete(cartController.deleteCart);

export default router;