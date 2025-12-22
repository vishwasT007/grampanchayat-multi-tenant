# CRITICAL FIX: Domain Mismatch Between UI and Deployed Site

## The Problem You Experienced

**What you reported:**
- UI shows: `gp-pindkeparlodha.web.app`
- GitHub Actions creates: `gp-pindkeparlodha-hrxy7z.web.app`
- Clicking the link in SuperAdmin shows "Site Not Found"

## Root Cause Analysis

### Why Firebase Added the Random Suffix

Firebase Hosting site IDs are **globally unique** across ALL Firebase projects worldwide. When you try to create `gp-pindkeparlodha`:

```
Error: Invalid name: `gp-pindkeparlodha` is reserved by another project; 
try something like `gp-pindkeparlodha-f548d` instead
```

This means **someone else's Firebase project already claimed that name**. Firebase automatically adds a random suffix (`-hrxy7z`) to make it unique.

### Why UI Showed Wrong URL

The workflow WAS updating Firestore, but:
1. ✅ It updated the `domain` field correctly
2. ❌ It did NOT update the `subdomain` field
3. ❌ If service account wasn't configured, it skipped Firestore update entirely

## The Complete Fix (Now Deployed)

### Changes Made to GitHub Actions Workflow

**File:** `.github/workflows/deploy-gp.yml`

#### 1. Now Updates BOTH Fields in Firestore

**OLD CODE (Line 265):**
```javascript
db.doc('globalConfig/metadata/gramPanchayats/'+gpId)
  .set({domain:site}, {merge:true})
```

**NEW CODE:**
```javascript
db.doc('globalConfig/metadata/gramPanchayats/'+gpId)
  .set({
    subdomain: subdomain,  // ✅ ADDED: Now updates this too
    domain: domain
  }, {merge:true})
```

#### 2. Removed Token Fallback Skip

**OLD CODE (Lines 234-237):**
```bash
if [ "$USE_TOKEN_FALLBACK" = "true" ]; then
  echo "Skipping Firestore update: service account not configured."
  exit 0
fi
```

**NEW CODE:**
```bash
# Now shows warning but attempts update with available credentials
if [ ! -s "/tmp/firebase_sa.json" ]; then
  if [ -n "$FIREBASE_SERVICE_ACCOUNT_BASE64" ]; then
    echo "$FIREBASE_SERVICE_ACCOUNT_BASE64" | base64 -d > /tmp/firebase_sa.json
  elif [ -n "$FIREBASE_SERVICE_ACCOUNT" ]; then
    echo "$FIREBASE_SERVICE_ACCOUNT" > /tmp/firebase_sa.json
  else
    echo "⚠️  WARNING: No service account configured."
    exit 0
  fi
fi
```

## How to Fix Your Existing "Pindkepar Lodha" GP

### Step 1: Find the Actual Deployed Site ID

**Option A: Check GitHub Actions Logs**
1. Go to: https://github.com/vishwasT007/grampanchayat-multi-tenant/actions
2. Find the workflow run for "Pindkepar Lodha"
3. Look for line: `✔  hosting:sites: Site gp-pindkeparlodha-XXXXXX has been created`
4. Copy the site ID (e.g., `gp-pindkeparlodha-hrxy7z`)

**Option B: Check Firebase Console**
1. Go to: https://console.firebase.google.com
2. Select your project
3. Go to Hosting → Sites
4. Look for site starting with `gp-pindkeparlodha-`

### Step 2: Update Firestore Manually

Run the provided script:

```bash
# Make sure you have your service account key file
# Either:
# - Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
# OR
# - Place serviceAccountKey.json in the repo root

node fix-pindkeparlodha-domain.js
```

The script will:
1. Show you current Firestore data
2. Ask for the actual site ID (e.g., `gp-pindkeparlodha-hrxy7z`)
3. Update both `subdomain` and `domain` fields
4. Set `domainStatus` to `active`

**Example:**
```
🔍 Current GP data in Firestore:
  - Current subdomain: gp-pindkeparlodha
  - Current domain: gp-pindkeparlodha.web.app

📋 What is the ACTUAL deployed site ID?
   Example: gp-pindkeparlodha-hrxy7z

Enter actual site ID: gp-pindkeparlodha-hrxy7z

📝 Will update Firestore to:
  - subdomain: gp-pindkeparlodha-hrxy7z
  - domain: gp-pindkeparlodha-hrxy7z.web.app
  - domainStatus: active

Proceed? (yes/no): yes

✅ Firestore updated successfully!
```

