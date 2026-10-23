import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

import { config } from "../../config.js";
import { cookieOptions } from "../utils/cookieOptions.js";

import clientModel from "../models/client.js";
import { generarTokenWompiInterno, tokenizarTarjetaInterno } from "./wompiController.js";
import { deleteCloudinaryPhoto } from "../utils/profilePhotoUpload.js";

const loginClientController = {};

// =======================
// LOGIN NORMAL
// =======================
loginClientController.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        // Validar si el cliente existe
        const clientFound = await clientModel.findOne({ email });

        if (!clientFound) {
            return res.status(400).json({
                message: "El cliente no existe"
            });
        }

        // Verificar si la cuenta está bloqueada
        if (clientFound.timeOut && clientFound.timeOut > Date.now()) {
            return res.status(403).json({
                message: "Cuenta bloqueada. Inténtalo de nuevo más tarde."
            });
        }

        // Validar contraseña
        const isMatch = await bcrypt.compare(
            password,
            clientFound.password
        );

        if (!isMatch) {

            clientFound.loginAttempts =
                (clientFound.loginAttempts || 0) + 1;

            if (clientFound.loginAttempts >= 5) {

                clientFound.timeOut =
                    Date.now() + 5 * 60 * 1000;

                await clientFound.save();

                return res.status(403).json({
                    message:
                        "Cuenta bloqueada por demasiados intentos fallidos de inicio de sesión. Inténtalo de nuevo más tarde."
                });
            }

            await clientFound.save();

            return res.status(400).json({
                message: "Contraseña incorrecta"
            });
        }

        // Reiniciar intentos
        clientFound.loginAttempts = 0;
        clientFound.timeOut = null;

        await clientFound.save();

        // Generar JWT
        const token = jsonwebtoken.sign(
            {
                id: clientFound._id,
                userType: "client"
            },
            config.JWT.secret,
            {
                expiresIn: "30d"
            }
        );

        // Guardar cookie
        res.cookie("authCookie", token, cookieOptions(30 * 24 * 60 * 60 * 1000));

        return res.status(200).json({
            message: "Login successful"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Error interno del servidor"
        });

    }
};


// LOGIN CON GOOGLE
// =======================
loginClientController.loginGoogle = async (req, res) => {

    try {

        const { accessToken, acceptedTerms } = req.body;

        if (!accessToken) {
            return res.status(400).json({
                message: "Token de Google requerido"
            });
        }

        // Antes se verificaba un ID Token (credential) con verifyIdToken. Se
        // cambió a este flujo (access_token + userinfo) porque el botón
        // "Ingresa con Google" personalizado dependía de clickear un botón
        // invisible que Google renderiza de forma asíncrona (a veces nunca
        // llegaba a renderizarse, dejando el botón real sin funcionar). El
        // flujo de useGoogleLogin abre un popup real al hacer clic, sin
        // depender de que se renderice ningún botón oculto.
        const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!googleRes.ok) {
            return res.status(401).json({
                message: "Token de Google inválido o expirado"
            });
        }

        const payload = await googleRes.json();


        let clientFound = await clientModel.findOne({
            email: payload.email
        });


        // Si el usuario NO existe, debe aceptar términos
        if (!clientFound) {


            if (acceptedTerms !== true) {

                return res.status(400).json({
                    message: "Debes aceptar los términos y condiciones para crear una cuenta."
                });

            }


            // Crear usuario nuevo
            clientFound = await clientModel.create({

                name: payload.given_name || payload.name,
                lastName: payload.family_name || "",

                email: payload.email,

                password: "",

                isActive: true,
                isVerified: true,

                phone: "",
                address: "",

                googleId: payload.sub,
                photo: payload.picture,

                provider: "google",

                acceptedTerms: true,

                loginAttempts: 0,
                timeOut: null

            });

        } else {

            // Vincular la cuenta de Google (googleId) y renovar el estado de
            // seguridad, pero SIN pisar la foto ni el "provider" en cada
            // login: si el cliente ya tenía una foto personalizada subida
            // desde su perfil, o se registró originalmente con
            // correo/contraseña, eso debe conservarse. Antes esto se
            // sobrescribía en CADA inicio de sesión con Google, borrando
            // sin avisar cualquier foto personalizada que el cliente
            // hubiera subido.
            clientFound.googleId = payload.sub;
            clientFound.isVerified = true;

            clientFound.loginAttempts = 0;
            clientFound.timeOut = null;


            await clientFound.save();

        }

        // Generar JWT
        const token = jsonwebtoken.sign(
            {
                id: clientFound._id,
                userType: "client"
            },
            config.JWT.secret,
            {
                expiresIn: "30d"
            }
        );

        // Guardar cookie
        res.cookie("authCookie", token, cookieOptions(30 * 24 * 60 * 60 * 1000));

        return res.status(200).json({
            message: "Login con Google exitoso",
            client: clientFound
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error al iniciar sesión con Google"
        });
    }
};

