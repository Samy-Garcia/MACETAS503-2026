import { Schema, model } from "mongoose";

const redemptionSchema = new Schema({
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    rewardId: { type: Schema.Types.ObjectId, ref: "Reward", required: true },
    title: { type: String, required: true },
    cost: { type: Number, required: true }, // hojas que costó
    type: { type: String, enum: ["coupon", "product", "shipping"], required: true },
    discountPercent: { type: Number }, // solo aplica a type: "coupon"
    code: { type: String, unique: true, sparse: true }, // solo aplica a coupon/shipping (product no necesita código, se entrega físico)
    status: { type: String, enum: ["pending", "used"], default: "pending" },
    // Vigencia real (4 meses desde el canje, solo aplica a coupon/shipping).
    // Antes esta fecha solo se mostraba en el modal del cliente calculada
    // al vuelo, pero nunca se guardaba ni se validaba al hacer checkout.
    expiresAt: { type: Date },
    // Solo aplica a type: "product" (recompensas físicas) -- el admin lo
    // marca cuando ya coordinó y entregó el producto al cliente. No se usa
    // el campo "status" de arriba para esto porque ese ya tiene un
    // significado distinto (si un cupón/envío ya se aplicó en un pedido).
    delivered: { type: Boolean, default: false },
}, {
    timestamps: true
});

export default model("Redemption", redemptionSchema);
