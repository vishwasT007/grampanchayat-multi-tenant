#!/bin/bash

# GP Creation Diagnostic Script
# Run this to check if your environment is ready for GP creation

echo "🔍 Gram Panchayat Platform - Production Readiness Check"
echo "========================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_passed=0
check_failed=0

# Check 1: Firebase CLI installed
echo -n "Checking Firebase CLI... "
if command -v firebase &> /dev/null; then
    echo -e "${GREEN}✓ Installed${NC}"
    firebase --version
    ((check_passed++))
else
    echo -e "${RED}✗ Not found${NC}"
    echo "  Install: npm install -g firebase-tools"
    ((check_failed++))
fi
echo ""

# Check 2: Logged into Firebase
echo -n "Checking Firebase login... "
if firebase projects:list &> /dev/null; then
    echo -e "${GREEN}✓ Logged in${NC}"
    ((check_passed++))
else
    echo -e "${RED}✗ Not logged in${NC}"
    echo "  Run: firebase login"
    ((check_failed++))
fi
echo ""

# Check 3: Project set
echo -n "Checking Firebase project... "
PROJECT=$(firebase use 2>&1 | grep "Active" | awk '{print $4}')
if [ ! -z "$PROJECT" ]; then
    echo -e "${GREEN}✓ Using project: $PROJECT${NC}"
    ((check_passed++))
else
    echo -e "${RED}✗ No project selected${NC}"
    echo "  Run: firebase use grampanchayat-multi-tenant"
    ((check_failed++))
fi
echo ""

# Check 4: Node modules installed
echo -n "Checking Node dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ Installed${NC}"
    ((check_passed++))
else
    echo -e "${RED}✗ Not installed${NC}"
    echo "  Run: npm install"
    ((check_failed++))
fi
echo ""

# Check 5: Functions dependencies
echo -n "Checking Functions dependencies... "
if [ -d "functions/node_modules" ]; then
    echo -e "${GREEN}✓ Installed${NC}"
    ((check_passed++))
else
    echo -e "${YELLOW}⚠ Not installed${NC}"
    echo "  Run: cd functions && npm install"
    ((check_failed++))
fi
echo ""

# Check 6: Environment files
echo -n "Checking .env file... "
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Found${NC}"
    echo "  Checking required variables:"
    
    required_vars=(
        "VITE_FIREBASE_API_KEY"
        "VITE_FIREBASE_AUTH_DOMAIN"
        "VITE_FIREBASE_PROJECT_ID"
        "VITE_FIREBASE_STORAGE_BUCKET"
        "VITE_FIREBASE_MESSAGING_SENDER_ID"
        "VITE_FIREBASE_APP_ID"
    )
    
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env; then
            echo -e "    ${GREEN}✓${NC} $var"
        else
            echo -e "    ${RED}✗${NC} $var missing"
            ((check_failed++))
        fi
    done
    ((check_passed++))
else
    echo -e "${YELLOW}⚠ Not found${NC}"
    echo "  Copy .env.example to .env and fill in values"
fi
echo ""

# Check 7: Firebase config files
echo "Checking Firebase configuration files:"
for file in "firebase.json" "firestore.rules" "firestore.indexes.json"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
        ((check_passed++))
    else
        echo -e "  ${RED}✗${NC} $file missing"
        ((check_failed++))
    fi
done
echo ""

# Check 8: GitHub secrets (can't check directly, just remind)
echo -e "${YELLOW}⚠${NC} GitHub Secrets - Manual Check Required:"
echo "  Go to: https://github.com/vishwasT007/grampanchayat-multi-tenant/settings/secrets/actions"
echo "  Required secrets:"
echo "    - FIREBASE_SERVICE_ACCOUNT_BASE64 (or FIREBASE_SERVICE_ACCOUNT)"
echo "    - FIREBASE_TOKEN"
echo "    - VITE_FIREBASE_* (all 7 variables)"
echo ""

# Summary
echo "========================================================"
echo -e "Summary: ${GREEN}$check_passed passed${NC}, ${RED}$check_failed issues found${NC}"
echo ""

if [ $check_failed -eq 0 ]; then
    echo -e "${GREEN}✓ Your environment looks good!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Deploy Firestore rules: firebase deploy --only firestore:rules"
    echo "2. Deploy Cloud Functions: firebase deploy --only functions"
    echo "3. Verify super admin user exists in Firestore"
    echo "4. Test GP creation at https://superadmin-grampanchayat.web.app"
else
    echo -e "${RED}✗ Please fix the issues above before proceeding${NC}"
    echo ""
    echo "Common fixes:"
    echo "1. npm install"
    echo "2. cd functions && npm install && cd .."
    echo "3. firebase login"
    echo "4. firebase use grampanchayat-multi-tenant"
    echo "5. Copy .env.example to .env and fill in Firebase config"
fi
echo ""
