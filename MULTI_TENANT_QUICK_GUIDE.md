# 🏛️ MULTI-TENANT QUICK REFERENCE

## How to Support Multiple Gram Panchayats

---

## 🎯 THE CONCEPT

**One Portal → Many Gram Panchayats**

```
┌─────────────────────────────────────────────────────────┐
│          SINGLE CODEBASE (Your GitHub Repo)             │
│       ONE Firebase Project, ONE Deployment              │
└─────────────────┬───────────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │   Multi-Tenant  │
         │   Detection     │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌─────────┐  ┌─────────┐  ┌─────────┐
│ PINDKEPAR│  │  PAWNI  │  │ MOHADI  │
├─────────┤  ├─────────┤  ├─────────┤
│Own Domain│  │Own Domain│  │Own Domain│
│Own Data  │  │Own Data  │  │Own Data  │
│Own Admin │  │Own Admin │  │Own Admin │
└─────────┘  └─────────┘  └─────────┘

grampanchayat   grampanchayat   grampanchayat
pindkepaarlodha    pawni.in        mohadi.in
    .in
```

---

## 🚀 QUICK SETUP (5 Steps)

### For Each New Gram Panchayat:

#### **STEP 1: Buy Domain** (₹500-1000/year)
```
Purchase: grampanchayatpawni.in
```

#### **STEP 2: Edit Code** (2 minutes)
```javascript
// File: src/utils/tenant.js

// Add to DOMAIN_MAP:
'grampanchayatpawni.in': 'pawni',
'www.grampanchayatpawni.in': 'pawni',

// Add to ALL_TENANTS:
{
  id: 'pawni',
  name: 'Gram Panchayat Pawni',
  nameHi: 'ग्राम पंचायत पावनी',
  domain: 'grampanchayatpawni.in',
  active: true
},
```

#### **STEP 3: Create Admin** (2 minutes)
```
Firebase Console → Authentication → Add User
Email: admin@pawni.gov.in
Password: SecurePawni@2025!
```

#### **STEP 4: Set Role** (2 minutes)
```
Firestore → gramPanchayats/pawni/users/{userId}
Fields:
  email: "admin@pawni.gov.in"
  role: "admin"
  tenantId: "pawni"
  active: true
```

#### **STEP 5: Add Domain** (2 minutes + 24-48 hours wait)
```
Firebase Console → Hosting → Add Custom Domain
Enter: grampanchayatpawni.in
Update DNS records at registrar
```

#### **Deploy:**
```bash
git add .
git commit -m "feat: Add Pawni GP"
git push origin main
```

**Total Time:** 10 minutes + DNS wait

---

## 📊 DATA ISOLATION

Each GP's data is **completely separate**:

```
Firebase Firestore Structure:
════════════════════════════════════════════════════

gramPanchayats/
│
├── pindkepar/                    ← Pindkepar's Data
│   ├── users/
│   │   └── {userId}
│   │       ├── email: admin@pindkepar.gov.in
│   │       └── role: "admin"
│   ├── announcements/            ← Only Pindkepar's announcements
│   ├── gallery/                  ← Only Pindkepar's photos
│   ├── schemes/                  ← Only Pindkepar's schemes
│   └── ...
│
├── pawni/                        ← Pawni's Data (Separate!)
│   ├── users/
│   │   └── {userId}
│   │       ├── email: admin@pawni.gov.in
│   │       └── role: "admin"
│   ├── announcements/            ← Only Pawni's announcements
│   ├── gallery/                  ← Only Pawni's photos
│   ├── schemes/                  ← Only Pawni's schemes
│   └── ...
│
└── mohadi/                       ← Mohadi's Data (Separate!)
    ├── users/
    ├── announcements/
    ├── gallery/
    └── ...
```

**Security Rules Ensure:**
- Pindkepar admin can **ONLY** access `/pindkepar/*`
- Pawni admin can **ONLY** access `/pawni/*`
- No data leakage between GPs!

---

## 🔐 DIFFERENT ADMIN PASSWORDS

```
Domain                          Admin Email                  Password
────────────────────────────────────────────────────────────────────────────
grampanchayatpindkepaarlodha.in admin@pindkepar.gov.in      SecurePindkepar@2025!
grampanchayatpawni.in           admin@pawni.gov.in          SecurePawni@2025!
grampanchayatmohadi.in          admin@mohadi.gov.in         SecureMohadi@2025!
grampanchayat-gp4.in            admin@gp4.gov.in            SecureGP4@2025!
...                             ...                         ...
```

**Each GP has unique credentials!**

---

## 🌐 HOW IT WORKS

### Domain Detection:

```javascript
User visits → Domain detected → Tenant identified → Load GP data

Example 1:
grampanchayatpawni.in → Detects "pawni" → Loads Pawni data

Example 2:
grampanchayatmohadi.in → Detects "mohadi" → Loads Mohadi data
```

### URL Parameters (For Testing):

```
Before custom domain ready:
https://grampanchayat-multi-tenant.web.app?tenant=pawni

After custom domain:
https://grampanchayatpawni.in
```

---

## 💰 COST (For 20 GPs)

### Domain Costs:
```
20 domains × ₹800/year = ₹16,000/year (~₹1,333/month)
```

### Firebase Costs:
```
FREE for moderate traffic!

Firebase free tier covers:
- 50K reads/day (enough for all 20 GPs)
- 5GB storage
- 10GB bandwidth/month

Only pay if you exceed limits.
Estimated: ₹500-1000/month for 20 GPs with moderate traffic
```

### Total:
```
~₹2,000-2,500/month for 20 Gram Panchayats
= ₹100-125 per GP per month

Very affordable! 🎉
```

---

## ✅ SETUP CHECKLIST (Per GP)

```
For: Gram Panchayat Pawni
Domain: grampanchayatpawni.in

□ Purchase domain
□ Edit src/utils/tenant.js
   □ Add to DOMAIN_MAP
   □ Add to ALL_TENANTS
□ Create admin user in Firebase Auth
   □ Email: admin@pawni.gov.in
   □ Password: [Secure unique password]
□ Set user role in Firestore
   □ Path: gramPanchayats/pawni/users/{userId}
   □ Role: "admin"
□ Add custom domain in Firebase Hosting
□ Update DNS records
□ Deploy code
   □ git push origin main
□ Test with ?tenant=pawni
□ Wait for DNS (24-48 hours)
□ Test custom domain
□ Share credentials with GP admin
```

---

## 🛠️ AUTOMATED SETUP SCRIPT

Run this for quick setup:

```bash
./scripts/add-new-gp.sh
```

**It will:**
1. Ask for GP details (name, domain, etc.)
2. Generate secure admin password
3. Save credentials securely
4. Show exact code changes needed
5. Provide Firebase setup steps
6. Give testing instructions

**Makes adding new GPs super easy!**

---

## 🧪 TESTING GUIDE

### Local Testing:

```bash
# Start dev server
npm run dev

# Test different GPs
http://localhost:5173?tenant=pindkepar
http://localhost:5173?tenant=pawni
http://localhost:5173?tenant=mohadi

# Login with respective admin credentials
```

### Production Testing (Before Custom Domain):

```
https://grampanchayat-multi-tenant.web.app?tenant=pawni
```

### Production Testing (After Custom Domain):

```
https://grampanchayatpawni.in
```

---

## 📱 USER EXPERIENCE

### For Pindkepar residents:
```
1. Visit: grampanchayatpindkepaarlodha.in
2. See: Pindkepar's homepage, data, announcements
3. Admin login: admin@pindkepar.gov.in
```

### For Pawni residents:
```
1. Visit: grampanchayatpawni.in
2. See: Pawni's homepage, data, announcements
3. Admin login: admin@pawni.gov.in
```

**Each GP feels like their own independent website!**

---

## 🔄 UPDATES & MAINTENANCE

### Best Part:
```
Update code once → All GPs get the update!

Example:
- Add new feature (e.g., online payment)
- Push to GitHub
- ALL 20 GPs get the feature automatically!
```

### No Need To:
- Update 20 separate websites
- Maintain 20 separate codebases
- Deploy 20 times

**One update, all benefit!** 🎉

---

## 📈 SCALING

### Can Support:
```
✅ 20 Gram Panchayats  ← Your goal
✅ 50 Gram Panchayats
✅ 100 Gram Panchayats
✅ 500+ Gram Panchayats (if needed!)

Same codebase, same setup process.
```

---

## 🎯 NEXT STEPS

### For Your Specific Domains:

**Domain 1: grampanchyatpindkepaarlodha.in (Pindkepar)**
```bash
# Already configured!
# Just need to add custom domain in Firebase
```

**Domain 2: grampanchyatpawni.in (Pawni)**
```bash
# Run setup script:
./scripts/add-new-gp.sh

# Or manually:
1. Edit src/utils/tenant.js
2. Add domain mapping
3. Add tenant info
4. Create admin user
5. Deploy
```

**Domains 3-20:**
```bash
Repeat same process for each GP.
Takes ~10 minutes per GP.
```

---

## 📞 QUICK HELP

### Add New GP:
```bash
./scripts/add-new-gp.sh
```

### Full Documentation:
```
MULTI_TENANT_SETUP_GUIDE.md
```

### Test Locally:
```
http://localhost:5173?tenant={gpid}
```

### Firebase Console:
```
Authentication: https://console.firebase.google.com/project/grampanchayat-multi-tenant/authentication
Firestore: https://console.firebase.google.com/project/grampanchayat-multi-tenant/firestore
Hosting: https://console.firebase.google.com/project/grampanchayat-multi-tenant/hosting
```

---

## 🎉 SUMMARY

**You CAN support all your Gram Panchayats with:**

✅ **One codebase** (saves development time)  
✅ **One deployment** (easy maintenance)  
✅ **Separate domains** (professional look)  
✅ **Separate data** (complete isolation)  
✅ **Separate admins** (different passwords)  
✅ **Low cost** (~₹100-125 per GP/month)  
✅ **Easy scaling** (add 20+ GPs easily)  

**Your portal is already built for this!** 🚀

---

**Ready to add Pawni GP? Run:**
```bash
./scripts/add-new-gp.sh
```
