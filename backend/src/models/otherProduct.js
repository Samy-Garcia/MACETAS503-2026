/**
  Categoría nueva para todo lo que no es ni maceta ni vela: portavasos,
  floreros, jarritos para lápices, figuras decorativas, letras, etc.
  Mismo esquema que candles.js, para que el resto del proyecto (carrito,
  reseñas, admin) pueda tratarlo con el mismo patrón ya conocido.

  name
  description
  price
  stock
  color
  image
  isActive
 */

import { Schema, model } from "mongoose";

const otherProductSchema = new Schema({
    name: { type: String },
    description: { type: String },
    price: { type: Number },
    stock: { type: Number },
    color: { type: String },
    image: { type: String },
    public_id: { type: String },
    // Galería completa (la primera es siempre la misma que "image", para
    // no romper nada de lo que lea el campo "image" en todo el proyecto)
    images: {
        type: [{ url: String, public_id: String, _id: false }],
        default: []
    },
    isActive: { type: Boolean },
    // Opciones que el cliente puede elegir en la página de producto.
    // No afectan precio ni stock (son solo variantes visuales/informativas).
    sizes: { type: [String], default: [] },
    colorOptions: {
        type: [{ name: String, hex: String, _id: false }],
        default: []
    }
}, {
    timestamps: true,
    strict: false
});

export default model("OtherProduct", otherProductSchema);
