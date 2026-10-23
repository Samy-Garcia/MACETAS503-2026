import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api/config`;

// Obtiene la configuración pública (ubicación de la tienda, precio por km)
export const getConfig = async () => {

  const response = await fetch(`${API}`, {

    method: "GET"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo obtener la configuración.");
  }

  // El backend devuelve un array (find()); normalmente solo hay un documento
  return Array.isArray(data) ? data[0] : data;
};