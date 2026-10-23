import crypto from "crypto"; //genera tokens aleatorios
import jsonwebtoken from "jsonwebtoken"; //genera tokens JWT para autenticación
import bcryptjs from "bcryptjs"; //hashea contraseñas

import HTMLRegisterEmail from "../utils/sendMaildRegisterAdmin.js";
import { sendEmail } from "../utils/mailer.js"; //envía correos vía API HTTP de Brevo (Render bloquea SMTP en el plan gratis)
import { cookieOptions, clearCookieOptions } from "../utils/cookieOptions.js";

import config from "../../config.js";

import adminModel from "../models/admin.js";

const registerAdminController = {};

registerAdminController.register = async (req, res) => {
    try {
        //Solicitar datos
        const { name, email, password } = req.body;

        //==================== VALIDACIONES ====================

        //Campos obligatorios
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios."
            });
        }

        //Eliminar espacios
        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        //Nombre
        const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/;

        if (!nameRegex.test(cleanName)) {
            return res.status(400).json({
                message: "El nombre solo puede contener letras y espacios."
            });
        }

        //Correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                message: "Correo electrónico inválido."
            });
        }

        //Contraseña
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#._-])[A-Za-z\d@$!%*?&#._-]{8,20}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message:
                    "La contraseña debe tener entre 8 y 20 caracteres, una mayúscula, una minúscula, un número y un carácter especial."
            });
        }

        //======================================================

        //Validar si ya existe
        const existingAdmin = await adminModel.findOne({
            email: cleanEmail
        });

        if (existingAdmin) {
            return res.status(400).json({
                message: "El administrador ya existe"
            });
        }

        //Encriptar contraseña
        const passwordHashed = await bcryptjs.hash(password, 10);

        //Generar un código aleatorio
        const randomCode = crypto.randomBytes(3).toString("hex").toUpperCase();

        //Guardar todo en un token
        const token = jsonwebtoken.sign(
            {
                randomCode,
                name: cleanName,
                email: cleanEmail,
                password: passwordHashed
            },
            config.JWT.secret,
            {
                expiresIn: "15m"
            }
        );

        res.cookie("registrationCookie", token, cookieOptions(15 * 60 * 1000));

        //Enviar el correo con el código de verificación (vía Brevo, no SMTP)
        try {
            await sendEmail({
                to: cleanEmail,
                subject: "Código de verificación",
                text: "El código vence en 15 minutos",
                html: HTMLRegisterEmail(randomCode)
            });

            return res.status(200).json({
                message: "Correo electrónico enviado exitosamente",
                email: cleanEmail
            });
        } catch (emailError) {
            console.log(emailError);
            return res.status(500).json({
                message: "Error al enviar el correo electrónico"
            });
        }

    } catch (error) {

        console.log("error", error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }
};

//Verificar el código de verificación
registerAdminController.verifyCode = async (req, res) => {

    try {

        const { code } = req.body;

        //==================== VALIDACIONES ====================

        if (!code) {
            return res.status(400).json({
                message: "El código es obligatorio"
            });
        }

        if (code.trim().length !== 6) {
            return res.status(400).json({
                message: "El código debe contener 6 caracteres."
            });
        }

        //======================================================

        const token = req.cookies.registrationCookie;

        if (!token) {
            return res.status(400).json({
                message: "No hay un registro pendiente. Vuelve a registrarte."
            });
        }

        let decoded;

        try {

            decoded = jsonwebtoken.verify(token, config.JWT.secret);

        } catch (err) {

            res.clearCookie("registrationCookie", clearCookieOptions());

            return res.status(400).json({
                message: "El código expiró. Vuelve a registrarte."
            });

        }

        const {
            randomCode,
            name,
            email,
            password
        } = decoded;

        if (code.trim().toUpperCase() !== randomCode) {
            return res.status(400).json({
                message: "Código de verificación incorrecto"
            });
        }

        //Verificar nuevamente que no exista
        const existingAdmin = await adminModel.findOne({
            email
        });

        if (existingAdmin) {

            res.clearCookie("registrationCookie", clearCookieOptions());

            return res.status(400).json({
                message: "El administrador ya se encuentra registrado."
            });

        }

        //Si todavía no existe ningún administrador en el sistema, este es el
        //primero -- se aprueba solo, porque de lo contrario nadie podría
        //aprobarlo nunca (no hay ningún admin verificado todavía). Cualquier
        //registro posterior queda pendiente hasta que un admin ya aprobado
        //le dé acceso desde el panel.
        const totalAdmins = await adminModel.countDocuments();
        const isFirstAdmin = totalAdmins === 0;

        //Guardar administrador
        const newAdmin = new adminModel({
            name,
            email,
            password,
            isVerified: true,
            isApproved: isFirstAdmin
        });

        await newAdmin.save();

        //Eliminar cookie
        res.clearCookie("registrationCookie", clearCookieOptions());

        return res.status(200).json({
            message: isFirstAdmin
                ? "Administrador registrado exitosamente"
                : "Correo verificado exitosamente. Tu cuenta debe ser aprobada por un administrador antes de que puedas iniciar sesión.",
            isApproved: isFirstAdmin
        });

    } catch (error) {

        console.log("error", error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }

};

export default registerAdminController;