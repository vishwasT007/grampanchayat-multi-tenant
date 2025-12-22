#!/bin/bash

echo "🔧 GitHub Secret Setup for Service Account"
echo "==========================================="
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
    exit 1
fi

echo "✅ JSON is valid"
echo ""

# Generate base64 encoded version
echo "🔄 Encoding to base64..."
BASE64_ENCODED=$(base64 -w 0 serviceAccountKey.json)

echo "✅ Base64 encoding complete"
echo ""
echo "📋 Copy this value and add to GitHub Secrets:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "$BASE64_ENCODED"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 How to add to GitHub:"
echo "1. Go to: https://github.com/vishwasT007/grampanchayat-multi-tenant/settings/secrets/actions"
echo "2. Click 'New repository secret' (or edit existing FIREBASE_SERVICE_ACCOUNT_BASE64)"
echo "3. Name: FIREBASE_SERVICE_ACCOUNT_BASE64"
echo "4. Value: [paste the base64 string above]"
echo "5. Click 'Add secret'"
echo ""
echo "✅ After adding, re-run the failed GitHub Actions workflow"
