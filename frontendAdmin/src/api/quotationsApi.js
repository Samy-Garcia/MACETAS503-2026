import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api/quotations`;

export const getAllQuotations = async () => {
  const response = await fetch(`${API}/admin`, {
    method: "GET",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener las cotizaciones.");
  }

  return data;
};

export const respondQuotation = async (id, { status, finalPrice, adminMessage }) => {
  const response = await fetch(`${API}/admin/${id}/respond`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status, finalPrice, adminMessage })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo responder la cotización.");
  }

  return data;
};
