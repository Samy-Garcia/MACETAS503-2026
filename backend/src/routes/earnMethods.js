import express from "express";
import earnMethodsController from "../controller/earnMethodsController.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/active").get(earnMethodsController.getActive);

router.route("/")
    .get(earnMethodsController.getAll)
    .post(validateAuthCookie(["admin"]), earnMethodsController.create);

router.route("/:id")
    .put(validateAuthCookie(["admin"]), earnMethodsController.update)
    .delete(validateAuthCookie(["admin"]), earnMethodsController.delete);

export default router;
