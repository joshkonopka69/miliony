-- Migration 020: Fix Social and Notification Schema & Performance

-- Enable pg_trgm for fast text searching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Fix Notifications Table
DO $$
BEGIN
  -- action_url
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'action_url') THEN
    ALTER TABLE public.notifications ADD COLUMN action_url TEXT;
  END IF;
  -- image_url
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'image_url') THEN
    ALTER TABLE public.notifications ADD COLUMN image_url TEXT;
  END IF;
  -- scheduled_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'scheduled_at') THEN
    ALTER TABLE public.notifications ADD COLUMN scheduled_at TIMESTAMPTZ;
  END IF;
END $$;

-- 2. Fix user_friendships
DO $$
BEGIN
  -- accepted_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_friendships' AND column_name = 'accepted_at') THEN
    ALTER TABLE public.user_friendships ADD COLUMN accepted_at TIMESTAMPTZ;
  END IF;
END $$;

-- 2.1 Fix user_friendships foreign keys for Supabase Join Hints
DO $$
BEGIN
  -- friendships_friend_id_fkey
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'user_friendships' AND constraint_name IN ('user_friendships_friend_id_fkey', 'friendships_friend_id_fkey')) THEN
    ALTER TABLE public.user_friendships DROP CONSTRAINT IF EXISTS friendships_friend_id_fkey;
    ALTER TABLE public.user_friendships DROP CONSTRAINT IF EXISTS user_friendships_friend_id_fkey;
  END IF;
  ALTER TABLE public.user_friendships ADD CONSTRAINT friendships_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES public.users(id) ON DELETE CASCADE;

  -- friendships_user_id_fkey
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'user_friendships' AND constraint_name IN ('user_friendships_user_id_fkey', 'friendships_user_id_fkey')) THEN
    ALTER TABLE public.user_friendships DROP CONSTRAINT IF EXISTS friendships_user_id_fkey;
    ALTER TABLE public.user_friendships DROP CONSTRAINT IF EXISTS user_friendships_user_id_fkey;
  END IF;
  ALTER TABLE public.user_friendships ADD CONSTRAINT friendships_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
END $$;

-- 3. Performance Optimizations & Missing Columns in users
DO $$
BEGIN
  -- bio
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
    ALTER TABLE public.users ADD COLUMN bio TEXT;
  END IF;
  -- last_active
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_active') THEN
    ALTER TABLE public.users ADD COLUMN last_active TIMESTAMPTZ DEFAULT NOW();
  END IF;
  -- is_public
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_public') THEN
    ALTER TABLE public.users ADD COLUMN is_public BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Trigram indexes for search
CREATE INDEX IF NOT EXISTS idx_users_display_name_trgm ON public.users USING gin (display_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_bio_trgm ON public.users USING gin (bio gin_trgm_ops);

-- Standard indexes
CREATE INDEX IF NOT EXISTS idx_users_last_active ON public.users(last_active DESC);
CREATE INDEX IF NOT EXISTS idx_users_is_public ON public.users(is_public);
CREATE INDEX IF NOT EXISTS idx_users_display_name_lower ON public.users (LOWER(display_name));

-- User friendships indexes
CREATE INDEX IF NOT EXISTS idx_user_friendships_lookup ON public.user_friendships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_friendships_friend_lookup ON public.user_friendships(friend_id, status);
CREATE INDEX IF NOT EXISTS idx_user_friendships_created_at ON public.user_friendships(created_at DESC);
