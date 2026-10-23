import {Schema, model} from "mongoose";

const configSchema = new Schema({
    stockMin: { type: Number},
    temporarilyOutOfStock: {type : Date},
    storeLat: { type: Number },
    storeLng: { type: Number },
    pricePerKm: { type: Number },

    // Redes sociales oficiales de la tienda (no del admin individual --
    // antes vivía como un campo de texto suelto en el perfil de cada
    // admin, lo cual no tenía sentido si hay varios admins). Cada campo
    // es opcional; si se deja vacío, ese ícono no se muestra en el footer.
    socialMedia: {
        instagram: { type: String, default: "" },
        facebook: { type: String, default: "" },
        tiktok: { type: String, default: "" }
    },

    // Modo de cobro de envío: "fixed" (monto fijo) o "perKm" (tarifa × km).
    // El admin elige uno u otro, no se combinan.
    shippingMode: {
        type: String,
        enum: ["fixed", "perKm"],
        default: "perKm"
    },

    // Monto que se cobra cuando shippingMode === "fixed"
    fixedShippingCost: { type: Number, default: 0 },

    // Si el subtotal de la compra supera este monto, el envío es gratis,
    // sin importar el modo activo (fixed o perKm). null/0 = desactivado.
    freeShippingMinAmount: { type: Number, default: null },

    // Puntos de recogida en tienda: para cuando la emprendedora no puede
    // llevar el pedido a domicilio, el cliente puede pasar a recogerlo él
    // mismo a una de estas direcciones (sin costo de envío). Se guardan
    // varias porque puede haber más de una sucursal/punto de entrega. Cada
    // una se puede desactivar temporalmente sin necesidad de borrarla.
    pickupLocations: [{
        name: { type: String, required: true },
        address: { type: String, required: true },
        lat: { type: Number },
        lng: { type: Number },
        isActive: { type: Boolean, default: true }
    }],

    // Mensaje del banner que se muestra arriba de todo el sitio (ej: "Envío
    // gratis a compras mayores de $15.00"). Antes estaba escrito directo en
    // el código del Navbar y no se podía cambiar sin tocar el frontend.
    announcementText: { type: String, default: "" },
    // Imágenes del carrusel principal del inicio (antes era una sola imagen
    // fija en el código del frontend, ahora el admin puede subir varias).
    heroImages: [{
        url: { type: String, required: true },
        public_id: { type: String, required: true },
        // Posición (recorte) y zoom de la imagen en sí, para reencuadrarla
        // sin tener que volver a subir un archivo distinto -- útil cuando
        // el punto importante de la foto no queda centrado al recortarla
        // al tamaño del carrusel. imagePositionX/Y son porcentaje (0-100,
        // como object-position); imageZoom es porcentaje de acercamiento
        // (100 = normal, más alto = más zoom).
        imagePositionX: { type: Number, default: 50 },
        imagePositionY: { type: Number, default: 50 },
        imageZoom: { type: Number, default: 100 },
        // Texto opcional superpuesto sobre la imagen (como en TOFF). Si se
        // deja vacío, la imagen se muestra sola, sin nada encima. Título y
        // subtítulo tienen su PROPIA posición y tipografía, cada uno se
        // puede mover por separado en vez de moverse pegados como antes.
        title: { type: String, default: "" },
        titleFontFamily: { type: String, default: "" },
        titlePositionX: { type: Number, default: 50 },
        titlePositionY: { type: Number, default: 35 },

        subtitle: { type: String, default: "" },
        subtitleFontFamily: { type: String, default: "" },
        subtitlePositionX: { type: Number, default: 50 },
        subtitlePositionY: { type: Number, default: 50 },

        // Varios botones (antes solo se podía uno). Cada uno con su propio
        // texto, URL libre (interna como /macetas, o externa como
        // https://instagram.com/...), tipografía y posición.
        buttons: {
            type: [{
                text: { type: String, default: "" },
                link: { type: String, default: "" },
                fontFamily: { type: String, default: "" },
                positionX: { type: Number, default: 50 },
                positionY: { type: Number, default: 65 }
            }],
            default: []
        },

        // Campos de versiones anteriores, ya no se usan para renderizar
        // (se dejan aquí sin quitarlos por si alguna imagen vieja los
        // tenía guardados, para no perder ese dato de golpe).
        buttonText: { type: String, default: "" },
        buttonLink: { type: String, default: "" },
        buttonFontFamily: { type: String, default: "" },
        fontFamily: { type: String, default: "" },
        textPositionX: { type: Number, default: 50 },
        textPositionY: { type: Number, default: 50 }
    }],

    // Personalización del tema visual del sitio: color de marca, logo y
    // modo oscuro, editables desde Ajustes sin tocar código. primaryColor
    // sobreescribe la variable CSS --color-primary-700 en tiempo real en el
    // frontend; logoUrl reemplaza el logo por defecto en Navbar/Footer.
    theme: {
        primaryColor: { type: String, default: "#064225" },
        backgroundColor: { type: String, default: "#fcfdfc" },
        surfaceColor: { type: String, default: "#ffffff" },
        logoUrl: { type: String, default: "" },
        logoPublicId: { type: String, default: "" },
        darkMode: { type: Boolean, default: false },
        // "default" = paleta original de marca (ignora primaryColor/etc.).
        // "personalizado" = usa primaryColor/backgroundColor/surfaceColor.
        // "festivo" = usa la paleta fija de festivoKey (ver frontend/src/utils/festivos.js).
        mode: { type: String, enum: ["default", "personalizado", "festivo"], default: "default" },
        festivoKey: { type: String, default: "" }
    },

},{
    timestamps: true,
    strict: false
});

export default model("Config", configSchema);