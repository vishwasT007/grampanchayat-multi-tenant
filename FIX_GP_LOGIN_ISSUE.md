# 🔧 Fix GP Admin Login Issue

## ❌ Problem
When trying to login at `https://pindkepar-lodha.web.app/admin/login`, you get:
```
Error: User data not found
```

## 🔍 Root Cause
The admin user exists in Firebase Authentication, but the user document doesn't exist in Firestore at the correct path.

**Required Firestore Path:**
```
gramPanchayats/pindkeparlodha/users/{uid}
```

## ✅ Solution Options

### Option 1: Manual Fix via Firebase Console (EASIEST)

1. **Go to Firebase Console:**
   https://console.firebase.google.com/project/grampanchayat-multi-tenant/firestore

2. **Navigate to the GP document:**
   - Click on `globalConfig` collection
   - Click on `metadata` document
   - Click on `gramPanchayats` collection
   - Click on `pindkeparlodha` document

3. **Copy the admin details:**
   - Note down: `adminEmail`, `adminPassword`, `adminName`

4. **Get the User UID from Firebase Auth:**
   - Go to: https://console.firebase.google.com/project/grampanchayat-multi-tenant/authentication/users
   - Find the user with the admin email
   - Copy the UID (e.g., `AbC123xYz...`)

5. **Create the user document in Firestore:**
   - Go back to Firestore
   - Navigate to/create: `gramPanchayats` → `pindkeparlodha` → `users` (collection)
   - Click "Add Document"
   - Document ID: Paste the UID from step 4
   - Add these fields:

   ```
   Field               Type        Value
   -------------------------------------------
   email              string      {adminEmail from step 3}
   name               string      {adminName from step 3}
   password           string      {adminPassword from step 3}
   role               string      admin
   tenantId           string      pindkeparlodha
   active             boolean     true
   createdBy          string      superadmin
   createdAt          timestamp   (auto)
   passwordLastChanged timestamp  (auto)
   ```

6. **Save and test!**
   - Go to: https://pindkepar-lodha.web.app/admin/login
   - Login with the admin email and password
   - Should work now! ✅

---

### Option 2: Delete and Recreate GP (NUCLEAR OPTION)

If Option 1 doesn't work:

1. **Delete the GP:**
   - Go to Super Admin: https://superadmin-grampanchayat.web.app
   - Go to "Manage Gram Panchayats"
   - Delete `pindkeparlodha`

2. **Recreate the GP:**
   - Click "Add New GP"
   - Fill in all the details
   - Use the SAME email if you want
   - Generate new password
   - Submit

3. **Deploy the GP:**
   - Go to GitHub Actions: https://github.com/vishwasT007/grampanchayat-multi-tenant/actions
   - Run "Auto Deploy GP to Firebase Hosting"
   - Enter subdomain: `pindkepar-lodha`
   - Wait 2-3 minutes

4. **Test login:**
   - Go to: https://pindkepar-lodha.web.app/admin/login
   - Use the new credentials
   - Should work! ✅

---

### Option 3: Run Firebase Functions (ADVANCED)

Create a Cloud Function to auto-sync users:

```javascript
exports.syncGPUser = functions.firestore
  .document('globalConfig/metadata/gramPanchayats/{gpId}')
  .onWrite(async (change, context) => {
    const gpData = change.after.data();
    const gpId = context.params.gpId;
    
    // Create/update user document
    const userRecord = await admin.auth().getUserByEmail(gpData.adminEmail);
    await admin.firestore()
      .doc(`gramPanchayats/${gpId}/users/${userRecord.uid}`)
      .set({
        email: gpData.adminEmail,
        name: gpData.adminName || 'Admin',
        password: gpData.adminPassword,
        role: 'admin',
        tenantId: gpId,
        active: true,
        createdBy: 'superadmin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        passwordLastChanged: admin.firestore.FieldValue.serverTimestamp()
      });
  });
```

---

## 📝 Quick Reference

**What you need:**
- Admin Email: Check in `globalConfig/metadata/gramPanchayats/pindkeparlodha`
- Admin Password: Check same location
- User UID: Check in Firebase Authentication

**Where to create user document:**
```
gramPanchayats
  └── pindkeparlodha
      └── users
          └── {UID}
              ├── email: "admin@pindkepar-lodha.gov.in"
              ├── name: "Admin"
              ├── password: "{plain text password}"
              ├── role: "admin"
              ├── tenantId: "pindkeparlodha"
              ├── active: true
              ├── createdBy: "superadmin"
              ├── createdAt: {timestamp}
              └── passwordLastChanged: {timestamp}
```

**Test URL:**
https://pindkepar-lodha.web.app/admin/login

---

## 🎯 Prevention for Future GPs

The code has been updated to automatically create user documents when creating new GPs. This issue won't happen for new GPs created after this fix!

**What was fixed:**
1. ✅ Plain text password storage (as you requested)
2. ✅ User document always created (even if user already exists)
3. ✅ Tenant detection for `.web.app` domains
4. ✅ Proper subdomain to tenant ID mapping

**For new GPs:**
Just create the GP in Super Admin → Deploy via GitHub Actions → Login works automatically!

---

## 🆘 Still Having Issues?

1. Check browser console for exact error message
2. Verify the user exists in Firebase Authentication
3. Verify the user document exists in Firestore at correct path
4. Check that `active: true` in both locations
5. Try clearing browser cache and cookies
6. Try in incognito/private mode

**Most common fix:** Just manually create the user document in Firestore (Option 1 above) ✅
