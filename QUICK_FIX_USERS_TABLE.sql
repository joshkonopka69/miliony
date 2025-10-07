-- Quick fix: Create minimal users table to fix authentication

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS temporarily for testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Insert a test user
INSERT INTO public.users (id, email, display_name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User')
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT 'Users table created' as status, COUNT(*) as user_count FROM public.users;
