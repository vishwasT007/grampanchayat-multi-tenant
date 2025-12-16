╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║           🔥 CREATE NEW FIREBASE PROJECT FOR MULTI-TENANT SETUP 🔥           ║
║                                                                              ║
║     Keep Warghat Production Site Safe - Create Separate Firebase Project    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝


✅ WHY CREATE A NEW FIREBASE PROJECT?
════════════════════════════════════════════════════════════════════════════════

CORRECT APPROACH:
  ✓ Warghat Production (grampanchayatwarghat.in) → Keep existing Firebase project
  ✓ Multi-Tenant GPs (20+ villages) → NEW Firebase project
  ✓ Complete isolation - No risk to production site
  ✓ Separate billing, separate data, separate security

BENEFITS:
  ✓ Zero risk to Warghat production
  ✓ Independent management
  ✓ Can test freely without affecting live site
  ✓ Easier to manage 20+ GPs separately


📋 STEP-BY-STEP SETUP (15 Minutes)
════════════════════════════════════════════════════════════════════════════════

STEP 1: Create New Firebase Project
────────────────────────────────────────────────────────────────────────────────

1. Go to Firebase Console:
   → https://console.firebase.google.com/

2. Click "Add project" or "Create a project"

3. Project Setup:
   
   Name: grampanchayat-multitenant
   (or any name you prefer - this is just for your reference)

4. Google Analytics (Optional):
   → You can skip or enable - your choice
   → Click "Continue"

5. Select Account:
   → Use same Google account (warghatgrampanchayat@gmail.com)
   → Click "Create project"

6. Wait 30 seconds for project creation
   → Click "Continue" when ready

✅ PROJECT CREATED!


STEP 2: Enable Required Services
────────────────────────────────────────────────────────────────────────────────

