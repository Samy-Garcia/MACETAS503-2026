import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

export const loginRequest = async (email, password) => {

  const response = await fetch(`${API}/loginClient`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    credentials: "include",

    body: JSON.stringify({
      email,
      password
    })

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
};


export const loginGoogleRequest = async (accessToken, acceptedTerms) => {

  const response = await fetch(`${API}/loginClient/google`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    credentials: "include",

    body: JSON.stringify({
      accessToken,
      acceptedTerms
    })

  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.message || "Error al iniciar sesión con Google");
    err.status = response.status;
    throw err;
  }

  return data;
};

export const registerRequest = async (data) => {
  const response = await fetch(`${API}/registerClient`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    // necesario para que el navegador guarde la cookie 'registrationCookie'
    credentials: "include",

    body: JSON.stringify({
      name: data.nombre,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone,
      address: data.address,
      referralCode: data.referralCode ? data.referralCode.trim().toUpperCase() : undefined
    })

  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "No se pudo completar el registro.");
  }

  return result;
};

export const verifyCodeRequest = async (code) => {
  const response = await fetch(`${API}/registerClient/verifyCodeEmail`, {

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

export const recoveryRequest = async (email) => {
  const response = await fetch(`${API}/recoveryPasswordClient`, {

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

export const recoveryVerifyCodeRequest = async (code) => {
  const response = await fetch(`${API}/recoveryPasswordClient/verifyCode`, {

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

export const newPasswordRequest = async (newPassword, confirmPassword) => {
  const response = await fetch(`${API}/recoveryPasswordClient/newPassword`, {

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

export const logoutRequest = async () => {
    const response = await fetch(`${API}/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "No se pudo cerrar sesión.");
    }

    return data;
};