import { initializeApp } from 'firebase/app';
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
const db = getFirestore(app);

const tenant = 'pindkepar';
const userUid = 'lsaTVxEaMXMdznfpKJhtgn3sbNR2'; // From the created user
const email = 'admin@pindkepar.com';

console.log('\n📝 Adding user data to Firestore...');
console.log(`   Tenant: ${tenant}`);
console.log(`   User UID: ${userUid}`);
console.log(`   Email: ${email}`);
console.log('');

const userData = {
  email: email,
  role: 'admin',
  active: true,
  name: {
    en: 'Admin User',
    mr: 'प्रशासक'
  },
  createdAt: new Date().toISOString(),
  tenantId: tenant
};

setDoc(doc(db, 'gramPanchayats', tenant, 'users', userUid), userData)
  .then(() => {
    console.log('✅ User data added to Firestore successfully!');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('🎉 Ready to login!');
    console.log('');
    console.log('   📧 Email:    admin@pindkepar.com');
    console.log('   🔑 Password: Password123');
    console.log('   🌐 URL:      http://localhost:5173/admin/login?tenant=pindkepar');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
