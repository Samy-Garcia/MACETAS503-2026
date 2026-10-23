import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api/custom-orders`;

// Pide personalizar una maceta marcada como "isCustomizable".
// payload: { productId, description, referenceImageFile? }
export const createCustomOrder = async ({ productId, description, referenceImageFile }) => {
  const formData = new FormData();
  formData.append("productId", productId);
  formData.append("description", description);
  if (referenceImageFile instanceof File) formData.append("referenceImage", referenceImageFile);

  const response = await fetch(`${API}`, {
    method: "POST",
    credentials: "include",
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo enviar la solicitud de personalización.");
  }

  return data;
};

// Mis solicitudes de personalización (para la pestaña de Mi Perfil)
export const getMyCustomOrders = async () => {
  const response = await fetch(`${API}/mine`, {
    method: "GET",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener tus personalizaciones.");
  }

  return data;
};
