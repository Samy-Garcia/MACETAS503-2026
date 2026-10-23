import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api/custom-orders`;

export const getAllCustomOrders = async () => {
  const response = await fetch(`${API}/admin`, {
    method: "GET",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener las solicitudes de personalización.");
  }

  return data;
};

export const updateCustomOrderStatus = async (id, status) => {
  const response = await fetch(`${API}/admin/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar el estado.");
  }

  return data;
};

export const setCustomOrderPrice = async (id, price) => {
  const response = await fetch(`${API}/admin/${id}/price`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ price })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo guardar el precio.");
  }

  return data;
};
