import jsonwebtoken from "jsonwebtoken";

import { config } from "../../config.js";

import quotationModel from "../models/quotation.js";
import { todayInElSalvador, toDateOnly } from "../utils/dateUtils.js";
import clientModel from "../models/client.js";
import { sendEmail } from "../utils/mailer.js";
import HTMLQuotationEmail from "../utils/sendQuotationEmail.js";
import HTMLQuotationResponseEmail from "../utils/sendQuotationResponseEmail.js";

const quotationController = {};

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

// POST /api/quotations — el cliente pide una cotización para un evento,
// con la lista de productos que le interesan y sus cantidades.
quotationController.create = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const { eventType, eventDate, guestCount, location, locationLat, locationLng, specialRequirements, items } = req.body;

        if (!eventType || !eventType.trim() || !eventDate) {
            return res.status(400).json({ message: "El tipo de evento y la fecha son obligatorios" });
        }

        const eventDay = toDateOnly(eventDate);
        if (!eventDay) {
            return res.status(400).json({ message: "La fecha del evento no es válida" });
        }
        if (eventDay < todayInElSalvador()) {
            return res.status(400).json({ message: "La fecha del evento no puede ser una fecha pasada" });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Agrega al menos un producto a tu cotización" });
        }

        for (const item of items) {
            if (!item.productType || !item.productId || !item.productName || item.unitPrice === undefined || !item.quantity || item.quantity < 1) {
                return res.status(400).json({ message: "Uno de los productos de la lista está incompleto" });
            }
        }

        const estimatedTotal = items.reduce((sum, item) => sum + (Number(item.unitPrice) * Number(item.quantity)), 0);

        const quotation = await quotationModel.create({
            clientId,
            eventType: eventType.trim(),
            eventDate,
            guestCount,
            location,
            locationLat,
            locationLng,
            specialRequirements,
            items,
            estimatedTotal
        });

        const client = await clientModel.findById(clientId);
        if (client) {
            try {
                await sendEmail({
                    to: client.email,
                    subject: "Recibimos tu solicitud de cotización",
                    text: `Hola ${client.name}, recibimos tu solicitud de cotización para tu evento (${eventType}). Nos pondremos en contacto contigo pronto.`,
                    html: HTMLQuotationEmail(client.name, eventType.trim())
                });
            } catch (emailError) {
                console.log("No se pudo enviar el correo de confirmación de cotización:", emailError.message || emailError);
            }
        }

        return res.status(201).json(quotation);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// GET /api/quotations/mine — mis solicitudes de cotización (para la
// pestaña nueva en Mi Perfil)
quotationController.getMine = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const quotations = await quotationModel.find({ clientId }).sort({ createdAt: -1 });
        return res.status(200).json(quotations);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// GET /api/quotations/admin — TODAS las solicitudes, con datos de
// contacto del cliente, para la pantalla de administración
quotationController.getAllAdmin = async (req, res) => {
    try {
        const quotations = await quotationModel
            .find()
            .populate("clientId", "name lastName email phone")
            .sort({ createdAt: -1 });

        const enriched = quotations.map(q => ({
            _id: q._id,
            eventType: q.eventType,
            eventDate: q.eventDate,
            guestCount: q.guestCount,
            location: q.location,
            locationLat: q.locationLat,
            locationLng: q.locationLng,
            specialRequirements: q.specialRequirements,
            items: q.items,
            estimatedTotal: q.estimatedTotal,
            status: q.status,
            finalPrice: q.finalPrice,
            adminMessage: q.adminMessage,
            createdAt: q.createdAt,
            client: q.clientId ? {
                name: `${q.clientId.name || ""} ${q.clientId.lastName || ""}`.trim(),
                email: q.clientId.email,
                phone: q.clientId.phone
            } : null
        }));

        return res.status(200).json(enriched);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// PATCH /api/quotations/admin/:id/respond — el admin responde la
// cotización con un precio final, un mensaje, y el estado (Cotizada o
// Rechazada). Avisa al cliente por correo.
quotationController.respond = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, finalPrice, adminMessage } = req.body;

        if (!["Cotizada", "Rechazada"].includes(status)) {
            return res.status(400).json({ message: "El estado debe ser \"Cotizada\" o \"Rechazada\"" });
        }
        if (status === "Cotizada" && (finalPrice === undefined || finalPrice === null || Number(finalPrice) < 0)) {
            return res.status(400).json({ message: "Debes indicar un precio final válido" });
        }

        const quotation = await quotationModel.findById(id).populate("clientId", "name email");
        if (!quotation) {
            return res.status(404).json({ message: "Cotización no encontrada" });
        }

        quotation.status = status;
        if (status === "Cotizada") quotation.finalPrice = Number(finalPrice);
        quotation.adminMessage = adminMessage || "";
        await quotation.save();

        if (quotation.clientId?.email && status === "Cotizada") {
            try {
                await sendEmail({
                    to: quotation.clientId.email,
                    subject: "¡Tu cotización está lista!",
                    text: `Hola ${quotation.clientId.name}, tu cotización quedó en $${Number(finalPrice).toFixed(2)}. ${adminMessage || ""}`,
                    html: HTMLQuotationResponseEmail(quotation.clientId.name, finalPrice, adminMessage)
                });
            } catch (emailError) {
                console.log("No se pudo enviar el correo de respuesta de cotización:", emailError.message || emailError);
            }
        }

        return res.status(200).json(quotation);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default quotationController;
