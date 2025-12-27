#!/bin/bash

# 🚀 Quick Start Script for Local Development
# This script helps you start working on the develop branch safely

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                          ║${NC}"
echo -e "${BLUE}║        🚀 Gram Panchayat - Local Development Quick Start 🚀             ║${NC}"
echo -e "${BLUE}║                                                                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}📍 Current branch: ${CURRENT_BRANCH}${NC}"

# If not on develop, ask to switch
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo -e "${YELLOW}⚠️  You're not on the develop branch!${NC}"
    read -p "Do you want to switch to develop? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}📦 Switching to develop branch...${NC}"
        git checkout develop
    else
        echo -e "${RED}❌ Staying on ${CURRENT_BRANCH}${NC}"
    fi
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes:${NC}"
    git status -s
    echo ""
    read -p "Do you want to stash them and pull latest? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}📦 Stashing changes...${NC}"
        git stash
        STASHED=true
    fi
fi

# Pull latest changes
echo ""
echo -e "${BLUE}⬇️  Pulling latest changes from origin/develop...${NC}"
git pull origin develop

# Apply stashed changes if any
if [ "$STASHED" = true ]; then
    echo -e "${BLUE}📦 Applying stashed changes...${NC}"
    git stash pop
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo ""
    echo -e "${YELLOW}📦 node_modules not found. Installing dependencies...${NC}"
    npm install
fi

# Display login credentials
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                     🔐 LOGIN CREDENTIALS                                 ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Admin Panel:${NC}"
echo -e "  URL:      ${BLUE}http://localhost:5173/admin/login${NC}"
echo -e "  Email:    ${BLUE}admin@pindkepar.in${NC}"
echo -e "  Password: ${BLUE}Admin@123456${NC}"
echo ""
echo -e "${GREEN}Super Admin:${NC}"
echo -e "  URL:      ${BLUE}http://localhost:5174/superadmin/login${NC}"
echo -e "  Email:    ${BLUE}admin@pindkepar.in${NC}"
echo -e "  Password: ${BLUE}Admin@123456${NC}"
echo ""

# Ask what to start
echo -e "${YELLOW}What do you want to start?${NC}"
echo "  1) GP Site (Main Website)"
echo "  2) Super Admin Panel"
echo "  3) Both (in separate terminals)"
echo ""
read -p "Enter your choice (1-3): " -n 1 -r
echo

case $REPLY in
    1)
        echo ""
        echo -e "${GREEN}🚀 Starting GP Site...${NC}"
        echo -e "${YELLOW}➜  Will open at: http://localhost:5173${NC}"
        echo ""
        npm run dev
        ;;
    2)
        echo ""
        echo -e "${GREEN}🚀 Starting Super Admin...${NC}"
        echo -e "${YELLOW}➜  Will open at: http://localhost:5174${NC}"
        echo ""
        npm run dev:superadmin
        ;;
    3)
        echo ""
        echo -e "${GREEN}🚀 Starting both...${NC}"
        echo -e "${YELLOW}➜  GP Site: http://localhost:5173${NC}"
        echo -e "${YELLOW}➜  Super Admin: http://localhost:5174${NC}"
        echo ""
        echo -e "${BLUE}Opening in separate terminals...${NC}"
        
        # Start GP site in new terminal
        gnome-terminal -- bash -c "npm run dev; exec bash" 2>/dev/null || \
        xterm -e "npm run dev" 2>/dev/null || \
        x-terminal-emulator -e "npm run dev" 2>/dev/null || \
        echo -e "${RED}Could not open new terminal. Please run 'npm run dev' manually.${NC}"
        
        sleep 2
        
        # Start Super Admin in new terminal
        gnome-terminal -- bash -c "npm run dev:superadmin; exec bash" 2>/dev/null || \
        xterm -e "npm run dev:superadmin" 2>/dev/null || \
        x-terminal-emulator -e "npm run dev:superadmin" 2>/dev/null || \
        echo -e "${RED}Could not open new terminal. Please run 'npm run dev:superadmin' manually.${NC}"
        
        echo ""
        echo -e "${GREEN}✅ Both servers started in separate terminals!${NC}"
        ;;
    *)
        echo ""
        echo -e "${RED}❌ Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Ready to code! Happy developing! 🎉${NC}"
echo ""
