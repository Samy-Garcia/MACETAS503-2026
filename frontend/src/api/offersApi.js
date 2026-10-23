import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Lista todas las ofertas (público). Cada oferta ya viene con los datos
// del producto real incluidos (nombre, imagen, precio, stock).
export const getOffers = async () => {
  const response = await fetch(`${API}/offers`, {
    method: "GET"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener las ofertas.");
  }

  return data;
};
