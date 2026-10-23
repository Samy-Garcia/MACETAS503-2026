/**
  Un combo es un producto real con su PROPIO precio y stock (no se calcula
  ni se descuenta del stock de cada producto individual que lo compone --
  el admin es responsable de mantenerlo actualizado según cuántos combos
  ya armados tenga listos). Se compra en el carrito como un solo producto,
  exactamente igual que una maceta, vela, planta, u "otro".

  name
  description
  price
  stock
  image
  isActive
  items: [{ productType, productId, productName, quantity }] -- solo para
         MOSTRAR qué incluye el combo al cliente, no afecta el stock real
         de esos productos individuales.
 */

import { Schema, model } from "mongoose";

const comboSchema = new Schema({
    name: { type: String },
    description: { type: String },
    price: { type: Number },
    stock: { type: Number },
    image: { type: String },
    public_id: { type: String },
    images: {
        type: [{ url: String, public_id: String, _id: false }],
        default: []
    },
    isActive: { type: Boolean },
    items: {
        type: [{
            productType: { type: String, enum: ["maceta", "vela", "planta", "otro"], required: true },
            productId: { type: Schema.Types.ObjectId, required: true },
            productName: { type: String, required: true },
            quantity: { type: Number, default: 1 },
            _id: false
        }],
        default: []
    }
}, {
    timestamps: true,
    strict: false
});

export default model("Combo", comboSchema);
