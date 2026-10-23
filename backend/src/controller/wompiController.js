// Usamos el fetch nativo de Node 18+, NO node-fetch (nunca estuvo en
// package.json y tumbaba el backend al arrancar).
import { config } from "../../config.js";
import jsonwebtoken from "jsonwebtoken";
import clientModel from "../models/client.js";
import pendingPaymentModel from "../models/pendingPayment.js";

const wompiController = {};

// --- Helpers puros (no son handlers de Express) -- se usan tanto desde las
// rutas públicas de abajo como desde loginClientController (para guardar una
// tarjeta) y desde pagarConTarjetaGuardada (para cobrar sin re-pedir datos).
// Así el flujo real contra Wompi vive en un solo lugar.

export const generarTokenWompiInterno = async () => {
  const response = await fetch("https://id.wompi.sv/connect/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: config.wompi.grant_type,
      audience: config.wompi.audience,
      client_id: config.wompi.client_id,
      client_secret: config.wompi.client_secret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "No se pudo generar el token de Wompi.");
  }

  const data = await response.json();
  return data.access_token;
};

export const tokenizarTarjetaInterno = async ({ token, numeroTarjeta, cvv, mesVencimiento, anioVencimiento, nombreEnTarjeta }) => {
  const body = { numeroTarjeta, cvv, mesVencimiento, anioVencimiento };
  if (nombreEnTarjeta) body.nombreEnTarjeta = nombreEnTarjeta;

  const response = await fetch("https://api.wompi.sv/Tokenizacion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "No se pudo tokenizar la tarjeta.");
  }

  return response.json(); // { token, tarjetaEnmascarada }
};

const pagarTokenizadoInterno = async ({ token, formData }) => {
  const response = await fetch("https://api.wompi.sv/TransaccionCompra/TokenizadaSin3Ds", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "No se pudo procesar el pago.");
  }

  return response.json();
};

