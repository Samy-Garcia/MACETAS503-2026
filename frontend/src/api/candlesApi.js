import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Lista todas las velas (público, no requiere sesión)
export const getCandles = async () => {
  const response = await fetch(`${API}/candles`, {
    method: "GET"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener las velas.");
  }

  return data;
};

// Obtiene una vela específica por id (público)
export const getCandleById = async (id) => {
  const response = await fetch(`${API}/candles/${id}`, {
    method: "GET"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se encontró la vela.");
  }

  return data;
};
