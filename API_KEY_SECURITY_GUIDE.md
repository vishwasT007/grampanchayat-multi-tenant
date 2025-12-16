# 🔐 Firebase API Key Security Guide

## Overview

Firebase API keys are public by default, but they should be restricted to prevent unauthorized usage. This guide shows you how to secure your Firebase API keys for production.

---

## 📚 Understanding Firebase API Keys

### What is the Firebase API Key?

The Firebase API key (found in `VITE_FIREBASE_API_KEY`) is **intentionally public** and is used for:
- Identifying your Firebase project
- Enabling Firebase SDK functionality
- Routing requests to correct project

### Why Restrict It?

Even though it's public, you should restrict it to:
- ✅ Prevent quota abuse
- ✅ Limit usage to your domains
- ✅ Block unauthorized app usage
- ✅ Reduce attack surface
- ✅ Meet compliance requirements

---

## 🛡️ API Key Restrictions

### Step 1: Restrict Browser API Key

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com
   - Select project: **grampanchayat-multi-tenant**

2. **Navigate to API Credentials**:
   - Click ☰ menu → **APIs & Services** → **Credentials**

3. **Find Browser API Key**:
   - Look for key named: **Browser key (auto created by Firebase)**
   - Click the pencil icon ✏️ to edit

4. **Set Application Restrictions**:
   - Select: **HTTP referrers (web sites)**
   - Click **Add an item**
   - Add your authorized domains:
     ```
     https://grampanchayat-multi-tenant.web.app/*
     https://grampanchayat-multi-tenant.firebaseapp.com/*
     https://your-custom-domain.com/*
     http://localhost:5173/*  (for development)
     http://localhost:4173/*  (for preview)
     ```

5. **Set API Restrictions**:
   - Select: **Restrict key**
   - Enable only these APIs:
     - ✅ Cloud Firestore API
     - ✅ Firebase Authentication API
     - ✅ Cloud Storage for Firebase API
     - ✅ Firebase Hosting API
     - ✅ Firebase Analytics
     - ✅ Firebase Performance Monitoring
     - ❌ Disable all others

6. **Save Changes**:
   - Click **Save**
   - Wait 5 minutes for changes to propagate

### Step 2: Restrict Android/iOS API Keys (If Applicable)

If you have mobile apps:

**Android Key**:
- Restrict by: **Android apps**
- Add SHA-1 fingerprints from your app
- Add package name

**iOS Key**:
- Restrict by: **iOS apps**
- Add bundle identifiers

---

## 🔒 Additional Security Measures

### 1. Enable App Check (Recommended)

App Check verifies that requests come from your app, not bots.

#### Setup App Check

1. **Go to Firebase Console**:
   - Select project → **App Check** (in left sidebar)

2. **Register Your Web App**:
   - Click **Get started** or **Register app**
   - Select your web app

3. **Choose a Provider**:
   
   **Option A: reCAPTCHA v3 (Recommended for Web)**
   - Select **reCAPTCHA v3**
   - Get site key from: https://www.google.com/recaptcha/admin
   - Add site key to App Check
   - Add to your `.env`:
     ```bash
     VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
     ```

   **Option B: reCAPTCHA Enterprise**
   - More robust, but paid (after free tier)
   - Better bot detection

4. **Enforce App Check**:
   - Go to **APIs** tab in App Check
   - Enable enforcement for:
     - ✅ Cloud Firestore
     - ✅ Cloud Storage
     - ⚠️ Start with "Unenforced" mode to test

5. **Implement in Your App**:

```javascript
// src/config/firebaseConfig.js
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Initialize App Check
if (import.meta.env.PROD && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
  console.log('✅ App Check initialized');
}
```

**Add to `.env.production`**:
```bash
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_v3_site_key
```

### 2. Enable Security Rules (Already Done ✅)

Your Firestore and Storage rules already implement tenant-based access control:

