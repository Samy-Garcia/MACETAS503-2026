import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// --- Testimonios (Clientes Felices, la página de inicio) ---

export const getAllTestimonials = async () => {
  const response = await fetch(`${API}/testimonials/admin`, {
    method: "GET",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener los testimonios.");
  }

  return data;
};

export const deleteTestimonial = async (id) => {
  const response = await fetch(`${API}/testimonials/${id}`, {
    method: "DELETE",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar el testimonio.");
  }

  return data;
};

// --- Reseñas de producto ---

export const getAllProductReviews = async () => {
  const response = await fetch(`${API}/reviews/admin`, {
    method: "GET",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener las reseñas.");
  }

  return data;
};

export const deleteProductReview = async (id) => {
  const response = await fetch(`${API}/reviews/admin/${id}`, {
    method: "DELETE",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar la reseña.");
  }

  return data;
};
