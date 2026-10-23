import {Schema, model} from "mongoose";

const offersSchema = new Schema({
    // A qué producto real aplica esta oferta
    productId: { type: Schema.Types.ObjectId, required: true },
    productType: { type: String, enum: ["maceta", "vela", "otro"], required: true },

    // Porcentaje de descuento sobre el precio real del producto (1-100)
    discountPercentage: { type: Number, required: true },

    // Permite desactivar una oferta sin borrarla
    status: { type: Boolean, default: true },
},{
    timestamps: true,
    strict: false
});

export default model("Offers", offersSchema);
