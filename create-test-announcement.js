/**
 * Create Test Announcement
 * Run: node create-test-announcement.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';

// Read .env file manually
const envFile = readFileSync('.env', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTestAnnouncement() {
  try {
    console.log('\n🔔 Creating Test Announcement...\n');

    const announcementData = {
      title: {
        en: 'Welcome to Pindkepar Gram Panchayat',
        mr: 'पिंडकेपर ग्रामपंचायतीत आपले स्वागत आहे'
      },
      message: {
        en: 'Stay updated with our latest announcements and important notices',
        mr: 'आमच्या नवीनतम घोषणा आणि महत्त्वाच्या सूचनांसह अद्यतित रहा'
      },
      type: 'info',
      priority: 'high',
      link: '',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(
      collection(db, 'gramPanchayats/pindkepar/announcements'),
      announcementData
    );

    console.log('✅ Test announcement created successfully!');
    console.log('📝 Document ID:', docRef.id);
    console.log('\n📊 Announcement Details:');
    console.log('   Title (EN):', announcementData.title.en);
    console.log('   Title (MR):', announcementData.title.mr);
    console.log('   Type:', announcementData.type);
    console.log('   Priority:', announcementData.priority);
    console.log('   Status:', announcementData.isActive ? 'Active' : 'Inactive');
    
    console.log('\n🎉 Success!');
    console.log('View it on homepage: http://localhost:5173');
    console.log('Manage it at: http://localhost:5173/admin/announcements');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating announcement:', error);
    process.exit(1);
  }
}

createTestAnnouncement();
