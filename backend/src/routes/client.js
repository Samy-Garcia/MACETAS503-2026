import express from "express";
import clientController from "../controller/clientController.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(validateAuthCookie(["admin"]), clientController.getAllClients);

router.route("/:id")
    .put(validateAuthCookie(["admin"]), clientController.updateClient)
    .delete(validateAuthCookie(["admin"]), clientController.deleteClient);

export default router;