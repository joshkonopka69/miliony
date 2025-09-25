#!/usr/bin/env node

// SportMap Setup Status Checker
console.log('🏆 SportMap Setup Status Checker\n');

// Check if .env file exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

console.log('📋 Checking setup status...\n');

// 1. Check .env file
console.log('1️⃣ Environment File:');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  const firebaseKeys = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID'
  ];
  
  const supabaseKeys = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const googleKeys = [
    'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY',
    'EXPO_PUBLIC_GOOGLE_PLACES_API_KEY'
  ];
  
  console.log('   Firebase keys:');
  firebaseKeys.forEach(key => {
    const hasKey = lines.some(line => line.includes(key) && !line.includes('your_'));
    console.log(`   ${hasKey ? '✅' : '❌'} ${key}`);
  });
  
  console.log('   Supabase keys:');
  supabaseKeys.forEach(key => {
    const hasKey = lines.some(line => line.includes(key) && !line.includes('your_'));
    console.log(`   ${hasKey ? '✅' : '❌'} ${key}`);
  });
  
  console.log('   Google Maps keys:');
  googleKeys.forEach(key => {
    const hasKey = lines.some(line => line.includes(key) && !line.includes('your_'));
    console.log(`   ${hasKey ? '✅' : '❌'} ${key}`);
  });
  
} else {
  console.log('❌ .env file missing');
  console.log('   Run: cp env.example .env');
}

console.log('');

// 2. Check package.json dependencies
console.log('2️⃣ Dependencies:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  '@supabase/supabase-js',
  'firebase',
  '@react-native-firebase/app',
  '@react-native-firebase/firestore',
  '@react-native-firebase/auth',
  '@react-native-firebase/messaging'
];

requiredDeps.forEach(dep => {
  const hasDep = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
  console.log(`   ${hasDep ? '✅' : '❌'} ${dep}`);
});

console.log('');

// 3. Check if node_modules exists
console.log('3️⃣ Node Modules:');
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules exists');
} else {
  console.log('❌ node_modules missing');
  console.log('   Run: npm install');
}

console.log('');

// 4. Check Firebase project ID
console.log('4️⃣ Firebase Configuration:');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const projectIdMatch = envContent.match(/EXPO_PUBLIC_FIREBASE_PROJECT_ID=(.+)/);
  if (projectIdMatch && projectIdMatch[1] !== 'your_project_id') {
    console.log(`✅ Firebase Project ID: ${projectIdMatch[1]}`);
  } else {
    console.log('❌ Firebase Project ID not set');
  }
}

console.log('');

// 5. Setup recommendations
console.log('📝 Next Steps:');
console.log('');

if (!fs.existsSync(envPath)) {
  console.log('1. Create .env file: cp env.example .env');
}

console.log('2. Get Supabase credentials:');
console.log('   - Go to https://supabase.com/dashboard');
console.log('   - Create project → Settings → API');
console.log('   - Copy URL and anon key to .env');

console.log('');

console.log('3. Get Google Maps API key:');
console.log('   - Go to https://console.cloud.google.com/');
console.log('   - Enable APIs: Maps JavaScript, Places, Geocoding');
console.log('   - Create API key and add to .env');

console.log('');

console.log('4. Set up databases:');
console.log('   - Run SUPABASE_COMPLETE_SETUP.sql in Supabase');
console.log('   - Follow FIREBASE_FIRESTORE_SETUP.md for Firebase');

console.log('');

console.log('5. Test your setup:');
console.log('   - npm start');
console.log('   - Test Firebase: import { testFirebaseConnection } from "./src/test-firebase"');

console.log('');

console.log('🎯 Your SportMap is almost ready! 🚀');
