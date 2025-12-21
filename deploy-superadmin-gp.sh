#!/bin/bash

# Deploy GP Created from SuperAdmin Panel
# This script automates the deployment of GPs created via SuperAdmin web interface

set -e  # Exit on error

echo "🎛️ SuperAdmin GP Deployment Script"
echo "==================================="
echo ""
echo "This script deploys GPs that were created via the SuperAdmin web panel."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if logged into Firebase
echo -e "${BLUE}Checking Firebase CLI...${NC}"
if ! firebase projects:list &> /dev/null; then
    echo -e "${RED}❌ Not logged into Firebase CLI${NC}"
    echo "Run: firebase login"
    exit 1
fi
echo -e "${GREEN}✅ Firebase CLI ready${NC}"
echo ""

# Get list of GPs from Firestore (optional - requires firebase-admin)
echo -e "${CYAN}📋 Available deployment options:${NC}"
echo "   1. Deploy a specific GP (you know the subdomain)"
echo "   2. List all GPs from Firestore (requires Node.js script)"
echo ""

read -p "Choose option (1 or 2): " option

if [ "$option" == "2" ]; then
    echo ""
    echo -e "${BLUE}Fetching GPs from Firestore...${NC}"
    
    # Create temporary Node.js script to fetch GPs
    cat > /tmp/list-gps.js << 'EOF'
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-admin-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listGPs() {
  try {
    const gpsSnapshot = await db
      .collection('globalConfig')
      .doc('metadata')
      .collection('gramPanchayats')
      .get();
    
    console.log('\n📊 Gram Panchayats in System:\n');
    console.log('─'.repeat(80));
    console.log('ID'.padEnd(20) + 'Name'.padEnd(35) + 'Subdomain');
    console.log('─'.repeat(80));
    
    gpsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(
        doc.id.padEnd(20) + 
        (data.name || 'N/A').substring(0, 34).padEnd(35) + 
        (data.subdomain || 'N/A')
      );
    });
    
    console.log('─'.repeat(80));
    console.log('\nTotal GPs:', gpsSnapshot.size);
    
    process.exit(0);
  } catch (error) {
    console.error('Error fetching GPs:', error);
    process.exit(1);
  }
}

listGPs();
EOF

    # Check if firebase-admin-key.json exists
    if [ -f "firebase-admin-key.json" ]; then
        node /tmp/list-gps.js
        echo ""
        read -p "Press Enter to continue..."
    else
        echo -e "${YELLOW}⚠️  firebase-admin-key.json not found${NC}"
        echo "To list GPs from Firestore, you need a service account key."
        echo "Download from: Firebase Console → Project Settings → Service Accounts"
        echo ""
    fi
    
    # Cleanup
    rm -f /tmp/list-gps.js
fi

# Get GP subdomain
echo ""
echo -e "${BLUE}📋 Enter the GP subdomain to deploy:${NC}"
echo "   (This should match the subdomain you entered in SuperAdmin panel)"
echo "   Format: {gpname}-gpmulti"
echo "   Examples: pawni-gpmulti, sampurna-gpmulti, arvi-gpmulti"
echo ""
read -p "GP Subdomain: " GP_SUBDOMAIN

if [ -z "$GP_SUBDOMAIN" ]; then
    echo -e "${RED}❌ Subdomain is required${NC}"
    exit 1
fi

# Validate format
if [[ ! "$GP_SUBDOMAIN" =~ -gpmulti$ ]]; then
    echo -e "${YELLOW}⚠️  Subdomain should end with '-gpmulti'${NC}"
    read -p "Continue anyway? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "Deployment cancelled"
        exit 0
    fi
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
        echo ""
        echo "Possible reasons:"
        echo "  • Site name already exists"
        echo "  • Invalid site name format"
        echo "  • Firebase quota exceeded"
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
    echo "Add this to the 'hosting' array in firebase.json:"
    echo ""
    echo -e "${CYAN}────────────────────────────────${NC}"
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
  ]
}
EOF
    echo -e "${CYAN}────────────────────────────────${NC}"
    echo ""
    read -p "Have you added this to firebase.json? (y/N): " added
    if [ "$added" != "y" ] && [ "$added" != "Y" ]; then
        echo ""
        echo -e "${YELLOW}Please add the configuration and run this script again${NC}"
        exit 0
    fi
fi
echo ""

# Step 4: Install dependencies
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 4: Install Dependencies${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi
echo ""

# Step 5: Build the application
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 5: Build Application${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "🔨 Building production version..."
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "Check the error messages above and fix any issues"
    exit 1
fi
echo ""

# Step 6: Deploy to Firebase Hosting
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 6: Deploy to Firebase${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "🚀 Deploying to Firebase Hosting..."
if firebase deploy --only hosting:$GP_SUBDOMAIN; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi
echo ""

# Step 7: Success message
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Your GP is now live at:${NC}"
echo -e "${GREEN}https://$GP_SUBDOMAIN.web.app${NC}"
echo -e "${GREEN}https://$GP_SUBDOMAIN.firebaseapp.com${NC}"
echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo "1. Visit the URL above to verify deployment"
echo "2. Test admin login with credentials from SuperAdmin panel"
echo "3. Customize GP settings in SuperAdmin panel"
echo "4. (Optional) Add custom domain in Firebase Console"
echo ""
echo -e "${YELLOW}📝 Important Notes:${NC}"
echo "• Admin credentials are in SuperAdmin panel GP details"
echo "• DNS propagation may take 5-10 minutes"
echo "• SSL certificate is automatically provisioned"
echo ""

# Extract GP ID from subdomain (remove -gpmulti suffix)
GP_ID=${GP_SUBDOMAIN%-gpmulti*}

echo -e "${CYAN}📊 Quick Stats:${NC}"
echo "GP ID:        $GP_ID"
echo "Subdomain:    $GP_SUBDOMAIN"
echo "Primary URL:  https://$GP_SUBDOMAIN.web.app"
echo ""

echo -e "${GREEN}✨ Deployment successful! GP is ready to use.${NC}"
echo ""
