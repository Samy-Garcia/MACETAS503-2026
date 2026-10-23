import express from "express";
import testimonialController from "../controller/testimonialController.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(testimonialController.getAll)
    .post(testimonialController.upsert);

router.route("/mine")
    .get(testimonialController.getMine);

router.route("/admin")
    .get(validateAuthCookie(["admin"]), testimonialController.getAllAdmin);

router.route("/:id")
    .delete(validateAuthCookie(["admin"]), testimonialController.adminDelete);

export default router;
