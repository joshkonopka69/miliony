#!/usr/bin/env node

// Firebase Firestore Setup Script for SportMap
console.log('🔥 Setting up Firebase Firestore for SportMap...\n');

// This script helps you set up Firebase Firestore collections
// Run this after setting up your Firebase project

console.log('📋 Firebase Firestore Setup Checklist:');
console.log('');

console.log('1️⃣ Go to Firebase Console:');
console.log('   https://console.firebase.google.com/');
console.log('   Select your project: sportmap-cc906');
console.log('');

console.log('2️⃣ Enable Firestore Database:');
console.log('   - Go to "Firestore Database"');
console.log('   - Click "Create database"');
console.log('   - Choose "Start in test mode"');
console.log('   - Select a location close to your users');
console.log('');

console.log('3️⃣ Create Collections:');
console.log('   Collection: liveEvents');
console.log('   - Document ID: auto-generated');
console.log('   - Fields: id, supabaseEventId, name, activity, location, createdBy, participants, maxParticipants, createdAt, status, lastActivity');
console.log('');

console.log('4️⃣ Create Subcollections:');
console.log('   liveEvents/{eventId}/messages');
console.log('   - Document ID: auto-generated');
console.log('   - Fields: id, senderId, senderName, text, createdAt, type');
console.log('');

console.log('   liveEvents/{eventId}/presence');
console.log('   - Document ID: userId');
console.log('   - Fields: userId, status, lastSeen');
console.log('');

console.log('5️⃣ Set Security Rules:');
console.log('   Copy this to Firestore Rules:');
console.log('');

const securityRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Live events are readable by everyone
    match /liveEvents/{eventId} {
      allow read: if true;
      allow write: if request.auth != null;
      
      // Messages are readable by event participants
      match /messages/{messageId} {
        allow read: if request.auth != null && 
          exists(/databases/$(database)/documents/liveEvents/$(eventId)) &&
          request.auth.uid in get(/databases/$(database)/documents/liveEvents/$(eventId)).data.participants;
        allow write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/liveEvents/$(eventId)).data.participants;
      }
      
      // Presence is readable by event participants
      match /presence/{userId} {
        allow read: if request.auth != null && 
          exists(/databases/$(database)/documents/liveEvents/$(eventId)) &&
          request.auth.uid in get(/databases/$(database)/documents/liveEvents/$(eventId)).data.participants;
        allow write: if request.auth != null && 
          request.auth.uid == userId;
      }
    }
  }
}
`;

console.log(securityRules);
console.log('');

console.log('6️⃣ Test Your Setup:');
console.log('   - Run: npm start');
console.log('   - Go to Event Test Screen');
console.log('   - Check connection status');
console.log('   - Create a test event');
console.log('   - Test messaging');
console.log('');

console.log('7️⃣ Sample Data to Add:');
console.log('   Add this sample event to test:');
console.log('');

const sampleEvent = {
  id: 'sample-event-1',
  supabaseEventId: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Test Football Game',
  activity: 'Football',
  location: {
    latitude: 51.1079,
    longitude: 17.0385,
    placeId: 'test-location',
    name: 'Test Location'
  },
  createdBy: 'test-user-123',
  participants: ['test-user-123'],
  maxParticipants: 10,
  createdAt: new Date().toISOString(),
  status: 'live',
  lastActivity: new Date().toISOString()
};

console.log(JSON.stringify(sampleEvent, null, 2));
console.log('');

console.log('🎉 Firebase Firestore setup complete!');
console.log('🚀 Your SportMap is ready for real-time events!');
console.log('');
console.log('📱 Next: Test with your friend using the Event Test Screen');

