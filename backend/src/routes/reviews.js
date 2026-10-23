import express from "express";
import reviewController from "../controller/reviewController.js";
import upload from "../utils/CloudinaryConfig.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/reviewable").get(reviewController.getReviewableItems);
router.route("/mine").get(reviewController.getMyReviews);
router.route("/product/:productType/:productId").get(reviewController.getProductReviews);

router.route("/admin").get(validateAuthCookie(["admin"]), reviewController.getAllForAdmin);
router.route("/admin/:id").delete(validateAuthCookie(["admin"]), reviewController.adminDeleteReview);

router.route("/")
    .post(upload.single("image"), reviewController.createReview);

router.route("/:id")
    .put(upload.single("image"), reviewController.updateReview)
    .delete(reviewController.deleteReview);

export default router;
