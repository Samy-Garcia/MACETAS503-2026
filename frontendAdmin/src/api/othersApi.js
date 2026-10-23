import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Listar todos los productos de "Otros/Decorativos"
export const getOthers = async () => {

  const response = await fetch(`${API}/others`, {

    method: "GET",

    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener los productos.");
  }

  return data;
};

// Crear un producto nuevo (formData debe incluir: name, description, price, stock, color, images)
export const createOther = async (formData) => {

  const response = await fetch(`${API}/others`, {

    method: "POST",

    credentials: "include",

    body: formData

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo crear el producto.");
  }

  return data;
};

// Actualizar un producto existente (images es opcional)
export const updateOther = async (id, formData) => {

  const response = await fetch(`${API}/others/${id}`, {

    method: "PUT",

    credentials: "include",

    body: formData

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar el producto.");
  }

  return data;
};

// Eliminar un producto por id
export const deleteOther = async (id) => {

  const response = await fetch(`${API}/others/${id}`, {

    method: "DELETE",

    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar el producto.");
  }

  return data;
};
