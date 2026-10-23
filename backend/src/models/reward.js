import { Schema, model } from "mongoose";

const rewardSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    cost: { type: Number, required: true }, // hojas que cuesta
    category: { type: String, enum: ["Cupones", "Productos", "Envíos Gratis"], required: true },
    type: { type: String, enum: ["coupon", "product", "shipping"], required: true },
    discountPercent: { type: Number }, // solo aplica a type: "coupon"
    image: { type: String },
    public_id: { type: String },
    isActive: { type: Boolean, default: true },
    // Vigencia opcional: si ambas están vacías, la recompensa es indefinida
    startDate: { type: Date },
    endDate: { type: Date },
}, {
    timestamps: true
});

export default model("Reward", rewardSchema);
