/**
 * Fix Existing GP User Data
 * Run this script to fix the admin user for pindkeparlodha GP
 * 
 * Usage: node fix-gp-user.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./grampanchayat-multi-tenant-firebase-adminsdk-p1dlj-6a47a17be5.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function fixGPUser() {
  try {
    console.log('🔧 Fixing GP User Data...\n');
    
    const gpId = 'pindkeparlodha';
    const adminEmail = 'admin@pindkepar-lodha.gov.in'; // Update this to match what you used
    
    // Get the GP data from globalConfig
    const gpDoc = await db.doc(`globalConfig/metadata/gramPanchayats/${gpId}`).get();
    
    if (!gpDoc.exists) {
      console.error('❌ GP not found:', gpId);
      return;
    }
    
    const gpData = gpDoc.data();
    console.log('✅ Found GP:', gpData.name);
    console.log('   Admin Email:', gpData.adminEmail);
    console.log('   Admin Password:', gpData.adminPassword);
    
    // Get the user from Firebase Auth by email
    try {
      const userRecord = await auth.getUserByEmail(gpData.adminEmail);
      console.log('\n✅ Found user in Auth:', userRecord.uid);
      
      // Create/Update user document in Firestore
      await db.doc(`gramPanchayats/${gpId}/users/${userRecord.uid}`).set({
        email: gpData.adminEmail,
        name: gpData.adminName || 'Admin',
        role: 'admin',
        tenantId: gpId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        active: true,
        createdBy: 'superadmin',
        password: gpData.adminPassword, // Plain text as requested
        passwordLastChanged: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ User document created/updated in Firestore');
      console.log(`   Path: gramPanchayats/${gpId}/users/${userRecord.uid}`);
      console.log('\n🎉 SUCCESS! User can now login at https://pindkepar-lodha.web.app/admin/login');
      console.log('   Email:', gpData.adminEmail);
      console.log('   Password:', gpData.adminPassword);
      
    } catch (authError) {
      console.error('\n❌ User not found in Auth. Creating new user...');
      
      // Create user in Firebase Auth
      const newUser = await auth.createUser({
        email: gpData.adminEmail,
        password: gpData.adminPassword,
        emailVerified: false,
        disabled: false
      });
      
      console.log('✅ User created in Auth:', newUser.uid);
      
      // Create user document in Firestore
      await db.doc(`gramPanchayats/${gpId}/users/${newUser.uid}`).set({
        email: gpData.adminEmail,
        name: gpData.adminName || 'Admin',
        role: 'admin',
        tenantId: gpId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        active: true,
        createdBy: 'superadmin',
        password: gpData.adminPassword, // Plain text as requested
        passwordLastChanged: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ User document created in Firestore');
      console.log(`   Path: gramPanchayats/${gpId}/users/${newUser.uid}`);
      console.log('\n🎉 SUCCESS! User can now login at https://pindkepar-lodha.web.app/admin/login');
      console.log('   Email:', gpData.adminEmail);
      console.log('   Password:', gpData.adminPassword);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

// Run the fix
fixGPUser();
