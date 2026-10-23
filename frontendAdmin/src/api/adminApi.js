import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api/adminProfile`;

// Obtener el perfil del admin logueado (a partir de la cookie de sesión)
export const getAdminProfile = async () => {

  const response = await fetch(`${API}`, {

    method: "GET",

    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo obtener el perfil.");
  }

  return data;
};

// Actualizar nombre, teléfono, correo, red social y/o foto de perfil.
// formData es un objeto FormData (por la foto); si no hay foto nueva
// simplemente no se agrega el campo "photo".
export const updateAdminProfile = async (formData) => {

  const response = await fetch(`${API}`, {

    method: "PUT",

    credentials: "include",

    body: formData

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar el perfil.");
  }

  return data;
};

// Cambiar contraseña (requiere la actual)
export const updateAdminPassword = async (currentPassword, newPassword) => {

  const response = await fetch(`${API}/password`, {

    method: "PUT",

    headers: { "Content-Type": "application/json" },

    credentials: "include",

    body: JSON.stringify({ currentPassword, newPassword })

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar la contraseña.");
  }

  return data;
};

// Activar/desactivar la autenticación en dos pasos
export const toggleAdminTwoFA = async () => {

  const response = await fetch(`${API}/twofa`, {

    method: "PATCH",

    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar la autenticación en dos pasos.");
  }

  return data;
};

// Listar administradores registrados que todavía no tienen acceso aprobado
export const getPendingAdmins = async () => {

  const response = await fetch(`${API}/pending`, {

    method: "GET",

    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo obtener la lista de administradores pendientes.");
  }

  return data;
};

// Aprobar a un administrador pendiente (le da acceso para iniciar sesión)
export const approveAdmin = async (id) => {

  const response = await fetch(`${API}/pending/${id}/approve`, {

    method: "PATCH",

    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo aprobar al administrador.");
  }

  return data;
};

// Rechazar (eliminar) a un administrador pendiente
export const rejectAdmin = async (id) => {

  const response = await fetch(`${API}/pending/${id}/reject`, {

    method: "DELETE",

    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo rechazar al administrador.");
  }

  return data;
};
