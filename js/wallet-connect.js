// Simple Direct Solana Wallet Connection (No Privy)
// This bypasses Privy's SIWS issues by connecting directly to wallets

(function() {
  'use strict';
  
  let connectedWallet = null;
  let walletAddress = null;
  
  // Detect available wallets
  function detectWallets() {
    const wallets = [];
    
    if (window.solana && window.solana.isPhantom) {
      wallets.push({ name: 'Phantom', provider: window.solana });
    }
    
    if (window.solflare) {
      wallets.push({ name: 'Solflare', provider: window.solflare });
    }
    
    // Check for other common Solana wallets
    if (window.solana && !window.solana.isPhantom) {
      wallets.push({ name: 'Solana', provider: window.solana });
    }
    
    return wallets;
  }
  
  // Connect to wallet
  async function connectWallet() {
    try {
      const wallets = detectWallets();
      
      if (wallets.length === 0) {
        alert('No Solana wallet found. Please install Phantom or Solflare wallet extension.');
        return false;
      }
      
      // Use the first available wallet (prefer Phantom)
      const wallet = wallets.find(w => w.name === 'Phantom') || wallets[0];
      
      console.log('🔌 Connecting to', wallet.name, 'wallet...');
      
      // Connect to the wallet
      const response = await wallet.provider.connect();
      
      if (response && response.publicKey) {
        walletAddress = response.publicKey.toString();
        connectedWallet = wallet;
        window.userWalletAddress = walletAddress;
        
        console.log('✅ Wallet connected:', walletAddress);
        
        // Dispatch event for other parts of the app
        window.dispatchEvent(new CustomEvent('wallet-connected', {
          detail: { address: walletAddress, walletName: wallet.name }
        }));
        
        // Enable play buttons
        enablePlayButtons();
        
        // Update UI
        updateWalletUI();
        
        return true;
      } else {
        throw new Error('No public key returned from wallet');
      }
    } catch (error) {
      console.error('❌ Wallet connection error:', error);
      
      if (error.code === 4001) {
        alert('Wallet connection was rejected. Please try again.');
      } else {
        alert('Failed to connect wallet: ' + (error.message || 'Unknown error'));
      }
      
      return false;
    }
  }
  
  // Disconnect wallet
  async function disconnectWallet() {
    try {
      if (connectedWallet && connectedWallet.provider.disconnect) {
        await connectedWallet.provider.disconnect();
      }
      
      walletAddress = null;
      connectedWallet = null;
      window.userWalletAddress = null;
      
      console.log('🔌 Wallet disconnected');
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('wallet-disconnected'));
      
      // Disable play buttons
      disablePlayButtons();
      
      // Update UI
      updateWalletUI();
    } catch (error) {
      console.error('❌ Wallet disconnect error:', error);
    }
  }
  
  // Enable play buttons
  function enablePlayButtons() {
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
  
  // Disable play buttons
  function disablePlayButtons() {
    const playBtn = document.getElementById('play-button');
    const createBtn = document.getElementById('create-button');
    
    if (playBtn) {
      playBtn.disabled = true;
      playBtn.style.opacity = '0.5';
      playBtn.style.cursor = 'not-allowed';
    }
    
    if (createBtn) {
      createBtn.disabled = true;
      createBtn.style.opacity = '0.5';
      createBtn.style.cursor = 'not-allowed';
    }
  }
  
  // Update wallet UI
  function updateWalletUI() {
    const container = document.getElementById('wallet-connect-header');
    if (!container) return;
    
    if (walletAddress) {
      const shortAddress = `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`;
      container.innerHTML = `
        <div style="display: block; color: #fff; font-size: 0.9em; margin-top: 5px; text-align: center;">
          <div style="margin-bottom: 5px;">${shortAddress}</div>
          <button 
            id="wallet-disconnect-btn" 
            style="padding: 5px 10px; font-size: 0.8em; background: rgba(255,255,255,0.2); border: none; border-radius: 5px; color: #fff; cursor: pointer;"
          >
            Disconnect
          </button>
        </div>
      `;
      
      // Add disconnect handler
      const disconnectBtn = document.getElementById('wallet-disconnect-btn');
      if (disconnectBtn) {
        disconnectBtn.addEventListener('click', disconnectWallet);
      }
    } else {
      container.innerHTML = `
        <button 
          id="wallet-connect-btn" 
          style="background: linear-gradient(135deg, #9945FF 0%, #14F195 100%); color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 3px 8px rgba(0,0,0,0.3);"
        >
          Connect Wallet
        </button>
      `;
      
      // Add connect handler
      const connectBtn = document.getElementById('wallet-connect-btn');
      if (connectBtn) {
        connectBtn.addEventListener('click', connectWallet);
      }
    }
  }
  
  // Check if wallet is already connected
  async function checkExistingConnection() {
    try {
      const wallets = detectWallets();
      if (wallets.length === 0) return;
      
      const wallet = wallets.find(w => w.name === 'Phantom') || wallets[0];
      
      // Check if already connected
      if (wallet.provider.isConnected && wallet.provider.publicKey) {
        walletAddress = wallet.provider.publicKey.toString();
        connectedWallet = wallet;
        window.userWalletAddress = walletAddress;
        
        console.log('✅ Wallet already connected:', walletAddress);
        
        enablePlayButtons();
        updateWalletUI();
        
        window.dispatchEvent(new CustomEvent('wallet-connected', {
          detail: { address: walletAddress, walletName: wallet.name }
        }));
      }
    } catch (error) {
      console.warn('Could not check existing connection:', error);
    }
  }
  
  // Listen for wallet account changes
  function setupWalletListeners() {
    if (window.solana) {
      window.solana.on('accountChanged', (publicKey) => {
        if (publicKey) {
          walletAddress = publicKey.toString();
          window.userWalletAddress = walletAddress;
          updateWalletUI();
          enablePlayButtons();
          
          window.dispatchEvent(new CustomEvent('wallet-connected', {
            detail: { address: walletAddress }
          }));
        } else {
          disconnectWallet();
        }
      });
      
      window.solana.on('disconnect', () => {
        disconnectWallet();
      });
    }
  }
  
  // Initialize when DOM is ready
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(init, 100);
      });
      return;
    }
    
    // Check for existing connection
    checkExistingConnection();
    
    // Setup listeners
    setupWalletListeners();
    
    // Initial UI update
    updateWalletUI();
    
    // Disable buttons initially
    disablePlayButtons();
  }
  
  // Start initialization
  init();
  
  // Export functions globally if needed
  window.connectSolanaWallet = connectWallet;
  window.disconnectSolanaWallet = disconnectWallet;
  window.getWalletAddress = () => walletAddress;
  
})();
