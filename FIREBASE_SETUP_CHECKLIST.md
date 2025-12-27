# ✅ Firebase Setup Completion Checklist

**Status: .env.local created! Now enable Firebase services.**

---

## 🎯 Current Status

✅ Firebase project created: `grampanchayat-dev`  
✅ Web app registered  
✅ Configuration copied  
✅ `.env.local` file created  

**Next: Enable 3 Firebase services**

---

## 📋 Steps to Complete

Go to: https://console.firebase.google.com/project/grampanchayat-dev

### Step 1: Enable Firestore Database

```
□ Click "Firestore Database" in left sidebar
□ Click "Create database" button
□ Select "Start in test mode"
□ Choose region: asia-south1 (or your preference)
□ Click "Enable"
□ Wait for "Cloud Firestore" to show "Database created"
```

**Time: 1-2 minutes**

---

### Step 2: Enable Authentication

```
□ Click "Authentication" in left sidebar
□ Click "Get started" button
□ Find "Email/Password" in the list
□ Click on "Email/Password"
□ Toggle "Enable" to ON
□ Click "Save"
□ Should show "Enabled" next to Email/Password
```

**Time: 30 seconds**

---

### Step 3: Enable Storage

```
□ Click "Storage" in left sidebar
□ Click "Get started" button
□ Select "Start in test mode"
□ Choose same region as Firestore
□ Click "Done"
□ Should show storage bucket created
```

**Time: 1 minute**

---

## 🧪 Test Your Setup

```bash
□ Run: npm run dev
□ Open: http://localhost:5173
□ Press F12 (open browser console)
□ Look for: "Project ID: grampanchayat-dev"
```

**Expected Output:**
```
✅ Firebase initialized successfully
✅ Project ID: grampanchayat-dev
```

**NOT this:**
```
❌ Project ID: grampanchayat-multi-tenant
```

---

## 🎉 Success!

If you see `grampanchayat-dev` in the console, you're all set!

**You can now:**
- Develop safely on `develop` branch
- Test features without touching production
- Create test data in dev database
- Upload test files to dev storage

**Production remains untouched!** ✅

---

## 🆘 Troubleshooting

### Issue: Still seeing "grampanchayat-multi-tenant"

**Check:**
```bash
ls -la .env.local  # Should exist
cat .env.local | grep PROJECT_ID  # Should show grampanchayat-dev
```

**Fix:**
- Restart dev server (Ctrl+C, then `npm run dev`)
- Hard refresh browser (Ctrl+Shift+R)

### Issue: Can't find Firestore/Auth/Storage in sidebar

**Fix:**
- Make sure you're in the correct project: grampanchayat-dev
- Check project selector at top of Firebase Console

---

## 📞 All Done? Test It!

```bash
npm run dev
```

Open browser, check console, and look for the dev project ID! 🚀
