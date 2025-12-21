# Production Setup Guide - Gram Panchayat Multi-Tenant Platform

## Prerequisites

1. Firebase Project created: `grampanchayat-multi-tenant`
2. GitHub repository: `vishwasT007/grampanchayat-multi-tenant`
3. Node.js 20+ and npm installed
4. Firebase CLI installed globally: `npm install -g firebase-tools`

## Step 1: Firebase Configuration

### 1.1 Create Service Account

1. Go to [Firebase Console](https://console.firebase.google.com) → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely
4. Convert to base64:
   ```bash
   cat service-account-key.json | base64 -w 0 > service-account-base64.txt
   ```

### 1.2 Set GitHub Secrets

Go to GitHub repo → Settings → Secrets and variables → Actions → New repository secret:

**Required Secrets:**
- `FIREBASE_SERVICE_ACCOUNT_BASE64`: Content of service-account-base64.txt
- `FIREBASE_TOKEN`: Run `firebase login:ci` and copy the token
- `GITHUB_TOKEN`: Auto-provided by GitHub Actions (no action needed)
- `VITE_FIREBASE_API_KEY`: From Firebase Console → Project Settings → Web App
- `VITE_FIREBASE_AUTH_DOMAIN`: `grampanchayat-multi-tenant.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID`: `grampanchayat-multi-tenant`
- `VITE_FIREBASE_STORAGE_BUCKET`: `grampanchayat-multi-tenant.appspot.com`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: From Firebase Console
- `VITE_FIREBASE_APP_ID`: From Firebase Console
- `VITE_FIREBASE_MEASUREMENT_ID`: From Firebase Console (optional)

### 1.3 Enable Firebase Services

```bash
firebase login
firebase use grampanchayat-multi-tenant

# Enable required services in Firebase Console:
# - Authentication (Email/Password provider)
# - Firestore Database
# - Cloud Storage
# - Cloud Functions
# - Firebase Hosting
```

## Step 2: Deploy Firestore Rules & Indexes

```bash
# Deploy security rules (CRITICAL - controls who can create GPs)
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

**Verify Rules Deployed:**
- Go to Firebase Console → Firestore Database → Rules
- Check that `globalConfig/metadata/gramPanchayats` allows write only for `isSuperAdmin()`

## Step 3: Deploy Cloud Functions

### 3.1 Set Function Config

```bash
cd functions
npm install

# Set GitHub token for auto-deployment
firebase functions:secrets:set GITHUB_TOKEN
# Paste your GitHub Personal Access Token with `repo` and `workflow` permissions
```

### 3.2 Deploy Functions

```bash
cd ..
firebase deploy --only functions
```

**Verify Functions Deployed:**
- `onGPCreated`: Triggers GitHub Actions deployment when GP is created
- `onGPDeleted`: Cleans up hosting sites and Auth users when GP is deleted
- `createAuthUserOnLogin`: Creates Auth user on first GP admin login
- `getDeploymentStatus`: Returns deployment status for a GP

## Step 4: Create Super Admin User

### 4.1 Create Auth User

```bash
# In Firebase Console → Authentication → Add user
# Email: your-email@example.com
# Password: (set a strong password)
# Note the UID
```

### 4.2 Add Super Admin Document

```bash
# In Firebase Console → Firestore Database → Start collection
# Collection: globalConfig
# Document ID: superAdmins
# Add subcollection: users
# Document ID: (paste the UID from above)
# Fields:
#   email: "your-email@example.com"
#   role: "superadmin"
#   name: "Your Name"
#   createdAt: (timestamp)
#   active: true
```

## Step 5: Deploy SuperAdmin App

```bash
# Build SuperAdmin app
npm run build:superadmin

# Deploy to Firebase Hosting
firebase deploy --only hosting:superadmin
```

**Access SuperAdmin:**
- URL: https://superadmin-grampanchayat.web.app
- Login with super admin credentials

## Step 6: Test GP Creation Flow

### 6.1 Login to SuperAdmin

1. Go to https://superadmin-grampanchayat.web.app
2. Login with super admin email/password
3. Should redirect to /superadmin/dashboard

### 6.2 Create Test GP

1. Click "Add Gram Panchayat"
2. Fill in:
   - Name: Test GP
   - Name in Marathi: टेस्ट जीपी
   - District: Test District
   - State: Maharashtra
   - Admin Email: testadmin@example.com
   - Admin Password: (generate secure password)
   - Admin Name: Test Admin
3. Click "Create Gram Panchayat"

### 6.3 Verify Creation

**In Firestore:**
- Check `globalConfig/metadata/gramPanchayats/testgp` exists
- Check `gramPanchayats/testgp/users/{uid}` exists (placeholder with isPending: true)

**In Cloud Functions Logs:**
- Check `onGPCreated` function executed
- Verify GitHub Actions workflow triggered

**In GitHub Actions:**
- Go to repo → Actions tab
- Verify "Auto Deploy GP to Firebase Hosting" workflow running
- Check logs for site creation and deployment

### 6.4 Test GP Admin Login

1. Wait for GitHub Actions deployment to complete
2. Go to the deployed GP site (e.g., https://testgp-gpmulti.web.app)
3. Login with admin credentials
4. Should trigger `createAuthUserOnLogin` Cloud Function
5. Auth user created, placeholder removed
6. Redirect to GP dashboard

## Step 7: Production Monitoring

### 7.1 Enable Logging

```bash
# View Cloud Functions logs
firebase functions:log

# View specific function
firebase functions:log --only onGPCreated
```

### 7.2 Set Up Alerts

- Firebase Console → Functions → Metrics
- Set up alerts for function failures
- Monitor deployment success rate

## Troubleshooting

### GP Creation Fails with "Permission Denied"

**Cause:** Firestore rules not deployed or super admin not properly configured

**Fix:**
```bash
# Re-deploy rules
firebase deploy --only firestore:rules

# Verify super admin document exists in Firestore
# Path: globalConfig/superAdmins/users/{your-uid}
```

### GitHub Actions Deployment Fails

**Cause:** Missing secrets or invalid service account

**Fix:**
1. Verify all GitHub secrets are set correctly
2. Check FIREBASE_SERVICE_ACCOUNT_BASE64 is valid base64
3. Re-generate service account key if needed

### Site Creation Fails with "Reserved by Another Project"

**Cause:** Subdomain globally reserved in Firebase

**Fix:**
- Workflow automatically appends random suffix (e.g., `-abc123`)
- Firestore domain will be updated to final site ID
- No manual intervention needed

### Auth User Creation Fails

**Cause:** Cloud Function not deployed or missing permissions

**Fix:**
```bash
# Re-deploy functions
firebase deploy --only functions

# Verify service account has permissions:
# - Firebase Authentication Admin
# - Cloud Datastore User
# - Firebase Hosting Admin
```

## Security Checklist

- [ ] Firestore rules deployed and tested
- [ ] Only super admins can create GPs
- [ ] Service account JSON secured (never commit to repo)
- [ ] GitHub secrets configured
- [ ] CORS enabled for Firebase domains only
- [ ] Environment variables not exposed in client code
- [ ] Super admin users documented and access controlled

## Performance Optimization

- [ ] Enable Firebase Performance Monitoring
- [ ] Set up CDN for static assets
- [ ] Enable compression in hosting
- [ ] Lazy load components in React
- [ ] Use Firebase indexes for frequent queries

## Backup & Recovery

```bash
# Export Firestore data
gcloud firestore export gs://grampanchayat-multi-tenant.appspot.com/backups/$(date +%Y%m%d)

# Backup Cloud Functions code
git tag -a "production-$(date +%Y%m%d)" -m "Production backup"
git push --tags
```

## Support

For issues or questions:
1. Check GitHub Actions logs
2. Review Cloud Functions logs
3. Verify Firestore rules and documents
4. Contact development team

