# ✅ GitHub Actions Deployment Fix# ✅ FIXED: Production Firebase Error on GitHub Actions



## 🎯 What Was Fixed## The Problem

Your production site at https://www.grampanchayatwarghat.in/ was showing:

### The Error You Saw:```

```Firebase: Error (auth/invalid-api-key)

Error: Request to https://firebasehosting.googleapis.com/v1beta1/projects/-/sites/pindkeparlodha-gpmulti/versions had HTTP Error: 404, Requested entity was not found.```

```

## Root Cause

### Root Cause:Your GitHub Actions workflow file (`.github/workflows/firebase-deploy.yml`) was **NOT passing the environment variables** to the build step, even though they were correctly defined in GitHub Repository Secrets.

1. **Hyphen Removal Bug**: The GitHub Actions workflow was removing hyphens from GP names (e.g., `pindkepar-lodha` → `pindkeparlodha`)

2. **Site Doesn't Exist**: The workflow tried to deploy to `pindkeparlodha-gpmulti`, but Firebase created the actual site with a suffix: `pindkeparlodha-gpmulti-y757r4`## The Fix

3. **Mismatch**: Workflow tried deploying to a non-existent siteUpdated the workflow file to include the `env:` block in the build step:



---```yaml

- name: Build project

## 🔧 What Was Changed  env:

    VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}

### 1. Fixed `.github/workflows/deploy-gp.yml`    VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}

    VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}

**Before (WRONG):**    VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}

```yaml    VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}

- name: Normalize subdomain    VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}

  run: |  run: npm run build

    GP_SUBDOMAIN="${{ steps.get_subdomain.outputs.subdomain }}"```

    # Strip trailing '-gpmulti' suffix if present, then remove all hyphens

    BASE="${GP_SUBDOMAIN%-gpmulti}"## What Changed

    BASE="${BASE//-/}"  # ❌ This removes ALL hyphens!- ✅ Fixed `AdminDashboard.jsx` to use correct field names (`titleEn`, `descriptionEn`, `images[0]`)

    NORMALIZED="${BASE}-gpmulti"- ✅ Updated `firebaseConfig.js` to show helpful error if env vars are missing

```- ✅ **CRITICAL FIX**: Updated GitHub Actions workflow to pass secrets to build step



**After (CORRECT):**## Next Steps

```yaml

- name: Normalize subdomain### 1. Commit and Push the Fix

  run: |```bash

    GP_SUBDOMAIN="${{ steps.get_subdomain.outputs.subdomain }}"git add .

    # Ensure subdomain ends with -gpmultigit commit -m "fix: Pass environment variables to build step in GitHub Actions"

    # Do NOT remove hyphens from the base name - preserve them!git push origin main

    if [[ "$GP_SUBDOMAIN" == *-gpmulti ]]; then```

      NORMALIZED="$GP_SUBDOMAIN"

    else### 2. Monitor the Deployment

      NORMALIZED="${GP_SUBDOMAIN}-gpmulti"1. Go to: https://github.com/vishwasT007/grampanchayat/actions

    fi2. Watch the latest workflow run

```3. It should complete successfully in ~2-3 minutes



### 2. Fixed GP ID Extraction for Firestore### 3. Verify the Fix

1. Visit: https://www.grampanchayatwarghat.in/

**Before (WRONG):**2. Open browser console (F12)

```yaml3. You should see: `✅ Firestore offline persistence enabled`

BASE="${NORMALIZED%-gpmulti}"4. NO error about invalid-api-key

GP_ID="${BASE//-/}"  # ❌ Removes all hyphens

```## Why This Happened

When using Vite with environment variables:

**After (CORRECT):**- **Local development**: Vite reads from `.env` file ✅

```yaml- **GitHub Actions**: Must explicitly pass secrets as environment variables ❌ (was missing)

# Extract GP ID by removing -gpmulti and any suffix (e.g., -y757r4)

# Example: pindkeparlodha-gpmulti-y757r4 -> pindkeparlodhaThe GitHub repository secrets were correctly set up, but they weren't being used during the build process.

GP_ID="${SITE_ID%-gpmulti*}"  # ✅ Preserves hyphens, removes suffix

```## Verification

Your GitHub Secrets are correctly configured:

### 3. Fixed `firebase-deploy.yml` Authentication- ✅ `VITE_FIREBASE_API_KEY`

- ✅ `VITE_FIREBASE_AUTH_DOMAIN`

**Before (WRONG):**- ✅ `VITE_FIREBASE_PROJECT_ID`

```yaml- ✅ `VITE_FIREBASE_STORAGE_BUCKET`

env:- ✅ `VITE_FIREBASE_MESSAGING_SENDER_ID`

  FIREBASE_TOKEN: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}  # ❌ Wrong variable- ✅ `VITE_FIREBASE_APP_ID`

run: |- ✅ `FIREBASE_SERVICE_ACCOUNT`

  firebase deploy --only hosting --token "$FIREBASE_TOKEN"

```All that was missing was the `env:` block in the workflow file.



**After (CORRECT):**## Files Modified

```yaml1. `/src/pages/admin/AdminDashboard.jsx` - Fixed program display fields

env:2. `/src/config/firebaseConfig.js` - Added env validation

  FIREBASE_SERVICE_ACCOUNT_BASE64: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_BASE64 }}3. `/.github/workflows/firebase-deploy.yml` - **Added env variables to build step** 🎯

  FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}

