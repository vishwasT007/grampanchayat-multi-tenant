#!/bin/bash

# API Key Configuration Script
# This script provides step-by-step instructions for configuring Firebase API keys

set -e

echo "🔐 Firebase API Key Configuration Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get Firebase project ID
PROJECT_ID=$(grep VITE_FIREBASE_PROJECT_ID .env 2>/dev/null | cut -d '=' -f2 || echo "")

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Error: Cannot find VITE_FIREBASE_PROJECT_ID in .env file${NC}"
    echo "Please ensure .env file exists with Firebase configuration"
    exit 1
fi

echo -e "${BLUE}📋 Project ID: ${GREEN}$PROJECT_ID${NC}"
echo ""

# Step 1: Open Google Cloud Console
echo -e "${YELLOW}Step 1: Restrict Browser API Key${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Open Google Cloud Console:"
echo -e "   ${BLUE}https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID${NC}"
echo ""
echo "2. Find the API key named: 'Browser key (auto created by Firebase)'"
echo "   Click the ✏️ (edit) icon"
echo ""
echo "3. Under 'Application restrictions':"
echo "   • Select: 'HTTP referrers (web sites)'"
echo "   • Click 'ADD AN ITEM' and add these domains:"
echo ""
echo -e "   ${GREEN}https://grampanchayat-multi-tenant.web.app/*${NC}"
echo -e "   ${GREEN}https://grampanchayat-multi-tenant.firebaseapp.com/*${NC}"
echo -e "   ${GREEN}http://localhost:5173/*${NC}  (for development)"
echo -e "   ${GREEN}http://localhost:4173/*${NC}  (for preview)"
echo -e "   ${GREEN}http://127.0.0.1:5173/*${NC}  (alternative localhost)"
echo ""
echo "   If you have a custom domain, add:"
echo -e "   ${GREEN}https://your-custom-domain.com/*${NC}"
echo ""

read -p "Press Enter when you've added the referrers..."
echo ""

# Step 2: Restrict APIs
echo -e "${YELLOW}Step 2: Restrict APIs${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "4. Under 'API restrictions':"
echo "   • Select: 'Restrict key'"
echo "   • Enable ONLY these APIs (search and select):"
echo ""
echo -e "   ${GREEN}✓${NC} Cloud Firestore API"
echo -e "   ${GREEN}✓${NC} Firebase Authentication API"
echo -e "   ${GREEN}✓${NC} Cloud Storage for Firebase API"
echo -e "   ${GREEN}✓${NC} Firebase Hosting API"
echo -e "   ${GREEN}✓${NC} Firebase Analytics API"
echo -e "   ${GREEN}✓${NC} Firebase Performance Monitoring API"
echo ""
echo -e "   ${RED}✗${NC} Disable all other APIs"
echo ""

read -p "Press Enter when you've restricted the APIs..."
echo ""

# Step 3: Save
echo -e "${YELLOW}Step 3: Save Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "5. Click 'SAVE' at the bottom"
echo "6. Wait 5 minutes for changes to propagate"
echo ""

read -p "Press Enter when you've saved the configuration..."
echo ""

# Step 4: App Check (Optional)
echo -e "${YELLOW}Step 4: Enable App Check (Recommended)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "App Check protects your app from bots and abuse."
echo ""
echo "To enable App Check:"
echo ""
echo "1. Get reCAPTCHA v3 Site Key:"
echo -e "   ${BLUE}https://www.google.com/recaptcha/admin/create${NC}"
echo "   • Select: 'reCAPTCHA v3'"
echo "   • Add domains:"
echo "     - grampanchayat-multi-tenant.web.app"
echo "     - grampanchayat-multi-tenant.firebaseapp.com"
echo "     - localhost (for testing)"
echo ""
echo "2. Enable App Check in Firebase Console:"
echo -e "   ${BLUE}https://console.firebase.google.com/project/$PROJECT_ID/appcheck${NC}"
echo "   • Click 'Get started' or 'Register app'"
echo "   • Select your web app"
echo "   • Choose 'reCAPTCHA v3'"
echo "   • Enter your reCAPTCHA site key"
echo "   • Click 'Save'"
echo ""
echo "3. Add to your .env.production file:"
echo -e "   ${GREEN}VITE_RECAPTCHA_SITE_KEY=your_site_key_here${NC}"
echo ""

read -p "Do you want to enable App Check? (y/n): " enable_appcheck

if [ "$enable_appcheck" == "y" ]; then
    echo ""
    read -p "Enter your reCAPTCHA v3 Site Key: " RECAPTCHA_KEY
    
    if [ -f ".env.production" ]; then
        # Check if key already exists
        if grep -q "VITE_RECAPTCHA_SITE_KEY" .env.production; then
            # Update existing key
            sed -i "s/VITE_RECAPTCHA_SITE_KEY=.*/VITE_RECAPTCHA_SITE_KEY=$RECAPTCHA_KEY/" .env.production
            echo -e "${GREEN}✅ Updated VITE_RECAPTCHA_SITE_KEY in .env.production${NC}"
        else
            # Add new key
            echo "VITE_RECAPTCHA_SITE_KEY=$RECAPTCHA_KEY" >> .env.production
            echo -e "${GREEN}✅ Added VITE_RECAPTCHA_SITE_KEY to .env.production${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  .env.production file not found${NC}"
        echo "Please create it from .env.production.example and add:"
        echo "VITE_RECAPTCHA_SITE_KEY=$RECAPTCHA_KEY"
    fi
    
    # Enable App Check feature flag
    if [ -f ".env.production" ]; then
        if grep -q "VITE_ENABLE_APP_CHECK" .env.production; then
            sed -i "s/VITE_ENABLE_APP_CHECK=.*/VITE_ENABLE_APP_CHECK=true/" .env.production
        else
            echo "VITE_ENABLE_APP_CHECK=true" >> .env.production
        fi
        echo -e "${GREEN}✅ Enabled App Check in .env.production${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping App Check setup${NC}"
    echo "You can enable it later by following the guide in API_KEY_SECURITY_GUIDE.md"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ API Key Configuration Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Wait 5 minutes for API restrictions to take effect"
echo "2. Test your application to ensure everything works"
echo "3. Monitor API usage in Firebase Console"
echo ""
echo "For more details, see: API_KEY_SECURITY_GUIDE.md"
echo ""
