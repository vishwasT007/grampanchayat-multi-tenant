/**
 * Delete Old GP Data (Cleanup after fix-gp-id-mismatch.js)
 * 
 * This script deletes the old GP ID data after migration:
 * - Removes: pindkepar-lodha (with hyphen)
 * - Keeps: pindkeparlodha (no hyphen, matches hosting)
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc, collection, getDocs } from 'firebase/firestore';

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

const OLD_GP_ID = 'pindkepar-lodha';

async function deleteOldGP() {
  console.log('⚠️  CAUTION: This will permanently delete old GP data!\n');
  console.log(`GP ID to delete: ${OLD_GP_ID}\n`);
  
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('\n🗑️  Starting deletion...\n');

  try {
    // Delete metadata
    console.log('📋 Deleting metadata...');
    const metadataRef = doc(db, 'globalConfig', 'metadata', 'gramPanchayats', OLD_GP_ID);
    await deleteDoc(metadataRef);
    console.log('✅ Metadata deleted!\n');

    // Delete GP data
    console.log('📂 Deleting GP data...');
    const subcollections = ['users', 'announcements', 'news', 'services', 'schemes', 'members', 'grievances'];
    
    for (const subCol of subcollections) {
      const subRef = collection(db, `gramPanchayats/${OLD_GP_ID}/${subCol}`);
      const snapshot = await getDocs(subRef);
      
      if (!snapshot.empty) {
        console.log(`   Deleting ${snapshot.size} ${subCol}...`);
        for (const docSnap of snapshot.docs) {
          await deleteDoc(docSnap.ref);
        }
        console.log(`   ✅ ${subCol} deleted!`);
      }
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ OLD GP DATA DELETED!                                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`Deleted GP: ${OLD_GP_ID}`);
    console.log(`Active GP: pindkeparlodha\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

deleteOldGP()
  .then(() => {
    console.log('✅ Cleanup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });
