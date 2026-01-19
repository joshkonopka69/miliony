-- RPC FUNCTIONS FOR EVENT MESSAGES (SECURITY DEFINER)
-- Run this in Supabase SQL Editor

-- 1) Send message
create or replace function public.send_event_message(
  p_event_id uuid,
  p_message text
)
returns public.event_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  new_msg public.event_messages;
begin
  insert into public.event_messages (event_id, sender_id, message_text, message_type)
  values (p_event_id, auth.uid(), p_message, 'text')
  returning * into new_msg;

  return new_msg;
end;
$$;

grant execute on function public.send_event_message(uuid, text) to authenticated;


-- 2) Get messages for an event (ordered by created_at)
create or replace function public.get_event_messages(
  p_event_id uuid,
  p_limit integer default 50
)
returns setof public.event_messages
language sql
security definer
set search_path = public
as $$
  select *
  from public.event_messages
  where event_id = p_event_id
  order by created_at asc
  limit p_limit;
$$;

grant execute on function public.get_event_messages(uuid, integer) to authenticated;


