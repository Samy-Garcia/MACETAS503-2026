import { Schema, model } from "mongoose";

// Antes el banner superior era un solo campo de texto dentro de Config.
// Ahora es su propia colección: se pueden guardar varios banners
// preparados de antemano (ej. "Envío gratis", "Black Friday", "Navidad")
// y activar el que corresponda sin perder los demás ni tener que
// reescribirlos cada vez.
const announcementBarSchema = new Schema({
    text: { type: String, required: true, trim: true, maxlength: 200 },

    // Solo un banner puede estar activo a la vez -- al activar uno, el
    // controlador desactiva los demás (mismo patrón que "isDefault" en
    // las direcciones del cliente).
    active: { type: Boolean, default: false },

    backgroundColor: { type: String, default: "#064225" }, // verde de marca por defecto
    textColor: { type: String, default: "#FFFFFF" },

    animation: {
        type: String,
        enum: ["none", "marquee", "pulse", "fadeIn", "bounce"],
        default: "none"
    }
}, {
    timestamps: true
});

export default model("AnnouncementBar", announcementBarSchema);
