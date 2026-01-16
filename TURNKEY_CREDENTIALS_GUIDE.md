# Complete Guide: Getting Turnkey Credentials

This is a detailed, step-by-step guide to get all the credentials you need to use Turnkey with your application.

## Step 1: Create a Turnkey Account

1. **Go to Turnkey Dashboard**
   - Visit: https://www.turnkey.com
   - Click **"Sign Up"** or **"Get Started"** in the top right

2. **Sign Up**
   - Enter your email address
   - Create a password
   - Verify your email (check your inbox for verification link)
   - Complete any additional account setup steps

3. **Complete Account Setup**
   - You may be asked to provide:
     - Your name
     - Company name (optional)
     - Use case information
   - Complete all required fields

## Step 2: Get Your Organization ID

Once you're logged into the Turnkey Dashboard:

1. **Find Your Organization ID**
   - Look at the **top right corner** of the dashboard
   - You'll see a **user dropdown menu** (usually shows your email or name)
   - Click on it
   - Your **Organization ID** will be displayed there
   - It looks like: `org_xxxxxxxxxxxxxxxxxxxxx`
   - **Copy this ID** - you'll need it!

   **Alternative location:**
   - Go to **Settings** → **Organization**
   - Your Organization ID will be displayed at the top of the page

2. **Save Your Organization ID**
   - Copy it to a safe place
   - Format: `org_` followed by alphanumeric characters
   - Example: `org_abc123def456ghi789`

## Step 3: Enable Auth Proxy

Auth Proxy is required for frontend authentication. Here's how to set it up:

1. **Navigate to Auth Proxy Settings**
   - In the Turnkey Dashboard, look for:
     - **"Auth/Wallet Kit"** section, OR
     - **Settings** → **Auth Proxy**, OR
     - **Settings** → Authentication**
   - Click on it

2. **Enable Auth Proxy**
   - You'll see a toggle or button to **"Enable Auth Proxy"**
   - Turn it **ON**
   - If you see a warning about enabling it, click **"Enable"** or **"Continue"**

3. **Configure Auth Methods**
   - Choose which authentication methods you want to support:
     - ✅ **Email OTP** (One-Time Password via email) - Recommended
     - ✅ **Passkeys** (WebAuthn/FIDO2) - Recommended for best UX
     - ✅ **OAuth** (Google, Apple, etc.) - Optional
   - Select at least one method (Email OTP is the easiest to start with)

4. **Set Session Configuration**
   - **Session Length**: How long users stay logged in
     - Recommended: `7 days` or `30 days`
   - **Allowed Origins**: Add your website domains
     - For local development: `http://localhost:3000`, `http://localhost:5000`
     - For production: `https://www.doodls.fun`, `https://doodls.fun`
     - **Important**: Add all domains where your app will run
     - Format: `https://yourdomain.com` (no trailing slash)

5. **Save Configuration**
   - Click **"Save"** or **"Update"**
   - Wait for confirmation that settings are saved

## Step 4: Get Your Auth Proxy Config ID

After enabling Auth Proxy:

1. **Find Auth Proxy Config ID**
   - In the same Auth Proxy settings page
   - Look for **"Auth Proxy Config ID"** or **"Config ID"**
   - It looks like: `apc_xxxxxxxxxxxxxxxxxxxxx`
   - **Copy this ID**

   **Where to find it:**
   - Usually displayed prominently after enabling Auth Proxy
   - May be in a box labeled "Your Auth Proxy Config ID"
   - Format: `apc_` followed by alphanumeric characters
   - Example: `apc_xyz789abc123def456`

2. **Verify It's Enabled**
   - Make sure the status shows **"Enabled"** or **"Active"**
   - If it shows "Disabled", click to enable it

## Step 5: (Optional) Set Up WalletConnect

WalletConnect enables mobile wallet connections. This is optional but recommended:

1. **Go to WalletConnect Cloud**
   - Visit: https://cloud.walletconnect.com
   - Sign up or log in with your account

2. **Create a New Project**
   - Click **"Create New Project"** or **"New Project"**
   - Enter project details:
     - **Project Name**: e.g., "doodls.fun"
     - **Homepage URL**: `https://www.doodls.fun`
     - **Description**: "Drawing and guessing game"

3. **Get Your Project ID**
   - After creating the project, you'll see your **Project ID**
   - It's a long string of characters (not starting with `org_` or `apc_`)
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
   - **Copy this Project ID**

4. **Configure Project Settings**
   - Add your app metadata:
     - **App Name**: doodls.fun
     - **App URL**: https://www.doodls.fun
     - **App Icon**: Upload your logo (optional)

## Step 6: Set Environment Variables

Now that you have all your credentials, add them to your environment:

### For Local Development (.env file)

Create or edit a `.env` file in your project root:

