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
