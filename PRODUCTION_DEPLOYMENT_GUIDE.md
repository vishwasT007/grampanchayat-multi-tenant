# 🚀 Production Deployment Guide

**Quick guide to deploy your Gram Panchayat website to production**

---

## ⚡ Quick Deploy (30 minutes)

### Step 1: Fix Security Rules (10 mins)

Replace your `firestore.rules` with this production-ready version:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole(tenant) {
      let userDoc = get(/databases/$(database)/documents/gramPanchayats/$(tenant)/users/$(request.auth.uid));
      return userDoc.data.role;
    }
    
    function isAdminForTenant(tenant) {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/gramPanchayats/$(tenant)/users/$(request.auth.uid)) &&
        (getUserRole(tenant) == 'admin' || getUserRole(tenant) == 'superAdmin');
    }
    
    match /gramPanchayats/{tenant}/{document=**} {
      allow read: if true;
      allow write: if isAdminForTenant(tenant);
    }
  }
}
```

**Deploy:**
```bash
firebase deploy --only firestore:rules
```

### Step 2: Update Storage Rules (5 mins)

Update `storage.rules`:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /gramPanchayats/{tenant}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/gramPanchayats/$(tenant)/users/$(request.auth.uid));
    }
  }
}
```

**Deploy:**
```bash
firebase deploy --only storage
```

### Step 3: Build for Production (2 mins)

```bash
npm run build
```

This creates optimized production files in `dist/` folder.

### Step 4: Deploy to Firebase Hosting (3 mins)

```bash
firebase deploy --only hosting
```

You'll get a URL like: `https://grampanchayat-multi-tenant.web.app`

### Step 5: Test Production Site (10 mins)

1. Visit your deployed URL
2. Test public pages
3. Login to admin panel
4. Test creating/editing content
5. Test on mobile device

**Done! Your site is live!** 🎉

---

## 🔒 Security Checklist (Before Going Public)

### 1. Change Admin Password
```
1. Go to: https://console.firebase.google.com
2. Authentication → Users
3. Find: admin@pindkepar.in
4. Click "..." → Reset password
5. Set strong password (16+ characters)
6. Save it in password manager
```

### 2. Restrict Firebase API Keys
```
1. Firebase Console → Project Settings
2. Under "Your apps" → Web app
3. Click "App restriction"
4. Add authorized domains:
   - localhost:5173 (for development)
   - grampanchayat-multi-tenant.web.app
   - Your custom domain (if using)
```

### 3. Enable Firebase App Check (Optional but Recommended)
```
1. Firebase Console → App Check
2. Enable for Web app
3. Use reCAPTCHA v3
4. Save site key in .env
```

---

## 🌐 Custom Domain Setup (Optional)

### Step 1: Add Domain in Firebase

```bash
firebase hosting:channel:deploy production
```

Or in Firebase Console:
1. Hosting → Add custom domain
2. Enter your domain (e.g., `pindkepar.gov.in`)
3. Follow DNS setup instructions

### Step 2: Configure DNS

Add these records to your domain DNS:

```
Type: A
Name: @
Value: 199.36.158.100

Type: A  
Name: @
Value: 199.36.158.101

Type: TXT
Name: @
Value: [Verification code from Firebase]
```

### Step 3: Wait for SSL

Firebase automatically provisions SSL certificate (takes 24-48 hours).

---

## 📦 Deployment Commands Reference

### Deploy Everything
```bash
firebase deploy
```

### Deploy Specific Services
```bash
# Only Firestore rules
firebase deploy --only firestore:rules

# Only Firestore indexes
firebase deploy --only firestore:indexes

# Only Storage rules
firebase deploy --only storage

# Only Hosting
firebase deploy --only hosting

# Multiple services
firebase deploy --only firestore,storage,hosting
```

### Preview Before Deploy
```bash
firebase hosting:channel:deploy preview
```

### Rollback Deployment
```bash
# List previous releases
firebase hosting:releases:list

# Restore specific release
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL TARGET_SITE_ID:live
```

