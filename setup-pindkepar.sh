#!/bin/bash

# 🏛️ Quick Setup Script for Gram Panchayat Pindkepar Lodha
# This script helps you set up the project step by step

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Gram Panchayat Pindkepar Lodha - Quick Setup Script         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
echo "📦 Checking Node.js..."
if command_exists node; then
    echo "✅ Node.js version: $(node --version)"
else
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check npm
echo "📦 Checking npm..."
if command_exists npm; then
    echo "✅ npm version: $(npm --version)"
else
    echo "❌ npm not found."
    exit 1
fi

# Check Firebase CLI
echo "📦 Checking Firebase CLI..."
if command_exists firebase; then
    echo "✅ Firebase CLI version: $(firebase --version)"
else
    echo "⚠️  Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if .env exists and is configured
echo "📝 Checking .env configuration..."
if [ -f ".env" ]; then
    if grep -q "^VITE_FIREBASE_API_KEY=" .env; then
        echo "✅ .env file is configured"
    else
        echo "⚠️  .env file exists but is commented out"
        echo ""
        echo "⚡ ACTION REQUIRED:"
        echo "1. Create a new Firebase project at: https://console.firebase.google.com/"
        echo "2. Get your Firebase config values"
        echo "3. Uncomment and update the .env file with your new values"
        echo ""
        echo "See PINDKEPAR_SETUP_GUIDE.md for detailed instructions"
        echo ""
    fi
else
    echo "❌ .env file not found"
    exit 1
fi

# Check if node_modules exists
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ Dependencies already installed"
else
    echo "📥 Installing dependencies..."
    npm install
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🎯 NEXT STEPS:"
echo ""
echo "1. 🔥 Create Firebase Project:"
echo "   → Go to: https://console.firebase.google.com/"
echo "   → Create project: grampanchayat-pindkepar-lodha"
echo "   → Enable: Authentication, Firestore, Storage"
echo ""
echo "2. 📝 Update .env file with your Firebase credentials"
echo ""
echo "3. 🔧 Initialize Firebase in this project:"
echo "   → Run: firebase login"
echo "   → Run: firebase init"
echo ""
echo "4. 🚀 Deploy Firebase rules:"
echo "   → Run: firebase deploy --only firestore,storage"
echo ""
echo "5. 💻 Start development server:"
echo "   → Run: npm run dev"
echo ""
echo "📖 For detailed guide, read: PINDKEPAR_SETUP_GUIDE.md"
echo ""
echo "════════════════════════════════════════════════════════════════"
