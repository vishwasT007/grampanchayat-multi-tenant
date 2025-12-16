#!/bin/bash

# Super Admin Account Setup Script
# This script helps create the first super admin account in Firestore

echo "=========================================="
echo "  Super Admin Account Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}This script will guide you through creating the first super admin account.${NC}"
echo ""

# Step 1: Firebase Console Instructions
echo -e "${GREEN}STEP 1: Create Super Admin User in Firebase Authentication${NC}"
echo "----------------------------------------"
echo "1. Open Firebase Console: https://console.firebase.google.com"
echo "2. Select your project"
echo "3. Go to 'Authentication' > 'Users'"
echo "4. Click 'Add User'"
echo "5. Use these credentials:"
echo ""
echo -e "   ${YELLOW}Email:${NC}    superadmin@grampanchayat.in"
echo -e "   ${YELLOW}Password:${NC} SuperAdmin@2025!"
echo ""
echo "6. Click 'Add User'"
echo "7. Copy the User UID from the list"
echo ""
read -p "Press Enter after creating the user and copying the UID..."
echo ""

# Get UID from user
echo -e "${BLUE}Enter the User UID you just copied:${NC}"
read -p "UID: " USER_UID

if [ -z "$USER_UID" ]; then
    echo -e "${YELLOW}Error: UID cannot be empty${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}STEP 2: Create Super Admin Document in Firestore${NC}"
echo "----------------------------------------"
echo "1. Go to 'Firestore Database' in Firebase Console"
echo "2. Click 'Start Collection'"
echo "3. Collection ID: globalConfig"
echo "4. Click 'Next'"
echo "5. Document ID: superAdmins"
echo "6. Click 'Add Field' and add this document:"
echo ""
echo "   Collection: globalConfig"
echo "   Document: superAdmins"
echo "   Sub-collection: users"
echo "   Document ID: $USER_UID"
echo ""
echo "   Fields to add:"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   uid           (string)    $USER_UID"
echo "   email         (string)    superadmin@grampanchayat.in"
echo "   role          (string)    superadmin"
echo "   displayName   (string)    Super Administrator"
echo "   active        (boolean)   true"
echo "   createdAt     (timestamp) [Click 'Set to server timestamp']"
echo "   lastLogin     (timestamp) [Click 'Set to server timestamp']"
echo "   permissions   (array)     [Add these values one by one]:"
echo "                             - manage_gps"
echo "                             - create_admins"
echo "                             - view_analytics"
echo "                             - manage_users"
echo "                             - system_settings"
echo "                             - view_logs"
echo "                             - manage_domains"
echo "                             - delete_gps"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Press Enter after creating the Firestore document..."
echo ""

# Step 3: Update Firestore Rules
echo -e "${GREEN}STEP 3: Update Firestore Security Rules${NC}"
echo "----------------------------------------"
echo "Add these rules to your firestore.rules file:"
echo ""
cat << 'EOF'
// Super Admin Rules (add to your existing rules)
match /globalConfig/{document=**} {
  // Only super admins can read/write global config
  allow read, write: if get(/databases/$(database)/documents/globalConfig/superAdmins/users/$(request.auth.uid)).data.role == 'superadmin';
}

match /globalConfig/superAdmins/users/{userId} {
  // Super admins can read their own profile
  allow read: if request.auth.uid == userId;
  // Only super admins can write
  allow write: if get(/databases/$(database)/documents/globalConfig/superAdmins/users/$(request.auth.uid)).data.role == 'superadmin';
}

match /globalConfig/activityLogs/{logId} {
  // Only super admins can read logs
  allow read: if get(/databases/$(database)/documents/globalConfig/superAdmins/users/$(request.auth.uid)).data.role == 'superadmin';
  // Allow creation of logs (system writes)
  allow create: if request.auth != null;
}
EOF
echo ""
echo "Then deploy the rules:"
echo "  firebase deploy --only firestore:rules"
echo ""
read -p "Press Enter after deploying the rules..."
echo ""

# Step 4: Test Access
echo -e "${GREEN}STEP 4: Test Super Admin Access${NC}"
echo "----------------------------------------"
echo "1. Start your development server:"
echo "   npm run dev"
echo ""
echo "2. Open your browser to:"
echo "   http://localhost:5173/superadmin/login"
echo ""
echo "3. Login with:"
echo -e "   ${YELLOW}Email:${NC}    superadmin@grampanchayat.in"
echo -e "   ${YELLOW}Password:${NC} SuperAdmin@2025!"
echo ""
echo "4. You should be redirected to the Super Admin Dashboard"
echo ""

# Summary
echo ""
echo -e "${GREEN}=========================================="
echo "  Setup Complete! ✓"
echo "==========================================${NC}"
echo ""
echo "Super Admin Login URL:"
echo "  🔗 http://localhost:5173/superadmin/login"
echo ""
echo "Production URL (after deployment):"
echo "  🔗 https://your-domain.web.app/superadmin/login"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT SECURITY NOTES:${NC}"
echo "1. Change the default password immediately after first login"
echo "2. Store credentials securely (use a password manager)"
echo "3. Never share super admin credentials"
echo "4. Enable 2FA in Firebase Console for extra security"
echo "5. Monitor activity logs regularly"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "• Add your first Gram Panchayat from the dashboard"
echo "• Configure custom domains in Firebase Hosting"
echo "• Set up email notifications (optional)"
echo "• Review system settings"
echo ""
echo "For detailed documentation, see:"
echo "  📄 SUPER_ADMIN_BUILD_PLAN.md"
echo "  📄 SUPER_ADMIN_PANEL_PROPOSAL.md"
echo ""
echo "Happy managing! 🚀"
echo ""
