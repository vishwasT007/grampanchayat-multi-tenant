#!/bin/bash

echo "🔧 Re-upload Service Account to GitHub Secrets"
echo "=============================================="
echo ""

# Check if service account file exists
if [ ! -f "serviceAccountKey.json" ]; then
    echo "❌ Error: serviceAccountKey.json not found!"
    echo ""
    echo "📥 Please download your service account key:"
    echo "1. Go to: https://console.firebase.google.com/project/grampanchayat-multi-tenant/settings/serviceaccounts/adminsdk"
    echo "2. Click 'Generate new private key'"
    echo "3. Save as 'serviceAccountKey.json' in this directory"
    echo ""
    exit 1
fi

echo "✅ Found serviceAccountKey.json"
echo ""

# Validate JSON
if ! jq empty serviceAccountKey.json 2>/dev/null; then
    echo "❌ Error: serviceAccountKey.json is not valid JSON!"
    echo ""
    echo "First 200 characters:"
    head -c 200 serviceAccountKey.json
    echo ""
    exit 1
fi

echo "✅ JSON is valid"
echo ""

# Show service account info
PROJECT_ID=$(jq -r '.project_id' serviceAccountKey.json)
CLIENT_EMAIL=$(jq -r '.client_email' serviceAccountKey.json)

echo "📋 Service Account Info:"
echo "  Project ID: $PROJECT_ID"
echo "  Email: $CLIENT_EMAIL"
echo ""

# Create properly formatted JSON for GitHub secret
echo "🔄 Formatting JSON for GitHub secret..."
echo ""

# Option 1: Minified JSON (recommended)
MINIFIED_JSON=$(jq -c . serviceAccountKey.json)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "OPTION 1: Use Minified JSON (RECOMMENDED)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Copy the text below (starts with { and ends with }):"
echo ""
echo "$MINIFIED_JSON"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Option 2: Base64 encoded (alternative)
BASE64_ENCODED=$(base64 -w 0 serviceAccountKey.json)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "OPTION 2: Use Base64 Encoded (ALTERNATIVE)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Copy the text below:"
echo ""
echo "$BASE64_ENCODED"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📝 How to update GitHub Secret:"
echo ""
echo "1. Go to: https://github.com/vishwasT007/grampanchayat-multi-tenant/settings/secrets/actions"
echo ""
echo "2. OPTION 1 (Recommended):"
echo "   - Click 'Update' on FIREBASE_SERVICE_ACCOUNT"
echo "   - Paste the MINIFIED JSON (from Option 1 above)"
echo "   - Click 'Update secret'"
echo ""
echo "3. OPTION 2 (Alternative):"
echo "   - Click 'New repository secret'"
echo "   - Name: FIREBASE_SERVICE_ACCOUNT_BASE64"
echo "   - Value: Paste the BASE64 string (from Option 2 above)"
echo "   - Click 'Add secret'"
echo "   - Then DELETE the old FIREBASE_SERVICE_ACCOUNT secret"
echo ""
echo "✅ After updating, the workflow will use the correct service account!"
echo ""

# Test locally
echo "🧪 Testing service account locally..."
if command -v node &> /dev/null; then
    export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
    
    node -e "
    const admin = require('firebase-admin');
    const serviceAccount = require('./serviceAccountKey.json');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('✅ Service account initialized successfully!');
    console.log('📦 Testing Firestore connection...');
    
    const db = admin.firestore();
    db.collection('globalConfig').doc('metadata').get()
      .then(() => {
        console.log('✅ Firestore connection successful!');
        process.exit(0);
      })
      .catch(err => {
        console.error('❌ Firestore connection failed:', err.message);
        process.exit(1);
      });
    " 2>&1
else
    echo "⚠️  Node.js not found, skipping local test"
fi
