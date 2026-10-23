// Correo que se manda automáticamente al cliente apenas pide una
// cotización -- avisa que la solicitud se registró y que la tienda se va
// a poner en contacto. Mismo estilo visual que el resto de correos de
// Macetas503.
const HTMLQuotationEmail = (nombreCliente, tipoEvento) => {
    return `
       <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Solicitud de cotización recibida</title>
  </head>

  <body style="margin: 0; padding: 0; background-color: #f4f7f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">

      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f5; padding: 40px 20px;">
          <tr>
              <td align="center">

                  <table width="100%" border="0" cellspacing="0" cellpadding="0"
                      style="max-width: 500px; background-color: #ffffff; border-radius: 16px; padding: 40px; text-align: center;">

                      <tr>
                          <td align="center" style="padding-bottom: 25px;">
                              <img
                                  src="https://res.cloudinary.com/dwco4jlia/image/upload/v1779086727/Dise%C3%B1o_sin_t%C3%ADtulo_2_ntxt6a.png"
                                  alt="MACETAS Logo"
                                  style="width: 60px; height: auto; display: block; border-radius: 50px;"
                              >
                          </td>
                      </tr>

                      <tr>
                          <td style="padding-bottom: 15px;">
                              <h1 style="color: #004d26; font-size: 24px; font-weight: 700; margin: 0;">
                                  ¡Recibimos tu solicitud!
                              </h1>
                          </td>
                      </tr>

                      <tr>
                          <td style="padding-bottom: 30px;">
                              <p style="color: #555555; font-size: 15px; margin: 0; line-height: 1.6;">
                                  Hola ${nombreCliente}, recibimos tu solicitud de cotización para tu evento (${tipoEvento}). Vamos a revisarla y nos pondremos en contacto contigo pronto con el precio final. ¡Gracias por pensar en nosotros para tu evento!
                              </p>
                          </td>
                      </tr>

                      <tr>
                          <td style="border-top: 1px solid #eeeeee; padding-top: 25px;">
                              <p style="color: #888888; font-size: 12px; margin: 0; line-height: 1.6;">
                                  Este es un correo automático de confirmación de tu solicitud en Macetas503.
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

export default HTMLQuotationEmail;
