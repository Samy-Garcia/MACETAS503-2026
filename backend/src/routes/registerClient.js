import express from "express";
import registerClientController from "../controller/registerClientController.js";
import upload from "../utils/CloudinaryConfig.js";

const router = express.Router();

router.route("/").post(upload.single("image"), registerClientController.register);
router.route("/verifyCodeEmail").post(registerClientController.verifyCode);

export default router;