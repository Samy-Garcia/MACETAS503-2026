import express from "express";
import rewardsController from "../controller/rewardsController.js";
import upload from "../utils/CloudinaryConfig.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(rewardsController.getAll)
    .post(validateAuthCookie(["admin"]), upload.single("image"), rewardsController.create);

router.route("/:id")
    .put(validateAuthCookie(["admin"]), upload.single("image"), rewardsController.update)
    .delete(validateAuthCookie(["admin"]), rewardsController.delete);

export default router;
