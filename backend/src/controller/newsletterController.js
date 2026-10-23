import subscriberModel from "../models/subscriber.js";
import { sendEmail } from "../utils/mailer.js";
import HTMLNewsletterEmail from "../utils/sendNewsletterEmail.js";

const newsletterController = {};

// POST /api/newsletter (público) — usado por el formulario del footer
newsletterController.subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        const cleanEmail = (email || "").trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ message: "Ingresa un correo electrónico válido." });
        }

        const existing = await subscriberModel.findOne({ email: cleanEmail });
        if (existing) {
            return res.status(200).json({ message: "Ese correo ya está suscrito. ¡Gracias por seguirnos!" });
        }

        await subscriberModel.create({ email: cleanEmail });

        return res.status(201).json({ message: "¡Listo! Ya estás suscrito a nuestras novedades." });

    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// GET /api/newsletter/admin — todos los suscriptores, para la pantalla de
// administración (más nuevos primero)
newsletterController.getAllAdmin = async (req, res) => {
    try {
        const subscribers = await subscriberModel.find().sort({ createdAt: -1 });
        return res.status(200).json(subscribers);
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// DELETE /api/newsletter/admin/:id — el admin puede quitar un suscriptor
// (ej. si alguien pide que lo saquen de la lista)
newsletterController.adminDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const subscriber = await subscriberModel.findByIdAndDelete(id);
        if (!subscriber) {
            return res.status(404).json({ message: "Suscriptor no encontrado" });
        }
        return res.status(200).json({ message: "Suscriptor eliminado" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// POST /api/newsletter/admin/send — el admin manda un correo (anuncio de
// producto nuevo, oferta, etc.) a TODOS los suscriptores. Es manual, el
// admin escribe el mensaje y decide cuándo mandarlo -- nunca se dispara
// solo al crear un producto o una oferta.
newsletterController.sendBlast = async (req, res) => {
    try {
        const { subject, message } = req.body;

        const tituloLimpio = (subject || "").trim();
        const mensajeLimpio = (message || "").trim();

        if (!tituloLimpio || !mensajeLimpio) {
            return res.status(400).json({ message: "El asunto y el mensaje son obligatorios." });
        }

        const subscribers = await subscriberModel.find();
        if (subscribers.length === 0) {
            return res.status(400).json({ message: "Todavía no hay ningún suscriptor a quién mandarle el correo." });
        }

        const html = HTMLNewsletterEmail(tituloLimpio, mensajeLimpio);

        let enviados = 0;
        let fallidos = 0;

        // Se manda uno por uno (no en un solo correo con todos en copia,
        // para no exponer los correos de unos suscriptores a otros), con
        // una pequeña pausa entre cada uno para no disparar de golpe
        // límites de envío o filtros de spam del proveedor.
        for (const subscriber of subscribers) {
            try {
                await sendEmail({
                    to: subscriber.email,
                    subject: tituloLimpio,
                    text: mensajeLimpio,
                    html
                });
                enviados++;
            } catch (err) {
                console.log(`No se pudo enviar el correo a ${subscriber.email}:`, err.message || err);
                fallidos++;
            }
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        return res.status(200).json({
            message: `Correo enviado a ${enviados} de ${subscribers.length} suscriptores${fallidos > 0 ? ` (${fallidos} fallaron)` : ""}.`,
            enviados,
            fallidos,
            total: subscribers.length
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default newsletterController;
