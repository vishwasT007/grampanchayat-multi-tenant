#!/bin/bash

# Quick Setup Script for Adding New Gram Panchayat
# Usage: ./scripts/add-new-gp.sh

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   Add New Gram Panchayat - Multi-Tenant Setup Wizard        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Collect GP Information
echo "📝 Enter Gram Panchayat Details:"
echo ""

read -p "GP ID (lowercase, no spaces, e.g., 'pawni'): " GP_ID
read -p "GP Name in English (e.g., 'Gram Panchayat Pawni'): " GP_NAME_EN
read -p "GP Name in Marathi (e.g., 'ग्राम पंचायत पावनी'): " GP_NAME_MR
read -p "Domain (e.g., 'grampanchayatpawni.in'): " GP_DOMAIN

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📋 Summary:"
echo "════════════════════════════════════════════════════════════════"
echo "GP ID:        $GP_ID"
echo "English Name: $GP_NAME_EN"
echo "Marathi Name: $GP_NAME_MR"
echo "Domain:       $GP_DOMAIN"
echo "════════════════════════════════════════════════════════════════"
echo ""

read -p "Is this correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "❌ Setup cancelled."
    exit 1
fi

echo ""
echo "🔐 Generating admin credentials..."
ADMIN_EMAIL="admin@${GP_ID}.gov.in"
# Generate secure password (16 chars, alphanumeric + special)
ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -dc 'A-Za-z0-9!@#$%^&*' | head -c 16)

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🔑 ADMIN CREDENTIALS (SAVE THESE SECURELY!)"
echo "════════════════════════════════════════════════════════════════"
echo "Email:    $ADMIN_EMAIL"
echo "Password: $ADMIN_PASSWORD"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "⚠️  IMPORTANT: Copy these credentials to a secure location!"
read -p "Press Enter when you've saved the credentials..."
echo ""

# Create backup file with credentials
CREDS_FILE=".gp-credentials/$GP_ID.txt"
mkdir -p .gp-credentials
cat > "$CREDS_FILE" << EOF
Gram Panchayat: $GP_NAME_EN
GP ID: $GP_ID
Domain: $GP_DOMAIN

Admin Credentials:
Email: $ADMIN_EMAIL
Password: $ADMIN_PASSWORD

Created: $(date)

⚠️ KEEP THIS FILE SECURE! Delete after sharing with GP admin.
EOF

echo "✅ Credentials saved to: $CREDS_FILE"
echo ""

# Show code changes needed
echo "════════════════════════════════════════════════════════════════"
echo "📝 CODE CHANGES NEEDED"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Edit file: src/utils/tenant.js"
echo ""
echo "1️⃣  Add to DOMAIN_MAP (around line 10):"
echo ""
echo "  '$GP_DOMAIN': '$GP_ID',"
echo "  'www.$GP_DOMAIN': '$GP_ID',"
echo ""
echo "2️⃣  Add to ALL_TENANTS array (around line 28):"
echo ""
echo "  {"
echo "    id: '$GP_ID',"
echo "    name: '$GP_NAME_EN',"
echo "    nameHi: '$GP_NAME_MR',"
echo "    domain: '$GP_DOMAIN',"
echo "    active: true"
echo "  },"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""

read -p "Have you made these code changes? (y/n): " CODE_DONE

if [ "$CODE_DONE" != "y" ]; then
    echo "⏸️  Please make the code changes and run this script again."
    echo "   Or continue manually with the steps below."
    echo ""
fi

# Firebase Setup Instructions
echo "════════════════════════════════════════════════════════════════"
echo "🔥 FIREBASE SETUP STEPS"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "1️⃣  Create Admin User:"
echo "   URL: https://console.firebase.google.com/project/grampanchayat-multi-tenant/authentication/users"
echo "   • Click 'Add user'"
echo "   • Email: $ADMIN_EMAIL"
echo "   • Password: $ADMIN_PASSWORD"
echo "   • Click 'Add user'"
echo ""

echo "2️⃣  Set User Role in Firestore:"
echo "   URL: https://console.firebase.google.com/project/grampanchayat-multi-tenant/firestore"
echo "   • Navigate to: gramPanchayats/$GP_ID/users/{userId}"
echo "   • Add document with fields:"
echo "     - email: \"$ADMIN_EMAIL\""
echo "     - role: \"admin\""
echo "     - tenantId: \"$GP_ID\""
echo "     - active: true"
echo "     - createdAt: [current timestamp]"
echo ""

echo "3️⃣  Add Custom Domain:"
echo "   URL: https://console.firebase.google.com/project/grampanchayat-multi-tenant/hosting"
echo "   • Click 'Add custom domain'"
echo "   • Enter: $GP_DOMAIN"
echo "   • Follow Firebase instructions for DNS setup"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "🌐 DNS CONFIGURATION"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "After adding custom domain in Firebase, update DNS at your"
echo "domain registrar with the records provided by Firebase."
echo ""
echo "Typical DNS records:"
echo "  Type: A"
echo "  Name: @"
echo "  Value: [IP from Firebase]"
echo ""
echo "  Type: A"
echo "  Name: www"
echo "  Value: [IP from Firebase]"
echo ""
echo "⏰ DNS propagation takes 24-48 hours"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "🚀 DEPLOYMENT"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "After making code changes, deploy:"
echo ""
echo "  git add src/utils/tenant.js"
echo "  git commit -m \"feat: Add $GP_NAME_EN support\""
echo "  git push origin main"
echo ""
echo "GitHub Actions will automatically deploy in ~3-5 minutes."
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "✅ TESTING"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Test locally before custom domain is ready:"
echo "  http://localhost:5173?tenant=$GP_ID"
echo ""
echo "Test on production (before custom domain):"
echo "  https://grampanchayat-multi-tenant.web.app?tenant=$GP_ID"
echo ""
echo "Test with custom domain (after DNS propagation):"
echo "  https://$GP_DOMAIN"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "📋 CHECKLIST"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "  [ ] Edit src/utils/tenant.js (DOMAIN_MAP and ALL_TENANTS)"
echo "  [ ] Create admin user in Firebase Authentication"
echo "  [ ] Set user role in Firestore"
echo "  [ ] Add custom domain in Firebase Hosting"
echo "  [ ] Update DNS records at domain registrar"
echo "  [ ] Deploy code to GitHub"
echo "  [ ] Test with ?tenant=$GP_ID parameter"
echo "  [ ] Wait for DNS propagation (24-48 hours)"
echo "  [ ] Test custom domain"
echo "  [ ] Share credentials with GP admin securely"
echo "  [ ] Delete credentials file: $CREDS_FILE"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "🎉 Setup wizard complete!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📁 Credentials saved to: $CREDS_FILE"
echo "📖 Full guide: MULTI_TENANT_SETUP_GUIDE.md"
echo ""
echo "💡 Tip: You can add 20+ GPs using the same process!"
echo ""
