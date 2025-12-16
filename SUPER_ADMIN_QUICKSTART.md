# 🚀 Super Admin Quick Start Guide

## Login Credentials

```
URL:      http://localhost:5173/superadmin/login
Email:    superadmin@grampanchayat.in
Password: SuperAdmin@2025!
```

⚠️ **Change password after first login!**

---

## 3-Minute Setup

### 1. Create Super Admin in Firebase (2 min)

**Firebase Authentication:**
1. Go to https://console.firebase.google.com
2. Select your project
3. Authentication → Users → Add User
4. Email: `superadmin@grampanchayat.in`
5. Password: `SuperAdmin@2025!`
6. **Copy the UID!**

**Firestore Database:**
1. Firestore Database → Start Collection
2. Create: `globalConfig/superAdmins/users/[YOUR_UID]`
3. Add fields:

```
uid: [YOUR_UID]
email: superadmin@grampanchayat.in
role: superadmin
displayName: Super Administrator
active: true
createdAt: [server timestamp]
lastLogin: [server timestamp]
permissions: ["manage_gps", "create_admins", "view_analytics", "manage_users", "system_settings", "view_logs", "manage_domains", "delete_gps"]
```

### 2. Update Firestore Rules (30 sec)

Add to `firestore.rules`:

```javascript
match /globalConfig/{document=**} {
  allow read, write: if get(/databases/$(database)/documents/globalConfig/superAdmins/users/$(request.auth.uid)).data.role == 'superadmin';
}
```

Deploy:
```bash
firebase deploy --only firestore:rules
```

### 3. Login! (30 sec)

```bash
npm run dev
# Open http://localhost:5173/superadmin/login
```

---

## OR Use the Setup Script

```bash
./scripts/setup-super-admin.sh
```

This interactive script guides you through all steps!

---

## Dashboard Features

✅ **System Statistics**
- Total Gram Panchayats
- Active GPs
- Admin Users
- Custom Domains

✅ **Quick Actions**
- Add New GP (coming in Phase 3)
- Manage GPs (coming in Phase 4)
- Manage Users (coming in Phase 5)

✅ **Recent GPs List**
- View all Gram Panchayats
- Status indicators
- Quick navigation

---

## Next: Add Your First GP

**Phase 3 (Coming Soon):**
- Click "Add New GP" button
- Fill in GP details
- Auto-generate admin credentials
- One-click setup!

For now, you can use the manual script:
```bash
./scripts/add-new-gp.sh
```

---

## File Structure

```
src/
├── config/
│   └── superAdminConfig.js      # Configuration
├── services/
│   └── superAdminService.js     # Backend functions
├── contexts/
│   └── SuperAdminContext.jsx    # State management
├── pages/SuperAdmin/
│   ├── Login.jsx                # Login page
│   └── Dashboard.jsx            # Dashboard
└── components/SuperAdmin/
    └── ProtectedRoute.jsx       # Route guard
```

---

## Troubleshooting

**"Unauthorized" error:**
- Check Firestore document created correctly
- Verify role is exactly "superadmin"
- Ensure UID matches Firebase Auth user

**Dashboard not loading:**
- Check Firestore rules deployed
- Verify browser console for errors
- Ensure Firebase initialized

**Can't login:**
- Verify email/password correct
- Check user exists in Firebase Auth
- Clear browser cache

---

## Security Checklist

- [ ] Super admin account created
- [ ] Firestore rules deployed
- [ ] Default password changed
- [ ] 2FA enabled (recommended)
- [ ] Credentials stored securely

---

## URLs

**Local Development:**
- Login: http://localhost:5173/superadmin/login
- Dashboard: http://localhost:5173/superadmin/dashboard

**Production (after deployment):**
- Login: https://your-domain.web.app/superadmin/login
- Dashboard: https://your-domain.web.app/superadmin/dashboard

---

## Phase Roadmap

- ✅ **Phase 1**: Authentication System (COMPLETE!)
- 🔄 **Phase 2**: Dashboard Enhancements (Next)
- 📋 **Phase 3**: Add GP Form (Critical!)
- 📋 **Phase 4**: GP Management
- 📋 **Phase 5**: User Management
- 📋 **Phase 6**: Analytics & Reports

---

## Documentation

📄 **PHASE_1_COMPLETE.md** - Detailed Phase 1 guide  
📄 **SUPER_ADMIN_BUILD_PLAN.md** - Full implementation plan  
📄 **SUPER_ADMIN_PANEL_PROPOSAL.md** - Architecture details  

---

## Support

See **PHASE_1_COMPLETE.md** for:
- Detailed troubleshooting
- Security best practices
- Step-by-step setup
- Feature roadmap

---

**Phase 1 Status: ✅ COMPLETE**

Happy managing! 🎉
