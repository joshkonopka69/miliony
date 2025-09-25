// Test setup for SportMap - verify all services are working
import { supabaseService } from './services/supabase';
import { firebaseService } from './services/firebase';
import { eventService } from './services/eventService';

export const testSetup = async () => {
  console.log('🧪 Testing SportMap Setup...\n');

  // Test 1: Environment Variables
  console.log('1️⃣ Testing Environment Variables:');
  const requiredEnvVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:', missingVars);
    console.log('📝 Please update your .env file with actual API keys\n');
    return false;
  } else {
    console.log('✅ All environment variables are set\n');
  }

  // Test 2: Supabase Connection
  console.log('2️⃣ Testing Supabase Connection:');
  try {
    const user = await supabaseService.getCurrentUser();
    console.log('✅ Supabase service loaded successfully');
    console.log('📊 Current user:', user ? 'Authenticated' : 'Not authenticated');
  } catch (error) {
    console.log('❌ Supabase connection failed:', error);
    return false;
  }
  console.log('');

  // Test 3: Firebase Connection
  console.log('3️⃣ Testing Firebase Connection:');
  try {
    const events = await firebaseService.getLiveEvents();
    console.log('✅ Firebase service loaded successfully');
    console.log('📊 Live events count:', events.length);
  } catch (error) {
    console.log('❌ Firebase connection failed:', error);
    return false;
  }
  console.log('');

  // Test 4: Event Service Integration
  console.log('4️⃣ Testing Event Service Integration:');
  try {
    const events = await eventService.getEvents();
    console.log('✅ Event service integration working');
    console.log('📊 Total events:', events.length);
  } catch (error) {
    console.log('❌ Event service integration failed:', error);
    return false;
  }
  console.log('');

  // Test 5: Real-time Subscriptions
  console.log('5️⃣ Testing Real-time Subscriptions:');
  try {
    const unsubscribe = firebaseService.subscribeToLiveEvents((events) => {
      console.log('✅ Real-time subscription working');
      console.log('📊 Live events updated:', events.length);
    });
    
    // Unsubscribe after 2 seconds
    setTimeout(() => {
      unsubscribe();
      console.log('✅ Subscription cleaned up');
    }, 2000);
  } catch (error) {
    console.log('❌ Real-time subscriptions failed:', error);
    return false;
  }
  console.log('');

  console.log('🎉 All tests passed! Your SportMap setup is ready! 🏆');
  return true;
};

// Test individual services
export const testSupabase = async () => {
  console.log('🧪 Testing Supabase...');
  try {
    const sports = await supabaseService.getSports();
    console.log('✅ Supabase working, sports count:', sports.length);
    return true;
  } catch (error) {
    console.log('❌ Supabase test failed:', error);
    return false;
  }
};

export const testFirebase = async () => {
  console.log('🧪 Testing Firebase...');
  try {
    const events = await firebaseService.getLiveEvents();
    console.log('✅ Firebase working, live events:', events.length);
    return true;
  } catch (error) {
    console.log('❌ Firebase test failed:', error);
    return false;
  }
};

export const testEventService = async () => {
  console.log('🧪 Testing Event Service...');
  try {
    const events = await eventService.getEvents();
    console.log('✅ Event Service working, events:', events.length);
    return true;
  } catch (error) {
    console.log('❌ Event Service test failed:', error);
    return false;
  }
};

// Quick setup verification
export const quickSetupCheck = () => {
  console.log('🔍 Quick Setup Check:');
  
  const checks = [
    { name: 'Supabase URL', value: process.env.EXPO_PUBLIC_SUPABASE_URL, status: !!process.env.EXPO_PUBLIC_SUPABASE_URL },
    { name: 'Supabase Key', value: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, status: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY },
    { name: 'Firebase API Key', value: process.env.EXPO_PUBLIC_FIREBASE_API_KEY, status: !!process.env.EXPO_PUBLIC_FIREBASE_API_KEY },
    { name: 'Firebase Project ID', value: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID, status: !!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID },
    { name: 'Google Maps Key', value: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY, status: !!process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY },
  ];

  checks.forEach(check => {
    console.log(`${check.status ? '✅' : '❌'} ${check.name}: ${check.status ? 'Set' : 'Missing'}`);
  });

  const allSet = checks.every(check => check.status);
  console.log(`\n${allSet ? '🎉 All environment variables are set!' : '⚠️ Some environment variables are missing.'}`);
  
  return allSet;
};
