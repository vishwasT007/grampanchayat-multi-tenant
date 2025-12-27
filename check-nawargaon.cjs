const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkNawargaon() {
  console.log('\n🔍 Checking Nawargaon GP Data:\n');
  
  // Check both possible IDs
  const ids = ['nawargaon', 'nawargaon-o7uzj6'];
  
  for (const id of ids) {
    console.log(`\n--- Checking gramPanchayats/${id} ---`);
    const settingsDoc = await db.collection('gramPanchayats').doc(id).collection('settings').doc('siteConfig').get();
    
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      console.log(`✅ EXISTS`);
      console.log(`   Panchayat Name: ${data.panchayatName?.en || 'N/A'}`);
      console.log(`   Logo: ${data.logo ? 'YES ✓' : 'NO ✗'}`);
      if (data.logo) {
        console.log(`   Logo URL: ${data.logo.substring(0, 80)}...`);
      }
    } else {
      console.log(`❌ DOES NOT EXIST`);
    }
  }
  
  // Check Super Admin GP list
  console.log('\n\n--- Super Admin GP List ---');
  const gpListDoc = await db.collection('gramPanchayats').doc('list').get();
  if (gpListDoc.exists) {
    const gpList = gpListDoc.data().gramPanchayats || [];
    const nawargaonGPs = gpList.filter(gp => gp.id.includes('nawargaon'));
    console.log('Nawargaon entries:', JSON.stringify(nawargaonGPs, null, 2));
  }
  
  process.exit(0);
}

checkNawargaon().catch(console.error);
