import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB67ZvBQ7DLy3nErDuWSorBtbwgKeoWCw4",
  authDomain: "grampanchayat-multi-tenant.firebaseapp.com",
  projectId: "grampanchayat-multi-tenant",
  storageBucket: "grampanchayat-multi-tenant.firebasestorage.app",
  messagingSenderId: "595321745876",
  appId: "1:595321745876:web:3073e006f4a418207e2641"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                              ║');
console.log('║              🔐 Creating Admin User for Pindkepar GP                         ║');
console.log('║                                                                              ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

async function createAdminUser() {
  const tenant = 'pindkepar';
  const email = 'admin@pindkepar.in';
  const password = 'Admin@123456'; // Change this after first login!
  
  try {
    console.log('📧 Creating authentication user...');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('');
    
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
        en: 'Super Admin',
        hi: 'सुपर व्यवस्थापक'
      },
      createdAt: new Date(),
      tenant: tenant
    });
    
    console.log('✅ User data added to Firestore!');
    console.log('');
    
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('                    🎉 Admin User Created Successfully! 🎉');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('─────────────────────');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    console.log('');
    console.log('🔗 Login URL:');
    console.log('─────────────');
    console.log('   http://localhost:5173/admin/login');
    console.log('');
    console.log('📊 User Details:');
    console.log('────────────────');
    console.log(`   User UID: ${user.uid}`);
    console.log(`   Role:     superAdmin`);
    console.log(`   Tenant:   ${tenant}`);
    console.log(`   Active:   true`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('✅ Next Steps:');
    console.log('──────────────');
    console.log('1. Go to: http://localhost:5173/admin/login');
    console.log('2. Login with the credentials above');
    console.log('3. Change your password in settings');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('');
    console.error('❌ Error creating admin user:', error.message);
    console.error('');
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('═══════════════════════════════════════════════════════════════════════════════');
      console.log('');
      console.log('⚠️  This email is already registered!');
      console.log('');
      console.log('You can either:');
      console.log('');
      console.log('OPTION 1: Login with existing account');
      console.log('─────────────────────────────────────────');
      console.log(`   Email: ${email}`);
      console.log('   Password: (the password you set before)');
      console.log('   URL: http://localhost:5173/admin/login');
      console.log('');
      console.log('OPTION 2: Delete existing user and create new');
      console.log('──────────────────────────────────────────────────');
      console.log('1. Go to: https://console.firebase.google.com/project/grampanchayat-multi-tenant/authentication');
      console.log('2. Find and delete the user with email: ' + email);
      console.log('3. Run this script again: node create-admin-user.js');
      console.log('');
      console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    } else if (error.code === 'permission-denied') {
      console.log('═══════════════════════════════════════════════════════════════════════════════');
      console.log('');
      console.log('⚠️  Permission denied - Need to temporarily open Firestore rules');
      console.log('');
      console.log('Run these commands:');
      console.log('');
      console.log('cp firestore.rules.temp firestore.rules');
      console.log('firebase deploy --only firestore:rules');
      console.log('node create-admin-user.js');
      console.log('cp firestore.rules.backup firestore.rules');
      console.log('firebase deploy --only firestore:rules');
      console.log('');
      console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    } else {
      console.log('═══════════════════════════════════════════════════════════════════════════════');
      console.log('');
      console.log('Troubleshooting:');
      console.log('');
      console.log('1. Make sure Firebase Authentication is enabled');
      console.log('2. Check that Email/Password provider is enabled');
      console.log('3. Try creating user manually in Firebase Console');
      console.log('');
      console.log('Firebase Console:');
      console.log('https://console.firebase.google.com/project/grampanchayat-multi-tenant/authentication');
      console.log('');
      console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    }
    
    process.exit(1);
  }
}

createAdminUser();
