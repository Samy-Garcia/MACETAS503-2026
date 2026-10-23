import { Schema, model } from "mongoose";

// Una solicitud real de personalización de un cliente sobre una maceta
// marcada como "isCustomizable" (ej. "que diga Familia García en la base").
// Reemplaza la maqueta de datos falsos que tenía antes la pantalla de
// "Órdenes Personalizadas" en el admin.
const customOrderSchema = new Schema({
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    // Nombre e imagen del producto se guardan aparte (no solo por referencia)
    // para que la solicitud siga siendo legible aunque el producto cambie
    // de nombre o se elimine más adelante.
    productName: { type: String, required: true },
    productImage: { type: String },
    description: { type: String, required: true },
    // Imagen de referencia opcional que el cliente puede subir (ej. una
    // foto de cómo quiere que se vea el texto/diseño)
    referenceImage: { type: String },
    referenceImagePublicId: { type: String },
    // Precio que el admin define para esta unidad ya personalizada (puede
    // ser distinto al precio normal del producto, según qué tan compleja
    // sea la personalización). Se llena al aceptar la solicitud, antes de
    // eso el cliente no puede agregarla al carrito.
    price: { type: Number },
    status: {
        type: String,
        enum: ["Pendiente", "Aceptado", "Rechazado", "En proceso", "Completo"],
        default: "Pendiente"
    }
}, {
    timestamps: true
});

export default model("CustomOrder", customOrderSchema);
