import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api/announcement-bars`;

// Obtiene el único banner activo ahora mismo (público). Devuelve null si
// no hay ninguno activo -- el Navbar usa su mensaje de respaldo en ese caso.
export const getActiveAnnouncementBar = async () => {

  const response = await fetch(`${API}/active`, {
    method: "GET"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo obtener el banner.");
  }

  return data;
};
