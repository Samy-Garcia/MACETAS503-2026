import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Listar todos los clientes registrados
export const getClients = async () => {

  const response = await fetch(`${API}/clients`, {

    method: "GET",

    // necesario para enviar la cookie 'authCookie'
    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener los clientes.");
  }

  return data;
};

// Actualizar un cliente existente
export const updateClient = async (id, payload) => {

  const isFormData = payload instanceof FormData;

  const response = await fetch(`${API}/clients/${id}`, {

    method: "PUT",

    headers: isFormData ? undefined : { "Content-Type": "application/json" },

    credentials: "include",

    body: isFormData ? payload : JSON.stringify(payload)

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar el cliente.");
  }

  return data;
};

// Eliminar un cliente por id
export const deleteClient = async (id) => {

  const response = await fetch(`${API}/clients/${id}`, {

    method: "DELETE",

    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar el cliente.");
  }

  return data;
};
