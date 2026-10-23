import crypto from "crypto";

import jsonwebtoken from "jsonwebtoken";
import { config } from "../../config.js";

import clientModel from "../models/client.js";
import redemptionModel from "../models/redemption.js";
import rewardModel from "../models/reward.js";
import { getEarnMethod } from "./earnMethodsController.js";
import { sendEmail } from "../utils/mailer.js";
import HTMLRedemptionEmail from "../utils/sendRedemptionEmail.js";

const loyaltyController = {};

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

// Otorga hojas y las registra en el historial. La usan checkout y reviews.
export const grantPoints = async (clientId, amount, title) => {
    await clientModel.findByIdAndUpdate(clientId, {
        $inc: { loyaltyPoints: amount },
        $push: { loyaltyHistory: { title, amount, type: "earned", createdAt: new Date() } }
    });
};

// Genera un código de referido único. Se usa tanto al registrarse como para
// "reparar" cuentas viejas que se crearon antes de que existiera esta función.
const generateUniqueReferralCode = async () => {
    let code;
    let exists = true;
    while (exists) {
        code = `M503-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
        exists = await clientModel.findOne({ referralCode: code });
    }
    return code;
};


// GET /api/loyalty/mine — puntos, historial, código de referido y estado del cumpleaños
loyaltyController.getMyLoyalty = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        let client = await clientModel.findById(clientId)
            .select("name loyaltyPoints loyaltyHistory referralCode birthDate lastBirthdayClaimYear");

        // Cuenta creada antes del sistema de referidos: le generamos su código ahora
        if (!client.referralCode) {
            client.referralCode = await generateUniqueReferralCode();
            await client.save();
        }

        const sortedHistory = [...(client.loyaltyHistory || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Estado real del bono de cumpleaños, basado en la fecha guardada en el perfil
        let birthdayStatus = "no-date"; // no ha puesto su fecha de nacimiento
        if (client.birthDate) {
            const today = new Date();
            const birth = new Date(client.birthDate);
            const isBirthdayToday = today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();
            const alreadyClaimedThisYear = client.lastBirthdayClaimYear === today.getFullYear();

            if (alreadyClaimedThisYear) birthdayStatus = "claimed";
            else if (isBirthdayToday) birthdayStatus = "available";
            else birthdayStatus = "waiting";
        }

        return res.status(200).json({
            userName: client.name,
            points: client.loyaltyPoints || 0,
            history: sortedHistory.map(item => ({
                id: item._id,
                title: item.title,
                amount: item.amount,
                type: item.type,
                date: new Date(item.createdAt).toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric" })
            })),
            referralCode: client.referralCode,
            birthdayStatus,
            birthDate: client.birthDate
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// POST /api/loyalty/claim-birthday — 100 hojas, solo si hoy es su cumpleaños real y no lo ha reclamado este año
loyaltyController.claimBirthday = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const client = await clientModel.findById(clientId);

        if (!client.birthDate) {
            return res.status(400).json({ message: "Agrega tu fecha de nacimiento en tu perfil primero" });
        }

        const today = new Date();
        const birth = new Date(client.birthDate);
        const isBirthdayToday = today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();

        if (!isBirthdayToday) {
            return res.status(400).json({ message: "Este bono solo se puede reclamar el día de tu cumpleaños" });
        }

        if (client.lastBirthdayClaimYear === today.getFullYear()) {
            return res.status(400).json({ message: "Ya reclamaste tu bono de cumpleaños este año" });
        }

        const birthdayMethod = await getEarnMethod("birthday");
        if (!birthdayMethod?.isActive) {
            return res.status(400).json({ message: "El bono de cumpleaños no está disponible por ahora" });
        }

        client.lastBirthdayClaimYear = today.getFullYear();
        await client.save();
        await grantPoints(clientId, birthdayMethod.points, "Bono de cumpleaños");

        return res.status(200).json({ message: `¡Feliz cumpleaños! Se agregaron ${birthdayMethod.points} hojas a tu cuenta.` });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// GET /api/loyalty/rewards — catálogo real (solo activas y vigentes), con "redeemed" si ya la canjeó
loyaltyController.getRewardsCatalog = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);

        const now = new Date();
        const rewards = await rewardModel.find({
            isActive: true,
            $and: [
                { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
                { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] },
            ]
        }).sort({ createdAt: -1 });

        let myRedemptions = [];
        if (clientId) {
            myRedemptions = await redemptionModel.find({ clientId });
        }

        const catalog = rewards.map(reward => ({
            id: reward._id,
            title: reward.title,
            description: reward.description,
            cost: reward.cost,
            category: reward.category,
            type: reward.type,
            discountPercent: reward.discountPercent,
            image: reward.image,
            // Los cupones y envíos gratis SÍ se pueden canjear más de una vez (cada
            // canje genera su propio código y descuenta hojas de nuevo). Solo los
            // productos físicos se limitan a una vez por cliente, porque son
            // entrega física real y no algo que tenga sentido acumular.
            redeemed: reward.type === "product"
                ? myRedemptions.some(r => r.rewardId?.toString() === reward._id.toString())
                : false
        }));

        return res.status(200).json(catalog);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// POST /api/loyalty/redeem — canjea una recompensa real, descuenta hojas y genera código si aplica
loyaltyController.redeemReward = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const { rewardId } = req.body;
        const reward = await rewardModel.findById(rewardId);

        if (!reward || !reward.isActive) {
            return res.status(404).json({ message: "Recompensa no encontrada o ya no está disponible" });
        }

        const now = new Date();
        if (reward.startDate && now < reward.startDate) {
            return res.status(400).json({ message: "Esta recompensa todavía no está disponible" });
        }
        if (reward.endDate && now > reward.endDate) {
            return res.status(400).json({ message: "Esta recompensa ya expiró" });
        }

        const client = await clientModel.findById(clientId);

        if ((client.loyaltyPoints || 0) < reward.cost) {
            return res.status(400).json({ message: "No tienes suficientes hojas para canjear esta recompensa" });
        }

        client.loyaltyPoints -= reward.cost;
        client.loyaltyHistory.push({ title: reward.title, amount: -reward.cost, type: "redeemed", createdAt: new Date() });
        await client.save();

        const needsCode = reward.type === "coupon" || reward.type === "shipping";
        const code = needsCode ? `M503-${crypto.randomBytes(3).toString("hex").toUpperCase()}` : undefined;

        // Vigencia real: 4 meses desde el canje. Solo aplica a coupon/shipping
        // (un producto físico no "vence", se coordina la entrega directamente).
        const expiresAt = needsCode
            ? new Date(new Date().setMonth(new Date().getMonth() + 4))
            : undefined;

        const redemption = await redemptionModel.create({
            clientId,
            rewardId: reward._id,
            title: reward.title,
            cost: reward.cost,
            type: reward.type,
            discountPercent: reward.discountPercent,
            code,
            expiresAt
        });

        // Si es un producto físico, avisar por correo que el canje se
        // registró y que la tienda se va a poner en contacto -- así el
        // cliente no se queda sin saber qué sigue mientras el admin
        // coordina la entrega. No se bloquea la respuesta si el correo
        // falla (el canje ya es válido de todas formas).
        if (reward.type === "product") {
            try {
                await sendEmail({
                    to: client.email,
                    subject: "¡Canjeaste tu recompensa!",
                    text: `Hola ${client.name}, canjeaste "${reward.title}". Nos pondremos en contacto contigo pronto para coordinar la entrega.`,
                    html: HTMLRedemptionEmail(client.name, reward.title)
                });
            } catch (emailError) {
                console.log("No se pudo enviar el correo de confirmación de canje:", emailError.message || emailError);
            }
        }

        return res.status(201).json(redemption);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// GET /api/loyalty/admin/redemptions — TODOS los canjes de producto físico
// (no cupones/envíos, esos no necesitan que el admin haga nada), con los
// datos de contacto del cliente para que el admin coordine la entrega.
loyaltyController.getProductRedemptionsAdmin = async (req, res) => {
    try {
        const redemptions = await redemptionModel
            .find({ type: "product" })
            .populate("clientId", "name lastName email phone address addresses")
            .sort({ createdAt: -1 });

        const enriched = redemptions.map(r => ({
            _id: r._id,
            title: r.title,
            cost: r.cost,
            delivered: r.delivered,
            createdAt: r.createdAt,
            client: r.clientId ? {
                name: `${r.clientId.name || ""} ${r.clientId.lastName || ""}`.trim(),
                email: r.clientId.email,
                phone: r.clientId.phone,
                address: r.clientId.address,
                addresses: r.clientId.addresses
            } : null
        }));

        return res.status(200).json(enriched);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// PATCH /api/loyalty/admin/redemptions/:id/delivered — el admin marca un
// canje de producto como ya entregado (después de coordinar con el
// cliente), para llevar control de cuáles faltan.
loyaltyController.markRedemptionDelivered = async (req, res) => {
    try {
        const { id } = req.params;
        const redemption = await redemptionModel.findById(id);

        if (!redemption) {
            return res.status(404).json({ message: "Canje no encontrado" });
        }
        if (redemption.type !== "product") {
            return res.status(400).json({ message: "Solo los canjes de producto físico se marcan como entregados" });
        }

        redemption.delivered = true;
        await redemption.save();

        return res.status(200).json(redemption);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// GET /api/loyalty/redemptions — mis canjes (para la pantalla de Cupones)
loyaltyController.getMyRedemptions = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const redemptions = await redemptionModel.find({ clientId }).sort({ createdAt: -1 });

        return res.status(200).json(redemptions);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default loyaltyController;
