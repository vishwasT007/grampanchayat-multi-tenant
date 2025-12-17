#!/bin/bash

# Quick Fix Script for GP Domain
# This script helps you switch from non-existent custom domain to FREE Firebase subdomain

echo "🔧 GP Domain Quick Fix Script"
echo "=============================="
echo ""

# Check if logged into Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged into Firebase CLI"
    echo "Run: firebase login"
    exit 1
fi

echo "✅ Firebase CLI is logged in"
echo ""

# Get GP ID from user
echo "📋 Which GP do you want to fix?"
echo "Enter GP ID (e.g., pindkeparlodha):"
read GP_ID

if [ -z "$GP_ID" ]; then
    echo "❌ GP ID is required"
    exit 1
fi

echo ""
echo "🎯 Setting up FREE Firebase subdomain for GP: $GP_ID"
echo ""

# Step 1: Create Firebase hosting site
echo "Step 1: Creating Firebase hosting site..."
firebase hosting:sites:create "$GP_ID" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Hosting site '$GP_ID' created successfully"
else
    echo "⚠️  Site might already exist (that's okay)"
fi

echo ""

# Step 2: Apply hosting target
echo "Step 2: Applying hosting target..."
firebase target:apply hosting "$GP_ID" "$GP_ID"
if [ $? -eq 0 ]; then
    echo "✅ Hosting target applied successfully"
else
    echo "❌ Failed to apply hosting target"
    exit 1
fi

echo ""

# Step 3: Update firebase.json (manual step for now)
echo "Step 3: Update firebase.json"
echo "⚠️  MANUAL ACTION NEEDED:"
echo ""
echo "Add this to your firebase.json 'hosting' array:"
echo ""
echo "{
  \"target\": \"$GP_ID\",
  \"public\": \"dist\",
  \"ignore\": [
    \"firebase.json\",
    \"**/.*\",
    \"**/node_modules/**\"
  ],
  \"rewrites\": [
    {
      \"source\": \"**\",
      \"destination\": \"/index.html\"
    }
  ]
}"
echo ""
echo "Press Enter when done..."
read

# Step 4: Build and deploy
echo ""
echo "Step 4: Building and deploying GP site..."
echo ""
echo "Building..."
npm run build:gp

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "Deploying to Firebase..."
firebase deploy --only hosting:"$GP_ID"

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ SUCCESS!"
    echo "=========================================="
    echo ""
    echo "🌐 Your GP is now live at:"
    echo "   https://$GP_ID.web.app"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Go to Firebase Console → Firestore"
    echo "2. Navigate to: globalConfig/metadata/gramPanchayats/$GP_ID"
    echo "3. Update 'domain' field to: $GP_ID.web.app"
    echo ""
    echo "🎉 Done! Your GP website is accessible at the FREE Firebase subdomain."
    echo ""
else
    echo "❌ Deployment failed"
    exit 1
fi
