import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Lista los mejores/más recientes testimonios (público, para "Clientes Felices")
export const getTestimonials = async (limit = 8) => {
  const response = await fetch(`${API}/testimonials?limit=${limit}`, {
    method: "GET"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener los testimonios.");
  }

  return data;
};

// El testimonio propio del cliente logueado, si ya dejó uno (para precargar el formulario)
export const getMyTestimonial = async () => {
  const response = await fetch(`${API}/testimonials/mine`, {
    method: "GET",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo obtener tu reseña.");
  }

  return data;
};

// Crea o actualiza (si ya existía) el testimonio del cliente logueado
export const submitTestimonial = async (rating, text) => {
  const response = await fetch(`${API}/testimonials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ rating, text })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo enviar tu reseña.");
  }

  return data;
};
