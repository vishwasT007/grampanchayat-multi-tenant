# 🌳 Git Branching Strategy - Gram Panchayat Multi-Tenant

## 📋 Branch Structure

We use a **Git Flow** model with the following branches:

```
main (production)
  ↑
staging (pre-production testing)
  ↑
develop (integration)
  ↑
feature/* (new features)
```

---

## 🎯 Branch Purposes

### 1. **`main`** - Production Branch
- **Purpose:** Live production code deployed to Firebase Hosting
- **Protected:** Yes (only merge via Pull Requests)
- **Deployments:** 
  - All 4 GP sites (pindkeparlodha, dongartal, katta, nawargaon)
  - Super Admin panel
- **Who can merge:** Project maintainer only
- **When to merge:** Only after thorough testing in staging

**URLs served from `main`:**
- https://gp-pindkeparlodha-wsye6o.web.app
- https://gp-dongartal.web.app
- https://gp-katta.web.app
- https://gp-nawargaon.web.app
- https://superadmin-grampanchayat.web.app

---

### 2. **`staging`** - Pre-Production Testing Branch
- **Purpose:** Test features in production-like environment before going live
- **Deployed to:** Staging Firebase project (if available) or test with `?tenant=test`
- **Who can merge:** Developers after feature testing
- **When to merge:** After features tested in `develop`

**Testing checklist before merging to `main`:**
- [ ] All features working correctly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] Performance acceptable
- [ ] SEO meta tags correct

---

### 3. **`develop`** - Integration Branch
- **Purpose:** Main development branch where features are integrated
- **Deployed to:** Local development server
- **Who can merge:** All developers
- **When to merge:** After feature branch is complete and tested locally

**Workflow:**
1. Create feature branch from `develop`
2. Work on feature
3. Test locally
4. Merge back to `develop`
5. Test integration with other features

---

### 4. **`feature/*`** - Feature Branches
- **Purpose:** Develop new features in isolation
- **Naming convention:** `feature/feature-name`
- **Examples:**
  - `feature/logo-upload`
  - `feature/grievance-module`
  - `feature/payment-gateway`
- **Lifespan:** Temporary (deleted after merge)
- **Base branch:** Created from `develop`

---

## 🔄 Complete Workflow

### **Adding a New Feature:**

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make changes, commit regularly
git add .
git commit -m "feat: Add feature description"

# 4. Push feature branch
git push -u origin feature/your-feature-name

# 5. When feature is complete, merge to develop
git checkout develop
git pull origin develop
git merge feature/your-feature-name
git push origin develop

# 6. Delete feature branch (cleanup)
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

### **Testing in Staging:**

```bash
# 1. Merge develop into staging
git checkout staging
git pull origin staging
git merge develop
git push origin staging

# 2. Deploy to staging environment
VITE_SUPER_ADMIN=true npm run build:superadmin
firebase deploy --only hosting:superadmin-staging  # If staging project exists

# 3. Test thoroughly in staging
# - Manual testing
# - Automated tests
# - User acceptance testing

# 4. If bugs found:
git checkout develop
# Fix bugs in develop or hotfix branches
# Re-merge to staging and test again
```

---

### **Deploying to Production:**

```bash
# 1. Merge staging into main (via Pull Request preferred)
git checkout main
git pull origin main
git merge staging
git push origin main

# 2. Deploy all sites
./deploy-all-gps.sh  # Deploy script

# 3. Tag the release
git tag -a v1.0.0 -m "Release v1.0.0: Logo feature, hosting URLs"
git push origin v1.0.0

# 4. Monitor production
# - Check all 4 GP sites
# - Check Super Admin
# - Monitor Firebase console for errors
```

---

### **Hotfix (Emergency Production Fix):**

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# 2. Fix the bug
git add .
git commit -m "hotfix: Fix critical production bug"

# 3. Merge to main
git checkout main
git merge hotfix/critical-bug-fix
git push origin main

# 4. Also merge to develop (to keep in sync)
git checkout develop
git merge hotfix/critical-bug-fix
git push origin develop

# 5. Deploy immediately
firebase deploy --only hosting:gp-nawargaon

# 6. Delete hotfix branch
git branch -d hotfix/critical-bug-fix
```

---

## 📝 Commit Message Convention

Use **Conventional Commits** format:

```
<type>: <description>

