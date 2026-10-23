import express from "express";
import adminProfileController from "../controller/adminProfileController.js";
import { uploadProfilePhoto } from "../utils/profilePhotoUpload.js";

const router = express.Router();

router.route("/")
    .get(adminProfileController.getProfile)
    .put(uploadProfilePhoto, adminProfileController.updateProfile);

router.route("/password")
    .put(adminProfileController.updatePassword);

router.route("/twofa")
    .patch(adminProfileController.toggleTwoFA);

// Administradores pendientes de aprobación (registrados y con correo
// verificado, pero que todavía no pueden iniciar sesión)
router.route("/pending")
    .get(adminProfileController.getPendingAdmins);

router.route("/pending/:id/approve")
    .patch(adminProfileController.approveAdmin);

router.route("/pending/:id/reject")
    .delete(adminProfileController.rejectAdmin);

export default router;
