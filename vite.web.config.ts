import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { renameSync, existsSync, rmSync } from 'fs';
import { resolve } from 'path';

/** Customer web app → backend/web (served at /app/ on Render). */
export default defineConfig({
  base: '/app/',
  plugins: [
    react(),
    {
      name: 'rename-web-index',
      closeBundle() {
        const from = resolve(__dirname, 'backend/web/index.web.html');
        const to = resolve(__dirname, 'backend/web/index.html');
        if (existsSync(from)) {
          if (existsSync(to)) rmSync(to);
          renameSync(from, to);
        }
        const nested = resolve(__dirname, 'backend/web/web');
        if (existsSync(nested)) rmSync(nested, { recursive: true, force: true });
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'backend/web',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.web.html'),
      },
    },
  },
});
