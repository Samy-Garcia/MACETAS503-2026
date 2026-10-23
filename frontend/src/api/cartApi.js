import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

// Trae el carrito activo del cliente logueado (el backend lo crea vacío si no existe)
export const getMyCart = async () => {
  const response = await fetch(`${API}/cart/mine`, {
    method: "GET",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo obtener el carrito.");
  }

  return data;
};

// Historial de pedidos ya confirmados del cliente logueado
export const getMyOrders = async () => {
  const response = await fetch(`${API}/cart/orders`, {
    method: "GET",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener tus pedidos.");
  }

  return data;
};

// Agrega un producto al carrito: { productId, productType: 'maceta'|'vela'|'planta', quantity }
export const addToCart = async (payload) => {
  const response = await fetch(`${API}/cart/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo agregar el producto al carrito.");
  }

  return data;
};

// Agrega al carrito una personalización ya aceptada y con precio definido.
export const addCustomOrderToCart = async ({ customOrderId, quantity }) => {
  const response = await fetch(`${API}/cart/add-custom-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ customOrderId, quantity })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo agregar la personalización al carrito.");
  }

  return data;
};

// Cambia la cantidad de un producto ya en el carrito
export const updateCartItem = async (itemId, quantity) => {
  const response = await fetch(`${API}/cart/item/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ quantity })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar la cantidad.");
  }

  return data;
};

// Elimina un producto del carrito
export const removeFromCart = async (itemId) => {
  const response = await fetch(`${API}/cart/item/${itemId}`, {
    method: "DELETE",
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar el producto.");
  }

  return data;
};

// Confirma el pedido: convierte el carrito activo en una orden real (sin pago, es escolar).
// deliveryMethod: "shipping" (default, a domicilio) o "pickup" (el cliente
// recoge él mismo en uno de los puntos que guardó la emprendedora -- en ese
// caso se manda pickupLocationId en vez de la dirección/mapa de envío).
export const checkoutCart = async ({ shippingAddress, contactPhone, couponCode, shippingCost, shippingLat, shippingLng, deliveryMethod, pickupLocationId }) => {
  const response = await fetch(`${API}/cart/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ shippingAddress, contactPhone, couponCode, shippingCost, shippingLat, shippingLng, deliveryMethod, pickupLocationId })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo confirmar el pedido.");
  }

  return data;
};
