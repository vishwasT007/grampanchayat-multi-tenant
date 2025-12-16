# 🏛️ MULTI-TENANT SETUP GUIDE
## Supporting Multiple Gram Panchayats with Custom Domains

---

## 📋 Overview

Your portal is **already configured** for multi-tenancy! Here's how to add multiple Gram Panchayats, each with:
- ✅ Their own custom domain
- ✅ Their own data (completely isolated)
- ✅ Their own admin credentials
- ✅ Their own branding

**Example Setup:**
```
Domain                                  → Gram Panchayat → Admin Email
────────────────────────────────────────────────────────────────────────
grampanchayatpindkepaarlodha.in        → Pindkepar      → admin@pindkepar.gov.in
grampanchayatpawni.in                  → Pawni          → admin@pawni.gov.in
grampanchayatmohadi.in                 → Mohadi         → admin@mohadi.gov.in
...20 more GPs
```

---

## 🎯 STEP-BY-STEP SETUP

### **STEP 1: Add New Gram Panchayat to Code**

Edit the file: `src/utils/tenant.js`

#### A. Add Domain Mapping (Lines 8-20):

```javascript
const DOMAIN_MAP = {
  // Pindkepar Lodha (Already configured)
  'grampanchayatpindkepaarlodha.in': 'pindkepar',
  'www.grampanchayatpindkepaarlodha.in': 'pindkepar',
  
  // ADD NEW GP: Pawni
  'grampanchayatpawni.in': 'pawni',
  'www.grampanchayatpawni.in': 'pawni',
  
  // ADD NEW GP: Mohadi
  'grampanchayatmohadi.in': 'mohadi',
  'www.grampanchayatmohadi.in': 'mohadi',
  
  // Add more as needed...
  
  // Development/Testing
  'localhost': 'development',
  '127.0.0.1': 'development',
};
```

#### B. Add Tenant Information (Lines 25-50):

```javascript
export const ALL_TENANTS = [
  { 
    id: 'pindkepar', 
    name: 'Gram Panchayat Pindkepar Lodha',
    nameHi: 'ग्राम पंचायत पिंडकेपार लोधा',
    domain: 'grampanchayatpindkepaarlodha.in',
    active: true
  },
  
  // ADD NEW GP: Pawni
  { 
    id: 'pawni', 
    name: 'Gram Panchayat Pawni',
    nameHi: 'ग्राम पंचायत पावनी',
    domain: 'grampanchayatpawni.in',
    active: true
  },
  
  // ADD NEW GP: Mohadi
  { 
    id: 'mohadi', 
    name: 'Gram Panchayat Mohadi',
    nameHi: 'ग्राम पंचायत मोहाडी',
    domain: 'grampanchayatmohadi.in',
    active: true
  },
  
  // Add more GPs here (up to 100+)...
];
```

---

### **STEP 2: Create Admin User for Each GP**

Each Gram Panchayat needs its **own admin account** with **different password**.

#### Firebase Console Method:

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/project/grampanchayat-multi-tenant/authentication/users

2. **Click "Add user"**

3. **For Pindkepar Lodha:**
   - Email: `admin@pindkepar.gov.in`
   - Password: `SecurePindkepar@2025!`
   - Click "Add user"

4. **For Pawni:**
   - Email: `admin@pawni.gov.in`
   - Password: `SecurePawni@2025!`
   - Click "Add user"

5. **For Mohadi:**
   - Email: `admin@mohadi.gov.in`
   - Password: `SecureMohadi@2025!`
   - Click "Add user"

6. **Repeat for all 20+ GPs**

#### Script Method (Automated):

Create a file: `scripts/create-admin-users.js`

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Your Firebase config here
const firebaseConfig = { /* ... */ };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const gramPanchayats = [
  { id: 'pindkepar', email: 'admin@pindkepar.gov.in', password: 'SecurePindkepar@2025!' },
  { id: 'pawni', email: 'admin@pawni.gov.in', password: 'SecurePawni@2025!' },
  { id: 'mohadi', email: 'admin@mohadi.gov.in', password: 'SecureMohadi@2025!' },
  // Add all 20 GPs here...
];

