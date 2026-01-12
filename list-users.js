import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import admin from 'firebase-admin';

const serviceAccount = {
  "type": "service_account",
  "project_id": "grampanchayat-multi-tenant"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "grampanchayat-multi-tenant"
});

console.log('Listing all users...\n');

admin.auth().listUsers(1000)
  .then((listUsersResult) => {
    console.log(`Found ${listUsersResult.users.length} user(s):\n`);
    listUsersResult.users.forEach((userRecord) => {
      console.log('User:', userRecord.email, '- UID:', userRecord.uid);
    });
    process.exit(0);
  })
  .catch((error) => {
    console.log('Error listing users:', error);
    process.exit(1);
  });
