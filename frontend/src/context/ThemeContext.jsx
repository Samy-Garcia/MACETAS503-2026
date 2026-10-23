import { createContext, useContext, useEffect, useState } from 'react';
import { getConfig } from '../api/configApi.js';
import { resolverPaleta } from '../utils/festivos.js';

const ThemeContext = createContext({
  logoUrl: '',
  primaryColor: '#064225',
  backgroundColor: '#fcfdfc',
  surfaceColor: '#ffffff',
  darkMode: false,
  emoji: ''
});

// --- Utilidades de color: derivar toda la escala (500-900) a partir del
// único color que elige el admin, para que botones, textos y degradados
// que usan distintos tonos de "primary" cambien todos juntos y no solo el
// que coincide exactamente con el color elegido. ---
const hexToHsl = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
};

const hslToHex = (h, s, l) => {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const toHex = (v) => Math.max(0, Math.min(255, Math.round((v + m) * 255))).toString(16).padStart(2, '0');
  return '#' + [r, g, b].map(toHex).join('');
};

// Diferencia de luminosidad de cada paso respecto a "700" en la escala
// actual (#f1f6f2..#0a2312), para poder reproducir la misma "distancia"
// de tono a partir de cualquier color que elija el admin.
const L_DELTA = { 500: 15, 600: 8, 700: 0, 800: -5, 900: -9 };

// Genera { 500: '#...', 600: '#...', 700: hex, 800: '#...', 900: '#...' }
const derivarEscala = (hex) => {
  const [h, s, l] = hexToHsl(hex);
  const escala = {};
  for (const paso of [500, 600, 700, 800, 900]) {
    const nuevaL = Math.max(4, Math.min(96, l + L_DELTA[paso]));
    escala[paso] = paso === 700 ? hex : hslToHex(h, s, nuevaL);
  }
  return escala;
};

// NOTA sobre el modo oscuro: solo aplica la clase "dark" en <html> y ajusta
// el fondo/texto base (ver @layer base en index.css). El sitio NO tiene
// todavía variantes dark: en cada componente -- eso es un trabajo aparte,
// mucho más grande, de revisar componente por componente. Por ahora el
// toggle deja el fondo y texto general en oscuro, pero tarjetas/botones
// puntuales pueden seguir viéndose con sus colores de siempre.
export const ThemeProvider = ({ children }) => {
  // rawTheme = tal como viene de la BD (incluye mode/festivoKey). paleta =
  // los colores YA resueltos según ese modo (ver resolverPaleta), que son
  // los que realmente se aplican y se exponen al resto de la app.
  const [rawTheme, setRawTheme] = useState({ mode: 'default', festivoKey: '', primaryColor: '#064225', backgroundColor: '#fcfdfc', surfaceColor: '#ffffff', darkMode: false });
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    let activo = true;
    getConfig()
      .then((config) => {
        if (!activo || !config?.theme) return;
        setRawTheme({
          mode: config.theme.mode || 'default',
          festivoKey: config.theme.festivoKey || '',
          primaryColor: config.theme.primaryColor || '#064225',
          backgroundColor: config.theme.backgroundColor || '#fcfdfc',
          surfaceColor: config.theme.surfaceColor || '#ffffff',
          darkMode: !!config.theme.darkMode
        });
        setLogoUrl(config.theme.logoUrl || '');
      })
      .catch(() => {
        // Si falla, se queda con los valores por defecto -- el sitio sigue
        // funcionando igual, solo sin la personalización.
      });
    return () => { activo = false; };
  }, []);

  const paleta = resolverPaleta(rawTheme);

  useEffect(() => {
    const escala = derivarEscala(paleta.primaryColor);
    for (const [paso, hex] of Object.entries(escala)) {
      document.documentElement.style.setProperty(`--color-primary-${paso}`, hex);
    }
    document.documentElement.style.setProperty('--color-page', paleta.backgroundColor);
    document.documentElement.style.setProperty('--color-surface', paleta.surfaceColor);
    document.documentElement.classList.toggle('dark', rawTheme.darkMode);
  }, [paleta.primaryColor, paleta.backgroundColor, paleta.surfaceColor, rawTheme.darkMode]);

  const value = {
    logoUrl,
    primaryColor: paleta.primaryColor,
    backgroundColor: paleta.backgroundColor,
    surfaceColor: paleta.surfaceColor,
    darkMode: rawTheme.darkMode,
    emoji: paleta.emoji || ''
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
