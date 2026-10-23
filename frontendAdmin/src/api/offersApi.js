import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Listar todas las ofertas (ya vienen con los datos del producto incluidos)
export const getOffers = async () => {
  const response = await fetch(`${API}/offers`, {
    method: "GET",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener las ofertas.");
  }

  return data;
};

// Crear una oferta nueva: { productId, productType, discountPercentage, status }
export const createOffer = async (payload) => {
  const response = await fetch(`${API}/offers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo crear la oferta.");
  }

  return data;
};

// Actualizar una oferta existente
export const updateOffer = async (id, payload) => {
  const response = await fetch(`${API}/offers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar la oferta.");
  }

  return data;
};

// Eliminar una oferta por id
export const deleteOffer = async (id) => {
  const response = await fetch(`${API}/offers/${id}`, {
    method: "DELETE",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar la oferta.");
  }

  return data;
};
