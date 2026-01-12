import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import admin from 'firebase-admin';

const serviceAccountKey = {
  "type": "service_account",
  "project_id": "grampanchayat-multi-tenant",
  "private_key_id": "your-key-id",
  "private_key": "your-private-key",
  "client_email": "firebase-adminsdk@grampanchayat-multi-tenant.iam.gserviceaccount.com"
};

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
});

const email = 'admin@pindkepar.in';
const newPassword = 'Admin@123456';

console.log('\n🔧 Resetting password for:', email);

admin.auth().updateUser('wRaEC3vJhKSlCdOF1Poial1xT0v2', {
  password: newPassword
})
.then(() => {
  console.log('✅ Password reset successfully!');
  console.log('\nLogin credentials:');
  console.log('Email:', email);
  console.log('Password:', newPassword);
  process.exit(0);
})
.catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
