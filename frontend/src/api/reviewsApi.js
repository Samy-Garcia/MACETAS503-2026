import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Productos de pedidos ENTREGADOS del cliente, marcando cuáles ya tienen reseña
export const getReviewableItems = async () => {
  const response = await fetch(`${API}/reviews/reviewable`, {
    method: "GET",
    credentials: "include"
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudieron obtener tus productos por reseñar.");
  return data;
};

// Crea una reseña. payload: { orderId, productId, productType, rating, comment, imageFile? }
export const createReview = async ({ orderId, productId, productType, rating, comment, imageFile }) => {
  const formData = new FormData();
  formData.append("orderId", orderId);
  formData.append("productId", productId);
  formData.append("productType", productType);
  formData.append("rating", rating);
  formData.append("comment", comment);
  if (imageFile instanceof File) formData.append("image", imageFile);

  const response = await fetch(`${API}/reviews`, {
    method: "POST",
    credentials: "include",
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo publicar la reseña.");
  return data;
};

// Mis reseñas
export const getMyReviews = async () => {
  const response = await fetch(`${API}/reviews/mine`, {
    method: "GET",
    credentials: "include"
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudieron obtener tus reseñas.");
  return data;
};

// Reseñas públicas de un producto (para su página de detalle)
export const getProductReviews = async (productType, productId) => {
  const response = await fetch(`${API}/reviews/product/${productType}/${productId}`, {
    method: "GET"
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudieron obtener las reseñas.");
  return data;
};

// Editar mi reseña
export const updateReview = async (id, { rating, comment, imageFile }) => {
  const formData = new FormData();
  if (rating !== undefined) formData.append("rating", rating);
  if (comment !== undefined) formData.append("comment", comment);
  if (imageFile instanceof File) formData.append("image", imageFile);

  const response = await fetch(`${API}/reviews/${id}`, {
    method: "PUT",
    credentials: "include",
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo actualizar la reseña.");
  return data;
};

// Eliminar mi reseña
export const deleteReview = async (id) => {
  const response = await fetch(`${API}/reviews/${id}`, {
    method: "DELETE",
    credentials: "include"
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo eliminar la reseña.");
  return data;
};
