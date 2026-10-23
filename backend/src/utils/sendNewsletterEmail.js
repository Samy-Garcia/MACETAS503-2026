// Plantilla del correo que el admin manda a todos los suscriptores
// (anuncios de productos nuevos, ofertas, etc.) -- mismo estilo visual que
// el resto de correos de Macetas503 (logo, colores, tarjeta blanca
// redondeada), pero con título y mensaje libres en vez de un código fijo.
const HTMLNewsletterEmail = (titulo, mensaje) => {
    // El mensaje viene como texto plano del formulario del admin -- se
    // convierten los saltos de línea en <br> para que se vean igual en el
    // correo, y se escapan caracteres HTML básicos para que no se rompa el
    // correo si alguien escribe "<" o "&" sin querer.
    const escaparHTML = (texto) =>
        texto
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    const mensajeHTML = escaparHTML(mensaje).replace(/\n/g, "<br>");

    return `
       <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escaparHTML(titulo)}</title>
  </head>

  <body style="margin: 0; padding: 0; background-color: #f4f7f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">

      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f5; padding: 40px 20px;">
          <tr>
              <td align="center">

                  <table width="100%" border="0" cellspacing="0" cellpadding="0"
                      style="max-width: 500px; background-color: #ffffff; border-radius: 16px; padding: 40px; text-align: center;">

                      <!-- LOGO -->
                      <tr>
                          <td align="center" style="padding-bottom: 25px;">
                              <img
                                  src="https://res.cloudinary.com/dwco4jlia/image/upload/v1779086727/Dise%C3%B1o_sin_t%C3%ADtulo_2_ntxt6a.png"
                                  alt="MACETAS Logo"
                                  style="width: 60px; height: auto; display: block; border-radius: 50px;"
                              >
                          </td>
                      </tr>

                      <!-- TITLE -->
                      <tr>
                          <td style="padding-bottom: 15px;">
                              <h1 style="color: #004d26; font-size: 24px; font-weight: 700; margin: 0;">
                                  ${escaparHTML(titulo)}
                              </h1>
                          </td>
                      </tr>

                      <!-- MESSAGE -->
                      <tr>
                          <td style="padding-bottom: 30px;">
                              <p style="color: #555555; font-size: 15px; margin: 0; line-height: 1.6; text-align: left;">
                                  ${mensajeHTML}
                              </p>
                          </td>
                      </tr>

                      <!-- CTA -->
                      <tr>
                          <td align="center" style="padding-bottom: 10px;">
                              <a href="https://macetas-cfqv.vercel.app"
                                  style="display: inline-block; background-color: #004d26; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 14px 32px; border-radius: 50px;">
                                  Ver en la tienda
                              </a>
                          </td>
                      </tr>

                      <!-- FOOTER -->
                      <tr>
                          <td style="border-top: 1px solid #eeeeee; padding-top: 25px;">

                              <p style="color: #888888; font-size: 12px; margin: 0; line-height: 1.6;">
                                  Recibiste este correo porque te suscribiste a las novedades de Macetas503.
                              </p>

                          </td>
                      </tr>

                  </table>

              </td>
          </tr>
      </table>

  </body>
  </html>
    `;
};

export default HTMLNewsletterEmail;
