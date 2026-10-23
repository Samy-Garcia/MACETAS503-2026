import express from "express";
import comboController from "../controller/comboController.js";
import upload from "../utils/CloudinaryConfig.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(comboController.getAll)
    .post(validateAuthCookie(["admin"]), upload.array("images", 6), comboController.create);

router.route("/:id")
    .get(comboController.getById)
    .delete(validateAuthCookie(["admin"]), comboController.delete)
    .put(validateAuthCookie(["admin"]), upload.array("images", 6), comboController.update);

export default router;