**Firestore Rules**:
```javascript
// Only admins of a tenant can write
allow write: if isAdminForTenant(tenant);

// Users can only read their tenant's data
allow read: if isAuthenticated() && 
  get(/databases/$(database)/documents/gramPanchayats/$(tenant)/users/$(request.auth.uid)).data.tenant == tenant;
```

**Storage Rules**:
```javascript
// Only admins can upload to their tenant
allow write: if isAdminForTenant(tenant);
```

### 3. Set Up Cloud Armor (Advanced)

For DDoS protection and advanced security:

1. **Go to Google Cloud Console** → **Network Security** → **Cloud Armor**
2. Create a security policy
3. Add rules:
   - Rate limiting (e.g., 100 requests/minute per IP)
   - Geo-blocking (block specific countries if needed)
   - SQL injection protection
   - XSS protection

### 4. Monitor API Usage

#### Firebase Usage Dashboard

1. **Go to Firebase Console** → **Usage and Billing**
2. Monitor:
   - Firestore reads/writes
   - Storage bandwidth
   - Authentication requests
   - Hosting bandwidth

#### Set Up Usage Alerts

1. **Go to Usage and Billing** → **Details**
2. Click **Set Budget Alert**
3. Set thresholds:
   - 50% of quota
   - 90% of quota
   - 100% of quota

#### Google Cloud Monitoring

1. **Go to Google Cloud Console** → **Monitoring**
2. Create dashboard for:
   - API request count
   - Error rates
   - Latency
   - Quota usage

---

## 🚨 Security Checklist

### Before Production
- [ ] Restrict browser API key to authorized domains
- [ ] Add production domain to authorized list
- [ ] Enable only necessary APIs
- [ ] Set up App Check with reCAPTCHA
- [ ] Test API restrictions don't break functionality
- [ ] Enable security monitoring
- [ ] Set up usage alerts
- [ ] Review Firestore security rules
- [ ] Review Storage security rules
- [ ] Enable Cloud Armor (optional)

### After Production
- [ ] Monitor API usage daily for first week
- [ ] Check for unauthorized access attempts
- [ ] Review error logs for security issues
- [ ] Update authorized domains if needed
- [ ] Regular security audits monthly

---

## 🧪 Testing API Restrictions

### Test 1: Authorized Domain Works

```bash
# Your production site should work normally
curl -X GET "https://grampanchayat-multi-tenant.web.app"
# ✅ Should return 200 OK
```

### Test 2: Unauthorized Domain Blocked

```bash
# Try accessing from unauthorized domain
curl -X POST "https://firestore.googleapis.com/v1/projects/YOUR_PROJECT/databases/(default)/documents/test" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Referer: https://malicious-site.com"
# ❌ Should return 403 Forbidden
```

### Test 3: Localhost Still Works (Development)

```bash
# During development
npm run dev
# ✅ Should work on localhost:5173
```

---

## 🔍 Monitoring & Alerts

### Firebase Console Alerts

**Enable Alerts For**:
- Unusual API usage spikes
- Quota approaching limits
- Security rule violations
- App Check failures

**Setup**:
1. Firebase Console → ⚙️ Settings → **Notifications**
2. Enable email/SMS alerts
3. Add team members

### Google Cloud Logging

**View Security Logs**:
```bash
# Using gcloud CLI
gcloud logging read "resource.type=firestore_database" \
  --limit 50 \
  --format json \
  --project grampanchayat-multi-tenant

# Filter for errors
gcloud logging read "severity>=ERROR" \
  --limit 50 \
  --project grampanchayat-multi-tenant
```

**Create Log-Based Alerts**:
1. Cloud Console → **Logging** → **Logs Explorer**
2. Create filter for suspicious activity
3. Click **Create Alert**
4. Set notification channels

---

## 🛠️ Environment Variables

