# GitHub Actions + Firebase Hosting - Complete Setup Guide

## 🎯 Overview
This guide will help you deploy your Gram Panchayat Portal automatically to Firebase Hosting whenever you push code to GitHub.

**What you'll achieve:**
- ✅ Automatic deployment on every push to `main` branch
- ✅ Secure credential management
- ✅ Production build optimization
- ✅ Free Firebase Hosting (with your custom domain later)

---

## 📋 Prerequisites

- [x] GitHub repository created: https://github.com/vishwasT007/grampanchayat-multi-tenant
- [x] Firebase project created: `grampanchayat-multi-tenant`
- [x] Code pushed to GitHub
- [ ] Firebase CLI authenticated
- [ ] GitHub repository secrets configured

---

## 🚀 Step-by-Step Setup

### **STEP 1: Generate Firebase CI Token**

This token allows GitHub Actions to deploy on your behalf.

```bash
# Login to Firebase (opens browser)
firebase login:ci
```

**What happens:**
1. Browser opens for Google authentication
2. Sign in with your Google account (the one used for Firebase)
3. Copy the token displayed in terminal
4. **IMPORTANT:** Save this token - you'll need it in Step 2

**Example output:**
```
✔ Success! Use this token to login on a CI server:

1//0gABC123xyz...very-long-token...def456

Example: firebase deploy --token "$FIREBASE_TOKEN"
```

---

### **STEP 2: Add Secrets to GitHub Repository**

Go to your GitHub repository settings to add secrets:

**URL:** https://github.com/vishwasT007/grampanchayat-multi-tenant/settings/secrets/actions

#### Add These Secrets:

Click **"New repository secret"** for each:

| Secret Name | Value | Where to Find |
|------------|-------|---------------|
| `FIREBASE_SERVICE_ACCOUNT` | Token from Step 1 | Copy the entire token from `firebase login:ci` |
| `VITE_FIREBASE_API_KEY` | `AIzaSyB67ZvBQ7DLy3nErDuWSorBtbwgKeoWCw4` | From your `.env` file |
| `VITE_FIREBASE_AUTH_DOMAIN` | `grampanchayat-multi-tenant.firebaseapp.com` | From your `.env` file |
| `VITE_FIREBASE_PROJECT_ID` | `grampanchayat-multi-tenant` | From your `.env` file |
| `VITE_FIREBASE_STORAGE_BUCKET` | `grampanchayat-multi-tenant.firebasestorage.app` | From your `.env` file |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `595321745876` | From your `.env` file |
| `VITE_FIREBASE_APP_ID` | `1:595321745876:web:3073e006f4a418207e2641` | From your `.env` file |

#### Optional Production Secrets (if different from development):

| Secret Name | Recommended Value | Purpose |
|------------|-------------------|---------|
| `VITE_ENABLE_ANALYTICS` | `true` | Enable Firebase Analytics in production |
| `VITE_ENABLE_PERFORMANCE` | `true` | Enable Performance Monitoring |
| `VITE_ENABLE_APP_CHECK` | `true` | Enable App Check (after setup) |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Analytics Measurement ID |

---

### **STEP 3: Update GitHub Workflow (Already Done!)**

Your workflow file is already configured at:
`.github/workflows/firebase-deploy.yml`

It will:
- ✅ Trigger on every push to `main` branch
- ✅ Build your React app with Vite
- ✅ Deploy to Firebase Hosting
- ✅ Can also be triggered manually

---

### **STEP 4: Test the Deployment**

#### Option A: Push a Test Commit

```bash
# Make a small change
echo "# Deployed via GitHub Actions" >> README.md

# Commit and push
git add README.md
git commit -m "test: Trigger GitHub Actions deployment"
git push origin main
```

#### Option B: Manual Trigger

1. Go to: https://github.com/vishwasT007/grampanchayat-multi-tenant/actions
2. Click **"Deploy to Firebase Hosting"** workflow
3. Click **"Run workflow"** button
4. Select `main` branch
5. Click **"Run workflow"**

---

### **STEP 5: Monitor Deployment**

1. **GitHub Actions:**
   - URL: https://github.com/vishwasT007/grampanchayat-multi-tenant/actions
   - Watch the workflow progress (takes 3-5 minutes)
   - Green checkmark = Success ✅
   - Red X = Failed ❌ (check logs for errors)

2. **Firebase Hosting:**
   - Your site will be live at: **https://grampanchayat-multi-tenant.web.app**
   - Also available at: **https://grampanchayat-multi-tenant.firebaseapp.com**

---

## 🌐 Access Your Deployed Site

After successful deployment:

