# 🚀 Multi-Tenant Implementation Guide

## Step-by-Step: Convert to Multi-Tenant Architecture

This guide shows you how to convert your current single-tenant app to support 20+ Gram Panchayats.

---

## 📋 Prerequisites

- ✅ One existing Firebase project (e.g., Warghat's project)
- ✅ Current codebase working
- ✅ Basic understanding of React and Firestore

---

## 🎯 Implementation Steps

### Step 1: Create Tenant Detection Utility

Create `src/utils/tenant.js`:

```javascript
/**
 * Multi-Tenant Utility
 * Detects which Gram Panchayat based on domain
 */

// Domain to tenant mapping
const DOMAIN_MAP = {
  // Production domains
  'grampanchayatwarghat.in': 'warghat',
  'www.grampanchayatwarghat.in': 'warghat',
  'grampanchayatpindkepaarlodha.in': 'pindkepar',
  'www.grampanchayatpindkepaarlodha.in': 'pindkepar',
  
  // Development - use query parameter
  // localhost:5173?tenant=warghat
  // localhost:5173?tenant=pindkepar
  'localhost': 'development',
};

// List of all tenants
export const ALL_TENANTS = [
  { id: 'warghat', name: 'Gram Panchayat Warghat' },
  { id: 'pindkepar', name: 'Gram Panchayat Pindkepar Lodha' },
  // Add more as you onboard them
];

/**
 * Detect tenant from domain or query parameter
 */
export const detectTenant = () => {
  const hostname = window.location.hostname;
  
  // Check domain mapping
  if (DOMAIN_MAP[hostname]) {
    const tenant = DOMAIN_MAP[hostname];
    
    // In development, check for query parameter override
    if (tenant === 'development') {
      const params = new URLSearchParams(window.location.search);
      return params.get('tenant') || 'warghat'; // Default to warghat for dev
    }
    
    return tenant;
  }
  
  // Subdomain detection (e.g., warghat.grampanchayats.in)
  if (hostname.includes('.grampanchayats.in')) {
    const subdomain = hostname.split('.')[0];
    return subdomain !== 'www' ? subdomain : 'default';
  }
  
  // Default tenant
  return 'warghat';
};

// Cache the tenant to avoid recalculation
let currentTenant = null;

/**
 * Get current tenant ID
 */
export const getTenant = () => {
  if (!currentTenant) {
    currentTenant = detectTenant();
    console.log('🏛️ Current Tenant:', currentTenant);
  }
  return currentTenant;
};

/**
 * Get tenant info
 */
export const getTenantInfo = () => {
  const tenantId = getTenant();
  return ALL_TENANTS.find(t => t.id === tenantId) || { id: tenantId, name: 'Unknown' };
};

/**
 * Check if user has access to current tenant
 */
export const checkTenantAccess = (userTenants) => {
  const currentTenant = getTenant();
  return userTenants.includes('*') || userTenants.includes(currentTenant);
};
```

---

### Step 2: Update Firestore Paths Helper

Create `src/utils/firestorePaths.js`:

```javascript
import { getTenant } from './tenant';

/**
 * Get Firestore paths for multi-tenant architecture
 */

export const getBasePath = () => {
  const tenant = getTenant();
  return `gramPanchayats/${tenant}`;
};

export const paths = {
  // Settings
  settings: () => `${getBasePath()}/settings`,
  siteSettings: () => `${getBasePath()}/settings/site`,
  
  // Members
  members: () => `${getBasePath()}/members`,
  member: (id) => `${getBasePath()}/members/${id}`,
  
  // Staff
  staff: () => `${getBasePath()}/staff`,
  staffMember: (id) => `${getBasePath()}/staff/${id}`,
  
  // Notices
  notices: () => `${getBasePath()}/notices`,
  notice: (id) => `${getBasePath()}/notices/${id}`,
  
  // Services
  services: () => `${getBasePath()}/services`,
  service: (id) => `${getBasePath()}/services/${id}`,
  
  // Schemes
  schemes: () => `${getBasePath()}/schemes`,
  scheme: (id) => `${getBasePath()}/schemes/${id}`,
  
  // Forms
  forms: () => `${getBasePath()}/forms`,
  form: (id) => `${getBasePath()}/forms/${id}`,
  
  // Programs
  programs: () => `${getBasePath()}/programs`,
  program: (id) => `${getBasePath()}/programs/${id}`,
  
  // Gallery
  gallery: () => `${getBasePath()}/gallery`,
  galleryItem: (id) => `${getBasePath()}/gallery/${id}`,
  
  // Villages
  villages: () => `${getBasePath()}/villages`,
  village: (id) => `${getBasePath()}/villages/${id}`,
  
  // Financials
  financials: () => `${getBasePath()}/financials`,
  financial: (id) => `${getBasePath()}/financials/${id}`,
  
  // Grievances
  grievances: () => `${getBasePath()}/grievances`,
  grievance: (id) => `${getBasePath()}/grievances/${id}`,
  
  // Metadata
  metadata: () => `${getBasePath()}/metadata/config`,
};

export default paths;
```

---

### Step 3: Update Storage Paths Helper

Create `src/utils/storagePaths.js`:

```javascript
import { getTenant } from './tenant';

/**
 * Get Storage paths for multi-tenant architecture
 */

export const getStorageBasePath = () => {
  const tenant = getTenant();
  return tenant;
};

export const storagePaths = {
  // Images
  memberPhoto: (filename) => `${getStorageBasePath()}/members/${filename}`,
  staffPhoto: (filename) => `${getStorageBasePath()}/staff/${filename}`,
  noticeFile: (filename) => `${getStorageBasePath()}/notices/${filename}`,
  formFile: (filename) => `${getStorageBasePath()}/forms/${filename}`,
  galleryImage: (filename) => `${getStorageBasePath()}/gallery/${filename}`,
  officePhoto: (filename) => `${getStorageBasePath()}/office/${filename}`,
  
  // Generic
  upload: (category, filename) => `${getStorageBasePath()}/${category}/${filename}`,
};

export default storagePaths;
```

---

### Step 4: Update Settings Service Example

Update `src/services/settingsService.js`:

```javascript
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { paths } from '../utils/firestorePaths';

export const settingsService = {
  async getSiteSettings() {
    try {
      const settingsRef = doc(db, paths.siteSettings());
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        return settingsDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting site settings:', error);
      throw error;
    }
  },

  async updateSiteSettings(settings) {
    try {
      const settingsRef = doc(db, paths.siteSettings());
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error updating site settings:', error);
      throw error;
    }
  }
};
```

---

### Step 5: Update Members Service Example

Update `src/services/membersService.js`:

```javascript
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { paths } from '../utils/firestorePaths';
import { storagePaths } from '../utils/storagePaths';

export const membersService = {
  async getMembers() {
    try {
      const membersRef = collection(db, paths.members());
      const q = query(membersRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting members:', error);
      throw error;
    }
  },

  async uploadMemberPhoto(file, memberId) {
    try {
      const filename = `${memberId}_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePaths.memberPhoto(filename));
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      return url;
    } catch (error) {
      console.error('Error uploading member photo:', error);
      throw error;
    }
  },

  // ... other methods
};
```

---

### Step 6: Add Tenant Display Component

Create `src/components/TenantIndicator.jsx`:

```javascript
import React from 'react';
import { getTenantInfo } from '../utils/tenant';

