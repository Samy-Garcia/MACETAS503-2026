import { clearCookieOptions } from "../utils/cookieOptions.js";

//array de funciones

const logoutController = {};

logoutController.logout = async (req, res) => {
    // Este mismo endpoint (/api/logout) lo usan tanto el frontend de cliente
    // como el de admin, así que limpiamos las dos cookies posibles. Borrar
    // una cookie que no existe no da error, así que esto es seguro sin
    // importar desde cuál de los dos se llame.
    res.clearCookie("authCookie", clearCookieOptions());
    res.clearCookie("adminAuthCookie", clearCookieOptions());

    // Send a success response
    return res.status(200).json({message: "Logout successful"});
};

export default logoutController;
