import jsonwebtoken from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

import { config } from "../../config.js";

import reviewModel from "../models/review.js";
import cartModel from "../models/cart.js";
import postModel from "../models/post.js";
import candleModel from "../models/candles.js";
import otherProductModel from "../models/otherProduct.js";
import comboModel from "../models/combo.js";
import { grantPoints } from "./loyaltyController.js";
import { getEarnMethod } from "./earnMethodsController.js";
import { buildOrderCode } from "../utils/orderCode.js";

const reviewController = {};

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

const PRODUCT_MODELS = { maceta: postModel, vela: candleModel, otro: otherProductModel, combo: comboModel };


// GET /api/reviews/reviewable — todos los productos de pedidos YA ENTREGADOS
// del cliente, indicando cuáles ya tienen reseña y cuáles no.
reviewController.getReviewableItems = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const deliveredOrders = await cartModel.find({ clientId, status: "Completo" })
            .populate("products.postId", "name price image")
            .populate("products.candleId", "name price image")
            .populate("products.otherId", "name price image")
            .populate("products.comboId", "name price image")
            .sort({ updatedAt: -1 });

        const myReviews = await reviewModel.find({ clientId });
        const reviewedKeys = new Set(myReviews.map(r => `${r.orderId}-${r.productId}`));

        const items = [];
        deliveredOrders.forEach(order => {
            order.products.forEach(item => {
                const product = item.postId || item.candleId || item.otherId || item.comboId;
                if (!product) return; // producto eliminado, no se puede reseñar

                const productType = item.postId ? "maceta" : item.candleId ? "vela" : item.otherId ? "otro" : "combo";
                const key = `${order._id}-${product._id}`;

                items.push({
                    orderId: order._id,
                    orderCode: buildOrderCode(order),
                    deliveredAt: order.updatedAt,
                    productId: product._id,
                    productType,
                    productName: product.name,
                    productImage: product.image,
                    reviewed: reviewedKeys.has(key)
                });
            });
        });

        return res.status(200).json(items);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// POST /api/reviews — crea una reseña (valida que el pedido sea del cliente y esté Completo)
reviewController.createReview = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const { orderId, productId, productType, rating, comment } = req.body;

        if (!orderId || !productId || !productType || !rating || !comment || !comment.trim()) {
            return res.status(400).json({ message: "Calificación y comentario son obligatorios" });
        }

        if (!PRODUCT_MODELS[productType]) {
            return res.status(400).json({ message: "Tipo de producto inválido" });
        }

        if (Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({ message: "La calificación debe estar entre 1 y 5" });
        }

        // El pedido debe ser del cliente que hace la petición, y debe estar Completo
        const order = await cartModel.findOne({ _id: orderId, clientId, status: "Completo" });
        if (!order) {
            return res.status(403).json({ message: "Solo puedes reseñar productos de pedidos ya entregados" });
        }

        const belongsToOrder = order.products.some(item =>
            (item.postId?.toString() === productId) || (item.candleId?.toString() === productId) || (item.otherId?.toString() === productId) || (item.comboId?.toString() === productId)
        );
        if (!belongsToOrder) {
            return res.status(400).json({ message: "Ese producto no pertenece a este pedido" });
        }

        // Si el renglón de este producto en el pedido venía de una
        // personalización (ver customOrderId en Cart), la reseña se marca
        // como de un producto personalizado -- no se confía en nada que
        // mande el frontend, se detecta aquí mismo con el pedido real.
        const isCustomized = order.products.some(item =>
            item.postId?.toString() === productId && item.customOrderId
        );

        const newReview = new reviewModel({
            clientId,
            orderId,
            productId,
            productType,
            rating,
            comment: comment.trim(),
            isCustomized,
            image: req.file ? req.file.path : undefined,
            public_id: req.file ? req.file.filename : undefined
        });

        await newReview.save();

        // Reseña real y verificada (viene de un pedido entregado de verdad)
        const reviewMethod = await getEarnMethod("review");
        if (reviewMethod?.isActive) {
            await grantPoints(clientId, reviewMethod.points, "Reseña de producto");
        }

        return res.status(201).json(newReview);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Ya dejaste una reseña para este producto en este pedido" });
        }
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// GET /api/reviews/mine — las reseñas del cliente logueado
reviewController.getMyReviews = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const reviews = await reviewModel.find({ clientId }).sort({ createdAt: -1 });

        const enriched = await Promise.all(reviews.map(async (review) => {
            const ProductModel = PRODUCT_MODELS[review.productType];
            const product = await ProductModel.findById(review.productId).select("name image");
            return { ...review.toObject(), product };
        }));

        return res.status(200).json(enriched);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// GET /api/reviews/product/:productType/:productId — reseñas públicas de un producto (para su página de detalle)
