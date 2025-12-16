/**
 * Script to create Super Admin user in Firestore
 * Run with: node scripts/create-super-admin.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import readline from 'readline';

// Firebase configuration (from your project)
const firebaseConfig = {
  apiKey: "AIzaSyB-EAabD_w8z__u92QV5yR6pF9bx_3z-Xk",
  authDomain: "grampanchayat-multi-tenant.firebaseapp.com",
  projectId: "grampanchayat-multi-tenant",
  storageBucket: "grampanchayat-multi-tenant.firebasestorage.app",
  messagingSenderId: "424240831734",
  appId: "1:424240831734:web:28a3dd73f2e7a29c1e96ac",
  measurementId: "G-V8XBBRC1HS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Super Admin Configuration
const SUPER_ADMIN_EMAIL = 'superadmin@grampanchayat.in';
const SUPER_ADMIN_PASSWORD = 'Admin@123456'; // Use the password you set

async function createSuperAdmin() {
  try {
    console.log('🚀 Starting Super Admin Setup...\n');

    // Step 1: Check if user already exists in Auth
    console.log('📧 Email:', SUPER_ADMIN_EMAIL);
    console.log('🔑 Password:', SUPER_ADMIN_PASSWORD);
    console.log('\n⏳ Note: User should already exist in Firebase Auth\n');
    
    // Get the UID from user input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const uid = await new Promise((resolve) => {
      rl.question('Enter the User UID from Firebase Auth: ', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });

    if (!uid) {
      throw new Error('UID is required!');
    }

    console.log('\n✅ Using UID:', uid);

    // Step 2: Create Super Admin document in Firestore
    console.log('\n📝 Creating Super Admin document in Firestore...');
    
    const superAdminRef = doc(db, 'globalConfig', 'superAdmins', 'users', uid);
    
    await setDoc(superAdminRef, {
      uid: uid,
      email: SUPER_ADMIN_EMAIL,
      role: 'superadmin',
      displayName: 'Super Administrator',
      active: true,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      permissions: [
        'manage_gps',
        'create_admins',
        'view_analytics',
        'manage_users',
        'system_settings',
        'view_logs',
        'manage_domains',
        'delete_gps'
      ]
    });

    console.log('✅ Super Admin document created successfully!\n');

    // Step 3: Verification
    console.log('🎉 SETUP COMPLETE!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 Firestore Path:');
    console.log('   globalConfig/superAdmins/users/' + uid);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ You can now login at:');
    console.log('   http://localhost:5173/superadmin/login\n');
    console.log('📧 Email:', SUPER_ADMIN_EMAIL);
    console.log('🔑 Password:', SUPER_ADMIN_PASSWORD);
    console.log('\n⚠️  Remember to change the password after first login!\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error creating Super Admin:', error);
    console.error('\nDetails:', error.message);
    
    if (error.code === 'permission-denied') {
      console.error('\n⚠️  Permission denied! Make sure:');
      console.error('   1. Firestore rules allow write access');
      console.error('   2. You have the correct Firebase credentials');
    }
    
    process.exit(1);
  }
}

// Run the script
createSuperAdmin();
