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
  
  // Get the actual deployed site ID from user input
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
  
  console.log('\n📋 What is the ACTUAL deployed site ID?');
  console.log('   (Check GitHub Actions logs or Firebase Console)');
  console.log('   Example: gp-pindkeparlodha-hrxy7z');
  console.log('');
  
  // Read from stdin
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('Enter actual site ID: ', async (actualSiteId) => {
    actualSiteId = actualSiteId.trim();
    
    if (!actualSiteId) {
      console.error('❌ No site ID provided');
      process.exit(1);
    }
    
    const newSubdomain = actualSiteId;
    const newDomain = `${actualSiteId}.web.app`;
    
    console.log('\n📝 Will update Firestore to:');
    console.log('  - subdomain:', newSubdomain);
    console.log('  - domain:', newDomain);
    console.log('  - domainStatus: active');
    
    readline.question('\nProceed? (yes/no): ', async (answer) => {
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
        
        process.exit(0);
      } catch (error) {
        console.error('❌ Update failed:', error.message);
        process.exit(1);
      }
    });
  });
}

fixPindkepar().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
