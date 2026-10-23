import express from "express";
import wompiController from "../controller/wompiController.js";

const router = express.Router();

router.route("/token").post(wompiController.generarToken);
router.route("/tokenizarTarjeta").post(wompiController.tokenizarTarjeta);
router.route("/paymentTest").post(wompiController.paymentTest);
router.route("/payment3DS").post(wompiController.payment3DS);
router.route("/iniciar3ds").post(wompiController.iniciarPago3DS);
router.route("/confirmar3ds").post(wompiController.confirmarPago3DS);
router.route("/pagarConTarjetaGuardada").post(wompiController.pagarConTarjetaGuardada);

export default router;