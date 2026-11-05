import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Relative asset URLs, so the build works from any folder (the demo serves it next to the mobile app).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: { outDir: 'dist', assetsDir: 'web', chunkSizeWarningLimit: 1500 },
});
