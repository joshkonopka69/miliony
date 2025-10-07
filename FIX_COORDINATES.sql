-- Fix coordinates if they're invalid
UPDATE events SET 
  latitude = 51.1079, 
  longitude = 17.0385, 
  place_name = 'Rynek, Wrocław' 
WHERE title = 'Basketball 3v3';

UPDATE events SET 
  latitude = 51.0886, 
  longitude = 17.0422, 
  place_name = 'Park Południowy, Wrocław' 
WHERE title = 'Morning 5K Run';

UPDATE events SET 
  latitude = 51.1409, 
  longitude = 16.9428, 
  place_name = 'Stadion Wrocław' 
WHERE title = '5-a-side Football';

-- Verify coordinates are set
SELECT id, title, latitude, longitude, place_name FROM events WHERE status = 'active';
