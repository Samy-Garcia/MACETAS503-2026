import express from "express";
import logoutController from "../controller/logoutController.js";

const route = express.Router();

route.route("/").post(logoutController.logout);

export default route;