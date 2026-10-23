import express from "express";
import configController from "../controller/configController.js";
import { validateAuthCookie } from "../middleware/authMiddleware.js"; // ajusta la ruta si es distinta
import upload from "../utils/CloudinaryConfig.js";

const router = express.Router();

router.route("/")
    .get(configController.getConfig) // público: el checkout necesita leer storeLat/storeLng/pricePerKm
    .post(validateAuthCookie(["admin"]), configController.createConfig);

router.route("/:id")
    .put(validateAuthCookie(["admin"]), configController.updateConfig)
    .delete(validateAuthCookie(["admin"]), configController.deleteConfig);

// Carrusel de imágenes del inicio
router.route("/:id/hero-images")
    .post(validateAuthCookie(["admin"]), upload.array("images", 6), configController.addHeroImages);

router.route("/:id/hero-images/remove")
    .post(validateAuthCookie(["admin"]), configController.removeHeroImage);

router.route("/:id/hero-images/reorder")
    .put(validateAuthCookie(["admin"]), configController.reorderHeroImages);

router.route("/:id/hero-images/text")
    .put(validateAuthCookie(["admin"]), configController.updateHeroImage);

// Puntos de recogida en tienda (para cuando la emprendedora no puede
// llevar el pedido a domicilio y el cliente pasa a recogerlo él mismo)
router.route("/:id/pickup-locations")
    .post(validateAuthCookie(["admin"]), configController.addPickupLocation);

router.route("/:id/pickup-locations/:locationId")
    .put(validateAuthCookie(["admin"]), configController.updatePickupLocation)
    .delete(validateAuthCookie(["admin"]), configController.removePickupLocation);

// Tema visual del sitio: color y modo oscuro van por PUT /:id (ver arriba,
// dentro del campo "theme"). El logo tiene su propio endpoint porque
// necesita subir un archivo a Cloudinary.
router.route("/:id/theme/logo")
    .post(validateAuthCookie(["admin"]), upload.single("logo"), configController.updateThemeLogo)
    .delete(validateAuthCookie(["admin"]), configController.removeThemeLogo);

export default router;