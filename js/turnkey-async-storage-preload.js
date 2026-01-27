// Preload AsyncStorage polyfill - Must execute BEFORE Turnkey app loads
// This ensures AsyncStorage is available for Turnkey's runtime detection

(function() {
  'use strict';
  
  if (typeof window === 'undefined') return;
  
  // Only create if it doesn't exist
  if (window.AsyncStorage && window.__ASYNC_STORAGE_POLYFILL_LOADED__) {
    console.log('✅ AsyncStorage already exists, skipping polyfill');
    return;
  }
  
  const AsyncStorage = {
    getItem: function(key) {
      try {
        const value = localStorage.getItem(key);
        return Promise.resolve(value);
      } catch (e) {
        return Promise.resolve(null);
      }
    },
    setItem: function(key, value) {
      try {
        localStorage.setItem(key, value);
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    },
    removeItem: function(key) {
      try {
        localStorage.removeItem(key);
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    },
    clear: function() {
      try {
        localStorage.clear();
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    },
    getAllKeys: function() {
      try {
        return Promise.resolve(Object.keys(localStorage));
      } catch (e) {
        return Promise.resolve([]);
      }
    },
    multiGet: function(keys) {
      try {
        const result = keys.map(key => [key, localStorage.getItem(key)]);
        return Promise.resolve(result);
      } catch (e) {
        return Promise.resolve([]);
      }
    },
    multiSet: function(keyValuePairs) {
      try {
        keyValuePairs.forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    },
    multiRemove: function(keys) {
      try {
        keys.forEach(key => localStorage.removeItem(key));
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    }
  };
  
  // Intercept require() calls BEFORE setting up anything else
  // This is critical - Turnkey might call require() synchronously during module load
  if (typeof window !== 'undefined') {
    // Intercept require if it exists (for CommonJS environments)
    const originalRequire = window.require || (typeof require !== 'undefined' ? require : null);
    
    if (originalRequire) {
      // Wrap require to intercept AsyncStorage requests
      const wrappedRequire = function(id) {
        if (id === '@react-native-async-storage/async-storage' || 
            id.includes('async-storage')) {
          return AsyncStorage;
        }
        return originalRequire.apply(this, arguments);
      };
      
      // Copy properties from original require
      Object.keys(originalRequire).forEach(key => {
        wrappedRequire[key] = originalRequire[key];
      });
      
      // Set up require.cache
      if (!wrappedRequire.cache) {
        wrappedRequire.cache = {};
      }
      wrappedRequire.cache['@react-native-async-storage/async-storage'] = {
        exports: AsyncStorage,
        loaded: true,
        id: '@react-native-async-storage/async-storage'
      };
      
      // Override require.resolve
      const originalResolve = wrappedRequire.resolve;
      wrappedRequire.resolve = function(id) {
        if (id === '@react-native-async-storage/async-storage') {
          return '@react-native-async-storage/async-storage';
        }
        if (typeof originalResolve === 'function') {
          return originalResolve.apply(this, arguments);
        }
        return id;
      };
      
      // Try to replace require on window if possible
      try {
        window.require = wrappedRequire;
      } catch (e) {
        // Ignore if can't replace
      }
    }
    
    // Also intercept global require if it exists
    if (typeof require !== 'undefined') {
      const globalRequire = require;
      if (!globalRequire.cache) {
        globalRequire.cache = {};
      }
      globalRequire.cache['@react-native-async-storage/async-storage'] = {
        exports: AsyncStorage,
        loaded: true,
        id: '@react-native-async-storage/async-storage'
      };
    }
  }
  
  // Make available globally on all possible global objects
  window.AsyncStorage = AsyncStorage;
  window.__ASYNC_STORAGE_POLYFILL_LOADED__ = true;
  
  if (typeof globalThis !== 'undefined') {
    globalThis.AsyncStorage = AsyncStorage;
    globalThis.__ASYNC_STORAGE_POLYFILL_LOADED__ = true;
  }
  if (typeof global !== 'undefined') {
    global.AsyncStorage = AsyncStorage;
    global.__ASYNC_STORAGE_POLYFILL_LOADED__ = true;
  }
  
  // Ensure AsyncStorage is available for Turnkey's MobileStorageManager detection
  // Turnkey checks for AsyncStorage in various ways, so we need to cover all bases
  try {
    Object.defineProperty(window, 'AsyncStorage', {
      value: AsyncStorage,
      writable: true,  // Make writable so Turnkey can override if needed
      configurable: true,  // Make configurable
      enumerable: true
    });
  } catch (e) {
    // If defineProperty fails, just assign it
    window.AsyncStorage = AsyncStorage;
  }
  
  // Also ensure it's available on globalThis
  if (typeof globalThis !== 'undefined') {
    try {
      Object.defineProperty(globalThis, 'AsyncStorage', {
        value: AsyncStorage,
        writable: true,
        configurable: true,
        enumerable: true
      });
    } catch (e) {
      globalThis.AsyncStorage = AsyncStorage;
    }
  }
  
  // Create a module-like object for ES module imports
  if (typeof window !== 'undefined') {
    window.__ASYNC_STORAGE_MODULE__ = {
      default: AsyncStorage,
      AsyncStorage: AsyncStorage,
      __esModule: true
    };
  }
  
  console.log('✅ AsyncStorage polyfill preloaded');
})();
