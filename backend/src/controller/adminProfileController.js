import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { deleteCloudinaryPhoto } from "../utils/profilePhotoUpload.js";

import { config } from "../../config.js";

import adminModel from "../models/admin.js";

const adminProfileController = {};

// Identifica al admin logueado a partir de la cookie de sesión (authCookie),
// igual que hace loginAdminController.me. Nunca confiamos en un id que venga
// del body/params del cliente para saber "a quién" estamos editando.
const getAdminIdFromCookie = (req) => {
    // Cookie propia del admin ("adminAuthCookie"), separada de la del
    // cliente ("authCookie") para que una sesión de cliente en otra
    // pestaña/app no pise la sesión de admin al compartir el mismo dominio.
    const token = req.cookies.adminAuthCookie;

    if (!token) return null;

    try {
        const decoded = jsonwebtoken.verify(token, config.JWT.secret);
        if (decoded.userType !== "admin") return null;
        return decoded.id;
    } catch (error) {
        return null;
    }
};

// Obtener el perfil completo del admin logueado
adminProfileController.getProfile = async (req, res) => {
    try {
        const adminId = getAdminIdFromCookie(req);

        if (!adminId) {
            return res.status(401).json({ message: "No autenticado" });
        }

        const admin = await adminModel.findById(adminId).select("-password");

        if (!admin) {
            return res.status(404).json({ message: "Administrador no encontrado" });
        }

        return res.status(200).json(admin);

    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Actualizar nombre, teléfono, correo, red social y/o foto de perfil
adminProfileController.updateProfile = async (req, res) => {
    try {
        const adminId = getAdminIdFromCookie(req);

        if (!adminId) {
            return res.status(401).json({ message: "No autenticado" });
        }

        const admin = await adminModel.findById(adminId);

        if (!admin) {
            return res.status(404).json({ message: "Administrador no encontrado" });
        }

        // El administrador ya no tiene teléfono en su perfil (se ignora si llega).
        const { name, email, socialMedia } = req.body;

        if (name !== undefined) {
            const cleanName = name.trim();
            const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/;

            if (!nameRegex.test(cleanName)) {
                return res.status(400).json({
                    message: "El nombre solo puede contener letras y espacios."
                });
            }

            admin.name = cleanName;
        }

        if (email !== undefined) {
            const cleanEmail = email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(cleanEmail)) {
                return res.status(400).json({
                    message: "Correo electrónico inválido."
                });
            }

            if (cleanEmail !== admin.email) {
                const existingAdmin = await adminModel.findOne({ email: cleanEmail });

                if (existingAdmin) {
                    return res.status(400).json({
                        message: "Ese correo ya está en uso por otra cuenta."
                    });
                }
            }

            admin.email = cleanEmail;
        }

        if (socialMedia !== undefined) {
            admin.socialMedia = socialMedia.trim();
        }

        // Si se subió una foto nueva, borramos la anterior en Cloudinary
        if (req.file) {
            await deleteCloudinaryPhoto(admin.public_id);

            admin.photo = req.file.path;
            admin.public_id = req.file.filename;
        }

        await admin.save();

        const { password, ...adminSafe } = admin.toObject();

        return res.status(200).json(adminSafe);

    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Cambiar contraseña (requiere la actual)
adminProfileController.updatePassword = async (req, res) => {
    try {
        const adminId = getAdminIdFromCookie(req);

        if (!adminId) {
            return res.status(401).json({ message: "No autenticado" });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Debes indicar la contraseña actual y la nueva."
            });
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#._-])[A-Za-z\d@$!%*?&#._-]{8,20}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: "La nueva contraseña debe tener entre 8 y 20 caracteres, una mayúscula, una minúscula, un número y un carácter especial."
            });
        }

        const admin = await adminModel.findById(adminId);

        if (!admin) {
            return res.status(404).json({ message: "Administrador no encontrado" });
        }

        const isMatch = await bcryptjs.compare(currentPassword, admin.password);

        if (!isMatch) {
            return res.status(400).json({ message: "La contraseña actual es incorrecta." });
        }

        admin.password = await bcryptjs.hash(newPassword, 10);
        await admin.save();

        return res.status(200).json({ message: "Contraseña actualizada exitosamente" });

    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Activar/desactivar la autenticación en dos pasos
adminProfileController.toggleTwoFA = async (req, res) => {
    try {
        const adminId = getAdminIdFromCookie(req);

        if (!adminId) {
            return res.status(401).json({ message: "No autenticado" });
        }

        const admin = await adminModel.findById(adminId);

        if (!admin) {
            return res.status(404).json({ message: "Administrador no encontrado" });
        }

        admin.twoFA = !admin.twoFA;
        await admin.save();

        return res.status(200).json({ twoFA: admin.twoFA });

    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Listar administradores que verificaron su correo pero todavía no tienen
// acceso (isApproved: false), para que un admin ya aprobado decida si les
// da acceso o no. Cualquier admin logueado puede ver esta lista -- si pudo
// iniciar sesión es porque ya está aprobado (ver loginAdminController).
adminProfileController.getPendingAdmins = async (req, res) => {
    try {
        const adminId = getAdminIdFromCookie(req);

        if (!adminId) {
            return res.status(401).json({ message: "No autenticado" });
        }

        const pendingAdmins = await adminModel
            .find({ isApproved: false })
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json(pendingAdmins);

    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Aprobar a un administrador pendiente: desde este momento ya puede iniciar sesión
adminProfileController.approveAdmin = async (req, res) => {
    try {
        const adminId = getAdminIdFromCookie(req);

        if (!adminId) {
            return res.status(401).json({ message: "No autenticado" });
        }

        const { id } = req.params;

        const pendingAdmin = await adminModel.findById(id);

        if (!pendingAdmin) {
            return res.status(404).json({ message: "Administrador no encontrado" });
        }

        if (pendingAdmin.isApproved) {
            return res.status(400).json({ message: "Este administrador ya tenía acceso aprobado" });
        }

        pendingAdmin.isApproved = true;
        await pendingAdmin.save();

        return res.status(200).json({ message: "Administrador aprobado exitosamente" });

    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Rechazar (eliminar) a un administrador pendiente -- ej. si alguien se
// registró por error o no se reconoce a la persona.
adminProfileController.rejectAdmin = async (req, res) => {
    try {
        const adminId = getAdminIdFromCookie(req);

        if (!adminId) {
            return res.status(401).json({ message: "No autenticado" });
        }

        const { id } = req.params;

        const pendingAdmin = await adminModel.findById(id);

        if (!pendingAdmin) {
            return res.status(404).json({ message: "Administrador no encontrado" });
        }

        if (pendingAdmin.isApproved) {
            return res.status(400).json({ message: "No se puede rechazar a un administrador que ya tiene acceso aprobado" });
        }

        // Evitar que, por error de interfaz, alguien se elimine a sí mismo
        // desde esta pantalla (no debería poder llegar aquí sin estar
        // aprobado, pero por seguridad lo bloqueamos explícitamente).
        if (pendingAdmin._id.toString() === adminId) {
            return res.status(400).json({ message: "No puedes rechazar tu propia cuenta" });
        }

        await adminModel.findByIdAndDelete(id);

        return res.status(200).json({ message: "Administrador rechazado exitosamente" });

    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default adminProfileController;

// Nota: El controlador de perfil de administrador ha sido creado para manejar las operaciones relacionadas con el perfil del administrador.