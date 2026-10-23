import { Schema, model } from "mongoose";

const wishlistSchema = new Schema({
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    name: { type: String, required: true }, // Ej: "Mi Wishlist", "Regalos para Mamá"
    isDefault: { type: Boolean, default: false }, // la lista automática usada por el ❤️ rápido
    items: {
        type: [{
            productId: { type: Schema.Types.ObjectId, required: true },
            productType: { type: String, enum: ["maceta", "vela", "planta", "otro", "combo"], required: true },
            addedAt: { type: Date, default: Date.now }
        }],
        default: []
    }
}, {
    timestamps: true
});

export default model("Wishlist", wishlistSchema);
