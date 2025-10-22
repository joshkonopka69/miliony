// Centralized Supabase Configuration
// This ensures all components use the same Supabase instance

import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Supabase configuration
const SUPABASE_URL = 'https://ujfeqshqhlplmolfrlvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Verify connection
console.log('🔗 Supabase URL:', SUPABASE_URL);
console.log('🔑 Supabase Key:', SUPABASE_ANON_KEY ? 'Present' : 'Missing');
console.log('✅ Supabase client created successfully');

// Test connection
supabase.from('users').select('*').limit(1).then(({ data, error }) => {
  if (error) {
    console.log('❌ Supabase connection test failed:', error.message);
  } else {
    console.log('✅ Supabase connection test successful:', data.length, 'users found');
  }
});

export default supabase;
export { supabase };
