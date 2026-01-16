# Turnkey Setup Guide

## Quick Start

For detailed step-by-step instructions on getting your Turnkey credentials, see **[TURNKEY_CREDENTIALS_GUIDE.md](./TURNKEY_CREDENTIALS_GUIDE.md)** - it has complete instructions with screenshots descriptions and troubleshooting.

## Prerequisites

1. Create a Turnkey account at https://www.turnkey.com
2. Get your Organization ID from the dashboard
3. Enable Auth Proxy and get your Auth Proxy Config ID
4. (Optional) Set up WalletConnect for mobile wallet support

## Environment Variables

Set these environment variables in your `.env` file or hosting platform:

```bash
TURNKEY_ORG_ID=org_xxxxxxxxxxxxxxxxxxxxx
TURNKEY_AUTH_PROXY_CONFIG_ID=apc_xxxxxxxxxxxxxxxxxxxxx
TURNKEY_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id  # Optional
```

**📖 See [TURNKEY_CREDENTIALS_GUIDE.md](./TURNKEY_CREDENTIALS_GUIDE.md) for detailed instructions on getting these values.**

## Features

- ✅ Embedded wallets (created automatically when users authenticate)
- ✅ External wallet connection (Phantom, Solflare, etc.)
- ✅ Solana support
- ✅ Social login (via Turnkey's auth system)
- ✅ Secure key management

## How It Works

1. User clicks "Connect Wallet"
2. Turnkey shows authentication modal (passkey, email, etc.)
3. After authentication, a Solana wallet is automatically created
4. Wallet address is stored and game buttons are enabled

## Testing

1. Set your environment variables
2. Restart your server
3. Visit your site and click "Connect Wallet"
4. Authenticate with Turnkey
5. Your Solana wallet should be created automatically

## Troubleshooting

- **"Initializing..." button**: Check that your environment variables are set correctly
- **Authentication fails**: Verify your Auth Proxy Config ID is correct
- **No wallet created**: Check browser console for errors

## Documentation

- Turnkey Docs: https://docs.turnkey.com
- React Wallet Kit: https://docs.turnkey.com/sdks/react/using-embedded-wallets
- Solana Support: https://docs.turnkey.com/networks/solana
