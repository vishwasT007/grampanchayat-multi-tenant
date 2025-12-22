# 🚀 FULL AUTOMATION SETUP GUIDE
**Setup Cloud Functions for 100% Automated GP Deployment**

---

## ⚡ What This Does

After this setup, creating a new GP in SuperAdmin will **automatically**:
1. ✅ Create GP in Firestore
2. ✅ Trigger GitHub Actions workflow
3. ✅ Deploy Firebase hosting site
4. ✅ Create Firebase Auth admin user
5. ✅ Update domain status to "active"

**NO MANUAL STEPS REQUIRED!**

---

## 📋 Prerequisites

- Firebase project: `grampanchayat-multi-tenant`
- GitHub repository: `vishwasT007/grampanchayat-multi-tenant`
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase **Blaze Plan** (pay-as-you-go, required for Cloud Functions)

---

## 🔑 STEP 1: Create GitHub Personal Access Token

### 1.1 Go to GitHub Settings
```
https://github.com/settings/tokens/new
```

### 1.2 Configure Token
- **Note**: `Firebase Cloud Functions - GP Auto Deployment`
- **Expiration**: `No expiration` (or 1 year)
- **Scopes**: Select these checkboxes:
  - ✅ `repo` (Full control of private repositories)
  - ✅ `workflow` (Update GitHub Action workflows)

### 1.3 Generate Token
1. Click **"Generate token"** button at bottom
2. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)
3. It should look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 1.4 Save Token Securely
```bash
# Save to a temporary file (we'll use it in next step)
echo "ghp_YOUR_TOKEN_HERE" > ~/github-token-temp.txt
chmod 600 ~/github-token-temp.txt
```

---

## 🔧 STEP 2: Set Up Firebase Functions Environment

### 2.1 Login to Firebase
```bash
cd /home/vishwas/Music/grampanchayat-pindkepar-lodha/grampanchayat
firebase login
```

### 2.2 Set Environment Variables
```bash
# Read your token
GITHUB_TOKEN=$(cat ~/github-token-temp.txt)

# Set Firebase Functions environment variables
firebase functions:secrets:set GITHUB_TOKEN --project grampanchayat-multi-tenant

# When prompted, paste your GitHub token and press Enter
```