reviewController.getProductReviews = async (req, res) => {
    try {
        const { productType, productId } = req.params;

        const reviews = await reviewModel.find({ productType, productId })
            .populate("clientId", "name lastName")
            .sort({ createdAt: -1 });

        const average = reviews.length > 0
            ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
            : 0;

        return res.status(200).json({
            average,
            count: reviews.length,
            reviews: reviews.map(r => ({
                _id: r._id,
                rating: r.rating,
                comment: r.comment,
                image: r.image,
                isCustomized: r.isCustomized || false,
                clientName: r.clientId ? `${r.clientId.name} ${r.clientId.lastName}` : "Cliente",
                createdAt: r.createdAt
            }))
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// PUT /api/reviews/:id — editar mi propia reseña
reviewController.updateReview = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const { id } = req.params;
        const { rating, comment } = req.body;

        const review = await reviewModel.findOne({ _id: id, clientId });
        if (!review) {
            return res.status(404).json({ message: "Reseña no encontrada" });
        }

        if (rating !== undefined) {
            if (Number(rating) < 1 || Number(rating) > 5) {
                return res.status(400).json({ message: "La calificación debe estar entre 1 y 5" });
            }
            review.rating = rating;
        }

        if (comment !== undefined) {
            if (!comment.trim()) {
                return res.status(400).json({ message: "El comentario no puede estar vacío" });
            }
            review.comment = comment.trim();
        }

        if (req.file) {
            if (review.public_id) {
                await cloudinary.uploader.destroy(review.public_id);
            }
            review.image = req.file.path;
            review.public_id = req.file.filename;
        }

        await review.save();

        return res.status(200).json(review);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// DELETE /api/reviews/:id — eliminar mi propia reseña
reviewController.deleteReview = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const { id } = req.params;

        const review = await reviewModel.findOne({ _id: id, clientId });
        if (!review) {
            return res.status(404).json({ message: "Reseña no encontrada" });
        }

        if (review.public_id) {
            await cloudinary.uploader.destroy(review.public_id);
        }

        await reviewModel.findByIdAndDelete(id);

        return res.status(200).json({ message: "Reseña eliminada" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// GET /api/reviews/admin — TODAS las reseñas de producto, con el nombre e
// imagen del producto ya incluidos, para la pantalla de administración
reviewController.getAllForAdmin = async (req, res) => {
    try {
        const reviews = await reviewModel.find()
            .populate("clientId", "name lastName")
            .sort({ createdAt: -1 });

        const enriched = await Promise.all(reviews.map(async (review) => {
            const ProductModel = PRODUCT_MODELS[review.productType];
            const product = ProductModel ? await ProductModel.findById(review.productId).select("name image") : null;
            return {
                _id: review._id,
                productId: review.productId,
                productType: review.productType,
                productName: product?.name || "Producto eliminado",
                productImage: product?.image || null,
                rating: review.rating,
                comment: review.comment,
                image: review.image,
                isCustomized: review.isCustomized || false,
                clientName: review.clientId ? `${review.clientId.name} ${review.clientId.lastName}` : "Cliente",
                createdAt: review.createdAt
            };
        }));

        return res.status(200).json(enriched);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// DELETE /api/reviews/admin/:id — el admin puede borrar cualquier reseña de
// producto (a diferencia de deleteReview, que solo deja al cliente borrar
// la suya propia) -- por ejemplo, si alguien la usa solo para dañar la
// reputación del negocio, sin relación real con la compra.
reviewController.adminDeleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await reviewModel.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Reseña no encontrada" });
        }

        if (review.public_id) {
            await cloudinary.uploader.destroy(review.public_id);
        }

        await reviewModel.findByIdAndDelete(id);

        return res.status(200).json({ message: "Reseña eliminada" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default reviewController;