export default function TenantIndicator() {
  const tenantInfo = getTenantInfo();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      <div className="text-xs font-semibold">Current Tenant</div>
      <div className="text-sm">{tenantInfo.name}</div>
      <div className="text-xs opacity-75">{tenantInfo.id}</div>
    </div>
  );
}
```

Add to `App.jsx`:

```javascript
import TenantIndicator from './components/TenantIndicator';

function App() {
  return (
    <>
      {/* Your existing app */}
      <TenantIndicator />
    </>
  );
}
```

---

### Step 7: Update Firestore Security Rules

Update `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             request.auth.token.role == 'admin';
    }
    
    function isSuperAdmin() {
      return isAuthenticated() && 
             request.auth.token.role == 'superAdmin';
    }
    
    function hasTenantAccess(tenant) {
      return isAuthenticated() && (
        isSuperAdmin() ||
        (isAdmin() && request.auth.token.tenant == tenant)
      );
    }
    
    // Gram Panchayat data
    match /gramPanchayats/{tenant}/{document=**} {
      // Public read access
      allow read: if true;
      
      // Admin write access (must have access to specific tenant)
      allow write: if hasTenantAccess(tenant);
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isSuperAdmin() || 
                     (isAuthenticated() && request.auth.uid == userId);
    }
  }
}
```

---

### Step 8: Update Storage Security Rules

Update `storage.rules`:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             request.auth.token.role == 'admin';
    }
    
    function isSuperAdmin() {
      return isAuthenticated() && 
             request.auth.token.role == 'superAdmin';
    }
    
    function hasTenantAccess(tenant) {
      return isAuthenticated() && (
        isSuperAdmin() ||
        (isAdmin() && request.auth.token.tenant == tenant)
      );
    }
    
    // Tenant-specific storage
    match /{tenant}/{allPaths=**} {
      // Public read
      allow read: if true;
      
      // Admin write (must have access to tenant)
      allow write: if hasTenantAccess(tenant);
    }
  }
}
```

