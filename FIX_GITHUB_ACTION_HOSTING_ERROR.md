# Fix: Firebase Hosting Site Not Found Error in GitHub Actions

## Problem

GitHub Action fails with:
```
Error: Request to https://firebasehosting.googleapis.com/v1beta1/projects/-/sites/pindkepar-lodha/versions had HTTP Error: 404, Requested entity was not found.
```

**Root Cause:** The Firebase hosting site doesn't exist yet and the GitHub Action can't create it using token authentication.

---

## Solution Options

### Option 1: Create Site Manually (QUICKEST)

Run this command locally:

```bash
firebase hosting:sites:create pindkepar-lodha
```

Then configure the target:

```bash
firebase target:apply hosting pindkepar-lodha pindkepar-lodha
```

Then retry the GitHub Action - it should work!

---

### Option 2: Use Service Account (RECOMMENDED for production)

This is the proper long-term solution.

#### Step 1: Create Service Account

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=grampanchayat-multi-tenant

2. Click **"Create Service Account"**

3. Fill in:
   - Name: `github-actions-deployer`
   - Description: `Service account for GitHub Actions deployments`
   - Click **"Create and Continue"**

4. Grant roles:
   - **Firebase Hosting Admin** (for hosting deployments)
   - **Cloud Functions Developer** (if deploying functions)
   - **Service Account User**
   - Click **"Continue"** then **"Done"**

#### Step 2: Generate Key

1. Click on the service account you just created

2. Go to **"Keys"** tab

3. Click **"Add Key"** → **"Create new key"**

4. Select **JSON** format

5. Click **"Create"** - a JSON file will download

#### Step 3: Add to GitHub Secrets

1. Go to: https://github.com/vishwasT007/grampanchayat-multi-tenant/settings/secrets/actions

2. Click **"New repository secret"**

3. Name: `FIREBASE_SERVICE_ACCOUNT`

4. Value: Copy the ENTIRE contents of the downloaded JSON file

5. Click **"Add secret"**

#### Step 4: Update GitHub Workflow

Update `.github/workflows/deploy-gp.yml`:

```yaml
# OLD (token-based, deprecated):
- name: Create Firebase hosting site (if not exists)
  env:
    FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
  run: |
    GP_SUBDOMAIN="${{ steps.get_subdomain.outputs.subdomain }}"
    firebase hosting:sites:create "$GP_SUBDOMAIN" --token "$FIREBASE_TOKEN" 2>&1 || echo "Site may already exist"

# NEW (service account-based):
- name: Authenticate with Firebase
  uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}

- name: Create Firebase hosting site (if not exists)
  run: |
    GP_SUBDOMAIN="${{ steps.get_subdomain.outputs.subdomain }}"
    firebase hosting:sites:create "$GP_SUBDOMAIN" 2>&1 || echo "Site may already exist"
```

Replace ALL instances of `--token "$FIREBASE_TOKEN"` with nothing (authentication happens automatically with service account).

---

## Quick Fix Right Now

**For immediate testing, do Option 1:**

```bash
# In your local terminal:
firebase hosting:sites:create pindkepar-lodha
firebase target:apply hosting pindkepar-lodha pindkepar-lodha

# Then go to GitHub and re-run the failed action
```

**For production, implement Option 2** (service account authentication).

---

## Why This Happens

1. When you create a GP in Super Admin, the Cloud Function triggers the GitHub Action
2. The GitHub Action tries to create a new Firebase hosting site
3. The `firebase hosting:sites:create` command needs Firebase Admin API access
4. Token authentication (`--token`) has limited permissions for creating sites
5. Service account authentication has full permissions

---

## Verification

After creating the site, check it exists:

```bash
firebase hosting:sites:list
```

You should see:
```
┌───────────────┬─────────────────────────────────────┬──────────────┐
│ Site ID       │ Default URL                         │ App ID       │
├───────────────┼─────────────────────────────────────┼──────────────┤
│ pindkepar-lodha│ https://pindkepar-lodha.web.app    │              │
└───────────────┴─────────────────────────────────────┴──────────────┘
```

---

## Next Steps

1. ✅ Create the hosting site (Option 1 - quick)
2. ✅ Re-run the GitHub Action
3. 🔄 Implement service account (Option 2 - for future)
4. ✅ Test complete automation workflow

---

**Let me know if you want me to:**
- Run the commands to create the site now
- Update the workflow to use service account
- Both!
