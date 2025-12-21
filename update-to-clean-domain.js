#!/usr/bin/env node

/**
 * Update domain to clean URL
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDG66cHjhgPdYF9y2neYWW3RRKIu8PVogo",
  authDomain: "grampanchayat-multi-tenant.firebaseapp.com",
  projectId: "grampanchayat-multi-tenant",
  storageBucket: "grampanchayat-multi-tenant.firebasestorage.app",
  messagingSenderId: "429112720520",
  appId: "1:429112720520:web:61adde46b8bb1b93e61e82",
  measurementId: "G-RDLWCQVTLP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateToCleanDomain() {
  try {
    console.log('\n🔧 Updating to clean domain...\n');
    
    const gpRef = doc(db, 'globalConfig', 'metadata', 'gramPanchayats', 'pindkeparlodha');
    
    await updateDoc(gpRef, {
      subdomain: 'gp-pindkeparlodha',
      domain: 'gp-pindkeparlodha.web.app',
      lastUpdated: new Date().toISOString()
    });

    console.log('✅ SUCCESS!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Clean URL: https://gp-pindkeparlodha.web.app');
    console.log('✅ Subdomain: gp-pindkeparlodha');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔄 Refresh SuperAdmin to see the change!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Update manually in Firebase Console:');
    console.error('   subdomain: gp-pindkeparlodha');
    console.error('   domain: gp-pindkeparlodha.web.app\n');
  }
}

updateToCleanDomain();
