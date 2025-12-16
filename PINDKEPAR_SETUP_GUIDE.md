# 🏛️ Gram Panchayat Pindkepar Lodha - Setup Guide

## ✅ What's Done

1. ✅ **Git Repository**: Removed old Git connection to avoid conflicts with Warghat repo
2. ✅ **Project Branding**: Updated title to "Gram Panchayat Pindkepar Lodha"
3. ✅ **Environment File**: Ready for new Firebase credentials (currently commented)

---

## 📋 Quick Setup Checklist

### Step 1: Create New Firebase Project (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Project name: `grampanchayat-pindkepar-lodha`
4. Disable Google Analytics (optional)
5. Click **Create project**

### Step 2: Enable Firebase Services (5 minutes)

**Enable Authentication:**
1. Go to **Build** → **Authentication** → **Get started**
2. Enable **Email/Password** sign-in method
3. Click **Save**

**Enable Firestore Database:**
1. Go to **Build** → **Firestore Database** → **Create database**
2. Start in **Production mode**
3. Choose location: `asia-south1` (Mumbai) - closest to India
4. Click **Enable**

**Enable Storage:**
1. Go to **Build** → **Storage** → **Get started**
2. Start in **Production mode**
3. Click **Done**

### Step 3: Get Firebase Configuration

1. In Firebase Console, click the **Gear icon** (⚙️) → **Project settings**
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** (`</>`) to add a web app
4. Register app:
   - App nickname: `Pindkepar Lodha Web`
   - ✅ Also set up Firebase Hosting
   - Click **Register app**
5. **Copy the Firebase config values** that appear
6. Click **Continue to console**

### Step 4: Update .env File

Open the `.env` file in this project and **uncomment** all lines, then replace with your new Firebase config:

```env
# Firebase Configuration for Gram Panchayat Pindkepar Lodha
# IMPORTANT: Do not commit this file to Git!

VITE_FIREBASE_API_KEY=YOUR_NEW_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

### Step 5: Initialize Firebase CLI

Run these commands in the terminal:

```bash
# Login to Firebase (use the same account)
firebase login

# Initialize Firebase for this project
firebase init

# Select these options:
# ◉ Firestore: Configure security rules and indexes files
# ◉ Storage: Configure security rules
# ◉ Hosting: Configure files for Firebase Hosting

# When asked:
# - Use existing project → Select your new project
# - Firestore rules: Use existing firestore.rules
# - Firestore indexes: Use existing firestore.indexes.json
# - Storage rules: Use existing storage.rules
# - Public directory: dist
# - Single-page app: Yes
# - Set up automatic builds: No
# - Overwrite files: No (keep existing)
```

### Step 6: Deploy Firestore Rules & Indexes

```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy Storage rules
firebase deploy --only storage
```

### Step 7: Install Dependencies & Test Locally

```bash
# Install dependencies (if not already installed)
npm install

# Run locally
npm run dev
```

Visit: http://localhost:5173

### Step 8: Create Admin Account

1. Open http://localhost:5173 in browser
2. Go to Admin Login page
3. Create your first admin account:
   - Email: `admin@pindkeparlodha.in` (or any email you prefer)
   - Password: Choose a secure password
4. Login and configure site settings from Admin Dashboard

---

## 🚀 When Ready to Deploy to Production

### Option A: Deploy to Firebase Hosting (Free Subdomain)

```bash
# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Your site will be available at: `https://YOUR_PROJECT_ID.web.app`

### Option B: Connect Custom Domain (grampanchayatpindkepaarlodha.in)

After purchasing the domain:

1. In Firebase Console → **Hosting** → **Add custom domain**
2. Enter: `grampanchayatpindkepaarlodha.in`
3. Add the DNS records provided by Firebase to your domain registrar
4. Wait for SSL certificate (can take 24-48 hours)

---

## 📝 Important Notes

### Multiple Projects in Same Firebase Account

✅ **Yes, you can!** You can have multiple Firebase projects in the same account:
- `grampanchayat-f0aa7` → For Warghat (existing)
- `grampanchayat-pindkepar-lodha` → For Pindkepar Lodha (new)

Each project has:
- ✅ Separate Firestore database
- ✅ Separate Storage
- ✅ Separate Authentication users
- ✅ Separate hosting

They **DO NOT** interfere with each other!

### Data Isolation

- The Warghat website will continue to use its own Firebase project
- This Pindkepar Lodha website will use its own separate Firebase project
- No data will be shared between them

### Git Repository

The old Git connection has been removed. When you're ready:

**Option 1: Create New Repository**
```bash
git init
git add .
git commit -m "Initial commit - Gram Panchayat Pindkepar Lodha"
# Create new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/grampanchayat-pindkepar-lodha.git
git push -u origin main
```

**Option 2: Work Without Git** (For now)
- Just keep working locally until you're ready

---

## 🆘 Troubleshooting

### Error: "Firebase config missing"
- Make sure `.env` file is uncommented and has correct values
- Restart the dev server: `Ctrl+C` then `npm run dev`

### Error: "Permission denied" in Firestore
- Deploy Firestore rules: `firebase deploy --only firestore`

### Error: "Storage rules error"
- Deploy Storage rules: `firebase deploy --only storage`

---

## 📞 Next Steps

1. ✅ Complete Firebase project setup (Steps 1-3)
2. ✅ Share your Firebase config here so I can update the `.env` file
3. ✅ Run `firebase init` to connect this project
4. ✅ Deploy rules and test locally
5. ✅ Create admin account and configure settings

**Once you have the Firebase configuration, share it with me and I'll update the `.env` file for you!**
