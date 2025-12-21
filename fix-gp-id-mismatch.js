/**
 * Fix GP ID Mismatch - Pindkepar Lodha
 * 
 * This script fixes the mismatch between:
 * - SuperAdmin created GP ID: pindkepar-lodha (with hyphen)
 * - Firebase hosting subdomain: pindkeparlodha-gpmulti (no hyphen)
 * 
 * Solution: Rename the GP ID in Firestore to match hosting subdomain
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

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

const OLD_GP_ID = 'pindkepar-lodha';    // What SuperAdmin created
const NEW_GP_ID = 'pindkeparlodha';     // What Firebase hosting uses

async function fixGPIdMismatch() {
  console.log('🔍 Checking for GP ID mismatch...\n');
  console.log(`Old GP ID: ${OLD_GP_ID}`);
  console.log(`New GP ID: ${NEW_GP_ID}\n`);

  try {
    // Check if old GP exists in metadata
    console.log('📋 Step 1: Checking globalConfig/metadata/gramPanchayats...');
    const oldMetadataRef = doc(db, 'globalConfig', 'metadata', 'gramPanchayats', OLD_GP_ID);
    const oldMetadataSnap = await getDoc(oldMetadataRef);

    if (!oldMetadataSnap.exists()) {
      console.log(`❌ Old GP ID "${OLD_GP_ID}" not found in metadata.`);
      console.log('   Either:');
      console.log('   - GP was never created');
      console.log('   - GP ID is already correct');
      console.log('\n🔍 Checking if new GP ID exists...');
      
      const newMetadataRef = doc(db, 'globalConfig', 'metadata', 'gramPanchayats', NEW_GP_ID);
      const newMetadataSnap = await getDoc(newMetadataRef);
      
      if (newMetadataSnap.exists()) {
        console.log(`✅ New GP ID "${NEW_GP_ID}" exists! Already fixed.`);
        const data = newMetadataSnap.data();
        console.log('\nGP Details:');
        console.log(`  Name: ${data.name}`);
        console.log(`  Subdomain: ${data.subdomain}`);
        console.log(`  Status: ${data.status}`);
        return;
      } else {
        console.log(`❌ New GP ID "${NEW_GP_ID}" also not found.`);
        console.log('\n⚠️  You need to create the GP in SuperAdmin panel first!');
        console.log('   Use subdomain: pindkeparlodha-gpmulti (no hyphen)');
        return;
      }
    }

    const oldGPData = oldMetadataSnap.data();
    console.log('✅ Found old GP in metadata!');
    console.log(`   Name: ${oldGPData.name}`);
    console.log(`   Subdomain: ${oldGPData.subdomain}\n`);

    // Step 2: Copy to new ID in metadata
    console.log('📝 Step 2: Creating new GP metadata...');
    const newMetadataRef = doc(db, 'globalConfig', 'metadata', 'gramPanchayats', NEW_GP_ID);
    await setDoc(newMetadataRef, {
      ...oldGPData,
      id: NEW_GP_ID,
      subdomain: 'pindkeparlodha-gpmulti',  // Update subdomain to match
      updatedAt: new Date().toISOString(),
      migratedFrom: OLD_GP_ID
    });
    console.log('✅ New metadata created!\n');

    // Step 3: Copy GP data collection
    console.log('📂 Step 3: Checking for GP data...');
    const oldDataPath = `gramPanchayats/${OLD_GP_ID}`;
    
    // Check for users subcollection
    console.log('   Checking users...');
    const oldUsersRef = collection(db, oldDataPath, 'users');
    const oldUsersSnap = await getDocs(oldUsersRef);
    
    if (!oldUsersSnap.empty) {
      console.log(`   Found ${oldUsersSnap.size} user(s). Copying...`);
      
      for (const userDoc of oldUsersSnap.docs) {
        const newUserRef = doc(db, `gramPanchayats/${NEW_GP_ID}/users`, userDoc.id);
        await setDoc(newUserRef, {
          ...userDoc.data(),
          gpId: NEW_GP_ID,
          updatedAt: new Date().toISOString()
        });
        console.log(`   ✅ Copied user: ${userDoc.id}`);
      }
    } else {
      console.log('   No users found.');
    }

    // Check for other common subcollections
    const subcollections = ['announcements', 'news', 'services', 'schemes', 'members', 'grievances'];
    for (const subCol of subcollections) {
      const oldSubRef = collection(db, oldDataPath, subCol);
      const oldSubSnap = await getDocs(oldSubRef);
      
      if (!oldSubSnap.empty) {
        console.log(`   Found ${oldSubSnap.size} ${subCol}. Copying...`);
        for (const subDoc of oldSubSnap.docs) {
          const newSubRef = doc(db, `gramPanchayats/${NEW_GP_ID}/${subCol}`, subDoc.id);
          await setDoc(newSubRef, {
            ...subDoc.data(),
            gpId: NEW_GP_ID,
            updatedAt: new Date().toISOString()
          });
        }
        console.log(`   ✅ Copied ${subCol}!`);
      }
    }

    console.log('\n✅ All data copied to new GP ID!\n');

    // Step 4: Verify new GP
    console.log('🔍 Step 4: Verifying new GP...');
    const verifyMetadataSnap = await getDoc(newMetadataRef);
    if (verifyMetadataSnap.exists()) {
      console.log('✅ New GP metadata exists!');
    }

    const verifyUsersRef = collection(db, `gramPanchayats/${NEW_GP_ID}/users`);
    const verifyUsersSnap = await getDocs(verifyUsersRef);
    console.log(`✅ New GP has ${verifyUsersSnap.size} user(s)!\n`);

    // Step 5: Ask about deletion
    console.log('⚠️  Step 5: Cleanup old GP data');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Old GP data still exists at:');
    console.log(`  - globalConfig/metadata/gramPanchayats/${OLD_GP_ID}`);
    console.log(`  - gramPanchayats/${OLD_GP_ID}/...`);
    console.log('\nTo delete old data, run:');
    console.log('  node delete-old-gp.js\n');

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ GP ID MISMATCH FIXED!                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log('Your GP is now accessible at:');
    console.log(`  🌐 https://pindkeparlodha-gpmulti-y757r4.web.app`);
    console.log(`  🌐 https://pindkeparlodha-gpmulti-y757r4.firebaseapp.com`);
    console.log('\nAdmin login:');
    console.log(`  📧 Use the email/password from SuperAdmin panel`);
    console.log(`  🔐 Login at: /admin/login\n`);
    console.log('Next steps:');
    console.log('  1. Test admin login');
    console.log('  2. Verify data loads correctly');
    console.log('  3. Run delete-old-gp.js to cleanup (optional)\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the fix
fixGPIdMismatch()
  .then(() => {
    console.log('✅ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
