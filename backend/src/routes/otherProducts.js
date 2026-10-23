import express from "express";
import otherProductController from "../controller/otherProductController.js";
import upload from "../utils/CloudinaryConfig.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(otherProductController.getAll)
    .post(validateAuthCookie(["admin"]), upload.array("images", 6), otherProductController.create);

router.route("/:id")
    .get(otherProductController.getById)
    .delete(validateAuthCookie(["admin"]), otherProductController.delete)
    .put(validateAuthCookie(["admin"]), upload.array("images", 6), otherProductController.update);

export default router;
