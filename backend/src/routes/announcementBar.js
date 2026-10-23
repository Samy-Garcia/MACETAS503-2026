import express from "express";
import announcementBarController from "../controller/announcementBarController.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

// Público: lo usa el Navbar de la tienda para mostrar el banner activo
router.route("/active").get(announcementBarController.getActive);

router.route("/")
    .get(validateAuthCookie(["admin"]), announcementBarController.getAll)
    .post(validateAuthCookie(["admin"]), announcementBarController.create);

router.route("/:id")
    .put(validateAuthCookie(["admin"]), announcementBarController.update)
    .delete(validateAuthCookie(["admin"]), announcementBarController.delete);

export default router;