async function createAdmins() {
  for (const gp of gramPanchayats) {
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        gp.email, 
        gp.password
      );
      
      const user = userCredential.user;
      
      // Add user role in Firestore
      await setDoc(doc(db, `gramPanchayats/${gp.id}/users/${user.uid}`), {
        email: gp.email,
        role: 'admin',
        tenantId: gp.id,
        createdAt: new Date(),
        active: true
      });
      
      console.log(`✅ Created admin for ${gp.id}: ${gp.email}`);
      
    } catch (error) {
      console.error(`❌ Error creating admin for ${gp.id}:`, error.message);
    }
  }
}

createAdmins();
```

---

### **STEP 3: Set User Roles in Firestore**

For each admin user, set their role in Firestore:

**Firestore Structure:**
```
gramPanchayats/
├── pindkepar/
│   ├── users/
│   │   └── {userId}/
│   │       ├── email: "admin@pindkepar.gov.in"
│   │       ├── role: "admin"
│   │       ├── tenantId: "pindkepar"
│   │       └── active: true
│   ├── announcements/
│   ├── gallery/
│   ├── schemes/
│   └── ... (all other collections)
│
├── pawni/
│   ├── users/
│   │   └── {userId}/
│   │       ├── email: "admin@pawni.gov.in"
│   │       ├── role: "admin"
│   │       ├── tenantId: "pawni"
│   │       └── active: true
│   ├── announcements/
│   ├── gallery/
│   └── ... (separate data for Pawni)
│
└── mohadi/
    ├── users/
    └── ... (separate data for Mohadi)
```

**Manual Setup:**

1. Go to Firestore: https://console.firebase.google.com/project/grampanchayat-multi-tenant/firestore
2. Navigate to: `gramPanchayats/{gpId}/users/{userId}`
3. Add document with fields:
   - `email`: admin email
   - `role`: "admin"
   - `tenantId`: GP id
   - `active`: true
   - `createdAt`: timestamp

---

### **STEP 4: Configure Custom Domains in Firebase**

For each Gram Panchayat domain:

1. **Firebase Console:**
   - Go to: https://console.firebase.google.com/project/grampanchayat-multi-tenant/hosting

2. **Add Custom Domain:**
   - Click **"Add custom domain"**
   - Enter: `grampanchayatpindkepaarlodha.in`
   - Click "Continue"
   - Firebase provides DNS records

3. **Update DNS Records** (at your domain registrar):

   **For Pindkepar:**
   ```
   Type: A
   Name: @
   Value: [IP from Firebase]
   TTL: 3600
   
   Type: A
   Name: www
   Value: [IP from Firebase]
   TTL: 3600
   ```

4. **Repeat for Pawni domain:**
   - Add `grampanchayatpawni.in` in Firebase
   - Add DNS records for Pawni

5. **Repeat for Mohadi and all other GPs**

6. **Wait 24-48 hours** for DNS propagation and SSL certificate

---

### **STEP 5: Test Each Gram Panchayat**

#### Test Locally (Before Custom Domains):

```bash
# Test Pindkepar
http://localhost:5173?tenant=pindkepar

# Test Pawni
http://localhost:5173?tenant=pawni

# Test Mohadi
http://localhost:5173?tenant=mohadi
```

Login with respective admin credentials.

#### Test on Live Site (Before Custom Domains):

```bash
# Test Pindkepar
https://grampanchayat-multi-tenant.web.app?tenant=pindkepar

# Test Pawni
https://grampanchayat-multi-tenant.web.app?tenant=pawni

# Test Mohadi
https://grampanchayat-multi-tenant.web.app?tenant=mohadi
```

#### Test with Custom Domains (After Setup):

```bash
# Pindkepar
https://grampanchayatpindkepaarlodha.in

# Pawni
https://grampanchayatpawni.in

