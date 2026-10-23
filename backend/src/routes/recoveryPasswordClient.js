import express from "express";
import recoveryPasswordClientController from "../controller/recoveryPasswordClientController.js";

const router = express.Router();

router.route("/").post(recoveryPasswordClientController.requestCode);
router.route("/verifyCode").post(recoveryPasswordClientController.verifyCode);
router.route("/newPassword").post(recoveryPasswordClientController.newPassword);

export default router;