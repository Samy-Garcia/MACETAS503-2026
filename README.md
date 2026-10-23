<img width="3780" height="1890" alt="Green Illustration Minimalist Community Gathering Banner (1)" src="https://github.com/user-attachments/assets/8d3ae46a-81c8-41ed-ac48-7ee2fea3d2f1" />

# 🌱 MACETAS 503

Tienda en línea para la venta de macetas, velas y plantas, con programa de fidelidad, gestión de pedidos con envío calculado por distancia real, y panel administrativo completo.

El proyecto está compuesto por **tres aplicaciones independientes** dentro de este mismo repositorio:

| Carpeta | Qué es | Tecnología |
|---|---|---|
| `backend/` | API REST | Node.js + Express + MongoDB |
| `frontend/` | Tienda en línea (cliente) | React + Vite |
| `frontendAdmin/` | Panel administrativo | React + Vite |

---

# Enlaces en vivo

- **Tienda (cliente):** https://macetas.vercel.app/
- **Panel administrativo:** https://macetas-nuhq.vercel.app/
- **API (backend):** https://macetas.onrender.com

> El backend está en el plan gratuito de Render: si no ha recibido tráfico en un rato, la primera petición puede tardar hasta ~50 segundos en responder mientras el servicio "despierta".

---

# Características

- Inicio de sesión (con correo/contraseña y con Google).
- Registro de clientes y de administradores, con verificación por código enviado por correo.
- Recuperación de contraseña mediante código de verificación.
- Catálogo de macetas, velas y plantas, con variantes (tamaño, color, planta) elegibles por el cliente.
- Carrito de compras y checkout con cálculo de envío por distancia real (mapa interactivo).
- Programa de fidelidad: hojas por compra, reseña, referido y cumpleaños; canje de cupones de descuento, envío gratis y productos.
- Buscador de productos (macetas, velas, plantas, otros y combos) que ignora tildes y mayúsculas.
- Pago con tarjeta mediante Wompi con 3D Secure, o con la tarjeta guardada en el perfil.
- Pedidos con número consecutivo (`#0001`, `#0002`…), estados unificados entre tienda y panel, y detección de clientes recurrentes.
- Foto de perfil con imagen por defecto cuando el usuario no tiene una.
- Wishlist, reseñas de producto y testimonios en la página de inicio.
- Cupones y ofertas configurables desde el panel admin.
- Panel administrativo: inventario (macetas/velas/plantas), órdenes, cupones, ofertas, reportes, ajustes de la tienda (mensaje del banner, carrusel de imágenes del inicio, ubicación y costo de envío).
- Rutas protegidas (cliente y admin por separado).
- Validaciones en cliente y servidor.
- Notificaciones mediante Toast / SweetAlert2.
- Diseño responsive.

---

# Tecnologías utilizadas

## Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT (JSON Web Token) para autenticación
- BcryptJS (hash de contraseñas)
- Cookie Parser
- Cors
- Dotenv
- Express Rate Limit (límite de solicitudes)
- Google Auth Library (login con Google)
- Multer + Multer Storage Cloudinary (subida de imágenes)
- Cloudinary (almacenamiento de imágenes)
- API HTTP de Brevo (envío de correos — no se usa SMTP porque Render bloquea los puertos SMTP salientes en el plan gratis)

## Frontend (tienda) y Frontend Admin (panel)

- React + Vite
- React Router DOM
- React Hook Form
- Tailwind CSS
- Lucide React (íconos)
- React Hot Toast / SweetAlert2 (notificaciones)
- Leaflet + React Leaflet (mapa de ubicación/envío)

Adicional solo en `frontend/` (tienda):

- @react-oauth/google (login con Google)
- Framer Motion (animaciones)
- React Phone Number Input
- Radix UI + Shadcn UI + class-variance-authority + clsx + tailwind-merge
- @fontsource-variable/geist

Adicional solo en `frontendAdmin/` (panel):

- Recharts (gráficas de reportes)

---

# Estructura del proyecto

