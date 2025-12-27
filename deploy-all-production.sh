#!/bin/bash

# 🚀 Deploy All Gram Panchayats - Production Deployment Script
# This script deploys all 4 GPs and Super Admin to production

set -e  # Exit on error

echo "🚀 Starting Production Deployment..."
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📌 Current branch: ${YELLOW}${CURRENT_BRANCH}${NC}"

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}⚠️  WARNING: You are not on 'main' branch!${NC}"
    echo "Production deployments should be from 'main' branch."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}⚠️  You have uncommitted changes!${NC}"
    git status -s
    read -p "Continue deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

echo ""
echo "🏗️  Building and deploying all sites..."
echo ""

# Function to deploy a GP
deploy_gp() {
    local GP_ID=$1
    local HOSTING_TARGET=$2
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 Building ${GP_ID}..."
    GP_ID=${GP_ID} VITE_GP_MODE=true VITE_GP_ID=${GP_ID} npm run build:gp
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build successful${NC}"
        echo "🚀 Deploying to ${HOSTING_TARGET}..."
        firebase deploy --only hosting:${HOSTING_TARGET}
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ ${GP_ID} deployed successfully!${NC}"
        else
            echo -e "${RED}❌ Deployment failed for ${GP_ID}${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Build failed for ${GP_ID}${NC}"
        exit 1
    fi
    echo ""
}

# Deploy all 4 GPs
echo "🏘️  Deploying Gram Panchayats..."
echo ""

deploy_gp "pindkeparlodha" "gp-pindkeparlodha-wsye6o"
deploy_gp "dongartal" "gp-dongartal"
deploy_gp "katta" "gp-katta"
deploy_gp "nawargaon" "gp-nawargaon"

# Deploy Super Admin
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👨‍💼 Building Super Admin..."
VITE_SUPER_ADMIN=true npm run build:superadmin

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Super Admin build successful${NC}"
    echo "🚀 Deploying Super Admin..."
    firebase deploy --only hosting:superadmin
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Super Admin deployed successfully!${NC}"
    else
        echo -e "${RED}❌ Super Admin deployment failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Super Admin build failed${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 All deployments completed successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Deployed Sites:"
echo "  1. Pindkepar: https://gp-pindkeparlodha-wsye6o.web.app"
echo "               https://www.grampanchayatpindkeparlodha.in"
echo ""
echo "  2. Dongartal: https://gp-dongartal.web.app"
echo "               https://www.grampanchayatdongartal.in"
echo ""
echo "  3. Katta:     https://gp-katta.web.app"
echo "               https://www.grampanchayatkatta.in"
echo ""
echo "  4. Nawargaon: https://gp-nawargaon.web.app"
echo "               https://www.grampanchayatnawargaon.in"
echo ""
echo "  5. Super Admin: https://superadmin-grampanchayat.web.app"
echo ""
echo "✅ All sites are now live!"
echo ""

# Optional: Create git tag
read -p "Create a git tag for this deployment? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter version (e.g., v1.0.0): " VERSION
    if [ ! -z "$VERSION" ]; then
        git tag -a ${VERSION} -m "Production deployment ${VERSION}"
        git push origin ${VERSION}
        echo -e "${GREEN}✅ Tag ${VERSION} created and pushed${NC}"
    fi
fi

echo ""
echo "🎯 Deployment complete! Happy monitoring! 📊"
