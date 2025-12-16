// Setup Firestore Test Data for Multi-Tenant System
// Run this script to create initial data structure for Pindkepar GP

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase configuration
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

async function setupTestData() {
  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                              ║');
  console.log('║           🔥 Setting Up Multi-Tenant Firestore Test Data 🔥                  ║');
  console.log('║                                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

  const tenant = 'pindkepar';

  try {
    // 1. Settings - Site Configuration
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
    console.log('✅ Settings created successfully!\n');

    // 2. Theme Configuration
    console.log('🎨 Creating theme/config...');
    await setDoc(doc(db, 'gramPanchayats', tenant, 'theme', 'config'), {
      primaryColor: "#dc2626",      // Red
      secondaryColor: "#ea580c",    // Orange
      accentColor: "#f59e0b",       // Amber
      fontFamily: "Inter, system-ui, sans-serif",
      logoUrl: "",
      faviconUrl: ""
    });
    console.log('✅ Theme created successfully!\n');

    // 3. Features Configuration
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
      showForms: true,
      enableMultiLanguage: true
    });
    console.log('✅ Features created successfully!\n');

    // 4. Create a sample notice
    console.log('📢 Creating sample notice...');
    await setDoc(doc(db, 'gramPanchayats', tenant, 'notices', 'sample-notice-1'), {
      title: {
        en: "Welcome to Multi-Tenant System",
        hi: "मल्टी-टेनेंट सिस्टम में आपका स्वागत है"
      },
      content: {
        en: "This is a test notice for Pindkepar Gram Panchayat. The multi-tenant system is now active!",
        hi: "यह पिंडकेपार ग्राम पंचायत के लिए एक परीक्षण सूचना है। मल्टी-टेनेंट सिस्टम अब सक्रिय है!"
      },
      date: new Date(),
      isActive: true,
      priority: "high",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Sample notice created successfully!\n');

    // 5. Create village statistics
    console.log('📊 Creating village statistics...');
    await setDoc(doc(db, 'gramPanchayats', tenant, 'villageStatistics', 'stats'), {
      population: 2500,
      households: 450,
      area: 1200,
      wards: 8,
      schools: 2,
      hospitals: 1,
      lastUpdated: new Date()
    });
    console.log('✅ Village statistics created successfully!\n');

    console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    console.log('                    🎉 SUCCESS! Test Data Created! 🎉\n');
    console.log('Your Firestore structure now looks like:\n');
    console.log('gramPanchayats/');
    console.log('└── pindkepar/');
    console.log('    ├── settings/siteConfig ✅');
    console.log('    ├── theme/config ✅');
    console.log('    ├── features/config ✅');
    console.log('    ├── notices/sample-notice-1 ✅');
    console.log('    └── villageStatistics/stats ✅\n');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    console.log('🚀 Next Steps:\n');
    console.log('   1. Run: npm run dev');
    console.log('   2. Open: http://localhost:5173?tenant=pindkepar');
    console.log('   3. Check console for: "🏛️ Current Tenant: pindkepar"');
    console.log('   4. Verify tenant indicator in bottom-right corner\n');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error creating test data:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure Firestore is enabled in Firebase Console');
    console.error('2. Check that security rules are deployed');
    console.error('3. Verify .env file has correct credentials\n');
    process.exit(1);
  }
}

// Run the setup
setupTestData();
