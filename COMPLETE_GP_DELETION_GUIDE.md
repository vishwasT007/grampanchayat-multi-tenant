# 🗑️ Complete GP Deletion Guide

## ✅ What's Been Updated

The `deleteGramPanchayat` function now performs a **COMPLETE** deletion of:

1. ✅ All GP users (Firestore documents)
2. ✅ All GP data (notices, announcements, members, services, etc.)
3. ✅ All subcollections
4. ✅ GP metadata from globalConfig
5. ✅ Activity logs the deletion

## ⚠️ What Still Requires Manual Cleanup

### 1. Firebase Hosting Site
**Why?** Firebase Hosting sites can only be deleted via Firebase CLI or Console (not from client-side code)

**How to Delete:**

#### Option A: Using the Script (EASIEST)
```bash
./delete-hosting-site.sh pindkepar-lodha
```

#### Option B: Using Firebase CLI Directly
```bash
firebase hosting:sites:delete pindkepar-lodha
```

#### Option C: Firebase Console (Manual)
1. Go to: https://console.firebase.google.com/project/grampanchayat-multi-tenant/hosting/sites
2. Find the site (e.g., `pindkepar-lodha`)
3. Click the 3-dot menu → Delete
4. Confirm deletion

---

### 2. Firebase Authentication Users
**Why?** User deletion from Firebase Auth requires Firebase Admin SDK (server-side), can't be done from client

**How to Delete:**

#### Option A: Firebase Console (Manual)
1. Go to: https://console.firebase.google.com/project/grampanchayat-multi-tenant/authentication/users
2. Find users by email (shown in deletion alert)
3. Click each user → Delete user
4. Confirm deletion

#### Option B: Firebase CLI
```bash
# Not available - must use Console or Cloud Function
```

---

## 📋 Complete Deletion Workflow

### Step 1: Delete from Super Admin Panel
1. Go to: https://superadmin-grampanchayat.web.app
2. Navigate to "Gram Panchayats"
3. Click on the GP you want to delete
4. Click "Delete" button
5. Type "DELETE" to confirm
6. **IMPORTANT:** Copy the manual cleanup instructions from the alert!

### Step 2: Delete Firebase Hosting Site
After deleting from Super Admin, run:

```bash
./delete-hosting-site.sh <subdomain>
```

Example:
```bash
./delete-hosting-site.sh pindkepar-lodha
```

This will:
- ✅ Delete the hosting site
- ✅ Remove all deployed files
- ✅ Make the URL inaccessible

### Step 3: Delete Firebase Auth Users
1. Go to Firebase Console → Authentication
2. Find and delete each user manually
3. Users are listed in the deletion alert

### Step 4: Update Configuration (Optional)
If you committed firebase.json with the hosting target:

```bash
# Edit firebase.json - remove the hosting target
# Edit .firebaserc - remove the target mapping
git add firebase.json .firebaserc
git commit -m "chore: Remove hosting config for deleted GP"
git push origin main
```

---

## 🔄 What Happens After Deletion

### Immediately After Super Admin Deletion:
- ✅ GP data deleted from Firestore
- ✅ GP doesn't appear in Super Admin list
- ✅ GP data inaccessible via API
- ❌ Website still loads (static files still deployed)
- ❌ Login might work (Auth user still exists)

### After Deleting Hosting Site:
- ✅ Website URL returns "Site Not Found"
- ✅ Files removed from CDN
- ✅ Domain/subdomain freed up for reuse

### After Deleting Auth Users:
- ✅ Login completely disabled
- ✅ Old credentials invalid
- ✅ Email freed up for new accounts

---

## 🎯 Quick Reference Commands

### Delete everything for a GP:

```bash
# 1. Delete from Super Admin UI (copy manual instructions!)

# 2. Delete hosting site
./delete-hosting-site.sh pindkepar-lodha

# 3. Delete Firebase Auth users (Firebase Console only)
# Visit: https://console.firebase.google.com/project/grampanchayat-multi-tenant/authentication/users
```

---

## 🚨 Common Issues & Solutions

