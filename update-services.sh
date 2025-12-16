#!/bin/bash

# Script to update all service files for multi-tenant architecture
# Replaces COLLECTION_NAME with paths.COLLECTION()

echo "🔄 Updating service files for multi-tenant architecture..."

# Services to update
services=(
  "noticesService"
  "servicesService"
  "schemesService"
  "formsService"
  "galleryService"
  "villageStatisticsService"
  "financialService"
  "grievancesService"
  "pagesService"
)

# Update each service file
for service in "${services[@]}"; do
  file="src/services/${service}.js"
  
  if [ -f "$file" ]; then
    echo "  📝 Updating $file..."
    
    # Add import for paths at the top (after other imports)
    if ! grep -q "import paths from" "$file"; then
      sed -i "/import { db } from/a import paths from '../utils/firestorePaths';" "$file"
    fi
    
    # Replace collection name variable declarations
    sed -i "s/const COLLECTION_NAME = 'notices'/\/\/ Multi-tenant: using paths.notices()/g" "$file"
    sed -i "s/const COLLECTION_NAME = 'services'/\/\/ Multi-tenant: using paths.services()/g" "$file"
    sed -i "s/const COLLECTION_NAME = 'schemes'/\/\/ Multi-tenant: using paths.schemes()/g" "$file"
    sed -i "s/const COLLECTION_NAME = 'forms'/\/\/ Multi-tenant: using paths.forms()/g" "$file"
    sed -i "s/const COLLECTION_NAME = 'gallery'/\/\/ Multi-tenant: using paths.gallery()/g" "$file"
    sed -i "s/const COLLECTION_NAME = 'villages'/\/\/ Multi-tenant: using paths.villages()/g" "$file"
    sed -i "s/const COLLECTION_NAME = 'financials'/\/\/ Multi-tenant: using paths.financials()/g" "$file"
    sed -i "s/const COLLECTION_NAME = 'grievances'/\/\/ Multi-tenant: using paths.grievances()/g" "$file"
    sed -i "s/const COLLECTION_NAME = 'pages'/\/\/ Multi-tenant: using paths.pages()/g" "$file"
    
  else
    echo "  ⚠️  $file not found, skipping..."
  fi
done

echo "✅ Service files updated!"
echo ""
echo "⚠️  NOTE: You need to manually replace COLLECTION_NAME with appropriate paths.X() in each file"
echo "   Example: COLLECTION_NAME -> paths.notices()"
