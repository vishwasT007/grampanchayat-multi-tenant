# 🛡️ Merge Conflict Prevention Checklist

Use this checklist **EVERY TIME** before merging to avoid conflicts!

---

## 📋 Daily Development Checklist

### ✅ Before Starting Work

```bash
□ git checkout develop
□ git pull origin develop
□ git checkout -b feature/your-feature-name
```

**Why?** Ensures you start with the latest code.

---

## 📋 Before Committing

### ✅ Check Your Changes

```bash
□ git status                    # See what changed
□ git diff                      # Review changes
□ npm run lint                  # Check for errors
□ npm run dev                   # Test locally
□ Test admin login works
□ Test all features affected
```

**Why?** Prevents committing broken code.

---

## 📋 Before Merging to develop

### ✅ Sync and Test

```bash
□ git checkout develop
□ git pull origin develop       # Get latest develop
□ git checkout feature/your-feature
□ git merge develop             # Bring develop into your feature
□ Resolve any conflicts NOW
□ npm run dev                   # Test after merge
□ Test all features work
□ git add .
□ git commit -m "merge: Sync with develop"
```

**Why?** Catches conflicts early in your feature branch.

### ✅ Merge Feature to develop

```bash
□ git checkout develop
□ git merge feature/your-feature
□ git push origin develop
□ Notify team about merge
```

**Why?** Clean merge with no conflicts.

---

## 📋 Before Merging develop → staging

### ✅ Pre-Staging Checklist

```bash
□ git checkout develop
□ git pull origin develop
□ All features tested locally
□ All team members aware
□ No known bugs in develop
```

### ✅ Merge to Staging

```bash
□ git checkout staging
□ git pull origin staging
□ git merge develop
□ Resolve any conflicts
□ git push origin staging
□ Test in staging environment
```

**Why?** Staging should be stable and ready for testing.

---

## 📋 Before Merging staging → main (Production)

### ✅ Pre-Production Checklist

```bash
□ All features tested in staging
□ No critical bugs
□ Team approval received
□ Backup plan ready
□ Deployment script tested
```

### ✅ Merge to Production

```bash
□ git checkout staging
□ git pull origin staging
□ git checkout main
□ git pull origin main
□ git merge staging
□ Resolve any conflicts (RARE if workflow followed)
□ git push origin main
□ ./deploy-all-production.sh
□ Monitor production deployment
□ Test all 4 GPs after deployment
□ Verify custom domains work
□ git tag -a v1.x.x -m "Release v1.x.x"
□ git push --tags
```

**Why?** Production must be stable and conflict-free.

---

## 🚨 If Conflicts Occur

### Step-by-Step Resolution

#### 1. Don't Panic!

Conflicts are normal. Just follow these steps:

#### 2. Understand the Conflict

```bash
git status
# Shows which files have conflicts
```

#### 3. Open Conflicted File

Look for conflict markers:

```javascript
<<<<<<< HEAD
// Your changes
const myCode = 'this';
=======
// Their changes
const myCode = 'that';
>>>>>>> develop
```

#### 4. Resolve the Conflict

**Option A**: Keep your changes
```javascript
const myCode = 'this';
```

**Option B**: Keep their changes
```javascript
const myCode = 'that';
```

**Option C**: Combine both
```javascript
const myCode = 'this-and-that';
```

**Remove conflict markers** (`<<<<<<<`, `=======`, `>>>>>>>`)

#### 5. Mark as Resolved

```bash
git add src/pages/Home.jsx  # Add resolved file
git status                   # Verify resolution
```

#### 6. Complete the Merge

```bash
git commit -m "fix: Resolve merge conflict in Home.jsx"
git push
```

#### 7. Test Everything

```bash
npm run dev
# Test all affected features
```

---

## 🎯 Conflict Prevention Strategies

### Strategy 1: Communicate

- **Tell team** what files you're working on
- **Avoid** working on same files simultaneously
- **Use** feature branches for isolated work

### Strategy 2: Sync Frequently

```bash
# Do this MULTIPLE times per day
git checkout develop
git pull origin develop
git checkout feature/your-feature
git merge develop
```

**Frequency**: Every 2-3 hours during active development

### Strategy 3: Small Commits

```bash
# GOOD: Small, focused commits
git commit -m "feat: Add logo upload button"
git commit -m "feat: Add logo preview"
git commit -m "feat: Connect logo to Firebase Storage"

# BAD: One huge commit
git commit -m "feat: Add entire logo feature with 50 changes"
```

**Why?** Easier to resolve conflicts in small changes.

### Strategy 4: Pull Before Push

