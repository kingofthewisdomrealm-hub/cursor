import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const isGhPages = process.env.GITHUB_ACTIONS === 'true' || process.env.DEPLOY_PAGES === 'true';
const isStandalone = process.env.DEPLOY_STANDALONE === 'true';

export default defineConfig({
  base: isStandalone ? './' : isGhPages ? '/cursor/' : '/',
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