# Mohadi
https://grampanchayatmohadi.in
```

---

## 🔐 DATA ISOLATION

Each Gram Panchayat has **completely separate data**:

### Firestore Paths:

**Pindkepar's data:**
```
gramPanchayats/pindkepar/announcements/{id}
gramPanchayats/pindkepar/gallery/{id}
gramPanchayats/pindkepar/schemes/{id}
gramPanchayats/pindkepar/downloads/{id}
...
```

**Pawni's data:**
```
gramPanchayats/pawni/announcements/{id}
gramPanchayats/pawni/gallery/{id}
gramPanchayats/pawni/schemes/{id}
gramPanchayats/pawni/downloads/{id}
...
```

**Security Rules enforce this:**
- Pindkepar admin can **ONLY** access Pindkepar data
- Pawni admin can **ONLY** access Pawni data
- No cross-contamination possible!

---

## 👥 ADMIN CREDENTIALS MANAGEMENT

### Best Practices:

1. **Different Passwords for Each GP:**
   ```
   Pindkepar: admin@pindkepar.gov.in / SecurePindkepar@2025!
   Pawni:     admin@pawni.gov.in     / SecurePawni@2025!
   Mohadi:    admin@mohadi.gov.in    / SecureMohadi@2025!
   ```

2. **Password Requirements:**
   - Minimum 12 characters
   - Mix of uppercase and lowercase
   - Numbers and special characters
   - Unique for each GP

3. **Share Credentials Securely:**
   - Send passwords via encrypted email
   - Use password managers
   - Don't write in plain text

---

## 📊 SCALING TO 20+ GRAM PANCHAYATS

### Easy Template for Adding New GPs:

#### 1. Edit `src/utils/tenant.js`:

```javascript
// Add to DOMAIN_MAP
'grampanchayat-{gpname}.in': '{gpid}',
'www.grampanchayat-{gpname}.in': '{gpid}',

// Add to ALL_TENANTS
{ 
  id: '{gpid}', 
  name: 'Gram Panchayat {Name}',
  nameHi: 'ग्राम पंचायत {नाम}',
  domain: 'grampanchayat-{gpname}.in',
  active: true
},
```

#### 2. Create Admin User:
- Email: `admin@{gpname}.gov.in`
- Password: `Secure{GPName}@2025!`

#### 3. Set Firestore Role:
- Path: `gramPanchayats/{gpid}/users/{userId}`
- Fields: role="admin", tenantId="{gpid}"

#### 4. Add Custom Domain in Firebase

#### 5. Deploy Code:
```bash
git add .
git commit -m "feat: Add {GP Name} support"
git push origin main
```

**That's it!** New GP is live in 5 minutes!

---

## 🎨 SEPARATE BRANDING (Optional)

You can customize each GP's appearance:

### Add Theme Colors in `tenant.js`:

```javascript
export const ALL_TENANTS = [
  { 
    id: 'pindkepar', 
    name: 'Gram Panchayat Pindkepar Lodha',
    nameHi: 'ग्राम पंचायत पिंडकेपार लोधा',
    domain: 'grampanchayatpindkepaarlodha.in',
    active: true,
    theme: {
      primary: '#4F46E5',      // Blue
      secondary: '#10B981',    // Green
      logo: '/logos/pindkepar.png'
    }
  },
  { 
    id: 'pawni', 
    name: 'Gram Panchayat Pawni',
    nameHi: 'ग्राम पंचायत पावनी',
    domain: 'grampanchayatpawni.in',
    active: true,
    theme: {
      primary: '#059669',      // Different green
      secondary: '#3B82F6',    // Different blue
      logo: '/logos/pawni.png'
    }
  },
];
```

Then use theme in components based on current tenant.

---

## 💰 COST ESTIMATION

### Firebase Free Tier:

**For 20 Gram Panchayats:**
- Firestore: 50K reads/day (FREE)
- Storage: 5GB (FREE)
- Hosting: 10GB/month (FREE)
- Authentication: Unlimited users (FREE)

**This should handle:**
- ~500 visitors per day across all GPs
- ~10,000 page views per month
- Small to medium sized GPs

### If You Exceed Free Tier:

**Pay-as-you-go pricing:**
- Firestore: $0.06 per 100K reads
- Storage: $0.026 per GB
- Hosting: $0.15 per GB bandwidth

**Example:** 20 GPs with moderate traffic = ~$5-10/month

---

## ✅ QUICK SETUP CHECKLIST

For each new Gram Panchayat:

- [ ] **Purchase domain** (e.g., grampanchayat-{name}.in)
- [ ] **Edit `src/utils/tenant.js`:**
  - [ ] Add domain to `DOMAIN_MAP`
  - [ ] Add tenant to `ALL_TENANTS`
- [ ] **Create admin user:**
  - [ ] Email: `admin@{gpname}.gov.in`
  - [ ] Strong unique password
- [ ] **Set user role in Firestore:**
  - [ ] Path: `gramPanchayats/{gpid}/users/{userId}`
  - [ ] Role: "admin", tenantId: "{gpid}"
- [ ] **Add custom domain in Firebase:**
  - [ ] Firebase Console → Hosting → Add custom domain
  - [ ] Update DNS records at registrar
- [ ] **Deploy code:**
  - [ ] `git push origin main`
- [ ] **Test:**
  - [ ] Visit custom domain
  - [ ] Login as admin
  - [ ] Add test data
  - [ ] Verify data isolation
- [ ] **Share credentials with GP admin:**
  - [ ] Send login details securely
  - [ ] Provide training/documentation

---

## 🚀 BULK SETUP SCRIPT

For adding multiple GPs quickly, I can create a script:

`scripts/setup-new-gp.sh`:

```bash
#!/bin/bash

