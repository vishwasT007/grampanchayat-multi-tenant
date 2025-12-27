# 🔒 Environment-Based Development Setup Guide

This guide explains how to use **separate Firebase projects** for development and production, ensuring your local development **NEVER touches production data**.

---

## 🎯 The Problem

Currently, when you run `npm run dev` locally:
- ❌ Reads from **production** Firestore
- ❌ Writes to **production** Firestore
- ❌ Uploads to **production** Storage
- ⚠️ Any changes affect live production data

---

## ✅ The Solution

Use **two Firebase projects**:

1. **Development Project**: `grampanchayat-dev` (for local development)
2. **Production Project**: `grampanchayat-multi-tenant` (for live sites)

---

## 📋 Option 1: Quick Setup (Using .env.local - RECOMMENDED)

### Step 1: Create Development Firebase Project

**IMPORTANT**: You need to create a new Firebase project for development.

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add Project"**
3. Name: `grampanchayat-dev` (or any name you prefer)
4. Follow the setup wizard
5. Create a web app within the project
6. Copy the Firebase configuration

### Step 2: Create .env.local File

Create `.env.local` in your project root:

```bash
# .env.local - Development Configuration
# This file is automatically used by Vite in development mode
# Git ignores this file, so it won't be committed

# DEVELOPMENT Firebase Configuration
VITE_FIREBASE_API_KEY=your-dev-api-key
VITE_FIREBASE_AUTH_DOMAIN=grampanchayat-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=grampanchayat-dev
VITE_FIREBASE_STORAGE_BUCKET=grampanchayat-dev.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-dev-sender-id
VITE_FIREBASE_APP_ID=your-dev-app-id

# Feature Flags - Development
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PERFORMANCE=false
VITE_ENABLE_APP_CHECK=false
```

### Step 3: Keep .env for Production

Your existing `.env` file stays as-is (for production):

```bash
# .env - Production Configuration (fallback)
VITE_FIREBASE_API_KEY=AIzaSyB67ZvBQ7DLy3nErDuWSorBtbwgKeoWCw4
VITE_FIREBASE_AUTH_DOMAIN=grampanchayat-multi-tenant.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=grampanchayat-multi-tenant
VITE_FIREBASE_STORAGE_BUCKET=grampanchayat-multi-tenant.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=595321745876
VITE_FIREBASE_APP_ID=1:595321745876:web:3073e006f4a418207e2641
```

### Step 4: How It Works

**Vite Environment File Priority**:
```
.env.local          (highest priority - development only, git ignored)
    ↓
.env.production     (used in production builds)
    ↓
.env                (fallback)
```

**When you run**:
- `npm run dev` → Uses `.env.local` (development project) ✅
- `npm run build` → Uses `.env.production` or `.env` (production project) ✅

### Step 5: Update .gitignore

Ensure `.env.local` is ignored:

```bash
# Already in .gitignore
.env.local
.env*.local
```

---

## 📋 Option 2: Full Environment Setup (Advanced)

### File Structure

```
.env                  # Default/Production config
.env.local            # Local development (git ignored)
.env.development      # Development config (optional)
.env.production       # Production config (committed)
```

### Create .env.development

```bash
# .env.development - Development Environment
VITE_FIREBASE_API_KEY=your-dev-api-key
VITE_FIREBASE_AUTH_DOMAIN=grampanchayat-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=grampanchayat-dev
VITE_FIREBASE_STORAGE_BUCKET=grampanchayat-dev.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-dev-sender-id
VITE_FIREBASE_APP_ID=your-dev-app-id

# Development-specific flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PERFORMANCE=false
VITE_ENABLE_APP_CHECK=false
VITE_ENABLE_DEBUG=true
```

### Create .env.production

