import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Lista todas las plantas (público, no requiere sesión)
export const getPlants = async () => {
  const response = await fetch(`${API}/plants`, {
    method: "GET"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener las plantas.");
  }

  return data;
};

// Obtiene una planta específica por id (público)
export const getPlantById = async (id) => {
  const response = await fetch(`${API}/plants/${id}`, {
    method: "GET"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se encontró la planta.");
  }

  return data;
};
