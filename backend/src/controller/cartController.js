import jsonwebtoken from "jsonwebtoken";

import { config } from "../../config.js";

import cartModel from "../models/cart.js";
import clientModel from "../models/client.js";
import postModel from "../models/post.js";
import plantModel from "../models/plants.js";
import candleModel from "../models/candles.js";
import otherProductModel from "../models/otherProduct.js";
import comboModel from "../models/combo.js";
import redemptionModel from "../models/redemption.js";
import customOrderModel from "../models/customOrder.js";
import offersModel from "../models/offers.js"
import configModel from "../models/config.js";
import { getEarnMethod } from "./earnMethodsController.js";
import { grantPoints } from "./loyaltyController.js";
import { buildOrderCode, getNextOrderNumber, getOrderDate } from "../utils/orderCode.js";

//array de funciones
const cartController = {};

// Lee la cookie 'authCookie', la verifica, y devuelve el id del cliente logueado.
// Si no hay sesión válida de cliente, devuelve null (el endpoint responde 401).
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

// Según el tipo de producto, devuelve el modelo real y el nombre del campo
// que se usa en el arreglo 'products' del carrito (postId / candleId / plantsId).
const PRODUCT_CONFIG = {
    maceta: { model: postModel, field: "postId" },
    vela: { model: candleModel, field: "candleId" },
    planta: { model: plantModel, field: "plantsId" },
    otro: { model: otherProductModel, field: "otherId" },
    combo: { model: comboModel, field: "comboId" }
};

// Recalcula el total sumando los subtotales de todos los items
const recalculateTotal = (products) => products.reduce((sum, item) => sum + (item.subtotal || 0), 0);

// Si el producto tiene una oferta activa, devuelve el precio ya con el
// descuento aplicado; si no, devuelve el precio de catálogo tal cual.
// Las ofertas existen para "maceta", "vela" y "otro" (ver models/offers.js).
const getEffectivePrice = async (productType, productId, basePrice) => {
    if (productType !== "maceta" && productType !== "vela" && productType !== "otro") {
        return basePrice;
    }

    const offer = await offersModel.findOne({ productId, productType, status: true });
    if (!offer) return basePrice;

    const discounted = basePrice - (basePrice * offer.discountPercentage) / 100;
    return Number(discounted.toFixed(2));
};

// Convierte un carrito de Mongo (con postId/candleId/plantsId poblados) al
// formato plano que consume el frontend.
const formatCart = (cart) => ({
    _id: cart._id,
    clientId: cart.clientId,
    products: cart.products.map(item => ({
        _id: item._id,
        product: item.postId || item.candleId || item.plantsId || item.otherId || item.comboId,
        productType: item.postId ? "maceta" : item.candleId ? "vela" : item.plantsId ? "planta" : item.otherId ? "otro" : "combo",
        quantity: item.quantity,
        // Precio real por unidad (ya con la oferta aplicada si tenía una
        // al momento de agregarse). Si el item es de antes de este cambio
        // y no tiene unitPrice guardado, calculamos con subtotal/quantity.
        unitPrice: item.unitPrice ?? (item.quantity ? Number((item.subtotal / item.quantity).toFixed(2)) : 0),
        subtotal: item.subtotal,
        color: item.color || null,
        // Si este renglón viene de una personalización ya aceptada, se
        // manda su detalle (qué pidió el cliente) para que se pueda
        // mostrar en el carrito, checkout, confirmación y en el admin.
        customOrder: item.customOrderId ? {
            _id: item.customOrderId._id,
            description: item.customOrderId.description,
            referenceImage: item.customOrderId.referenceImage || null
        } : null
    })),
    total: cart.total,
    status: cart.status,
    deliveryMethod: cart.deliveryMethod || "shipping",
    pickupLocation: cart.deliveryMethod === "pickup" ? {
        name: cart.pickupLocation?.name || "",
        address: cart.pickupLocation?.address || "",
        lat: cart.pickupLocation?.lat,
        lng: cart.pickupLocation?.lng
    } : null,
    shippingAddress: cart.shippingAddress || "",
    contactPhone: cart.contactPhone || "",
    // Costo real de envío (calculado por distancia en el mapa de checkout).
    // No se suma a "total": "total" es la base sobre la que se otorgan hojas
    // por compra, y el envío no debe generar hojas.
    shippingCost: cart.shippingCost || 0,
    freeShipping: cart.freeShipping || false,
    couponCode: cart.couponCode || null,
    // Si el admin pasó este pedido de envío a domicilio a recogida en
    // tienda (dirección muy lejos o viaje demasiado complicado), se le
    // avisa al cliente con el motivo -- ver ordersController.forcePickup.
    deliveryChangedByAdmin: cart.deliveryChangedByAdmin || false,
    deliveryChangeReason: cart.deliveryChangeReason || "",
    orderCode: cart.status !== "activo" ? buildOrderCode(cart) : null,
    createdAt: getOrderDate(cart),
    updatedAt: cart.updatedAt
});

