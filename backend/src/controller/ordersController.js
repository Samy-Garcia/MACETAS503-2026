import cartModel from "../models/cart.js";
import reviewModel from "../models/review.js";
import customOrderModel from "../models/customOrder.js";
import configModel from "../models/config.js";
import { buildOrderCode, getOrderDate } from "../utils/orderCode.js";

// Estatus válidos para una orden en el panel de admin.
// Si necesitas agregar/quitar alguno, este es el único lugar que hay que tocar.
const VALID_STATUSES = ["Pendiente", "Aceptado", "En proceso", "Completo", "Rechazado"];

// array de funciones
const ordersController = {};

// El código de orden (#OR-000123) sale de utils/orderCode.js: usa el número
// consecutivo guardado en cada orden (y el _id solo para órdenes antiguas).

//GET /api/orders
// Lista todas las órdenes (carritos ya con clientId y productos) en el formato
// que espera la tabla de Ordenes.jsx en el frontend.
ordersController.getAll = async (req, res) => {
    try {
        // Solo carritos que ya fueron confirmados como pedido (no los que el
        // cliente todavía tiene abiertos mientras compra).
        const carts = await cartModel.find({ status: { $ne: "activo" } })
            .populate("clientId", "name lastName email")
            .populate("products.postId", "name price image")
            .populate("products.candleId", "name price image")
            .populate("products.plantsId", "name price image")
            .populate("products.otherId", "name price image")
            .populate("products.comboId", "name price image");

        // Más recientes primero, según cuándo el cliente confirmó el pedido
        // (createdAt es cuando se creó el carrito, que puede ser días antes).
        carts.sort((a, b) => new Date(getOrderDate(b)) - new Date(getOrderDate(a)));

        // Validación: Verificar si existen órdenes en la base de datos
        if (!carts || carts.length === 0) {
            return res.status(404).json({
                message: "No hay órdenes registradas"
            });
        }

        // "Cliente nuevo" vs "Cliente recurrente": una orden es de cliente
        // recurrente si ese mismo cliente ya había hecho un pedido ANTES (sin
        // contar los rechazados). Antes se contaba recorriendo la lista de la
        // más nueva a la más vieja, así que la compra más reciente de un
        // cliente salía como "nueva" y las anteriores como "recurrentes".
        const chronological = [...carts].sort((a, b) => new Date(getOrderDate(a)) - new Date(getOrderDate(b)));
        const seenClients = new Set();
        const recurringOrderIds = new Set();
        chronological.forEach(cart => {
            const key = cart.clientId?._id?.toString();
            if (!key) return;
            if (seenClients.has(key)) recurringOrderIds.add(cart._id.toString());
            if (cart.status !== "Rechazado") seenClients.add(key);
        });

        const response = carts.map(cart => {
            const items = cart.products.map(item => {
                const product = item.postId || item.candleId || item.plantsId || item.otherId || item.comboId;
                const productType = item.postId ? "maceta" : item.candleId ? "vela" : item.plantsId ? "planta" : item.otherId ? "otro" : "combo";
                return {
                    _id: item._id,
                    product,
                    productType,
                    quantity: item.quantity,
                    subtotal: item.subtotal,
                    color: item.color || null
                };
            });

            const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
            const firstProductName = items[0]?.product?.name || "Producto eliminado";
            const productLabel = items.length > 1
                ? `${firstProductName} +${items.length - 1}`
                : firstProductName;

            return {
                _id: cart._id,
                orderCode: buildOrderCode(cart),
                client: cart.clientId
                    ? { _id: cart.clientId._id, name: `${cart.clientId.name || ""} ${cart.clientId.lastName || ""}`.trim(), email: cart.clientId.email }
                    : null,
                clientType: recurringOrderIds.has(cart._id.toString()) ? "Cliente recurrente" : "Cliente nuevo",
                product: productLabel,
                items: totalItems,
                products: items, // detalle completo de cada producto (lo usa el modal "Ver Detalle")
                deliveryMethod: cart.deliveryMethod || "shipping",
                pickupLocation: cart.deliveryMethod === "pickup" ? {
                    name: cart.pickupLocation?.name || "",
                    address: cart.pickupLocation?.address || "",
                    lat: cart.pickupLocation?.lat,
                    lng: cart.pickupLocation?.lng
                } : null,
                shippingAddress: cart.shippingAddress || "",
                shippingLat: cart.shippingLat,
                shippingLng: cart.shippingLng,
                contactPhone: cart.contactPhone || "",
                total: cart.total,
                status: cart.status || "Pendiente",
                // Si el admin pasó esta orden de envío a domicilio a
                // recogida en tienda (ver forcePickup), el frontend usa
                // estos dos campos para avisarle al cliente y mostrar el
                // motivo.
                deliveryChangedByAdmin: !!cart.deliveryChangedByAdmin,
                deliveryChangeReason: cart.deliveryChangeReason || "",
                createdAt: getOrderDate(cart),
                updatedAt: cart.updatedAt
            };
        });

        return res.status(200).json(response);
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

//PATCH /api/orders/:id/status
// El admin solo cambia el estatus de la orden (Pendiente/Aceptado/En proceso/Completo/Rechazado).
// No usa el PUT genérico de cartController porque ese exige reenviar todo el arreglo de products.
ordersController.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validación: Verificar que el ID sea un string válido
        if (!id || typeof id !== 'string') {
            return res.status(400).json({
                message: "El ID de la orden no es válido"
            });
        }

        // Validación: Verificar que el status esté presente en la solicitud
        if (!status) {
            return res.status(400).json({
                message: "El status es obligatorio"
            });
        }

        // Validación: Verificar que el status sea un string
        if (typeof status !== 'string') {
            return res.status(400).json({
                message: "El status debe ser un texto"
            });
        }

        // Validación: Verificar que el status sea uno de los valores permitidos
        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({
                message: `Estatus inválido. Debe ser uno de: ${VALID_STATUSES.join(", ")}`
            });
        }

        const order = await cartModel.findById(id);

        if (!order) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        // Validación: Verificar que la orden tenga un status previo válido
        if (!order.status) {
            return res.status(400).json({
                message: "La orden no tiene un status válido para actualizar"
            });
        }

        // Validación: Verificar que el nuevo status sea diferente al actual
        if (order.status === status) {
            return res.status(400).json({
                message: `La orden ya tiene el status "${status}"`
            });
        }

        order.status = status;
        await order.save();

        // Si el pedido ya se entregó, cualquier personalización que venga
        // en ese pedido (ver customOrderId en cada producto) pasa también
        // a "Completo" -- así el cliente puede dejar reseña de esa unidad
        // personalizada igual que con un producto normal.
        if (status === "Completo") {
            const customOrderIds = order.products
                .map(item => item.customOrderId)
                .filter(Boolean);

            if (customOrderIds.length > 0) {
                await customOrderModel.updateMany(
                    { _id: { $in: customOrderIds } },
                    { $set: { status: "Completo" } }
                );
            }
        }

        return res.status(200).json({ message: "Estado de la orden actualizado exitosamente", order });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

//PATCH /api/orders/:id/force-pickup
// Pasa una orden de "envío a domicilio" a "recogida en tienda" -- para
// cuando la dirección queda muy lejos o el viaje es demasiado complicado
// y la emprendedora no puede llevarlo. El cliente ve el cambio (y el
// motivo) la próxima vez que revise su pedido.
ordersController.forcePickup = async (req, res) => {
    try {
        const { id } = req.params;
        const { pickupLocationId, reason } = req.body;

        // Validación: Verificar que el ID sea un string válido
        if (!id || typeof id !== 'string') {
            return res.status(400).json({
                message: "El ID de la orden no es válido"
            });
        }

        // Validación: el punto de recogida es obligatorio
        if (!pickupLocationId || typeof pickupLocationId !== 'string') {
            return res.status(400).json({
                message: "Debes elegir un punto de recogida"
            });
        }

        // Validación: el motivo es obligatorio -- el cliente necesita saber
        // por qué ya no se le puede llevar su pedido a domicilio.
        const cleanReason = (reason || "").trim();
        if (!cleanReason) {
            return res.status(400).json({
                message: "Debes indicar el motivo (ej: la dirección queda fuera de la zona de cobertura)"
            });
        }

        const order = await cartModel.findById(id);

        if (!order) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        // Validación: solo tiene sentido para órdenes que todavía son de envío
        if (order.deliveryMethod === "pickup") {
            return res.status(400).json({
                message: "Esta orden ya es de recogida en tienda"
            });
        }

        // Validación: no tiene caso cambiar una orden ya completada o rechazada
        if (order.status === "Completo" || order.status === "Rechazado") {
            return res.status(400).json({
                message: "No se puede cambiar el método de entrega de una orden completada o rechazada"
            });
        }

        const config = await configModel.findOne();
        const pickupLocation = config?.pickupLocations?.id(pickupLocationId);

        if (!pickupLocation) {
            return res.status(404).json({ message: "Ese punto de recogida no existe" });
        }

        if (!pickupLocation.isActive) {
            return res.status(400).json({ message: "Ese punto de recogida está desactivado" });
        }

        order.deliveryMethod = "pickup";
        // Se copia tal como está ahora (igual que cuando el cliente elige
        // recogida desde el checkout) para que si luego el punto de
        // recogida cambia de nombre/dirección, esta orden ya confirmada no
        // pierda la información con la que se le avisó al cliente.
        order.pickupLocation = {
            name: pickupLocation.name,
            address: pickupLocation.address,
            lat: pickupLocation.lat,
            lng: pickupLocation.lng
        };
        // Ya no aplica costo de envío -- el cliente lo recoge él mismo.
        order.shippingCost = 0;
        order.deliveryChangedByAdmin = true;
        order.deliveryChangeReason = cleanReason;

        await order.save();

        return res.status(200).json({
            message: "Orden cambiada a recogida en tienda",
            deliveryMethod: order.deliveryMethod,
            pickupLocation: order.pickupLocation,
            deliveryChangedByAdmin: order.deliveryChangedByAdmin,
            deliveryChangeReason: order.deliveryChangeReason
        });

    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

//DELETE /api/orders/:id
ordersController.delete = async (req, res) => {
    try {
        const { id } = req.params;

        // Validación: Verificar que el ID sea un string válido
        if (!id || typeof id !== 'string') {
            return res.status(400).json({
                message: "El ID de la orden no es válido"
            });
        }

        const order = await cartModel.findById(id);

        if (!order) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        // Validación: Verificar que la orden no esté en un estado que impida su eliminación
        if (order.status === "Completo") {
            return res.status(400).json({
                message: "No se puede eliminar una orden completada"
            });
        }

        // Validación: Verificar que la orden tenga productos antes de eliminarla
        if (!order.products || order.products.length === 0) {
            return res.status(400).json({
                message: "La orden no tiene productos asociados"
            });
        }

        await cartModel.findByIdAndDelete(id);
        return res.status(200).json({ message: "Orden eliminada exitosamente" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// GET /api/orders/bestsellers (público, lo consume "Más Vendidos" en la tienda)
// Suma las unidades vendidas de verdad (de órdenes confirmadas, sin contar
// las rechazadas) por producto, sin importar si es maceta, vela o planta,
// y devuelve el top ordenado de mayor a menor.
ordersController.getBestSellers = async (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 12, 30);

        const carts = await cartModel.find({ status: { $nin: ["activo", "Rechazado"] } })
            .populate("products.postId", "name price image stock")
            .populate("products.candleId", "name price image stock")
            .populate("products.plantsId", "name price image stock");

        // key -> { producto real + cuánto se ha vendido }
        const soldMap = new Map();

        carts.forEach(cart => {
            (cart.products || []).forEach(item => {
                const productDoc = item.postId || item.candleId || item.plantsId || item.otherId || item.comboId;
                if (!productDoc) return; // el producto ya no existe en el catálogo

                const productType = item.postId ? "maceta" : item.candleId ? "vela" : item.plantsId ? "planta" : item.otherId ? "otro" : "combo";
                const key = `${productType}-${productDoc._id}`;

                if (!soldMap.has(key)) {
                    soldMap.set(key, {
                        _id: productDoc._id,
                        name: productDoc.name,
                        price: productDoc.price,
                        image: productDoc.image,
                        stock: productDoc.stock,
                        productType,
                        sold: 0
                    });
                }

                soldMap.get(key).sold += item.quantity || 0;
            });
        });

        const bestSellers = Array.from(soldMap.values())
            .sort((a, b) => b.sold - a.sold)
            .slice(0, limit);

        // Calificación promedio real (de Review) por producto, para mostrarla
        // junto a "vendidos" en el catálogo. Se agrupa por productId+productType
        // en una sola consulta en vez de una por producto.
        const ratingAgg = await reviewModel.aggregate([
            {
                $group: {
                    _id: { productId: "$productId", productType: "$productType" },
                    avgRating: { $avg: "$rating" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const ratingMap = new Map();
        ratingAgg.forEach(r => {
            const key = `${r._id.productType}-${r._id.productId}`;
            ratingMap.set(key, {
                rating: Math.round(r.avgRating * 10) / 10,
                reviewCount: r.count
            });
        });

        bestSellers.forEach(p => {
            const key = `${p.productType}-${p._id}`;
            const ratingInfo = ratingMap.get(key);
            p.rating = ratingInfo ? ratingInfo.rating : null;
            p.reviewCount = ratingInfo ? ratingInfo.reviewCount : 0;
        });

        return res.status(200).json(bestSellers);
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default ordersController;