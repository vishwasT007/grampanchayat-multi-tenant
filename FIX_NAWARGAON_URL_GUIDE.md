# 🔧 Quick Fix Script - Update Nawargaon URL in Super Admin

This script updates the Nawargaon GP entry in Super Admin to show the correct URL.

## What it does:
- Changes `gp-nawargaon-o7uzj6.web.app` → `gp-nawargaon.web.app`
- Keeps custom domain info
- Updates the Super Admin GP list

## To run:
```bash
node fix-nawargaon-url.cjs
```

---

**File: fix-nawargaon-url.cjs**
```javascript
const admin = require('firebase-admin');

// Initialize with default credentials from Google Cloud
admin.initializeApp();

const db = admin.firestore();

async function fixNawargaonURL() {
  console.log('\n🔧 Fixing Nawargaon URL in Super Admin...\n');
  
  try {
    // Get the GP list document
    const listRef = db.collection('gramPanchayats').doc('list');
    const listDoc = await listRef.get();
    
    if (!listDoc.exists) {
      console.log('❌ GP list document not found!');
      return;
    }
    
    const data = listDoc.data();
    const gpList = data.gramPanchayats || [];
    
    // Find Nawargaon entry
    const nawargaonIndex = gpList.findIndex(gp => 
      gp.id === 'nawargaon' || gp.id.includes('nawargaon')
    );
    
    if (nawargaonIndex === -1) {
      console.log('❌ Nawargaon entry not found in GP list!');
      return;
    }
    
    const nawargaonGP = gpList[nawargaonIndex];
    console.log('📋 Current Nawargaon entry:');
    console.log(JSON.stringify(nawargaonGP, null, 2));
    
    // Update the URL
    nawargaonGP.url = 'https://gp-nawargaon.web.app';
    nawargaonGP.id = 'nawargaon'; // Normalize ID
    nawargaonGP.customDomain = 'www.grampanchayatnawargaon.in';
    
    // Update the array
    gpList[nawargaonIndex] = nawargaonGP;
    
    // Save back to Firestore
    await listRef.update({
      gramPanchayats: gpList,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('\n✅ Updated Nawargaon entry:');
    console.log(JSON.stringify(nawargaonGP, null, 2));
    console.log('\n✅ Super Admin will now show: gp-nawargaon.web.app');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

fixNawargaonURL().catch(console.error);
```

## Alternative: Manual Fix in Firebase Console

1. Go to: https://console.firebase.google.com/project/grampanchayat-multi-tenant/firestore
2. Navigate to: `gramPanchayats` → `list` document
3. Find the `gramPanchayats` array field
4. Find Nawargaon entry
5. Change `url` to: `https://gp-nawargaon.web.app`
6. Save

## Which Hosting Site Should You Use?

**ALWAYS use `gp-nawargaon` (NOT `gp-nawargaon-o7uzj6`):**

| URL | Use For | Status |
|-----|---------|--------|
| `www.grampanchayatnawargaon.in` | Public Access | ✅ PRIMARY |
| `gp-nawargaon.web.app` | Firebase Subdomain | ✅ KEEP |
| `gp-nawargaon-o7uzj6.web.app` | Duplicate | ⚠️ DELETE LATER |

## Deploy Command

**Correct:**
```bash
firebase deploy --only hosting:gp-nawargaon
```

**Wrong:**
```bash
firebase deploy --only hosting:gp-nawargaon-o7uzj6  # ❌ Don't use
```
