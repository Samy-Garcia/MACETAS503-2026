// Utilidades de fechas para formularios.
// IMPORTANTE: new Date().toISOString() devuelve la fecha en UTC, así que en
// El Salvador (UTC-6) después de las 6:00 p.m. ya marcaría "mañana". Aquí se
// usa la fecha LOCAL del navegador para que "hoy" sea realmente hoy.

const pad = (n) => String(n).padStart(2, "0");

// Hoy en formato YYYY-MM-DD (el que usan <input type="date"> min/max)
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// true si la fecha (YYYY-MM-DD) ya pasó (hoy cuenta como válido)
export const isPastDate = (iso) => !!iso && iso < todayISO();

// true si la fecha (YYYY-MM-DD) es posterior a hoy
export const isFutureDate = (iso) => !!iso && iso > todayISO();