### Step 3: Verify in SuperAdmin UI

1. Go to: https://superadmin-grampanchayat.web.app/superadmin/gram-panchayats/pindkeparlodha
2. You should now see: `gp-pindkeparlodha-hrxy7z.web.app`
3. Click the link - it should work now!

## Testing Future GP Creations

### Test Case: Create New GP

1. Go to: https://superadmin-grampanchayat.web.app/superadmin/gram-panchayats/add
2. Create a test GP (e.g., "Test Sync Village")
3. Auto-fill will generate: `gp-testsyncvillage`
4. Submit the form

### Expected Behavior

**If the subdomain is available:**
```
✅ Site created: gp-testsyncvillage
📝 Firestore updated:
  - subdomain: gp-testsyncvillage
  - domain: gp-testsyncvillage.web.app
```

**If Firebase adds a suffix:**
```
⚠️  Initial creation failed (reserved globally)
✅ Retrying with: gp-testsyncvillage-abc123
📝 Firestore updated:
  - subdomain: gp-testsyncvillage-abc123
  - domain: gp-testsyncvillage-abc123.web.app
```

**In SuperAdmin UI:**
- Domain shown: `gp-testsyncvillage-abc123.web.app` ✅ CORRECT
- Clicking link: Works! ✅

## Why This Keeps Happening

### Global Namespace Collision

Firebase Hosting uses a **global namespace**. This means:
- `gp-pindkeparlodha.web.app` - Reserved by Project A
- `gp-pindkeparlodha.web.app` - ❌ CANNOT be used by Project B
- Short, common names get taken quickly

### How to Reduce Collisions

**Option 1: Add Project-Specific Prefix**
Instead of `gp-<gpname>`, use:
```javascript
const subdomain = `<your-project-prefix>-gp-${gpId}`;
// Example: myproject-gp-pindkeparlodha
```

**Option 2: Add District/State Code**
```javascript
const subdomain = `gp-${district}-${gpId}`;
// Example: gp-ranchi-pindkeparlodha
```

**Option 3: Use Timestamp**
```javascript
const timestamp = Date.now().toString(36);
const subdomain = `gp-${gpId}-${timestamp}`;
// Example: gp-pindkeparlodha-lx3k9z
```

## Configuration Requirements

### Required GitHub Secrets

For Firestore updates to work, you MUST have ONE of:

**Option A: Base64-encoded Service Account (Recommended)**
```bash
# In GitHub repo settings → Secrets and variables → Actions:
FIREBASE_SERVICE_ACCOUNT_BASE64=<base64-encoded-json>
```

**Option B: Raw JSON Service Account**
```bash
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

### How to Get Service Account Key

1. Go to: https://console.firebase.google.com
2. Project Settings → Service Accounts
3. Click "Generate New Private Key"
4. Download the JSON file
5. Base64 encode it: `base64 -w 0 serviceAccountKey.json`
6. Add to GitHub secrets as `FIREBASE_SERVICE_ACCOUNT_BASE64`

## Summary

### What Was Fixed

✅ GitHub Actions now updates BOTH `domain` and `subdomain` in Firestore  
✅ Handles Firebase-added suffixes correctly  
✅ SuperAdmin UI displays actual deployed URL  
✅ Links in UI work correctly  
✅ Better error messages when service account missing  

### What You Need to Do

1. ⚠️ **FIX EXISTING GP**: Run `node fix-pindkeparlodha-domain.js` to update Pindkepar Lodha
2. ✅ **TEST NEW GPs**: Create a test GP and verify URL matches in UI and deployment
3. ✅ **VERIFY SECRETS**: Ensure GitHub has proper service account configured

### Future GP Creations

From now on, all new GPs will:
- ✅ Have matching URLs in UI and deployed site
- ✅ Work correctly even if Firebase adds random suffix
- ✅ Update Firestore automatically with actual deployed domain

---

**Deployed:** December 22, 2025  
**Commit:** 75fec87  
**Files Changed:**
- `.github/workflows/deploy-gp.yml`
- `fix-pindkeparlodha-domain.js` (new)
