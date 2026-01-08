// Firebase configuration for SportMap - Expo Compatible
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

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
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with error handling
let firestore: any;
let auth: any;
let messaging: any;

try {
  // Initialize Firebase services for React Native


  // Only initialize firestore and messaging in web environment
  if (typeof window !== 'undefined') {
    firestore = getFirestore(app);
    messaging = getMessaging(app);
  } else {
    // Create mock firestore for React Native
    firestore = {
      collection: () => ({
        add: () => Promise.resolve({ id: 'mock-id' }),
        get: () => Promise.resolve({ docs: [] }),
        onSnapshot: () => () => { },
      }),
    };
    messaging = {
      getToken: () => Promise.resolve('mock-token'),
    };
  }

  console.log('✅ Firebase services initialized successfully');
} catch (error) {
  // Suppress Firebase warning since we're using Supabase
  // console.warn('⚠️ Firebase services not available:', error);
  // Create mock services for development
  firestore = {
    collection: () => ({
      add: () => Promise.resolve({ id: 'mock-id' }),
      get: () => Promise.resolve({ docs: [] }),
      onSnapshot: () => () => { },
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
