import express from "express";
import newsletterController from "../controller/newsletterController.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .post(newsletterController.subscribe);

router.route("/admin")
    .get(validateAuthCookie(["admin"]), newsletterController.getAllAdmin);

router.route("/admin/send")
    .post(validateAuthCookie(["admin"]), newsletterController.sendBlast);

router.route("/admin/:id")
    .delete(validateAuthCookie(["admin"]), newsletterController.adminDelete);

export default router;
