#!/bin/bash

# Automated GP Deployment Script
# Run this after creating a GP in Super Admin to deploy it to Firebase

echo "🚀 Automated GP Deployment Script"
echo "=================================="
echo ""

# Check if Firebase CLI is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged into Firebase CLI"
    echo "Run: firebase login"
    exit 1
fi

echo "✅ Firebase CLI is logged in"
echo ""

# Get GP subdomain from user
echo "📋 Which GP do you want to deploy?"
echo "Enter GP subdomain (e.g., pindkepar-lodha, pawni, sampurna):"
read GP_SUBDOMAIN

if [ -z "$GP_SUBDOMAIN" ]; then
    echo "❌ Subdomain is required"
    exit 1
fi

echo ""
echo "🎯 Deploying GP: $GP_SUBDOMAIN"
echo ""

# Step 1: Check if hosting site exists, create if not
echo "Step 1: Checking Firebase hosting site..."
if firebase hosting:sites:list | grep -q "$GP_SUBDOMAIN"; then
    echo "✅ Hosting site '$GP_SUBDOMAIN' already exists"
else
    echo "📦 Creating Firebase hosting site..."
    firebase hosting:sites:create "$GP_SUBDOMAIN"
    if [ $? -eq 0 ]; then
        echo "✅ Hosting site created successfully"
    else
        echo "❌ Failed to create hosting site"
        exit 1
    fi
fi

echo ""

# Step 2: Check if target is configured in .firebaserc
echo "Step 2: Configuring hosting target..."
firebase target:apply hosting "$GP_SUBDOMAIN" "$GP_SUBDOMAIN"
if [ $? -eq 0 ]; then
    echo "✅ Hosting target configured"
else
    echo "❌ Failed to configure hosting target"
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
  \"target\": \"$GP_SUBDOMAIN\",
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
  ],
  \"headers\": [
    {
      \"source\": \"**/*.@(jpg|jpeg|gif|png|svg|webp)\",
      \"headers\": [
        {
          \"key\": \"Cache-Control\",
          \"value\": \"max-age=31536000\"
        }
      ]
    },
    {
      \"source\": \"**/*.@(js|css)\",
      \"headers\": [
        {
          \"key\": \"Cache-Control\",
          \"value\": \"max-age=31536000\"
        }
      ]
    }
  ],
  \"cleanUrls\": true,
  \"trailingSlash\": false
}"
echo ""
echo "Press Enter when done (or Ctrl+C to cancel)..."
read

# Step 4: Build GP website
echo ""
echo "Step 4: Building GP website..."
npm run build:gp

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""

# Step 5: Deploy to Firebase
echo "Step 5: Deploying to Firebase..."
firebase deploy --only hosting:"$GP_SUBDOMAIN"

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ SUCCESS!"
    echo "=========================================="
    echo ""
    echo "🌐 Your GP is now live at:"
    echo "   https://$GP_SUBDOMAIN.web.app"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Update domain in Firestore:"
    echo "   - Go to Firebase Console → Firestore"
    echo "   - Navigate to: globalConfig/metadata/gramPanchayats/{gpId}"
    echo "   - Update 'domain' field to: $GP_SUBDOMAIN.web.app"
    echo ""
    echo "2. Access your GP website:"
    echo "   - Public: https://$GP_SUBDOMAIN.web.app"
    echo "   - Admin: https://$GP_SUBDOMAIN.web.app/admin/login"
    echo ""
    echo "🎉 Deployment complete!"
    echo ""
else
    echo "❌ Deployment failed"
    exit 1
fi
