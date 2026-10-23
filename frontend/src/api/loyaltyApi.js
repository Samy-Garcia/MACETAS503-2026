import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;

export const claimBirthday = async () => {
  const response = await fetch(`${API}/loyalty/claim-birthday`, {
    method: "POST",
    credentials: "include"
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo reclamar el bono de cumpleaños.");
  return data;
};

export const getEarnMethods = async () => {
  const response = await fetch(`${API}/earn-methods/active`, { method: "GET" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudieron obtener las formas de ganar puntos.");
  return data;
};

export const getMyLoyalty = async () => {
  const response = await fetch(`${API}/loyalty/mine`, { method: "GET", credentials: "include" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo obtener tu programa de fidelidad.");
  return data;
};

export const getRewardsCatalog = async () => {
  const response = await fetch(`${API}/loyalty/rewards`, { method: "GET", credentials: "include" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo obtener el catálogo de recompensas.");
  return data;
};

export const redeemReward = async (rewardId) => {
  const response = await fetch(`${API}/loyalty/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ rewardId })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudo canjear la recompensa.");
  return data;
};

export const getMyRedemptions = async () => {
  const response = await fetch(`${API}/loyalty/redemptions`, { method: "GET", credentials: "include" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "No se pudieron obtener tus canjes.");
  return data;
};
