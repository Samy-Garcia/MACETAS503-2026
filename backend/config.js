import dotenv from "dotenv";

//Ejecutamos la libreria dotenv
dotenv.config();

export const config = {
    db: {
        // La cadena de conexión ya no vive escrita en el código: viene del .env
        uri: process.env.DB_URI
    },
    JWT: {
        secret: process.env.JWT_SECRET_KEY
    },
    email: {
        user_email: process.env.USER_EMAIL,
        user_password: process.env.USER_PASSWORD
    },
    brevo: {
        // API HTTP de Brevo (reemplaza a Nodemailer/SMTP, bloqueado en Render free tier).
        // Se descartó Mailjet: canceló la cuenta por "riesgo potencial" antes de
        // siquiera terminar de validarla.
        apiKey: process.env.BREVO_API_KEY
    },
    // Plan B por si Brevo no activa el envío transaccional a tiempo: enviar
    // usando la API de Gmail (HTTPS, no la bloquea Render) con la cuenta de
    // Gmail que ya se tiene. Apagado por defecto (usa Brevo); para activarlo,
    // poner EMAIL_PROVIDER=gmail en las variables de entorno.
    emailProvider: process.env.EMAIL_PROVIDER || "brevo",
    gmailApi: {
        clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_OAUTH_REFRESH_TOKEN
    },
    cloudinary: {
        cloudinary_name: process.env.CLOUDINARY_CLOUD_NAME,
        cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
        cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET
    },
    google: {
    clientId: process.env.GOOGLE_CLIENT_ID
},
    // URLs públicas de las apps (sin "/" al final). FRONTEND_URL es a donde
    // Wompi regresa al cliente después del 3D Secure y además se permite en CORS.
    urls: {
        frontend: (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, ""),
        admin: (process.env.ADMIN_URL || "").replace(/\/+$/, "")
    },
    wompi:{
        grant_type: process.env.GRANT_TYPE,
        audience: process.env.AUDIENCE,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
    },
};

export default config;

//nota: el archivo config.js es el que contiene la configuración de la aplicación, como la conexión a la base de datos, las claves secretas para JWT, las credenciales de correo electrónico y las credenciales de Cloudinary. Esto permite separar la configuración de la aplicación del resto del código, lo cual es una buena práctica.