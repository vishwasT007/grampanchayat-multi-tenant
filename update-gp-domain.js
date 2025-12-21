/**
 * Update GP Domain in Firestore
 * 
 * This script updates the domain field in Firestore to match the actual
 * Firebase Hosting URL that was created.
 * 
 * Usage: node update-gp-domain.js <gpId> <actualDomain>
 * Example: node update-gp-domain.js pindkeparlodha pindkepar-lodha-gpmulti-lp9lcu.web.app
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

// Firebase config from .env
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

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('❌ Usage: node update-gp-domain.js <gpId> <actualDomain>');
  console.log('   Example: node update-gp-domain.js pindkeparlodha pindkepar-lodha-gpmulti-lp9lcu.web.app');
  process.exit(1);
}

const GP_ID = args[0];
const ACTUAL_DOMAIN = args[1];

async function updateGPDomain() {
  console.log('🔄 Updating GP domain in Firestore...\n');
  console.log(`GP ID: ${GP_ID}`);
  console.log(`New Domain: ${ACTUAL_DOMAIN}\n`);

  try {
    // Check if GP exists
    const gpRef = doc(db, 'globalConfig', 'metadata', 'gramPanchayats', GP_ID);
    const gpSnap = await getDoc(gpRef);

    if (!gpSnap.exists()) {
      console.log(`❌ GP with ID "${GP_ID}" not found!`);
      console.log('\nAvailable GP IDs might be:');
      console.log('  - pindkeparlodha');
      console.log('  - pindkepar-lodha');
      console.log('\nTry checking Firestore: globalConfig/metadata/gramPanchayats/');
      process.exit(1);
    }

    const gpData = gpSnap.data();
    console.log('✅ Found GP in Firestore!');
    console.log(`   Name: ${gpData.name}`);
    console.log(`   Current Domain: ${gpData.domain || 'Not set'}`);
    console.log(`   Subdomain: ${gpData.subdomain}\n`);

    // Update domain
    console.log('📝 Updating domain...');
    await updateDoc(gpRef, {
      domain: ACTUAL_DOMAIN,
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Domain updated successfully!\n');

    // Verify update
    const verifySnap = await getDoc(gpRef);
    const verifyData = verifySnap.data();
    
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ GP DOMAIN UPDATED!                                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log('GP Details:');
    console.log(`  Name:        ${verifyData.name}`);
    console.log(`  GP ID:       ${GP_ID}`);
    console.log(`  Domain:      ${verifyData.domain}`);
    console.log(`  Subdomain:   ${verifyData.subdomain}\n`);
    console.log('🌐 Your GP is now accessible at:');
    console.log(`   https://${verifyData.domain}\n`);
    console.log('📋 Next Steps:');
    console.log('   1. Visit: https://' + verifyData.domain);
    console.log('   2. Test admin login: https://' + verifyData.domain + '/admin/login');
    console.log('   3. Use credentials from SuperAdmin panel\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the update
updateGPDomain()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
