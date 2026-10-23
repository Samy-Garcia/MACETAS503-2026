import { config } from "../../config.js";
import { sendEmailViaGmail } from "./mailerGmail.js";

// Envía un correo, con respaldo automático entre proveedores: si el que
// está configurado como principal (EMAIL_PROVIDER) falla por cualquier
// motivo (token vencido, cuenta no activada, lo que sea), se intenta
// automáticamente con el otro antes de darlo por fallido. Así un problema
// puntual de un solo proveedor (como el token de Gmail que caducó) ya no
// tumba por completo funciones importantes como recuperar contraseña.
//
// (Se intentó primero con Mailjet siguiendo la guía del instituto, pero
// canceló la cuenta por "riesgo potencial" antes de validarla. Brevo no
// tuvo ese problema, pero requirió activación manual de su soporte para
// cuentas nuevas antes de poder enviar correos transaccionales -- ya
// activada. Mientras tanto se usó Gmail como plan B, cuyo token puede
// caducar solo con el tiempo si la app de Google sigue en modo de prueba.)
//
// Uso: await sendEmail({ to, subject, html, text })
export const sendEmail = async ({ to, subject, html, text }) => {
    const principal = config.emailProvider === "gmail" ? "gmail" : "brevo";
    const respaldo = principal === "gmail" ? "brevo" : "gmail";

    const proveedores = {
        gmail: () => sendEmailViaGmail({ to, subject, html }),
        brevo: () => sendEmailViaBrevo({ to, subject, html, text })
    };

    try {
        return await proveedores[principal]();
    } catch (errorPrincipal) {
        console.log(`Falló el envío por ${principal}, se intenta con ${respaldo} como respaldo:`, errorPrincipal.message || errorPrincipal);
        try {
            return await proveedores[respaldo]();
        } catch (errorRespaldo) {
            console.log(`También falló el respaldo (${respaldo}):`, errorRespaldo.message || errorRespaldo);
            // Se relanza el error del proveedor PRINCIPAL (no el del
            // respaldo), porque normalmente es el más relevante para
            // diagnosticar -- si el principal es el que se supone debe
            // estar funcionando, ese es el que hay que arreglar primero.
            throw errorPrincipal;
        }
    }
};

const sendEmailViaBrevo = async ({ to, subject, html, text }) => {

    if (!config.brevo.apiKey) {
        throw new Error("Falta configurar BREVO_API_KEY en el .env");
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "api-key": config.brevo.apiKey
        },
        body: JSON.stringify({
            sender: { name: "Macetas503", email: config.email.user_email },
            to: [{ email: to }],
            subject,
            htmlContent: html,
            textContent: text
        })
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.log("Brevo error:", errorBody);
        throw new Error(errorBody.message || "No se pudo enviar el correo");
    }

    return response.json();
};
