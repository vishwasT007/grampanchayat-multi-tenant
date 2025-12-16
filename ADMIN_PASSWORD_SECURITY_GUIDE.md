# 🔐 Admin Password & Security Guide

## Overview

This guide covers how to change the default admin password, implement secure authentication practices, and manage user credentials for production.

---

## ⚠️ CRITICAL: Change Default Password

### Current Default Credentials
```
Email: admin@pindkepar.gov.in
Password: admin123
```

**🚨 SECURITY WARNING**: These default credentials are documented in multiple places and **MUST** be changed before going to production!

---

## 🔧 How to Change Admin Password

### Method 1: Using Firebase Console (Recommended)

1. **Go to Firebase Console**:
   - Visit: https://console.firebase.google.com
   - Select project: **grampanchayat-multi-tenant**

2. **Navigate to Authentication**:
   - Click **Authentication** in left sidebar
   - Click **Users** tab

3. **Find Admin User**:
   - Search for: `admin@pindkepar.gov.in`
   - Click on the user row

4. **Reset Password**:
   - Click the **⋮** (three dots) menu
   - Select **Reset password**
   - Firebase will send a password reset email

5. **Set New Password**:
   - Check email inbox
   - Click reset link
   - Set a **strong, unique password**
   - Save the password securely (use a password manager!)

### Method 2: Using Firebase CLI

```bash
# Install Firebase Tools if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# List all users
firebase auth:export users.json --project grampanchayat-multi-tenant

# Delete old user (optional - if you want to recreate)
firebase auth:delete admin@pindkepar.gov.in --project grampanchayat-multi-tenant

# Create new admin user with secure password
firebase auth:create \
  --email admin@pindkepar.gov.in \
  --password "YourSecurePassword123!@#" \
  --display-name "System Administrator" \
  --project grampanchayat-multi-tenant
```

### Method 3: Programmatically (For Multiple Admins)

Create a script to update passwords:

```javascript
// scripts/updateAdminPassword.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';

const firebaseConfig = {
  // Your Firebase config here
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function changeAdminPassword() {
  try {
    // Login with old password
    const userCredential = await signInWithEmailAndPassword(
      auth,
      'admin@pindkepar.gov.in',
      'admin123' // Old password
    );

    const user = userCredential.user;

    // Update to new password
    await updatePassword(user, 'NewSecurePassword123!@#');
    
    console.log('✅ Password updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating password:', error);
    process.exit(1);
  }
}

changeAdminPassword();
```

Run it:
```bash
node scripts/updateAdminPassword.js
```

---

## 🔒 Password Requirements

