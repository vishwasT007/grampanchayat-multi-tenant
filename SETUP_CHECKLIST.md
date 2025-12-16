# ✅ Setup Checklist for Gram Panchayat Pindkepar Lodha

Use this checklist to track your progress:

## Phase 1: Firebase Project Setup

- [ ] **Go to Firebase Console**
  - URL: https://console.firebase.google.com/
  - Login with your existing Firebase account

- [ ] **Create New Project**
  - [ ] Click "Add project"
  - [ ] Name: `grampanchayat-pindkepar-lodha`
  - [ ] Google Analytics: Optional (can disable)
  - [ ] Click "Create project"

- [ ] **Enable Authentication**
  - [ ] Go to Build → Authentication
  - [ ] Click "Get started"
  - [ ] Enable "Email/Password" sign-in method
  - [ ] Click "Save"

- [ ] **Enable Firestore Database**
  - [ ] Go to Build → Firestore Database
  - [ ] Click "Create database"
  - [ ] Choose "Start in production mode"
  - [ ] Location: `asia-south1` (Mumbai)
  - [ ] Click "Enable"

- [ ] **Enable Storage**
  - [ ] Go to Build → Storage
  - [ ] Click "Get started"
  - [ ] Choose "Start in production mode"
  - [ ] Click "Done"

- [ ] **Register Web App**
  - [ ] Go to Project Settings (⚙️)
  - [ ] Scroll to "Your apps" section
  - [ ] Click Web icon (`</>`)
  - [ ] App nickname: `Pindkepar Lodha Web`
  - [ ] ✅ Check "Also set up Firebase Hosting"
  - [ ] Click "Register app"

- [ ] **Copy Firebase Config**
  - [ ] Copy the config values that appear
  - [ ] Keep them safe (you'll need them next)

---

## Phase 2: Project Configuration

- [ ] **Update .env File**
  - [ ] Open `.env` file
  - [ ] Uncomment all lines (remove `#` at the start)
  - [ ] Replace values with your new Firebase config
  - [ ] Save the file
  - [ ] Verify no syntax errors

- [ ] **Check Dependencies**
  - [ ] Open terminal in project folder
  - [ ] Run: `npm install`
  - [ ] Wait for installation to complete

---

## Phase 3: Firebase CLI Setup

- [ ] **Login to Firebase**
  - [ ] Run: `firebase login`
  - [ ] Login with your Firebase account in browser
  - [ ] Wait for "Success!" message

- [ ] **Initialize Firebase**
  - [ ] Run: `firebase init`
  - [ ] Select using spacebar:
    - [x] Firestore
    - [x] Storage
    - [x] Hosting
  - [ ] Use existing project → Select `grampanchayat-pindkepar-lodha`
  - [ ] Firestore rules: Use existing `firestore.rules`
  - [ ] Firestore indexes: Use existing `firestore.indexes.json`
  - [ ] Storage rules: Use existing `storage.rules`
  - [ ] Public directory: `dist`
  - [ ] Single-page app: `Yes`
  - [ ] GitHub deploys: `No`
  - [ ] Don't overwrite existing files

- [ ] **Deploy Firebase Rules**
  - [ ] Run: `firebase deploy --only firestore`
  - [ ] Wait for "Deploy complete!"
  - [ ] Run: `firebase deploy --only storage`
  - [ ] Wait for "Deploy complete!"

---

## Phase 4: Local Testing

- [ ] **Start Development Server**
  - [ ] Run: `npm run dev`
  - [ ] Wait for "Local: http://localhost:5173"
  - [ ] Open browser to http://localhost:5173

- [ ] **Verify Website Loads**
  - [ ] Homepage displays correctly
  - [ ] Title shows "Gram Panchayat Pindkepar Lodha"
  - [ ] No console errors in browser

- [ ] **Create Admin Account**
  - [ ] Click "Admin Login" or go to `/admin`
  - [ ] Click "Create new account" (if available)
  - [ ] Or try logging in with your email
  - [ ] Email: Your choice (e.g., `admin@pindkeparlodha.in`)
  - [ ] Password: Create a strong password
  - [ ] Remember these credentials!

- [ ] **Test Admin Panel**
  - [ ] Login successful
  - [ ] Admin Dashboard loads
  - [ ] Try accessing Site Settings
  - [ ] Update site title to "Gram Panchayat Pindkepar Lodha"
  - [ ] Save changes successfully

---

## Phase 5: Configure Settings

- [ ] **Site Settings**
  - [ ] Site Title (English): Gram Panchayat Pindkepar Lodha
  - [ ] Site Title (Hindi): ग्राम पंचायत पिंडकेपार लोधा
  - [ ] Contact Email
  - [ ] Contact Phone
  - [ ] Address
  - [ ] Upload Panchayat Office Photo (optional)

- [ ] **Add Members** (if ready)
  - [ ] Sarpanch details
  - [ ] Up-Sarpanch details
  - [ ] Panchayat Members
  - [ ] Staff Members

- [ ] **Test Other Features**
  - [ ] Add a Notice → Verify it appears on Notices page
  - [ ] Add a Service → Verify it appears on Services page
  - [ ] Upload an image → Verify it uploads to Firebase Storage
  - [ ] Test bilingual content (English/Hindi)

---

## Phase 6: Future Steps (When Ready)

- [ ] **Deploy to Firebase Hosting**
  - [ ] Run: `npm run build`
  - [ ] Run: `firebase deploy --only hosting`
  - [ ] Access at: `https://YOUR-PROJECT-ID.web.app`

- [ ] **Purchase Domain** (Optional)
  - [ ] Buy: grampanchayatpindkepaarlodha.in
  - [ ] Add custom domain in Firebase Console
  - [ ] Update DNS records at registrar
  - [ ] Wait for SSL certificate (24-48 hours)

- [ ] **Setup Git** (Optional)
  - [ ] Run: `git init`
  - [ ] Create GitHub repository
  - [ ] Run: `git remote add origin URL`
  - [ ] Run: `git add .`
  - [ ] Run: `git commit -m "Initial commit"`
  - [ ] Run: `git push -u origin main`

---

## 🎉 Completion Checklist

Mark these when fully done:

- [ ] Firebase project created and configured
- [ ] .env file updated with correct credentials
- [ ] Firebase rules deployed successfully
- [ ] Website running on localhost
- [ ] Admin account created and working
- [ ] Site settings configured
- [ ] Basic content added (at least 1 test item)

---

## 📝 Important Information to Save

**Firebase Project ID:**
_________________________________

**Admin Email:**
_________________________________

**Admin Password:**
_________________________________ (Keep secure!)

**Firebase Hosting URL:**
_________________________________

**Custom Domain (Future):**
grampanchayatpindkepaarlodha.in

---

## 🆘 Troubleshooting

If you encounter issues:

1. **Firebase config error**
   - Check .env file is uncommented
   - Verify all values are correct
   - Restart dev server: `Ctrl+C` then `npm run dev`

2. **Permission denied errors**
   - Deploy rules: `firebase deploy --only firestore,storage`

3. **Dependencies errors**
   - Delete `node_modules` folder
   - Run: `npm install` again

4. **Can't create admin account**
   - Check Firebase Authentication is enabled
   - Check browser console for errors
   - Verify .env has correct auth domain

---

**Status:** Check off items as you complete them!  
**Last Updated:** [Add date when you complete]

Good luck! 🚀
