import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Lista todas las macetas (público, no requiere sesión)
export const getPots = async () => {
  const response = await fetch(`${API}/post`, {
    method: "GET"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener las macetas.");
  }

  return data;
};

// Obtiene una maceta específica por id (público)
export const getPotById = async (id) => {
  const response = await fetch(`${API}/post/${id}`, {
    method: "GET"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se encontró la maceta.");
  }

  return data;
};

// Top de productos más vendidos de verdad (macetas, velas y plantas juntas),
// calculado a partir de las órdenes confirmadas. Público, para la tienda.
export const getBestSellers = async (limit = 12) => {
  const response = await fetch(`${API}/orders/bestsellers?limit=${limit}`, {
    method: "GET"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener los productos más vendidos.");
  }

  return data;
};

// Lo último agregado al catálogo (macetas, velas y plantas juntas). Público, para la tienda.
export const getNewestProducts = async (limit = 6) => {
  const response = await fetch(`${API}/catalog/newest?limit=${limit}`, {
    method: "GET"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener los productos nuevos.");
  }

  return data;
};

// Buscador del sitio: devuelve macetas, velas, plantas, otros y combos que
// coinciden con el texto (sin importar tildes ni mayúsculas). Público.
export const searchProducts = async (q) => {
  const response = await fetch(`${API}/catalog/search?q=${encodeURIComponent(q)}`, {
    method: "GET"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo realizar la búsqueda.");
  }

  return data;
};
