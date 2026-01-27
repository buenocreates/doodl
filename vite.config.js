import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Plugin to replace AsyncStorage detection in Turnkey code
const turnkeyAsyncStoragePlugin = () => {
  return {
    name: 'turnkey-async-storage-polyfill',
    transform(code, id) {
      // Replace Turnkey's AsyncStorage detection/require calls
      if (id.includes('@turnkey') || id.includes('turnkey')) {
        // Replace require('@react-native-async-storage/async-storage') with window.AsyncStorage
        code = code.replace(
          /require\(['"]@react-native-async-storage\/async-storage['"]\)/g,
          '(typeof window !== "undefined" && window.AsyncStorage ? window.AsyncStorage : (() => { throw new Error("AsyncStorage not found"); })())'
        );
        
        // Replace dynamic imports
        code = code.replace(
          /import\(['"]@react-native-async-storage\/async-storage['"]\)/g,
          'Promise.resolve(typeof window !== "undefined" && window.AsyncStorage ? window.AsyncStorage : (() => { throw new Error("AsyncStorage not found"); })())'
        );
        
        // Replace checks for AsyncStorage package
        code = code.replace(
          /try\s*\{[^}]*require\(['"]@react-native-async-storage\/async-storage['"]\)[^}]*\}\s*catch[^}]*throw\s+new\s+Error\(['"]Please\s+install\s+@react-native-async-storage/gi,
          'if (typeof window === "undefined" || !window.AsyncStorage) { throw new Error("Please install @react-native-async-storage/async-storage in your app to use MobileStorageManager"); } const AsyncStorage = window.AsyncStorage;'
        );
      }
      return { code, map: null };
    }
  };
};

export default defineConfig({
  plugins: [react(), turnkeyAsyncStoragePlugin()],
  resolve: {
    alias: {
      // Map React Native async storage to our browser polyfill
      // The real package is installed but needs browser polyfill
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'js/turnkey-async-storage.js'),
      'react-native': 'react-native-web'
    }
  },
  build: {
    outDir: 'dist',
    commonjsOptions: {
      transformMixedEsModules: true,
      // Ensure CommonJS modules can find AsyncStorage
      include: [/node_modules/]
    },
    rollupOptions: {
      input: {
        turnkey: './js/turnkey-app.jsx'
      },
      output: {
        entryFileNames: 'turnkey-app.js',
        format: 'iife',
        name: 'TurnkeyApp',
        globals: {
          '@react-native-async-storage/async-storage': 'AsyncStorage'
        },
        // Ensure AsyncStorage is available in the bundle
        banner: `if (typeof window !== 'undefined' && !window.AsyncStorage) {
          window.AsyncStorage = {
            getItem: (k) => Promise.resolve(localStorage.getItem(k)),
            setItem: (k, v) => Promise.resolve(localStorage.setItem(k, v)),
            removeItem: (k) => Promise.resolve(localStorage.removeItem(k)),
            clear: () => Promise.resolve(localStorage.clear()),
            getAllKeys: () => Promise.resolve(Object.keys(localStorage)),
            multiGet: (keys) => Promise.resolve(keys.map(k => [k, localStorage.getItem(k)])),
            multiSet: (pairs) => { pairs.forEach(([k,v]) => localStorage.setItem(k,v)); return Promise.resolve(); },
            multiRemove: (keys) => { keys.forEach(k => localStorage.removeItem(k)); return Promise.resolve(); }
          };
        }`
      },
      onwarn(warning, warn) {
        // Suppress warnings about Node.js crypto modules - they're handled by Turnkey
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.source?.includes('nodecrypto')) {
          return;
        }
        // Suppress AsyncStorage warnings since we're using a polyfill
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.source?.includes('async-storage')) {
          return;
        }
        warn(warning);
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    '__DEV__': false,
    // Make AsyncStorage available as a global
    'global.AsyncStorage': 'window.AsyncStorage'
  },
  optimizeDeps: {
    exclude: ['@react-native-async-storage/async-storage']
  }
});
