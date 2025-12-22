/**
 * Fix Pindkepar Lodha GP domain mismatch
 * 
 * Problem: UI shows gp-pindkeparlodha.web.app but actual site is gp-pindkeparlodha-hrxy7z.web.app
 * Solution: Update Firestore with the actual deployed subdomain
 */

const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
let serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json';

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account file not found at:', serviceAccountPath);
  console.error('Please set GOOGLE_APPLICATION_CREDENTIALS or place serviceAccountKey.json in this directory');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixPindkepar() {
  const gpId = 'pindkeparlodha';
  
  // The ACTUAL deployed site from GitHub Actions logs
  const actualSiteId = 'gp-pindkeparlodha-wsye6o'; // From your logs
  const newSubdomain = actualSiteId;
  const newDomain = `${actualSiteId}.web.app`;
  
  console.log('\n🔍 Current GP data in Firestore:');
  const gpDoc = await db.doc(`globalConfig/metadata/gramPanchayats/${gpId}`).get();
  
  if (!gpDoc.exists) {
    console.error('❌ GP not found:', gpId);
    process.exit(1);
  }
  
  const currentData = gpDoc.data();
  console.log('  - Current subdomain:', currentData.subdomain);
  console.log('  - Current domain:', currentData.domain);
  console.log('  - Current domainStatus:', currentData.domainStatus);
  
  console.log('\n� Will update Firestore to:');
  console.log('  - subdomain:', newSubdomain);
  console.log('  - domain:', newDomain);
  console.log('  - domainStatus: active');
  
  // Read from stdin
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('\nProceed with update? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Cancelled');
      process.exit(0);
    }
    
    try {
      await db.doc(`globalConfig/metadata/gramPanchayats/${gpId}`).set({
        subdomain: newSubdomain,
        domain: newDomain,
        domainStatus: 'active'
      }, { merge: true });
      
      console.log('\n✅ Firestore updated successfully!');
      console.log('🌐 SuperAdmin UI will now show:', newDomain);
      console.log('🔗 Test at: https://' + newDomain);
      console.log('\n💡 Refresh the SuperAdmin page to see the change immediately!');
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Update failed:', error.message);
      process.exit(1);
    }
  });
}

fixPindkepar().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
