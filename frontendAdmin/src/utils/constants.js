// Niveles del programa de fidelidad, ordenados de menor a mayor
export const LEVELS = [
  { name: "Semilla", min: 0 },
  { name: "Planta", min: 500 },
  { name: "Bosque", min: 3000 },
];

export const NAV_LINKS = [
  { label: "Nuevos Productos", href: "#" },
  { label: "Macetas", href: "#" },
  { label: "Velas", href: "#" },
  { label: "Otros", href: "#" },
  { label: "Plantas y Cuidado", href: "#" },
  { label: "Ofertas", to: "/" },
  { label: "Nosotros", href: "#" },
];

// Formatea números grandes con separador de miles (2450 -> "2,450")
export function formatNumber(num) {
  return num.toLocaleString("en-US");
}

// Listas cerradas para los campos de producto que antes eran texto libre.
// Con una lista, el admin elige en vez de escribir (sin errores de ortografía
// ni valores repetidos con distinto nombre: "Terracota" / "terracota ").
export const COLORES_PRODUCTO = [
  "Blanco", "Negro", "Gris", "Beige", "Café", "Terracota", "Verde", "Azul",
  "Rojo", "Rosado", "Amarillo", "Naranja", "Morado", "Dorado", "Plateado", "Multicolor",
];

export const AROMAS_VELA = [
  "Lavanda", "Vainilla", "Canela", "Coco", "Sándalo", "Jazmín", "Eucalipto",
  "Cítricos", "Rosa", "Café", "Menta", "Sin aroma",
];
