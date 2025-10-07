-- Quick fix: Set all events to Wrocław locations

-- Check current locations
SELECT id, title, latitude, longitude, location_name FROM events;

-- Update all events to Wrocław coordinates
UPDATE events SET latitude = 51.1079, longitude = 17.0385, location_name = 'Rynek, Wrocław' WHERE title = 'Basketball 3v3';
UPDATE events SET latitude = 51.0886, longitude = 17.0422, location_name = 'Park Południowy, Wrocław' WHERE title = 'Morning 5K Run';
UPDATE events SET latitude = 51.1409, longitude = 16.9428, location_name = 'Stadion Wrocław' WHERE title = '5-a-side Football';

-- Verify updates
SELECT id, title, latitude, longitude, location_name FROM events;

