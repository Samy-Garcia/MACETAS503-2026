import express from "express";
import loginAdminController from "../controller/loginAdminController.js";

const router = express.Router();

router.route("/").post(loginAdminController.login);
router.route("/me").get(loginAdminController.me);

export default router;
