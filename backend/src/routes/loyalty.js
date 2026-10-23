import express from "express";
import loyaltyController from "../controller/loyaltyController.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/mine").get(loyaltyController.getMyLoyalty);
router.route("/claim-birthday").post(loyaltyController.claimBirthday);
router.route("/rewards").get(loyaltyController.getRewardsCatalog);
router.route("/redeem").post(loyaltyController.redeemReward);
router.route("/redemptions").get(loyaltyController.getMyRedemptions);

router.route("/admin/redemptions")
    .get(validateAuthCookie(["admin"]), loyaltyController.getProductRedemptionsAdmin);
router.route("/admin/redemptions/:id/delivered")
    .patch(validateAuthCookie(["admin"]), loyaltyController.markRedemptionDelivered);

export default router;
