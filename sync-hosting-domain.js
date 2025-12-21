/**
 * Firebase Hosting Domain Sync Utility
 * 
 * This utility automatically detects the actual Firebase Hosting site ID
 * and updates the GP domain in Firestore.
 * 
 * Usage:
 * 1. From SuperAdmin panel: Click "Sync Domain" button on GP details page
 * 2. From script: node sync-hosting-domain.js <gpId>
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBSphSJBUj0iLmTPtGTvWRumKI2DGOZMlE",
  authDomain: "grampanchayat-multi-tenant.firebaseapp.com",
  projectId: "grampanchayat-multi-tenant",
  storageBucket: "grampanchayat-multi-tenant.firebasestorage.app",
  messagingSenderId: "997584425664",
  appId: "1:997584425664:web:2af5e2bb39e7e2e1f50c3e",
  measurementId: "G-EMSZ4NQRPK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Read .firebaserc to get actual hosting site IDs
 */
function getHostingSitesFromConfig() {
  try {
    const firebasercPath = join(__dirname, '.firebaserc');
    const firebaserc = JSON.parse(readFileSync(firebasercPath, 'utf8'));
    
    const targets = firebaserc.targets?.['grampanchayat-multi-tenant']?.hosting || {};
    return targets;
  } catch (error) {
    console.error('Error reading .firebaserc:', error);
    return {};
  }
}

/**
 * Find the actual Firebase hosting site for a GP
 */
async function findActualHostingSite(gpId, currentSubdomain) {
  console.log('🔍 Finding actual hosting site...');
  console.log('   GP ID:', gpId);
  console.log('   Current subdomain:', currentSubdomain);
  
  // Get all hosting sites from .firebaserc
  const hostingSites = getHostingSitesFromConfig();
  console.log('\n📋 Available hosting sites:', Object.keys(hostingSites));
  
  // Extract base name from current subdomain (remove -gpmulti and any suffix)
  const baseName = currentSubdomain.replace(/-gpmulti.*$/, '');
  console.log('   Base name:', baseName);
  
  // Find matching sites
  const matchingSites = Object.keys(hostingSites).filter(siteKey => {
    const siteId = hostingSites[siteKey][0]; // Get first site in array
    return siteId.startsWith(baseName) && siteId.includes('-gpmulti');
  });
  
  console.log('\n✅ Matching sites found:', matchingSites);
  
  if (matchingSites.length === 0) {
    console.log('⚠️  No matching site found in .firebaserc');
    return null;
  }
  
  if (matchingSites.length > 1) {
    console.log('⚠️  Multiple matching sites found. Using the longest match (most specific).');
    // Sort by length descending (longest = most specific)
    matchingSites.sort((a, b) => {
      const aId = hostingSites[a][0];
      const bId = hostingSites[b][0];
      return bId.length - aId.length;
    });
  }
  
  const actualSiteKey = matchingSites[0];
  const actualSiteId = hostingSites[actualSiteKey][0];
  
  console.log('\n🎯 Selected site:', actualSiteId);
  return actualSiteId;
}

/**
 * Sync domain for a specific GP
 */
async function syncGPDomain(gpId) {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🔄 SYNCING FIREBASE HOSTING DOMAIN                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    // Get current GP data
    const gpRef = doc(db, 'globalConfig', 'metadata', 'gramPanchayats', gpId);
    const gpSnap = await getDoc(gpRef);
    
    if (!gpSnap.exists()) {
      console.log('❌ GP not found:', gpId);
      return { success: false, error: 'GP not found' };
    }
    
    const gpData = gpSnap.data();
    const currentDomain = gpData.domain || '';
    const currentSubdomain = gpData.subdomain || '';
    
    console.log('📊 Current GP Data:');
    console.log('   Name:', gpData.name);
    console.log('   Current domain:', currentDomain);
    console.log('   Current subdomain:', currentSubdomain);
    console.log('');
    
    // Find actual hosting site
    const actualSite = await findActualHostingSite(gpId, currentSubdomain);
    
    if (!actualSite) {
      console.log('\n❌ Could not find matching hosting site in .firebaserc');
      console.log('   Please ensure the site is deployed and configured.');
      return { success: false, error: 'Site not found in Firebase configuration' };
    }
    
    const newDomain = `${actualSite}.web.app`;
    
    // Check if update is needed
    if (currentSubdomain === actualSite && currentDomain === newDomain) {
      console.log('\n✅ Domain is already up to date!');
      console.log('   No changes needed.');
      return {
        success: true,
        message: 'Domain already up to date',
        domain: newDomain,
        subdomain: actualSite
      };
    }
    
    // Update the domain
    console.log('\n📝 Updating GP domain...');
    console.log('   Old domain:', currentDomain);
    console.log('   New domain:', newDomain);
    console.log('   Old subdomain:', currentSubdomain);
    console.log('   New subdomain:', actualSite);
    
    await updateDoc(gpRef, {
      domain: newDomain,
      subdomain: actualSite,
      lastDomainSync: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log('\n✅ Domain updated successfully!');
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ SYNC COMPLETE                                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('🌐 GP is now accessible at:');
    console.log(`   https://${newDomain}`);
    console.log('');
    console.log('🔐 Admin login:');
    console.log(`   https://${newDomain}/admin/login`);
    console.log('');
    
    return {
      success: true,
      message: 'Domain synced successfully',
      oldDomain: currentDomain,
      newDomain,
      oldSubdomain: currentSubdomain,
      newSubdomain: actualSite
    };
    
  } catch (error) {
    console.error('\n❌ Error syncing domain:', error);
    throw error;
  }
}

/**
 * Sync all GP domains
 */
async function syncAllGPDomains() {
  try {
    console.log('🔄 Syncing all GP domains...\n');
    
    // This would require listing all GPs
    // For now, we'll just provide instructions
    console.log('To sync all GPs, run this script for each GP individually:');
    console.log('  node sync-hosting-domain.js <gpId>');
    console.log('');
    console.log('Available GP IDs can be found in SuperAdmin panel.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// CLI usage
if (process.argv.length > 2) {
  const gpId = process.argv[2];
  
  if (gpId === '--all') {
    syncAllGPDomains()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
      });
  } else {
    syncGPDomain(gpId)
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
      });
  }
} else {
  console.log('Usage: node sync-hosting-domain.js <gpId>');
  console.log('   or: node sync-hosting-domain.js --all');
  console.log('');
  console.log('Example: node sync-hosting-domain.js pindkeparlodha');
  process.exit(1);
}

// Export for use in SuperAdmin panel
export { syncGPDomain, findActualHostingSite };
