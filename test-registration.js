// Test script to verify registration functionality
const { createClient } = require('@supabase/supabase-js');

// Test Supabase connection
const supabaseUrl = 'https://qqxpvrbdcyedescyxesu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxeHB2cmJkY3llZGVzY3l4ZXN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3OTY0MjYsImV4cCI6MjA3NDM3MjQyNn0.1fBe90oBZzWnp4okJDzbkZLzR2SiRUC5L7TX1h2GvnY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test connection by fetching users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message);
    return false;
  }
}

async function testUserCreation() {
  console.log('🔍 Testing user creation...');
  
  try {
    // Generate a proper UUID for testing
    const crypto = require('crypto');
    const testUser = {
      id: crypto.randomUUID(),
      email: 'test@example.com',
      display_name: 'Test User',
      favorite_sports: ['football'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single();
    
    if (error) {
      console.error('❌ User creation failed:', error.message);
      return false;
    }
    
    console.log('✅ User creation successful:', data);
    
    // Clean up test user
    await supabase
      .from('users')
      .delete()
      .eq('id', testUser.id);
    
    console.log('✅ Test user cleaned up');
    return true;
  } catch (error) {
    console.error('❌ User creation error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting registration tests...\n');
  
  const supabaseOk = await testSupabaseConnection();
  if (!supabaseOk) {
    console.log('\n❌ Supabase tests failed. Registration will not work.');
    return;
  }
  
  const userCreationOk = await testUserCreation();
  if (!userCreationOk) {
    console.log('\n❌ User creation tests failed. Registration will not work.');
    return;
  }
  
  console.log('\n✅ All tests passed! Registration should work properly.');
  console.log('\n📝 Registration Flow:');
  console.log('1. User fills registration form');
  console.log('2. Firebase creates authentication user');
  console.log('3. Supabase creates user profile in database');
  console.log('4. User is signed in and redirected to app');
}

runTests().catch(console.error);
