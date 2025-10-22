-- ====================================================================
-- MIGRATION: Fix Group Members RLS Infinite Recursion (V2)
-- Description: Completely removes and recreates group_members policies
-- ====================================================================

-- STEP 1: Disable RLS temporarily to remove all policies
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL existing policies (using wildcard approach)
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'group_members' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.group_members', pol.policyname);
    END LOOP;
END $$;

-- STEP 3: Re-enable RLS
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create NEW corrected policies (without recursion)

-- 1. SELECT: Users can view members of groups they belong to
CREATE POLICY "Users can view their group members"
  ON public.group_members FOR SELECT
  USING (
    -- User can see themselves
    user_id = auth.uid()
    OR
    -- OR user is in the same group (check via groups table to avoid recursion)
    EXISTS (
      SELECT 1 
      FROM public.groups g
      WHERE g.id = group_id
      AND g.id IN (
        SELECT gm2.group_id 
        FROM public.group_members gm2 
        WHERE gm2.user_id = auth.uid()
      )
    )
  );

-- 2. INSERT: Users can join groups, admins can add members
CREATE POLICY "Users can join groups or admins can add members"
  ON public.group_members FOR INSERT
  WITH CHECK (
    -- User can add themselves (joining a group)
    user_id = auth.uid()
    OR
    -- OR user is admin of the group (adding others)
    EXISTS (
      SELECT 1 
      FROM public.groups g
      WHERE g.id = group_id
      AND g.created_by = auth.uid()
    )
  );

-- 3. UPDATE: Users can update their own membership, admins can update any member
CREATE POLICY "Users can update their membership or admins can update"
  ON public.group_members FOR UPDATE
  USING (
    -- User can update their own membership
    user_id = auth.uid()
    OR
    -- OR user is the group creator/admin
    EXISTS (
      SELECT 1 
      FROM public.groups g
      WHERE g.id = group_id
      AND g.created_by = auth.uid()
    )
  );

-- 4. DELETE: Users can leave groups, admins can remove members
CREATE POLICY "Users can leave or admins can remove members"
  ON public.group_members FOR DELETE
  USING (
    -- User can remove themselves (leaving)
    user_id = auth.uid()
    OR
    -- OR user is the group creator/admin
    EXISTS (
      SELECT 1 
      FROM public.groups g
      WHERE g.id = group_id
      AND g.created_by = auth.uid()
    )
  );

-- ====================================================================
-- END MIGRATION
-- ====================================================================

