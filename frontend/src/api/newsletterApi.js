import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Suscribe un correo al newsletter (público)
export const subscribeToNewsletter = async (email) => {
  const response = await fetch(`${API}/newsletter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo completar la suscripción.");
  }

  return data;
};
