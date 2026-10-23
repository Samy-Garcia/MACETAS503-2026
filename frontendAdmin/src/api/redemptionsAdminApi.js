import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api/loyalty`;

export const getProductRedemptions = async () => {
  const response = await fetch(`${API}/admin/redemptions`, {
    method: "GET",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener los canjes.");
  }

  return data;
};

export const markRedemptionDelivered = async (id) => {
  const response = await fetch(`${API}/admin/redemptions/${id}/delivered`, {
    method: "PATCH",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo marcar como entregado.");
  }

  return data;
};
