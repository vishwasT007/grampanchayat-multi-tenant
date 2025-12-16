# 🔑 Quick API Key Setup Guide

## Step-by-Step Instructions

### Method 1: Automated Script (Recommended)

```bash
# Run the interactive configuration script
./scripts/configure-api-keys.sh
```

The script will guide you through:
1. Adding authorized domains
2. Restricting API access
3. Setting up App Check (optional)

---

### Method 2: Manual Configuration

#### Part 1: Restrict Browser API Key (15 minutes)

**Step 1**: Get Your Project ID
```bash
# From your .env file
grep VITE_FIREBASE_PROJECT_ID .env
# Example: grampanchayat-multi-tenant
```

**Step 2**: Open Google Cloud Console
```
https://console.cloud.google.com/apis/credentials?project=YOUR_PROJECT_ID
```

**Step 3**: Find & Edit Browser Key
- Look for: **"Browser key (auto created by Firebase)"**
- Click the ✏️ (pencil) icon to edit

**Step 4**: Add HTTP Referrers
Under **"Application restrictions"**:
- Select: **"HTTP referrers (web sites)"**
- Click **"ADD AN ITEM"**
- Add these domains (one per line):

```
https://grampanchayat-multi-tenant.web.app/*
https://grampanchayat-multi-tenant.firebaseapp.com/*
http://localhost:5173/*
http://localhost:4173/*
http://127.0.0.1:5173/*
```

If you have a custom domain:
```
https://your-custom-domain.com/*
```

**Step 5**: Restrict APIs
Under **"API restrictions"**:
- Select: **"Restrict key"**
- Search and enable ONLY these APIs:
  - ✅ Cloud Firestore API
  - ✅ Firebase Authentication API  
  - ✅ Cloud Storage for Firebase API
  - ✅ Firebase Hosting API
  - ✅ Firebase Analytics
  - ✅ Firebase Performance Monitoring

**Step 6**: Save
- Click **"SAVE"** button
- Wait 5 minutes for changes to take effect

---

#### Part 2: Enable App Check (Optional - 30 minutes)

App Check adds an extra layer of security to protect against bots and abuse.

**Step 1**: Get reCAPTCHA v3 Site Key

1. Go to: https://www.google.com/recaptcha/admin/create
2. Fill in:
   - **Label**: Gram Panchayat Portal
   - **reCAPTCHA type**: Select **reCAPTCHA v3**
   - **Domains**: Add these (one per line):
     ```
     grampanchayat-multi-tenant.web.app
     grampanchayat-multi-tenant.firebaseapp.com
     localhost
     ```
3. Accept terms and click **Submit**
4. Copy the **Site Key** (starts with `6L...`)

**Step 2**: Enable App Check in Firebase

1. Go to: https://console.firebase.google.com
2. Select your project
3. Click **App Check** in left sidebar
4. Click **Get started** (if first time)
5. Click **Register app** → Select your web app
6. Choose **reCAPTCHA v3**
7. Paste your Site Key
8. Click **Save**

**Step 3**: Add to Environment Variables

Create or edit `.env.production`:
```bash
# Add this line
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
VITE_ENABLE_APP_CHECK=true
```

**Step 4**: Enforce App Check (After Testing)

1. In Firebase Console → App Check
2. Go to **APIs** tab
3. For each API (Firestore, Storage):
   - Click the settings icon
   - Change from **"Unenforced"** to **"Enforced"**
   - Click **Save**

⚠️ **Important**: Start with "Unenforced" mode and test first!

---

## ✅ Verification Checklist

After configuration:

- [ ] Browser API key has HTTP referrer restrictions
- [ ] Only necessary APIs are enabled
- [ ] Production domain added to authorized list
- [ ] Localhost added for development
- [ ] Changes saved in Google Cloud Console
- [ ] Waited 5 minutes for propagation
- [ ] App Check configured (if enabled)
- [ ] reCAPTCHA site key added to .env.production

---

## 🧪 Testing

### Test 1: Development Still Works

```bash
npm run dev
# Open: http://localhost:5173
# Verify: App loads without errors
```

### Test 2: API Restrictions Work

Check browser console (F12) for any errors:
- ❌ Should NOT see: "API key not valid"
- ✅ Should see: Normal Firebase initialization logs

### Test 3: App Check (If Enabled)

```bash
# Build and test production
npm run build
npm run preview
```

Check console for:
```
✅ Firebase App Check initialized
```

---

## 🆘 Troubleshooting

### Error: "API key not valid"

**Cause**: Domain not in authorized list

**Fix**:
1. Double-check domain spelling
2. Ensure wildcard (*) is at the end
3. Wait 5 minutes after saving
4. Clear browser cache

### Error: "This API project is not authorized"

**Cause**: Required API not enabled

**Fix**:
1. Go back to API restrictions
2. Enable the missing API
3. Save and wait 5 minutes

### App Check Errors

**Cause**: reCAPTCHA not configured correctly

**Fix**:
1. Verify site key is correct
2. Check domain is added in reCAPTCHA console
3. Start with "Unenforced" mode
4. Check browser console for specific error

### Localhost Stops Working

**Cause**: Forgot to add localhost to authorized domains

**Fix**:
Add these to HTTP referrers:
```
http://localhost:5173/*
http://localhost:4173/*
http://127.0.0.1:5173/*
```

---

## 📊 Security Checklist

After setup:

- [ ] API key restricted to specific domains
- [ ] Only Firebase APIs enabled
- [ ] Production domain authorized
- [ ] Development domain authorized (localhost)
- [ ] App Check enabled (recommended)
- [ ] reCAPTCHA configured (if using App Check)
- [ ] Tested in development
- [ ] Tested in production build
- [ ] No console errors
- [ ] Monitoring enabled in Firebase Console

---

## 📈 Monitoring

### Check API Usage

1. Firebase Console → Usage and Billing
2. Monitor:
   - API request count
   - Bandwidth usage
   - Authentication attempts
   - App Check verifications

### Set Up Alerts

1. Firebase Console → Settings → Notifications
2. Enable alerts for:
   - Unusual API usage
   - App Check failures
   - Quota approaching limits

---

## 🎯 Quick Commands

```bash
# Run configuration script
./scripts/configure-api-keys.sh

# Check current environment
cat .env | grep VITE_FIREBASE

# Verify production config
cat .env.production | grep VITE_RECAPTCHA

# Test development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📚 Resources

- **Google Cloud Console**: https://console.cloud.google.com
- **Firebase Console**: https://console.firebase.google.com
- **reCAPTCHA Admin**: https://www.google.com/recaptcha/admin
- **Full Guide**: See `API_KEY_SECURITY_GUIDE.md`

---

## ⏱️ Time Required

| Task | Time |
|------|------|
| Restrict Browser API Key | 10-15 min |
| Set up reCAPTCHA | 10 min |
| Enable App Check | 10 min |
| Testing | 10 min |
| **Total** | **30-45 min** |

---

## 🎉 Success Criteria

✅ Your API keys are secure when:

1. Browser API key has domain restrictions
2. Only necessary APIs are enabled
3. App works on localhost (development)
4. App works on production domain
5. No console errors
6. App Check enabled (optional but recommended)
7. Monitoring alerts configured

---

**Status**: Ready to configure!  
**Next Step**: Run `./scripts/configure-api-keys.sh` or follow manual steps above.
