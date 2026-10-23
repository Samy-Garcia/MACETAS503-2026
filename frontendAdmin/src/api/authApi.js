import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

export const loginAdminRequest = async (email, password) => {

  const response = await fetch(`${API}/loginAdmin`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    // necesario para que el navegador guarde la cookie 'authCookie'
    credentials: "include",

    body: JSON.stringify({ email, password })

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Credenciales incorrectas.");
  }

  return data;
};

export const registerAdminRequest = async (data) => {

  const response = await fetch(`${API}/registerAdmin`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    // necesario para que el navegador guarde la cookie 'registrationCookie'
    credentials: "include",

    body: JSON.stringify({
      name: data.name,
      email: data.email,
      password: data.password
    })

  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "No se pudo completar el registro.");
  }

  return result;
};

export const verifyCodeAdminRequest = async (code) => {

  const response = await fetch(`${API}/registerAdmin/verifyCodeEmail`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    // necesario para que el navegador envíe la cookie 'registrationCookie'
    credentials: "include",

    body: JSON.stringify({ code })

  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "El código ingresado es incorrecto.");
  }

  return result;
};

export const recoveryAdminRequest = async (email) => {

  const response = await fetch(`${API}/recoveryPasswordAdmin`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    // necesario para que el navegador guarde la cookie 'recoveryCookie'
    credentials: "include",

    body: JSON.stringify({ email })

  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "No se pudo enviar el código de recuperación.");
  }

  return result;
};

export const recoveryVerifyCodeAdminRequest = async (code) => {

  const response = await fetch(`${API}/recoveryPasswordAdmin/verifyCode`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    // necesario para que el navegador envíe la cookie 'recoveryCookie'
    credentials: "include",

    body: JSON.stringify({ code })

  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "El código ingresado es incorrecto.");
  }

  return result;
};

export const newPasswordAdminRequest = async (newPassword, confirmPassword) => {

  const response = await fetch(`${API}/recoveryPasswordAdmin/newPassword`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    // necesario para que el navegador envíe la cookie 'recoveryCookie'
    credentials: "include",

    body: JSON.stringify({ newPassword, confirmPassword })

  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "No se pudo actualizar la contraseña.");
  }

  return result;
};
// Verifica si hay una sesión activa (lee la cookie 'authCookie' en el backend)
export const getMeRequest = async () => {

  const response = await fetch(`${API}/loginAdmin/me`, {

    method: "GET",

    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "No autenticado");
    // Exponemos el status para que AuthContext pueda distinguir "no hay
    // sesión" (401, cierre real) de "el backend tuvo un problema temporal"
    // (500, DB reconectando, etc. — eso NO debería cerrar la sesión).
    error.status = response.status;
    throw error;
  }

  return data;
};

// Cierra la sesión (borra la cookie 'authCookie' en el backend)
export const logoutAdminRequest = async () => {

  const response = await fetch(`${API}/logout`, {

    method: "POST",

    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo cerrar la sesión");
  }

  return data;
};
