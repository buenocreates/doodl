import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        wallet: './js/wallet-adapter-app.jsx'
      },
      output: {
        entryFileNames: 'wallet-adapter-app.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'wallet-adapter-app.css';
          }
          return assetInfo.name || 'asset';
        },
        format: 'iife',
        name: 'WalletAdapterApp'
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
});
