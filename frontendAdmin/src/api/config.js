import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api/config`;

// Obtener la configuración general (stockMin, storeLat, storeLng, pricePerKm, etc.)
export const getConfig = async () => {

  const response = await fetch(`${API}`, {

    method: "GET",

    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo obtener la configuración.");
  }

  // El backend devuelve un array (find()); normalmente solo hay un documento
  return Array.isArray(data) ? data[0] : data;
};

// Actualizar la configuración de envío (ubicación de tienda + modo de cobro +
// precio por km / costo fijo + monto mínimo para envío gratis)
export const updateShippingConfig = async (id, {
  storeLat,
  storeLng,
  pricePerKm,
  shippingMode,
  fixedShippingCost,
  freeShippingMinAmount
}) => {

  const response = await fetch(`${API}/${id}`, {

    method: "PUT",

    headers: { "Content-Type": "application/json" },

    credentials: "include",

    body: JSON.stringify({
      storeLat,
      storeLng,
      pricePerKm,
      shippingMode,
      fixedShippingCost,
      freeShippingMinAmount
    })

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar la configuración de envío.");
  }

  return data.config;
};

// Actualizar las redes sociales oficiales de la tienda (Instagram,
// Facebook, TikTok) -- se mandan siempre los 3 juntos porque el backend
// reemplaza el objeto completo, no hace un merge parcial
export const updateSocialMediaConfig = async (id, { instagram, facebook, tiktok }) => {

  const response = await fetch(`${API}/${id}`, {

    method: "PUT",

    headers: { "Content-Type": "application/json" },

    credentials: "include",

    body: JSON.stringify({ socialMedia: { instagram, facebook, tiktok } })

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron actualizar las redes sociales.");
  }

  return data.config;
};

// Actualizar solo el mensaje del banner superior (ej: "Envío gratis a compras mayores de $15.00")
export const updateAnnouncementConfig = async (id, { announcementText }) => {

  const response = await fetch(`${API}/${id}`, {

    method: "PUT",

    headers: { "Content-Type": "application/json" },

    credentials: "include",

    body: JSON.stringify({ announcementText })

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar el mensaje del banner.");
  }

  return data.config;
};

// Sube nuevas imágenes al carrusel del inicio (hasta 6 en total)
export const addHeroImages = async (id, files) => {

  const fd = new FormData();
  files.forEach(file => fd.append('images', file));

  const response = await fetch(`${API}/${id}/hero-images`, {

    method: "POST",

    credentials: "include",

    body: fd

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron subir las imágenes.");
  }

  return data.config;
};

// Elimina una imagen del carrusel del inicio
export const removeHeroImage = async (id, publicId) => {

  const response = await fetch(`${API}/${id}/hero-images/remove`, {

    method: "POST",

    headers: { "Content-Type": "application/json" },

    credentials: "include",

    body: JSON.stringify({ public_id: publicId })

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar la imagen.");
  }

  return data.config;
};

// Reordena las imágenes del carrusel del inicio
export const reorderHeroImages = async (id, publicIds) => {

  const response = await fetch(`${API}/${id}/hero-images/reorder`, {

    method: "PUT",

    headers: { "Content-Type": "application/json" },

    credentials: "include",

    body: JSON.stringify({ publicIds })

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo reordenar las imágenes.");
  }

  return data.config;
};

// Actualiza el texto superpuesto de una imagen del carrusel (título,
// subtítulo, texto y link del botón "Comprar ahora", tipografía y
// posición del texto sobre la imagen)
export const updateHeroImageText = async (id, {
  publicId,
  imagePositionX, imagePositionY, imageZoom,
  title, titleFontFamily, titlePositionX, titlePositionY,
  subtitle, subtitleFontFamily, subtitlePositionX, subtitlePositionY,
  buttons
}) => {

  const response = await fetch(`${API}/${id}/hero-images/text`, {

    method: "PUT",

    headers: { "Content-Type": "application/json" },

    credentials: "include",

    body: JSON.stringify({
      public_id: publicId,
      imagePositionX, imagePositionY, imageZoom,
      title, titleFontFamily, titlePositionX, titlePositionY,
      subtitle, subtitleFontFamily, subtitlePositionX, subtitlePositionY,
      buttons
    })

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar el texto de la imagen.");
  }

  return data.config;
};
// Actualiza el color de marca y/o el modo oscuro del sitio (el logo tiene
// su propio endpoint, ver updateThemeLogo/removeThemeLogo más abajo)
export const updateThemeConfig = async (id, { primaryColor, backgroundColor, surfaceColor, darkMode, mode, festivoKey }) => {

  const response = await fetch(`${API}/${id}`, {

    method: "PUT",

    headers: { "Content-Type": "application/json" },

    credentials: "include",

    body: JSON.stringify({ theme: { primaryColor, backgroundColor, surfaceColor, darkMode, mode, festivoKey } })

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar el tema del sitio.");
  }

  return data.config;
};

// Agrega un punto de recogida en tienda (para cuando la emprendedora no
// puede llevar el pedido a domicilio y el cliente pasa a recogerlo él mismo)
export const addPickupLocation = async (id, { name, address, lat, lng }) => {

  const response = await fetch(`${API}/${id}/pickup-locations`, {

    method: "POST",

    headers: { "Content-Type": "application/json" },

    credentials: "include",

    body: JSON.stringify({ name, address, lat, lng })

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo agregar el punto de recogida.");
  }

  return data.config;
};

// Actualiza un punto de recogida (nombre, dirección, coordenadas y/o si está activo)
export const updatePickupLocation = async (id, locationId, { name, address, lat, lng, isActive }) => {

  const response = await fetch(`${API}/${id}/pickup-locations/${locationId}`, {

    method: "PUT",

    headers: { "Content-Type": "application/json" },

    credentials: "include",

    body: JSON.stringify({ name, address, lat, lng, isActive })

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar el punto de recogida.");
  }

  return data.config;
};

// Elimina un punto de recogida
export const removePickupLocation = async (id, locationId) => {

  const response = await fetch(`${API}/${id}/pickup-locations/${locationId}`, {

    method: "DELETE",

    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar el punto de recogida.");
  }

  return data.config;
};

// Sube/reemplaza el logo del sitio
export const updateThemeLogo = async (id, file) => {

  const fd = new FormData();
  fd.append('logo', file);

  const response = await fetch(`${API}/${id}/theme/logo`, {

    method: "POST",

    credentials: "include",

    body: fd

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo subir el logo.");
  }

  return data.config;
};

// Quita el logo personalizado (vuelve al logo por defecto del código)
export const removeThemeLogo = async (id) => {

  const response = await fetch(`${API}/${id}/theme/logo`, {

    method: "DELETE",

    credentials: "include"

  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar el logo.");
  }

  return data.config;
};