### Development (.env)
```bash
# Firebase Config
VITE_FIREBASE_API_KEY=your_dev_api_key
VITE_FIREBASE_AUTH_DOMAIN=grampanchayat-multi-tenant.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=grampanchayat-multi-tenant
VITE_FIREBASE_STORAGE_BUCKET=grampanchayat-multi-tenant.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# App Check (optional for dev)
# VITE_RECAPTCHA_SITE_KEY=your_recaptcha_key

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_APP_CHECK=false
```

### Production (.env.production)
```bash
# Firebase Config (Production)
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=grampanchayat-multi-tenant.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=grampanchayat-multi-tenant
VITE_FIREBASE_STORAGE_BUCKET=grampanchayat-multi-tenant.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_production_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# App Check (REQUIRED for production)
VITE_RECAPTCHA_SITE_KEY=your_production_recaptcha_key

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_APP_CHECK=true
VITE_ENABLE_PERFORMANCE=true

# App Settings
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

---

## 🆘 Troubleshooting

### "API key not valid" Error

**Cause**: API key restrictions too strict

**Solution**:
1. Check domain is in authorized list
2. Verify protocol (http vs https)
3. Check for trailing slashes in URL patterns
4. Wait 5 minutes after making changes

### App Check Failures

**Cause**: reCAPTCHA not configured

**Solution**:
1. Verify `VITE_RECAPTCHA_SITE_KEY` is set
2. Check reCAPTCHA site key is valid
3. Ensure domain is authorized in reCAPTCHA console
4. Start with "Unenforced" mode first

### High API Usage

**Cause**: Inefficient queries or bot traffic

**Solution**:
1. Enable App Check to block bots
2. Optimize Firestore queries (use indexes)
3. Implement client-side caching
4. Add pagination to large queries
5. Use Cloud Functions for bulk operations

### Localhost Not Working

**Cause**: Forgot to add localhost to authorized domains

**Solution**:
Add to API key restrictions:
```
http://localhost:5173/*
http://localhost:4173/*
http://127.0.0.1:5173/*
```

---

## 📊 Security Metrics Dashboard

### Key Metrics to Monitor

**API Usage**:
- Requests per day
- Unique IP addresses
- Geographic distribution
- Error rates

**Authentication**:
- Login attempts (success/fail)
- Password reset requests
- Account lockouts
- MFA usage

**Firestore**:
- Read/write operations
- Security rule denials
- Slow queries
- Index usage

**Storage**:
- Upload/download bandwidth
- File operations
- Storage usage
- Access denials

### Create Custom Dashboard

```javascript
// Example: Log API metrics
import { recordMetric } from '../utils/performanceUtils';

// Track API call
recordMetric('api_requests', 1, {
  endpoint: '/schemes',
  method: 'GET',
  status: 200
});

// Track errors
recordMetric('api_errors', 1, {
  endpoint: '/schemes',
  error_code: 403,
  error_type: 'permission_denied'
});
```

---

## 📚 Additional Resources

- [Firebase API Key Best Practices](https://firebase.google.com/docs/projects/api-keys)
- [App Check Documentation](https://firebase.google.com/docs/app-check)
- [Cloud Armor Documentation](https://cloud.google.com/armor/docs)
- [Security Rules Reference](https://firebase.google.com/docs/rules)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)

---

## ✅ Quick Start Checklist

### Immediate Actions (Next 30 Minutes)
1. [ ] Go to Google Cloud Console
2. [ ] Find Browser API key
3. [ ] Add production domain to authorized list
4. [ ] Restrict to Firebase APIs only
5. [ ] Save and test

### Short Term (Next 24 Hours)
6. [ ] Set up App Check with reCAPTCHA
7. [ ] Test App Check in development
8. [ ] Enable usage alerts
9. [ ] Configure monitoring dashboard

### Long Term (Next Week)
10. [ ] Review security logs daily
11. [ ] Optimize API usage
12. [ ] Implement rate limiting
13. [ ] Regular security audits

---

**Status**: 🔧 Configuration Required
**Priority**: 🚨 HIGH (Before Production)
**Estimated Time**: 30-60 minutes
**Version**: 1.0.0
**Last Updated**: December 2024