wompiController.generarToken = async (req, res) => {
  try {
    const access_token = await generarTokenWompiInterno();
    return res.status(200).json({ access_token });
  } catch (error) {
    console.error("error" + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// POST /Tokenizacion -> { numeroTarjeta, cvv, mesVencimiento, anioVencimiento, nombreEnTarjeta? }
// Devuelve { token, tarjetaEnmascarada }
wompiController.tokenizarTarjeta = async (req, res) => {
  try {
    const { token, numeroTarjeta, cvv, mesVencimiento, anioVencimiento, nombreEnTarjeta } = req.body;
    const data = await tokenizarTarjetaInterno({ token, numeroTarjeta, cvv, mesVencimiento, anioVencimiento, nombreEnTarjeta });
    return res.status(200).json(data);
  } catch (error) {
    console.error("error" + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// POST /TransaccionCompra/TokenizadaSin3Ds -> { monto, emailCliente, nombreCliente, tokenTarjeta }
// Devuelve { idTransaccion, esReal, esAprobada, codigoAutorizacion, mensaje, monto }
wompiController.paymentTest = async (req, res) => {
  try {
    const { token, formData } = req.body;

    const response = await fetch(
      "https://api.wompi.sv/TransaccionCompra/TokenizadaSin3Ds",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

wompiController.payment3DS = async (req, res) => {
  try {
    const { token, formData } = req.body;

    const response = await fetch("https://api.wompi.sv/TransaccionCompra/3Ds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Lee la cookie authCookie de cliente (misma lógica que loginClientController,
// repetida aquí a propósito -- cada controlador resuelve su propia identidad
// en vez de depender de un middleware compartido, siguiendo el patrón del
// resto del proyecto).
const getLoggedClientId = (req) => {
  const token = req.cookies.authCookie;
  if (!token) return null;

  try {
    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    if (decoded.userType !== "client") return null;
    return decoded.id;
  } catch (err) {
    return null;
  }
};

// POST /api/wompi/pagarConTarjetaGuardada -> { monto, emailCliente, nombreCliente }
// Cobra usando el token de la tarjeta que el cliente ya guardó en su perfil
// (ver loginClientController.savePaymentMethod) -- el token real nunca sale
// del servidor, el frontend solo manda el monto y los datos del comprador.
wompiController.pagarConTarjetaGuardada = async (req, res) => {
  try {
    const clientId = getLoggedClientId(req);
    if (!clientId) {
      return res.status(401).json({ message: "Debes iniciar sesión para pagar con tu tarjeta guardada" });
    }

    const { monto, emailCliente, nombreCliente } = req.body;

    if (!monto || !emailCliente || !nombreCliente) {
      return res.status(400).json({ message: "monto, emailCliente y nombreCliente son obligatorios" });
    }

    const client = await clientModel.findById(clientId);
    if (!client?.savedCard?.tokenTarjeta) {
      return res.status(400).json({ message: "No tienes ninguna tarjeta guardada" });
    }

    const token = await generarTokenWompiInterno();
    const data = await pagarTokenizadoInterno({
      token,
      formData: {
        monto,
        emailCliente,
        nombreCliente,
        tokenTarjeta: client.savedCard.tokenTarjeta,
      },
    });

    return res.status(200).json(data);
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: error.message || "Error interno del servidor" });
  }
};

// ======================= PAGO CON 3D SECURE =======================
// Flujo: 1) iniciarPago3DS manda la tarjeta a Wompi y devuelve una URL del
// banco; 2) el navegador va a esa URL, el cliente autoriza; 3) Wompi lo
// regresa a FRONTEND_URL/pago-3ds; 4) confirmarPago3DS le pregunta a Wompi
// (servidor a servidor) si el pago realmente fue aprobado.

const soloTexto = (v, max = 100) => String(v ?? "").trim().slice(0, max);

// POST /api/wompi/iniciar3ds
wompiController.iniciarPago3DS = async (req, res) => {
  try {
    const clientId = getLoggedClientId(req);
    if (!clientId) {
      return res.status(401).json({ message: "Debes iniciar sesión para pagar" });
    }

    const { numeroTarjeta, cvv, mesVencimiento, anioVencimiento, monto, nombre, apellido, email, telefono, direccion, ciudad } = req.body;

    const numero = String(numeroTarjeta || "").replace(/\D/g, "");
    const mes = Number(mesVencimiento);
    const anio = Number(anioVencimiento);
    const montoNum = Number(monto);

    if (numero.length < 13 || numero.length > 19) {
      return res.status(400).json({ message: "El número de tarjeta no es válido." });
    }
    if (!/^\d{3,4}$/.test(String(cvv || ""))) {
      return res.status(400).json({ message: "El código de seguridad (CVV) no es válido." });
    }
    if (!Number.isInteger(mes) || mes < 1 || mes > 12 || !Number.isInteger(anio) || anio < 2000) {
      return res.status(400).json({ message: "La fecha de vencimiento no es válida." });
    }
    if (!Number.isFinite(montoNum) || montoNum <= 0) {
      return res.status(400).json({ message: "El monto no es válido." });
    }
    if (!soloTexto(nombre) || !soloTexto(apellido) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(soloTexto(email))) {
      return res.status(400).json({ message: "Nombre, apellido y correo del titular son obligatorios." });
    }

    const token = await generarTokenWompiInterno();

    const response = await fetch("https://api.wompi.sv/TransaccionCompra/3Ds", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        tarjetaCreditoDebido: {
          numeroTarjeta: numero,
          cvv: String(cvv),
          mesVencimiento: mes,
          anioVencimiento: anio,
        },
        monto: Number(montoNum.toFixed(2)),
        urlRedirect: `${config.urls.frontend}/pago-3ds`,
        nombre: soloTexto(nombre),
        apellido: soloTexto(apellido),
        email: soloTexto(email),
        telefono: soloTexto(telefono, 20) || "00000000",
        // Wompi exige estos datos de facturación; si el cliente no los da, van valores por defecto.
        direccion: soloTexto(direccion, 200) || "El Salvador",
        ciudad: soloTexto(ciudad) || "San Salvador",
        idPais: "SV",
        idRegion: "SV-SS",
        codigoPostal: "1101",
      }),
    });

    if (!response.ok) {
      const detalle = await response.text();
      console.log("Wompi 3DS rechazó la solicitud:", response.status, detalle);
      return res.status(400).json({ message: "No se pudo iniciar el pago seguro. Revisa los datos de la tarjeta." });
    }

    const data = await response.json();
    if (!data.idTransaccion || !data.urlCompletarPago3Ds) {
      return res.status(502).json({ message: "Wompi no devolvió la página de verificación del banco." });
    }

    await pendingPaymentModel.create({
      clientId,
      idTransaccion: data.idTransaccion,
      monto: Number(montoNum.toFixed(2)),
    });

    return res.status(200).json({
      idTransaccion: data.idTransaccion,
      urlCompletarPago3Ds: data.urlCompletarPago3Ds,
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// POST /api/wompi/confirmar3ds -> { idTransaccion }
// Consulta el estado real en Wompi; no se confía en los parámetros de la URL.
wompiController.confirmarPago3DS = async (req, res) => {
  try {
    const clientId = getLoggedClientId(req);
    if (!clientId) {
      return res.status(401).json({ message: "Debes iniciar sesión" });
    }

    const idTransaccion = soloTexto(req.body?.idTransaccion, 60);
    if (!idTransaccion) {
      return res.status(400).json({ message: "Falta el identificador de la transacción." });
    }

    const pendiente = await pendingPaymentModel.findOne({ idTransaccion, clientId });
    if (!pendiente) {
      return res.status(404).json({ message: "No encontramos un pago pendiente con ese identificador." });
    }

    const token = await generarTokenWompiInterno();
    const response = await fetch(`https://api.wompi.sv/TransaccionCompra/${encodeURIComponent(idTransaccion)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return res.status(502).json({ message: "No se pudo consultar el estado del pago en Wompi." });
    }

    const tx = await response.json();
    const montoCoincide = Math.abs(Number(tx.monto) - pendiente.monto) < 0.01;
    const aprobada = Boolean(tx.esAprobada) && montoCoincide;

    return res.status(200).json({
      aprobada,
      idTransaccion,
      codigoAutorizacion: tx.codigoAutorizacion,
      mensaje: aprobada ? tx.mensaje : (tx.mensaje || "El pago no fue aprobado."),
    });
  } catch (error) {
    console.log("error" + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default wompiController;