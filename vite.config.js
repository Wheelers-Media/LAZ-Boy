import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS].filter(Boolean),
  },
  preview: {
    host: '0.0.0.0',
  },
});
