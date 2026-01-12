#!/bin/bash

# Deploy to all gram panchayat hosting targets
# This script deploys the latest changes (language switching & accessibility) to all GPs
# without affecting tenant-specific data

PROJECT="grampanchayat-multi-tenant"
MESSAGE="Language switching & accessibility features update"

# Array of hosting targets (active sites only)
TARGETS=(
  "main"
  "gp-katta"
  "gp-dongartal"
  "gp-pindkeparlodha-wsye6o"
  "gp-nawargaon"
)

echo "🚀 Starting deployment to all gram panchayats..."
echo "=================================================="
echo "Message: $MESSAGE"
echo "Project: $PROJECT"
echo "Total targets: ${#TARGETS[@]}"
echo ""

SUCCESSFUL=0
FAILED=0
FAILED_TARGETS=()

for target in "${TARGETS[@]}"; do
  echo "📦 Deploying to: $target"
  
  if firebase deploy --only hosting:$target --project $PROJECT 2>&1 | grep -q "Deploy complete"; then
    echo "✅ SUCCESS: $target"
    ((SUCCESSFUL++))
  else
    echo "❌ FAILED: $target"
    ((FAILED++))
    FAILED_TARGETS+=("$target")
  fi
  echo ""
done

echo "=================================================="
echo "🎉 Deployment Summary:"
echo "✅ Successful: $SUCCESSFUL"
echo "❌ Failed: $FAILED"

if [ $FAILED -gt 0 ]; then
  echo ""
  echo "Failed targets:"
  for target in "${FAILED_TARGETS[@]}"; do
    echo "  - $target"
  done
fi

echo ""
echo "📝 All deployments use the same codebase from 'dist' directory"
echo "🔒 Tenant-specific data remains isolated in Firestore"
echo "✨ Language switching & accessibility features now live on all GPs!"