```bash
# Turnkey Configuration
TURNKEY_ORG_ID=org_abc123def456ghi789
TURNKEY_AUTH_PROXY_CONFIG_ID=apc_xyz789abc123def456
TURNKEY_WALLETCONNECT_PROJECT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Important Notes:**
- Replace the example values with your actual IDs
- Don't use quotes around the values
- Don't add spaces around the `=` sign
- Keep this file secure and never commit it to git (add `.env` to `.gitignore`)

### For Production (Hosting Platform)

If you're using a hosting platform (Render, Vercel, Heroku, etc.):

1. **Go to your hosting platform dashboard**
2. **Find Environment Variables section**
   - Render: Settings → Environment
   - Vercel: Settings → Environment Variables
   - Heroku: Settings → Config Vars
3. **Add each variable:**
   - Key: `TURNKEY_ORG_ID`
     Value: `org_abc123def456ghi789` (your actual org ID)
   - Key: `TURNKEY_AUTH_PROXY_CONFIG_ID`
     Value: `apc_xyz789abc123def456` (your actual config ID)
   - Key: `TURNKEY_WALLETCONNECT_PROJECT_ID` (optional)
     Value: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` (your actual project ID)
4. **Save** the environment variables
5. **Redeploy** your application for changes to take effect

## Step 7: Verify Your Setup

1. **Check Your Server**
   - Make sure your server is running
   - The `/api/turnkey-config` endpoint should return your credentials
   - Test it: Visit `http://localhost:5000/api/turnkey-config` (or your server URL)
   - You should see JSON with your org ID and config ID

2. **Test in Browser**
   - Open your website
   - Open browser console (F12)
   - Look for: `Turnkey config loaded: { orgId: '...', authProxyConfigId: '...' }`
   - If you see this, your config is loading correctly!

3. **Test Wallet Connection**
   - Click "Connect Wallet" button
   - You should see Turnkey's authentication modal
   - Try authenticating with email or passkey
   - After authentication, a Solana wallet should be created automatically

## Troubleshooting

### "Initializing..." button never changes
- **Problem**: Environment variables not set or not loading
- **Solution**: 
  - Check that `.env` file exists and has correct values
  - Restart your server after adding environment variables
  - Check server logs for errors
  - Verify `/api/turnkey-config` endpoint returns correct data

### "Proxy not enabled" error
- **Problem**: Auth Proxy not enabled in Turnkey dashboard
- **Solution**:
  - Go back to Turnkey Dashboard
  - Navigate to Auth Proxy settings
  - Make sure it's enabled
  - Copy the Config ID again (it might have changed)

### "Origin not allowed" error
- **Problem**: Your domain not in allowed origins list
- **Solution**:
  - Go to Turnkey Dashboard → Auth Proxy settings
  - Add your domain to "Allowed Origins"
  - Include both `http://localhost:PORT` (for dev) and `https://yourdomain.com` (for prod)
  - Save and wait a few minutes for changes to propagate

### Authentication modal doesn't appear
- **Problem**: Missing or incorrect Auth Proxy Config ID
- **Solution**:
  - Double-check your `TURNKEY_AUTH_PROXY_CONFIG_ID` value
  - Make sure it starts with `apc_`
  - Verify it matches what's in the Turnkey Dashboard

### Wallet not created after authentication
- **Problem**: API call failing or configuration issue
- **Solution**:
  - Check browser console for errors
  - Verify your Organization ID is correct
  - Make sure you have proper permissions in Turnkey
  - Check network tab for failed API requests

## Quick Reference: Where to Find Everything

| Credential | Where to Find | Format |
|------------|---------------|--------|
| **Organization ID** | Dashboard → User dropdown (top right) OR Settings → Organization | `org_...` |
| **Auth Proxy Config ID** | Dashboard → Auth/Wallet Kit → Auth Proxy settings | `apc_...` |
| **WalletConnect Project ID** | https://cloud.walletconnect.com → Your Project | Long alphanumeric string |

## Security Best Practices

1. **Never commit `.env` file to git**
   - Add `.env` to your `.gitignore` file
   - Use environment variables in production

2. **Keep credentials secret**
   - Don't share your Organization ID or Auth Proxy Config ID publicly
   - Don't put them in client-side code
   - Only use them in server-side environment variables

3. **Rotate credentials if compromised**
   - If you suspect credentials are leaked, regenerate them in Turnkey Dashboard
   - Update your environment variables immediately

## Need Help?

- **Turnkey Documentation**: https://docs.turnkey.com
- **Turnkey Support**: Check Turnkey dashboard for support options
- **React Wallet Kit Docs**: https://docs.turnkey.com/sdks/react/getting-started
- **Auth Proxy Reference**: https://docs.turnkey.com/reference/auth-proxy

## Summary Checklist

Before you start using Turnkey, make sure you have:

- [ ] Turnkey account created and verified
- [ ] Organization ID copied (`org_...`)
- [ ] Auth Proxy enabled in dashboard
- [ ] Auth Proxy Config ID copied (`apc_...`)
- [ ] Allowed origins configured (localhost + production domain)
- [ ] Environment variables set in `.env` file
- [ ] Server restarted to load new environment variables
- [ ] Tested `/api/turnkey-config` endpoint
- [ ] Tested wallet connection in browser

Once you complete all these steps, your Turnkey integration should be working! 🎉
