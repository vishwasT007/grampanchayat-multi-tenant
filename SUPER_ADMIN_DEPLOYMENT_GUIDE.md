# Super Admin Separate Deployment Guide

This guide explains how to deploy the Super Admin module separately from the main GP websites using Firebase Hosting.

## 🎯 Architecture Overview

**Current Setup:**
- Main GP websites: Uses multi-tenant routing based on domain
- Super Admin Panel: Mixed with GP websites in the same deployment

**New Setup:**
- **Main GP Websites**: `grampanchayat-multi-tenant.web.app` (and custom domains)
- **Super Admin Panel**: `superadmin-grampanchayat.web.app` (separate Firebase site)

## 📦 Deployment Strategy

### Option 1: Multiple Firebase Hosting Sites (Recommended)

Firebase allows multiple hosting sites in a single project. This is the cleanest approach.

#### Step 1: Create Additional Hosting Site

```bash
# Login to Firebase
firebase login

# Add a new hosting site to your existing project
firebase hosting:sites:create superadmin-grampanchayat
```

This will create: `superadmin-grampanchayat.web.app`

#### Step 2: Update `firebase.json`

Replace the current hosting config with multiple sites:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "hosting": [
    {
      "site": "grampanchayat-multi-tenant",
      "public": "dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ],
      "cleanUrls": true,
      "trailingSlash": false
    },
    {
      "site": "superadmin-grampanchayat",
      "public": "dist-superadmin",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        {
          "source": "**",
          "destination": "/index.html"
        }
      ],
      "cleanUrls": true,
      "trailingSlash": false
    }
  ],
  "emulators": {
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "hosting": {
      "port": 5173
    }
  }
}
```

#### Step 3: Create Separate Build Scripts

Update `package.json` scripts:

```json
"scripts": {
  "dev": "vite",
  "dev:superadmin": "VITE_APP_MODE=superadmin vite",
  "build": "vite build",
  "build:gp": "VITE_APP_MODE=gp vite build --outDir dist",
  "build:superadmin": "VITE_APP_MODE=superadmin vite build --base=/superadmin --outDir dist-superadmin",
  "build:all": "npm run build:gp && npm run build:superadmin",
  "deploy:gp": "npm run build:gp && firebase deploy --only hosting:grampanchayat-multi-tenant",
  "deploy:superadmin": "npm run build:superadmin && firebase deploy --only hosting:superadmin-grampanchayat",
  "deploy:all": "npm run build:all && firebase deploy --only hosting",
  "preview": "vite preview"
}
```

#### Step 4: Create Vite Config for Multiple Builds

Update `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const mode = process.env.VITE_APP_MODE || 'all';

export default defineConfig({
  plugins: [react()],
  base: mode === 'superadmin' ? '/superadmin/' : '/',
  build: {
    outDir: mode === 'superadmin' ? 'dist-superadmin' : 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})
```

### Option 2: Simple Base Path Approach (Easier but Same Domain)

If you don't want separate sites, you can serve Super Admin under `/superadmin` path:

1. Update `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/superadmin/',
})
```

2. Super Admin will be available at: `grampanchayat-multi-tenant.web.app/superadmin`

3. Update all routes in Super Admin to include `/superadmin` prefix

## 🚀 Deployment Commands

### Deploy Everything
```bash
npm run build:all
firebase deploy
```

### Deploy Only GP Sites
```bash
npm run build:gp
firebase deploy --only hosting:grampanchayat-multi-tenant
```

### Deploy Only Super Admin
```bash
npm run build:superadmin
firebase deploy --only hosting:superadmin-grampanchayat
```

## 🔒 Security Considerations

1. **Firestore Rules**: Already configured to check super admin permissions
2. **No Custom Domain Needed**: Use free `.web.app` domain for Super Admin
3. **Access Control**: Super Admin login is already protected
4. **CORS**: Ensure Firebase config allows requests from new domain

## 📝 Update Firebase Config

Add the new Super Admin domain to Firebase console:
1. Go to Firebase Console
2. Navigate to Authentication → Settings → Authorized domains
3. Add: `superadmin-grampanchayat.web.app`

## 🌐 Final URLs

After deployment:
- **Main GP Sites**: 
  - `grampanchayat-multi-tenant.web.app`
  - `grampanchyatpindkepaarlodha.in` (custom domain)
  - `grampanchyatpawni.in` (custom domain)

- **Super Admin Panel**: 
  - `superadmin-grampanchayat.web.app` (FREE Firebase subdomain)
  - No custom domain needed!

## ✅ Advantages

1. ✅ **Separate Deployment**: Update Super Admin without affecting GP sites
2. ✅ **Free Subdomain**: No need to buy custom domain for admin panel
3. ✅ **Better Security**: Isolated from public GP websites
4. ✅ **Independent Scaling**: Admin panel has separate hosting quota
5. ✅ **Cleaner URLs**: Each has its own domain
6. ✅ **Easier Debugging**: Separate build outputs

## 🎯 Recommended Approach

**Use Option 1 (Multiple Hosting Sites)** for:
- Production deployment
- Better separation of concerns
- Professional setup

**Use Option 2 (Base Path)** for:
- Quick testing
- Simpler deployment
- Single domain preference

## 📱 Testing

After deployment, test:
1. Super Admin Login: `https://superadmin-grampanchayat.web.app/login`
2. Dashboard: `https://superadmin-grampanchayat.web.app/dashboard`
3. Add GP: `https://superadmin-grampanchayat.web.app/gram-panchayats/add`
4. Manage Users: `https://superadmin-grampanchayat.web.app/users`

All features should work exactly as they do in development!
