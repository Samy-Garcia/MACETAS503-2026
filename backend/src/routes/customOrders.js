import express from "express";
import customOrderController from "../controller/customOrderController.js";
import upload from "../utils/CloudinaryConfig.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/mine").get(customOrderController.getMine);

router.route("/admin")
    .get(validateAuthCookie(["admin"]), customOrderController.getAllAdmin);
router.route("/admin/:id/status")
    .patch(validateAuthCookie(["admin"]), customOrderController.updateStatus);
router.route("/admin/:id/price")
    .patch(validateAuthCookie(["admin"]), customOrderController.setPrice);

router.route("/")
    .post(upload.single("referenceImage"), customOrderController.create);

export default router;
