import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

export const getRewards = async () => {
  const response = await fetch(`${API}/rewards`, { method: "GET", credentials: "include" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudieron obtener las recompensas.");
  return data;
};

export const createReward = async (formData) => {
  const response = await fetch(`${API}/rewards`, { method: "POST", credentials: "include", body: formData });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo crear la recompensa.");
  return data;
};

export const updateReward = async (id, formData) => {
  const response = await fetch(`${API}/rewards/${id}`, { method: "PUT", credentials: "include", body: formData });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo actualizar la recompensa.");
  return data;
};

export const deleteReward = async (id) => {
  const response = await fetch(`${API}/rewards/${id}`, { method: "DELETE", credentials: "include" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo eliminar la recompensa.");
  return data;
};
