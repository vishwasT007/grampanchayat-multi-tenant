# 🚀 Local Development Guide

Complete guide for working locally on the `develop` branch and avoiding merge conflicts.

---

## 📋 Table of Contents
1. [Environment Setup](#environment-setup)
2. [Login Credentials](#login-credentials)
3. [Local Development Workflow](#local-development-workflow)
4. [Testing Locally](#testing-locally)
5. [Avoiding Merge Conflicts](#avoiding-merge-conflicts)
6. [Common Issues & Solutions](#common-issues--solutions)

---

## 🔧 Environment Setup

### Current Environment Status
✅ **Node.js**: v22.20.0  
✅ **npm**: 10.9.3  
✅ **Firebase CLI**: 14.17.0  
✅ **Project**: grampanchayat-multi-tenant  
✅ **Current Branch**: develop

### Prerequisites Installed
All required tools are already installed and configured!

---

## 🔐 Login Credentials

### For Local Development & Testing

#### Admin Panel Login (Pindkepar GP)
```
URL:      http://localhost:5173/admin/login
Email:    admin@pindkepar.in
Password: Admin@123456
Tenant:   pindkepar
Role:     superAdmin
```

#### Super Admin Panel Login
```
URL:      http://localhost:5174/superadmin/login
Email:    admin@pindkepar.in
Password: Admin@123456
Role:     superAdmin (Global)
```

⚠️ **IMPORTANT**: These are the same credentials for both panels. The role determines access level.

### Testing Other GPs Locally

You can test other GPs by adding the tenant query parameter:

```
Pindkepar:   http://localhost:5173/?tenant=pindkepar
Dongartal:   http://localhost:5173/?tenant=dongartal
Katta:       http://localhost:5173/?tenant=katta
Nawargaon:   http://localhost:5173/?tenant=nawargaon
```

**Note**: You'll need to create admin users for other GPs if you want to test their admin panels.

---

## 💻 Local Development Workflow

### 1. Starting Your Development Session

```bash
# Make sure you're on develop branch
git checkout develop

# Pull latest changes from GitHub
git pull origin develop

# Install/update dependencies (if needed)
npm install

# Start local development server
npm run dev
```

**Output**: Server starts at `http://localhost:5173`

### 2. For Super Admin Development

```bash
# Start Super Admin in separate terminal
npm run dev:superadmin
```

**Output**: Super Admin starts at `http://localhost:5174`

### 3. Working on a New Feature

```bash
# Create feature branch from develop
git checkout -b feature/your-feature-name

# Make your changes...
# Edit files, test locally

# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: Add your feature description"

# Push feature branch to GitHub
git push -u origin feature/your-feature-name
```

### 4. Available npm Scripts

```bash
# Development
npm run dev                    # Start GP site (port 5173)
npm run dev:superadmin        # Start Super Admin (port 5174)

# Building
npm run build                 # Build GP site
npm run build:superadmin      # Build Super Admin
npm run build:all            # Build both

# Deployment (from develop - only for testing)
npm run deploy:gp            # Deploy GP site only
npm run deploy:superadmin    # Deploy Super Admin only
npm run deploy:all          # Deploy everything

# Linting
npm run lint                 # Check code quality
```

---

## 🧪 Testing Locally

### Step-by-Step Local Testing Guide

#### 1. Start Development Server

```bash
npm run dev
```

Wait for: `➜  Local:   http://localhost:5173/`

#### 2. Test Homepage

1. Open: `http://localhost:5173/`
2. **Should see**: Homepage with logo in hero section
3. **Check**: 
   - Logo displays (if uploaded)
   - Site settings load correctly
   - Language toggle works
   - Navigation works

#### 3. Test Admin Login

1. Open: `http://localhost:5173/admin/login`
2. Enter credentials:
   ```
   Email:    admin@pindkepar.in
   Password: Admin@123456
   ```
3. Click **Login**
4. **Should see**: Admin dashboard

#### 4. Test Admin Features

Once logged in, test:

**Site Settings**:
- Navigate to Admin → Site Settings
- Try uploading a logo (will save to Firebase Storage)
- Check favicon updates
- Verify bilingual fields work

**Announcements**:
- Create new announcement
- Edit existing announcement
- Delete announcement

**Members**:
- View members list
- Add new member
- Edit member details

**Schemes**:
- Browse schemes
- Add new scheme
- Edit scheme

**Downloads**:
- Add new document
- Test file uploads
- Verify downloads work

#### 5. Test Super Admin (if needed)

```bash
# In separate terminal
npm run dev:superadmin
```

1. Open: `http://localhost:5174/superadmin/login`
2. Login with same credentials
3. Test GP management features

### Testing Different Tenants

```bash
# Test Pindkepar
http://localhost:5173/?tenant=pindkepar

# Test Dongartal
http://localhost:5173/?tenant=dongartal

# Test Katta
http://localhost:5173/?tenant=katta

# Test Nawargaon
http://localhost:5173/?tenant=nawargaon
```

**Each should load different GP data from Firestore!**

---

## 🔄 Avoiding Merge Conflicts

### The Golden Rules

#### 1. **ALWAYS Sync Before Starting Work**

```bash
# Switch to develop
git checkout develop

# Pull latest changes
git pull origin develop

# Now create your feature branch
git checkout -b feature/new-feature
```

#### 2. **Keep develop Up-to-Date**

```bash
# Do this DAILY before starting work
git checkout develop
git pull origin develop
git checkout feature/your-feature
git merge develop  # Bring develop changes into your feature
```

#### 3. **Before Merging to develop**

```bash
# Update your feature branch with latest develop
git checkout develop
git pull origin develop
git checkout feature/your-feature
git merge develop

# Resolve any conflicts NOW (in feature branch)
# Test everything works

# Then merge to develop
git checkout develop
git merge feature/your-feature
git push origin develop
```

#### 4. **Before Merging develop to staging**

```bash
# Make sure develop is up-to-date
git checkout develop
git pull origin develop

# Switch to staging and merge
git checkout staging
git pull origin staging
git merge develop

# Test thoroughly in staging environment

# Push to GitHub
git push origin staging
```

#### 5. **Before Merging staging to main (Production)**

```bash
# Update staging
git checkout staging
git pull origin staging

# Switch to main
git checkout main
git pull origin main

# Merge staging into main
git merge staging

# Push to production
git push origin main

# Deploy to production
./deploy-all-production.sh
```

### Workflow Summary

```
feature/new-feature → develop → staging → main (production)
     (daily)          (weekly)  (release)  (deploy)
```

---

## 🎯 Complete Development Workflow Example

Let's say you want to add a new feature: "Add contact form to homepage"

### Step 1: Start Fresh

```bash
# Make sure you're synced
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/contact-form
```

### Step 2: Develop Locally

```bash
# Start dev server
npm run dev

# Open http://localhost:5173
# Make your changes to files
# Test in browser as you code
```

### Step 3: Test Admin Panel

```bash
# Login at http://localhost:5173/admin/login
# Email: admin@pindkepar.in
# Password: Admin@123456

# Test your feature with admin functionality
```

### Step 4: Commit Your Work

```bash
# Check what changed
git status

# Stage files
git add src/pages/Home.jsx
git add src/components/ContactForm.jsx

# Commit with good message
git commit -m "feat: Add contact form to homepage

- Create ContactForm component
- Add form validation
- Connect to Firestore
- Add bilingual support"

# Push feature branch
git push -u origin feature/contact-form
```

### Step 5: Merge to develop

```bash
# First, get latest develop changes
git checkout develop
git pull origin develop

# Go back to your feature
git checkout feature/contact-form

# Merge develop into your feature (to catch conflicts early)
git merge develop

# If conflicts, resolve them now
# Test everything works

# Now merge your feature to develop
git checkout develop
git merge feature/contact-form

# Push to GitHub
git push origin develop
```

### Step 6: Test in Staging (When Ready)

```bash
# Merge develop to staging
git checkout staging
git pull origin staging
git merge develop
git push origin staging

# Test on staging environment
```

### Step 7: Deploy to Production (When Approved)

```bash
# Merge staging to main
git checkout main
git pull origin main
git merge staging
git push origin main

# Run automated deployment
./deploy-all-production.sh
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: Port Already in Use

**Error**: `Port 5173 is already in use`

**Solution**:
```bash
# Find and kill process
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Issue 2: Firebase Not Connected

**Error**: `Firebase: Error (auth/network-request-failed)`

**Solution**:
```bash
# Check internet connection
# Check Firebase project is active
firebase projects:list

# Re-login to Firebase
firebase login
```

### Issue 3: Admin Login Not Working

**Symptoms**: Can't login with admin@pindkepar.in

**Solution**:
```bash
# Re-create admin user
node create-admin-user.js

# Use credentials from output
```

### Issue 4: Merge Conflicts

**Error**: `CONFLICT (content): Merge conflict in src/pages/Home.jsx`

**Solution**:
```bash
# Open the file in VS Code
# Look for conflict markers:
<<<<<<< HEAD
your changes
=======
their changes
>>>>>>> develop

# Decide which to keep or combine both
# Remove conflict markers
# Save file

# Mark as resolved
git add src/pages/Home.jsx
git commit -m "fix: Resolve merge conflict in Home.jsx"
```

### Issue 5: Changes Not Showing

**Symptoms**: Made changes but not visible in browser

**Solution**:
```bash
# Hard refresh in browser
Ctrl + Shift + R (Linux/Windows)
Cmd + Shift + R (Mac)

# Or clear cache and restart dev server
npm run dev
```

### Issue 6: Build Fails

**Error**: Build errors during `npm run build`

**Solution**:
```bash
# Check for linting errors
npm run lint

# Fix errors
# Then rebuild
npm run build
```

---

## 📝 Best Practices

### DO ✅

1. **Always pull before starting work**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Use feature branches**
   ```bash
   git checkout -b feature/descriptive-name
   ```

3. **Commit frequently with good messages**
   ```bash
   git commit -m "feat: Add user authentication"
   ```

4. **Test locally before pushing**
   ```bash
   npm run dev
   # Test everything
   git push
   ```

5. **Keep develop and staging clean**
   - Only merge tested features
   - Don't commit broken code

6. **Use conventional commits**
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `refactor:` for code refactoring
   - `test:` for tests
   - `chore:` for maintenance

### DON'T ❌

1. **Don't work directly on main**
   ```bash
   # WRONG
   git checkout main
   # make changes...
   ```

2. **Don't force push to shared branches**
   ```bash
   # WRONG
   git push -f origin develop
   ```

3. **Don't merge without testing**
   ```bash
   # WRONG
   git merge feature/untested
   ```

4. **Don't commit node_modules or dist**
   ```bash
   # These are in .gitignore already
   ```

5. **Don't skip git pull**
   ```bash
   # WRONG - start work without pulling
   git checkout -b feature/new  # might be outdated!
   ```

---

## 🔑 Quick Reference

### Essential Commands

```bash
# Daily workflow
git checkout develop && git pull origin develop
npm run dev

# Create feature
git checkout -b feature/name

# Commit
git add .
git commit -m "feat: description"
git push -u origin feature/name

# Merge to develop
git checkout develop
git merge feature/name
git push origin develop

# Test in staging
git checkout staging
git merge develop
git push origin staging

# Deploy to production
git checkout main
git merge staging
git push origin main
./deploy-all-production.sh
```

### Login Credentials Quick Access

```
Local GP Admin:
URL:      http://localhost:5173/admin/login
Email:    admin@pindkepar.in
Password: Admin@123456

Local Super Admin:
URL:      http://localhost:5174/superadmin/login
Email:    admin@pindkepar.in
Password: Admin@123456
```

### Port Reference

```
5173 - GP Site (npm run dev)
5174 - Super Admin (npm run dev:superadmin)
```

---

## 📞 Need Help?

### Useful Commands for Debugging

```bash
# Check current branch
git branch

# Check which files changed
git status

# Check recent commits
git log --oneline -10

# Check remote connections
git remote -v

# Check Firebase project
firebase projects:list

# Check what's running on ports
lsof -i :5173
lsof -i :5174

# Check Node/npm versions
node --version
npm --version
```

---

## 🎉 You're Ready!

Your local development environment is fully set up. Here's what to do next:

1. **Start developing**:
   ```bash
   git checkout develop
   npm run dev
   ```

2. **Login and test**:
   - Open: http://localhost:5173/admin/login
   - Email: admin@pindkepar.in
   - Password: Admin@123456

3. **Make changes, test, commit, push!**

4. **Follow the workflow to avoid conflicts**

Happy coding! 🚀
