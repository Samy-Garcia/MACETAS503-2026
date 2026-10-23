import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Lista todos los productos de "Otros/Decorativos" (público, no requiere sesión)
export const getOthers = async () => {
  const response = await fetch(`${API}/others`, {
    method: "GET"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener los productos.");
  }

  return data;
};

// Obtiene un producto específico por id (público)
export const getOtherById = async (id) => {
  const response = await fetch(`${API}/others/${id}`, {
    method: "GET"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se encontró el producto.");
  }

  return data;
};
