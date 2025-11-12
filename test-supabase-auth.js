// Test Supabase connection and auth
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ujfeqshqhlplmolfrlvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA';

console.log('🔗 Testing Supabase connection...');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_ANON_KEY ? 'Present' : 'Missing');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase client created');

// Test auth
console.log('🔐 Testing auth...');
console.log('Auth object:', supabase.auth);
console.log('Auth methods:', Object.keys(supabase.auth));

// Test database connection
console.log('📊 Testing database connection...');
supabase.from('users').select('*').limit(1).then(({ data, error }) => {
  if (error) {
    console.log('❌ Database error:', error.message);
  } else {
    console.log('✅ Database connection successful:', data.length, 'users found');
  }
});

// Test auth state
console.log('👤 Testing auth state...');
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.log('❌ Auth session error:', error.message);
  } else {
    console.log('✅ Auth session check successful');
    console.log('Current session:', data.session ? 'Active' : 'None');
  }
});

