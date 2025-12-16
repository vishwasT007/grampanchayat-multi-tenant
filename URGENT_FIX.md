# 🔥 URGENT: Fix Production Firebase Error

## The Problem
Your production site at https://www.grampanchayatwarghat.in/ shows:
```
Firebase: Error (auth/invalid-api-key)
```

**Root Cause**: Environment variables from `.env` file are NOT available in production.

---

## ✅ SOLUTION (Choose ONE method):

### Method 1: Vercel Dashboard (EASIEST - 5 minutes)

1. **Go to**: https://vercel.com/dashboard
2. **Select**: Your `grampanchayat` project
3. **Click**: Settings → Environment Variables
4. **Add these 6 variables** (click "Add New" for each):

| Variable Name | Value |
|--------------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyDZg8nBI53IfImn8-jTUGOVs6G4XeGJh1M` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `grampanchayat-f0aa7.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `grampanchayat-f0aa7` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `grampanchayat-f0aa7.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `394538115264` |
| `VITE_FIREBASE_APP_ID` | `1:394538115264:web:9ecd75d9b17c5d34774d25` |

   **For each variable**:
   - Select **Production**, **Preview**, **Development**
   - Click Save

5. **Redeploy**:
   - Go to "Deployments" tab
   - Click ⋮ (three dots) on latest deployment
   - Select "Redeploy"
   - ✅ Uncheck "Use existing Build Cache"

---

### Method 2: Automated Script (FASTEST - 2 minutes)

Run this command in your terminal:

```bash
./add-vercel-env.sh
```

This will:
- Install Vercel CLI (if needed)
- Login to Vercel
- Add all environment variables
- Trigger a new deployment

---

## 🎯 What Happens Next

After redeploying:
1. Wait 2-3 minutes for deployment
2. Visit: https://www.grampanchayatwarghat.in/
3. Open browser console (F12)
4. You should see: `✅ Firestore offline persistence enabled`
5. Error should be GONE ✨

---

## 📋 Verification Checklist

After deployment, check:
- [ ] No `Firebase: Error (auth/invalid-api-key)` in console
- [ ] Can see "Firestore offline persistence enabled"
- [ ] Login/Signup works
- [ ] Data loads from Firebase
- [ ] No error messages in console

---

## 🆘 Still Having Issues?

1. **Check all 6 variables are added** in Vercel dashboard
2. **Ensure names are EXACT** (including `VITE_` prefix)
3. **No extra spaces** in values
4. **Hard refresh** browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
5. **Clear cache**: In browser console run `localStorage.clear()` and refresh

---

## 📞 Need Help?

The detailed guide is in: `PRODUCTION_ENV_FIX.md`
