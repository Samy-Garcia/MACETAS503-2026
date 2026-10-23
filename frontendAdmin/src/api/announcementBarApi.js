import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Listar todos los banners guardados
export const getAnnouncementBars = async () => {
  const response = await fetch(`${API}/announcement-bars`, {
    method: "GET",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener los banners.");
  }

  return data;
};

// Crear un banner nuevo: { text, backgroundColor, textColor, animation, active }
export const createAnnouncementBar = async (payload) => {
  const response = await fetch(`${API}/announcement-bars`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo crear el banner.");
  }

  return data;
};

// Actualizar un banner existente (texto, colores, animación, y/o activarlo)
export const updateAnnouncementBar = async (id, payload) => {
  const response = await fetch(`${API}/announcement-bars/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar el banner.");
  }

  return data;
};

// Eliminar un banner por id
export const deleteAnnouncementBar = async (id) => {
  const response = await fetch(`${API}/announcement-bars/${id}`, {
    method: "DELETE",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar el banner.");
  }

  return data;
};
