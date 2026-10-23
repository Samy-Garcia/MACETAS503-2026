import {Schema, model} from "mongoose";

  const postSchema = new Schema({
    name: { type: String},
    description: { type: String},
    dimensions: { type: String},
    weight: { type: String},
    // "Con orificio de drenaje" / "Sin orificio de drenaje" / "Con orificio
    // y plato incluido" -- dato importante para quien compra plantas, ya
    // que afecta cómo regarlas sin encharcar la raíz.
    drainageType: { type: String, default: "" },
    price: { type: Number},
    color: { type: String},
    image: { type: String},
    // Galería completa (la primera es siempre la misma que "image", para
    // no romper nada de lo que ya lee el campo "image" en todo el proyecto)
    images: {
        type: [{ url: String, public_id: String, _id: false }],
        default: []
    },
    stock: { type: Number},
    isActive: { type: Boolean},
    // Opciones que el cliente puede elegir en la página de producto.
    // No afectan precio ni stock (son solo variantes visuales/informativas).
    sizes: { type: [String], default: [] },           // Ej: ["Pequeña", "Mediana"]
    // Plantas reales que el cliente puede elegir para esta maceta (antes era
    // texto libre sin relación con el catálogo real de plantas)
    plantOptions: {
        type: [{ type: Schema.Types.ObjectId, ref: "Plants" }],
        default: []
    },
    // Velas reales que el cliente puede elegir para esta maceta (ej. la
    // misma maceta se vende vacía, con planta, o con vela -- mismo patrón
    // que plantOptions: no afecta precio ni stock de la maceta en sí, se
    // agrega como su propio producto aparte al carrito).
    candleOptions: {
        type: [{ type: Schema.Types.ObjectId, ref: "Candle" }],
        default: []
    },
    colorOptions: {
        type: [{ name: String, hex: String, _id: false }],
        default: []
    },
    // Si el admin marca esto, en la página del cliente aparece un botón
    // para pedir que se personalice (ej. texto o algo en la base) --
    // ver el modelo CustomOrder para las solicitudes reales.
    isCustomizable: { type: Boolean, default: false },
},{
    timestamps: true,
    strict: false
});

export default model("Post", postSchema);