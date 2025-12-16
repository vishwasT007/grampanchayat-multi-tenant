#!/bin/bash

# Quick Script to Add Environment Variables to Vercel
# Run this script to automatically add all Firebase env vars to Vercel

echo "🚀 Adding Firebase Environment Variables to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel
echo "📝 Please login to Vercel..."
vercel login

# Add environment variables
echo "📦 Adding VITE_FIREBASE_API_KEY..."
echo "AIzaSyDZg8nBI53IfImn8-jTUGOVs6G4XeGJh1M" | vercel env add VITE_FIREBASE_API_KEY production

echo "📦 Adding VITE_FIREBASE_AUTH_DOMAIN..."
echo "grampanchayat-f0aa7.firebaseapp.com" | vercel env add VITE_FIREBASE_AUTH_DOMAIN production

echo "📦 Adding VITE_FIREBASE_PROJECT_ID..."
echo "grampanchayat-f0aa7" | vercel env add VITE_FIREBASE_PROJECT_ID production

echo "📦 Adding VITE_FIREBASE_STORAGE_BUCKET..."
echo "grampanchayat-f0aa7.firebasestorage.app" | vercel env add VITE_FIREBASE_STORAGE_BUCKET production

echo "📦 Adding VITE_FIREBASE_MESSAGING_SENDER_ID..."
echo "394538115264" | vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production

echo "📦 Adding VITE_FIREBASE_APP_ID..."
echo "1:394538115264:web:9ecd75d9b17c5d34774d25" | vercel env add VITE_FIREBASE_APP_ID production

echo ""
echo "✅ All environment variables added!"
echo ""
echo "🔄 Now redeploying to production..."
vercel --prod

echo ""
echo "✨ Done! Your site should be live with the correct Firebase configuration."
echo "🌐 Visit: https://www.grampanchayatwarghat.in"
