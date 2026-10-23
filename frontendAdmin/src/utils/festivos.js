// Catálogo de paletas de festividad para la personalización del sitio.
// Cada preset define los mismos 3 colores que el modo "Personalizado"
// (primaryColor, backgroundColor, surfaceColor) más un emoji decorativo que
// se agrega al banner superior mientras esa festividad esté activa.
//
// NOTA: este archivo está duplicado en frontendAdmin/src/utils/festivos.js
// con el mismo contenido -- son dos proyectos/despliegues separados sin un
// paquete compartido entre ellos, así que se mantiene igual en los dos a
// mano. Si agregan o cambian un preset, hay que actualizar ambas copias.
export const FESTIVOS = {
  navidad: {
    label: "Navidad",
    primaryColor: "#b91c1c",
    backgroundColor: "#fff8f5",
    surfaceColor: "#ffffff",
    emoji: "🎄",
  },
  anonuevo: {
    label: "Año Nuevo",
    primaryColor: "#a16207",
    backgroundColor: "#fffbea",
    surfaceColor: "#ffffff",
    emoji: "🎆",
  },
  sanvalentin: {
    label: "San Valentín",
    primaryColor: "#db2777",
    backgroundColor: "#fff0f5",
    surfaceColor: "#ffffff",
    emoji: "💘",
  },
  diamadre: {
    label: "Día de la Madre",
    primaryColor: "#c026d3",
    backgroundColor: "#fdf2ff",
    surfaceColor: "#ffffff",
    emoji: "💐",
  },
  halloween: {
    label: "Halloween",
    primaryColor: "#c2410c",
    backgroundColor: "#fdf4ec",
    surfaceColor: "#ffffff",
    emoji: "🎃",
  },
  independencia: {
    label: "Día de la Independencia",
    primaryColor: "#1d4ed8",
    backgroundColor: "#f0f5ff",
    surfaceColor: "#ffffff",
    emoji: "🇸🇻",
  },
};

// Paleta original de la marca -- se usa en el modo "Predeterminado", sin
// importar lo que el admin haya guardado antes en Personalizado.
export const TEMA_PREDETERMINADO = {
  primaryColor: "#064225",
  backgroundColor: "#fcfdfc",
  surfaceColor: "#ffffff",
};

/**
 * Resuelve los 3 colores efectivos + el emoji decorativo (si aplica) según
 * el modo de tema guardado en config.theme.
 *
 * @param {Object} theme - config.theme tal como viene del backend
 * @param {"default"|"personalizado"|"festivo"} theme.mode
 * @param {string} theme.festivoKey
 * @param {string} theme.primaryColor
 * @param {string} theme.backgroundColor
 * @param {string} theme.surfaceColor
 */
export const resolverPaleta = (theme) => {
  const mode = theme?.mode || "default";

  if (mode === "festivo") {
    const preset = FESTIVOS[theme?.festivoKey];
    if (preset) {
      return {
        primaryColor: preset.primaryColor,
        backgroundColor: preset.backgroundColor,
        surfaceColor: preset.surfaceColor,
        emoji: preset.emoji,
      };
    }
    // festivoKey inválido/vacío -- se cae al predeterminado en vez de romper
    return { ...TEMA_PREDETERMINADO, emoji: "" };
  }

  if (mode === "personalizado") {
    return {
      primaryColor: theme?.primaryColor || TEMA_PREDETERMINADO.primaryColor,
      backgroundColor: theme?.backgroundColor || TEMA_PREDETERMINADO.backgroundColor,
      surfaceColor: theme?.surfaceColor || TEMA_PREDETERMINADO.surfaceColor,
      emoji: "",
    };
  }

  // "default" (o cualquier valor desconocido, por seguridad)
  return { ...TEMA_PREDETERMINADO, emoji: "" };
};
