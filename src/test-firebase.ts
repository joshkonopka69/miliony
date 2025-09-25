// Test Firebase connection with your actual credentials
import { firestore, auth } from './config/firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export const testFirebaseConnection = async () => {
  console.log('🔥 Testing Firebase Connection...\n');

  try {
    // Test 1: Authentication
    console.log('1️⃣ Testing Firebase Authentication:');
    const userCredential = await signInAnonymously(auth);
    console.log('✅ Firebase Auth working!');
    console.log('👤 User ID:', userCredential.user.uid);
    console.log('');

    // Test 2: Firestore Connection
    console.log('2️⃣ Testing Firestore Connection:');
    const testCollection = collection(firestore, 'test');
    
    // Add a test document
    const docRef = await addDoc(testCollection, {
      message: 'Hello from SportMap!',
      timestamp: serverTimestamp(),
      test: true
    });
    console.log('✅ Firestore write working!');
    console.log('📄 Document ID:', docRef.id);
    console.log('');

    // Test 3: Firestore Read
    console.log('3️⃣ Testing Firestore Read:');
    const querySnapshot = await getDocs(testCollection);
    console.log('✅ Firestore read working!');
    console.log('📊 Documents found:', querySnapshot.size);
    querySnapshot.forEach((doc) => {
      console.log('📄 Document:', doc.id, '=>', doc.data());
    });
    console.log('');

    console.log('🎉 Firebase is fully working! Your SportMap is ready! 🏆');
    return true;

  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your Firebase project is active');
    console.log('2. Verify Firestore is enabled');
    console.log('3. Check your API keys in .env file');
    console.log('4. Make sure you have the right permissions');
    return false;
  }
};

// Quick test function
export const quickFirebaseTest = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log('✅ Firebase Auth: Working');
    console.log('👤 User:', userCredential.user.uid);
    return true;
  } catch (error) {
    console.error('❌ Firebase Auth failed:', error);
    return false;
  }
};
