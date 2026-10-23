import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api/wompi`;

export const generarTokenWompi = async () => {
  const response = await fetch(`${API}/token`, {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "No se pudo generar el token de Wompi.");
    error.status = response.status;
    throw error;
  }

  return data.access_token;
};

// Tokeniza la tarjeta -> devuelve { token, tarjetaEnmascarada }
export const tokenizarTarjeta = async ({ token, numeroTarjeta, cvv, mesVencimiento, anioVencimiento, nombreEnTarjeta }) => {
  const response = await fetch(`${API}/tokenizarTarjeta`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, numeroTarjeta, cvv, mesVencimiento, anioVencimiento, nombreEnTarjeta }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "No se pudo tokenizar la tarjeta.");
    error.status = response.status;
    throw error;
  }

  return data; // { token, tarjetaEnmascarada }
};

// Ejecuta la transacción de prueba (TokenizadaSin3Ds) -- ningún cobro real
// (siempre que el aplicativo esté en modo Desarrollo en panel.wompi.sv)
export const pagarTarjetaPrueba = async ({ tokenTarjeta, monto, emailCliente, nombreCliente }) => {
  const token = await generarTokenWompi();

  const formData = { tokenTarjeta, monto, emailCliente, nombreCliente };

  const response = await fetch(`${API}/paymentTest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, formData }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "No se pudo procesar el pago de prueba.");
    error.status = response.status;
    throw error;
  }

  return data; // { idTransaccion, esReal, esAprobada, codigoAutorizacion, mensaje, monto }
};

// Igual que pagarTarjetaPrueba, pero usando la tarjeta que el cliente ya
// tiene guardada en su perfil -- no se piden número/mes/año/cvv, el backend
// usa el token guardado (que nunca se expone al frontend).
export const pagarConTarjetaGuardada = async ({ monto, emailCliente, nombreCliente }) => {
  const response = await fetch(`${API}/pagarConTarjetaGuardada`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ monto, emailCliente, nombreCliente }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "No se pudo procesar el pago con tu tarjeta guardada.");
    error.status = response.status;
    throw error;
  }

  return data;
};

// ===== Pago con 3D Secure =====
// Manda la tarjeta al backend (que la envía a Wompi) y devuelve la URL del
// banco a la que hay que llevar al cliente para autorizar el pago.
export const iniciarPago3DS = async (payload) => {
  const response = await fetch(`${API}/iniciar3ds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "No se pudo iniciar el pago seguro.");
    error.status = response.status;
    throw error;
  }

  return data; // { idTransaccion, urlCompletarPago3Ds }
};

// Al volver del banco: el backend le pregunta a Wompi si el pago fue aprobado.
export const confirmarPago3DS = async (idTransaccion) => {
  const response = await fetch(`${API}/confirmar3ds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idTransaccion }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "No se pudo confirmar el pago.");
    error.status = response.status;
    throw error;
  }

  return data; // { aprobada, idTransaccion, codigoAutorizacion, mensaje }
};