// =======================
// MI PERFIL
// =======================

// Lee la cookie authCookie, la verifica, y devuelve el id del cliente logueado.
const getLoggedClientId = (req) => {
    const token = req.cookies.authCookie;
    if (!token) return null;

    try {
        const decoded = jsonwebtoken.verify(token, config.JWT.secret);
        if (decoded.userType !== "client") return null;
        return decoded.id;
    } catch (err) {
        return null;
    }
};

// GET /api/loginClient/me — devuelve el perfil del cliente logueado (sin password)
loginClientController.me = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "No autenticado" });
        }

        // "-savedCard.tokenTarjeta": el token reusable de Wompi nunca debe
        // llegar al frontend (ya cumplió su propósito al guardarse); solo se
        // usa del lado del servidor al cobrar (ver wompiController.pagarConTarjetaGuardada).
        const client = await clientModel.findById(clientId).select("-password -savedCard.tokenTarjeta");

        if (!client) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        return res.status(200).json(client);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// PUT /api/loginClient/me — actualiza nombre, apellido, teléfono y (opcional) foto.
// A propósito NO permite cambiar email ni password desde aquí (son flujos aparte,
// email por la verificación y password por seguridad).
loginClientController.updateMe = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "No autenticado" });
        }

        const { name, lastName, phone, birthDate } = req.body;

        if (!name || !name.trim() || !lastName || !lastName.trim()) {
            return res.status(400).json({ message: "Nombre y apellido son obligatorios" });
        }

        // Igual que en el registro: solo se revisaba que no vinieran vacíos,
        // sin validar el formato (alguien podría mandar un nombre con
        // números directo a la API, saltándose el frontend).
        const nameRegexUpdate = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/;
        if (!nameRegexUpdate.test(name.trim())) {
            return res.status(400).json({ message: "El nombre solo puede contener letras y espacios." });
        }
        if (!nameRegexUpdate.test(lastName.trim())) {
            return res.status(400).json({ message: "El apellido solo puede contener letras y espacios." });
        }
        // El componente PhoneInput (formato internacional) manda el teléfono
        // como "+503 7952 3766" -- con espacios y el "+". El patrón anterior
        // (solo dígitos y guion) rechazaba ese formato válido.
        if (phone && phone.trim() && !/^\+?[\d\s-]{7,20}$/.test(phone.trim())) {
            return res.status(400).json({ message: "Número de teléfono inválido." });
        }

        const updatedData = { name: name.trim(), lastName: lastName.trim(), phone };

        if (birthDate) {
            updatedData.birthDate = birthDate;
        }

        if (req.file) {
            // Borramos la foto anterior de Cloudinary (si era una subida por el cliente)
            const actual = await clientModel.findById(clientId).select("photoPublicId");
            await deleteCloudinaryPhoto(actual?.photoPublicId);
            updatedData.photo = req.file.path;
            updatedData.photoPublicId = req.file.filename;
        }

        const updatedClient = await clientModel
            .findByIdAndUpdate(clientId, updatedData, { new: true })
            .select("-password");

        return res.status(200).json(updatedClient);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// =======================
