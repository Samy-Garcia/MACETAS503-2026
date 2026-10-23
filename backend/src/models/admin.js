import {Schema, model} from "mongoose";

const adminSchema = new Schema({
    name: { type: String},
    email: { type: String},
    password: { type: String},
    isVerified: { type: Boolean},

    // Por seguridad, un admin recién registrado (y con su correo ya
    // verificado) NO puede iniciar sesión todavía -- necesita que otro
    // admin ya aprobado le dé acceso (ver registerAdminController y
    // loginAdminController). El primer admin que se registra en todo el
    // sistema se aprueba solo (no hay nadie más que pueda aprobarlo).
    isApproved: { type: Boolean, default: false },

    // Campos usados por la pantalla de Ajustes del panel admin
    photo: { type: String, default: null },
    public_id: { type: String, default: null },
    socialMedia: { type: String, default: null },
    twoFA: { type: Boolean, default: false },

},{
    timestamps: true,
    strict: false
});

export default model("Admin", adminSchema);
