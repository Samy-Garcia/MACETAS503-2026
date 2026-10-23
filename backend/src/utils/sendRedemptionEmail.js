// Correo que se manda automáticamente al cliente apenas canjea una
// recompensa de tipo "product" (un producto físico, no un cupón) -- avisa
// que el canje se registró y que la tienda se va a poner en contacto para
// coordinar la entrega. Mismo estilo visual que el resto de correos de
// Macetas503.
const HTMLRedemptionEmail = (nombreCliente, tituloRecompensa) => {
    return `
       <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Canjeaste una recompensa</title>
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
                                  ¡Canjeaste tu recompensa!
                              </h1>
                          </td>
                      </tr>

                      <!-- MESSAGE -->
                      <tr>
                          <td style="padding-bottom: 15px;">
                              <p style="color: #555555; font-size: 15px; margin: 0; line-height: 1.6;">
                                  Hola ${nombreCliente}, canjeaste con éxito:
                              </p>
                          </td>
                      </tr>

                      <!-- REWARD TITLE -->
                      <tr>
                          <td style="padding-bottom: 25px;">
                              <p style="color: #004d26; font-size: 18px; font-weight: 700; margin: 0; background-color: #f4f7f5; padding: 14px; border-radius: 12px;">
                                  ${tituloRecompensa}
                              </p>
                          </td>
                      </tr>

                      <!-- MESSAGE 2 -->
                      <tr>
                          <td style="padding-bottom: 30px;">
                              <p style="color: #555555; font-size: 15px; margin: 0; line-height: 1.6;">
                                  Como es un producto físico, nos vamos a poner en contacto contigo pronto para coordinar cómo te lo hacemos llegar. ¡Gracias por seguir cultivando con nosotros!
                              </p>
                          </td>
                      </tr>

                      <!-- FOOTER -->
                      <tr>
                          <td style="border-top: 1px solid #eeeeee; padding-top: 25px;">

                              <p style="color: #888888; font-size: 12px; margin: 0; line-height: 1.6;">
                                  Este es un correo automático de confirmación de tu canje en Macetas503.
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

export default HTMLRedemptionEmail;