// LIBRETA DE DIRECCIONES
// =======================

// POST /api/loginClient/me/addresses
loginClientController.addAddress = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "No autenticado" });
        }

        // Departamento y municipio ya no se piden: la dirección se marca en el
        // mapa y el texto completo queda en addressLine.
        const { fullName, addressLine, phone, isDefault, lat, lng } = req.body;

        if (!fullName || !addressLine || !phone) {
            return res.status(400).json({ message: "Nombre, dirección y teléfono son obligatorios" });
        }

        if (addressLine.trim().length < 5 || addressLine.trim().length > 250) {
            return res.status(400).json({ message: "La dirección debe tener entre 5 y 250 caracteres." });
        }

        if ((lat !== undefined && lat !== null && (typeof lat !== "number" || lat < -90 || lat > 90)) ||
            (lng !== undefined && lng !== null && (typeof lng !== "number" || lng < -180 || lng > 180))) {
            return res.status(400).json({ message: "Las coordenadas de la ubicación no son válidas." });
        }

        // fullName combina nombre + apellido en un solo campo (con espacio en
        // medio), por eso el máximo es más amplio que el de un nombre solo.
        if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,100}$/.test(fullName.trim())) {
            return res.status(400).json({ message: "El nombre solo puede contener letras y espacios." });
        }
        // Mismo caso: PhoneInput (formato internacional) manda "+503 7952 3766".
        if (!/^\+?[\d\s-]{7,20}$/.test(phone.trim())) {
            return res.status(400).json({ message: "Número de teléfono inválido." });
        }

        const clientDoc = await clientModel.findById(clientId);
        if (!clientDoc) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        // Si esta se marca predeterminada, quitamos esa marca de las demás
        if (isDefault || clientDoc.addresses.length === 0) {
            clientDoc.addresses.forEach(addr => { addr.isDefault = false; });
        }

        clientDoc.addresses.push({
            fullName: fullName.trim(),
            addressLine: addressLine.trim(),
            phone: phone.trim(),
            isDefault: isDefault || clientDoc.addresses.length === 0,
            // Coordenadas opcionales: si el cliente marcó su ubicación en el
            // mapa al guardar la dirección, quedan listas para reutilizarse
            // directo en el checkout sin tener que volver a marcar el mapa.
            lat: lat ?? undefined,
            lng: lng ?? undefined
        });

        await clientDoc.save();

        return res.status(201).json(clientDoc.addresses);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// PUT /api/loginClient/me/addresses/:addressId
loginClientController.updateAddress = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "No autenticado" });
        }

        const { addressId } = req.params;
        const { fullName, addressLine, phone, isDefault, lat, lng } = req.body;

        const clientDoc = await clientModel.findById(clientId);
        if (!clientDoc) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        const address = clientDoc.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ message: "Dirección no encontrada" });
        }

        if (isDefault) {
            clientDoc.addresses.forEach(addr => { addr.isDefault = false; });
        }

        // Antes no se validaba ningún formato aquí (a diferencia de crear
        // una dirección nueva), así que se podía editar una dirección con
        // un nombre con números o un teléfono inválido saltándose el
        // frontend por completo.
        if (fullName && !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,100}$/.test(fullName.trim())) {
            return res.status(400).json({ message: "El nombre solo puede contener letras y espacios." });
        }
        // Mismo caso: PhoneInput (formato internacional) manda "+503 7952 3766".
        if (phone && !/^\+?[\d\s-]{7,20}$/.test(phone.trim())) {
            return res.status(400).json({ message: "Número de teléfono inválido." });
        }

        if (fullName) address.fullName = fullName;
        if (addressLine) {
            if (addressLine.trim().length < 5 || addressLine.trim().length > 250) {
                return res.status(400).json({ message: "La dirección debe tener entre 5 y 250 caracteres." });
            }
            address.addressLine = addressLine.trim();
        }
        if (phone) address.phone = phone;
        if (isDefault !== undefined) address.isDefault = isDefault;
        if (lat !== undefined) address.lat = lat;
        if (lng !== undefined) address.lng = lng;

        await clientDoc.save();

        return res.status(200).json(clientDoc.addresses);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// DELETE /api/loginClient/me/addresses/:addressId
