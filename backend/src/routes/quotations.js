import express from "express";
import quotationController from "../controller/quotationController.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/mine").get(quotationController.getMine);

router.route("/admin")
    .get(validateAuthCookie(["admin"]), quotationController.getAllAdmin);
router.route("/admin/:id/respond")
    .patch(validateAuthCookie(["admin"]), quotationController.respond);

router.route("/")
    .post(quotationController.create);

export default router;