```bash
# .env.production - Production Environment
VITE_FIREBASE_API_KEY=AIzaSyB67ZvBQ7DLy3nErDuWSorBtbwgKeoWCw4
VITE_FIREBASE_AUTH_DOMAIN=grampanchayat-multi-tenant.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=grampanchayat-multi-tenant
VITE_FIREBASE_STORAGE_BUCKET=grampanchayat-multi-tenant.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=595321745876
VITE_FIREBASE_APP_ID=1:595321745876:web:3073e006f4a418207e2641

# Production-specific flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PERFORMANCE=true
VITE_ENABLE_APP_CHECK=true
```

### Update package.json

```json
{
  "scripts": {
    "dev": "vite --mode development",
    "build": "vite build --mode production",
    "build:dev": "vite build --mode development"
  }
}
```

---

## 📋 Option 3: Simple Manual Switch (No New Project Needed)

If you don't want to create a new Firebase project, you can manually control environment:

### Create .env.local.example

```bash
# .env.local.example - Copy to .env.local for development

# OPTION A: Use production (default - be careful!)
# Just don't create .env.local

# OPTION B: Use production but with safety flag
VITE_ENVIRONMENT=development
VITE_ENABLE_WRITE_PROTECTION=true  # Prevents writes in dev mode
```

### Update firebaseConfig.js

Add write protection:

```javascript
// Check if in development mode with write protection
const isDevelopment = import.meta.env.MODE === 'development';
const writeProtection = import.meta.env.VITE_ENABLE_WRITE_PROTECTION === 'true';

if (isDevelopment && writeProtection) {
  console.warn('🛡️ WRITE PROTECTION ENABLED - All write operations are disabled');
}

export { app, db, auth, storage, isDevelopment, writeProtection };
```

Then in your components, check before writing:

```javascript
import { writeProtection } from '../config/firebaseConfig';

async function saveData(data) {
  if (writeProtection) {
    console.warn('⚠️ Write operation blocked in development mode');
    return;
  }
  // Proceed with save
}
```

---

## 🎯 Recommended Approach

### For Your Project: Use .env.local (Option 1)

**Why?**
- ✅ Simple and clean
- ✅ Git automatically ignores it
- ✅ No code changes needed
- ✅ Works immediately

**Steps**:

1. **Create development Firebase project** (5 minutes)
   - Go to Firebase Console
   - Create `grampanchayat-dev`
   - Copy config

2. **Create `.env.local`** (1 minute)
   ```bash
   # In project root
   nano .env.local
   # Paste development config
   ```

3. **Test** (30 seconds)
   ```bash
   npm run dev
   # Check console - should show grampanchayat-dev
   ```

4. **Done!** ✅
   - Local dev → Development project
   - Production build → Production project
   - Zero risk of touching production

---

## 🔄 How Workflow Changes

### Before (Current - RISKY)

```bash
# On develop branch
npm run dev
# ⚠️ Connects to PRODUCTION Firebase
# ⚠️ Creating announcement → WRITES TO PRODUCTION
# ⚠️ Uploading logo → PRODUCTION STORAGE
```

### After (With .env.local - SAFE)

```bash
# On develop branch
npm run dev
# ✅ Connects to DEVELOPMENT Firebase
# ✅ Creating announcement → WRITES TO DEV PROJECT
# ✅ Uploading logo → DEV STORAGE
# ✅ Production untouched!

# When ready to deploy
git checkout main
git merge staging
npm run build  # Uses .env.production
./deploy-all-production.sh
# ✅ Deploys to PRODUCTION Firebase
```

---

## 📊 Comparison Table

| Approach | Setup Time | Safety | Cost | Recommended |
|----------|----------|--------|------|-------------|
| **Option 1: .env.local** | 5 min | ⭐⭐⭐⭐⭐ | Free tier | ✅ **YES** |
| **Option 2: Full .env setup** | 10 min | ⭐⭐⭐⭐⭐ | Free tier | For large teams |
| **Option 3: Write protection** | 30 min | ⭐⭐⭐ | $0 | Quick hack |
| **Current (No separation)** | 0 min | ⭐ | $0 | ❌ **RISKY** |

