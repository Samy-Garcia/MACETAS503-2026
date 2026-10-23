
/*
campos client:
name
lastName
email
password
isActive
phone
address
*/
import { Schema, model } from "mongoose";

const clientSchema = new Schema({
    name: { type: String },
    lastName: { type: String },
    email: { type: String },
    password: { type: String },

    isActive: { type: Boolean },
    isVerified: { type: Boolean, default: false },

    phone: { type: String },
    address: { type: String },

    // Libreta de direcciones (varias, para el checkout y el perfil)
    addresses: {
        type: [{
            fullName: { type: String },
            addressLine: { type: String },
            department: { type: String },
            municipality: { type: String },
            phone: { type: String },
            isDefault: { type: Boolean, default: false },
            // Coordenadas capturadas del mapa al guardar la dirección. Sin
            // esto, una dirección guardada solo servía como texto de
            // referencia -- no se podía reutilizar para calcular el envío
            // en el checkout, que necesita un punto real en el mapa.
            lat: { type: Number },
            lng: { type: Number }
        }],
        default: []
    },

    // Programa de fidelidad
    loyaltyPoints: { type: Number, default: 0 },
    loyaltyHistory: {
        type: [{
            title: { type: String },
            amount: { type: Number },
            type: { type: String, enum: ["earned", "redeemed"] },
            createdAt: { type: Date, default: Date.now }
        }],
        default: []
    },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: Schema.Types.ObjectId, ref: "Client" },
    birthDate: { type: Date },
    lastBirthdayClaimYear: { type: Number },

    loginAttempts: { type: Number },
    timeOut: { type: Date },

    // Campos para autenticación con Google
    googleId: { type: String, default: null },
    photo: { type: String, default: null },
    // id de la foto en Cloudinary (solo fotos subidas por el cliente, no las de Google)
    photoPublicId: { type: String, default: null },
    provider: { type: String, default: "local" },


    acceptedTerms: {
        type: Boolean,
        default: false
    },

    // Tarjeta guardada para no tener que volver a escribir los datos en cada
    // compra. "tokenTarjeta" es el token reusable que devuelve Wompi al
    // tokenizar (POST /Tokenizacion) -- NUNCA se guarda el número completo
    // ni el CVV, y este campo nunca se manda de vuelta al frontend (ver
    // loginClientController.me, que lo excluye explícitamente). Solo hay
    // una tarjeta guardada a la vez: guardar una nueva reemplaza la anterior.
    savedCard: {
        tokenTarjeta: { type: String },
        maskedNumber: { type: String },
        cardHolderName: { type: String },
        expMonth: { type: Number },
        expYear: { type: Number },
        savedAt: { type: Date }
    }

}, {
    timestamps: true,
    strict: false
});

export default model("Client", clientSchema);