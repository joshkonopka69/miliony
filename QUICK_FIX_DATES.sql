-- Quick fix: Update all 2025 events to 2026
UPDATE events 
SET scheduled_datetime = scheduled_datetime + INTERVAL '1 year'
WHERE EXTRACT(YEAR FROM scheduled_datetime) = 2025;

-- Verify the fix
SELECT 
  id,
  title,
  scheduled_datetime,
  scheduled_datetime > NOW() as is_future
FROM events 
ORDER BY scheduled_datetime;

