import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

export const getEarnMethods = async () => {
  const response = await fetch(`${API}/earn-methods`, { method: "GET", credentials: "include" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudieron obtener las formas de ganar puntos.");
  return data;
};

export const createEarnMethod = async (payload) => {
  const response = await fetch(`${API}/earn-methods`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo crear la forma de ganar puntos.");
  return data;
};

export const updateEarnMethod = async (id, payload) => {
  const response = await fetch(`${API}/earn-methods/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo actualizar.");
  return data;
};

export const deleteEarnMethod = async (id) => {
  const response = await fetch(`${API}/earn-methods/${id}`, { method: "DELETE", credentials: "include" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo eliminar.");
  return data;
};