### Minimum Requirements
- ✅ At least 12 characters
- ✅ Mix of uppercase and lowercase letters
- ✅ At least one number
- ✅ At least one special character (!@#$%^&*)
- ✅ Not a common password
- ✅ Not based on personal information

### Examples of Strong Passwords
```
✅ Gr@mP@nch@y@t2024!
✅ P1ndkep@r#SecureAdmin
✅ MultI-TenaNt$2024!@
```

### Examples of Weak Passwords
```
❌ admin123
❌ password
❌ grampanchayat
❌ 12345678
❌ pindkepar
```

---

## 👥 Creating Additional Admin Users

### Step 1: Create User in Firebase Auth

**Via Firebase Console**:
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and secure password
4. Click **Add User**

**Via Firebase CLI**:
```bash
firebase auth:create \
  --email newadmin@pindkepar.gov.in \
  --password "SecurePassword123!@#" \
  --display-name "New Admin Name" \
  --project grampanchayat-multi-tenant
```

### Step 2: Add User to Firestore

**Manual Method (Firebase Console)**:
1. Go to **Firestore Database**
2. Navigate to: `gramPanchayats/pindkepar/users`
3. Click **Add Document**
4. Set Document ID to: User's UID (get from Authentication tab)
5. Add fields:
   ```
   email: newadmin@pindkepar.gov.in
   displayName: New Admin Name
   role: admin
   tenant: pindkepar
   isActive: true
   createdAt: [Current timestamp]
   ```

**Automated Method (Using Script)**:

Create `scripts/createAdmin.js`:
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = { /* your config */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function createAdmin(email, password, displayName, tenant) {
  try {
    // 1. Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userId = userCredential.user.uid;

    // 2. Add to Firestore
    await setDoc(doc(db, `gramPanchayats/${tenant}/users/${userId}`), {
      email,
      displayName,
      role: 'admin',
      tenant,
      isActive: true,
      createdAt: new Date(),
      permissions: {
        canManageUsers: true,
        canManageContent: true,
        canViewReports: true,
        canManageFinancials: true
      }
    });

    console.log('✅ Admin user created:', email);
    console.log('User ID:', userId);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
}

// Usage
createAdmin(
  'newadmin@pindkepar.gov.in',
  'SecurePassword123!@#',
  'New Admin Name',
  'pindkepar'
);
```

---

## 🛡️ Security Best Practices

### 1. **Use Strong Passwords**
- Never use default passwords in production
- Use a password manager (LastPass, 1Password, Bitwarden)
- Enable password requirements in Firebase

### 2. **Enable Multi-Factor Authentication (MFA)**

```javascript
import { 
  getAuth, 
  multiFactor, 
  PhoneAuthProvider,
  PhoneMultiFactorGenerator 
} from 'firebase/auth';

// Enable MFA for admin users
const auth = getAuth();
const user = auth.currentUser;

// Add phone number as second factor
// (Requires implementation in your app)
```

### 3. **Implement Password Rotation Policy**
- Change admin passwords every 90 days
- Don't reuse old passwords
- Log password changes for audit trail

### 4. **Use Environment Variables**
- Never hardcode passwords in code
- Use `.env` files (excluded from git)
- Use secret management for production

### 5. **Limit Login Attempts**

Already implemented in your app:
```javascript
// src/pages/Login.jsx
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
```

### 6. **Monitor Admin Activity**

Enable audit logging:
```javascript
import { trackAdminAction } from '../utils/analyticsUtils';

// Log all admin actions
trackAdminAction('login', 'authentication', {
  userId: user.uid,
  email: user.email,
  timestamp: new Date().toISOString()
});
```

---

## 🔐 Password Reset Flow for Users

### Enable Email Password Reset

1. **In Firebase Console**:
   - Go to **Authentication** → **Templates**
   - Click **Password reset**
   - Customize email template
   - Set sender name and email

2. **Implement in Your App**:

```javascript
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const handleForgotPassword = async (email) => {
  const auth = getAuth();
  
  try {
    await sendPasswordResetEmail(auth, email, {
      url: 'https://grampanchayat-multi-tenant.web.app/login',
      handleCodeInApp: false
    });
    
    alert('Password reset email sent! Check your inbox.');
  } catch (error) {
    console.error('Error sending reset email:', error);
    alert('Failed to send reset email. Please try again.');
  }
};
```

---

## 📋 Password Change Checklist

### Before Production
- [ ] Change default admin password
- [ ] Update all documentation to remove default password
- [ ] Create strong, unique passwords for all admin users
- [ ] Store passwords securely in password manager
- [ ] Enable email verification for new users
- [ ] Configure password reset email templates
- [ ] Test password reset flow
- [ ] Enable security monitoring in Firebase Console

### After Production
- [ ] Monitor failed login attempts
- [ ] Set up alerts for suspicious activity
- [ ] Implement MFA for admin accounts (optional)
- [ ] Regular password rotation (every 90 days)
- [ ] Review user access logs monthly
- [ ] Remove inactive admin accounts
- [ ] Keep backup admin account (in case of lockout)

---

## 🚨 Emergency Access Recovery

### If Admin Password Is Lost

**Method 1: Firebase Console (Requires Google Account Access)**
1. Login to Firebase Console with project owner account
2. Reset password via Authentication tab

**Method 2: Firebase Admin SDK (Requires Server)**
```javascript
// Using Firebase Admin SDK (server-side)
import admin from 'firebase-admin';

admin.initializeApp();

const updatePassword = async (uid, newPassword) => {
  await admin.auth().updateUser(uid, {
    password: newPassword
  });
};
```

**Method 3: Create Emergency Backdoor Admin**
- Keep one backup admin account
- Store credentials in secure vault
- Only use in emergencies
- Delete after use

---

## 📊 User Management Best Practices

### 1. **Role-Based Access Control (RBAC)**

Already implemented in your security rules:
```javascript
// firestore.rules
function isAdminForTenant(tenant) {
  let user = get(/databases/$(database)/documents/gramPanchayats/$(tenant)/users/$(request.auth.uid));
  return user.data.role == 'admin' && user.data.isActive == true;
}
```

### 2. **User Lifecycle Management**

**Active Users**:
- Regular password updates
- Activity monitoring
- Permission reviews

**Inactive Users**:
- Disable after 90 days of inactivity
- Remove after 180 days
- Archive user data before deletion

### 3. **Audit Trail**

Log all security events:
- Login/logout
- Password changes
- Permission updates
- Failed login attempts
- Account lockouts

---

## 🔍 Monitoring & Alerts

### Set Up Firebase Security Alerts

1. **Go to Firebase Console** → **Settings** → **Notifications**
2. Enable alerts for:
   - Unusual login activity
   - Multiple failed login attempts
   - Password reset requests
   - New user registrations

### Monitor in Google Analytics

Track security events:
```javascript
import { trackEvent } from '../utils/analyticsUtils';

// On failed login
trackEvent('security_event', {
  event_type: 'failed_login',
  email: email,
  attempts: attemptCount
});

// On successful login
trackEvent('security_event', {
  event_type: 'successful_login',
  email: email,
  user_role: userRole
});
```

---

## 📚 Resources

- [Firebase Authentication Best Practices](https://firebase.google.com/docs/auth/best-practices)
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Google Identity Platform Security](https://cloud.google.com/identity-platform/docs/security-best-practices)

---

## ✅ Quick Action Items

### Right Now (Before Production)
1. **Change default admin password** using Firebase Console
2. **Remove default credentials** from all documentation files
3. **Create new admin users** with strong passwords
4. **Test password reset flow**

### Within 24 Hours
5. **Enable email verification** for new users
6. **Set up password reset email templates**
7. **Configure security monitoring alerts**

### Within 1 Week
8. **Implement MFA** for admin accounts
9. **Document password rotation policy**
10. **Train admins** on security best practices

---

**Status**: 🔧 Action Required - Change Default Password!
**Priority**: 🚨 CRITICAL
**Version**: 1.0.0
**Last Updated**: December 2024
