// Centralized Supabase Configuration
// This ensures all components use the same Supabase instance

import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

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

