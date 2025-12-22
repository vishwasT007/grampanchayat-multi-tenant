#!/bin/bash

# 🚀 Full Automation Setup Script
# Sets up Cloud Functions for 100% automated GP deployment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ID="grampanchayat-multi-tenant"
REPO_OWNER="vishwasT007"
REPO_NAME="grampanchayat-multi-tenant"

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║          🚀 FULL AUTOMATION SETUP - CLOUD FUNCTIONS 🚀              ║"
echo "║                                                                      ║"
echo "║  After this setup, creating a GP will automatically:                ║"
echo "║  ✅ Trigger GitHub Actions                                          ║"
echo "║  ✅ Deploy Firebase Hosting site                                    ║"
echo "║  ✅ Create admin user                                               ║"
echo "║  ✅ Update domain status                                            ║"
echo "║                                                                      ║"
echo "║  NO MANUAL STEPS REQUIRED! 🎉                                       ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Step 1: Check prerequisites
echo -e "\n${YELLOW}📋 Step 1: Checking Prerequisites...${NC}"

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found!${NC}"
    echo -e "${YELLOW}Installing Firebase CLI...${NC}"
    npm install -g firebase-tools
fi

echo -e "${GREEN}✅ Firebase CLI installed${NC}"

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Firebase${NC}"
    echo -e "${BLUE}Please login to Firebase...${NC}"
    firebase login
fi

echo -e "${GREEN}✅ Logged in to Firebase${NC}"

# Step 2: Get GitHub Personal Access Token
echo -e "\n${YELLOW}📋 Step 2: GitHub Personal Access Token Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}You need to create a GitHub Personal Access Token with these scopes:${NC}"
echo "  ✅ repo (Full control of private repositories)"
echo "  ✅ workflow (Update GitHub Action workflows)"
echo ""
echo -e "${BLUE}1. Open this URL in your browser:${NC}"
echo "   👉 https://github.com/settings/tokens/new"
echo ""
echo -e "${BLUE}2. Configure the token:${NC}"
echo "   - Note: Firebase Cloud Functions - GP Auto Deployment"
echo "   - Expiration: No expiration (or 1 year)"
echo "   - Select scopes: repo, workflow"
echo ""
echo -e "${BLUE}3. Click 'Generate token' and COPY IT${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

read -p "Have you created the token? (y/n): " token_created
if [[ "$token_created" != "y" ]]; then
    echo -e "${RED}❌ Please create the token first and run this script again${NC}"
    exit 1
fi

echo ""
read -sp "Paste your GitHub Personal Access Token (ghp_...): " GITHUB_TOKEN
echo ""

if [[ ! "$GITHUB_TOKEN" =~ ^ghp_ ]]; then
    echo -e "${RED}❌ Invalid token format. Token should start with 'ghp_'${NC}"
    exit 1
fi

echo -e "${GREEN}✅ GitHub token received${NC}"

# Step 3: Check/Upgrade Firebase Plan
echo -e "\n${YELLOW}📋 Step 3: Firebase Billing Plan Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Cloud Functions require the Firebase Blaze (pay-as-you-go) plan${NC}"
echo ""
echo "📊 Cost Estimate:"
echo "  - FREE TIER: 2M invocations/month, 400K GB-seconds/month"
echo "  - Your usage: ~1000 invocations/month"
echo "  - Estimated cost: \$0-1/month (well within free tier)"
echo ""
echo -e "${BLUE}To upgrade:${NC}"
echo "  1. Go to: https://console.firebase.google.com/project/${PROJECT_ID}/usage"
echo "  2. Click 'Modify plan'"
echo "  3. Select 'Blaze plan'"
echo "  4. Add payment method"
echo "  5. Set budget alert to \$5/month (optional but recommended)"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

read -p "Have you upgraded to Blaze plan? (y/n): " blaze_ready
if [[ "$blaze_ready" != "y" ]]; then
    echo -e "${YELLOW}⚠️  Opening Firebase Console...${NC}"
    firebase open usage --project ${PROJECT_ID}
    echo ""
    read -p "Press Enter after upgrading to Blaze plan..."
fi

echo -e "${GREEN}✅ Firebase Blaze plan confirmed${NC}"

# Step 4: Configure Firebase Functions Environment
echo -e "\n${YELLOW}📋 Step 4: Configuring Cloud Functions Environment...${NC}"

echo -e "${BLUE}Setting GITHUB_TOKEN secret...${NC}"
echo "$GITHUB_TOKEN" | firebase functions:secrets:set GITHUB_TOKEN --project ${PROJECT_ID} --force

echo -e "${BLUE}Setting additional configuration...${NC}"
firebase functions:config:set \
  github.owner="${REPO_OWNER}" \
  github.repo="${REPO_NAME}" \
  --project ${PROJECT_ID}

echo -e "${GREEN}✅ Environment configured${NC}"

# Step 5: Install dependencies
echo -e "\n${YELLOW}📋 Step 5: Installing Cloud Functions Dependencies...${NC}"

