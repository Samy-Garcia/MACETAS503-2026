import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Lista todos los combos (público, no requiere sesión)
export const getCombos = async () => {
  const response = await fetch(`${API}/combos`, {
    method: "GET"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener los combos.");
  }

  return data;
};

// Obtiene un combo específico por id (público)
export const getComboById = async (id) => {
  const response = await fetch(`${API}/combos/${id}`, {
    method: "GET"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se encontró el combo.");
  }

  return data;
};