### Issue: "Site still accessible after deletion"
**Cause:** Hosting site not deleted  
**Fix:** Run `./delete-hosting-site.sh <subdomain>`

### Issue: "User can still login"
**Cause:** Firebase Auth user not deleted  
**Fix:** Delete user from Firebase Console → Authentication

### Issue: "Website shows errors"
**Cause:** Firestore data deleted but hosting site still exists  
**Fix:** This is expected! Delete the hosting site completely

### Issue: "Can't delete - site in use"
**Cause:** Deployment in progress  
**Fix:** Wait for deployment to finish, then delete

---

## 📊 Deletion Status Checklist

After deleting a GP, verify:

- [ ] GP not in Super Admin list
- [ ] Firestore data deleted (`gramPanchayats/{gpId}`)
- [ ] GP metadata deleted (`globalConfig/metadata/gramPanchayats/{gpId}`)
- [ ] Hosting site deleted (URL shows "Site Not Found")
- [ ] Firebase Auth users deleted
- [ ] firebase.json updated (hosting target removed)
- [ ] .firebaserc updated (target mapping removed)

---

## 🔮 Future Enhancements

### Planned Features:
- [ ] Cloud Function for automatic Auth user deletion
- [ ] Cloud Function for automatic hosting site deletion
- [ ] Soft delete (archive instead of permanent delete)
- [ ] Restore deleted GPs from archive
- [ ] Scheduled deletion (delete after 30 days)
- [ ] Bulk delete multiple GPs

### Why Not Automatic Now?
- Firebase Hosting site deletion requires Firebase Admin SDK
- Firebase Auth user deletion requires Firebase Admin SDK
- Both need to run server-side (Cloud Functions)
- Current approach is client-side only (simpler, no backend needed)

**Want automatic deletion?** Would require:
1. Deploy Cloud Functions
2. Add Firebase Admin SDK
3. Configure service accounts
4. Add API endpoints

---

## 💡 Pro Tips

### Before Deleting:
1. ✅ Export data if needed (backup)
2. ✅ Notify GP admin
3. ✅ Verify correct GP selected
4. ✅ Double-check GP ID

### During Deletion:
1. ✅ Copy manual cleanup instructions
2. ✅ Save subdomain/domain name
3. ✅ Note down user emails

### After Deletion:
1. ✅ Verify site inaccessible
2. ✅ Verify login doesn't work
3. ✅ Update documentation
4. ✅ Remove from marketing materials

---

## 📝 Example: Complete Deletion

**Scenario:** Delete `pindkepar-lodha` GP

**Steps:**
```bash
# 1. Delete from Super Admin UI
# Navigate to: https://superadmin-grampanchayat.web.app
# Click GP → Delete → Type "DELETE"
# COPY the manual instructions!

# 2. Delete hosting site
./delete-hosting-site.sh pindkepar-lodha

# 3. Delete Auth users
# Firebase Console → Authentication → Delete users:
#   - admin@pindkepar-lodha.gov.in

# 4. Verify deletion
curl https://pindkepar-lodha.web.app
# Should show: "Site Not Found"

# 5. Update config (if needed)
# Edit firebase.json and .firebaserc
git add -A
git commit -m "chore: Remove pindkepar-lodha hosting config"
git push
```

**Result:**
- ✅ GP completely removed
- ✅ Data deleted
- ✅ Website inaccessible
- ✅ Users can't login
- ✅ Subdomain freed for reuse

---

## 🆘 Need Help?

### Can't delete hosting site?
```bash
# Check if site exists
firebase hosting:sites:list

# Force delete
firebase hosting:sites:delete <subdomain> --force
```

### Deletion failed?
Check error message and:
1. Verify Firebase CLI logged in
2. Check project permissions
3. Verify site name correct
4. Try Firebase Console instead

### Need to restore?
- Sorry, permanent deletion can't be undone
- Always backup data before deletion
- Consider implementing soft delete

---

**Bottom Line:** After deleting from Super Admin, run `./delete-hosting-site.sh <subdomain>` to complete the deletion! 🎯
