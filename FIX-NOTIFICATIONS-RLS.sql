-- Re-enable predictable RLS behaviour for notifications table
BEGIN;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notifications select own" ON public.notifications;
DROP POLICY IF EXISTS "Notifications insert allowed" ON public.notifications;
DROP POLICY IF EXISTS "Notifications update own" ON public.notifications;
DROP POLICY IF EXISTS "Notifications delete own" ON public.notifications;

CREATE POLICY "Notifications select own"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow the client to insert notifications for any recipient.
-- (We enforce who can call this at the application level.)
CREATE POLICY "Notifications insert allowed"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Notifications update own"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Notifications delete own"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

COMMIT;

