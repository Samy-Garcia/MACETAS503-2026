import express from "express";
import loginClientController from "../controller/loginClientController.js";
import { uploadProfilePhoto } from "../utils/profilePhotoUpload.js";

const router = express.Router();

// Login tradicional
router.post("/", loginClientController.login);

// Login con Google
router.post("/google", loginClientController.loginGoogle);

// Mi perfil
router.route("/me")
    .get(loginClientController.me)
    .put(uploadProfilePhoto, loginClientController.updateMe);

// Libreta de direcciones
router.route("/me/addresses")
    .post(loginClientController.addAddress);

router.route("/me/addresses/:addressId")
    .put(loginClientController.updateAddress)
    .delete(loginClientController.deleteAddress);

// Método de pago guardado (una sola tarjeta a la vez)
router.route("/me/payment-method")
    .post(loginClientController.savePaymentMethod)
    .delete(loginClientController.deletePaymentMethod);

export default router;