```bash
# ALWAYS do this before pushing
git pull origin develop
git push origin develop
```

**Why?** Prevents creating divergent branches.

### Strategy 5: Test Before Merging

```bash
# Never skip this!
npm run dev
# Test everything
# Then merge
```

**Why?** Prevents merging broken code.

---

## 📊 Branch Protection Best Practices

### Recommended GitHub Settings

#### For `main` Branch:
- ✅ Require pull request reviews (at least 1)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

#### For `staging` Branch:
- ✅ Require status checks to pass
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

#### For `develop` Branch:
- ✅ Allow direct pushes (for flexibility)
- ✅ Do not allow force pushes
- ✅ Do not allow deletions

---

## 🔄 Weekly Sync Routine

### Every Monday Morning:

```bash
# 1. Update all local branches
git checkout main
git pull origin main

git checkout staging  
git pull origin staging

git checkout develop
git pull origin develop

# 2. Verify they're in sync
git log main..staging    # Should be empty
git log staging..develop # Should show develop commits

# 3. Clean up old feature branches
git branch -d feature/old-completed-feature
```

---

## 📝 Commit Message Convention

Follow this to make merge history cleaner:

```bash
# Feature
git commit -m "feat: Add user authentication"

# Bug fix
git commit -m "fix: Resolve login redirect issue"

# Documentation
git commit -m "docs: Update README with setup instructions"

# Refactor
git commit -m "refactor: Simplify tenant detection logic"

# Merge
git commit -m "merge: Sync feature/logo with develop"

# Conflict resolution
git commit -m "fix: Resolve merge conflict in Home.jsx"
```

---

## 🎓 Common Conflict Scenarios

### Scenario 1: Same Line Modified

**Situation**: You and teammate edit line 50 of `Home.jsx`

**Prevention**:
- Communicate who's working on what
- Use different components/files when possible
- Merge frequently

**Resolution**:
- Review both changes
- Decide which is correct
- Or combine both

---

### Scenario 2: File Renamed vs Modified

**Situation**: You rename `Header.jsx` to `Navigation.jsx`, teammate modifies `Header.jsx`

**Prevention**:
- Announce file renames in team chat
- Do renames in separate commits
- Merge immediately after rename

**Resolution**:
- Git usually handles this automatically
- If not, manually move changes to new filename

---

### Scenario 3: Package.json Conflicts

**Situation**: Different dependencies added by different developers

**Prevention**:
- Coordinate dependency additions
- Document new dependencies
- Merge package.json changes quickly

**Resolution**:
```bash
# Accept both sets of dependencies
# Combine the dependencies sections
# Run npm install to verify
npm install
```

---

## 🎯 Quick Reference

### Before Every Merge

```bash
git checkout develop && git pull origin develop
git checkout your-branch && git merge develop
# Resolve conflicts if any
# Test everything
git checkout develop && git merge your-branch
```

### Daily Routine

```bash
# Morning
git checkout develop && git pull origin develop

# During work (every 2-3 hours)
git checkout develop && git pull origin develop
git checkout your-feature && git merge develop

# Before going home
git add . && git commit -m "feat: Your changes"
git push origin your-feature
```

### Weekly Cleanup

```bash
# Delete merged feature branches
git branch --merged develop | grep -v "develop\|staging\|main" | xargs git branch -d

# Update all branches
git checkout main && git pull origin main
git checkout staging && git pull origin staging  
git checkout develop && git pull origin develop
```

---

## ✅ Success Indicators

You're doing it right if:

- ✅ You pull before starting work EVERY TIME
- ✅ You merge develop into feature frequently
- ✅ You test before merging
- ✅ You communicate with team
- ✅ Conflicts are rare and small
- ✅ Production deployments are smooth

---

## 🚩 Warning Signs

Watch out if:

- 🚩 You get conflicts frequently
- 🚩 Conflicts affect many files
- 🚩 You skip testing before merging
- 🚩 You force push to shared branches
- 🚩 Team members complain about broken code

**Solution**: Follow this checklist more strictly!

---

## 📞 Emergency: Big Conflict

If you encounter a massive conflict:

```bash
# 1. DON'T PANIC
# 2. Abort the merge
git merge --abort

# 3. Talk to team
# "Hey, I'm getting conflicts merging develop. Can we sync up?"

# 4. Sync together
# With team on call, resolve conflicts together

# 5. Or start fresh
git checkout develop
git pull origin develop
git checkout -b feature/name-v2
# Re-apply your changes carefully
```

---

Remember: **Prevention is better than resolution!** 🛡️

Follow this checklist religiously, and conflicts will be rare and manageable.
