import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Trae el perfil del cliente logueado
export const getMyProfile = async () => {
  const response = await fetch(`${API}/loginClient/me`, {
    method: "GET",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "No se pudo obtener tu perfil.");
    // Exponemos el status para que ProfileContext pueda distinguir "no hay
    // sesión" (401, cierre real) de "el backend tuvo un problema temporal"
    // (500, DB reconectando, etc. — eso NO debería mostrar al usuario como deslogueado).
    error.status = response.status;
    throw error;
  }

  return data;
};

// Actualiza nombre, apellido, teléfono y (opcional) foto de perfil
export const updateMyProfile = async ({ name, lastName, phone, birthDate, photoFile }) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("lastName", lastName);
  formData.append("phone", phone || "");
  if (birthDate) {
    formData.append("birthDate", birthDate);
  }
  if (photoFile instanceof File) {
    formData.append("photo", photoFile);
  }

  const response = await fetch(`${API}/loginClient/me`, {
    method: "PUT",
    credentials: "include",
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar tu perfil.");
  }

  return data;
};

// Agrega una dirección nueva a la libreta de direcciones
export const addAddress = async (payload) => {
  const response = await fetch(`${API}/loginClient/me/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo guardar la dirección.");
  }

  return data;
};

// Edita una dirección existente
export const updateAddress = async (addressId, payload) => {
  const response = await fetch(`${API}/loginClient/me/addresses/${addressId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar la dirección.");
  }

  return data;
};

// Elimina una dirección
export const deleteAddress = async (addressId) => {
  const response = await fetch(`${API}/loginClient/me/addresses/${addressId}`, {
    method: "DELETE",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar la dirección.");
  }

  return data;
};

// Guarda (o reemplaza) la tarjeta del cliente -- la tokeniza con Wompi en el
// backend y solo persiste el token reusable + los datos enmascarados.
// Devuelve la tarjeta ya enmascarada, lista para mostrar en el perfil.
export const savePaymentMethod = async ({ numeroTarjeta, cvv, mesVencimiento, anioVencimiento, nombreEnTarjeta }) => {
  const response = await fetch(`${API}/loginClient/me/payment-method`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ numeroTarjeta, cvv, mesVencimiento, anioVencimiento, nombreEnTarjeta })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo guardar la tarjeta.");
  }

  return data;
};

// Elimina la tarjeta guardada del cliente
export const deletePaymentMethod = async () => {
  const response = await fetch(`${API}/loginClient/me/payment-method`, {
    method: "DELETE",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar la tarjeta.");
  }

  return data;
};
