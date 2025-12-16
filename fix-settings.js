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

console.log('\n🔧 Fixing settings data structure...\n');

async function fixSettingsStructure() {
  try {
    const tenant = 'pindkepar';
    
    // Correct structure
    const correctSettings = {
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
      },
      officeTimings: {
        en: "Mon-Fri: 10:00 AM - 5:00 PM",
        hi: "सोम-शुक्र: 10:00 AM - 5:00 PM"
      },
      panchayatName: {
        en: "Gram Panchayat Pindkepar Lodha",
        hi: "ग्राम पंचायत पिंडकेपार लोधा"
      },
      tagline: {
        en: "Serving our community with dedication",
        hi: "समर्पण के साथ हमारे समुदाय की सेवा"
      },
      socialMedia: {
        facebook: "https://facebook.com/pindkepar",
        twitter: "https://twitter.com/pindkepar",
        youtube: "https://youtube.com/@pindkepar"
      }
    };
    
    await setDoc(doc(db, 'gramPanchayats', tenant, 'settings', 'siteConfig'), correctSettings);
    
    console.log('✅ Settings structure fixed!\n');
    console.log('New structure:');
    console.log(JSON.stringify(correctSettings, null, 2));
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

fixSettingsStructure();