```
MACETAS
│
├── backend
│   ├── src
│   │   ├── controller     # Lógica de cada recurso (auth, carrito, órdenes, etc.)
│   │   ├── middleware      # Autenticación JWT y límite de solicitudes
│   │   ├── models          # Esquemas de Mongoose
│   │   ├── routes          # Definición de endpoints por recurso
│   │   └── utils           # Cloudinary, envío de correos (Brevo), plantillas de email
│   ├── app.js               # Configuración de Express (CORS, middlewares, rutas)
│   ├── config.js            # Lee las variables de entorno (.env)
│   ├── database.js          # Conexión a MongoDB
│   └── index.js             # Punto de entrada (arranca el servidor)
│
├── frontend                 # Tienda en línea (cliente)
│   └── src
│       ├── api               # Llamadas al backend, organizadas por recurso
│       ├── components
│       ├── context           # Carrito, Wishlist, Perfil, Fidelidad
│       ├── hooks
│       ├── pages
│       └── App.jsx
│
├── frontendAdmin             # Panel administrativo
│   └── src
│       ├── api
│       ├── components
│       ├── context
│       ├── hooks
│       ├── pages
│       └── App.jsx
│
└── README.md
```

---

# Instalación

## 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
cd MACETAS
```

## 2. Instalar dependencias

Cada carpeta tiene su propio `package.json`, hay que instalar en las tres por separado:

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../frontendAdmin && npm install
```

---

# Variables de entorno

## Backend (`backend/.env`)

```env
# Puerto en el que corre el servidor localmente
PORT=4000

# Cadena de conexión a MongoDB (Atlas u otro)
DB_URI=

# Clave secreta para firmar los JWT de sesión
JWT_SECRET_KEY=

# URLs públicas de la tienda y del panel (sin "/" al final). FRONTEND_URL es a
# donde Wompi regresa al cliente después del 3D Secure (/pago-3ds) y ambas se
# permiten en CORS. CORS_ORIGINS: otros dominios separados por coma (opcional).
FRONTEND_URL=
ADMIN_URL=
CORS_ORIGINS=

# Wompi (panel.wompi.sv > tu aplicativo)
GRANT_TYPE=client_credentials
AUDIENCE=wompi_api
CLIENT_ID=
CLIENT_SECRET=

# Flora (asistente con IA, Gemini)
GEMINI_API_KEY=

# Cuenta remitente de los correos (código de verificación, recuperación, etc.)
USER_EMAIL=
USER_PASSWORD=

# API Key de Brevo (https://app.brevo.com/settings/keys/api)
# OJO: es la clave de "Claves API y MCP", NO la clave SMTP -- son distintas.
BREVO_API_KEY=

# Credenciales de Cloudinary (almacenamiento de imágenes)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Client ID de Google OAuth (login con Google)
GOOGLE_CLIENT_ID=
```

## Frontend (`frontend/.env`)

```env
# URL del backend. En local puede dejarse vacío (usa localhost:4000 por defecto).
# En producción (Vercel), la URL real del backend en Render.
VITE_API_URL=

# Client ID de Google OAuth (mismo valor que GOOGLE_CLIENT_ID del backend)
VITE_GOOGLE_CLIENT_ID=
```

## Frontend Admin (`frontendAdmin/.env`)

```env
# Igual que el de frontend/: URL del backend
VITE_API_URL=
```

---

# Ejecutar el proyecto

Cada aplicación se ejecuta por separado, en su propia terminal.

## Backend

```bash
cd backend
npm run dev
```

Corre en `http://localhost:4000` (con `nodemon`, se reinicia solo al guardar cambios).

## Frontend (tienda)

```bash
cd frontend
npm run dev
```

Corre en `http://localhost:5173`.

## Frontend Admin (panel)

```bash
cd frontendAdmin
npm run dev
```

Corre en `http://localhost:5174` (Vite asigna el siguiente puerto libre si el 5173 ya está en uso por el frontend).

---

# Despliegue

- **Backend:** Render (plan gratuito). El build corre `npm install` y arranca con `npm start` (`node index.js`).
- **Frontend:** Vercel, con "Root Directory" apuntando a la carpeta `frontend`. Necesita la variable de entorno `VITE_API_URL` configurada en el proyecto de Vercel con la URL del backend en Render.
- **Frontend Admin:** mismo proceso que el frontend, pero con "Root Directory" apuntando a `frontendAdmin`.

## Guía rápida para conectar todo con tus propias cuentas

Este repositorio **no incluye credenciales**: cada servicio se conecta con variables de entorno.

