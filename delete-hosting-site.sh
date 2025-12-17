#!/bin/bash

# Delete Firebase Hosting Site Script
# Usage: ./delete-hosting-site.sh <subdomain>
# Example: ./delete-hosting-site.sh pindkepar-lodha

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if subdomain is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: No subdomain provided${NC}"
    echo -e "${YELLOW}Usage: ./delete-hosting-site.sh <subdomain>${NC}"
    echo -e "${YELLOW}Example: ./delete-hosting-site.sh pindkepar-lodha${NC}"
    exit 1
fi

SUBDOMAIN=$1

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Delete Firebase Hosting Site${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}🗑️  Target Site:${NC} $SUBDOMAIN.web.app"
echo ""

# Confirm deletion
echo -e "${RED}⚠️  WARNING: This action cannot be undone!${NC}"
echo -e "${YELLOW}This will:${NC}"
echo "  - Delete the hosting site: $SUBDOMAIN"
echo "  - Remove all deployed files"
echo "  - Make the URL inaccessible"
echo ""

read -p "Are you sure you want to delete this site? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${YELLOW}❌ Deletion cancelled${NC}"
    exit 0
fi

# Delete the hosting site
echo -e "${BLUE}🗑️  Deleting hosting site...${NC}"
echo ""

firebase hosting:sites:delete "$SUBDOMAIN" --force

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Success!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Hosting site deleted successfully!${NC}"
echo -e "${YELLOW}URL is no longer accessible:${NC} https://$SUBDOMAIN.web.app"
echo ""

# Check if firebase.json needs updating
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Update firebase.json - Remove the hosting target for '$SUBDOMAIN'"
echo "2. Update .firebaserc - Remove the target mapping"
echo ""
echo -e "${BLUE}Or run: git pull${NC} (if changes were committed)"
