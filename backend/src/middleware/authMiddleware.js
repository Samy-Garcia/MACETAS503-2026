import jsonwebtoken from "jsonwebtoken";
import { config } from "../../config.js";

export const validateAuthCookie = (allowedTypes = []) => {
    return (req, res, next) => {
        try {

            //#1- Extraer el token que está en la cookie de admin.
            // Antes esto leía la cookie "authCookie", la MISMA que usa el
            // login de cliente -- como las dos viven en el mismo dominio
            // (macetas.onrender.com), si en otra pestaña/app había una
            // sesión de cliente activa, su cookie pisaba la del admin (o
            // viceversa) y por eso la sesión de admin "se cerraba sola" sin
            // ningún motivo real. Este middleware solo se usa para rutas de
            // admin (validateAuthCookie(["admin"])), así que ahora lee una
            // cookie separada, "adminAuthCookie", que nunca choca con la de
            // cliente.
            const {adminAuthCookie} = req.cookies;

            if(!adminAuthCookie) {
                return res.status(403).json({message: "No se encontró una sesión activa, debes iniciar sesión"})
            }

            //#2- Extraer toda la información de la cookie
            let decoded;
            try {
                decoded = jsonwebtoken.verify(adminAuthCookie, config.JWT.secret)
            } catch (jwtError) {
                // Token expirado, manipulado o firmado con otra clave -> esto
                // NO es un error del servidor, es que la sesión ya no es
                // válida. Antes esto caía al catch de abajo y respondía 500,
                // lo cual el frontend interpretaba como "problema temporal"
                // y reintentaba, en vez de simplemente pedir iniciar sesión
                // de nuevo (401), igual que el resto de rutas protegidas.
                return res.status(401).json({message: "Sesión inválida o expirada"})
            }

            //Verificar si el rol que tiene la cookie puede pasar o no
            if(!allowedTypes.includes(decoded.userType)){
                return res.status(401).json({message: "Access denied"})
            }

            //Si el rol si está, podemos continuar
            next()
        } catch (error) {
            console.log("error"+error)
            return res.status(500).json({message: "Error interno del servidor"})
        }
    }
}