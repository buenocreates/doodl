import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        privy: './js/privy-app.jsx'
      },
      output: {
        entryFileNames: 'privy-app.js',
        format: 'iife',
        name: 'PrivyApp'
      }
    }
  }
});