run: |---

  # Configure authentication (supports both service account and token)

  if [ -n "$FIREBASE_SERVICE_ACCOUNT_BASE64" ]; then**Status**: ✅ Ready to deploy! Just commit and push.

    echo "$FIREBASE_SERVICE_ACCOUNT_BASE64" | base64 -d > /tmp/firebase_sa.json
    export GOOGLE_APPLICATION_CREDENTIALS=/tmp/firebase_sa.json
  fi
  
  # Deploy only main and superadmin (not GP sites)
  firebase deploy --only hosting:main,hosting:superadmin
```

---

## 🚀 How to Use GitHub Actions Deployment

### Method 1: Automatic Deployment (Main Branch)

**When:** Push to `main` branch  
**What Deploys:** Main site + SuperAdmin panel  
**GP Sites:** NOT deployed (use Method 2 for GPs)

```bash
git add .
git commit -m "Update code"
git push origin main
```

This automatically deploys:
- ✅ Main site: `grampanchayat-multi-tenant.web.app`
- ✅ SuperAdmin: `superadmin-grampanchayat.web.app`
- ❌ GP sites: Skipped (deploy manually)

---

### Method 2: Manual GP Deployment (GitHub Actions)

**When:** You want to deploy a specific GP  
**Where:** GitHub Actions web interface

#### Steps:

1. **Go to GitHub Actions Tab**
   ```
   https://github.com/vishwasT007/grampanchayat-multi-tenant/actions
   ```

2. **Click "Auto Deploy GP to Firebase Hosting"** workflow

3. **Click "Run workflow"** button

4. **Enter GP Subdomain**
   - For Pindkepar Lodha: Enter `pindkeparlodha-gpmulti`
   - For other GPs: Enter their subdomain (e.g., `pawni-gpmulti`)

5. **Click "Run workflow"** to start deployment

#### What It Does:
```
1. Creates Firebase Hosting site (if doesn't exist)
2. Handles random suffix (e.g., -y757r4) automatically
3. Updates firebase.json with new site config
4. Builds app with GP branding
5. Deploys to Firebase Hosting
6. Updates Firestore with final domain
7. Commits firebase.json changes back to repo
```

---

## 📋 Required GitHub Secrets

You need to configure these secrets in your GitHub repository:

### Go to: Settings → Secrets and variables → Actions → New repository secret

### Firebase Configuration Secrets:
```
VITE_FIREBASE_API_KEY             → Your Firebase API key
VITE_FIREBASE_AUTH_DOMAIN         → Your auth domain
VITE_FIREBASE_PROJECT_ID          → grampanchayat-multi-tenant
VITE_FIREBASE_STORAGE_BUCKET      → Storage bucket
VITE_FIREBASE_MESSAGING_SENDER_ID → Messaging sender ID
VITE_FIREBASE_APP_ID              → App ID
VITE_FIREBASE_MEASUREMENT_ID      → Analytics measurement ID
```

### Authentication Secrets (Choose ONE):

#### Option A: Service Account (RECOMMENDED)
```
FIREBASE_SERVICE_ACCOUNT_BASE64   → Base64-encoded service account JSON
```

**How to create:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Encode to base64:
   ```bash
   cat service-account.json | base64 -w 0
   ```
5. Copy the output and paste as secret value

#### Option B: CI Token (DEPRECATED but works)
```
FIREBASE_TOKEN                    → CI token from `firebase login:ci`
```

**How to create:**
```bash
firebase login:ci
# Copy the token displayed
```

**Note:** Firebase warns this method is deprecated. Use Service Account instead.

---

## 🐛 Troubleshooting

### Error: "Requested entity was not found"

**Cause:** Trying to deploy to a site that doesn't exist

**Solution:**
1. The workflow now auto-creates sites
2. If site already exists manually, workflow will use it
3. Check `.firebaserc` for configured targets

---

### Error: "Authentication failed"

**Cause:** Missing or invalid secrets

**Solution:**
1. Check GitHub Secrets are configured
2. Verify `FIREBASE_SERVICE_ACCOUNT_BASE64` or `FIREBASE_TOKEN` exists
3. For service account: Ensure base64 encoding is correct
4. For token: Regenerate with `firebase login:ci`

---

### Error: "Site already exists"

**Cause:** Site was manually created or workflow already ran

**Solution:**
- This is actually FINE! The workflow handles this gracefully
- It will use the existing site instead of creating new one

---

### Workflow Runs But GP Not Updated

**Cause:** Firestore update step might have failed

**Solution:**
1. Check workflow logs for "Update Firestore" step
2. Ensure service account has Firestore write permissions
3. Manually update GP domain in Firestore if needed

---

## ✅ Testing the Fix

### 1. Test GP Deployment via GitHub Actions

```
1. Go to: https://github.com/vishwasT007/grampanchayat-multi-tenant/actions
2. Click "Auto Deploy GP to Firebase Hosting"
3. Click "Run workflow"
4. Enter: pindkeparlodha-gpmulti
5. Monitor the run

Expected outcome:
✅ Site reused: pindkeparlodha-gpmulti-y757r4
✅ Built and deployed
✅ firebase.json updated
✅ Live at: https://pindkeparlodha-gpmulti-y757r4.web.app
```

---

## 🎯 Summary

### What's Fixed:
✅ Hyphen preservation in GP names  
✅ Correct GP ID extraction  
✅ Proper authentication handling  
✅ Auto-handling of Firebase random suffixes  
✅ Selective deployment (main/superadmin vs GPs)  

### What to Do Now:
1. Commit and push these workflow fixes (I'll do this for you)
2. Create GP in SuperAdmin panel with: `pindkeparlodha-gpmulti`
3. Deploy via GitHub Actions or local script
4. Verify deployment

All workflows are now fixed and ready to use! 🚀