const populateCart = (query) => query
    .populate("products.postId", "name price image stock")
    .populate("products.candleId", "name price image stock")
    .populate("products.plantsId", "name price image stock")
    .populate("products.otherId", "name price image stock")
    .populate("products.comboId", "name price image stock")
    .populate("products.customOrderId", "description referenceImage");


// GET /api/cart/mine — el carrito ACTIVO del cliente logueado. Si no tiene
// ninguno todavía, se le crea uno vacío (así el frontend nunca ve un 404).
cartController.getMyCart = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión para ver tu carrito" });
        }

        let cart = await populateCart(cartModel.findOne({ clientId, status: "activo" }));

        if (!cart) {
            cart = await cartModel.create({ clientId, products: [], total: 0, status: "activo" });
        }

        return res.status(200).json(formatCart(cart));
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// POST /api/cart/add — agrega un producto al carrito activo del cliente.
// Si el producto ya estaba en el carrito, suma la cantidad en vez de duplicarlo.
cartController.addToCart = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión para agregar productos al carrito" });
        }

        const { productId, productType, quantity, color } = req.body;

        if (!productId || !productType || !quantity) {
            return res.status(400).json({ message: "productId, productType y quantity son obligatorios" });
        }

        const config = PRODUCT_CONFIG[productType];
        if (!config) {
            return res.status(400).json({ message: "Tipo de producto inválido" });
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({ message: "La cantidad debe ser un número entero mayor a 0" });
        }

        const product = await config.model.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        let cart = await cartModel.findOne({ clientId, status: "activo" });
        if (!cart) {
            cart = new cartModel({ clientId, products: [], total: 0, status: "activo" });
        }

        // Diferenciar por color: agregar la misma maceta/vela pero en un
        // color distinto debe quedar como una línea aparte del carrito, no
        // sumarse a la que ya existía de otro color. Los productos sin
        // color (plantas, o macetas/velas sin colorOptions) usan null.
        const normalizedColor = color || null;
        const existingItem = cart.products.find(item =>
            item[config.field]?.toString() === productId &&
            (item.color || null) === normalizedColor
        );

        const unitPrice = await getEffectivePrice(productType, productId, product.price);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            if (newQuantity > product.stock) {
                return res.status(400).json({ message: `Solo hay ${product.stock} unidades disponibles de "${product.name}"` });
            }

            existingItem.quantity = newQuantity;
            existingItem.unitPrice = unitPrice;
            existingItem.subtotal = Number((unitPrice * newQuantity).toFixed(2));
        } else {
            if (quantity > product.stock) {
                return res.status(400).json({ message: `Solo hay ${product.stock} unidades disponibles de "${product.name}"` });
            }

            cart.products.push({
                [config.field]: productId,
                quantity,
                unitPrice,
                subtotal: Number((unitPrice * quantity).toFixed(2)),
                color: normalizedColor
            });
        }

        cart.total = recalculateTotal(cart.products);
        await cart.save();

        const populated = await populateCart(cartModel.findById(cart._id));
        return res.status(200).json(formatCart(populated));
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// POST /api/cart/add-custom-order — agrega al carrito una personalización
// ya ACEPTADA y con precio definido por el admin. Cada personalización es
// siempre su propia línea (nunca se combina con otra, ni con el mismo
// producto sin personalizar) porque cada una tiene su propio precio y
// detalle. Al agregarse, la solicitud pasa a "En proceso" para que no se
// pueda volver a agregar por accidente.
cartController.addCustomOrderToCart = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión para agregar productos al carrito" });
        }

        const { customOrderId, quantity } = req.body;

        if (!customOrderId || !quantity) {
            return res.status(400).json({ message: "customOrderId y quantity son obligatorios" });
        }
        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({ message: "La cantidad debe ser un número entero mayor a 0" });
        }

        const customOrder = await customOrderModel.findOne({ _id: customOrderId, clientId });
        if (!customOrder) {
            return res.status(404).json({ message: "Solicitud de personalización no encontrada" });
        }
        if (customOrder.status !== "Aceptado") {
            return res.status(400).json({ message: "Esta solicitud todavía no está lista para agregarse al carrito" });
        }
        if (customOrder.price === undefined || customOrder.price === null) {
            return res.status(400).json({ message: "Todavía no se ha definido un precio para esta personalización" });
        }

        const product = await postModel.findById(customOrder.productId);
        if (!product) {
            return res.status(404).json({ message: "El producto de esta personalización ya no existe" });
        }
        if (quantity > product.stock) {
            return res.status(400).json({ message: `Solo hay ${product.stock} unidades disponibles de "${product.name}"` });
        }

        let cart = await cartModel.findOne({ clientId, status: "activo" });
        if (!cart) {
            cart = new cartModel({ clientId, products: [], total: 0, status: "activo" });
        }

        cart.products.push({
            postId: customOrder.productId,
            customOrderId: customOrder._id,
            quantity,
            unitPrice: customOrder.price,
            subtotal: Number((customOrder.price * quantity).toFixed(2))
        });

        cart.total = recalculateTotal(cart.products);
        await cart.save();

        customOrder.status = "En proceso";
        await customOrder.save();

        const populated = await populateCart(cartModel.findById(cart._id));
        return res.status(200).json(formatCart(populated));
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
cartController.updateCartItem = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const { itemId } = req.params;
        const { quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({ message: "La cantidad debe ser un número entero mayor a 0" });
        }

        const cart = await cartModel.findOne({ clientId, status: "activo" });
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        const item = cart.products.id(itemId);
        if (!item) {
            return res.status(404).json({ message: "Producto no encontrado en el carrito" });
        }

        const productType = item.postId ? "maceta" : item.candleId ? "vela" : item.plantsId ? "planta" : item.otherId ? "otro" : "combo";
        const config = PRODUCT_CONFIG[productType];
        const productId = item[config.field];
        const product = await config.model.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "El producto ya no existe" });
        }

        if (quantity > product.stock) {
            return res.status(400).json({ message: `Solo hay ${product.stock} unidades disponibles de "${product.name}"` });
        }

        const unitPrice = await getEffectivePrice(productType, productId, product.price);

        item.quantity = quantity;
        item.unitPrice = unitPrice;
        item.subtotal = Number((unitPrice * quantity).toFixed(2));

        cart.total = recalculateTotal(cart.products);
        await cart.save();

        const populated = await populateCart(cartModel.findById(cart._id));
        return res.status(200).json(formatCart(populated));
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// DELETE /api/cart/item/:itemId — quita un producto del carrito
cartController.removeFromCart = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión" });
        }

        const { itemId } = req.params;

        const cart = await cartModel.findOne({ clientId, status: "activo" });
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }

        const item = cart.products.id(itemId);
        if (!item) {
            return res.status(404).json({ message: "Producto no encontrado en el carrito" });
        }

        item.deleteOne();

        cart.total = recalculateTotal(cart.products);
        await cart.save();

        const populated = await populateCart(cartModel.findById(cart._id));
        return res.status(200).json(formatCart(populated));
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


