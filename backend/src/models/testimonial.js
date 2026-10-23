import { Schema, model } from "mongoose";

// Reseña general de la tienda (no de un producto específico), la que se
// muestra en "Clientes Felices" del inicio. Un cliente solo puede tener
// una — si vuelve a enviar, se actualiza la que ya tenía.
const testimonialSchema = new Schema({
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, unique: true },

    // Guardamos una copia del nombre/foto al momento de publicar, para que
    // el testimonio se siga viendo bien aunque el cliente luego cambie su
    // nombre o foto de perfil.
    clientName: { type: String, required: true },
    clientPhoto: { type: String, default: null },

    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true }

}, {
    timestamps: true,
    strict: false
});

export default model("Testimonial", testimonialSchema);
