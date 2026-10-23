import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

export const getCombos = async () => {
  const response = await fetch(`${API}/combos`, {
    method: "GET",
    credentials: "include"
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener los combos.");
  }
  return data;
};

export const createCombo = async (formData) => {
  const response = await fetch(`${API}/combos`, {
    method: "POST",
    credentials: "include",
    body: formData
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "No se pudo crear el combo.");
  }
  return data;
};

export const updateCombo = async (id, formData) => {
  const response = await fetch(`${API}/combos/${id}`, {
    method: "PUT",
    credentials: "include",
    body: formData
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar el combo.");
  }
  return data;
};

export const deleteCombo = async (id) => {
  const response = await fetch(`${API}/combos/${id}`, {
    method: "DELETE",
    credentials: "include"
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar el combo.");
  }
  return data;
};