A. Enable Firestore Database:
   
   1. In left menu → Click "Firestore Database"
   2. Click "Create database"
   3. Select Location: 
      → asia-south1 (Mumbai) - RECOMMENDED for India
      → Click "Next"
   4. Security Rules:
      → Select "Start in production mode" (we'll update rules later)
      → Click "Enable"
   
   ✅ Firestore enabled!

B. Enable Storage:
   
   1. In left menu → Click "Storage"
   2. Click "Get started"
   3. Security Rules:
      → Click "Next" (we'll update rules later)
   4. Location:
      → Use same as Firestore (asia-south1)
      → Click "Done"
   
   ✅ Storage enabled!

C. Enable Authentication:
   
   1. In left menu → Click "Authentication"
   2. Click "Get started"
   3. Sign-in method → Click "Email/Password"
   4. Enable "Email/Password"
   5. Click "Save"
   
   ✅ Authentication enabled!

D. Enable Hosting:
   
   1. In left menu → Click "Hosting"
   2. Click "Get started"
   3. We'll configure via CLI later, so just close this
   
   ✅ Hosting ready!



STEP 3: Get Your New Firebase Configuration
────────────────────────────────────────────────────────────────────────────────

1. Click gear icon ⚙️ (top-left) → "Project settings"

2. Scroll down to "Your apps" section

3. Click the Web icon </> (to add web app)

4. Register app:
   
   App nickname: Multi-Tenant Gram Panchayats
   
   Firebase Hosting: ✓ Check this box
   
   Click "Register app"

5. Copy the Firebase configuration:

   You'll see something like:

   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...xxxxx",
     authDomain: "grampanchayat-multitenant.firebaseapp.com",
     projectId: "grampanchayat-multitenant",
     storageBucket: "grampanchayat-multitenant.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:xxxxx"
   };
   ```

6. COPY THESE VALUES - You'll need them next!

7. Click "Continue to console"

✅ Configuration obtained!


STEP 4: Update .env File
────────────────────────────────────────────────────────────────────────────────

Open .env file and replace with YOUR values:

```properties
# Firebase Configuration - NEW MULTI-TENANT PROJECT
# IMPORTANT: Do not commit this file to Git!

VITE_FIREBASE_API_KEY=AIza...xxxxx
VITE_FIREBASE_AUTH_DOMAIN=grampanchayat-multitenant.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=grampanchayat-multitenant
VITE_FIREBASE_STORAGE_BUCKET=grampanchayat-multitenant.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxx
```

Save the file!

✅ .env configured!


STEP 5: Initialize Firebase CLI in Your Project
────────────────────────────────────────────────────────────────────────────────

Run these commands in terminal:

```bash
# Initialize Firebase in this project
firebase init

# You'll be asked several questions. Answer like this:

? Which Firebase features? 
  → Use arrow keys and SPACE to select:
  → [x] Firestore
  → [x] Storage
  → [x] Hosting
  Press ENTER

? Please select an option:
  → "Use an existing project"
  Press ENTER

? Select a default Firebase project:
  → Select "grampanchayat-multitenant" (or your project name)
  Press ENTER

? What file should be used for Firestore Rules?
  → Press ENTER (keep default: firestore.rules)

? What file should be used for Firestore indexes?
  → Press ENTER (keep default: firestore.indexes.json)

? What file should be used for Storage Rules?
  → Press ENTER (keep default: storage.rules)

? What do you want to use as your public directory?
  → Type: dist
  Press ENTER

? Configure as a single-page app?
  → y (YES)
  Press ENTER

? Set up automatic builds with GitHub?
  → n (NO for now)
  Press ENTER
```

✅ Firebase CLI initialized!


STEP 6: Deploy Multi-Tenant Security Rules
────────────────────────────────────────────────────────────────────────────────

```bash
# Copy new multi-tenant rules
cp firestore.rules.new firestore.rules
cp storage.rules.new storage.rules

# Deploy rules to your NEW Firebase project
firebase deploy --only firestore:rules,storage
```

✅ Security rules deployed!


STEP 7: Create Your First Admin User
────────────────────────────────────────────────────────────────────────────────

1. Go to Firebase Console → Authentication → Users

2. Click "Add user"

3. Create admin user:
   
   Email: your-admin@example.com
   Password: (choose a strong password)
   
   Click "Add user"

4. Copy the User UID (you'll need this)

✅ Admin user created!


STEP 8: Set Up Initial Firestore Data
────────────────────────────────────────────────────────────────────────────────

1. Go to Firebase Console → Firestore Database

2. Click "Start collection"

3. Create collection structure:

   Collection ID: gramPanchayats
   Click "Next"

   Document ID: pindkepar
   Click "Save"

4. Now add subcollections to pindkepar:

   A. Settings Collection:
   ─────────────────────
   
   Click on "pindkepar" document
   → Click "Start collection"
   
   Collection ID: settings
   Document ID: siteConfig
   
   Add fields:
   ```
   title (map):
     en (string): "Gram Panchayat Pindkepar Lodha"
     hi (string): "ग्राम पंचायत पिंडकेपार लोधा"
   
   contact (map):
     email (string): "admin@pindkepar.in"
     phone (string): "+91 1234567890"
   
   address (map):
     en (string): "Pindkepar, Lodha, Rajasthan"
     hi (string): "पिंडकेपार, लोधा, राजस्थान"
   ```
   
   Click "Save"

   B. Theme Collection:
   ────────────────────
   
   Click "Start collection"
   
   Collection ID: theme
   Document ID: config
   
   Add fields:
   ```
   primaryColor (string): #dc2626
   secondaryColor (string): #ea580c
   fontFamily (string): Inter, system-ui, sans-serif
   ```
   
   Click "Save"

   C. Features Collection:
   ───────────────────────
   
   Click "Start collection"
   
   Collection ID: features
   Document ID: config
   
   Add fields:
   ```
   showGallery (boolean): true
   showVillageStats (boolean): true
   showFinancials (boolean): true
   showGrievances (boolean): true
   ```
   
   Click "Save"

   D. Users Collection (Admin Access):
   ────────────────────────────────────
   
   Click "Start collection"
   
   Collection ID: users
   Document ID: YOUR_ADMIN_UID (paste the UID from Step 7)
   
   Add fields:
   ```
   email (string): your-admin@example.com
   role (string): superAdmin
   name (map):
     en (string): "Super Admin"
     hi (string): "सुपर व्यवस्थापक"
   createdAt (timestamp): (click "Use current timestamp")
   active (boolean): true
   ```
   
   Click "Save"

✅ Initial data structure created!


STEP 9: Test Your Setup
────────────────────────────────────────────────────────────────────────────────

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Open browser:
```
http://localhost:5173?tenant=pindkepar
```

You should see:
  ✓ Tenant indicator in bottom-right corner showing "pindkepar"
  ✓ Console log: "🏛️ Current Tenant: pindkepar"
  ✓ Theme colors applied (red/orange)
  ✓ Settings loaded from Firestore

✅ Multi-tenant setup working!


STEP 10: Add More Gram Panchayats (Optional)
────────────────────────────────────────────────────────────────────────────────

To add another GP (e.g., "demo"):

1. In Firestore, under "gramPanchayats" collection
   → Click "Add document"
   
   Document ID: demo
   
2. Repeat Step 8 to add settings, theme, features, users

3. Update src/utils/tenant.js:
   
   Add to ALL_TENANTS array:
   ```javascript
   { 
     id: 'demo',
     name: 'Demo Gram Panchayat',
     nameHi: 'डेमो ग्राम पंचायत',
     domain: 'grampanchayat-demo.in',
     active: true 
   }
   ```

4. Test:
   ```
   http://localhost:5173?tenant=demo
   ```

Repeat for all 20+ GPs!


═══════════════════════════════════════════════════════════════════════════════


📊 PROJECT STRUCTURE OVERVIEW
════════════════════════════════════════════════════════════════════════════════

Firebase Console Structure:

grampanchayat-multitenant (NEW PROJECT)
├── Firestore Database
│   └── gramPanchayats/
│       ├── pindkepar/
│       │   ├── settings/siteConfig
│       │   ├── theme/config
│       │   ├── features/config
│       │   ├── users/{uid}
│       │   ├── members/
│       │   ├── notices/
│       │   ├── services/
│       │   └── ... (all other collections)
│       │
│       ├── demo/
│       │   └── ... (same structure)
│       │
│       └── gp3/
│           └── ... (same structure)
│
├── Storage
│   ├── pindkepar/
│   │   ├── logos/
│   │   ├── gallery/
│   │   ├── notices/
│   │   └── forms/
│   │
│   ├── demo/
│   └── gp3/
│
├── Authentication
│   └── Users (shared across all GPs)
│
└── Hosting
    → Your multi-tenant website


═══════════════════════════════════════════════════════════════════════════════


🔒 SECURITY CONFIRMATION
════════════════════════════════════════════════════════════════════════════════

Two Separate Firebase Projects:

Project 1: grampanchayat-f0aa7
  → Warghat Production ONLY
  → https://www.grampanchayatwarghat.in/
  → UNTOUCHED - Still running perfectly
  → No changes made

Project 2: grampanchayat-multitenant (NEW)
  → 20+ Gram Panchayats
  → Multi-tenant architecture
  → Independent testing and deployment
  → No connection to Warghat


═══════════════════════════════════════════════════════════════════════════════


🎯 NEXT STEPS AFTER SETUP
════════════════════════════════════════════════════════════════════════════════

1. Test locally with ?tenant=pindkepar
2. Add more GPs to Firestore
3. Customize each GP's theme
4. Test tenant switching
5. Build and deploy when ready:
   ```bash
   npm run build
   firebase deploy
   ```


🆘 TROUBLESHOOTING
════════════════════════════════════════════════════════════════════════════════

Issue: "Firebase: Error (auth/configuration-not-found)"
Fix: Make sure .env is uncommented and has correct values

Issue: "Missing or insufficient permissions"
Fix: Deploy security rules: firebase deploy --only firestore:rules,storage

Issue: "No data loading"
Fix: Check Firestore structure - gramPanchayats/pindkepar/settings/siteConfig

Issue: "Wrong Firebase project"
Fix: Run: firebase use grampanchayat-multitenant


═══════════════════════════════════════════════════════════════════════════════

                    🎊 You're All Set! 🎊

         Warghat Production: Safe & Untouched ✅
         New Multi-Tenant Project: Ready to Scale! 🚀

═══════════════════════════════════════════════════════════════════════════════
