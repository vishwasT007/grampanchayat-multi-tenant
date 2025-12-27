#!/usr/bin/env node

/**
 * Create Admin User in DEVELOPMENT Firebase
 * 
 * This script creates an admin user in the DEVELOPMENT Firebase project
 * (grampanchayat-dev) for local testing purposes.
 * 
 * ⚠️  This does NOT affect production Firebase!
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as readline from 'readline';

// DEVELOPMENT Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAYLsu3pN6daniMe2EOUD2bOzRhWclNlE",
  authDomain: "grampanchayat-dev.firebaseapp.com",
  projectId: "grampanchayat-dev",
  storageBucket: "grampanchayat-dev.firebasestorage.app",
  messagingSenderId: "1012133622988",
  appId: "1:1012133622988:web:64c6eb01ddd61f4affbe69"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                              ║');
console.log('║          🔐 Create Admin User in DEVELOPMENT Firebase                       ║');
console.log('║                                                                              ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

console.log('🔥 Firebase Project: grampanchayat-dev (DEVELOPMENT)');
console.log('🌐 Auth Domain: grampanchayat-dev.firebaseapp.com');
console.log('');
console.log('⚠️  This will create a user in DEVELOPMENT Firebase only.');
console.log('✅ Production Firebase (grampanchayat-multi-tenant) is NOT affected.\n');

async function createAdminUser() {
  try {
    // Get tenant ID
    const tenant = await question('Enter Tenant ID (e.g., pindkepar): ');
    if (!tenant.trim()) {
      console.error('❌ Tenant ID is required!');
      process.exit(1);
    }

    // Get email
    const defaultEmail = `admin@${tenant}.in`;
    const emailInput = await question(`Enter admin email (default: ${defaultEmail}): `);
    const email = emailInput.trim() || defaultEmail;

    // Get password
    const passwordInput = await question('Enter password (min 8 chars, or press Enter for default): ');
    const password = passwordInput.trim() || 'DevAdmin@123';

    // Get name
    const nameInput = await question('Enter admin name (default: Admin): ');
    const name = nameInput.trim() || 'Admin';

    console.log('\n📋 Creating admin user with:');
    console.log(`   Tenant: ${tenant}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Name: ${name}`);
    console.log('');

    const confirm = await question('Proceed? (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Cancelled.');
      process.exit(0);
    }

    console.log('\n📧 Creating authentication user...');
    
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Authentication user created!');
    console.log(`   User UID: ${user.uid}`);
    console.log('');
    
    // Add user data to Firestore
    console.log('📝 Adding user data to Firestore...');
    
    await setDoc(doc(db, 'gramPanchayats', tenant, 'users', user.uid), {
      email: email,
      role: 'superAdmin',
      active: true,
      name: {
        en: name,
        hi: name
      },
      createdAt: new Date().toISOString(),
      createdBy: 'development-script',
      tenant: tenant
    });
    
    console.log('✅ User data added to Firestore!');
    console.log('');
    
    console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                              ║');
    console.log('║                      ✅ ADMIN USER CREATED SUCCESSFULLY!                     ║');
    console.log('║                                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
    
    console.log('📌 Login Credentials (for DEVELOPMENT only):');
    console.log('');
    console.log(`   🌐 URL: http://localhost:5173/?tenant=${tenant}`);
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔑 Password: ${password}`);
    console.log(`   👤 Role: Super Admin`);
    console.log('');
    console.log('💡 TIP: Change the password after first login!');
    console.log('');
    console.log('🎯 You can now:');
    console.log('   1. Login to your development site');
    console.log('   2. Test admin features');
    console.log('   3. Create content, manage settings, etc.');
    console.log('   4. All data stays in DEVELOPMENT Firebase!');
    console.log('');
    console.log('🔒 Production Firebase (grampanchayat-multi-tenant) is completely safe!');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Error creating admin user:');
    
    if (error.code === 'auth/email-already-in-use') {
      console.error('   This email is already registered in DEVELOPMENT Firebase.');
      console.error('   Try a different email or login with existing credentials.');
    } else if (error.code === 'auth/invalid-email') {
      console.error('   Invalid email format.');
    } else if (error.code === 'auth/weak-password') {
      console.error('   Password is too weak. Use at least 6 characters.');
    } else {
      console.error(`   ${error.code}: ${error.message}`);
    }
    
    console.error('');
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

createAdminUser();
