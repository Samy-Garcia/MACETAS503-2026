import jsonwebtoken from "jsonwebtoken";

import { config } from "../../config.js";

import customOrderModel from "../models/customOrder.js";
import postModel from "../models/post.js";
import cartModel from "../models/cart.js";
import reviewModel from "../models/review.js";

const customOrderController = {};

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

// POST /api/custom-orders — el cliente pide personalizar una maceta que el
// admin marcó como personalizable
customOrderController.create = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const { productId, description } = req.body;

        if (!productId || !description || !description.trim()) {
            return res.status(400).json({ message: "Falta el producto o la descripción de lo que quieres personalizar" });
        }

        const product = await postModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        if (!product.isCustomizable) {
            return res.status(400).json({ message: "Este producto no admite personalización" });
        }

        const customOrder = await customOrderModel.create({
            clientId,
            productId,
            productName: product.name,
            productImage: product.image,
            description: description.trim(),
            referenceImage: req.file ? req.file.path : undefined,
            referenceImagePublicId: req.file ? req.file.filename : undefined
        });

        return res.status(201).json(customOrder);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// GET /api/custom-orders/mine — mis solicitudes de personalización (para
// la pestaña nueva en Mi Perfil)
customOrderController.getMine = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const customOrders = await customOrderModel.find({ clientId }).sort({ createdAt: -1 });

        // Si ya está "Completo", se busca el pedido real que contiene esta
        // personalización (para poder dejar reseña, igual que un producto
        // normal necesita saber a qué orden entregada pertenece) y si ya
        // se dejó una reseña de ese producto en ese pedido.
        const enriched = await Promise.all(customOrders.map(async (co) => {
            if (co.status !== "Completo") {
                return { ...co.toObject(), orderId: null, reviewed: false };
            }

            const order = await cartModel.findOne({
                clientId,
                status: "Completo",
                "products.customOrderId": co._id
            });

            let reviewed = false;
            if (order) {
                const existingReview = await reviewModel.findOne({
                    clientId,
                    orderId: order._id,
                    productId: co.productId
                });
                reviewed = !!existingReview;
            }

            return { ...co.toObject(), orderId: order?._id || null, reviewed };
        }));

        return res.status(200).json(enriched);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// GET /api/custom-orders/admin — TODAS las solicitudes, con datos de
// contacto del cliente, para la pantalla de administración
customOrderController.getAllAdmin = async (req, res) => {
    try {
        const customOrders = await customOrderModel
            .find()
            .populate("clientId", "name lastName email phone address addresses")
            .sort({ createdAt: -1 });

        const enriched = customOrders.map(co => ({
            _id: co._id,
            productName: co.productName,
            productImage: co.productImage,
            description: co.description,
            referenceImage: co.referenceImage,
            price: co.price ?? null,
            status: co.status,
            createdAt: co.createdAt,
            client: co.clientId ? {
                name: `${co.clientId.name || ""} ${co.clientId.lastName || ""}`.trim(),
                email: co.clientId.email,
                phone: co.clientId.phone,
                address: co.clientId.address,
                addresses: co.clientId.addresses
            } : null
        }));

        return res.status(200).json(enriched);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// PATCH /api/custom-orders/admin/:id/status — el admin cambia el estado de
// una solicitud (Pendiente → Aceptado/Rechazado → En proceso → Completo)
customOrderController.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // "En proceso" y "Completo" son automáticos (los pone el sistema:
        // al agregarse al carrito, y al completarse el PEDIDO real que la
        // contiene) -- este endpoint es para cambios manuales del admin,
        // así que no se permite forzarlos directo aquí. Antes sí se podía,
        // y dejaba solicitudes en "Completo" sin ningún pedido real detrás.
        const estadosPermitidosManualmente = ["Pendiente", "Aceptado", "Rechazado"];
        if (!estadosPermitidosManualmente.includes(status)) {
            return res.status(400).json({
                message: "\"En proceso\" y \"Completo\" los pone el sistema automáticamente, no se pueden forzar a mano"
            });
        }

        const customOrder = await customOrderModel.findById(id);
        if (!customOrder) {
            return res.status(404).json({ message: "Solicitud no encontrada" });
        }

        customOrder.status = status;
        await customOrder.save();

        return res.status(200).json(customOrder);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// PATCH /api/custom-orders/admin/:id/price — el admin define el precio de
// esta unidad ya personalizada (normalmente al aceptar la solicitud, pero
// se puede ajustar después mientras no esté ya agregada al carrito).
customOrderController.setPrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { price } = req.body;

        if (price === undefined || price === null || Number(price) < 0) {
            return res.status(400).json({ message: "El precio debe ser un número mayor o igual a 0" });
        }

        const customOrder = await customOrderModel.findById(id);
        if (!customOrder) {
            return res.status(404).json({ message: "Solicitud no encontrada" });
        }

        customOrder.price = Number(price);
        await customOrder.save();

        return res.status(200).json(customOrder);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default customOrderController;
