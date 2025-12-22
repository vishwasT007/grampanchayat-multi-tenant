#!/bin/bash

##############################################################################
# Manual GP Deployment Trigger Script
# 
# Use this when Cloud Function automation isn't working
# This script helps you manually trigger GitHub Actions deployment
##############################################################################

GP_ID="$1"

if [ -z "$GP_ID" ]; then
  echo "❌ Error: GP ID is required"
  echo ""
  echo "Usage: ./manual-deploy-gp.sh <gp-id>"
  echo ""
  echo "Example:"
  echo "  ./manual-deploy-gp.sh dongartal"
  echo ""
  exit 1
fi

echo "🚀 Manual Deployment Trigger for GP: $GP_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if GP exists in Firestore
echo "1️⃣  Checking if GP exists in Firestore..."
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const gpId = '$GP_ID';

db.doc(\`globalConfig/metadata/gramPanchayats/\${gpId}\`).get()
  .then(doc => {
    if (doc.exists) {
      const data = doc.data();
      console.log('   ✅ GP exists');
      console.log(\`   Name: \${data.name}\`);
      console.log(\`   Subdomain: \${data.subdomain}\`);
      console.log(\`   Domain Status: \${data.domainStatus}\`);
      console.log('');
      
      if (data.domainStatus !== 'pending') {
        console.log('   ⚠️  Warning: Domain status is not \"pending\"');
        console.log(\`   Current status: \${data.domainStatus}\`);
        console.log('   This GP may have already been deployed!');
        console.log('');
      }
      
      process.exit(0);
    } else {
      console.log('   ❌ GP not found in Firestore!');
      console.log(\`   Please create the GP first via SuperAdmin panel.\`);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('   ❌ Error:', err.message);
    process.exit(1);
  });
"

if [ $? -ne 0 ]; then
  echo "❌ GP check failed. Aborting."
  exit 1
fi

echo "2️⃣  GitHub Actions Manual Trigger"
echo "   Since Cloud Function automation isn't working, you need to:"
echo ""
echo "   👉 Go to: https://github.com/vishwasT007/grampanchayat-multi-tenant/actions/workflows/deploy-gp.yml"
echo ""
echo "   Then:"
echo "   1. Click 'Run workflow' button (top right)"
echo "   2. Enter GP subdomain: gp-$GP_ID"
echo "   3. Click green 'Run workflow' button"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 QUICK REFERENCE:"
echo "   GP ID: $GP_ID"
echo "   Subdomain to use: gp-$GP_ID"
echo "   Workflow URL: https://github.com/vishwasT007/grampanchayat-multi-tenant/actions/workflows/deploy-gp.yml"
echo ""
echo "⏳ After triggering:"
echo "   - Wait 2-3 minutes for deployment"
echo "   - Check: https://github.com/vishwasT007/grampanchayat-multi-tenant/actions"
echo "   - Refresh SuperAdmin ViewGP page to see domain update"
echo ""
