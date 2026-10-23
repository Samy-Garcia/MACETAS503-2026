// Opciones de cookie centralizadas. El frontend (Vercel) y el backend
// (Render) viven en dominios distintos, así que esto es tráfico
// "cross-site" desde el punto de vista del navegador. Sin
// "sameSite: none" + "secure: true", los navegadores modernos (Chrome,
// Firefox, Safari) NO envían la cookie de vuelta en las peticiones
// fetch/XHR entre dominios — el login parecería funcionar (responde 200
// y guarda la cookie), pero la siguiente petición ya no la llevaría, y
// el usuario se vería "deslogueado" de inmediato.
//
// En local (NODE_ENV distinto de "production"), "secure: true" rompería
// las cookies porque el navegador las rechaza fuera de HTTPS (salvo
// localhost en Chrome, pero no es universal), así que ahí se usa
// "lax" + sin secure, que es lo normal para desarrollo en el mismo origen.
const isProd = () => process.env.NODE_ENV === "production";

// Para usar junto con maxAge al CREAR una cookie (login, registro, recuperación)
export const cookieOptions = (maxAge) => ({
    maxAge,
    httpOnly: true,
    secure: isProd(),
    sameSite: isProd() ? "none" : "lax"
});

// Para usar en res.clearCookie(): debe llevar los MISMOS atributos
// sameSite/secure con los que se creó, o el navegador no la reconoce
// como la misma cookie y no la borra.
export const clearCookieOptions = () => ({
    httpOnly: true,
    secure: isProd(),
    sameSite: isProd() ? "none" : "lax"
});
