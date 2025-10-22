-- ====================================================================
-- MIGRATION: Fix Group Members RLS Infinite Recursion
-- Description: Fixes the infinite recursion in group_members policies
-- ====================================================================

-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view group members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can insert members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can update members" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can delete members" ON public.group_members;

-- Create corrected RLS Policies for group_members (without recursion)

-- 1. SELECT: Users can view members of groups they belong to
CREATE POLICY "Users can view their group members"
  ON public.group_members FOR SELECT
  USING (
    -- User can see members of groups they are in
    group_id IN (
      SELECT gm.group_id 
      FROM public.group_members gm 
      WHERE gm.user_id = auth.uid() 
      AND gm.is_active = true
    )
    OR
    -- OR user can see themselves
    user_id = auth.uid()
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
  )
  WITH CHECK (
    -- Same conditions for the updated row
    user_id = auth.uid()
    OR
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


