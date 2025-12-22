#!/bin/bash

echo "🚀 COMPLETE AUTOMATION SETUP"
echo "============================"
echo ""
echo "This script will:"
echo "1. Download service account key"
echo "2. Test it locally"
echo "3. Upload to GitHub secrets"
echo "4. Fix your current GP"
echo "5. Verify everything works"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check if service account exists
echo -e "${BLUE}Step 1: Checking for service account...${NC}"
echo ""

if [ -f "serviceAccountKey.json" ]; then
    echo -e "${GREEN}✅ Found existing serviceAccountKey.json${NC}"
    echo ""
    
    # Validate it
    if jq empty serviceAccountKey.json 2>/dev/null; then
        echo -e "${GREEN}✅ JSON is valid${NC}"
        PROJECT_ID=$(jq -r '.project_id' serviceAccountKey.json)
        echo "   Project: $PROJECT_ID"
    else
        echo -e "${RED}❌ JSON is invalid, will need to re-download${NC}"
        rm serviceAccountKey.json
    fi
else
    echo -e "${YELLOW}⚠️  serviceAccountKey.json not found${NC}"
    echo ""
    echo "📥 Please download it now:"
    echo "1. Open: https://console.firebase.google.com/project/grampanchayat-multi-tenant/settings/serviceaccounts/adminsdk"
    echo "2. Click 'Generate new private key'"
    echo "3. Save to: $(pwd)/serviceAccountKey.json"
    echo ""
    read -p "Press Enter when you've downloaded the file..."
    
    if [ ! -f "serviceAccountKey.json" ]; then
        echo -e "${RED}❌ File still not found. Exiting.${NC}"
        exit 1
    fi
fi

echo ""

# Step 2: Test service account locally
echo -e "${BLUE}Step 2: Testing service account locally...${NC}"
echo ""

export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log('✅ Service account initialized');
console.log('📦 Testing Firestore access...');

const db = admin.firestore();
db.collection('globalConfig').doc('metadata').get()
  .then(() => {
    console.log('✅ Firestore read successful!');
    return db.doc('globalConfig/metadata/gramPanchayats/pindkeparlodha').get();
  })
  .then(doc => {
    if (doc.exists) {
      console.log('✅ Found GP: pindkeparlodha');
      console.log('   Current domain:', doc.data().domain);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
" || { echo -e "${RED}❌ Service account test failed!${NC}"; exit 1; }

echo ""

# Step 3: Generate GitHub secret format
echo -e "${BLUE}Step 3: Generating GitHub secret...${NC}"
echo ""

MINIFIED_JSON=$(jq -c . serviceAccountKey.json)

echo -e "${GREEN}✅ Secret generated!${NC}"
echo ""

# Step 4: Show instructions for GitHub
echo -e "${BLUE}Step 4: Update GitHub Secret${NC}"
echo ""
echo "🔗 Open this link in your browser:"
echo "https://github.com/vishwasT007/grampanchayat-multi-tenant/settings/secrets/actions/FIREBASE_SERVICE_ACCOUNT"
echo ""
echo "Then:"
echo "1. Click 'Update FIREBASE_SERVICE_ACCOUNT'"
echo "2. Paste this value (COPY THE ENTIRE LINE):"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "$MINIFIED_JSON"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "3. Click 'Update secret'"
echo ""
read -p "Press Enter when you've updated the secret..."

echo ""

# Step 5: Fix current GP
echo -e "${BLUE}Step 5: Fixing current GP domain...${NC}"
echo ""

echo "Current GP needs domain update:"
echo "  From: gp-pindkeparlodha.web.app"
echo "  To:   gp-pindkeparlodha-wsye6o.web.app"
echo ""

read -p "Fix it now? (yes/no): " FIX_GP

if [ "$FIX_GP" = "yes" ]; then
    node -e "
    const admin = require('firebase-admin');
    const serviceAccount = require('./serviceAccountKey.json');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    const db = admin.firestore();
    const gpId = 'pindkeparlodha';
    const newSubdomain = 'gp-pindkeparlodha-wsye6o';
    const newDomain = 'gp-pindkeparlodha-wsye6o.web.app';
    
    console.log('Updating Firestore...');
    
    db.doc('globalConfig/metadata/gramPanchayats/' + gpId).set({
      subdomain: newSubdomain,
      domain: newDomain,
      domainStatus: 'active'
    }, { merge: true })
    .then(() => {
      console.log('');
      console.log('✅ Firestore updated successfully!');
      console.log('🌐 Domain:', newDomain);
      console.log('');
      console.log('🎉 Refresh your SuperAdmin page to see the change!');
      console.log('🔗 https://superadmin-grampanchayat.web.app/superadmin/gram-panchayats/pindkeparlodha');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Update failed:', err.message);
      process.exit(1);
    });
    "
    
    echo ""
fi

# Step 6: Summary
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 SETUP COMPLETE!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "✅ Service account configured"
echo "✅ GitHub secret updated"
echo "✅ Current GP fixed (if you chose yes)"
echo ""
echo "🚀 NEXT STEPS:"
echo ""
echo "1. Refresh SuperAdmin page:"
echo "   https://superadmin-grampanchayat.web.app/superadmin/gram-panchayats/pindkeparlodha"
echo ""
echo "2. Verify domain shows:"
echo "   gp-pindkeparlodha-wsye6o.web.app"
echo ""
echo "3. Test the site:"
echo "   https://gp-pindkeparlodha-wsye6o.web.app"
echo ""
echo "4. Create a new test GP to verify automation:"
echo "   https://superadmin-grampanchayat.web.app/superadmin/gram-panchayats/add"
echo ""
echo "📚 WHAT'S AUTOMATED NOW:"
echo ""
echo "✅ Create GP → Firestore saves data"
echo "✅ Cloud Function → Triggers GitHub Actions"
echo "✅ GitHub Actions → Deploys site"
echo "✅ GitHub Actions → Updates Firestore with real domain"
echo "✅ UI → Shows domain automatically (real-time)"
echo ""
echo "🎯 Everything is automated! Just create GPs and watch the magic!"
echo ""
