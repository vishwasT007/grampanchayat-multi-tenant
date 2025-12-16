import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';

// Firebase configuration from .env
const firebaseConfig = {
  apiKey: "AIzaSyB67ZvBQ7DLy3nErDuWSorBtbwgKeoWCw4",
  authDomain: "grampanchayat-multi-tenant.firebaseapp.com",
  projectId: "grampanchayat-multi-tenant",
  storageBucket: "grampanchayat-multi-tenant.firebasestorage.app",
  messagingSenderId: "595321745876",
  appId: "1:595321745876:web:3073e006f4a418207e2641"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                              ║');
console.log('║           🔍 Checking Firestore Data Structure                              ║');
console.log('║                                                                              ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

async function checkFirestoreData() {
  try {
    const tenant = 'pindkepar';
    
    console.log('📊 Checking existing data in Firestore...\n');
    
    // Check if gramPanchayats collection exists
    const gramPanchayatsRef = collection(db, 'gramPanchayats');
    const gramPanchayatsSnapshot = await getDocs(gramPanchayatsRef);
    
    if (gramPanchayatsSnapshot.empty) {
      console.log('❌ gramPanchayats collection does not exist yet');
      console.log('   Creating data structure...\n');
      await createAllData();
      return;
    }
    
    console.log(`✅ Found ${gramPanchayatsSnapshot.size} GP(s) in gramPanchayats collection:`);
    gramPanchayatsSnapshot.forEach(doc => {
      console.log(`   - ${doc.id}`);
    });
    console.log('');
    
    // Check pindkepar tenant
    const pindkeparExists = gramPanchayatsSnapshot.docs.some(doc => doc.id === 'pindkepar');
    
    if (!pindkeparExists) {
      console.log('❌ "pindkepar" tenant not found');
      console.log('   Creating pindkepar data...\n');
      await createAllData();
      return;
    }
    
    console.log('✅ "pindkepar" tenant found\n');
    
    // Check settings
    console.log('🔍 Checking subcollections...\n');
    
    const settingsRef = collection(db, 'gramPanchayats', tenant, 'settings');
    const settingsSnapshot = await getDocs(settingsRef);
    
    if (settingsSnapshot.empty) {
      console.log('⚠️  settings collection is empty');
      console.log('   Creating settings...\n');
      await createSettings(tenant);
    } else {
      console.log('✅ settings collection exists');
      settingsSnapshot.forEach(doc => {
        console.log(`   - ${doc.id}`);
      });
    }
    
    // Check theme
    const themeRef = collection(db, 'gramPanchayats', tenant, 'theme');
    const themeSnapshot = await getDocs(themeRef);
    
    if (themeSnapshot.empty) {
      console.log('\n⚠️  theme collection is empty');
      console.log('   Creating theme...\n');
      await createTheme(tenant);
    } else {
      console.log('\n✅ theme collection exists');
      themeSnapshot.forEach(doc => {
        console.log(`   - ${doc.id}`);
      });
    }
    
    // Check features
    const featuresRef = collection(db, 'gramPanchayats', tenant, 'features');
    const featuresSnapshot = await getDocs(featuresRef);
    
    if (featuresSnapshot.empty) {
      console.log('\n⚠️  features collection is empty');
      console.log('   Creating features...\n');
      await createFeatures(tenant);
    } else {
      console.log('\n✅ features collection exists');
      featuresSnapshot.forEach(doc => {
        console.log(`   - ${doc.id}`);
      });
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════════════════════\n');
    console.log('                    ✅ Data Check Complete!\n');
    console.log('Your Firestore structure:');
    console.log('');
    console.log('📁 gramPanchayats/');
    console.log(' └─📄 pindkepar');
    
    if (!settingsSnapshot.empty) {
      console.log('    ├─📁 settings/');
      settingsSnapshot.forEach(doc => console.log(`    │  └─📄 ${doc.id}`));
    }
    if (!themeSnapshot.empty) {
      console.log('    ├─📁 theme/');
      themeSnapshot.forEach(doc => console.log(`    │  └─📄 ${doc.id}`));
    }
    if (!featuresSnapshot.empty) {
      console.log('    └─📁 features/');
      featuresSnapshot.forEach(doc => console.log(`       └─📄 ${doc.id}`));
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('\n⚠️  This is a permission error. The data might exist but security rules are blocking reads.');
      console.log('   Attempting to create data anyway...\n');
      await createAllData();
    }
  }
  
  process.exit(0);
}

async function createSettings(tenant) {
  console.log('📝 Creating settings/siteConfig...');
  
  await setDoc(doc(db, 'gramPanchayats', tenant, 'settings', 'siteConfig'), {
    title: {
      en: "Gram Panchayat Pindkepar Lodha",
      hi: "ग्राम पंचायत पिंडकेपार लोधा"
    },
    contact: {
      email: "admin@pindkepar.in",
      phone: "+91 1234567890"
    },
    address: {
      en: "Pindkepar, Lodha, Rajasthan",
      hi: "पिंडकेपार, लोधा, राजस्थान"
    },
    description: {
      en: "Welcome to Gram Panchayat Pindkepar Lodha",
      hi: "ग्राम पंचायत पिंडकेपार लोधा में आपका स्वागत है"
    }
  });
  
  console.log('   ✅ Settings created successfully!');
}

async function createTheme(tenant) {
  console.log('🎨 Creating theme/config...');
  
  await setDoc(doc(db, 'gramPanchayats', tenant, 'theme', 'config'), {
    primaryColor: "#dc2626",
    secondaryColor: "#ea580c",
    accentColor: "#f59e0b",
    fontFamily: "Inter, system-ui, sans-serif",
    logoUrl: "",
    faviconUrl: ""
  });
  
  console.log('   ✅ Theme created successfully!');
}

async function createFeatures(tenant) {
  console.log('⚙️  Creating features/config...');
  
  await setDoc(doc(db, 'gramPanchayats', tenant, 'features', 'config'), {
    showGallery: true,
    showVillageStats: true,
    showFinancials: true,
    showGrievances: true,
    showMembers: true,
    showNotices: true,
    showServices: true,
    showSchemes: true,
    enableMultiLanguage: true
  });
  
  console.log('   ✅ Features created successfully!');
}

async function createAllData() {
  const tenant = 'pindkepar';
  
  console.log('🚀 Creating complete data structure for pindkepar...\n');
  
  try {
    await createSettings(tenant);
    await createTheme(tenant);
    await createFeatures(tenant);
    
    console.log('\n═══════════════════════════════════════════════════════════════════════════════\n');
    console.log('                    🎉 All Data Created Successfully! 🎉\n');
    console.log('Your Firestore structure:');
    console.log('');
    console.log('📁 gramPanchayats/');
    console.log(' └─📄 pindkepar');
    console.log('    ├─📁 settings/');
    console.log('    │  └─📄 siteConfig ✅');
    console.log('    ├─📁 theme/');
    console.log('    │  └─📄 config ✅');
    console.log('    └─📁 features/');
    console.log('       └─📄 config ✅\n');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    console.log('🚀 Next Steps:\n');
    console.log('   1. Run: npm run dev');
    console.log('   2. Open: http://localhost:5173?tenant=pindkepar');
    console.log('   3. Check console for: "🏛️ Current Tenant: pindkepar"\n');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ Error creating data:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('\n═══════════════════════════════════════════════════════════════════════════════');
      console.log('⚠️  PERMISSION DENIED - Security rules are blocking writes\n');
      console.log('This means you need to either:');
      console.log('');
      console.log('OPTION 1: Temporarily allow public writes (ONLY for setup)');
      console.log('──────────────────────────────────────────────────────────');
      console.log('1. Open: https://console.firebase.google.com/project/grampanchayat-multi-tenant/firestore/rules');
      console.log('2. Temporarily change line 40 to:');
      console.log('   allow read, write: if true;  // TEMPORARY - for initial setup only');
      console.log('3. Click "Publish"');
      console.log('4. Run this script again: node check-firestore.js');
      console.log('5. Then change it back to:');
      console.log('   allow write: if hasTenantAccess(tenant);');
      console.log('');
      console.log('OPTION 2: Create data manually in Firebase Console');
      console.log('─────────────────────────────────────────────────────────');
      console.log('Follow the guide in: CREATE_TEST_DATA_GUIDE.txt');
      console.log('');
      console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    }
  }
}

// Run the check
checkFirestoreData();
