# 🎯 Local Development - Quick Start Summary

You're all set up on the `develop` branch! Here's everything you need to know.

---

## 🚀 Quick Start (30 seconds)

```bash
# Start development with automated script
./start-dev.sh
```

**That's it!** The script will:
- ✅ Check you're on develop branch
- ✅ Pull latest changes
- ✅ Show login credentials
- ✅ Start the dev server

---

## 🔐 Login Credentials

### Local Admin Panel
```
URL:      http://localhost:5173/admin/login
Email:    admin@pindkepar.in
Password: Admin@123456
```

### Local Super Admin
```
URL:      http://localhost:5174/superadmin/login
Email:    admin@pindkepar.in
Password: Admin@123456
```

---

## 📚 Full Documentation

### Main Guides
1. **[LOCAL_DEVELOPMENT_GUIDE.md](./LOCAL_DEVELOPMENT_GUIDE.md)** - Complete setup and workflow guide
2. **[CONFLICT_PREVENTION_CHECKLIST.md](./CONFLICT_PREVENTION_CHECKLIST.md)** - Avoid merge conflicts
3. **[GIT_WORKFLOW.md](./GIT_WORKFLOW.md)** - Git branching strategy

---

## 🔄 Daily Workflow

### Morning Routine
```bash
git checkout develop
git pull origin develop
npm run dev
```

### Working on Feature
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes, test locally
npm run dev

# Commit
git add .
git commit -m "feat: Add my feature"

# Push
git push -u origin feature/my-feature
```

### Merging to develop
```bash
# Sync first
git checkout develop
git pull origin develop

# Merge develop into your feature (catch conflicts early)
git checkout feature/my-feature
git merge develop

# Test everything works
npm run dev

# Merge to develop
git checkout develop
git merge feature/my-feature
git push origin develop
```

---

## ⚠️ Conflict Prevention Rules

**ALWAYS:**
1. ✅ Pull before starting work
2. ✅ Create feature branches
3. ✅ Merge develop into feature regularly
4. ✅ Test before merging
5. ✅ Communicate with team

**NEVER:**
1. ❌ Work directly on main
2. ❌ Force push to shared branches
3. ❌ Skip testing
4. ❌ Merge untested code
5. ❌ Ignore conflicts

---

## 🎯 Merge Path

```
feature/your-feature → develop → staging → main (production)
     (daily)          (weekly)   (release) (deploy)
```

**Key Point**: Conflicts should be resolved in **feature branches**, not in develop/staging/main!

---

## 📦 Available Commands

```bash
# Development
npm run dev                    # Start GP site (port 5173)
npm run dev:superadmin        # Start Super Admin (port 5174)

# Building
npm run build                 # Build GP site
npm run build:superadmin      # Build Super Admin

# Testing
npm run lint                  # Check for errors

# Quick Start
./start-dev.sh               # Automated startup
```

---

## 🧪 Testing Checklist

Before committing:
- ✅ Run `npm run dev`
- ✅ Test login at http://localhost:5173/admin/login
- ✅ Test features you changed
- ✅ Run `npm run lint`
- ✅ Check no console errors
- ✅ Test on different GPs (add ?tenant=dongartal)

---

## 🆘 Quick Help

### Can't Login Locally?
```bash
# Re-create admin user
node create-admin-user.js
```

### Port Already in Use?
```bash
# Kill the process
lsof -ti:5173 | xargs kill -9
```

### Changes Not Showing?
```bash
# Hard refresh browser
Ctrl + Shift + R
```

### Git Conflicts?
```bash
# See CONFLICT_PREVENTION_CHECKLIST.md
# Or abort and try again
git merge --abort
```

---

## ✅ You're Ready!

Everything is set up. Your next steps:

1. **Start coding**: `./start-dev.sh`
2. **Login**: http://localhost:5173/admin/login
3. **Make changes**: Edit files, see live updates
4. **Commit**: `git add . && git commit -m "feat: Your change"`
5. **Push**: `git push origin develop`

**Remember**: 
- Pull before starting work
- Create feature branches
- Test before merging
- Follow the checklists

Happy coding! 🚀

---

## 📖 Need More Details?

- **Setup & Workflow**: See [LOCAL_DEVELOPMENT_GUIDE.md](./LOCAL_DEVELOPMENT_GUIDE.md)
- **Avoid Conflicts**: See [CONFLICT_PREVENTION_CHECKLIST.md](./CONFLICT_PREVENTION_CHECKLIST.md)
- **Git Strategy**: See [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)