// POST /api/cart/checkout — convierte el carrito activo en una orden real:
// valida stock, lo descuenta de cada producto, y cambia el status del carrito
// de "activo" a "Pendiente" (a partir de ahí, aparece en Ordenes.jsx del admin).
// No se pide ningún dato de pago: es un proyecto escolar sin pasarela real.
cartController.checkout = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión para confirmar tu pedido" });
        }

        const { shippingAddress, contactPhone, couponCode, shippingCost, shippingLat, shippingLng, deliveryMethod, pickupLocationId } = req.body;

        // "pickup" = el cliente pasa a recoger su pedido a una dirección que
        // guardó la emprendedora (para cuando ella no puede llevarlo a
        // domicilio). En ese caso no se pide dirección de envío ni mapa, y
        // el envío siempre es gratis. Cualquier otro valor (o ninguno) se
        // trata como el flujo de siempre, envío a domicilio.
        const isPickup = deliveryMethod === "pickup";

        let pickupLocationSnapshot = null;
        if (isPickup) {
            if (!pickupLocationId) {
                return res.status(400).json({ message: "Debes elegir un punto de recogida" });
            }

            const storeConfig = await configModel.findOne();
            const location = storeConfig?.pickupLocations?.id(pickupLocationId);

            if (!location || !location.isActive) {
                return res.status(400).json({ message: "Ese punto de recogida ya no está disponible, elige otro" });
            }

            pickupLocationSnapshot = { name: location.name, address: location.address, lat: location.lat, lng: location.lng };
        } else if (!shippingAddress || !shippingAddress.trim()) {
            return res.status(400).json({ message: "La dirección de envío es obligatoria" });
        }

        if (!contactPhone || !contactPhone.trim()) {
            return res.status(400).json({ message: "El teléfono de contacto es obligatorio" });
        }

        // Antes solo se revisaba que no viniera vacío, sin validar el formato
        // -- el frontend ya lo restringe, pero el backend debe validarlo
        // también por si se salta el frontend (herramientas de desarrollador).
        const phoneRegexCheckout = /^[0-9-]{8,12}$/;
        if (!phoneRegexCheckout.test(contactPhone.trim())) {
            return res.status(400).json({ message: "Número de teléfono inválido." });
        }

        // Antes se rechazaba cualquier shippingCost <= 0, pensando que un envío
        // en $0 significaba "nunca marcó el mapa". Pero un pedido que califica
        // para ENVÍO GRATIS también llega legítimamente en $0 -- y el frontend
        // ya impide enviar el formulario si nunca se marcó el mapa (el botón
        // queda deshabilitado hasta que el mapa calcula algo), así que aquí solo
        // hace falta rechazar valores realmente inválidos (undefined/null/NaN/negativo).
        // Si es recogida en tienda, el envío siempre es $0 y no se pide mapa.
        if (!isPickup && (shippingCost === undefined || shippingCost === null || isNaN(shippingCost) || Number(shippingCost) < 0)) {
            return res.status(400).json({ message: "Debes marcar tu ubicación en el mapa para calcular el envío" });
        }

        const cart = await cartModel.findOne({ clientId, status: "activo" });

        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ message: "Tu carrito está vacío" });
        }

        // Verificamos stock de TODOS los productos antes de descontar nada
        for (const item of cart.products) {
            const productType = item.postId ? "maceta" : item.candleId ? "vela" : item.plantsId ? "planta" : item.otherId ? "otro" : "combo";
            const config = PRODUCT_CONFIG[productType];
            const productId = item[config.field];
            const product = await config.model.findById(productId);

            if (!product) {
                return res.status(404).json({ message: "Uno de los productos de tu carrito ya no existe. Elimínalo para continuar." });
            }

            if (item.quantity > product.stock) {
                return res.status(400).json({ message: `Ya no hay suficiente stock de "${product.name}" (disponible: ${product.stock})` });
            }
        }

        // Validar cupón, si mandaron uno (debe ser del cliente, sin usar, y de tipo cupón/envío)
        let redemption = null;
        let freeShipping = false;
        if (couponCode && couponCode.trim()) {
            redemption = await redemptionModel.findOne({
                clientId,
                code: couponCode.trim().toUpperCase(),
                status: "pending"
            });

            if (!redemption) {
                return res.status(400).json({ message: "El código ingresado no es válido o ya fue usado" });
            }

            if (redemption.expiresAt && new Date() > redemption.expiresAt) {
                return res.status(400).json({ message: "Este cupón ya venció" });
            }

            freeShipping = redemption.type === "shipping";
        }

        // Todo válido: ahora sí descontamos el stock de cada producto
        for (const item of cart.products) {
            const productType = item.postId ? "maceta" : item.candleId ? "vela" : item.plantsId ? "planta" : item.otherId ? "otro" : "combo";
            const config = PRODUCT_CONFIG[productType];
            const productId = item[config.field];
            await config.model.findByIdAndUpdate(productId, { $inc: { stock: -item.quantity } });
        }

        // Aplicamos el descuento del cupón (si es de tipo "coupon") al total
        let finalTotal = cart.total;
        if (redemption && redemption.type === "coupon") {
            finalTotal = Number((cart.total - (cart.total * redemption.discountPercent) / 100).toFixed(2));
        }

        cart.status = "Pendiente";
        cart.orderNumber = await getNextOrderNumber();
        cart.orderedAt = new Date();
        cart.deliveryMethod = isPickup ? "pickup" : "shipping";
        if (isPickup) {
            cart.pickupLocation = pickupLocationSnapshot;
            cart.shippingAddress = "";
        } else {
            cart.shippingAddress = shippingAddress.trim();
            if (shippingLat !== undefined) cart.shippingLat = shippingLat;
            if (shippingLng !== undefined) cart.shippingLng = shippingLng;
        }
        cart.contactPhone = contactPhone.trim();
        cart.total = finalTotal;
        cart.freeShipping = isPickup ? true : freeShipping;
        cart.shippingCost = isPickup ? 0 : (freeShipping ? 0 : Number(shippingCost));
        if (redemption) cart.couponCode = redemption.code;
        await cart.save();

        if (redemption) {
            redemption.status = "used";
            await redemption.save();
        }

        // Hojas por esta compra real: "points" del mecanismo "purchase" = hojas por cada $1
        const purchaseMethod = await getEarnMethod("purchase");
        if (purchaseMethod?.isActive) {
            await grantPoints(clientId, Math.floor(finalTotal * purchaseMethod.points), `Compra ${buildOrderCode(cart)}`);
        }

        // Si es la PRIMERA compra de este cliente y alguien lo refirió, se le pagan sus hojas de referido
        const previousOrders = await cartModel.countDocuments({ clientId, status: { $ne: "activo" }, _id: { $ne: cart._id } });
        if (previousOrders === 0) {
            const client = await clientModel.findById(clientId);
            if (client?.referredBy) {
                const referralMethod = await getEarnMethod("referral");
                if (referralMethod?.isActive) {
                    await grantPoints(client.referredBy, referralMethod.points, "Referido de amigo");
                }
            }
        }

        const populated = await populateCart(cartModel.findById(cart._id));
        return res.status(201).json(formatCart(populated));
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// GET /api/cart/orders — historial de pedidos del cliente logueado (todo lo
// que ya no está "activo", o sea, todo lo que ya confirmó con checkout).
cartController.getMyOrders = async (req, res) => {
    try {
        const clientId = getLoggedClientId(req);
        if (!clientId) {
            return res.status(401).json({ message: "Debes iniciar sesión para ver tus pedidos" });
        }

        const carts = await populateCart(
            cartModel.find({ clientId, status: { $ne: "activo" } })
        );

        // Más recientes primero, según cuándo se confirmó el pedido (no cuándo
        // se creó el carrito).
        carts.sort((a, b) => new Date(getOrderDate(b)) - new Date(getOrderDate(a)));

        return res.status(200).json(carts.map(formatCart));
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};


cartController.getCart = async (req, res) => {
    try {

        const carts = await cartModel.find()
            .populate("clientId", "name email")
            .populate("products.postId", "name price image")
            .populate("products.candleId", "name price image")
            .populate("products.plantsId", "name price image");

        // Validación: Verificar si existen carritos en la base de datos
        if (!carts || carts.length === 0) {
            return res.status(404).json({
                message: "No hay carritos registrados"
            });
        }

        const response = carts.map(cart => {

            const products = cart.products.map(item => {

                return {
                    product: item.postId || item.candleId || item.plantsId,
                    quantity: item.quantity,
                    subtotal: item.subtotal
                };

            });

            return {
                _id: cart._id,
                clientId: cart.clientId,
                products,
                total: cart.total,
                status: cart.status,
                createdAt: cart.createdAt,
                updatedAt: cart.updatedAt
            };

        });

        return res.status(200).json(response);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
};

//insert
cartController.createCart = async (req, res) => {
    try {

        const { clientId, products, status } = req.body;

        // Validación: Verificar que clientId esté presente y sea un ID válido 
        if (!clientId) {
            return res.status(400).json({
                message: "El clientId es obligatorio"
            });
        }

        // Validación: Verificar que el cliente exista en la base de datos
        const clientExists = await clientModel.findById(clientId);
        if (!clientExists) {
            return res.status(404).json({
                message: "Cliente no encontrado"
            });
        }

        // Validación: Verificar que products sea un array y no esté vacío
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                message: "El carrito debe contener al menos un producto"
            });
        }

        // Validación: Verificar que el status sea válido (si se proporciona)
        const validStatuses = ["activo", "finalizado", "cancelado"];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Status inválido. Valores permitidos: activo, finalizado, cancelado"
            });
        }

        let total = 0;
        let newProducts = [];

        for (const item of products) {

            // Validación: Verificar que cada producto tenga al menos un tipo de ID
            if (!item.postId && !item.candleId && !item.plantsId) {
                return res.status(400).json({
                    message: "Cada producto debe tener un postId, candleId o plantsId"
                });
            }

            // Validación: Verificar que no tenga más de un tipo de ID (evitar ambigüedad)
            const idCount = [item.postId, item.candleId, item.plantsId].filter(id => id).length;
            if (idCount > 1) {
                return res.status(400).json({
                    message: "Un producto solo puede tener un tipo de ID (postId, candleId o plantsId)"
                });
            }

            // Validación: Verificar que la cantidad sea un número positivo
            if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
                return res.status(400).json({
                    message: "La cantidad debe ser un número mayor a 0"
                });
            }

            let productFound = null;
            let subtotal = 0;

            if (item.postId) {

                // Validación: Verificar que el postId sea un string válido 
                if (typeof item.postId !== 'string' || item.postId.length !== 24) {
                    return res.status(400).json({
                        message: "El postId debe ser un ID válido de MongoDB"
                    });
                }

                productFound = await postModel.findById(item.postId);

                if (!productFound) {
                    return res.status(404).json({
                        message: "Maceta no encontrada"
                    });
                }

                // Validación: Verificar que el precio del producto sea válido para el cálculo
                if (typeof productFound.price !== 'number' || productFound.price < 0) {
                    return res.status(500).json({
                        message: "El precio de la maceta no es válido"
                    });
                }

                subtotal = productFound.price * item.quantity;

                newProducts.push({
                    postId: item.postId,
                    quantity: item.quantity,
                    subtotal
                });

            } else if (item.candleId) {

                // Validación: Verificar que el candleId sea un string válido 
                if (typeof item.candleId !== 'string' || item.candleId.length !== 24) {
                    return res.status(400).json({
                        message: "El candleId debe ser un ID válido de MongoDB"
                    });
                }

                productFound = await candleModel.findById(item.candleId);

                if (!productFound) {
                    return res.status(404).json({
                        message: "Vela no encontrada"
                    });
                }

                // Validación: Verificar que el precio del producto sea válido para el cálculo
                if (typeof productFound.price !== 'number' || productFound.price < 0) {
                    return res.status(500).json({
                        message: "El precio de la vela no es válido"
                    });
                }

                subtotal = productFound.price * item.quantity;

                newProducts.push({
                    candleId: item.candleId,
                    quantity: item.quantity,
                    subtotal
                });

            } else if (item.plantsId) {

                // Validación: Verificar que el plantsId sea un string válido 
                if (typeof item.plantsId !== 'string' || item.plantsId.length !== 24) {
                    return res.status(400).json({
                        message: "El plantsId debe ser un ID válido de MongoDB"
                    });
                }

                productFound = await plantModel.findById(item.plantsId);

                if (!productFound) {
                    return res.status(404).json({
                        message: "Planta no encontrada"
                    });
                }

                // Validación: Verificar que el precio del producto sea válido para el cálculo
                if (typeof productFound.price !== 'number' || productFound.price < 0) {
                    return res.status(500).json({
                        message: "El precio de la planta no es válido"
                    });
                }

                subtotal = productFound.price * item.quantity;

                newProducts.push({
                    plantsId: item.plantsId,
                    quantity: item.quantity,
                    subtotal
                });

            } else {

                return res.status(400).json({
                    message: "El producto no tiene un tipo válido."
                });

            }

            total += subtotal;
        }

        // Validación: Verificar que el total calculado sea un número positivo
        if (total <= 0) {
            return res.status(400).json({
                message: "El total del carrito debe ser mayor a 0"
            });
        }

        const newCart = new cartModel({
            clientId,
            products: newProducts,
            total,
            status: status || "activo" // Validación: Asignar status por defecto si no se proporciona
        });

        await newCart.save();

        return res.status(201).json({
            message: "Carrito creado exitosamente",
            cart: newCart
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            message: "Error interno del servidor"
        });

    }
};