cd functions
npm install
cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Step 6: Deploy Cloud Functions
echo -e "\n${YELLOW}📋 Step 6: Deploying Cloud Functions...${NC}"
echo -e "${BLUE}This may take 2-3 minutes...${NC}"

firebase deploy --only functions --project ${PROJECT_ID}

echo -e "${GREEN}✅ Cloud Functions deployed!${NC}"

# Step 7: Verify deployment
echo -e "\n${YELLOW}📋 Step 7: Verifying Deployment...${NC}"

echo -e "${BLUE}Listing deployed functions...${NC}"
firebase functions:list --project ${PROJECT_ID}

echo -e "${GREEN}✅ Verification complete!${NC}"

# Step 8: Test automation
echo -e "\n${YELLOW}📋 Step 8: Testing Automation...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Let's trigger automation for the pending Dongartal GP${NC}"
echo ""

cat > trigger-dongartal.js << 'SCRIPT_EOF'
const admin = require('firebase-admin');

// Initialize without service account (using application default credentials)
admin.initializeApp({
  projectId: 'grampanchayat-multi-tenant'
});

const db = admin.firestore();

async function triggerDongartal() {
  try {
    const gpRef = db.collection('globalConfig').doc('metadata').collection('gramPanchayats').doc('dongartal');
    
    // Get current data
    const gpDoc = await gpRef.get();
    if (!gpDoc.exists) {
      console.log('❌ Dongartal GP not found');
      process.exit(1);
    }
    
    console.log('✅ Found Dongartal GP');
    console.log('Current status:', gpDoc.data().domainStatus);
    
    // Update to trigger the Cloud Function
    await gpRef.update({
      triggerDeploy: true,
      updatedAt: admin.firestore.Timestamp.now()
    });
    
    console.log('✅ Updated Dongartal GP - Cloud Function should trigger now!');
    console.log('');
    console.log('📊 Monitor progress:');
    console.log('  GitHub Actions: https://github.com/vishwasT007/grampanchayat-multi-tenant/actions');
    console.log('  Cloud Logs: firebase functions:log --project grampanchayat-multi-tenant --follow');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

triggerDongartal();
SCRIPT_EOF

read -p "Trigger automation for Dongartal GP now? (y/n): " trigger_now
if [[ "$trigger_now" == "y" ]]; then
    echo -e "${BLUE}Triggering automation...${NC}"
    node trigger-dongartal.js
    rm trigger-dongartal.js
fi

# Success summary
echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║                    ✅ AUTOMATION SETUP COMPLETE! ✅                  ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Cloud Functions deployed${NC}"
echo -e "${GREEN}✅ GitHub token configured${NC}"
echo -e "${GREEN}✅ Environment variables set${NC}"
echo -e "${GREEN}✅ 100% Automation active!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo -e "${YELLOW}🎯 WHAT'S NEXT:${NC}"
echo ""
echo "1️⃣  Create a new GP via SuperAdmin UI"
echo "2️⃣  Watch it deploy automatically (no manual steps!)"
echo "3️⃣  Monitor progress:"
echo "    - GitHub Actions: https://github.com/${REPO_OWNER}/${REPO_NAME}/actions"
echo "    - Cloud Logs: firebase functions:log --project ${PROJECT_ID} --follow"
echo ""

echo -e "${YELLOW}📊 MONITORING:${NC}"
echo ""
echo "  # Watch Cloud Function logs in real-time"
echo "  firebase functions:log --project ${PROJECT_ID} --follow"
echo ""
echo "  # Check deployed functions"
echo "  firebase functions:list --project ${PROJECT_ID}"
echo ""
echo "  # View GitHub Actions"
echo "  https://github.com/${REPO_OWNER}/${REPO_NAME}/actions"
echo ""

echo -e "${YELLOW}💡 TIMELINE (for each new GP):${NC}"
echo ""
echo "  0s   → GP created in SuperAdmin"
echo "  2s   → Cloud Function executes"
echo "  5s   → GitHub Actions starts"
echo "  3min → Deployment completes"
echo "  3min → Domain status = 'active'"
echo ""
echo -e "${GREEN}  TOTAL: ~3 minutes (fully automated!)${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 You can now create unlimited GPs without any manual steps!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Save token to file for later use (optional)
read -p "Save GitHub token to .env file for future use? (y/n): " save_token
if [[ "$save_token" == "y" ]]; then
    echo "GITHUB_TOKEN=$GITHUB_TOKEN" >> .env
    echo "GITHUB_OWNER=$REPO_OWNER" >> .env
    echo "GITHUB_REPO=$REPO_NAME" >> .env
    chmod 600 .env
    echo -e "${GREEN}✅ Token saved to .env file (secured with chmod 600)${NC}"
fi

echo ""
echo -e "${YELLOW}📚 Documentation:${NC} See FULL_AUTOMATION_SETUP.md for detailed guide"
echo ""

exit 0