**Alternative method (if above doesn't work):**
```bash
# Use Firebase Functions config
firebase functions:config:set github.token="YOUR_GITHUB_TOKEN_HERE" --project grampanchayat-multi-tenant
firebase functions:config:set github.owner="vishwasT007" --project grampanchayat-multi-tenant
firebase functions:config:set github.repo="grampanchayat-multi-tenant" --project grampanchayat-multi-tenant
```

### 2.3 Verify Configuration
```bash
# Check secrets
firebase functions:secrets:access GITHUB_TOKEN --project grampanchayat-multi-tenant

# OR check config
firebase functions:config:get --project grampanchayat-multi-tenant
```

---

## 💳 STEP 3: Upgrade to Firebase Blaze Plan

### 3.1 Why Blaze Plan?
- Cloud Functions require Blaze (pay-as-you-go) plan
- **FREE TIER INCLUDED**: 2M invocations/month, 400K GB-seconds/month
- For this project: **Estimated cost: $0-1/month** (well within free tier)

### 3.2 Upgrade via Firebase Console
```bash
# Open Firebase Console
https://console.firebase.google.com/project/grampanchayat-multi-tenant/overview

# OR use CLI to open
firebase open --project grampanchayat-multi-tenant
```

**Steps in Console:**
1. Click ⚙️ **Settings** (gear icon)
2. Click **Usage and billing**
3. Click **Modify plan**
4. Select **Blaze plan**
5. Add payment method (credit/debit card)
6. Confirm upgrade

### 3.3 Set Budget Alert (Optional but Recommended)
1. In Firebase Console → Usage and billing
2. Click **Set budget**
3. Set budget: `$5/month`
4. Set alert threshold: `50%` ($2.50)
5. You'll get email alerts if costs approach limit

---

## 🚀 STEP 4: Deploy Cloud Functions

### 4.1 Check Functions Code
```bash
# Make sure functions/index.js exists
cat functions/index.js | head -50
```

### 4.2 Install Dependencies
```bash
cd functions
npm install
cd ..
```

### 4.3 Deploy Functions
```bash
# Deploy only Cloud Functions (not hosting)
firebase deploy --only functions --project grampanchayat-multi-tenant
```

**Expected Output:**
```
✔  functions[onGPCreated(us-central1)] Successful create operation.
✔  functions[onGPDeleted(us-central1)] Successful create operation.

✔  Deploy complete!
```

### 4.4 Verify Deployment
```bash
# List deployed functions
firebase functions:list --project grampanchayat-multi-tenant
```

**You should see:**
- ✅ `onGPCreated`
- ✅ `onGPDeleted`

---

## 🧪 STEP 5: Test Full Automation

### 5.1 Trigger Automation for Pending Dongartal GP
The Cloud Function should detect the existing Dongartal GP and trigger deployment automatically!

**Check Cloud Function Logs:**
```bash
# Watch logs in real-time
firebase functions:log --project grampanchayat-multi-tenant --follow
```

### 5.2 Manually Trigger for Dongartal (If Needed)
If the function didn't auto-detect the pending GP, update it to trigger the function:

```bash
# Run this script to update Dongartal and trigger the function
node << 'EOF'
const admin = require('firebase-admin');
const serviceAccount = require('./functions/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function triggerDongartal() {
  const gpRef = db.collection('globalConfig').doc('metadata').collection('gramPanchayats').doc('dongartal');
  
  // Update to trigger the onCreate function
  await gpRef.update({
    triggerDeploy: true,
    updatedAt: admin.firestore.Timestamp.now()
  });
  
  console.log('✅ Dongartal GP updated - Cloud Function should trigger now!');
  process.exit(0);
}

triggerDongartal().catch(console.error);
EOF
```

### 5.3 Monitor Progress

**1. Check GitHub Actions:**
```
https://github.com/vishwasT007/grampanchayat-multi-tenant/actions
```

**2. Check Cloud Function Logs:**
```bash
firebase functions:log --project grampanchayat-multi-tenant --limit 50
```

**3. Check Firestore:**
```
https://console.firebase.google.com/project/grampanchayat-multi-tenant/firestore
→ globalConfig/metadata/gramPanchayats/dongartal
→ domainStatus should change from "pending" to "active"
```

### 5.4 Create a Test GP to Verify

**Option A: Via SuperAdmin UI**
1. Go to SuperAdmin → Create GP
2. Create a test GP (e.g., "TestVillage")
3. Watch the magic happen! 🎉

**Option B: Via Script**
```bash
node << 'EOF'
const admin = require('firebase-admin');
const serviceAccount = require('./functions/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createTestGP() {
  const gpData = {
    id: 'testvillage',
    name: 'Test Village',
    nameMarathi: 'टेस्ट गाव',
    domain: 'gp-testvillage.web.app',
    subdomain: 'gp-testvillage',
    domainStatus: 'pending',
    active: true,
    adminEmail: 'admin@testvillage.in',
    adminPassword: 'Test@123456',
    adminName: 'Test Admin',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  };
  
  await db.collection('globalConfig').doc('metadata').collection('gramPanchayats').doc('testvillage').set(gpData);
  
  console.log('✅ Test GP created! Watch it deploy automatically!');
  console.log('GitHub Actions: https://github.com/vishwasT007/grampanchayat-multi-tenant/actions');
  process.exit(0);
}

createTestGP().catch(console.error);
EOF
```

---

## ✅ VERIFICATION CHECKLIST

After setup, verify everything works:

- [ ] GitHub Personal Access Token created
- [ ] Token saved to Firebase Functions secrets
- [ ] Firebase upgraded to Blaze plan
- [ ] Cloud Functions deployed successfully
- [ ] Functions visible in Firebase Console
- [ ] Dongartal GP deployment triggered (check GitHub Actions)
- [ ] Test GP created and deployed automatically
- [ ] domainStatus changes from "pending" to "active"
- [ ] Admin can login at new GP domain

---

## 🎯 SUCCESS CRITERIA

**You know automation is working when:**

1. ✅ Create GP in SuperAdmin UI
2. ✅ Within 10 seconds → GitHub Actions workflow starts automatically
3. ✅ Within 3 minutes → Deployment completes
4. ✅ Domain status updates to "active" automatically
5. ✅ Admin can login immediately at new domain

**NO MANUAL STEPS!** 🎉

---

## 🔧 TROUBLESHOOTING

### Issue: Cloud Function not triggering

**Check Logs:**
```bash
firebase functions:log --project grampanchayat-multi-tenant --limit 100
```

**Common Issues:**
1. **"Bad credentials"** → GitHub token not set correctly
   ```bash
   firebase functions:secrets:set GITHUB_TOKEN --project grampanchayat-multi-tenant
   ```

2. **"Function not deployed"** → Redeploy
   ```bash
   firebase deploy --only functions --project grampanchayat-multi-tenant --force
   ```

3. **"Not on Blaze plan"** → Upgrade plan (see Step 3)

### Issue: GitHub Actions not starting

**Verify Token Permissions:**
- Token must have `repo` and `workflow` scopes
- Token must not be expired
- Repository must be `vishwasT007/grampanchayat-multi-tenant`

**Test Token Manually:**
```bash
curl -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/vishwasT007/grampanchayat-multi-tenant/actions/workflows
```

### Issue: Deployment fails

**Check Workflow Logs:**
```
https://github.com/vishwasT007/grampanchayat-multi-tenant/actions
```

**Common Fixes:**
- Ensure Firebase token is set in GitHub Secrets
- Check `firebase.json` is committed
- Verify `deploy-gp.yml` workflow file exists

---

## 💰 COST ESTIMATE

**Firebase Blaze Plan (Pay-as-you-go):**

| Resource | Free Tier | Your Usage | Est. Cost |
|----------|-----------|------------|-----------|
| Cloud Functions Invocations | 2M/month | ~1000/month | $0 |
| Cloud Functions GB-seconds | 400K/month | ~500/month | $0 |
| Firestore Reads | 50K/day | ~100/day | $0 |
| Firestore Writes | 20K/day | ~50/day | $0 |
| Hosting Bandwidth | 10GB/month | ~1GB/month | $0 |

**TOTAL ESTIMATED COST: $0-1/month** ✅

*Well within free tier! You'll only pay if you create 100+ GPs per month.*

---

## 📚 WHAT HAPPENS BEHIND THE SCENES

### When you create a GP in SuperAdmin:

```
1. SuperAdmin UI
   └─> Firestore: Create GP document
       └─> Cloud Function: onGPCreated() triggered
           └─> GitHub API: Trigger repository_dispatch event
               └─> GitHub Actions: deploy-gp.yml workflow starts
                   └─> Firebase Hosting: Deploy new site
                   └─> Firebase Auth: Create admin user
                   └─> Firestore: Update domainStatus to "active"
                   └─> DONE! ✅
```

**Timeline:**
- 0s: GP created in SuperAdmin
- 2s: Cloud Function executes
- 5s: GitHub Actions workflow starts
- 3min: Site deployed, admin created
- 3min 10s: Status updated to "active"

**Total Time: ~3 minutes** (fully automated!)

---

## 🎉 FINAL NOTES

After this setup:
- **100% Automation** ✅
- **Zero Manual Steps** ✅
- **Real-time Updates** ✅
- **Cost: ~$0/month** ✅

**You can now:**
1. Create unlimited GPs via SuperAdmin
2. Each GP deploys automatically in ~3 minutes
3. Monitor progress in GitHub Actions
4. Admin can login immediately after deployment

**No more manual triggers!** 🚀

---

## 🆘 NEED HELP?

**Check Status:**
```bash
# Cloud Functions logs
firebase functions:log --project grampanchayat-multi-tenant --follow

# GitHub Actions
https://github.com/vishwasT007/grampanchayat-multi-tenant/actions

# Firebase Console
https://console.firebase.google.com/project/grampanchayat-multi-tenant
```

**Quick Fix Script:**
```bash
# Re-deploy everything
cd /home/vishwas/Music/grampanchayat-pindkepar-lodha/grampanchayat
firebase deploy --only functions --project grampanchayat-multi-tenant --force
```

---

**Ready to set this up? Let's do it! 🚀**
