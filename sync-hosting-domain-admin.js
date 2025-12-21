/**
 * Firebase Hosting Domain Sync with Admin SDK
 * 
 * This version uses Firebase Admin SDK to bypass security rules
 * and automatically update GP domains in Firestore.
 * 
 * Usage:
 * GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json node sync-hosting-domain-admin.js <gpId>
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
let serviceAccount;
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    serviceAccount = JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
  } else {
    console.log('⚠️  No service account provided. Attempting with application default credentials...');
  }
} catch (error) {
  console.error('❌ Error loading service account:', error.message);
  process.exit(1);
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'grampanchayat-multi-tenant'
  });
} else {
  admin.initializeApp({
    projectId: 'grampanchayat-multi-tenant'
  });
}

const db = admin.firestore();

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
function findActualHostingSite(gpId, currentSubdomain) {
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
 * Sync domain for a specific GP (with Admin SDK - bypasses security rules)
 */
async function syncGPDomain(gpId) {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  🔄 SYNCING FIREBASE HOSTING DOMAIN (Admin SDK)          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    // Get current GP data
    const gpRef = db.collection('globalConfig').doc('metadata').collection('gramPanchayats').doc(gpId);
    const gpSnap = await gpRef.get();
    
    if (!gpSnap.exists) {
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
    const actualSite = findActualHostingSite(gpId, currentSubdomain);
    
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
    
    // Update the domain using Admin SDK (bypasses security rules!)
    console.log('\n📝 Updating GP domain...');
    console.log('   Old domain:', currentDomain);
    console.log('   New domain:', newDomain);
    console.log('   Old subdomain:', currentSubdomain);
    console.log('   New subdomain:', actualSite);
    
    await gpRef.update({
      domain: newDomain,
      subdomain: actualSite,
      lastDomainSync: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
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

// CLI usage
if (process.argv.length > 2) {
  const gpId = process.argv[2];
  
  syncGPDomain(gpId)
    .then(() => {
      console.log('✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
} else {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Firebase Hosting Domain Sync (Admin SDK)                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Usage: node sync-hosting-domain-admin.js <gpId>');
  console.log('');
  console.log('Example:');
  console.log('  node sync-hosting-domain-admin.js pindkeparlodha');
  console.log('');
  console.log('Note: This script requires Firebase Admin SDK credentials.');
  console.log('Set the GOOGLE_APPLICATION_CREDENTIALS environment variable:');
  console.log('  export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json');
  console.log('');
  process.exit(1);
}
