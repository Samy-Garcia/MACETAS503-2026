import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Listar todas las velas
export const getCandles = async () => {

  const response = await fetch(`${API}/candles`, {

    method: "GET",

    // necesario para enviar la cookie 'authCookie'
    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener las velas.");
  }

  return data;
};

// Crear una vela nueva (formData debe incluir: name, description, scent, size, price, stock, color, image)
export const createCandle = async (formData) => {

  const response = await fetch(`${API}/candles`, {

    method: "POST",

    // sin "Content-Type": el navegador arma el multipart/form-data con el boundary
    credentials: "include",

    body: formData

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo crear la vela.");
  }

  return data;
};

// Actualizar una vela existente (formData con los mismos campos, image es opcional)
export const updateCandle = async (id, formData) => {

  const response = await fetch(`${API}/candles/${id}`, {

    method: "PUT",

    credentials: "include",

    body: formData

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar la vela.");
  }

  return data;
};

// Eliminar una vela por id
export const deleteCandle = async (id) => {

  const response = await fetch(`${API}/candles/${id}`, {

    method: "DELETE",

    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar la vela.");
  }

  return data;
};
