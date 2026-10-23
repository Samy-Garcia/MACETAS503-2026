import express from "express";

// ========================================
// IMPORTAR RUTAS DE CLIENTES
// ========================================

import registerClientRoutes from "./src/routes/registerClient.js";
import loginClientRoutes from "./src/routes/loginClient.js";
import recoveryPasswordClientRoutes from "./src/routes/recoveryPasswordClient.js";
import postRoutes from "./src/routes/post.js";
import catalogRoutes from "./src/routes/catalog.js";
import newsletterRoutes from "./src/routes/newsletter.js";
import clientRoutes from "./src/routes/client.js";
import plantsRoutes from "./src/routes/plants.js";

// ========================================
// IMPORTAR RUTAS DE ADMINISTRADOR
// ========================================

import registerAdminRoutes from "./src/routes/registerAdmin.js";
import loginAdminRoutes from "./src/routes/loginAdmin.js";
import recoveryPasswordAdminRoutes from "./src/routes/recoveryPasswordAdmin.js";
import adminProfileRoutes from "./src/routes/adminProfile.js";

// ========================================
// IMPORTAR RUTAS DE CANDLES
// ========================================

import candlesRoutes from "./src/routes/candles.js";
import otherProductsRoutes from "./src/routes/otherProducts.js";
import comboRoutes from "./src/routes/combos.js";
import quotationRoutes from "./src/routes/quotations.js";

// ========================================
// OTRAS RUTAS
// ========================================

import servicesRoutes from "./src/routes/services.js";
import wishListRoutes from "./src/routes/wishlist.js";
import logoutRoutes from "./src/routes/logout.js";
import offersRoutes from "./src/routes/offers.js";

// ========================================
// RUTAS DE CARRITO Y FIDELIDAD
// ========================================

import cartRoutes from "./src/routes/cart.js";
import reviewRoutes from "./src/routes/reviews.js";
import customOrderRoutes from "./src/routes/customOrders.js";
import loyaltyRoutes from "./src/routes/loyalty.js";
import testimonialRoutes from "./src/routes/testimonials.js";
import rewardsRoutes from "./src/routes/rewards.js";
import earnMethodsRoutes from "./src/routes/earnMethods.js";
import announcementBarRoutes from "./src/routes/announcementBar.js";

// ========================================
// RUTAS DE ÓRDENES
// ========================================

import ordersRoutes from "./src/routes/orders.js";

// ========================================
// RUTAS DE CONFIGURACIÓN
// ========================================

import configRoutes from "./src/routes/config.js";

// ========================================
// SWAGGER
// ========================================

import swaggerUi from "swagger-ui-express";

import swaggerDocument from "./src/utils/macetas503-040-Macetas503-1.0-resolved (1).json" with {
    type: "json"
};

// ========================================
// MIDDLEWARES
// ========================================

import cors from "cors";
import config from "./config.js";
import cookieParser from "cookie-parser";
import limiter from "./src/middleware/limiter.js";

// ========================================
// RUTAS DEL MAPA
// ========================================

import rutaRoutes from "./src/routes/routess.js";


//rutasss de wompi
import wompiRoutes from "./src/routes/wompi.js";

// ========================================
// RUTA DE FLORA (IA - ADMIN)
// ========================================

import geminiRoutes from "./src/routes/gemini.js";

// ========================================
// RUTA DE FLORA CLIENTE (IA - CLIENTES)
// ========================================

import floraClientRoutes from "./src/routes/floraClientRoutes.js";

// ========================================
// CREAR APLICACIÓN EXPRESS
// ========================================

const app = express();

app.set('trust proxy', 1);


// ========================================
// CONFIGURACIÓN DE CORS
// ========================================

app.use(
    cors({
        origin: (origin, callback) => {

            if (!origin) {
                return callback(null, true);
            }

            const allowedLocal = [
                "http://localhost:5173",
                "http://localhost:5174"
            ];

            const isVercel =
                /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin);

            // Dominios propios (ej. dominio personalizado) por variable de entorno
            const extraOrigins = [
                config.urls.frontend,
                config.urls.admin,
                ...(process.env.CORS_ORIGINS || "").split(",").map((o) => o.trim().replace(/\/+$/, ""))
            ].filter(Boolean);

            if (allowedLocal.includes(origin) || isVercel || extraOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("No permitido por CORS: " + origin)
            );
        },

        credentials: true
    })
);


// ========================================
// COOKIE PARSER
// ========================================

app.use(cookieParser());


// ========================================
// JSON
// ========================================

app.use(express.json());


// ========================================
// RATE LIMITER (desactivado)
// ========================================

// app.use(limiter);


// ========================================
// RUTAS DE CLIENTES
// ========================================

app.use("/api/registerClient", registerClientRoutes);
app.use("/api/loginClient", loginClientRoutes);
app.use("/api/recoveryPasswordClient", recoveryPasswordClientRoutes);
app.use("/api/clients", clientRoutes);


// ========================================
// RUTAS DE ADMINISTRADOR
// ========================================

app.use("/api/registerAdmin", registerAdminRoutes);
app.use("/api/loginAdmin", loginAdminRoutes);
app.use("/api/recoveryPasswordAdmin", recoveryPasswordAdminRoutes);
app.use("/api/adminProfile", adminProfileRoutes);


// ========================================
// RUTAS DE CANDLES
// ========================================

app.use("/api/candles", candlesRoutes);
app.use("/api/others", otherProductsRoutes);
app.use("/api/combos", comboRoutes);
app.use("/api/quotations", quotationRoutes);


// ========================================
// RUTAS DE MACETAS / CATÁLOGO
// ========================================

app.use("/api/post", postRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/newsletter", newsletterRoutes);


// ========================================
// RUTAS DE PLANTAS
// ========================================

app.use("/api/plants", plantsRoutes);


// ========================================
// RUTAS DE SERVICIOS
// ========================================

app.use("/api/services", servicesRoutes);


// ========================================
// RUTA DE LISTA DE DESEOS
// ========================================

app.use("/api/wishlist", wishListRoutes);


// ========================================
// RUTA DE LOGOUT
// ========================================

app.use("/api/logout", logoutRoutes);


// ========================================
// RUTAS DE OFERTAS
// ========================================

app.use("/api/offers", offersRoutes);


// ========================================
// RUTAS DE CARRITO
// ========================================

app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/custom-orders", customOrderRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/earn-methods", earnMethodsRoutes);
app.use("/api/announcement-bars", announcementBarRoutes);


// ========================================
// RUTAS DE ÓRDENES
// ========================================

app.use("/api/orders", ordersRoutes);


// ========================================
// RUTAS DE CONFIGURACIÓN
// ========================================

app.use("/api/config", configRoutes);


// ========================================
// RUTA DEL MAPA
// ========================================

app.use("/api/ruta", rutaRoutes);
app.use("/api/wompi", wompiRoutes);


// ========================================
// RUTA DE FLORA (IA - ADMIN)
// ========================================

app.use("/api/flora", geminiRoutes);


// ========================================
// RUTA DE FLORA CLIENTE (IA - CLIENTES)
// ========================================

app.use("/api/flora-client", floraClientRoutes);


// ========================================
// DOCUMENTACIÓN SWAGGER
// ========================================

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);


// ========================================
// EXPORTAR APP
// ========================================

export default app;