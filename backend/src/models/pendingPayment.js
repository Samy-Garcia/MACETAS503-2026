import mongoose from "mongoose";

// Pago con 3D Secure iniciado pero todavía no confirmado. Sirve para que, al
// volver de la página del banco, el servidor sepa de quién es la transacción y
// por cuánto era, y no tenga que confiar en lo que diga la URL del navegador.
const pendingPaymentSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "client", required: true },
    idTransaccion: { type: String, required: true, unique: true },
    monto: { type: Number, required: true },
    // Se borra solo a las 3 horas
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 3 },
});

export default mongoose.models.pendingPayment || mongoose.model("pendingPayment", pendingPaymentSchema);
