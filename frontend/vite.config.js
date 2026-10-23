import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // 1. Importamos la utilidad de rutas de Node

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 2. Le enseñamos a Vite que "@" significa la carpeta "src"
      '@': path.resolve(__dirname, './src'),
    },
  },
})