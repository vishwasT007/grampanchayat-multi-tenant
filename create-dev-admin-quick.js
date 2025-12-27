#!/usr/bin/env node

/**
 * Quick Create Development Admin User
 * 
 * Creates admin@pindkepar.in with default password in DEVELOPMENT Firebase
 * 
 * ⚠️  This does NOT affect production Firebase!
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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
  const tenant = 'pindkepar';
  const email = 'admin@pindkepar.in';
  const password = 'DevAdmin@123';
  const name = 'Dev Admin';

  try {
    console.log('📋 Creating admin user with:');
    console.log(`   Tenant: ${tenant}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Name: ${name}`);
    console.log('');

    console.log('📧 Creating authentication user...');
    
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
    console.log('💡 TIP: You can change the password after first login!');
    console.log('');
    console.log('🎯 You can now:');
    console.log('   1. Login to your development site');
    console.log('   2. Test admin features');
    console.log('   3. Create content, manage settings, etc.');
    console.log('   4. All data stays in DEVELOPMENT Firebase!');
    console.log('');
    console.log('🔒 Production Firebase (grampanchayat-multi-tenant) is completely safe!');
    console.log('');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error creating admin user:');
    
    if (error.code === 'auth/email-already-in-use') {
      console.error('   This email is already registered in DEVELOPMENT Firebase.');
      console.error('');
      console.error('✅ Good news! You can still use these credentials to login:');
      console.error('');
      console.error(`   🌐 URL: http://localhost:5173/?tenant=${tenant}`);
      console.error(`   📧 Email: ${email}`);
      console.error(`   🔑 Password: ${password}`);
      console.error('');
      console.error('💡 If you forgot the password, delete the user from Firebase Console');
      console.error('   and run this script again.');
      console.error('');
    } else if (error.code === 'auth/invalid-email') {
      console.error('   Invalid email format.');
    } else if (error.code === 'auth/weak-password') {
      console.error('   Password is too weak. Use at least 6 characters.');
    } else {
      console.error(`   ${error.code}: ${error.message}`);
    }
    
    console.error('');
    process.exit(1);
  }
}

createAdminUser();