---

## 🚀 Quick Start Guide

### 1. Create Dev Firebase Project

```bash
# Go to: https://console.firebase.google.com/
# 1. Click "Add project"
# 2. Name: grampanchayat-dev
# 3. Disable Google Analytics (optional)
# 4. Create project
# 5. Add web app
# 6. Copy configuration
```

### 2. Create .env.local

```bash
cd /home/vishwas/Music/grampanchayat-pindkepar-lodha/grampanchayat
nano .env.local
```

Paste:
```bash
# Development Firebase Project
VITE_FIREBASE_API_KEY=<your-dev-api-key>
VITE_FIREBASE_AUTH_DOMAIN=grampanchayat-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=grampanchayat-dev
VITE_FIREBASE_STORAGE_BUCKET=grampanchayat-dev.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-dev-sender-id>
VITE_FIREBASE_APP_ID=<your-dev-app-id>

VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PERFORMANCE=false
VITE_ENABLE_APP_CHECK=false
```

### 3. Initialize Dev Project

```bash
# Create admin user in dev project
# Update create-admin-user.js to use dev config
node create-admin-user.js

# Or manually in Firebase Console:
# Authentication → Add user
# Firestore → Create gramPanchayats collection
```

### 4. Test

```bash
npm run dev
# Open browser console
# Should see: projectId: "grampanchayat-dev"
```

### 5. Verify Separation

```bash
# Development (local)
npm run dev → grampanchayat-dev ✅

# Production (deployed)
npm run build → grampanchayat-multi-tenant ✅
```

---

## ✅ Benefits

After setup:

- ✅ **Safe Development**: Test freely without fear
- ✅ **Clean Separation**: Dev and prod are isolated
- ✅ **No Conflicts**: Work on develop branch safely
- ✅ **Real Testing**: Test with real Firebase features
- ✅ **Easy Deployment**: Production unchanged
- ✅ **Team Collaboration**: Everyone can test safely

---

## 🎯 Next Steps

1. **Read this guide** ✅ (you're here!)
2. **Choose Option 1** (.env.local approach)
3. **Create dev Firebase project** (5 minutes)
4. **Create .env.local file** (1 minute)
5. **Test locally** (`npm run dev`)
6. **Celebrate!** 🎉 Safe development enabled!

---

## 📝 Important Notes

### Git Configuration

These files are already in `.gitignore`:
```
.env.local
.env*.local
```

These files SHOULD be committed:
```
.env.example          ✅ (template)
.env.production       ✅ (production config)
```

These files should NOT be committed:
```
.env.local           ❌ (personal dev config)
.env                 ⚠️  (depends on team decision)
```

### Firebase Costs

- Both projects use free tier
- Cost only if you exceed free limits
- Development usage is minimal
- No extra cost for most use cases

### Data Synchronization

**Dev and Prod are separate!**
- Data in dev project ≠ data in prod project
- You need to manually create test data in dev
- Or export/import from production when needed

---

## 🆘 Troubleshooting

### Issue: "Still connecting to production"

**Check**:
```bash
# Verify .env.local exists
ls -la .env.local

# Check which config is loaded
npm run dev
# Look for projectId in console
```

**Fix**:
```bash
# Make sure .env.local is in project root
# Restart dev server
npm run dev
```

### Issue: "Can't login to dev project"

**Fix**:
```bash
# Create admin user in dev project
# Update create-admin-user.js config temporarily
# Or use Firebase Console to add user
```

### Issue: "Data not showing"

**Fix**:
```bash
# Dev project is empty initially
# Create test data manually
# Or export from prod and import to dev
```

---

## 🎉 You're Ready!

With environment-based configuration, you can:
- Develop safely on `develop` branch
- Test features without affecting production
- Merge to main with confidence
- Deploy knowing production is protected

**Choose Option 1 (.env.local) and get started in 5 minutes!** 🚀
