# Add Firebase Config to GitHub Secrets

## CRITICAL: GP Websites Need Firebase Config!

The GP websites deployed via GitHub Actions need Firebase configuration to work.
You must add these as GitHub Secrets.

---

## Step-by-Step Instructions

### 1. Go to GitHub Secrets Page

Visit: https://github.com/vishwasT007/grampanchayat-multi-tenant/settings/secrets/actions

(Or: Repository → Settings → Secrets and variables → Actions → New repository secret)

---

### 2. Add Each Secret

Click **"New repository secret"** for each of the following:

#### Secret 1: VITE_FIREBASE_API_KEY
- **Name:** `VITE_FIREBASE_API_KEY`
- **Value:** `AIzaSyB67ZvBQ7DLy3nErDuWSorBtbwgKeoWCw4`

#### Secret 2: VITE_FIREBASE_AUTH_DOMAIN
- **Name:** `VITE_FIREBASE_AUTH_DOMAIN`
- **Value:** `grampanchayat-multi-tenant.firebaseapp.com`

#### Secret 3: VITE_FIREBASE_PROJECT_ID
- **Name:** `VITE_FIREBASE_PROJECT_ID`
- **Value:** `grampanchayat-multi-tenant`

#### Secret 4: VITE_FIREBASE_STORAGE_BUCKET
- **Name:** `VITE_FIREBASE_STORAGE_BUCKET`
- **Value:** `grampanchayat-multi-tenant.firebasestorage.app`

#### Secret 5: VITE_FIREBASE_MESSAGING_SENDER_ID
- **Name:** `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Value:** `595321745876`

#### Secret 6: VITE_FIREBASE_APP_ID
- **Name:** `VITE_FIREBASE_APP_ID`
- **Value:** `1:595321745876:web:3073e006f4a418207e2641`

#### Secret 7: VITE_FIREBASE_MEASUREMENT_ID (Optional)
- **Name:** `VITE_FIREBASE_MEASUREMENT_ID`
- **Value:** `` (leave empty for now)

---

## Quick Copy-Paste Commands

If you have GitHub CLI (`gh`) installed, you can run these commands:

```bash
gh secret set VITE_FIREBASE_API_KEY -b "AIzaSyB67ZvBQ7DLy3nErDuWSorBtbwgKeoWCw4"
gh secret set VITE_FIREBASE_AUTH_DOMAIN -b "grampanchayat-multi-tenant.firebaseapp.com"
gh secret set VITE_FIREBASE_PROJECT_ID -b "grampanchayat-multi-tenant"
gh secret set VITE_FIREBASE_STORAGE_BUCKET -b "grampanchayat-multi-tenant.firebasestorage.app"
gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID -b "595321745876"
gh secret set VITE_FIREBASE_APP_ID -b "1:595321745876:web:3073e006f4a418207e2641"
gh secret set VITE_FIREBASE_MEASUREMENT_ID -b ""
```

---

## 3. Verify Secrets Are Added

After adding all secrets, you should see them listed at:
https://github.com/vishwasT007/grampanchayat-multi-tenant/settings/secrets/actions

You should see:
- ✅ FIREBASE_TOKEN (already exists)
- ✅ VITE_FIREBASE_API_KEY (new)
- ✅ VITE_FIREBASE_AUTH_DOMAIN (new)
- ✅ VITE_FIREBASE_PROJECT_ID (new)
- ✅ VITE_FIREBASE_STORAGE_BUCKET (new)
- ✅ VITE_FIREBASE_MESSAGING_SENDER_ID (new)
- ✅ VITE_FIREBASE_APP_ID (new)
- ✅ VITE_FIREBASE_MEASUREMENT_ID (new)

---

## 4. Test by Re-running GitHub Action

1. Go to: https://github.com/vishwasT007/grampanchayat-multi-tenant/actions

2. Find the failed "Auto Deploy GP to Firebase Hosting" workflow

3. Click on it

4. Click **"Re-run failed jobs"**

5. This time it should:
   - ✅ Build successfully (with Firebase config)
   - ✅ Deploy successfully
   - ✅ GP website should load without errors

---

## Why This Is Needed

- GitHub Actions runs in a clean environment
- It doesn't have access to your local `.env` file
- Firebase config must be provided via GitHub Secrets
- The build process injects these secrets as environment variables
- Vite bundles them into the production JavaScript

---

## Security Note

⚠️ These values are **public** (visible in browser network requests).
This is normal for Firebase web apps - security is handled by Firestore rules.

✅ The `FIREBASE_TOKEN` secret remains private (used for deployment only).

---

## Next Steps

After adding secrets:

1. ✅ Add all 7 secrets to GitHub
2. ✅ Re-run the failed GitHub Action
3. ✅ Visit https://pindkepar-lodha-gpmulti.web.app
4. ✅ GP website should load successfully!

---

**Let me know when you've added the secrets and I'll help you test!**