loginClientController.deleteAddress = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "No autenticado" });
        }

        const { addressId } = req.params;

        const clientDoc = await clientModel.findById(clientId);
        if (!clientDoc) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        const address = clientDoc.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ message: "Dirección no encontrada" });
        }

        const wasDefault = address.isDefault;
        address.deleteOne();

        // Si borramos la que era predeterminada, la primera que quede pasa a serlo
        if (wasDefault && clientDoc.addresses.length > 0) {
            clientDoc.addresses[0].isDefault = true;
        }

        await clientDoc.save();

        return res.status(200).json(clientDoc.addresses);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// =======================
// MÉTODO DE PAGO GUARDADO
// =======================

// POST /api/loginClient/me/payment-method
// Tokeniza la tarjeta con Wompi y guarda SOLO el token reusable + los datos
// enmascarados -- nunca el número completo ni el CVV. Antes esta pantalla
// (AddPaymentMethod.jsx) no llamaba a ningún endpoint, solo mostraba un
// mensaje de éxito falso, por eso la tarjeta "guardada" nunca podía
// reutilizarse para pagar: no existía en ningún lado.
loginClientController.savePaymentMethod = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "No autenticado" });
        }

        const { numeroTarjeta, cvv, mesVencimiento, anioVencimiento, nombreEnTarjeta } = req.body;

        if (!numeroTarjeta || !cvv || !mesVencimiento || !anioVencimiento || !nombreEnTarjeta) {
            return res.status(400).json({ message: "Todos los campos de la tarjeta son obligatorios" });
        }

        const cleanNumber = String(numeroTarjeta).replace(/\s+/g, "");
        if (!/^\d{13,19}$/.test(cleanNumber)) {
            return res.status(400).json({ message: "Número de tarjeta inválido" });
        }
        if (!/^\d{3,4}$/.test(String(cvv))) {
            return res.status(400).json({ message: "CVV inválido" });
        }

        const mes = Number(mesVencimiento);
        const anio = Number(anioVencimiento);
        if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
            return res.status(400).json({ message: "Mes de vencimiento inválido" });
        }
        if (!Number.isInteger(anio) || anio < new Date().getFullYear()) {
            return res.status(400).json({ message: "Año de vencimiento inválido" });
        }

        const tokenWompi = await generarTokenWompiInterno();
        const resultadoTokenizacion = await tokenizarTarjetaInterno({
            token: tokenWompi,
            numeroTarjeta: cleanNumber,
            cvv: String(cvv),
            mesVencimiento: mes,
            anioVencimiento: anio,
            nombreEnTarjeta: nombreEnTarjeta.trim()
        });

        const savedCard = {
            tokenTarjeta: resultadoTokenizacion.token,
            maskedNumber: resultadoTokenizacion.tarjetaEnmascarada || `**** **** **** ${cleanNumber.slice(-4)}`,
            cardHolderName: nombreEnTarjeta.trim(),
            expMonth: mes,
            expYear: anio,
            savedAt: new Date()
        };

        await clientModel.findByIdAndUpdate(clientId, { savedCard });

        // Nunca devolvemos tokenTarjeta -- el frontend solo necesita lo
        // enmascarado para mostrarlo.
        const { tokenTarjeta, ...savedCardSafe } = savedCard;
        return res.status(200).json(savedCardSafe);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message || "No se pudo guardar la tarjeta" });
    }
};

// DELETE /api/loginClient/me/payment-method
loginClientController.deletePaymentMethod = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "No autenticado" });
        }

        await clientModel.findByIdAndUpdate(clientId, { $unset: { savedCard: 1 } });

        return res.status(200).json({ message: "Tarjeta eliminada exitosamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default loginClientController;