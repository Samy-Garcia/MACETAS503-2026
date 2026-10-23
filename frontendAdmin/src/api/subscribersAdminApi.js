import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api/newsletter`;

export const getAllSubscribers = async () => {
  const response = await fetch(`${API}/admin`, {
    method: "GET",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener los suscriptores.");
  }

  return data;
};

export const deleteSubscriber = async (id) => {
  const response = await fetch(`${API}/admin/${id}`, {
    method: "DELETE",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar el suscriptor.");
  }

  return data;
};

// Manda un correo (anuncio de producto nuevo, oferta, etc.) a TODOS los
// suscriptores -- lo escribe y dispara el admin manualmente, nunca es
// automático.
export const sendNewsletterBlast = async ({ subject, message }) => {
  const response = await fetch(`${API}/admin/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ subject, message })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo enviar el correo.");
  }

  return data;
};
