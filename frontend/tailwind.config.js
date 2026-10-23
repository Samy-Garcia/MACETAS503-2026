/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Copiamos la paleta de tu compañera
        primary: {
          50: "#f1f6f2",
          100: "#dcebe0",
          200: "#b3d3bb",
          300: "#84b892",
          400: "#549b68",
          500: "#2f7a45",
          600: "#1f5c33",
          700: "#184a29",
          800: "#0f3319",
          900: "#0a2312",
        },
        gold: {
          400: "#f3c94f",
          500: "#e8b923",
          600: "#c99e17",
        },
      },
      fontFamily: {
        // También copiamos su configuración de fuente
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px rgba(15, 51, 25, 0.08)",
      },
    },
  },
  plugins: [],
}