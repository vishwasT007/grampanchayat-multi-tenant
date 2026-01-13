/**
 * Simple script to call the createGPAuthUser Cloud Function for existing GPs
 * This will create the missing Firebase Auth users
 */

import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB67ZvBQ7DLy3nErDuWSorBtbwgKeoWCw4",
  authDomain: "grampanchayat-multi-tenant.firebaseapp.com",
  projectId: "grampanchayat-multi-tenant",
  storageBucket: "grampanchayat-multi-tenant.firebasestorage.app",
  messagingSenderId: "1081062354050",
  appId: "1:1081062354050:web:8513cd91ae5c0c1bb5ea13",
  measurementId: "G-LBTH3JW8LF"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'asia-south1');
const auth = getAuth(app);

const GPs_NEEDING_AUTH = [
  {
    tenantId: 'kachurwahi',
    email: 'admin@kachurwahi.in',
    password: 'Admin@123456',
    adminName: 'Kachurwahi Admin'
  },
  {
    tenantId: 'soneghat',
    email: 'admin@soneghat.in',
    password: 'Admin@123456',
    adminName: 'Soneghat Admin'
  }
];

async function createAuthUsers() {
  try {
    // First, login as super admin
    console.log('🔐 Logging in as Super Admin...');
    const superAdminEmail = 'superadmin@grampanchayat.gov.in'; // Update with your super admin email
    const superAdminPassword = 'YourSuperAdminPassword'; // Update with your super admin password
    
    await signInWithEmailAndPassword(auth, superAdminEmail, superAdminPassword);
    console.log('✅ Logged in as Super Admin\n');

    const createGPAuthUser = httpsCallable(functions, 'createGPAuthUser');

    for (const gp of GPs_NEEDING_AUTH) {
      try {
        console.log(`🔐 Creating Auth user for ${gp.tenantId}...`);
        const result = await createGPAuthUser({
          email: gp.email,
          password: gp.password,
          tenantId: gp.tenantId,
          adminName: gp.adminName
        });
        console.log(`✅ Success:`, result.data);
        console.log('');
      } catch (error) {
        console.error(`❌ Error for ${gp.tenantId}:`, error.message);
        console.log('');
      }
    }

    console.log('✅ Done!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAuthUsers();
