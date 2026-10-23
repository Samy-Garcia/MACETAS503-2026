import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Listar todas las órdenes
export const getOrders = async () => {

  const response = await fetch(`${API}/orders`, {

    method: "GET",

    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener las órdenes.");
  }

  return data;
};

// Cambiar el estatus de una orden
// status debe ser uno de: "Pendiente", "Aceptado", "En proceso", "Completo", "Rechazado"
export const updateOrderStatus = async (id, status) => {

  const response = await fetch(`${API}/orders/${id}/status`, {

    method: "PATCH",

    headers: {
      "Content-Type": "application/json"
    },

    credentials: "include",

    body: JSON.stringify({ status })

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar el estatus de la orden.");
  }

  return data;
};

// Cambiar una orden de envío a domicilio a recogida en tienda (ej: la
// dirección queda muy lejos o el viaje es demasiado complicado)
export const forceOrderPickup = async (id, { pickupLocationId, reason }) => {

  const response = await fetch(`${API}/orders/${id}/force-pickup`, {

    method: "PATCH",

    headers: {
      "Content-Type": "application/json"
    },

    credentials: "include",

    body: JSON.stringify({ pickupLocationId, reason })

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo cambiar el método de entrega.");
  }

  return data;
};

// Eliminar una orden
export const deleteOrder = async (id) => {

  const response = await fetch(`${API}/orders/${id}`, {

    method: "DELETE",

    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar la orden.");
  }

  return data;
};
