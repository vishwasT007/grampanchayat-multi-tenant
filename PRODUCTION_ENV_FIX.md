# Fix Production Environment Variables Error

## Problem
Getting `Firebase: Error (auth/invalid-api-key)` in production because environment variables from `.env` file are not available in the production build.

## Solution

### If deployed on **Vercel**:

1. **Go to your Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your project `grampanchayat`

2. **Navigate to Settings → Environment Variables**

3. **Add the following environment variables**:

   ```
   VITE_FIREBASE_API_KEY=AIzaSyDZg8nBI53IfImn8-jTUGOVs6G4XeGJh1M
   VITE_FIREBASE_AUTH_DOMAIN=grampanchayat-f0aa7.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=grampanchayat-f0aa7
   VITE_FIREBASE_STORAGE_BUCKET=grampanchayat-f0aa7.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=394538115264
   VITE_FIREBASE_APP_ID=1:394538115264:web:9ecd75d9b17c5d34774d25
   ```

   **For each variable:**
   - Click "Add New"
   - Name: `VITE_FIREBASE_API_KEY` (for example)
   - Value: `AIzaSyDZg8nBI53IfImn8-jTUGOVs6G4XeGJh1M` (for example)
   - Environment: Select **Production**, **Preview**, and **Development**
   - Click "Save"

4. **Redeploy your application**
   - Go to Deployments tab
   - Click the three dots on the latest deployment
   - Select "Redeploy"
   - ✅ Check "Use existing Build Cache" is UNCHECKED to force fresh build

### If deployed on **Firebase Hosting**:

Firebase Hosting doesn't support environment variables the same way. You have two options:

#### Option A: Use a build script (Recommended)
1. Your environment variables are already embedded during the build process
2. Make sure you build locally with the `.env` file present:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

#### Option B: Switch to using build-time configuration
Already handled by Vite during build process when `.env` file is present.

---

## Quick Fix Steps (Vercel):

### Method 1: Using Vercel CLI
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add VITE_FIREBASE_API_KEY
# When prompted, paste: AIzaSyDZg8nBI53IfImn8-jTUGOVs6G4XeGJh1M
# Select: Production, Preview, Development

vercel env add VITE_FIREBASE_AUTH_DOMAIN
# When prompted, paste: grampanchayat-f0aa7.firebaseapp.com

vercel env add VITE_FIREBASE_PROJECT_ID
# When prompted, paste: grampanchayat-f0aa7

vercel env add VITE_FIREBASE_STORAGE_BUCKET
# When prompted, paste: grampanchayat-f0aa7.firebasestorage.app

vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
# When prompted, paste: 394538115264

vercel env add VITE_FIREBASE_APP_ID
# When prompted, paste: 1:394538115264:web:9ecd75d9b17c5d34774d25

# Trigger a new deployment
vercel --prod
```

### Method 2: Using Vercel Dashboard (Easier)

1. **Visit**: https://vercel.com/dashboard
2. **Click**: Your project name
3. **Go to**: Settings → Environment Variables
4. **Add each variable** one by one:
   - Click "Add New"
   - Enter Name and Value
   - Select all environments (Production, Preview, Development)
   - Save

5. **Redeploy**:
   - Deployments tab → Latest deployment → ⋮ (three dots) → Redeploy

---

## Verification

After redeploying, check the browser console at https://www.grampanchayatwarghat.in/

You should see:
```
✅ Firestore offline persistence enabled
```

And NOT see:
```
❌ Firebase: Error (auth/invalid-api-key)
```

---

## Additional Notes

### Security Considerations
- The `.env` file is in `.gitignore` (good!)
- Firebase API keys are safe to expose in client-side code
- They are protected by Firebase Security Rules
- However, ensure your Firestore and Storage rules are properly configured

### Future Deployments
- Environment variables persist in Vercel
- You only need to set them once
- Any new deployment will automatically use them

---

## Troubleshooting

### Still getting the error?
1. Check that all 6 environment variables are added
2. Ensure variable names start with `VITE_` prefix
3. No extra spaces in variable names or values
4. Redeploy with cache disabled

### Variables not updating?
1. Clear build cache in Vercel
2. Force redeploy
3. Wait 2-3 minutes for propagation
4. Hard refresh browser (Ctrl+Shift+R)

### Check if variables are loaded:
Add this temporarily to `firebaseConfig.js`:
```javascript
console.log('Firebase Config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✓' : '✗',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✓' : '✗',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓' : '✗',
});
```
