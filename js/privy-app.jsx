// Privy React App - Wrapper for Privy SDK
import React from 'react';
import ReactDOM from 'react-dom/client';
import { PrivyProvider, usePrivy, useWallets, useConnectWallet } from '@privy-io/react-auth';
import { toSolanaWalletConnectors, useSolanaWallets } from '@privy-io/react-auth/solana';

// Get Privy App ID from server
let PRIVY_APP_ID = 'cmkdyx5cg02hvlb0cexfoj8sj';

// Log current domain for debugging
console.log('Current origin:', window.location.origin);
console.log('Current hostname:', window.location.hostname);

// Fetch from server on init
fetch('/api/privy-config')
  .then(res => res.json())
  .then(config => {
    PRIVY_APP_ID = config.appId;
    console.log('Privy App ID loaded:', PRIVY_APP_ID);
  })
  .catch((err) => {
    console.warn('Failed to fetch Privy config, using default:', err);
    // Use default if fetch fails
  });

// Wallet Connect Component
function WalletConnectButton() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const { wallets: solanaWallets } = useSolanaWallets();
  const { connectWallet } = useConnectWallet({
    onSuccess: ({ wallet }) => {
      console.log('✅ Wallet connected successfully:', wallet);
    },
    onError: (error) => {
      console.error('❌ Wallet connection error:', error);
    }
  });
  
  React.useEffect(() => {
    console.log('Wallet state changed:', { 
      ready, 
      authenticated, 
      walletCount: wallets.length,
      solanaWalletCount: solanaWallets.length 
    });
    
    // Check both regular wallets and Solana-specific wallets
    const solanaWallet = wallets.find(w => w.chainType === 'solana') || solanaWallets[0];
    
      // If we have a Solana wallet, use it even if authentication session has errors
      // The wallet connection itself succeeded, so we should allow the user to proceed
      if (ready && solanaWallet && solanaWallet.address) {
        console.log('Found Solana wallet:', {
          address: solanaWallet.address,
          walletClientType: solanaWallet.walletClientType,
          chainType: solanaWallet.chainType,
          isExternal: solanaWallet.walletClientType === 'phantom' || solanaWallet.walletClientType === 'solflare',
          authenticated: authenticated
        });
        
        // Set wallet address if we have one, even if authentication session failed
        // This allows users to play even if Privy's authentication session has errors
        if (window.userWalletAddress !== solanaWallet.address) {
          window.userWalletAddress = solanaWallet.address;
          console.log('✅ Setting wallet address:', solanaWallet.address);
          console.log('✅ Dispatching privy-wallet-connected event');
          
          // Dispatch the event to enable play buttons
          const event = new CustomEvent('privy-wallet-connected', {
            detail: { address: solanaWallet.address }
          });
          window.dispatchEvent(event);
          
          // Show success notification with Privy branding
          setTimeout(() => {
            // Access the showSuccessNotification function from the parent scope
            if (window.showPrivySuccessNotification) {
              window.showPrivySuccessNotification(solanaWallet.address);
            }
          }, 500);
          
          // Also manually enable buttons in case event listener isn't working
          setTimeout(() => {
            const playBtn = document.getElementById('play-button');
            const createBtn = document.getElementById('create-button');
            if (playBtn) {
              playBtn.disabled = false;
              playBtn.style.opacity = '1';
              playBtn.style.cursor = 'pointer';
              console.log('✅ Enabled play button');
            }
            if (createBtn) {
              createBtn.disabled = false;
              createBtn.style.opacity = '1';
              createBtn.style.cursor = 'pointer';
              console.log('✅ Enabled create button');
            }
          }, 100);
        }
      } else if (ready && authenticated && wallets.length > 0) {
      // User authenticated but no Solana wallet found
      const nonSolanaWallets = wallets.filter(w => w.chainType !== 'solana');
      if (nonSolanaWallets.length > 0) {
        console.warn('User authenticated but no Solana wallet found. Other wallets:', nonSolanaWallets.map(w => ({
          chainType: w.chainType,
          walletClientType: w.walletClientType
        })));
      }
    } else if (ready && !authenticated && solanaWallets.length === 0 && wallets.length === 0) {
      // No wallets at all and not authenticated - clear wallet address
      if (window.userWalletAddress) {
        console.log('No wallets found and not authenticated, clearing wallet address');
        window.userWalletAddress = null;
        window.dispatchEvent(new CustomEvent('privy-wallet-disconnected'));
      }
    }
  }, [ready, authenticated, wallets, solanaWallets]);
  
  const handleConnect = async () => {
    try {
      console.log('🔌 Attempting to connect wallet...');
      console.log('Current origin:', window.location.origin);
      console.log('Privy App ID:', PRIVY_APP_ID);
      console.log('Current authenticated state:', authenticated);
      
      // Check if user has Phantom or Solflare installed
      const hasPhantom = window.solana && window.solana.isPhantom;
      const hasSolflare = window.solana && window.solana.isSolflare;
      
      console.log('🔍 Wallet detection:', { 
        hasPhantom, 
        hasSolflare, 
        hasConnectWallet: !!connectWallet,
        solanaWalletsCount: solanaWallets.length 
      });
      
      // Check if wallet is already connected but not authenticated
      const existingSolanaWallet = solanaWallets[0] || wallets.find(w => w.chainType === 'solana');
      
      if (authenticated) {
        // Already authenticated - check if we have a wallet
        const solanaWallet = wallets.find(w => w.chainType === 'solana') || solanaWallets[0];
        if (solanaWallet && solanaWallet.address) {
          console.log('✅ Already authenticated with wallet:', solanaWallet.address);
        } else {
          console.log('✅ Already authenticated but no Solana wallet found');
        }
      } else if (existingSolanaWallet && existingSolanaWallet.address) {
        // Wallet is connected but not authenticated - authenticate it
        console.log('📱 Wallet already connected, attempting to authenticate...');
        console.log('Wallet details:', {
          address: existingSolanaWallet.address,
          walletClientType: existingSolanaWallet.walletClientType,
          chainType: existingSolanaWallet.chainType
        });
        
        try {
          // Use login() which will complete the SIWS flow for the connected wallet
          // This will prompt the user to sign a message if needed
          console.log('📱 Starting authentication flow...');
          await login();
          console.log('✅ Login flow completed');
          
          // Wait longer for authentication to complete (SIWS can take time)
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Re-check authentication state
          if (authenticated) {
            console.log('✅ Wallet authenticated successfully');
          } else {
            console.warn('⚠️ Authentication may have failed, but wallet is still connected and usable');
            console.warn('Wallet address:', existingSolanaWallet.address);
          }
        } catch (authError) {
          console.warn('⚠️ Authentication error, but wallet remains connected:', authError);
          console.warn('Wallet address is still available:', existingSolanaWallet.address);
        }
      } else {
        // No wallet connected - show login modal to connect and authenticate
        console.log('📱 No wallet connected, opening Privy login modal...');
        
        try {
          // login() handles both connection and authentication
          // It will show a modal where users can select their wallet
          // After connecting, Privy will automatically authenticate and create an account if needed
          await login();
          console.log('✅ Login modal closed');
          
          // Wait for authentication to complete (SIWS can take time)
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check the result
          const solanaWallet = wallets.find(w => w.chainType === 'solana') || solanaWallets[0];
          if (solanaWallet && solanaWallet.address) {
            if (authenticated) {
              console.log('✅ Solana wallet connected and authenticated:', solanaWallet.address);
            } else {
              console.warn('⚠️ Wallet connected but authentication pending:', solanaWallet.address);
            }
          } else if (authenticated && wallets.length > 0) {
            console.warn('⚠️ User authenticated but no Solana wallet. Available wallets:', wallets.map(w => w.walletClientType));
          } else if (!authenticated) {
            console.warn('⚠️ Login completed but user not authenticated. Checking for connected wallet...');
            // Check if wallet is connected even without authentication
            const connectedWallet = solanaWallets[0] || wallets.find(w => w.chainType === 'solana');
            if (connectedWallet && connectedWallet.address) {
              console.log('✅ Wallet connected (authentication may be pending):', connectedWallet.address);
            }
          }
        } catch (loginError) {
          // Even if login fails, check if wallet was connected
          console.warn('⚠️ Login error, but checking if wallet was connected:', loginError);
          await new Promise(resolve => setTimeout(resolve, 1000));
          const solanaWallet = solanaWallets[0] || wallets.find(w => w.chainType === 'solana');
          if (solanaWallet && solanaWallet.address) {
            console.log('✅ Wallet connected despite login error:', solanaWallet.address);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Error connecting wallet:', error);
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Error name:', error?.name);
      console.error('Error stack:', error?.stack);
      
      // Try to get more details from the error
      if (error?.response) {
        console.error('Error response:', error.response);
      }
      if (error?.data) {
        console.error('Error data:', error.data);
      }
      
      // Try to stringify error for more details
      try {
        const errorDetails = {};
        Object.getOwnPropertyNames(error).forEach(key => {
          try {
            errorDetails[key] = error[key];
          } catch (e) {
            errorDetails[key] = '[Unable to serialize]';
          }
        });
        console.error('Full error details:', JSON.stringify(errorDetails, null, 2));
      } catch (e) {
        console.error('Could not stringify error');
      }
      
      // Show user-friendly error notification
      const notification = document.createElement('div');
      notification.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #dc3545; color: #fff; padding: 15px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10000; max-width: 300px; font-family: Nunito, sans-serif; font-weight: 600;';
      const errorMsg = error?.message || 'Unknown error';
      notification.innerHTML = `<div style="position: absolute; top: 5px; right: 5px; background: transparent; border: 1px solid rgba(255,255,255,0.5); color: #fff; width: 24px; height: 24px; border-radius: 4px; cursor: pointer; font-size: 18px; line-height: 1; display: flex; align-items: center; justify-content: center; padding: 0;" onclick="this.parentElement.remove()">×</div><div style="font-size: 16px; font-weight: 700; margin-bottom: 5px;">Connection Error</div><div style="font-size: 14px;">${errorMsg}</div>`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);
    }
  };
  
  const handleDisconnect = () => {
    logout();
  };
  
  if (!ready) {
    return null;
  }
  
  if (authenticated) {
    // User is authenticated - check if they have a Solana wallet
    const solanaWallet = wallets.find(w => w.chainType === 'solana') || solanaWallets[0];
    
    if (solanaWallet) {
      // User has a Solana wallet (embedded or external)
      const address = solanaWallet.address || '';
      const shortAddress = address ? `${address.substring(0, 4)}...${address.substring(address.length - 4)}` : '';
      const isExternal = solanaWallet.walletClientType === 'phantom' || solanaWallet.walletClientType === 'solflare';
      
      return (
        <div id="header-wallet-info" style={{ display: 'block', color: '#fff', fontSize: '0.9em', marginTop: '5px', textAlign: 'center' }}>
          <div id="header-wallet-address" style={{ marginBottom: '5px' }}>
            {shortAddress}
            {isExternal && <span style={{ fontSize: '0.8em', opacity: 0.7, marginLeft: '5px' }}>({solanaWallet.walletClientType})</span>}
          </div>
          <button 
            id="header-wallet-disconnect" 
            onClick={handleDisconnect}
            style={{ padding: '5px 10px', fontSize: '0.8em', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '5px', color: '#fff', cursor: 'pointer' }}
          >
            Disconnect
          </button>
        </div>
      );
    } else {
      // User is authenticated but no Solana wallet yet
      // This can happen if they logged in with email but haven't connected a wallet
      console.warn('User authenticated but no Solana wallet found. Available wallets:', wallets);
      return (
        <div id="header-wallet-info" style={{ display: 'block', color: '#fff', fontSize: '0.9em', marginTop: '5px', textAlign: 'center' }}>
          <div style={{ marginBottom: '5px', color: '#ffa500' }}>No Solana wallet</div>
          <button 
            onClick={() => connectWallet({ walletChainType: 'solana-only' })}
            style={{ padding: '5px 10px', fontSize: '0.8em', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '5px', color: '#fff', cursor: 'pointer' }}
          >
            Connect Wallet
          </button>
        </div>
      );
    }
  }
  
  return (
    <button 
      id="header-wallet-connect-btn" 
      onClick={handleConnect}
      style={{ background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 3px 8px rgba(0,0,0,0.3)' }}
    >
      <span id="wallet-btn-text">Connect Wallet</span>
    </button>
  );
}

// Main Privy App Component
function PrivyApp() {
  // Add error handler for Privy errors
  React.useEffect(() => {
    // Make success notification function globally available
    window.showPrivySuccessNotification = (walletAddress) => {
      // Remove any existing success notifications
      const existing = document.getElementById('privy-success-notification');
      if (existing) {
        existing.remove();
      }
      
      const shortAddress = walletAddress ? `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}` : '';
      
      const notification = document.createElement('div');
      notification.id = 'privy-success-notification';
      notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 2px solid #9945FF;
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 8px 32px rgba(153, 69, 255, 0.3);
        z-index: 10001;
        max-width: 400px;
        width: 90%;
        text-align: center;
        font-family: 'Nunito', sans-serif;
        color: #fff;
        animation: slideIn 0.3s ease-out;
      `;
      
      // Add animation if not already added
      if (!document.getElementById('privy-success-animation')) {
        const style = document.createElement('style');
        style.id = 'privy-success-animation';
        style.textContent = `
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translate(-50%, -60%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      notification.innerHTML = `
        <div style="margin-bottom: 20px;">
          <div style="
            width: 64px;
            height: 64px;
            margin: 0 auto;
            background: linear-gradient(135deg, #9945FF 0%, #14F195 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            box-shadow: 0 4px 16px rgba(153, 69, 255, 0.4);
          ">
            ✓
          </div>
        </div>
        <h2 style="
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: #14F195;
        ">Wallet Connected Successfully!</h2>
        <p style="
          font-size: 16px;
          margin: 0 0 16px 0;
          color: rgba(255, 255, 255, 0.9);
        ">Your wallet ${shortAddress ? `(${shortAddress})` : ''} is now connected and ready to use.</p>
        <div style="
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        ">
          <span>Protected by</span>
          <span style="
            background: linear-gradient(135deg, #9945FF 0%, #14F195 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
          ">Privy</span>
        </div>
        <button onclick="this.closest('#privy-success-notification').remove()" style="
          margin-top: 20px;
          background: linear-gradient(135deg, #9945FF 0%, #14F195 100%);
          color: #fff;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          font-size: 16px;
          font-family: 'Nunito', sans-serif;
          box-shadow: 0 4px 12px rgba(153, 69, 255, 0.3);
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          Continue
        </button>
      `;
      
      document.body.appendChild(notification);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.animation = 'slideIn 0.3s ease-out reverse';
          setTimeout(() => notification.remove(), 300);
        }
      }, 5000);
    };
    
    // Function to hide Privy's error modal - very aggressive approach
    const hidePrivyErrorModal = () => {
      // Look for Privy's error modal with multiple selectors - be very aggressive
      const selectors = [
        '[data-privy-modal]',
        '[class*="privy"]',
        '[id*="privy"]',
        '[class*="modal"]',
        '[class*="overlay"]',
        '[class*="backdrop"]',
        'div[role="dialog"]',
        '[class*="error"]',
        'div[style*="position: fixed"]',
        'div[style*="position:absolute"]',
        'div[style*="z-index"]'
      ];
      
      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            const text = (element.textContent || '').toLowerCase();
            const style = window.getComputedStyle(element);
            const zIndex = parseInt(style.zIndex) || 0;
            
            // Check if this looks like Privy's error modal - be very broad
            if ((text.includes('could not log in') || 
                 text.includes('error authenticating') ||
                 text.includes('please try connecting again') ||
                 text.includes('retry') ||
                 text.includes('error') && text.includes('wallet')) &&
                (style.position === 'fixed' || style.position === 'absolute' || 
                 zIndex > 1000 || element.classList.toString().includes('privy'))) {
              console.log('🔇 Hiding Privy error modal:', element);
              element.style.display = 'none !important';
              element.style.visibility = 'hidden !important';
              element.style.opacity = '0 !important';
              element.style.pointerEvents = 'none !important';
              element.style.zIndex = '-9999 !important';
              try {
                element.remove();
              } catch (e) {
                // Ignore removal errors
              }
            }
          });
        } catch (e) {
          // Ignore selector errors
        }
      });
      
      // Also remove any backdrop/overlay elements - check all fixed position divs
      document.querySelectorAll('body > div, body > div > div').forEach(div => {
        try {
          const style = window.getComputedStyle(div);
          const zIndex = parseInt(style.zIndex) || 0;
          if ((style.position === 'fixed' || style.position === 'absolute') && zIndex > 1000) {
            const text = (div.textContent || '').toLowerCase();
            if (text.includes('could not log in') || 
                (text.includes('privy') && (text.includes('retry') || text.includes('error'))) || 
                text.includes('error authenticating')) {
              console.log('🔇 Hiding Privy backdrop/overlay');
              div.style.display = 'none !important';
              div.style.visibility = 'hidden !important';
              div.style.opacity = '0 !important';
              div.style.pointerEvents = 'none !important';
              div.style.zIndex = '-9999 !important';
              try {
                div.remove();
              } catch (e) {
                // Ignore removal errors
              }
            }
          }
        } catch (e) {
          // Ignore errors
        }
      });
    };
    
    // Intercept console.error to catch Privy's "Error authenticating session"
    const originalConsoleError = console.error;
    console.error = function(...args) {
      const errorMessage = args.join(' ');
      
      // Check if this is the "Error authenticating session" error
      if (errorMessage.includes('Error authenticating session') || 
          errorMessage.includes('authenticating session')) {
        console.warn('⚠️ Caught Privy authentication session error. Suppressing error modal.');
        
        // Hide the error modal immediately and repeatedly - very aggressive
        hidePrivyErrorModal(); // Immediate
        setTimeout(hidePrivyErrorModal, 10);
        setTimeout(hidePrivyErrorModal, 50);
        setTimeout(hidePrivyErrorModal, 100);
        setTimeout(hidePrivyErrorModal, 200);
        setTimeout(hidePrivyErrorModal, 300);
        setTimeout(hidePrivyErrorModal, 500);
        setTimeout(hidePrivyErrorModal, 1000);
        setTimeout(hidePrivyErrorModal, 2000);
        setTimeout(hidePrivyErrorModal, 3000);
        
        // Check if wallet is still connected despite the error
        setTimeout(() => {
          if (window.userWalletAddress) {
            console.log('✅ Wallet is connected despite authentication error:', window.userWalletAddress);
            // Ensure buttons are enabled
            const playBtn = document.getElementById('play-button');
            const createBtn = document.getElementById('create-button');
            if (playBtn) {
              playBtn.disabled = false;
              playBtn.style.opacity = '1';
              playBtn.style.cursor = 'pointer';
            }
            if (createBtn) {
              createBtn.disabled = false;
              createBtn.style.opacity = '1';
              createBtn.style.cursor = 'pointer';
            }
          }
        }, 500);
        
        // Don't show the error in console since we're handling it
        return;
      }
      
      // Call original console.error for other errors
      originalConsoleError.apply(console, args);
    };
    
    // Listen for any unhandled Privy errors
    const errorHandler = (event) => {
      const error = event.error || event.reason || event;
      if (error && error.message && error.message.includes('authenticating session')) {
        console.warn('⚠️ Caught authentication session error. Suppressing.');
        setTimeout(hidePrivyErrorModal, 100);
        event.preventDefault(); // Prevent default error handling
        return false;
      }
    };
    
    // Use MutationObserver to watch for Privy error modals being added to DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const text = (node.textContent || '').toLowerCase();
            // Check for error modals - be very broad
            if (text.includes('could not log in') || 
                text.includes('error authenticating') ||
                (text.includes('privy') && (text.includes('retry') || text.includes('error'))) ||
                (text.includes('error') && text.includes('wallet'))) {
              console.log('🔇 Detected Privy error modal, hiding it immediately');
              hidePrivyErrorModal();
              // Also check children
              setTimeout(hidePrivyErrorModal, 10);
              setTimeout(hidePrivyErrorModal, 50);
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    // Also run periodic check
    const periodicCheck = setInterval(() => {
      hidePrivyErrorModal();
    }, 100);
    
    window.addEventListener('error', errorHandler, true);
    window.addEventListener('unhandledrejection', errorHandler, true);
    
    return () => {
      console.error = originalConsoleError;
      observer.disconnect();
      if (periodicCheck) clearInterval(periodicCheck);
      window.removeEventListener('error', errorHandler, true);
      window.removeEventListener('unhandledrejection', errorHandler, true);
    };
  }, []);
  
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#9945FF',
          logo: '/img/doodllogo.gif',
          walletChainType: 'solana-only'
        },
        embeddedWallets: {
          solana: {
            createOnLogin: 'users-without-wallets'
          }
        },
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors(['phantom', 'solflare'])
          }
        },
        // Add error handling
        onError: (error) => {
          console.error('🚨 Privy Provider Error:', error);
          console.error('Error details:', {
            message: error?.message,
            code: error?.code,
            name: error?.name,
            stack: error?.stack
          });
          
          // Try to get more error information
          if (error?.cause) {
            console.error('Error cause:', error.cause);
          }
          if (error?.response) {
            console.error('Error response:', error.response);
          }
        },
        // Add session configuration
        session: {
          // Enable session persistence
          persist: true,
          // Session timeout (in seconds) - 7 days
          timeout: 7 * 24 * 60 * 60
        }
      }}
    >
      <WalletConnectButton />
    </PrivyProvider>
  );
}

// Initialize React app (only once)
let privyAppInitialized = false;
function initPrivyApp() {
  if (privyAppInitialized) {
    return; // Prevent duplicate initialization
  }
  
  const container = document.getElementById('wallet-connect-header');
  if (container && !container.hasChildNodes()) {
    privyAppInitialized = true;
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(PrivyApp));
  }
}

// Export for global access
if (typeof window !== 'undefined') {
  window.PrivyApp = {
    initPrivyApp: initPrivyApp
  };
  
  // Auto-init when DOM is ready (only once)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initPrivyApp, 100); // Small delay to ensure DOM is ready
    });
  } else {
    setTimeout(initPrivyApp, 100);
  }
}
