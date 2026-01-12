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
console.log('║              🔐 Creating NEW Admin User                                      ║');
console.log('║                                                                              ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

async function createAdminUser() {
  const email = 'admin@pindkepar.com';
  const password = 'Password123';
  
  try {
    console.log('📧 Creating authentication user...');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('');
    
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Authentication user created successfully!');
    console.log(`   User UID: ${user.uid}`);
    console.log('');
    
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('🎉 SUCCESS! Login with these credentials:');
    console.log('');
    console.log('   📧 Email:    admin@pindkepar.com');
    console.log('   🔑 Password: Password123');
    console.log('');
    console.log('   🌐 Login URL: http://localhost:5173/admin/login');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

createAdminUser();
