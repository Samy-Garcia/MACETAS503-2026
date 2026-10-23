import mongoose from "mongoose";

// Número de orden consecutivo (1, 2, 3...). Antes el "código" se calculaba con
// los últimos 6 caracteres del _id de Mongo, que NO es único (esos caracteres
// son un contador que se reinicia cuando el servidor se reinicia) y además no
// da ninguna idea de cuántas órdenes hay ni cuál es más reciente.
//
// El contador vive en la colección "counters" y se incrementa con una sola
// operación atómica ($inc + upsert), así dos compras al mismo tiempo nunca
// reciben el mismo número.
export const getNextOrderNumber = async () => {
    const counters = mongoose.connection.collection("counters");
    const result = await counters.findOneAndUpdate(
        { _id: "orderNumber" },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" }
    );
    // Según la versión del driver, el documento viene directo o dentro de .value
    const doc = result && result.value !== undefined ? result.value : result;
    return doc.seq;
};

// Código legible: #OR-000123. Las órdenes viejas (de antes de este cambio) no
// tienen orderNumber, así que conservan el código anterior basado en el _id.
export const buildOrderCode = (cart) => {
    if (cart?.orderNumber) {
        return `#OR-${String(cart.orderNumber).padStart(6, "0")}`;
    }
    return `#OR-${cart._id.toString().slice(-6).toUpperCase()}`;
};

// Fecha en que el cliente confirmó el pedido. createdAt es cuando se creó el
// carrito (puede ser días antes de pagar), así que NO sirve para ordenar ni
// mostrar cuándo se hizo el pedido.
export const getOrderDate = (cart) => cart.orderedAt || cart.createdAt;
