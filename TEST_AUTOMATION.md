# 🚀 Quick Test: Automated GP Deployment

## ✅ Setup Complete
- GitHub Actions workflow: ✅ Created
- Firebase token: ✅ Added to GitHub Secrets
- Ready to test!

## 🧪 Let's Test It

### Option 1: Test via GitHub Website (Recommended)

1. **Go to Actions:** https://github.com/vishwasT007/grampanchayat-multi-tenant/actions

2. **Select workflow:**
   - Click "Auto Deploy GP to Firebase Hosting" (left sidebar)

3. **Run it:**
   - Click "Run workflow" button (green, top right)
   - Branch: main
   - Enter subdomain: `pawni` (or any name you want)
   - Click "Run workflow"

4. **Watch it work:**
   - Click on the workflow run that appears
   - See real-time logs
   - Wait 2-3 minutes

5. **Success!**
   - Green checkmark = Success
   - Your GP is live at: `https://pawni.web.app`

### Option 2: Test via Terminal (Advanced)

```bash
# Install GitHub CLI (if not already installed)
sudo apt install gh

# Login to GitHub
gh auth login

# Trigger the workflow
gh workflow run deploy-gp.yml -f gp_subdomain=pawni

# Watch the progress
gh run watch

# Or list recent runs
gh run list --workflow=deploy-gp.yml
```

## 📊 What Will Happen

The workflow will automatically:

1. ✅ Checkout your code
2. ✅ Install Node.js and dependencies
3. ✅ Create Firebase hosting site for "pawni"
4. ✅ Configure hosting target
5. ✅ Update firebase.json with new config
6. ✅ Build the GP website (npm run build:gp)
7. ✅ Deploy to Firebase Hosting
8. ✅ Commit firebase.json changes back to repo
9. ✅ Show success message with live URL

**Total time:** ~2-3 minutes

## 🎯 Suggested Test Subdomains

Try deploying one of these test GPs:
- `pawni` → https://pawni.web.app
- `sampurna` → https://sampurna.web.app
- `test-gp-1` → https://test-gp-1.web.app

## ✅ How to Verify Success

After the workflow completes:

1. **Check GitHub Actions:**
   - Green checkmark = Success ✅
   - Red X = Failed ❌

2. **Visit the URL:**
   - https://pawni.web.app (or your subdomain)
   - Should see the GP website

3. **Check Firestore:**
   - You'll need to manually update the domain field in Firestore
   - Or create the GP from Super Admin first, then deploy

## 🔄 Complete Workflow (How It Will Work)

### Current (Today):
```
1. Create GP in Super Admin UI → Firestore updated
2. Go to GitHub Actions → Click "Run workflow"
3. Enter subdomain → Click "Run"
4. Wait 2-3 minutes → ✅ GP is live!
```

**Manual steps:** 2 clicks on GitHub

### Future Enhancement (Optional):
```
1. Create GP in Super Admin UI → Firestore updated
   ↓
   [Cloud Function auto-triggers GitHub Actions]
   ↓
2. ✅ GP is live in 2-3 minutes! (ZERO manual steps)
```

## 🐛 Troubleshooting

### If workflow fails:

1. **Check the logs:**
   - Click on the failed run
   - Click on "deploy" job
   - Expand each step to see errors

2. **Common issues:**
   - "FIREBASE_TOKEN not found" → Re-add the secret
   - "Site already exists" → Normal, workflow continues
   - "Permission denied" → Check Firebase project access

3. **Get help:**
   - Share the error logs
   - I'll help you debug!

## 📝 Next Steps After Test

Once the test succeeds:

1. ✅ You've confirmed automation works!
2. ✅ Use this for all new GPs going forward
3. 🔮 Optional: Add Cloud Function for 100% automation
4. 🎨 Optional: Add deployment status UI in Super Admin panel

## 💡 Pro Tips

- **Multiple GPs:** Run workflow multiple times (parallel supported)
- **Redeploy:** Run workflow again with same subdomain
- **Logs:** Available for 90 days
- **Free tier:** 2,000 minutes/month (plenty!)
- **Works offline:** Workflow runs on GitHub servers

---

**Ready to test?** Go ahead and run the workflow! 🚀

Let me know if you see any errors, or once you see the green checkmark!
