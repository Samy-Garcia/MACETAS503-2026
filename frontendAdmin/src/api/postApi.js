import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Listar todas las macetas
export const getPosts = async () => {

  const response = await fetch(`${API}/post`, {

    method: "GET",

    // necesario para enviar la cookie 'authCookie'
    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener las macetas.");
  }

  return data;
};

// Crear una maceta nueva (formData debe incluir: name, description, dimensions, weight, price, stock, color, image)
export const createPost = async (formData) => {

  const response = await fetch(`${API}/post`, {

    method: "POST",

    // sin "Content-Type": el navegador arma el multipart/form-data con el boundary
    credentials: "include",

    body: formData

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo crear la maceta.");
  }

  return data;
};

// Actualizar una maceta existente (formData con los mismos campos, image es opcional)
export const updatePost = async (id, formData) => {

  const response = await fetch(`${API}/post/${id}`, {

    method: "PUT",

    credentials: "include",

    body: formData

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar la maceta.");
  }

  return data;
};

// Eliminar una maceta por id
export const deletePost = async (id) => {

  const response = await fetch(`${API}/post/${id}`, {

    method: "DELETE",

    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar la maceta.");
  }

  return data;
};
