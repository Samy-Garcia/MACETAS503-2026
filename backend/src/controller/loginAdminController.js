import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

import { config } from "../../config.js";
import { cookieOptions, clearCookieOptions } from "../utils/cookieOptions.js";

import clientModel from "../models/admin.js";

const loginAdminController = {};

loginAdminController.login = async (req, res) => {
    try {
        //solicitar datos
        const { email, password } = req.body;

        //validar si el cliente existe
        const AdminFound = await clientModel.findOne({ email });
        if (!AdminFound) {
            return res.status(400).json({ message: 'El cliente no existe' });
        }

         //Vereficamos que la cuenta no este bloqueada
        if ( AdminFound.timeOut && AdminFound.timeOut > Date.now()) {
            return res.status(403).json({message: "Cuenta bloqueada. Inténtalo de nuevo más tarde."});
        }

        //validar contraseña
        const isMatch = await bcrypt.compare(password, AdminFound.password);
        if (!isMatch) {
            //Si la contraseña es incorrecta, incrementamos los intentos de inicio de sesión
            AdminFound.loginAttempts = (AdminFound.loginAttempts || 0) + 1;

            if (AdminFound.loginAttempts >= 5) {
                AdminFound.timeOut = Date.now() + 5 * 60 * 1000; // Bloquea la cuenta por 5 minutos

                await AdminFound.save();
                return res.status(403).json({message: "Cuenta bloqueada por demasiados intentos fallidos de inicio de sesión. Inténtalo de nuevo más tarde."});
            }

            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        //Por seguridad, un admin recién registrado no puede entrar hasta que
        //un admin ya aprobado le dé acceso desde el panel (ver
        //registerAdminController y adminProfileController.approveAdmin).
        if (!AdminFound.isApproved) {
            return res.status(403).json({
                message: "Tu cuenta aún no ha sido aprobada por un administrador. Espera a que un administrador verificado te dé acceso."
            });
        }

        //resetear intentos de inicio de sesión y tiempo de bloqueo
        AdminFound.loginAttempts = 0;
        AdminFound.timeOut = null;

        //generar token
        const token = jsonwebtoken.sign(
        //que vamos a guardar en el token
        { id: AdminFound._id, userType: "admin" },
        //secret key
        config.JWT.secret,
        //tiempo de expiracion del token
        { expiresIn: "30d" }
        );

        //guardar el token en una cookie propia del admin, separada de la del
        //cliente ("authCookie") -- antes ambas se llamaban igual y, al vivir
        //en el mismo dominio, si en otra pestaña/app había sesión de cliente
        //activa, esa cookie sobreescribía la del admin (o viceversa),
        //cerrando la sesión de admin sin ningún motivo real.
        res.cookie("adminAuthCookie", token, cookieOptions(30 * 24 * 60 * 60 * 1000));

        await AdminFound.save();

        return res.status(200).json({message: "Login successful"});

            
    } catch (error) {
        console.log("error"+ error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Verifica la cookie authCookie y devuelve los datos del admin logueado.
// Esto es lo que el frontend usa para saber "¿sigo logueado?" al recargar la página
// o al entrar directamente a una URL como /dashboard.
loginAdminController.me = async (req, res) => {
    try {
        const token = req.cookies.adminAuthCookie;

        if (!token) {
            return res.status(401).json({ message: "No autenticado" });
        }

        let decoded;
        try {
            decoded = jsonwebtoken.verify(token, config.JWT.secret);
        } catch (err) {
            res.clearCookie("adminAuthCookie", clearCookieOptions());
            return res.status(401).json({ message: "Sesión inválida o expirada" });
        }

        if (decoded.userType !== "admin") {
            return res.status(401).json({ message: "No autenticado" });
        }

        const admin = await clientModel.findById(decoded.id).select("-password");

        if (!admin) {
            res.clearCookie("adminAuthCookie", clearCookieOptions());
            return res.status(401).json({ message: "No autenticado" });
        }

        return res.status(200).json({
            id: admin._id,
            name: admin.name,
            email: admin.email
        });

    } catch (error) {
        console.log("error" + error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default loginAdminController;
