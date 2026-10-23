import express from "express";
import catalogController from "../controller/catalogController.js";

const router = express.Router();

router.route("/newest")
    .get(catalogController.getNewest);

router.route("/search")
    .get(catalogController.search);

export default router;
