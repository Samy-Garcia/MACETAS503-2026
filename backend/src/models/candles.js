/**
  name
  description
  scent
  size
  price
  stock
  color
  image
  isActive
 */

  import {Schema, model} from "mongoose";

  const candleSchema = new Schema({
    name: { type: String},
    description: { type: String},
    scent: { type: String},
    size: { type: String},
    price: { type: Number},
    stock: { type: Number},
    color: { type: String},
    image: { type: String},
    public_id: { type: String},
    // Galería completa (la primera es siempre la misma que "image", para
    // no romper nada de lo que ya lee el campo "image" en todo el proyecto)
    images: {
        type: [{ url: String, public_id: String, _id: false }],
        default: []
    },
    isActive: { type: Boolean},
    // Opciones que el cliente puede elegir en la página de producto.
    // No afectan precio ni stock (son solo variantes visuales/informativas).
    sizes: { type: [String], default: [] },           // Ej: ["Pequeña", "Mediana"]
    scents: { type: [String], default: [] },           // Ej: ["Lavanda", "Vainilla"]
    colorOptions: {
        type: [{ name: String, hex: String, _id: false }],
        default: []
    },
},{
    timestamps: true,
    strict: false
});

export default model("Candle", candleSchema);