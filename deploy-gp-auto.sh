#!/bin/bash

# Smart GP Deployment Script
# Automatically deploys GPs to their own Firebase hosting sites
# Reads GP data from Firestore to minimize manual input

set -e  # Exit on error

echo "🚀 Smart GP Deployment Script"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Firebase CLI login
echo -e "${BLUE}Checking Firebase CLI...${NC}"
if ! firebase projects:list &> /dev/null; then
    echo -e "${RED}❌ Not logged into Firebase CLI${NC}"
    echo "Run: firebase login"
    exit 1
fi
echo -e "${GREEN}✅ Firebase CLI ready${NC}"
echo ""

# Get GP subdomain
echo -e "${BLUE}📋 Enter GP subdomain to deploy:${NC}"
echo "   (This is the subdomain you entered when creating the GP)"
echo "   Examples: pindkepar-lodha, pawni, sampurna"
echo ""
read -p "GP Subdomain: " GP_SUBDOMAIN

if [ -z "$GP_SUBDOMAIN" ]; then
    echo -e "${RED}❌ Subdomain is required${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎯 Deploying GP: $GP_SUBDOMAIN${NC}"
echo ""

# Step 1: Create or verify hosting site
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 1: Firebase Hosting Site${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if firebase hosting:sites:list 2>/dev/null | grep -q "$GP_SUBDOMAIN"; then
    echo -e "${GREEN}✅ Hosting site '$GP_SUBDOMAIN' already exists${NC}"
else
    echo "📦 Creating hosting site..."
    if firebase hosting:sites:create "$GP_SUBDOMAIN" 2>&1; then
        echo -e "${GREEN}✅ Hosting site created${NC}"
    else
        echo -e "${RED}❌ Failed to create hosting site${NC}"
        exit 1
    fi
fi
echo ""

# Step 2: Configure hosting target
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 2: Configure Hosting Target${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if firebase target:apply hosting "$GP_SUBDOMAIN" "$GP_SUBDOMAIN" 2>&1; then
    echo -e "${GREEN}✅ Hosting target configured${NC}"
else
    echo -e "${RED}❌ Failed to configure target${NC}"
    exit 1
fi
echo ""

# Step 3: Check and update firebase.json
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 3: Update firebase.json${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if grep -q "\"target\": \"$GP_SUBDOMAIN\"" firebase.json; then
    echo -e "${GREEN}✅ Configuration already exists in firebase.json${NC}"
else
    echo -e "${YELLOW}⚠️  Need to add configuration to firebase.json${NC}"
    echo ""
    echo -e "${YELLOW}Add this to the 'hosting' array in firebase.json:${NC}"
    echo ""
    cat << EOF
{
  "target": "$GP_SUBDOMAIN",
  "public": "dist",
  "ignore": [
    "firebase.json",
    "**/.*",
    "**/node_modules/**"
  ],
  "rewrites": [
    {
      "source": "**",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "max-age=31536000"
        }
      ]
    },
    {
      "source": "**/*.@(js|css)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "max-age=31536000"
        }
      ]
    }
  ],
  "cleanUrls": true,
  "trailingSlash": false
}
EOF
    echo ""
    read -p "Press Enter after adding the configuration (or Ctrl+C to cancel)..."
fi
echo ""

# Step 4: Build GP website
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 4: Build GP Website${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if npm run build:gp; then
    echo -e "${GREEN}✅ Build completed successfully${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 5: Deploy to Firebase
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 5: Deploy to Firebase${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if firebase deploy --only hosting:"$GP_SUBDOMAIN"; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ SUCCESS! GP DEPLOYED${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${GREEN}🌐 Your GP is now live at:${NC}"
    echo -e "   ${BLUE}https://$GP_SUBDOMAIN.web.app${NC}"
    echo ""
    echo -e "${YELLOW}📝 Important Next Steps:${NC}"
    echo ""
    echo "1. Update domain in Firestore:"
    echo "   - Open: https://console.firebase.google.com/project/grampanchayat-multi-tenant/firestore/data"
    echo "   - Navigate to: globalConfig → metadata → gramPanchayats → {gpId}"
    echo "   - Update 'domain' field to: $GP_SUBDOMAIN.web.app"
    echo ""
    echo "2. Test your GP website:"
    echo "   - Public: https://$GP_SUBDOMAIN.web.app"
    echo "   - Admin: https://$GP_SUBDOMAIN.web.app/admin/login"
    echo ""
    echo -e "${GREEN}🎉 Deployment complete!${NC}"
    echo ""
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi
