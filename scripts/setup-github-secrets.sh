#!/bin/bash

# GitHub Actions Secrets Setup Helper
# This script helps you copy the secrets you need to add to GitHub

echo "=================================================="
echo "  GitHub Actions + Firebase Hosting Setup"
echo "=================================================="
echo ""
echo "📋 You need to add these secrets to your GitHub repository:"
echo ""
echo "Go to: https://github.com/vishwasT007/grampanchayat-multi-tenant/settings/secrets/actions"
echo ""
echo "Click 'New repository secret' and add each of the following:"
echo ""
echo "=================================================="
echo ""

# Read .env file
if [ -f ".env" ]; then
    echo "✅ Found .env file. Here are your secrets:"
    echo ""
    
    echo "Secret Name: FIREBASE_SERVICE_ACCOUNT"
    echo "Value: Run 'firebase login:ci' to generate this token"
    echo ""
    echo "---"
    echo ""
    
    # Extract Firebase config
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ $key == \#* ]] || [[ -z $key ]]; then
            continue
        fi
        
        # Only show VITE_ variables
        if [[ $key == VITE_FIREBASE_* ]]; then
            echo "Secret Name: $key"
            echo "Value: $value"
            echo ""
            echo "---"
            echo ""
        fi
    done < .env
    
    echo ""
    echo "OPTIONAL (for production analytics):"
    echo ""
    echo "Secret Name: VITE_ENABLE_ANALYTICS"
    echo "Value: true"
    echo ""
    echo "Secret Name: VITE_ENABLE_PERFORMANCE"
    echo "Value: true"
    echo ""
    echo "Secret Name: VITE_ENABLE_APP_CHECK"
    echo "Value: false"
    echo ""
else
    echo "❌ .env file not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "=================================================="
echo ""
echo "📝 COPY INSTRUCTIONS:"
echo ""
echo "1. Copy the Firebase CI token (already shown above)"
echo "2. Go to GitHub repository settings"
echo "3. Navigate to Secrets and variables → Actions"
echo "4. Click 'New repository secret'"
echo "5. Add each secret one by one"
echo "6. Make sure the names match EXACTLY (case-sensitive)"
echo ""
echo "=================================================="
echo ""
echo "🚀 After adding all secrets:"
echo ""
echo "Test the deployment by pushing a commit:"
echo ""
echo "  git add ."
echo "  git commit -m 'test: Setup GitHub Actions'"
echo "  git push origin main"
echo ""
echo "Then check: https://github.com/vishwasT007/grampanchayat-multi-tenant/actions"
echo ""
echo "=================================================="
echo ""
echo "Your site will be live at:"
echo "  https://grampanchayat-multi-tenant.web.app"
echo "  https://grampanchayat-multi-tenant.firebaseapp.com"
echo ""
echo "=================================================="
