import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Verify environment variables are loaded
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase environment variables are not loaded!');
  console.error('Missing variables:', {
    apiKey: !firebaseConfig.apiKey,
    authDomain: !firebaseConfig.authDomain,
    projectId: !firebaseConfig.projectId,
    storageBucket: !firebaseConfig.storageBucket,
    messagingSenderId: !firebaseConfig.messagingSenderId,
    appId: !firebaseConfig.appId
  });
  throw new Error('Firebase configuration is incomplete. Please check environment variables.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize App Check (production only) - Dynamic import to avoid blocking
let appCheck = null;
if (import.meta.env.PROD && 
    import.meta.env.VITE_ENABLE_APP_CHECK === 'true' && 
    import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  import('firebase/app-check')
    .then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
      try {
        appCheck = initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
          isTokenAutoRefreshEnabled: true
        });
        console.log('✅ Firebase App Check initialized');
      } catch (err) {
        console.warn('⚠️ Firebase App Check initialization failed:', err.message);
      }
    })
    .catch((err) => {
      console.warn('⚠️ Could not load App Check (blocked by extension?):', err.message);
    });
}

// Initialize Firestore with offline persistence
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('✅ Firestore offline persistence enabled');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Current browser does not support persistence');
    }
  });

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firebase Analytics (browser only) - Dynamic import to avoid ad blocker issues
let analytics = null;
if (typeof window !== 'undefined' && import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
  import('firebase/analytics')
    .then(({ getAnalytics, isSupported }) => {
      return isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
          console.log('✅ Firebase Analytics initialized');
        } else {
          console.warn('⚠️ Firebase Analytics not supported in this browser');
        }
      });
    })
    .catch((err) => {
      // This is expected if ad blocker is active - fail silently
      console.debug('ℹ️ Analytics not available (likely blocked by browser extension)');
    });
}
export { analytics };

// Initialize Firebase Performance Monitoring (browser only) - Dynamic import
let performance = null;
if (typeof window !== 'undefined' && import.meta.env.VITE_ENABLE_PERFORMANCE === 'true') {
  import('firebase/performance')
    .then(({ getPerformance }) => {
      try {
        performance = getPerformance(app);
        console.log('✅ Firebase Performance Monitoring initialized');
      } catch (err) {
        console.warn('⚠️ Firebase Performance Monitoring initialization failed:', err.message);
      }
    })
    .catch((err) => {
      // This is expected if ad blocker is active - fail silently
      console.debug('ℹ️ Performance monitoring not available (likely blocked by browser extension)');
    });
}
export { performance };

// Export app instance
export default app;
