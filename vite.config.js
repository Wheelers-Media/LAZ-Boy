import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['pv-d4381044e675-db973148-e806-40b4-877c-e306387fa3e6.style.dev'],
  },
  preview: {
    host: '0.0.0.0',
  },
});
