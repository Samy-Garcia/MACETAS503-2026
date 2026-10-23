import { OAuth2Client } from "google-auth-library";
import { config } from "../../config.js";

// Envía correos usando la API de Gmail (HTTPS, no SMTP) con la cuenta de
// Gmail que ya usa el proyecto como remitente (USER_EMAIL). Se activa solo
// si EMAIL_PROVIDER=gmail en las variables de entorno; ver mailer.js.
//
// Requiere haber generado UNA VEZ un "refresh token" para esa cuenta de
// Gmail (ver GMAIL_API_SETUP.md para el paso a paso) y guardarlo junto con
// el Client ID / Client Secret de OAuth en las variables de entorno:
//   GOOGLE_OAUTH_CLIENT_ID
//   GOOGLE_OAUTH_CLIENT_SECRET
//   GOOGLE_OAUTH_REFRESH_TOKEN

const oAuth2Client = new OAuth2Client(
    config.gmailApi.clientId,
    config.gmailApi.clientSecret,
    "https://developers.google.com/oauthplayground" // redirect URI usado al generar el refresh token
);

// Codifica el "Subject" para que soporte tildes/ñ (los headers de correo
// crudo solo aceptan ASCII; esto es el formato estándar MIME encoded-word).
const encodeSubject = (subject) =>
    `=?UTF-8?B?${Buffer.from(subject, "utf-8").toString("base64")}?=`;

// Arma el correo en formato RFC 2822 crudo y lo codifica en base64url,
// que es el formato que exige la API de Gmail (campo "raw").
const buildRawMessage = ({ to, subject, html }) => {
    const message = [
        `From: Macetas503 <${config.email.user_email}>`,
        `To: ${to}`,
        `Subject: ${encodeSubject(subject)}`,
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=utf-8",
        "",
        html
    ].join("\r\n");

    return Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
};

export const sendEmailViaGmail = async ({ to, subject, html }) => {

    if (!config.gmailApi.clientId || !config.gmailApi.clientSecret || !config.gmailApi.refreshToken) {
        throw new Error("Faltan configurar GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REFRESH_TOKEN en el .env");
    }

    oAuth2Client.setCredentials({ refresh_token: config.gmailApi.refreshToken });

    // Pide un access_token nuevo usando el refresh_token guardado (los
    // access_token de Google expiran a la hora, el refresh_token no).
    const { token: accessToken } = await oAuth2Client.getAccessToken();

    if (!accessToken) {
        throw new Error("No se pudo obtener un access_token de Google (revisa el refresh_token)");
    }

    const raw = buildRawMessage({ to, subject, html });

    const response = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ raw })
        }
    );

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.log("Gmail API error:", errorBody);
        throw new Error(errorBody.error?.message || "No se pudo enviar el correo vía Gmail");
    }

    return response.json();
};
