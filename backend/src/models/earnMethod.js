import { Schema, model } from "mongoose";

const earnMethodSchema = new Schema({
    // Los 4 tipos "core" están ligados a lógica real del sistema (compra, reseña,
    // referido, cumpleaños). "custom" son entradas informativas que agrega el admin,
    // sin botón que regale puntos (evita el problema de puntos no verificables).
    actionType: { type: String, enum: ["purchase", "review", "referral", "birthday", "custom"], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    points: { type: Number, required: true }, // para "purchase": hojas por cada $1
    isActive: { type: Boolean, default: true },
    linkTo: { type: String }, // solo custom: a dónde navega el botón
    order: { type: Number, default: 0 },
}, {
    timestamps: true
});

export default model("EarnMethod", earnMethodSchema);
