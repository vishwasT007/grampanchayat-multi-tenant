# 🎯 Firebase Web App Setup - Quick Reference Card

Print or keep this open while setting up Firebase!

---

## ✅ Checklist

```
□ Go to https://console.firebase.google.com/
□ Create project: grampanchayat-dev
□ Click </> Web icon
□ Register app (nickname: Gram Panchayat Dev)
□ Copy Firebase configuration (6 values)
□ Run ./setup-dev-firebase.sh
□ Paste configuration values
□ Enable Firestore Database
□ Enable Authentication
□ Enable Storage
□ Test with npm run dev
```

---

## 📝 6 Values You Need to Copy

From Firebase Console config screen:

```javascript
const firebaseConfig = {
  apiKey: "________________________________________",
  authDomain: "____________________________________",
  projectId: "_____________________________________",
  storageBucket: "__________________________________",
  messagingSenderId: "_______________________________",
  appId: "________________________________________"
};
```

---

## 🖱️ Click Path

```
Firebase Console
    ↓
Add project
    ↓
grampanchayat-dev
    ↓
Continue → Continue → Continue
    ↓
Click </> (Web icon)
    ↓
Enter nickname → Register app
    ↓
Copy config values
    ↓
Continue to console
    ↓
Enable Firestore (test mode)
    ↓
Enable Authentication (Email/Password)
    ↓
Enable Storage (test mode)
    ↓
Done!
```

---

## 💻 Terminal Commands

```bash
# 1. Run setup script
./setup-dev-firebase.sh

# 2. Paste values when prompted

# 3. Test
npm run dev

# 4. Check browser console
# Should see: projectId: "grampanchayat-dev"
```

---

## 🔍 Where is the Config?

**If you need to find it again:**

1. Firebase Console → Your Project
2. Click ⚙️ (Settings gear) → Project settings
3. Scroll to "Your apps"
4. Click "Config" radio button
5. Copy values

---

## ⚠️ Common Mistakes

- ❌ Clicking iOS or Android icon (click Web icon!)
- ❌ Checking "Firebase Hosting" box (leave unchecked)
- ❌ Forgetting to copy ALL 6 values
- ❌ Copying with quotes (paste without quotes)
- ❌ Wrong variable names in .env.local

---

## ✅ Success Indicators

After setup, you should see:

```bash
# In terminal
npm run dev
  ✓ Local:   http://localhost:5173/

# In browser console (F12)
Firebase initialized successfully
Project ID: grampanchayat-dev  ← Should show this!
```

---

## 📞 Need Help?

Read full guide:
```bash
cat FIREBASE_WEB_APP_SETUP_GUIDE.md
```

Or open in VS Code!
