#!/bin/bash

# 🚀 100% Automation Setup Script
# This script helps you set up complete automation in minutes!

set -e

echo "======================================"
echo "🚀 100% AUTOMATION SETUP"
echo "======================================"
echo ""
echo "This will set up:"
echo "  ✅ Auto-deploy new GPs"
echo "  ✅ Auto-delete hosting sites"
echo "  ✅ Auto-delete Auth users"
echo "  ✅ Auto-update config files"
echo ""

# Step 1: GitHub Token
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 STEP 1: GitHub Personal Access Token"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to: https://github.com/settings/tokens/new"
echo "2. Token name: firebase-cloud-functions"
echo "3. Select scopes: ✅ repo, ✅ workflow"
echo "4. Click 'Generate token'"
echo "5. Copy the token (starts with 'ghp_')"
echo ""
read -p "Paste your GitHub token here: " GITHUB_TOKEN

if [[ ! $GITHUB_TOKEN =~ ^ghp_ ]]; then
    echo "❌ Error: Token should start with 'ghp_'"
    echo "Please generate a new token and try again."
    exit 1
fi

echo ""
echo "✅ Token looks good!"
echo ""

# Step 2: Configure Firebase
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  STEP 2: Configure Firebase Functions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Setting GitHub token in Firebase config..."
firebase functions:config:set github.token="$GITHUB_TOKEN"

echo ""
echo "✅ Firebase config updated!"
echo ""

# Verify configuration
echo "Verifying configuration..."
firebase functions:config:get

echo ""

# Step 3: Deploy Functions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 STEP 3: Deploy Cloud Functions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Deploy Cloud Functions now? (y/n): " DEPLOY

if [[ $DEPLOY == "y" ]]; then
    echo ""
    echo "Deploying functions..."
    firebase deploy --only functions
    
    echo ""
    echo "✅ Functions deployed!"
else
    echo ""
    echo "⚠️  Skipped deployment. Deploy later with:"
    echo "   firebase deploy --only functions"
fi

echo ""

# Step 4: Build and Deploy Super Admin
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏗️  STEP 4: Deploy Updated Super Admin"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Build and deploy Super Admin with automation updates? (y/n): " BUILD_DEPLOY

if [[ $BUILD_DEPLOY == "y" ]]; then
    echo ""
    echo "Building Super Admin..."
    VITE_TENANT=superadmin npm run build
    
    echo ""
    echo "Deploying to Firebase Hosting..."
    firebase deploy --only hosting:superadmin
    
    echo ""
    echo "✅ Super Admin deployed!"
else
    echo ""
    echo "⚠️  Skipped Super Admin deployment. Deploy later with:"
    echo "   VITE_TENANT=superadmin npm run build"
    echo "   firebase deploy --only hosting:superadmin"
fi

echo ""
echo "======================================"
echo "🎉 SETUP COMPLETE!"
echo "======================================"
echo ""
echo "✅ 100% Automation is now active!"
echo ""
echo "Test it:"
echo "  1. Go to: https://superadmin-grampanchayat.web.app"
echo "  2. Create a new GP → Auto-deploys!"
echo "  3. Delete a GP → Auto-cleans up!"
echo ""
echo "Monitor:"
echo "  • Cloud Functions logs:"
echo "    firebase functions:log --follow"
echo ""
echo "  • Firebase Console:"
echo "    https://console.firebase.google.com/project/grampanchayat-multi-tenant/functions/logs"
echo ""
echo "  • GitHub Actions:"
echo "    https://github.com/vishwasT007/grampanchayat-multi-tenant/actions"
echo ""
echo "Documentation:"
echo "  • Read: 100_PERCENT_AUTOMATION_SETUP.md"
echo ""
echo "======================================"
echo "🚀 ZERO MANUAL WORK FROM NOW ON!"
echo "======================================"
