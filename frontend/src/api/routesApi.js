import { API_BASE_URL } from '../config/api.js';
const API = `${API_BASE_URL}/api`;
 
// Obtiene la ruta (distancia, duración y geometría) entre dos puntos.
// origen y destino: { lat: number, lng: number }
export const getRuta = async (origen, destino) => {
  const params = new URLSearchParams({
    origen: `${origen.lng},${origen.lat}`,
    destino: `${destino.lng},${destino.lat}`,
  });
 
  const response = await fetch(`${API}/ruta?${params.toString()}`, {
    method: "GET"
  });
 
  const data = await response.json();
 
  if (!response.ok) {
    throw new Error(data.error || "No se pudo calcular la ruta.");
  }
 
  return data;
};