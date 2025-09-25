// Firebase configuration for SportMap - Expo Compatible
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getMessaging } from 'firebase/messaging';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Firebase configuration
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyB0IHLweZ7IN5rPxqvDWfuW_ACe70FfzNE',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'sportmap-cc906.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'sportmap-cc906',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'sportmap-cc906.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '853936038513',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:853936038513:web:a1e55608786dacda6df1d0',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with error handling
let firestore: any;
let auth: any;
let messaging: any;

try {
  firestore = getFirestore(app);
  auth = getAuth(app);
  messaging = getMessaging(app);
  
  console.log('✅ Firebase services initialized successfully');
} catch (error) {
  console.warn('⚠️ Firebase services not available:', error);
  // Create mock services for development
  firestore = {
    collection: () => ({
      add: () => Promise.resolve({ id: 'mock-id' }),
      get: () => Promise.resolve({ docs: [] }),
      onSnapshot: () => () => {},
    }),
  };
  auth = {
    currentUser: null,
    signInAnonymously: () => Promise.resolve({ user: { uid: 'mock-user' } }),
  };
  messaging = {
    getToken: () => Promise.resolve('mock-token'),
  };
}

// Export services
export { firestore, auth, messaging, firebaseConfig };
export default firebaseConfig;
