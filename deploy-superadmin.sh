#!/bin/bash

# Quick Deploy Script for Super Admin

echo "🚀 Deploying Super Admin Panel..."

# Build Super Admin
echo "📦 Building Super Admin..."
npm run build:superadmin

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Firebase
    echo "🌐 Deploying to Firebase..."
    firebase deploy --only hosting:superadmin
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✨ Deployment successful!"
        echo ""
        echo "🌐 Your Super Admin panel is live at:"
        echo "   https://superadmin-grampanchayat.web.app"
        echo "   https://superadmin-grampanchayat.firebaseapp.com"
        echo ""
        echo "🔐 Login with:"
        echo "   Email: superadmin@grampanchayat.in"
        echo "   Password: Admin@123456"
        echo ""
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
