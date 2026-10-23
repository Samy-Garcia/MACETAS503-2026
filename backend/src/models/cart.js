/*
clientId
Productd[{
    postID,
    quantity
    subtotal
    },
    {
    plantsID,
    quantity
    subtotal},
    {
    candleID,
    quantity
    subtotal
    }
    ]
total
status
*/

import mongoose, {Schema, model} from 'mongoose';

const cartSchema = new Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    products: [{
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        },
        quantity: {
            type: Number,
        },
        subtotal: {
            type: Number,
        },
        // Precio por unidad ya con la oferta aplicada (si tenía una activa
        // al momento de agregarlo/actualizarlo). Sin esto, el carrito solo
        // podía mostrar el precio de catálogo, ignorando los descuentos.
        unitPrice: {
            type: Number,
        },
        // Color elegido por el cliente al agregarlo (solo aplica a macetas y
        // velas, que tienen colorOptions). Antes no se guardaba, así que
        // agregar el mismo producto en dos colores distintos los mezclaba
        // en una sola línea del carrito, sin ninguna forma de saber cuál
        // color se había pedido en realidad.
        color: {
            type: String
        },
        // Si este renglón viene de una solicitud de personalización ya
        // aceptada (ver CustomOrder), queda ligado aquí -- cada
        // personalización es SIEMPRE su propia línea, nunca se combina con
        // otras (ni con el mismo producto sin personalizar), porque cada
        // una tiene su propio precio y detalle.
        customOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CustomOrder'
        },
    
        candleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Candle'
        },
        quantity: {
            type: Number,
        },
        subtotal: {
            type: Number,
        },
    
        plantsId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plants'
        },
        otherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OtherProduct'
        },
        comboId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Combo'
        },
        quantity: {
            type: Number,
        },
        subtotal: {
            type: Number,
        }
    }],
    total: {type: Number,},
    status: {type: String},
    // Número de orden consecutivo, asignado al confirmar la compra (checkout).
    // Ver utils/orderCode.js. Los carritos activos no lo tienen todavía.
    orderNumber: { type: Number, index: true },
    // Momento exacto en que el cliente confirmó el pedido. createdAt es cuando
    // se creó el carrito, que puede ser mucho antes de comprar.
    orderedAt: { type: Date },
    // "shipping" = envío a domicilio (comportamiento de siempre, con mapa y
    // costo calculado). "pickup" = el cliente pasa a recogerlo él mismo a
    // una de las direcciones que guardó la emprendedora en Ajustes -- para
    // cuando ella no puede llevarlo a domicilio. Se guarda como copia
    // (nombre/dirección tal como estaban al momento del pedido) y no como
    // referencia, para que si luego el punto de recogida cambia de nombre o
    // se borra, el pedido ya confirmado no pierda esa información.
    deliveryMethod: { type: String, enum: ["shipping", "pickup"], default: "shipping" },
    pickupLocation: {
        name: { type: String },
        address: { type: String },
        lat: { type: Number },
        lng: { type: Number }
    },
    shippingAddress: { type: String },
    shippingLat: { type: Number },
    shippingLng: { type: Number },
    contactPhone: { type: String },
    // Costo real de envío calculado por distancia (ver ShippingMap.jsx en el
    // frontend). Antes no se guardaba, y la confirmación de pedido mostraba
    // un $2.00 fijo inventado en vez del monto real cobrado.
    shippingCost: { type: Number, default: 0 },
    freeShipping: { type: Boolean, default: false },
    couponCode: { type: String },

    // Cuando la dirección queda muy lejos o el viaje es demasiado
    // complicado, el admin puede pasar una orden de envío a domicilio a
    // recogida en tienda (ver ordersController.forcePickup). Estos dos
    // campos solo se usan para avisarle al cliente qué pasó y por qué --
    // no afectan órdenes que ya nacieron como "pickup" desde el checkout.
    deliveryChangedByAdmin: { type: Boolean, default: false },
    deliveryChangeReason: { type: String }
},{
    timestamps: true,
    strict: false
});

export default model('Cart', cartSchema);