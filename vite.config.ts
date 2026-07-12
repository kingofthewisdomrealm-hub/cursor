import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const isGhPages = process.env.GITHUB_ACTIONS === 'true' || process.env.DEPLOY_PAGES === 'true';

export default defineConfig({
  base: isGhPages ? '/cursor/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
  },
});
