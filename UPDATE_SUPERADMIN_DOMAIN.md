# 📋 Update GP Domain in SuperAdmin - Step by Step

## 🎯 Goal
Update the domain displayed in SuperAdmin panel from `pindkepar-lodha-gpmulti.web.app` to `pindkepar-lodha-gpmulti-lp9lcu.web.app`

---

## ✅ EASIEST METHOD: Edit in SuperAdmin Panel

### Step 1: Go to GP Details Page
```
URL: https://superadmin-grampanchayat.web.app/superadmin/gram-panchayats/pindkeparlodha
```

You're already here! This is the page showing "Domain: pindkepar-lodha-gpmulti.web.app"

---

### Step 2: Click "Edit" Button

Look for the "Edit" button on the page (usually near the top, next to "Deactivate" and "Delete")

Click it to open the Edit GP form.

---

### Step 3: Find the "Subdomain" Field

In the edit form, scroll down to find the "Subdomain" or "Domain Configuration" section.

You'll see a field labeled "Subdomain" with current value:
```
pindkepar-lodha-gpmulti
```

---

### Step 4: Update the Subdomain

**Change the subdomain field to:**
```
pindkepar-lodha-gpmulti-lp9lcu
```

**Important:** Include the `-lp9lcu` suffix that Firebase added!

---

### Step 5: Save Changes

Click the "Save" or "Update GP" button at the bottom of the form.

---

### Step 6: Verify the Update

After saving, you should be redirected back to the GP details page.

**Check these fields:**
- Domain should now show: `pindkepar-lodha-gpmulti-lp9lcu.web.app` ✅
- The "Visit Website" button should now link to the correct URL ✅

---

## 🔧 ALTERNATIVE METHOD: Update via Firebase Console

If the Edit button doesn't work or you prefer direct database access:

### Step 1: Open Firebase Console
```
https://console.firebase.google.com/project/grampanchayat-multi-tenant/firestore/data
```

### Step 2: Navigate to the Document

Click through this path in Firestore:
```
globalConfig 
  → metadata (subcollection)
    → gramPanchayats (subcollection)
      → pindkeparlodha (document) ← Click this
```

### Step 3: Edit Document Fields

You'll see the document with all fields. Click the edit icon (pencil) next to each field:

**Field 1: `domain`**
- Current: `pindkepar-lodha-gpmulti.web.app`
- Change to: `pindkepar-lodha-gpmulti-lp9lcu.web.app`

**Field 2: `subdomain`**
- Current: `pindkepar-lodha-gpmulti`
- Change to: `pindkepar-lodha-gpmulti-lp9lcu`

### Step 4: Save the Document

Click "Update" button to save changes.

### Step 5: Verify in SuperAdmin

1. Go to: https://superadmin-grampanchayat.web.app/superadmin/gram-panchayats/pindkeparlodha
2. Press F5 to refresh the page
3. Domain should now show correctly! ✅

---

## 🎉 After Update

Once you've updated the domain, these will work correctly:

### ✅ SuperAdmin Panel
- Shows correct domain: `pindkepar-lodha-gpmulti-lp9lcu.web.app`
- "Visit Website" button links to correct URL
- No more confusion about the actual URL

### ✅ Your Live Site
```
Public Website:
https://pindkepar-lodha-gpmulti-lp9lcu.web.app

Admin Login:
https://pindkepar-lodha-gpmulti-lp9lcu.web.app/admin/login
```

---

## ⚠️ Important Notes

1. **Your site is already live and working** - This update only fixes the display in SuperAdmin

2. **The suffix `-lp9lcu` is permanent** - Firebase added it and it can't be removed. This is normal.

3. **All features work** - Tenant detection, admin login, data storage - everything works with the suffix

4. **Update is cosmetic** - If you don't update, your site still works. This just makes SuperAdmin show the correct URL.

---

## 🐛 Troubleshooting

### If Edit button doesn't work:
- Use the Firebase Console method instead
- Check that you're logged in as SuperAdmin

### If changes don't appear:
- Hard refresh the page (Ctrl + F5 or Cmd + Shift + R)
- Clear browser cache
- Wait a few seconds for Firestore to sync

### If you can't access Firebase Console:
- Make sure you're logged in with the correct Google account
- Check that you have owner/editor access to the Firebase project

---

## ✅ Verification Checklist

After updating, verify:

- [ ] SuperAdmin shows: `pindkepar-lodha-gpmulti-lp9lcu.web.app`
- [ ] "Visit Website" button goes to correct URL
- [ ] Website loads at: https://pindkepar-lodha-gpmulti-lp9lcu.web.app
- [ ] Admin login works
- [ ] No console errors

---

## 🚀 Quick Summary

**What to do:**
1. Go to SuperAdmin → GP Details page (you're already there!)
2. Click "Edit" button
3. Change subdomain to: `pindkepar-lodha-gpmulti-lp9lcu`
4. Save
5. Refresh page - domain should be updated! ✅

**That's it!** Simple 5-step process to fix the display.

---

## 📞 Need Help?

If you encounter any issues:
1. Try the Firebase Console method instead
2. Check browser console for errors
3. Verify you have the correct permissions

Your site is live and working perfectly. This update just makes SuperAdmin display the correct URL! 🎉
