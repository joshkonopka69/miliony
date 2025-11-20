-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR (STEP 1)
-- Creates helper functions that bypass RLS securely
-- ============================================

-- 1) Update avatar via security-definer function
create or replace function public.update_user_avatar(new_url text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users
  set avatar_url = new_url,
      updated_at = now()
  where id = auth.uid();
end;
$$;

grant execute on function public.update_user_avatar(text) to authenticated;

-- 2) Create friend request via security-definer function
create or replace function public.create_friend_request(target_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_friendships (user_id, friend_id, status)
  values (auth.uid(), target_user, 'pending')
  on conflict (user_id, friend_id) do update
  set status = excluded.status,
      updated_at = now();
end;
$$;

grant execute on function public.create_friend_request(uuid) to authenticated;

