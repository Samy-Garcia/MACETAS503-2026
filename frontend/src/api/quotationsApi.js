import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api/quotations`;

// Pide una cotización para un evento con la lista de productos elegidos.
export const createQuotation = async ({ eventType, eventDate, guestCount, location, locationLat, locationLng, specialRequirements, items }) => {
  const response = await fetch(`${API}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ eventType, eventDate, guestCount, location, locationLat, locationLng, specialRequirements, items })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo enviar la solicitud de cotización.");
  }

  return data;
};

// Mis solicitudes de cotización (para la pestaña de Mi Perfil)
export const getMyQuotations = async () => {
  const response = await fetch(`${API}/mine`, {
    method: "GET",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener tus cotizaciones.");
  }

  return data;
};
