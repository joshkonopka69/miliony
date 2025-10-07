-- ═══════════════════════════════════════════════════════════════════════════
-- 🔍 CHECK YOUR PROFILES TABLE STRUCTURE
-- ═══════════════════════════════════════════════════════════════════════════
-- This script checks your existing profiles table structure
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Check profiles table structure
SELECT 
  '📋 PROFILES TABLE STRUCTURE' as section,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if RLS is enabled on profiles
SELECT 
  '🔒 PROFILES RLS STATUS' as section,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles';

-- 3. Check RLS policies on profiles
SELECT 
  '📋 PROFILES RLS POLICIES' as section,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. Check if there are any records in profiles
SELECT 
  '👤 PROFILES DATA' as section,
  COUNT(*) as total_profiles
FROM profiles;

-- 5. Show sample profile data (if any)
SELECT 
  '📊 SAMPLE PROFILES' as section,
  *
FROM profiles 
LIMIT 3;
