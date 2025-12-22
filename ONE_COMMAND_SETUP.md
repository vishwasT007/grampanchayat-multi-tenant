# 🎯 ONE-COMMAND AUTOMATION SETUP

## Run This Single Command

```bash
cd /home/vishwas/Music/grampanchayat-pindkepar-lodha/grampanchayat
./complete-automation-setup.sh
```

## What It Does

The script will **guide you through everything**:

### Step 1: Service Account
- Checks if you have `serviceAccountKey.json`
- If not, opens Firebase Console link
- Waits for you to download it
- Validates the JSON

### Step 2: Local Testing
- Tests service account with Firebase
- Verifies Firestore access
- Checks if your current GP exists

### Step 3: GitHub Secret
- Generates properly formatted JSON
- Shows you the exact value to copy
- Opens GitHub secrets page
- Waits for you to update it

### Step 4: Fix Current GP
- Updates `pindkeparlodha` domain to `gp-pindkeparlodha-wsye6o.web.app`
- Updates Firestore automatically
- Asks for confirmation first

### Step 5: Summary
- Shows everything that was set up
- Gives you links to test
- Explains what's automated now

---

## After Running the Script

### 1. Verify Current GP

**Refresh this page:**
https://superadmin-grampanchayat.web.app/superadmin/gram-panchayats/pindkeparlodha

**You should see:**
```
Domain: gp-pindkeparlodha-wsye6o.web.app 🔗
Status: active
```

**Click the link** → Site opens!

### 2. Test Automation with New GP

**Create a test GP:**
https://superadmin-grampanchayat.web.app/superadmin/gram-panchayats/add

**Fill in:**
- Name: Test Automation Village
- District: Test District
- Other required fields

**What happens automatically:**
1. ✅ Form submits → Success screen
2. ✅ Auto-redirect to ViewGP page (5 seconds)
3. ✅ Shows "Deployment in progress..."
4. ✅ GitHub Actions runs (2-3 minutes)
5. ✅ Domain appears automatically!
6. ✅ Click link → Site opens!

**No manual work!**

---

## What's Automated Now

```
┌─────────────────────────────────────────┐
│  YOU CREATE GP IN UI                    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Firestore saves GP data                │
│  subdomain: "gp-testauto..."            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Cloud Function triggers                │
│  Calls GitHub Actions API               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  GitHub Actions (2-3 min)               │
│  1. Create Firebase site                │
│  2. Build React app                     │
│  3. Deploy to Hosting                   │
│  4. Update Firestore ✅                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Real-time listener fires               │
│  UI updates automatically!              │
│  Domain appears in ViewGP               │
└─────────────────────────────────────────┘
```

**Every step is automatic!**

---

## Troubleshooting

### Script says "serviceAccountKey.json not found"

**Solution:**
1. Open: https://console.firebase.google.com/project/grampanchayat-multi-tenant/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Save as `serviceAccountKey.json` in the repo directory
4. Press Enter in the script

### "JSON is invalid"

**Solution:**
- Re-download from Firebase Console
- Make sure you're downloading the Firebase Admin SDK key (not Google Cloud key)

### "Firestore access failed"

**Solution:**
- Make sure service account has Firestore permissions
- Check Firebase project ID matches

### GitHub secret update doesn't work

**Solution:**
1. Copy the ENTIRE minified JSON (starts with `{` ends with `}`)
2. Make sure no extra spaces or line breaks
3. Delete the old secret and create a new one if needed

---

## Quick Test Checklist

After running the setup script:

- [ ] `serviceAccountKey.json` exists and is valid
- [ ] Local Firestore test passed
- [ ] GitHub secret updated
- [ ] Current GP domain fixed to `gp-pindkeparlodha-wsye6o.web.app`
- [ ] SuperAdmin page shows correct domain
- [ ] Can click domain link and site opens
- [ ] Ready to create new test GP

---

## Alternative: Manual Steps

If you prefer to do it manually:

### 1. Download Service Account
```bash
# Go to Firebase Console → Service Accounts → Generate Key
# Save as serviceAccountKey.json
```

### 2. Update GitHub Secret
```bash
# Generate minified JSON
jq -c . serviceAccountKey.json

# Go to GitHub → Settings → Secrets
# Update FIREBASE_SERVICE_ACCOUNT with the output
```

### 3. Fix Current GP
```bash
export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
node fix-pindkeparlodha-domain.js
```

---

## Support

**Documentation:**
- `COMPLETE_AUTOMATION_GUIDE.md` - Full technical details
- `SERVICE_ACCOUNT_FIX.md` - Troubleshooting guide
- `QUICK_START_CREATE_GP.md` - Quick reference

**Scripts:**
- `complete-automation-setup.sh` - ⭐ ONE-COMMAND SETUP
- `reupload-service-account.sh` - Re-upload service account only
- `fix-pindkeparlodha-domain.js` - Fix existing GP domain

---

## Ready? Run It!

```bash
cd /home/vishwas/Music/grampanchayat-pindkepar-lodha/grampanchayat
./complete-automation-setup.sh
```

**Takes 5-10 minutes. Makes everything automated forever!** 🚀