# Usage: ./scripts/setup-new-gp.sh pawni "Gram Panchayat Pawni" "grampanchayatpawni.in"

GP_ID=$1
GP_NAME=$2
GP_DOMAIN=$3

echo "🏛️ Setting up new Gram Panchayat: $GP_NAME"
echo "ID: $GP_ID"
echo "Domain: $GP_DOMAIN"
echo ""

# Instructions to add to tenant.js
echo "📝 Add these to src/utils/tenant.js:"
echo ""
echo "DOMAIN_MAP:"
echo "  '$GP_DOMAIN': '$GP_ID',"
echo "  'www.$GP_DOMAIN': '$GP_ID',"
echo ""
echo "ALL_TENANTS:"
echo "  { "
echo "    id: '$GP_ID', "
echo "    name: '$GP_NAME',"
echo "    nameHi: 'ग्राम पंचायत XXX',"  # You'll need to add Hindi name
echo "    domain: '$GP_DOMAIN',"
echo "    active: true"
echo "  },"
echo ""

# Generate admin credentials
ADMIN_EMAIL="admin@${GP_ID}.gov.in"
ADMIN_PASSWORD=$(openssl rand -base64 16)

echo "🔐 Admin Credentials:"
echo "  Email: $ADMIN_EMAIL"
echo "  Password: $ADMIN_PASSWORD"
echo ""
echo "⚠️ Save these credentials securely!"
echo ""

echo "📋 Next Steps:"
echo "  1. Edit src/utils/tenant.js (add domain and tenant info)"
echo "  2. Create admin user in Firebase Console"
echo "  3. Set user role in Firestore"
echo "  4. Add custom domain in Firebase Hosting"
echo "  5. Update DNS records at domain registrar"
echo "  6. Deploy: git push origin main"
echo ""
```

---

## 📞 SUPPORT

### Testing Multi-Tenant Setup:

**Local Testing:**
```bash
# Start dev server
npm run dev

# Test different GPs
http://localhost:5173?tenant=pindkepar
http://localhost:5173?tenant=pawni
http://localhost:5173?tenant=mohadi
```

**Production Testing:**
```bash
# Before custom domains
https://grampanchayat-multi-tenant.web.app?tenant=pawni

# After custom domains
https://grampanchayatpawni.in
```

---

## 🎉 SUMMARY

Your portal is **already multi-tenant ready**! Here's what you need to do:

1. **For each new GP:**
   - Buy domain
   - Edit `tenant.js` (2 places)
   - Create admin user
   - Add custom domain
   - Deploy

2. **Each GP gets:**
   - Own custom domain
   - Own admin login
   - Own separate data
   - Own branding (optional)

3. **All on same codebase:**
   - One GitHub repo
   - One Firebase project
   - One deployment
   - Saves money & time!

4. **Scales easily:**
   - Support 20, 50, 100+ GPs
   - No code duplication
   - Easy maintenance
   - Centralized updates

---

**Ready to add your first custom domain?** Let me know and I'll help you configure it!
