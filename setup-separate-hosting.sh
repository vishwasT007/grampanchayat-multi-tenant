#!/bin/bash

# Super Admin Separate Hosting Setup Script
# This script sets up Firebase hosting for separate Super Admin deployment

echo "🚀 Setting up Super Admin Separate Hosting..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo -e "${YELLOW}⚠️  Firebase CLI not found. Installing...${NC}"
    npm install -g firebase-tools
fi

echo -e "${BLUE}📋 Step 1: Login to Firebase${NC}"
firebase login

echo ""
echo -e "${BLUE}📋 Step 2: Getting current project info${NC}"
firebase projects:list

echo ""
echo -e "${BLUE}📋 Step 3: Creating separate hosting sites${NC}"
echo ""
echo "This will create two hosting sites:"
echo "  1. Main GP Sites (grampanchayat-multi-tenant)"
echo "  2. Super Admin Panel (superadmin-grampanchayat)"
echo ""

# Create hosting sites
echo -e "${YELLOW}Creating main site...${NC}"
firebase hosting:sites:create grampanchayat-multi-tenant 2>/dev/null || echo "Main site already exists"

echo -e "${YELLOW}Creating Super Admin site...${NC}"
firebase hosting:sites:create superadmin-grampanchayat 2>/dev/null || echo "Super Admin site already exists"

echo ""
echo -e "${BLUE}📋 Step 4: Configuring hosting targets${NC}"

# Set up hosting targets
firebase target:apply hosting main grampanchayat-multi-tenant
firebase target:apply hosting superadmin superadmin-grampanchayat

echo ""
echo -e "${GREEN}✅ Hosting sites configured successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Your hosting sites:${NC}"
echo "  Main GP Sites:"
echo "    - https://grampanchayat-multi-tenant.web.app"
echo "    - https://grampanchayat-multi-tenant.firebaseapp.com"
echo ""
echo "  Super Admin Panel:"
echo "    - https://superadmin-grampanchayat.web.app"
echo "    - https://superadmin-grampanchayat.firebaseapp.com"
echo ""
echo -e "${BLUE}📋 Step 5: Update Firebase Console Authorization${NC}"
echo "Please add these domains to Firebase Authentication:"
echo "  1. Go to: https://console.firebase.google.com/project/grampanchayat-f0aa7/authentication/settings"
echo "  2. Scroll to 'Authorized domains'"
echo "  3. Add: superadmin-grampanchayat.web.app"
echo "  4. Add: superadmin-grampanchayat.firebaseapp.com"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "  1. Build both sites:"
echo "     ${GREEN}npm run build:all${NC}"
echo ""
echo "  2. Deploy both sites:"
echo "     ${GREEN}npm run deploy:all${NC}"
echo ""
echo "  Or deploy individually:"
echo "     ${GREEN}npm run deploy:gp${NC}         # Deploy GP sites only"
echo "     ${GREEN}npm run deploy:superadmin${NC}  # Deploy Super Admin only"
echo ""
echo -e "${GREEN}✨ Setup complete!${NC}"
