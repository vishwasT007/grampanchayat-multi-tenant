# 🔧 Nawargaon Hosting Site Issue - SOLUTION

## 📋 Problem Summary

You have **2 Firebase Hosting sites** for Nawargaon:

1. **`gp-nawargaon.web.app`**
   - Custom domain: `www.grampanchayatnawargaon.in` ✅
   - We deploy HERE
   - Maps to tenant ID: `nawargaon`

2. **`gp-nawargaon-o7uzj6.web.app`**
   - No custom domain
   - Super Admin shows THIS URL
   - Maps to tenant ID: `nawargaon` (after removing `-o7uzj6` suffix)

## 🔍 Root Cause

Both hosting sites map to the **SAME tenant ID** (`nawargaon`) in Firestore because our tenant detection logic removes the `-o7uzj6` suffix:

```javascript
// From tenant.js:
if (s.startsWith('gp-')) {
  const suffixMatch = s.match(/^(.+)-([a-z0-9]{6})$/);
  if (suffixMatch) {
    s = suffixMatch[1]; // Both become 'nawargaon'
  }
}
```

**The Issue:**
- Logo uploaded at `gp-nawargaon-o7uzj6.web.app/admin` 
- But `www.grampanchayatnawargaon.in` loads from `gp-nawargaon.web.app`
- **BOTH look for data at `gramPanchayats/nawargaon/settings/siteConfig`**
- Data should be there... unless there's a deployment or caching issue

## ✅ Solution Steps

### Option 1: DELETE Duplicate Hosting Site (RECOMMENDED)

Since both sites point to same data, we only need ONE:

1. **Keep:** `gp-nawargaon` (has custom domain)
2. **Delete:** `gp-nawargaon-o7uzj6` (duplicate, causing confusion)

**Steps:**
```bash
# 1. Remove from Firebase Console
# Go to: Firebase Console → Hosting → gp-nawargaon-o7uzj6
# Click "..." → Delete Site

# 2. Remove from .firebaserc
# Edit .firebaserc and remove:
"gp-nawargaon-o7uzj6": [
  "gp-nawargaon-o7uzj6"
]

# 3. Remove from firebase.json
# Delete the gp-nawargaon-o7uzj6 hosting configuration block

# 4. Update Super Admin GP List
# The Super Admin should show: gp-nawargaon.web.app
# NOT: gp-nawargaon-o7uzj6.web.app
```

### Option 2: Use Correct Hosting Site for Super Admin

Keep both sites but fix Super Admin to show correct URL:

**Update Firestore:**
```javascript
// In gramPanchayats/list document:
{
  gramPanchayats: [
    {
      id: "nawargaon",
      name: { en: "...", hi: "..." },
      url: "https://gp-nawargaon.web.app",  // ← Fix this
      customDomain: "www.grampanchayatnawargaon.in",
      active: true
    }
  ]
}
```

## 🔄 Quick Fix for Logo Issue

The logo might already be uploaded but not showing due to:

### 1. **Hard Refresh Required**
```
Press: Ctrl + Shift + R (Windows/Linux)
       Cmd + Shift + R (Mac)
```

### 2. **Check Console for Tenant ID**
```javascript
// Open: www.grampanchayatnawargaon.in
// Console should show: "Current Tenant: nawargaon"
```

### 3. **Verify Logo URL in Firestore**
```
Collection: gramPanchayats/nawargaon/settings
Document: siteConfig
Field: logo
Should be: https://firebasestorage.googleapis.com/...
```

### 4. **Redeploy if Needed**
```bash
# Build and deploy ONLY to gp-nawargaon (not o7uzj6)
GP_ID=nawargaon VITE_GP_MODE=true VITE_GP_ID=nawargaon npm run build:gp
firebase deploy --only hosting:gp-nawargaon
```

## 🎯 Recommended Action Plan

**NOW:**
1. ✅ Hard refresh `www.grampanchayatnawargaon.in`
2. ✅ Check console for correct tenant ID
3. ✅ Test if logo appears

**THEN (if still not working):**
1. Go to Firebase Console → Firestore
2. Navigate to: `gramPanchayats/nawargaon/settings/siteConfig`
3. Check if `logo` field exists and has valid URL
4. If NO logo field → Upload logo from admin panel
5. If HAS logo → Redeploy to force refresh

**CLEANUP (to avoid confusion):**
1. Delete `gp-nawargaon-o7uzj6` hosting site from Firebase Console
2. Remove from `.firebaserc` and `firebase.json`
3. Update Super Admin GP list to show `gp-nawargaon.web.app`

## 📝 Which Hosting Site to Deploy To?

**ALWAYS use:**
```bash
firebase deploy --only hosting:gp-nawargaon
```

**NEVER use:**
```bash
firebase deploy --only hosting:gp-nawargaon-o7uzj6  # ❌ Don't use
```

## 🔗 URL Summary

| URL | Purpose | Status |
|-----|---------|--------|
| `www.grampanchayatnawargaon.in` | Custom Domain (PRIMARY) | ✅ Use This |
| `gp-nawargaon.web.app` | Firebase Subdomain | ✅ Keep |
| `gp-nawargaon-o7uzj6.web.app` | Duplicate Site | ⚠️ Delete |

---

**Status:** Ready to test - Hard refresh and check console
**Next:** If logo still missing, upload from admin panel at correct domain
