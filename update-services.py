#!/usr/bin/env python3
"""
Multi-Tenant Service Updater
Updates all service files to use tenant-specific paths
"""

import os
import re

# Map of service files to their collection names
SERVICE_COLLECTION_MAP = {
    'noticesService.js': 'notices',
    'servicesService.js': 'services',
    'schemesService.js': 'schemes',
    'formsService.js': 'forms',
    'galleryService.js': 'gallery',
    'villageStatisticsService.js': 'villages',
    'financialService.js': 'financials',
    'grievancesService.js': 'grievances',
    'pagesService.js': 'pages',
}

def update_service_file(filepath, collection_name):
    """Update a single service file for multi-tenant architecture"""
    
    if not os.path.exists(filepath):
        print(f"  ⚠️  {filepath} not found, skipping...")
        return False
    
    print(f"  📝 Updating {os.path.basename(filepath)}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add paths import if not present
    if "import paths from '../utils/firestorePaths'" not in content:
        # Add after the db import
        content = re.sub(
            r"(import { db } from '../config/firebaseConfig';)",
            r"\1\nimport paths from '../utils/firestorePaths';",
            content
        )
    
    # Replace COLLECTION_NAME constant
    content = re.sub(
        r"const COLLECTION_NAME = '[^']*';",
        f"// Multi-tenant: using paths.{collection_name}()",
        content
    )
    
    # Replace all COLLECTION_NAME usages with paths.collection()
    content = re.sub(
        r'\bCOLLECTION_NAME\b',
        f'paths.{collection_name}()',
        content
    )
    
    # Write updated content
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def main():
    """Main function to update all service files"""
    
    print("🔄 Updating service files for multi-tenant architecture...\n")
    
    services_dir = "src/services"
    updated_count = 0
    
    for service_file, collection_name in SERVICE_COLLECTION_MAP.items():
        filepath = os.path.join(services_dir, service_file)
        
        if update_service_file(filepath, collection_name):
            updated_count += 1
    
    print(f"\n✅ Updated {updated_count} service files successfully!")
    print("\n📋 Next steps:")
    print("  1. Review the updated files")
    print("  2. Update storageService.js manually for storage paths")
    print("  3. Test with: npm run dev")

if __name__ == "__main__":
    main()
