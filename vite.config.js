import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['pv-d4381044e675-be769086-4ab5-4849-8cdb-3919cefbd7b4.style.dev'],
  },
});
