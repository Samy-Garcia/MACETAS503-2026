import express from "express";
import recoveryPasswordAdminController from "../controller/recoveyPasswordAdmin.js";

const router = express.Router();

router.route("/").post(recoveryPasswordAdminController.requestCode);
router.route("/verifyCode").post(recoveryPasswordAdminController.verifyCode);
router.route("/newPassword").post(recoveryPasswordAdminController.newPassword);

export default router;