---

## 🔄 CI/CD with GitHub Actions (Advanced)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

Get Firebase token:
```bash
firebase login:ci
```

Add token to GitHub Secrets as `FIREBASE_TOKEN`.

---

## 📊 Post-Deployment Monitoring

### 1. Set Up Performance Monitoring

Add to your HTML:
```html
<script src="https://www.gstatic.com/firebasejs/12.6.0/firebase-performance.js"></script>
<script>
  const perf = firebase.performance();
</script>
```

### 2. Enable Analytics

```javascript
// In firebaseConfig.js
import { getAnalytics } from 'firebase/analytics';
export const analytics = getAnalytics(app);
```

### 3. Monitor Hosting Metrics

Firebase Console → Hosting → Usage tab
- Page views
- Data transfer
- SSL errors

### 4. Monitor Firestore Usage

Firebase Console → Firestore → Usage tab
- Document reads
- Document writes
- Storage

---

## 🐛 Common Issues & Solutions

### Issue: "Deployment failed"
**Solution:** Check you're logged in:
```bash
firebase login
firebase projects:list
```

### Issue: "Permission denied"
**Solution:** Check Firebase CLI is authenticated:
```bash
firebase logout
firebase login
```

### Issue: "Build failed"
**Solution:** Clean and rebuild:
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Issue: "Site not updating"
**Solution:** Clear browser cache or use:
```bash
firebase hosting:channel:delete preview
firebase deploy --only hosting
```

### Issue: "Custom domain not working"
**Solution:** Check DNS propagation:
```bash
nslookup your-domain.com
```

---

## 📱 Mobile App (Future)

Your website is PWA-ready! To make it installable:

1. Add `manifest.json` in `public/`
2. Add service worker
3. Users can "Add to Home Screen"

---

## 💾 Backup Strategy

### Automated Firestore Exports

```bash
# Set up scheduled exports
gcloud firestore export gs://your-bucket/backups

# Or manual export
firebase firestore:export gs://your-bucket/backup-$(date +%Y%m%d)
```

### Storage Backups

Use `gsutil` to backup Storage:
```bash
gsutil -m rsync -r gs://your-bucket gs://backup-bucket
```

---

## 🎯 Performance Optimization

### Before Deployment:

1. **Optimize Images:**
```bash
npm install -g sharp-cli
sharp --input public/images/*.jpg --output public/images/ --webp
```

2. **Analyze Bundle:**
```bash
npm run build -- --report
```

3. **Enable Compression:** (Firebase Hosting does this automatically)

4. **Use CDN:** (Firebase Hosting is already a CDN)

---

## ✅ Pre-Launch Checklist

- [ ] Security rules deployed
- [ ] Storage rules deployed
- [ ] Admin password changed
- [ ] API keys restricted
- [ ] Build successful
- [ ] All features tested
- [ ] Mobile tested
- [ ] Different browsers tested
- [ ] Content added
- [ ] Images uploaded
- [ ] Contact info correct
- [ ] Social media links correct
- [ ] Analytics enabled
- [ ] Monitoring enabled
- [ ] Backup configured
- [ ] Custom domain (optional)
- [ ] SSL certificate active

---

## 🚀 You're Ready to Launch!

After following this guide, your website will be:
- ✅ Secure
- ✅ Fast
- ✅ Monitored
- ✅ Backed up
- ✅ Production-ready

**Deploy with confidence!** 🎉

---

## 📞 Support Resources

- **Firebase Console:** https://console.firebase.google.com
- **Firebase Documentation:** https://firebase.google.com/docs
- **Firebase Status:** https://status.firebase.google.com
- **Community Support:** https://stackoverflow.com/questions/tagged/firebase

---

**Need help?** Check the documentation files:
- PRODUCTION_READINESS_REPORT.md
- COMPLETE_EDITABILITY_SUMMARY.md
- FIREBASE_MIGRATION_COMPLETE.md
