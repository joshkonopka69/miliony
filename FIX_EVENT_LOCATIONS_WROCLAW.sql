-- ═══════════════════════════════════════════════════════════════════════════
-- 📍 FIX EVENT LOCATIONS - SET TO WROCŁAW
-- ═══════════════════════════════════════════════════════════════════════════
-- This script checks and updates event locations to be in Wrocław
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Show current event locations
SELECT 
  '📍 CURRENT EVENT LOCATIONS' as section,
  id,
  title,
  sport_type,
  latitude,
  longitude,
  location_name,
  status
FROM events 
ORDER BY title;

-- 2. Check if coordinates are valid (not NULL and not 0)
SELECT 
  '🔍 COORDINATE VALIDATION' as section,
  id,
  title,
  CASE 
    WHEN latitude IS NULL OR longitude IS NULL THEN '❌ NULL coordinates'
    WHEN latitude = 0 OR longitude = 0 THEN '❌ Zero coordinates'
    WHEN latitude < 50.9 OR latitude > 51.3 THEN '⚠️ Outside Wrocław (latitude)'
    WHEN longitude < 16.8 OR longitude > 17.5 THEN '⚠️ Outside Wrocław (longitude)'
    ELSE '✅ Valid Wrocław coordinates'
  END as status,
  latitude,
  longitude
FROM events 
ORDER BY title;

-- 3. Update all events to various locations in Wrocław
-- Wrocław city center: 51.1079° N, 17.0385° E
-- Popular sports locations in Wrocław:

-- Update Basketball 3v3 to Wrocław Market Square area (city center)
UPDATE events 
SET 
  latitude = 51.1079,
  longitude = 17.0385,
  location_name = 'Rynek (Market Square), Wrocław'
WHERE title = 'Basketball 3v3';

-- Update Morning 5K Run to Park Południowy (popular running spot)
UPDATE events 
SET 
  latitude = 51.0886,
  longitude = 17.0422,
  location_name = 'Park Południowy, Wrocław'
WHERE title = 'Morning 5K Run';

-- Update 5-a-side Football to Stadion Wrocław area
UPDATE events 
SET 
  latitude = 51.1409,
  longitude = 16.9428,
  location_name = 'Stadion Wrocław area'
WHERE title = '5-a-side Football';

-- 4. Verify the updates
SELECT 
  '✅ UPDATED EVENT LOCATIONS' as section,
  id,
  title,
  sport_type,
  latitude,
  longitude,
  location_name,
  status,
  CASE 
    WHEN latitude >= 50.9 AND latitude <= 51.3 
     AND longitude >= 16.8 AND longitude <= 17.5 
    THEN '✅ In Wrocław'
    ELSE '❌ Outside Wrocław'
  END as location_check
FROM events 
ORDER BY title;

-- 5. Calculate distance from user location (approximate)
-- User location from logs: 51.0367967, 17.3133676
SELECT 
  '📏 DISTANCE FROM YOUR LOCATION' as section,
  title,
  latitude,
  longitude,
  -- Rough distance calculation (not precise, but gives an idea)
  ROUND(
    111.32 * SQRT(
      POW(latitude - 51.0368, 2) + 
      POW((longitude - 17.3134) * COS(RADIANS(51.0368)), 2)
    ),
    2
  ) as distance_km
FROM events 
ORDER BY distance_km;

