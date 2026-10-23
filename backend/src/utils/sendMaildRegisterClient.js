const HTMLRegisterEmail = (randomCode) => {
    return `
       <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Código de Verificación</title>
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
                                  Verifica tu cuenta
                              </h1>
                          </td>
                      </tr>

                      <!-- MESSAGE -->
                      <tr>
                          <td style="padding-bottom: 30px;">
                              <p style="color: #555555; font-size: 15px; margin: 0; line-height: 1.5;">
                                  Hemos recibido una solicitud para verificar tu cuenta.
                                  Ingresa el siguiente código de verificación en la aplicación.
                              </p>
                          </td>
                      </tr>

                      <!-- CODE -->
                      <tr>
                          <td align="center" style="padding-bottom: 35px;">

                              <table border="0" cellspacing="0" cellpadding="0"
                                  style="background-color: #e8ece9; border-radius: 10px; width: 100%; max-width: 280px;">

                                  <tr>
                                      <td style="
                                          padding: 18px 0;
                                          font-size: 28px;
                                          font-weight: bold;
                                          color: #1a1a1a;
                                          letter-spacing: 12px;
                                          text-align: center;
                                          font-family: monospace;
                                      ">
                                          ${randomCode}
                                      </td>
                                  </tr>

                              </table>

                          </td>
                      </tr>

                      <!-- FOOTER -->
                      <tr>
                          <td style="border-top: 1px solid #eeeeee; padding-top: 25px;">

                              <p style="color: #888888; font-size: 12px; margin: 0; line-height: 1.6;">
                                  Este código expirará en 15 minutos.
                                  Si no solicitaste este correo, puedes ignorarlo de forma segura.
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

export default HTMLRegisterEmail;