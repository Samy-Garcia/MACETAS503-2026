import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Todas mis listas (con conteo y miniaturas)
export const getMyLists = async () => {
  const response = await fetch(`${API}/wishlist/mine`, { method: "GET", credentials: "include" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudieron obtener tus listas.");
  return data;
};

// Una lista específica con sus productos completos
export const getListById = async (listId) => {
  const response = await fetch(`${API}/wishlist/mine/${listId}`, { method: "GET", credentials: "include" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo obtener la lista.");
  return data;
};

// Crear una lista nueva
export const createList = async (name) => {
  const response = await fetch(`${API}/wishlist/lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo crear la lista.");
  return data;
};

// Eliminar una lista completa
export const deleteList = async (listId) => {
  const response = await fetch(`${API}/wishlist/lists/${listId}`, { method: "DELETE", credentials: "include" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo eliminar la lista.");
  return data;
};

// Quitar un producto de una lista específica
export const removeItemFromList = async (listId, itemId) => {
  const response = await fetch(`${API}/wishlist/lists/${listId}/items/${itemId}`, { method: "DELETE", credentials: "include" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo eliminar el producto.");
  return data;
};

// IDs de todos los productos guardados (en cualquier lista) — para pintar corazones
export const getFavoriteIds = async () => {
  const response = await fetch(`${API}/wishlist/favorites`, { method: "GET", credentials: "include" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudieron obtener tus favoritos.");
  return data;
};

// El ❤️ rápido: agrega o quita de la lista principal
export const toggleFavorite = async (productId, productType) => {
  const response = await fetch(`${API}/wishlist/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ productId, productType })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo actualizar tu wishlist.");
  return data;
};

// Agregar/quitar un producto de UNA lista específica (no solo la principal)
export const toggleItemInList = async (listId, productId, productType) => {
  const response = await fetch(`${API}/wishlist/lists/${listId}/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ productId, productType })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo actualizar la lista.");
  return data;
};
