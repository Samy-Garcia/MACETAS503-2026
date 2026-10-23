import crypto from "crypto"; //genera tokens aleatorios y códigos de referido
import jsonwebtoken from "jsonwebtoken"; //genera tokens JWT para autenticación
import bcryptjs from "bcryptjs"; //hashea contraseñas
import cloudinary from "cloudinary"; //configuración de Cloudinary para subir imágenes

import HTMLRegisterEmail from "../utils/sendMaildRegisterClient.js"; //plantilla HTML para el correo de registro
import { sendEmail } from "../utils/mailer.js"; //envía correos vía API HTTP de Brevo (Render bloquea SMTP en el plan gratis)
import { cookieOptions, clearCookieOptions } from "../utils/cookieOptions.js";

import config from "../../config.js"; //importa configuración del proyecto, como la clave secreta para JWT

import clientModel from "../models/client.js"; //modelo de cliente para interactuar con la base de datos

const registerClientController = {};

registerClientController.register = async (req, res) => {
    try {

        //Solicitar datos
        const {
            name,
            lastName,
            email,
            password,
            phone,
            address,
            loginAttempts,
            timeOut,
            referralCode
        } = req.body;

        //==================== VALIDACIONES ====================

        //Campos obligatorios
        if (!name || !lastName || !email || !password || !phone || !address) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });
        }

        //Eliminar espacios
        const cleanName = name.trim();
        const cleanLastName = lastName.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanPhone = phone.trim();
        const cleanAddress = address.trim();

        //Nombre
        const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/;

        if (!nameRegex.test(cleanName)) {
            return res.status(400).json({
                message: "El nombre solo puede contener letras y espacios."
            });
        }

        //Apellido
        if (!nameRegex.test(cleanLastName)) {
            return res.status(400).json({
                message: "El apellido solo puede contener letras y espacios."
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

        //Telefonoo
        // Acepta prefijo internacional (+503 7000-0000, +50370000000) o el
        // número local de siempre (7000-0000). Entre 7 y 15 dígitos en total.
        const phoneRegex = /^\+?[\d\s-]{7,20}$/;
        const phoneDigits = cleanPhone.replace(/\D/g, "");

        if (!phoneRegex.test(cleanPhone) || phoneDigits.length < 7 || phoneDigits.length > 15) {
            return res.status(400).json({
                message: "Número de teléfono inválido."
            });
        }

        //Direcci
        if (cleanAddress.length < 5 || cleanAddress.length > 150) {
            return res.status(400).json({
                message: "La dirección debe tener entre 5 y 150 caracteres."
            });
        }

        //======================================================

        //Validar si ya existe
        const existingClient = await clientModel.findOne({
            email: cleanEmail
        });

        if (existingClient) {
            return res.status(400).json({
                message: "El cliente ya existe"
            });
        }

        //Encriptar contraseña
        const passwordHashed = await bcryptjs.hash(password, 10);

        //Generar código aleatorio
        const randomCode = crypto.randomBytes(3).toString("hex");

        //Normalizar código
        const normalizedCode = randomCode.toUpperCase();

        //Guardar datos en JWT
        const token = jsonwebtoken.sign(
            {
                randomCode: normalizedCode,
                name: cleanName,
                lastName: cleanLastName,
                email: cleanEmail,
                password: passwordHashed,
                phone: cleanPhone,
                address: cleanAddress,
                loginAttempts,
                timeOut,
                referralCode: referralCode ? referralCode.trim().toUpperCase() : undefined
            },
            config.JWT.secret,
            {
                expiresIn: "15m"
            }
        );

        //Guardar cookie
        res.cookie("registrationCookie", token, cookieOptions(15 * 60 * 1000));

        //Enviar correo (vía Brevo, no SMTP: Render bloquea SMTP saliente en el plan gratis)
        try {
            await sendEmail({
                to: cleanEmail,
                subject: "Código de verificación",
                text: "El código vence en 15 minutos",
                html: HTMLRegisterEmail(normalizedCode)
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

//Verificar código
registerClientController.verifyCode = async (req, res) => {

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
            lastName,
            email,
            password,
            phone,
            address,
            loginAttempts,
            timeOut,
            referralCode
        } = decoded;

        if (code.trim().toUpperCase() !== randomCode) {
            return res.status(400).json({
                message: "Código de verificación incorrecto"
            });
        }

        //Verificar nuevamente que no exista
        const existingClient = await clientModel.findOne({
            email
        });

        if (existingClient) {
            res.clearCookie("registrationCookie", clearCookieOptions());

            return res.status(400).json({
                message: "El cliente ya se encuentra registrado."
            });
        }

        // Le generamos su propio código de referido único (para que él también pueda referir)
        let myReferralCode;
        let codeExists = true;
        while (codeExists) {
            myReferralCode = `M503-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
            codeExists = await clientModel.findOne({ referralCode: myReferralCode });
        }

        // Si se registró con el código de otro cliente, lo enlazamos como su referido
        let referredBy = undefined;
        if (referralCode) {
            const referrer = await clientModel.findOne({ referralCode });
            if (referrer) referredBy = referrer._id;
        }

        const newClient = new clientModel({
            name,
            lastName,
            email,
            password,
            phone,
            address,
            loginAttempts,
            timeOut,
            isVerified: true,
            referralCode: myReferralCode,
            referredBy
        });

        await newClient.save();

        res.clearCookie("registrationCookie", clearCookieOptions());

        return res.status(200).json({
            message: "Cliente registrado exitosamente"
        });

    } catch (error) {

        console.log("error", error);

        res.status(500).json({
            message: "Error interno del servidor"
        });

    }

};

export default registerClientController;