1. **MongoDB Atlas:** crea un clúster y pon la cadena de conexión en `DB_URI` (permite el acceso desde cualquier IP, `0.0.0.0/0`, para que Render pueda conectarse).
2. **Cloudinary, Brevo, Google OAuth, Gemini:** crea las cuentas/claves y llena las variables de `backend/.env.example`.
3. **Backend en Render:** Root Directory `backend`, Build `npm install`, Start `npm start`. Carga ahí **todas** las variables de `backend/.env.example`. Deja `FRONTEND_URL` y `ADMIN_URL` para el paso 5.
4. **Tienda y panel en Vercel:** un proyecto por carpeta (`frontend` y `frontendAdmin`) con `VITE_API_URL` = URL del backend en Render (la tienda además necesita `VITE_GOOGLE_CLIENT_ID`).
5. Vuelve a Render y pon `FRONTEND_URL` = URL de la tienda y `ADMIN_URL` = URL del panel (sin `/` al final); guarda para que se reinicie.
6. **Wompi:** en [panel.wompi.sv](https://panel.wompi.sv) crea un aplicativo y copia su `Client ID` y `Client Secret` a `CLIENT_ID` / `CLIENT_SECRET`. Mientras el aplicativo esté en modo **Desarrollo** no se hacen cobros reales; para cobrar de verdad hay que pasarlo a producción.

### Pago con 3D Secure (Wompi)

Con una tarjeta nueva, el checkout manda los datos al backend (`POST /api/wompi/iniciar3ds`), que crea la transacción en Wompi (`/TransaccionCompra/3Ds`) y devuelve la URL de verificación del banco. El cliente autoriza el pago allí y Wompi lo regresa a `FRONTEND_URL/pago-3ds`. Esa página le pregunta al backend (`POST /api/wompi/confirmar3ds`), que consulta a Wompi si la transacción fue aprobada y por el monto correcto; solo entonces se crea el pedido. La tarjeta guardada en el perfil se sigue cobrando directo con su token (sin 3DS). Si activas un webhook en Wompi, es opcional: el flujo actual no lo necesita.

Como el frontend (Vercel) y el backend (Render) están en dominios distintos, las cookies de sesión se configuran con `secure: true` y `sameSite: "none"` en producción (y `lax` sin `secure` en desarrollo local, ver `backend/src/utils/cookieOptions.js`).

---

# Seguridad

El sistema implementa:

- Contraseñas encriptadas con BcryptJS.
- Autenticación mediante JWT, guardado en cookies `httpOnly`.
- Límite de solicitudes HTTP (200 cada 5 minutos por IP) contra abuso/fuerza bruta.
- Validaciones del lado del cliente y del servidor.
- Protección de rutas privadas (cliente y admin por separado).
- CORS configurado para aceptar solo `localhost` (desarrollo), subdominios `*.vercel.app` y las URLs definidas en `FRONTEND_URL`, `ADMIN_URL` y `CORS_ORIGINS`.

---

# Responsive

La aplicación es compatible con:

- Computadoras
- Tablets
- Teléfonos móviles

---

# Convenciones de nomenclatura

## Backend

- Archivos de rutas y controladores → **camelCase**, con sufijo según su rol (`loginClientController.js`, `recoveryPasswordAdmin.js`, `earnMethods.js`).
- Modelos de Mongoose → **camelCase** en singular (`client.js`, `cart.js`, `redemption.js`).
- Funciones y variables → **camelCase** (`getEarnMethod`, `grantPoints`, `cleanEmail`).

## Frontend y Frontend Admin

- Componentes y páginas (archivos `.jsx`) → **PascalCase** (`Login.jsx`, `Navbar.jsx`, `LoyaltyProgram.jsx`).
- Hooks personalizados → **camelCase** con prefijo `use` (`useCrud.js`, `useToast.jsx`, `usePagination.js`).
- Funciones y variables → **camelCase** (`handleSubmit`, `fetchCatalog`, `isExpired`).
- Componentes React (uso en JSX) → **PascalCase** (`<Login />`, `<Navbar />`, `<RedeemModal />`).
- Constantes globales → **UPPER_SNAKE_CASE** cuando aplica (`API_BASE_URL`, `DEFAULT_ANNOUNCEMENT`).

---

# Equipo

Proyecto desarrollado como parte del Proyecto Técnico Científico (PTC) — Instituto Técnico Ricaldone, Tercer Año de Bachillerato, Especialidad de Desarrollo de Software.
