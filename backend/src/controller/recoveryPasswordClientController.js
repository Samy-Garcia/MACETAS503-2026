import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import HTMLRecoveryPasswordEmail from "../utils/sendMaildRecoveryClient.js";
import { sendEmail } from "../utils/mailer.js"; //envía correos vía API HTTP de Brevo (Render bloquea SMTP en el plan gratis)

import { config } from "../../config.js";
import { cookieOptions, clearCookieOptions } from "../utils/cookieOptions.js";

import clientModel from "../models/client.js";

//Array de funciones

const recoveryPasswordClientController = {}

recoveryPasswordClientController.requestCode = async (req, res) => {
    try {
        //Solicitamos los datos
        const { email } = req.body;
        
        //validar que el email exista
        const ClientFound = await clientModel.findOne({ email });

        if (!ClientFound) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        //generar un codigo aleatorio (normalizado a mayúsculas)
        const randomCode = crypto.randomBytes(3).toString("hex").toUpperCase();

        //guardar el codigo en un token
        const token = jsonwebtoken.sign(
            //que vamos a guardar en el token
            { email, randomCode, userType: "client", verify: false },
            //SECRET KEY
            config.JWT.secret,
            //tiempo de expiracion del token
            { expiresIn: "15m" }
        );

        res.cookie("recoveryCookie", token, cookieOptions(15 * 60 * 1000));

        //enviar el codigo por email (vía Brevo, no SMTP)
        try {
            await sendEmail({
                to: email,
                subject: "Recovery code",
                text: "El vence en 15 minutos",
                html: HTMLRecoveryPasswordEmail(randomCode)
            });
            return res.status(200).json({ message: "Código de recuperación enviado al correo electrónico" });
        } catch (emailError) {
            console.log("Error al enviar el correo electrónico", emailError);
            return res.status(500).json({ message: "Error al enviar el correo electrónico" });
        }

    } catch (error) {
        console.log("Error"+error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


recoveryPasswordClientController.verifyCode = async (req, res) => {
    try {

        //Solicitamos los datos
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: "El código es obligatorio" });
        }

        //obtener el token de las cookies
        const token = req.cookies.recoveryCookie;

        if (!token) {
            return res.status(400).json({ message: "No hay una recuperación pendiente. Solicita el código de nuevo." });
        }

        let decoded;
        try {
            decoded = jsonwebtoken.verify(token, config.JWT.secret);
        } catch (err) {
            res.clearCookie("recoveryCookie", clearCookieOptions());
            return res.status(400).json({ message: "El código expiró. Solicítalo de nuevo." });
        }

        //comparamos el codigo que nos envio el usuario con el codigo del token (sin distinguir mayúsc/minúsc)
        if (code.toUpperCase() !== decoded.randomCode) {
            return res.status(400).json({ message: "Código de verificación incorrecto" });
        }

        //el codigo es correcto: marcamos en el token que ya fue verificado
        const newToken = jsonwebtoken.sign(
            { email: decoded.email, userType: "client", verify: true },
            config.JWT.secret,
            { expiresIn: "15m" }
        );

        res.cookie("recoveryCookie", newToken, cookieOptions(15 * 60 * 1000));

        return res.status(200).json({ message: "Código verificado correctamente" });

    } catch (error) {
        console.log("error"+error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

recoveryPasswordClientController.newPassword = async (req, res) => {
    try {

        const {newPassword, confirmPassword} = req.body;

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({ message: "Ambos campos de contraseña son obligatorios" });
        }

        //comparo las contraseñas
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Las contraseñas no coinciden" });
        }

        const token = req.cookies.recoveryCookie;

        if (!token) {
            return res.status(400).json({ message: "No hay una recuperación pendiente. Solicita el código de nuevo." });
        }

        let decoded;
        try {
            decoded = jsonwebtoken.verify(token, config.JWT.secret);
        } catch (err) {
            res.clearCookie("recoveryCookie", clearCookieOptions());
            return res.status(400).json({ message: "La sesión de recuperación expiró. Empieza de nuevo." });
        }

        //vamos a comparar que la constante verify que esta en el token ya esta en true
        if (!decoded.verify) {
            return res.status(400).json({ message: "El código no ha sido verificado" });
        }

        //encriptar la nueva contraseña
        const passwordHash = await bcrypt.hash(newPassword, 10)

        //actualizar la contraseña en la base de datos
        await clientModel.findOneAndUpdate(
            { email: decoded.email },
            { password: passwordHash },
            {new: true }
        );

        res.clearCookie("recoveryCookie", clearCookieOptions());

        return res.status(200).json({ message: "Contraseña actualizada exitosamente" });

    } catch (error) {
        console.log("error"+error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default recoveryPasswordClientController;
