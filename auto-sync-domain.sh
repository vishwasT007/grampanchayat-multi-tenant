#!/bin/bash

###############################################################################
# AUTO-SYNC FIREBASE HOSTING DOMAIN
# 
# This script automatically detects the actual Firebase Hosting site ID
# and updates the GP domain in Firestore - NO MANUAL EDITING REQUIRED!
#
# Usage: ./auto-sync-domain.sh [gpId]
# Example: ./auto-sync-domain.sh pindkeparlodha
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🤖 AUTOMATED FIREBASE HOSTING DOMAIN SYNC                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if GP ID provided
if [ -z "$1" ]; then
  echo -e "${RED}❌ Error: GP ID is required${NC}"
  echo ""
  echo "Usage: ./auto-sync-domain.sh <gpId>"
  echo "Example: ./auto-sync-domain.sh pindkeparlodha"
  echo ""
  exit 1
fi

GP_ID="$1"

echo -e "${YELLOW}🔍 GP ID: ${GP_ID}${NC}"
echo ""

# Check if firebase-admin is installed
if ! npm list firebase-admin &> /dev/null; then
  echo -e "${YELLOW}📦 Installing firebase-admin...${NC}"
  npm install --no-save firebase-admin
  echo ""
fi

# Method 1: Try with service account if available
if [ -f "service-account.json" ]; then
  echo -e "${GREEN}✅ Service account found${NC}"
  echo -e "${BLUE}🔄 Running sync with Admin SDK...${NC}"
  echo ""
  export GOOGLE_APPLICATION_CREDENTIALS="service-account.json"
  node sync-hosting-domain-admin.js "$GP_ID"
  
elif [ -n "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
  echo -e "${GREEN}✅ Service account configured via environment${NC}"
  echo -e "${BLUE}🔄 Running sync with Admin SDK...${NC}"
  echo ""
  node sync-hosting-domain-admin.js "$GP_ID"
  
else
  # Method 2: Manual update via Firebase Console
  echo -e "${YELLOW}⚠️  No service account found${NC}"
  echo ""
  echo -e "${BLUE}📋 Detected Configuration:${NC}"
  echo ""
  
  # Read .firebaserc and find matching site
  FIREBASERC_PATH=".firebaserc"
  
  if [ ! -f "$FIREBASERC_PATH" ]; then
    echo -e "${RED}❌ Error: .firebaserc not found${NC}"
    exit 1
  fi
  
  # Extract base name from GP ID
  # For pindkeparlodha, we want to find sites starting with "pindkepar"
  
  echo -e "${GREEN}🔍 Scanning Firebase hosting sites...${NC}"
  echo ""
  
  # Use grep to find matching sites in .firebaserc
  MATCHING_SITES=$(grep -o '"[^"]*-gpmulti[^"]*"' "$FIREBASERC_PATH" | tr -d '"' | grep -v "^main$" | grep -v "^superadmin$" | sort -u)
  
  echo -e "${BLUE}Available GP sites:${NC}"
  echo "$MATCHING_SITES" | while read -r site; do
    echo "  - $site"
  done
  echo ""
  
  # Try to find the best match
  # Prefer the longest match (most specific, includes suffix)
  BEST_MATCH=$(echo "$MATCHING_SITES" | grep -i "pindkepar-lodha" | sort -r | head -n 1)
  
  if [ -z "$BEST_MATCH" ]; then
    # Fallback: try with GP ID
    BEST_MATCH=$(echo "$MATCHING_SITES" | grep "$GP_ID" | sort -r | head -n 1)
  fi
  
  if [ -z "$BEST_MATCH" ]; then
    # Try without the exact GP ID, look for partial match
    BASE_NAME=$(echo "$GP_ID" | sed 's/[^a-z]//g')  # Remove non-letters
    BEST_MATCH=$(echo "$MATCHING_SITES" | grep -i "${BASE_NAME:0:8}" | sort -r | head -n 1)
  fi
  
  if [ -n "$BEST_MATCH" ]; then
    echo -e "${GREEN}✅ Detected hosting site: ${BEST_MATCH}${NC}"
    echo -e "${GREEN}✅ Domain: https://${BEST_MATCH}.web.app${NC}"
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📝 MANUAL UPDATE REQUIRED (No service account)${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}Option 1: Update via SuperAdmin Panel${NC}"
    echo "  1. Go to: https://superadmin-grampanchayat.web.app/superadmin/gram-panchayats/$GP_ID"
    echo "  2. Click 'Edit' button"
    echo "  3. Change subdomain to: $BEST_MATCH"
    echo "  4. Save"
    echo ""
    echo -e "${BLUE}Option 2: Update via Firebase Console${NC}"
    echo "  1. Go to: https://console.firebase.google.com/project/grampanchayat-multi-tenant/firestore/data"
    echo "  2. Navigate: globalConfig → metadata → gramPanchayats → $GP_ID"
    echo "  3. Edit 'domain' field to: ${BEST_MATCH}.web.app"
    echo "  4. Edit 'subdomain' field to: $BEST_MATCH"
    echo "  5. Save"
    echo ""
    echo -e "${BLUE}Option 3: Get Service Account (Automate future syncs)${NC}"
    echo "  1. Go to: Firebase Console → Project Settings → Service Accounts"
    echo "  2. Click 'Generate new private key'"
    echo "  3. Download and save as: service-account.json"
    echo "  4. Run this script again (will auto-sync!)"
    echo ""
    
    # Copy to clipboard if possible
    if command -v xclip &> /dev/null; then
      echo "$BEST_MATCH" | xclip -selection clipboard
      echo -e "${GREEN}✅ Subdomain copied to clipboard!${NC}"
    elif command -v pbcopy &> /dev/null; then
      echo "$BEST_MATCH" | pbcopy
      echo -e "${GREEN}✅ Subdomain copied to clipboard!${NC}"
    fi
    
  else
    echo -e "${RED}❌ Could not find matching hosting site${NC}"
    echo ""
    echo "Available sites:"
    echo "$MATCHING_SITES"
  fi
fi

echo ""
echo -e "${GREEN}✅ Script completed!${NC}"