[optional body]
[optional footer]
```

### Types:
- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Formatting, missing semicolons, etc.
- **refactor:** Code restructuring
- **test:** Adding tests
- **chore:** Maintenance tasks

### Examples:
```bash
git commit -m "feat: Add logo upload to admin panel"
git commit -m "fix: Resolve tenant detection bug for custom domains"
git commit -m "docs: Update deployment instructions"
git commit -m "refactor: Simplify header component"
git commit -m "chore: Update dependencies"
```

---

## 🔒 Branch Protection Rules

### **For `main` branch:**
1. **Require pull request reviews** before merging
2. **Require status checks to pass** before merging
3. **Require linear history** (no merge commits)
4. **Do not allow force pushes**
5. **Do not allow deletions**

### **For `staging` branch:**
1. **Require pull request reviews** (optional)
2. **Do not allow force pushes**

### **For `develop` branch:**
1. Allow direct pushes (for quick iterations)
2. Encourage pull requests for major changes

---

## 📊 Visual Workflow

```
┌─────────────────────────────────────────────────┐
│  feature/logo-upload                            │
│  (Work on logo feature)                         │
└────────────────┬────────────────────────────────┘
                 │ merge
                 ↓
┌─────────────────────────────────────────────────┐
│  develop                                        │
│  (Integration, local testing)                   │
└────────────────┬────────────────────────────────┘
                 │ merge when ready
                 ↓
┌─────────────────────────────────────────────────┐
│  staging                                        │
│  (Pre-production testing, UAT)                  │
└────────────────┬────────────────────────────────┘
                 │ merge after approval
                 ↓
┌─────────────────────────────────────────────────┐
│  main                                           │
│  (Production - Live on Firebase)                │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Quick Reference Commands

### **Check current branch:**
```bash
git branch
```

### **Switch branches:**
```bash
git checkout develop
git checkout staging
git checkout main
```

### **Create new feature branch:**
```bash
git checkout develop
git checkout -b feature/new-feature
```

### **Update your branch with latest:**
```bash
git pull origin develop
```

### **See all branches:**
```bash
git branch -a
```

### **Delete local branch:**
```bash
git branch -d feature/old-feature
```

### **Delete remote branch:**
```bash
git push origin --delete feature/old-feature
```

---

## 📦 Deployment Commands per Branch

### **Develop (Local Testing):**
```bash
npm run dev  # Test locally
```

### **Staging (If staging project exists):**
```bash
# Build
npm run build:superadmin

# Deploy to staging
firebase use staging  # Switch to staging project
firebase deploy --only hosting
```

### **Main (Production):**
```bash
# Deploy all GPs
GP_ID=pindkeparlodha npm run build:gp && firebase deploy --only hosting:gp-pindkeparlodha-wsye6o
GP_ID=dongartal npm run build:gp && firebase deploy --only hosting:gp-dongartal
GP_ID=katta npm run build:gp && firebase deploy --only hosting:gp-katta
GP_ID=nawargaon npm run build:gp && firebase deploy --only hosting:gp-nawargaon

# Deploy Super Admin
VITE_SUPER_ADMIN=true npm run build:superadmin && firebase deploy --only hosting:superadmin
```

---

## ✅ Best Practices

1. **Always pull before starting work:**
   ```bash
   git pull origin develop
   ```

2. **Commit often with meaningful messages**

3. **Keep feature branches small and focused**

4. **Delete feature branches after merging**

5. **Never force push to `main` or `staging`**

6. **Test locally before pushing**

7. **Use Pull Requests for important changes**

8. **Tag releases in `main`:**
   ```bash
   git tag -a v1.1.0 -m "Release v1.1.0"
   git push origin v1.1.0
   ```

9. **Keep `develop` stable** - it should always be deployable

10. **Document breaking changes in commit messages**

---

## 🎯 Current Branch Status

| Branch | Status | Deployed To | Purpose |
|--------|--------|-------------|---------|
| `main` | ✅ Protected | **Production** (4 GPs + Super Admin) | Live code |
| `staging` | ✅ Active | Test environment | Pre-production testing |
| `develop` | ✅ Active | Local dev server | Feature integration |
| `feature/*` | Create as needed | Local only | New features |

---

## 📞 Need Help?

**Common Issues:**

**Q: I'm on the wrong branch!**
```bash
git stash  # Save your work
git checkout correct-branch
git stash pop  # Restore your work
```

**Q: I need to undo my last commit:**
```bash
git reset --soft HEAD~1  # Keeps changes
# or
git reset --hard HEAD~1  # Discards changes (careful!)
```

**Q: Merge conflict!**
```bash
# 1. Fix conflicts in files
# 2. Mark as resolved:
git add .
git commit -m "fix: Resolve merge conflict"
```

---

## 🎉 You're Ready!

Your Git workflow is now **production-ready** with proper branching strategy!

**Next steps:**
1. Create your first feature branch
2. Make changes
3. Test in develop
4. Promote to staging
5. Deploy to production

Happy coding! 🚀