**Primary URL:**
```
https://grampanchayat-multi-tenant.web.app
```

**Secondary URL:**
```
https://grampanchayat-multi-tenant.firebaseapp.com
```

**Admin Login:**
- Email: `admin@pindkepar.gov.in`
- Password: `admin123` ⚠️ **CHANGE THIS IMMEDIATELY!**

---

## 🔧 Troubleshooting

### ❌ Error: "Permission denied"
**Solution:** Make sure you added `FIREBASE_SERVICE_ACCOUNT` secret correctly

### ❌ Error: "Build failed"
**Solution:** 
- Check that all `VITE_*` secrets are added
- Verify no typos in secret values

### ❌ Error: "Firebase project not found"
**Solution:** 
- Update `.github/workflows/firebase-deploy.yml` line 41
- Change project ID if different: `--project grampanchayat-multi-tenant`

### ❌ Deployment succeeds but site shows old version
**Solution:**
- Clear browser cache (Ctrl + Shift + R)
- Check Firebase Console → Hosting → Release history

---

## 🎨 Custom Domain Setup (For Later)

When you purchase a custom domain (e.g., `pindkepar.gov.in`):

### Step 1: Add Domain in Firebase Console

1. Go to: https://console.firebase.google.com/project/grampanchayat-multi-tenant/hosting
2. Click **"Add custom domain"**
3. Enter your domain name
4. Firebase will provide DNS records

### Step 2: Update DNS Records

Add these records to your domain registrar:

**For apex domain (pindkepar.gov.in):**
```
Type: A
Name: @
Value: [IP provided by Firebase]
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: grampanchayat-multi-tenant.web.app
```

### Step 3: Wait for SSL Certificate

- Firebase automatically provisions free SSL certificate
- Takes 24-48 hours to propagate
- Your site will be accessible via HTTPS

### Step 4: Update GitHub Workflow (Optional)

No changes needed! The workflow deploys to Firebase Hosting, which serves both:
- Default URLs (`.web.app` and `.firebaseapp.com`)
- Custom domain (when configured)

---

## 📊 Monitoring & Analytics

### View Deployment History

**GitHub Actions:**
- https://github.com/vishwasT007/grampanchayat-multi-tenant/actions
- See all past deployments, logs, and status

**Firebase Hosting:**
- https://console.firebase.google.com/project/grampanchayat-multi-tenant/hosting
- See release history, rollback options, traffic stats

### Enable Analytics (Production)

After deploying, enable analytics by adding secrets:

```bash
# Get your Measurement ID from Firebase Console
# Analytics → Data Streams → Web → Measurement ID
```

Add to GitHub Secrets:
- `VITE_ENABLE_ANALYTICS=true`
- `VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX`

---

## 🔐 Security Best Practices

### ✅ DO:
- Keep `.env` file in `.gitignore` (already done)
- Use GitHub Secrets for all sensitive data
- Change default admin password immediately
- Restrict Firebase API keys in Google Cloud Console
- Enable App Check for production

### ❌ DON'T:
- Never commit `.env` file to Git
- Never share GitHub repository secrets
- Never use default admin password in production
- Never expose Firebase service account token

---

## 🚀 Deployment Workflow Summary

```
┌─────────────────┐
│   Push to Git   │
│   (main branch) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│   Triggered     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Install Deps   │
│   npm ci        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build Project  │
│  npm run build  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deploy to       │
│ Firebase Hosting│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Site Live!    │
│ .web.app URL    │
└─────────────────┘
```

---

## 📝 Quick Reference Commands

```bash
# Generate Firebase CI token
firebase login:ci

# Manual deployment from local
firebase deploy --only hosting

# Test production build locally
npm run build
npm run preview

# Check deployment status
firebase hosting:sites:list

# View hosting URLs
firebase hosting:channel:list
```

---

## 📞 Support & Resources

- **Firebase Hosting Docs:** https://firebase.google.com/docs/hosting
- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Your Firebase Console:** https://console.firebase.google.com/project/grampanchayat-multi-tenant
- **Your GitHub Actions:** https://github.com/vishwasT007/grampanchayat-multi-tenant/actions

---

## ✅ Completion Checklist

- [ ] Generated Firebase CI token
- [ ] Added all 7+ secrets to GitHub repository
- [ ] Tested deployment (push to main or manual trigger)
- [ ] Verified site is live at `.web.app` URL
- [ ] Changed default admin password
- [ ] Restricted Firebase API keys
- [ ] Enabled production analytics (optional)
- [ ] Configured custom domain (when purchased)

---

**🎉 Once setup is complete, every push to `main` branch will automatically deploy to Firebase Hosting!**
