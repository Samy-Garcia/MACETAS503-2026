import { Schema, model } from "mongoose";

// Una solicitud de cotización para un evento (boda, cumpleaños, etc.):
// el cliente arma una lista de productos que le interesan con sus
// cantidades, llena los datos del evento, y el admin responde con un
// precio final y un mensaje -- coordinando el resto (pago, entrega) por
// fuera del sistema, como ya se hace con otras solicitudes similares.
const quotationSchema = new Schema({
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },

    eventType: { type: String, required: true },
    eventDate: { type: Date, required: true },
    guestCount: { type: Number },
    location: { type: String },
    locationLat: { type: Number },
    locationLng: { type: Number },
    specialRequirements: { type: String },

    items: {
        type: [{
            productType: { type: String, enum: ["maceta", "vela", "planta", "otro", "combo"], required: true },
            productId: { type: Schema.Types.ObjectId, required: true },
            productName: { type: String, required: true },
            productImage: { type: String },
            unitPrice: { type: Number, required: true },
            quantity: { type: Number, required: true, min: 1 },
            _id: false
        }],
        default: []
    },

    estimatedTotal: { type: Number, required: true },

    status: {
        type: String,
        enum: ["Pendiente", "Cotizada", "Rechazada"],
        default: "Pendiente"
    },

    finalPrice: { type: Number },
    adminMessage: { type: String }

}, {
    timestamps: true
});

export default model("Quotation", quotationSchema);
