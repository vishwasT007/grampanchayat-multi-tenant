#!/bin/bash

# Firebase Setup Script for Multi-Tenant Project
# This script helps you complete the Firebase setup

echo "════════════════════════════════════════════════════════════════════"
echo "  🔥 Firebase Multi-Tenant Setup Script"
echo "════════════════════════════════════════════════════════════════════"
echo ""

# Check current project
echo "📋 Current Firebase Project:"
firebase projects:list | grep "(current)"
echo ""

# Confirm we're using the right project
echo "⚠️  IMPORTANT: Make sure you're using 'grampanchayat-multi-tenant'"
echo ""
read -p "Press ENTER to continue or Ctrl+C to cancel..."
echo ""

# Step 1: Copy new security rules
echo "════════════════════════════════════════════════════════════════════"
echo "STEP 1: Preparing Security Rules"
echo "════════════════════════════════════════════════════════════════════"

if [ -f "firestore.rules.new" ]; then
    echo "✓ Copying new Firestore rules..."
    cp firestore.rules.new firestore.rules
    echo "✓ Firestore rules updated!"
else
    echo "⚠️  firestore.rules.new not found"
fi

if [ -f "storage.rules.new" ]; then
    echo "✓ Copying new Storage rules..."
    cp storage.rules.new storage.rules
    echo "✓ Storage rules updated!"
else
    echo "⚠️  storage.rules.new not found"
fi

echo ""

# Step 2: Deploy security rules
echo "════════════════════════════════════════════════════════════════════"
echo "STEP 2: Deploying Security Rules"
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo "⚠️  Before deploying, make sure you have enabled:"
echo "   1. Firestore Database in Firebase Console"
echo "   2. Cloud Storage in Firebase Console"
echo ""
read -p "Have you enabled Firestore and Storage? (y/n): " enabled

if [ "$enabled" = "y" ] || [ "$enabled" = "Y" ]; then
    echo ""
    echo "🚀 Deploying security rules..."
    firebase deploy --only firestore:rules,storage
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Security rules deployed successfully!"
    else
        echo ""
        echo "❌ Failed to deploy security rules"
        echo "Please check:"
        echo "  1. Firestore Database is enabled"
        echo "  2. Cloud Storage is enabled"
        echo "  3. You have the right permissions"
        exit 1
    fi
else
    echo ""
    echo "⚠️  Please enable Firestore and Storage first:"
    echo ""
    echo "1. Go to: https://console.firebase.google.com/project/grampanchayat-multi-tenant"
    echo "2. Enable Firestore Database (Location: asia-south1)"
    echo "3. Enable Cloud Storage (Location: asia-south1)"
    echo "4. Then run this script again"
    echo ""
    exit 1
fi

echo ""

# Step 3: Test configuration
echo "════════════════════════════════════════════════════════════════════"
echo "STEP 3: Installation Check"
echo "════════════════════════════════════════════════════════════════════"
echo ""

if [ -d "node_modules" ]; then
    echo "✓ Dependencies already installed"
else
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "  ✅ Setup Complete!"
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo "Next Steps:"
echo "──────────"
echo ""
echo "1. Enable services in Firebase Console:"
echo "   → https://console.firebase.google.com/project/grampanchayat-multi-tenant"
echo "   → Firestore Database (asia-south1)"
echo "   → Cloud Storage (asia-south1)"
echo "   → Authentication (Email/Password)"
echo ""
echo "2. Create Firestore data structure (see FIREBASE_NEW_PROJECT_SETUP.md)"
echo ""
echo "3. Start development server:"
echo "   npm run dev"
echo ""
echo "4. Test with tenant parameter:"
echo "   http://localhost:5173?tenant=pindkepar"
echo ""
echo "════════════════════════════════════════════════════════════════════"
