// frontend/vite.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000 // Asegúrate de que esto siga aquí para el puerto 3000
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.jsx', // O .js si tu archivo es así
    css: false,
    include: ['tests/**/*.test.{js,jsx,ts,tsx}'],
    testTimeout: 30000, // <--- ¡Aumentado a 30 segundos!
  },
});