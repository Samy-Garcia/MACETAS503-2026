import { Schema, model } from "mongoose";

const reviewSchema = new Schema({
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    orderId: { type: Schema.Types.ObjectId, required: true }, // el carrito/orden del que viene esta reseña
    productId: { type: Schema.Types.ObjectId, required: true },
    productType: { type: String, enum: ["maceta", "vela", "otro", "combo"], required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    image: { type: String },
    public_id: { type: String },
    // Si esta reseña es de una unidad que se pidió personalizada (ver
    // CustomOrder), para poder mostrar una etiqueta "Personalizado" junto
    // a la reseña -- se detecta solo en el backend al crearla, no se
    // confía en nada que mande el cliente.
    isCustomized: { type: Boolean, default: false },
}, {
    timestamps: true
});

// Un cliente solo puede dejar UNA reseña por producto dentro de una misma orden
reviewSchema.index({ clientId: 1, orderId: 1, productId: 1 }, { unique: true });

export default model("Review", reviewSchema);
