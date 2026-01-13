/**
 * Script to create Firebase Auth users for existing GPs
 * Run this once to fix GPs created before the auth user creation was implemented
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin using Application Default Credentials
// Make sure you've run: firebase login
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'grampanchayat-multi-tenant'
  });
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error.message);
  console.log('\nPlease run: firebase login');
  process.exit(1);
}

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function fixExistingGPAuth() {
  try {
    console.log('\n🔍 Finding GPs that need Auth user creation...\n');

    // Get all GPs
    const gpsSnapshot = await db.collection('globalConfig/metadata/gramPanchayats').get();
    
    const gpsNeedingAuth = [];
    
    for (const gpDoc of gpsSnapshot.docs) {
      const gpData = gpDoc.data();
      const gpId = gpDoc.id;
      
      if (!gpData.adminEmail || !gpData.adminPassword) {
        console.log(`⏭️  Skipping ${gpId}: No admin credentials found`);
        continue;
      }

      // Check if Auth user already exists
      try {
        await admin.auth().getUserByEmail(gpData.adminEmail);
        console.log(`✅ ${gpId} (${gpData.adminEmail}): Auth user already exists`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          console.log(`❌ ${gpId} (${gpData.adminEmail}): Auth user MISSING`);
          gpsNeedingAuth.push({
            gpId,
            email: gpData.adminEmail,
            password: gpData.adminPassword,
            name: gpData.adminName || 'Admin',
            gpName: gpData.name
          });
        } else {
          console.error(`⚠️  Error checking ${gpId}:`, error.message);
        }
      }
    }

    if (gpsNeedingAuth.length === 0) {
      console.log('\n✅ All GPs have Auth users! Nothing to fix.\n');
      process.exit(0);
    }

    console.log(`\n📋 Found ${gpsNeedingAuth.length} GPs needing Auth user creation:\n`);
    gpsNeedingAuth.forEach((gp, i) => {
      console.log(`${i + 1}. ${gp.gpName} (${gp.gpId})`);
      console.log(`   Email: ${gp.email}`);
      console.log(`   Password: ${gp.password}`);
      console.log('');
    });

    rl.question('Do you want to create Auth users for these GPs? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() !== 'yes') {
        console.log('\n❌ Cancelled by user\n');
        process.exit(0);
      }

      console.log('\n🔐 Creating Auth users...\n');

      for (const gp of gpsNeedingAuth) {
        try {
          // Create Firebase Auth user
          const authUser = await admin.auth().createUser({
            email: gp.email,
            password: gp.password,
            displayName: gp.name
          });

          console.log(`✅ Created Auth user for ${gp.gpId}: ${authUser.uid}`);

          // Create user document in Firestore
          await db.doc(`gramPanchayats/${gp.gpId}/users/${authUser.uid}`).set({
            email: gp.email,
            name: gp.name,
            role: 'admin',
            tenantId: gp.gpId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            active: true,
            createdBy: 'fix-script'
          });

          console.log(`✅ Created Firestore user document for ${gp.gpId}\n`);

          // Remove placeholder users if they exist
          const placeholderQuery = await db.collection(`gramPanchayats/${gp.gpId}/users`)
            .where('isPending', '==', true)
            .where('email', '==', gp.email)
            .get();

          for (const doc of placeholderQuery.docs) {
            await doc.ref.delete();
            console.log(`🗑️  Removed placeholder user: ${doc.id}\n`);
          }

        } catch (error) {
          console.error(`❌ Error creating Auth user for ${gp.gpId}:`, error.message, '\n');
        }
      }

      console.log('\n✅ Done! All Auth users created.\n');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixExistingGPAuth();
