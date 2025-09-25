#!/usr/bin/env node

/**
 * Test Firebase Connection Script
 * Tests if Firebase Firestore is properly configured
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, serverTimestamp } = require('firebase/firestore');

// Load environment variables
require('dotenv').config();

async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Firestore Connection...\n');
  
  try {
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    };
    
    console.log('📋 Firebase Config:');
    console.log(`   Project ID: ${firebaseConfig.projectId}`);
    console.log(`   Auth Domain: ${firebaseConfig.authDomain}`);
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase app initialized');
    
    // Test reading from liveEvents collection
    console.log('🔍 Testing Firestore read access...');
    const liveEventsRef = collection(db, 'liveEvents');
    const snapshot = await getDocs(liveEventsRef);
    
    console.log(`✅ Firestore read successful! Found ${snapshot.size} live events`);
    
    // Test writing to liveEvents collection
    console.log('🔍 Testing Firestore write access...');
    const testEvent = {
      supabaseEventId: 'test-' + Date.now(),
      name: 'Test Event',
      activity: 'Test Activity',
      location: {
        latitude: 51.1079,
        longitude: 17.0385,
        name: 'Test Location'
      },
      createdBy: 'test-user',
      participants: ['test-user'],
      maxParticipants: 10,
      createdAt: serverTimestamp(),
      status: 'live',
      lastActivity: serverTimestamp()
    };
    
    const docRef = await addDoc(liveEventsRef, testEvent);
    console.log(`✅ Firestore write successful! Created document: ${docRef.id}`);
    
    console.log('\n🎉 Firebase Firestore is working perfectly!');
    console.log('🚀 Your SportMap backend is fully functional!');
    
    return true;
  } catch (error) {
    console.log('❌ Firebase connection failed:');
    console.log(`   Error: ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure Firestore is enabled in Firebase Console');
    console.log('   2. Check if security rules are set correctly');
    console.log('   3. Verify your Firebase project is active');
    console.log('   4. Run the setup script: node setup-firebase-firestore.js');
    
    return false;
  }
}

// Run the test
testFirebaseConnection().catch(console.error);