cartController.updateCart = async (req, res) => {
    try {

        const { id } = req.params;
        const { products, status } = req.body;

        // Validación: Verificar que el ID del carrito sea un string válido 
        if (typeof id !== 'string' || id.length !== 24) {
            return res.status(400).json({
                message: "El ID del carrito debe ser un ID válido de MongoDB"
            });
        }

        const cart = await cartModel.findById(id);

        if (!cart) {
            return res.status(404).json({
                message: "Carrito no encontrado"
            });
        }

        // Validación: Verificar que el status sea válido 
        const validStatuses = ["activo", "finalizado", "cancelado"];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Status inválido. Valores permitidos: activo, finalizado, cancelado"
            });
        }

        // Validación: Si se proporcionan productos, verificar que sea un array válido
        if (products) {
            if (!Array.isArray(products) || products.length === 0) {
                return res.status(400).json({
                    message: "El carrito debe contener al menos un producto"
                });
            }
        } else {
            // Si no se envían productos, mantener los existentes
            return res.status(400).json({
                message: "Debes proporcionar productos para actualizar el carrito"
            });
        }

        let total = 0;
        let newProducts = [];

        for (const item of products) {

            // Validación: Verificar que cada producto tenga al menos un tipo de ID
            if (!item.postId && !item.candleId && !item.plantsId) {
                return res.status(400).json({
                    message: "Cada producto debe tener un postId, candleId o plantsId"
                });
            }

            // Validación: Verificar que no tenga más de un tipo de ID (evitar ambigüedad)
            const idCount = [item.postId, item.candleId, item.plantsId].filter(id => id).length;
            if (idCount > 1) {
                return res.status(400).json({
                    message: "Un producto solo puede tener un tipo de ID (postId, candleId o plantsId)"
                });
            }

            // Validación: Verificar que la cantidad sea un número positivo
            if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
                return res.status(400).json({
                    message: "La cantidad debe ser un número mayor a 0"
                });
            }

            let productFound = null;
            let subtotal = 0;

            if (item.postId) {

                // Validación: Verificar que el postId sea un string válido 
                if (typeof item.postId !== 'string' || item.postId.length !== 24) {
                    return res.status(400).json({
                        message: "El postId debe ser un ID válido de MongoDB"
                    });
                }

                productFound = await postModel.findById(item.postId);

                if (!productFound) {
                    return res.status(404).json({
                        message: "Maceta no encontrada"
                    });
                }

                // Validación: Verificar que el precio del producto sea válido para el cálculo
                if (typeof productFound.price !== 'number' || productFound.price < 0) {
                    return res.status(500).json({
                        message: "El precio de la maceta no es válido"
                    });
                }

                subtotal = productFound.price * item.quantity;

                newProducts.push({
                    postId: item.postId,
                    quantity: item.quantity,
                    subtotal
                });

            } else if (item.candleId) {

                // Validación: Verificar que el candleId sea un string válido 
                if (typeof item.candleId !== 'string' || item.candleId.length !== 24) {
                    return res.status(400).json({
                        message: "El candleId debe ser un ID válido de MongoDB"
                    });
                }

                productFound = await candleModel.findById(item.candleId);

                if (!productFound) {
                    return res.status(404).json({
                        message: "Vela no encontrada"
                    });
                }

                // Validación: Verificar que el precio del producto sea válido para el cálculo
                if (typeof productFound.price !== 'number' || productFound.price < 0) {
                    return res.status(500).json({
                        message: "El precio de la vela no es válido"
                    });
                }

                subtotal = productFound.price * item.quantity;

                newProducts.push({
                    candleId: item.candleId,
                    quantity: item.quantity,
                    subtotal
                });

            } else if (item.plantsId) {

                // Validación: Verificar que el plantsId sea un string válido 
                if (typeof item.plantsId !== 'string' || item.plantsId.length !== 24) {
                    return res.status(400).json({
                        message: "El plantsId debe ser un ID válido de MongoDB"
                    });
                }

                productFound = await plantModel.findById(item.plantsId);

                if (!productFound) {
                    return res.status(404).json({
                        message: "Planta no encontrada"
                    });
                }

                // Validación: Verificar que el precio del producto sea válido para el cálculo
                if (typeof productFound.price !== 'number' || productFound.price < 0) {
                    return res.status(500).json({
                        message: "El precio de la planta no es válido"
                    });
                }

                subtotal = productFound.price * item.quantity;

                newProducts.push({
                    plantsId: item.plantsId,
                    quantity: item.quantity,
                    subtotal
                });

            }

            total += subtotal;
        }

        // Validación: Verificar que el total calculado sea un número positivo
        if (total <= 0) {
            return res.status(400).json({
                message: "El total del carrito debe ser mayor a 0"
            });
        }

        cart.products = newProducts;
        cart.total = total;
        cart.status = status || cart.status;

        await cart.save();

        return res.status(200).json({
            message: "Carrito actualizado exitosamente",
            cart
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
};

cartController.deleteCart = async (req, res) => {
    try {

        const { id } = req.params;

        // Validación: Verificar que el ID del carrito sea un string válido 
        if (typeof id !== 'string' || id.length !== 24) {
            return res.status(400).json({
                message: "El ID del carrito debe ser un ID válido de MongoDB"
            });
        }

        const cart = await cartModel.findById(id);

        if (!cart) {
            return res.status(404).json({
                message: "Carrito no encontrado"
            });
        }

        await cartModel.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Carrito eliminado exitosamente"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
};

export default cartController;

//nota: los métodos createCart, updateCart y deleteCart son endpoints de administración y no se usan en el frontend. Se agregaron para tener un CRUD completo del carrito, pero en la práctica el cliente solo interactúa con addToCart, updateCartItem, removeFromCart y checkout.