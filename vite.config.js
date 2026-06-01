import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/friendly-classroom-v2/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});