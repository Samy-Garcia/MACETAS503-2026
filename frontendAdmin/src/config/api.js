// URL base del backend. En desarrollo local usa localhost:4000 por defecto;
// en producción (Vercel) se debe definir VITE_API_URL en las variables de
// entorno del proyecto, apuntando a la URL real de Render.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
