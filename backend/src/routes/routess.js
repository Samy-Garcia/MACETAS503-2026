import { Router } from "express";
import { obtenerRuta } from "../controller/routeController.js";

const router = Router();

router.get("/", obtenerRuta);

export default router;