---

### Step 9: Add Tenant to User Authentication

Update admin creation to include tenant:

```javascript
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getTenant } from '../utils/tenant';

async function createAdminUser(email, password) {
  const auth = getAuth();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  const tenant = getTenant();
  
  // Store user data with tenant info
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email: email,
    role: 'admin',
    tenant: tenant, // Assign to current tenant
    tenants: [tenant], // Can have access to multiple tenants
    createdAt: new Date().toISOString()
  });
  
  // In Cloud Function, set custom claim:
  // admin.auth().setCustomUserClaims(uid, { role: 'admin', tenant: 'warghat' });
}
```

---

### Step 10: Testing Multi-Tenant Locally

#### Test Different Tenants:

```bash
# Test Warghat
http://localhost:5173?tenant=warghat

# Test Pindkepar
http://localhost:5173?tenant=pindkepar

# Test another GP
http://localhost:5173?tenant=lodha
```

#### Create Test Data:

In Firebase Console, create structure:

```
gramPanchayats/
  warghat/
    settings/
      site: {
        title: { en: "Gram Panchayat Warghat", hi: "..." }
      }
  pindkepar/
    settings/
      site: {
        title: { en: "Gram Panchayat Pindkepar Lodha", hi: "..." }
      }
```

---

## 🎯 Migration Checklist

- [ ] Create `tenant.js` utility
- [ ] Create `firestorePaths.js` helper
- [ ] Create `storagePaths.js` helper
- [ ] Update all service files to use path helpers
- [ ] Update Firestore rules
- [ ] Update Storage rules
- [ ] Add TenantIndicator component
- [ ] Test with query parameters
- [ ] Migrate existing data to new structure
- [ ] Deploy rules
- [ ] Test with real domains

---

## 📝 Adding a New Gram Panchayat (After Setup)

Once multi-tenant is implemented, adding a new GP is EASY:

### 1. Add Domain Mapping (1 minute)

In `src/utils/tenant.js`:
```javascript
const DOMAIN_MAP = {
  // ... existing
  'grampanchayatlodha.in': 'lodha', // NEW!
  'www.grampanchayatlodha.in': 'lodha',
};
```

### 2. Create Initial Data in Firestore (2 minutes)

Firebase Console → Firestore:
```
gramPanchayats/
  lodha/   ← Create this
    metadata/
      config: {
        name: "Gram Panchayat Lodha",
        active: true
      }
```

### 3. Configure in Admin Panel (5 minutes)

- Visit: `https://yoursite.com?tenant=lodha`
- Create admin account
- Configure settings
- Done!

**Total time: 8 minutes per new GP!**

---

## 🚀 Deployment

```bash
# Build once
npm run build

# Deploy once - serves ALL tenants!
firebase deploy

# All 20 GPs updated instantly! ✨
```

---

## Next Steps

1. **Decide**: Do you want to implement multi-tenant now?
2. **If yes**: I'll help you convert the code step-by-step
3. **If no**: You can always migrate later when adding more GPs

**Ready to implement? Let me know!** 🎉
