#!/usr/bin/env node

/**
 * ONE-CLICK DOMAIN UPDATE
 * Updates the GP domain directly in Firestore
 * Run: node update-domain-now.js pindkeparlodha pindkepar-lodha-gpmulti-lp9lcu
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase config
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
const auth = getAuth(app);

async function updateDomain() {
  const gpId = process.argv[2] || 'pindkeparlodha';
  const newSubdomain = process.argv[3] || 'pindkepar-lodha-gpmulti-lp9lcu';
  const newDomain = `${newSubdomain}.web.app`;

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  🔧 ONE-CLICK DOMAIN UPDATE                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`📋 GP ID: ${gpId}`);
  console.log(`🌐 New Subdomain: ${newSubdomain}`);
  console.log(`🔗 New Domain: ${newDomain}\n`);

  try {
    // You need to be authenticated to update
    console.log('⚠️  Authentication Required!');
    console.log('\nPlease provide SuperAdmin credentials:');
    
    const email = 'vishwast1712@gmail.com'; // Your superadmin email
    console.log(`📧 Email: ${email}`);
    console.log('🔑 Password: (enter below)\n');

    // Read password from stdin
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('Password: ', async (password) => {
      readline.close();

      try {
        console.log('\n🔐 Signing in...');
        await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Authenticated!\n');

        console.log('📝 Updating Firestore...');
        const gpRef = doc(db, 'globalConfig', 'metadata', 'gramPanchayats', gpId);
        
        await updateDoc(gpRef, {
          subdomain: newSubdomain,
          domain: newDomain,
          lastUpdated: new Date().toISOString()
        });

        console.log('\n✅ SUCCESS! Domain updated!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Subdomain: ${newSubdomain}`);
        console.log(`✅ Domain: ${newDomain}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🔄 Refresh the SuperAdmin page to see changes!\n');

        process.exit(0);
      } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\n💡 Make sure you use your SuperAdmin credentials!');
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

updateDomain();
