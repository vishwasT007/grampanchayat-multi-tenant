# 🚨 URGENT FIX - Service Account Error

## The Problem

**GitHub Actions Error:**
```
Invalid service account JSON: Unexpected non-whitespace character after JSON at position 1
Error: Process completed with exit code 1
```

**What This Means:**
- ✅ GitHub Actions successfully deployed your site to: `gp-pindkeparlodha-wsye6o.web.app`
- ❌ But Firestore update FAILED due to corrupted service account secret
- ❌ So UI still shows old domain: `gp-pindkeparlodha.web.app` (doesn't exist)

---

## 🔧 Fix in 3 Steps (5 Minutes)

### Step 1: Download Service Account Key

1. **Go to Firebase Console:**
   https://console.firebase.google.com/project/grampanchayat-multi-tenant/settings/serviceaccounts/adminsdk

2. **Click "Generate new private key"**

3. **Download the JSON file** and save it as `serviceAccountKey.json` in your repo directory:
   ```bash
   /home/vishwas/Music/grampanchayat-pindkepar-lodha/grampanchayat/
   ```

### Step 2: Generate Base64 for GitHub Secret

Run this command:

```bash
cd /home/vishwas/Music/grampanchayat-pindkepar-lodha/grampanchayat
./setup-github-secret.sh
```

**Or manually:**
```bash
base64 -w 0 serviceAccountKey.json
```

This will output a long base64 string. **Copy it!**

### Step 3: Update GitHub Secret

1. **Go to GitHub Secrets:**
   https://github.com/vishwasT007/grampanchayat-multi-tenant/settings/secrets/actions

2. **Find or create:** `FIREBASE_SERVICE_ACCOUNT_BASE64`

3. **Paste the base64 string** from Step 2

4. **Save the secret**

---

## 🔥 Quick Fix for Current GP (Right Now!)

Your GP is already deployed at `gp-pindkeparlodha-wsye6o.web.app` but Firestore has wrong domain.

**Option A: Using the Fix Script**

```bash
cd /home/vishwas/Music/grampanchayat-pindkepar-lodha/grampanchayat

# Make sure you have serviceAccountKey.json in this directory
export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

# Run the fix script
node fix-pindkeparlodha-domain.js
```

The script will:
- Show current Firestore data
- Update to: `gp-pindkeparlodha-wsye6o.web.app`
- Ask for confirmation
- Update Firestore

**Option B: Manual Firestore Update**

1. **Go to Firestore:**
   https://console.firebase.google.com/project/grampanchayat-multi-tenant/firestore/databases/-default-/data/~2FglobalConfig~2Fmetadata~2FgramPanchayats~2Fpindkeparlodha

2. **Edit the document:**
   ```
   subdomain: "gp-pindkeparlodha-wsye6o"
   domain: "gp-pindkeparlodha-wsye6o.web.app"
   domainStatus: "active"
   ```

3. **Save**

4. **Refresh your SuperAdmin page** - you'll see the correct domain!

---

## ✅ Verify the Fix

### After Updating Firestore:

1. **Refresh SuperAdmin page:**
   https://superadmin-grampanchayat.web.app/superadmin/gram-panchayats/pindkeparlodha

2. **You should see:**
   ```
   Domain: gp-pindkeparlodha-wsye6o.web.app 🔗
   Subdomain: gp-pindkeparlodha-wsye6o
   Status: active
   ```

3. **Click the 🔗 icon** - site should open!

4. **Test the site:**
   https://gp-pindkeparlodha-wsye6o.web.app

### After Fixing GitHub Secret:

1. **Create a new test GP** to verify automation works

2. **Watch GitHub Actions:**
   https://github.com/vishwasT007/grampanchayat-multi-tenant/actions

3. **Check logs for:**
   ```
   ✅ Firestore updated successfully
   Updating GP pindkeparlodha
     - subdomain: gp-pindkeparlodha-wsye6o
     - domain: gp-pindkeparlodha-wsye6o.web.app
   ```

---

## 🎯 Why This Happened

### Common Causes of "Invalid JSON" Error:

1. **Copy-Paste Error:**
   - Copied service account JSON with extra characters
   - Missing quotes or braces
   - Whitespace at start/end

2. **Base64 Encoding Issues:**
   - Used `base64` with line breaks (should use `-w 0`)
   - Encoded wrong file
   - Corrupted during copy-paste

3. **Secret Format Wrong:**
   - Added raw JSON instead of base64
   - Added base64 but workflow expects raw JSON
   - Mixed up `FIREBASE_SERVICE_ACCOUNT` vs `FIREBASE_SERVICE_ACCOUNT_BASE64`

---

## 🛠️ Troubleshooting

### Test Service Account Locally

```bash
cd /home/vishwas/Music/grampanchayat-pindkepar-lodha/grampanchayat

# Test if JSON is valid
cat serviceAccountKey.json | jq .

# If error: JSON is corrupted, re-download from Firebase
```

### Test Base64 Encoding

```bash
# Encode
base64 -w 0 serviceAccountKey.json > encoded.txt

# Decode and verify
cat encoded.txt | base64 -d | jq .

# Should show valid JSON, if error: encoding problem
```

### Test Firestore Write Permission

```bash
export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

db.doc('globalConfig/metadata/gramPanchayats/pindkeparlodha')
  .get()
  .then(doc => {
    console.log('✅ Read successful:', doc.exists ? 'Document exists' : 'Not found');
    return db.doc('globalConfig/metadata/gramPanchayats/pindkeparlodha')
      .set({ test: true }, { merge: true });
  })
  .then(() => {
    console.log('✅ Write successful');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
"
```

---

## 📋 Checklist

Before creating next GP:

- [ ] Downloaded fresh service account key from Firebase
- [ ] Saved as `serviceAccountKey.json`
- [ ] Validated JSON: `cat serviceAccountKey.json | jq .`
- [ ] Generated base64: `base64 -w 0 serviceAccountKey.json`
- [ ] Updated GitHub secret `FIREBASE_SERVICE_ACCOUNT_BASE64`
- [ ] Fixed current GP's Firestore data
- [ ] Tested: SuperAdmin shows correct domain
- [ ] Tested: Can open GP site in browser

---

## 🎯 Expected GitHub Actions Output (After Fix)

```
Update Firestore domain and subdomain with final site
npm install firebase-admin --no-save
✓ up to date

SITE_ID=gp-testgp-abc123
GP_ID=testgp

Updating GP testgp
  - subdomain: gp-testgp-abc123
  - domain: gp-testgp-abc123.web.app
✅ Firestore updated successfully

Success notification
✅ GP deployed successfully!
🌐 ACTUAL DEPLOYED SITE: https://gp-testgp-abc123.web.app
```

---

## 🚀 Next Steps

1. **Fix current GP:** Run `node fix-pindkeparlodha-domain.js`
2. **Fix GitHub secret:** Follow Step 1-3 above
3. **Test with new GP:** Create another GP and verify automation works
4. **Celebrate!** 🎉

---

**Need Help?**
- Service account not downloading? Check Firebase project permissions
- JSON validation failing? Re-download the key
- Still getting errors? Share the exact error message

---

**Last Updated:** December 22, 2025  
**Status:** Waiting for service account secret fix  
**Current GP Site:** https://gp-pindkeparlodha-wsye6o.web.app (deployed, just needs Firestore update)
