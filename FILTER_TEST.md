# Filter Functionality Test Guide

## Overview
The filter functionality has been successfully implemented with both Google Places API integration and mock data fallback. The system currently uses mock data for testing (set `useMockData = false` in placesApi.ts to use real API). Here's how to test it:

## Test Steps

### 1. Basic Filter Test
1. Open the app and navigate to the Map screen
2. **Initial State**: Verify that no venues are shown and you see "🔍 Apply filters to see venues" message
3. Tap the "🔍 Filter" button in the top-right corner
4. Select one or more venue types (e.g., "Gym/Fitness Center", "Park")
5. Tap "Apply Filters"
6. Verify that:
   - The filter button shows a blue dot (●) indicating active filters
   - Only venues matching the selected types appear on the map
   - A results counter shows "X venues found"
   - No other venues are visible on the map

### 2. Keyword Filter Test
1. Open the filter modal
2. In the "Specific Activities" field, enter keywords like "yoga", "tennis", "swimming"
3. Apply the filters
4. Verify that venues matching these keywords appear on the map

### 3. Radius Filter Test
1. Open the filter modal
2. Change the search radius (1km, 3km, 5km, 10km, 20km)
3. Apply the filters
4. Verify that venues within the selected radius appear

### 4. Combined Filter Test
1. Select multiple venue types
2. Add specific keywords
3. Set a custom radius
4. Apply all filters
5. Verify that results match all criteria

### 5. Reset Filter Test
1. Apply some filters
2. Open the filter modal again
3. Tap "Reset"
4. Verify that all filters are cleared
5. Apply empty filters and verify all venues appear

## Mock Data Available for Testing

The system includes the following mock venues for testing:
- **Central Park** (park, tourist_attraction)
- **Equinox Gym** (gym, health)
- **Madison Square Garden** (stadium, sports_complex)
- **Brooklyn Bridge Park** (park, tourist_attraction)
- **NYC Sports Club** (gym, health)
- **Chelsea Piers** (sports_complex, gym)
- **Prospect Park** (park, tourist_attraction)

## Expected Behavior

### Filter Button States
- **Inactive**: White background, blue text "🔍 Filter"
- **Active**: Blue background, white text "🔍 Filter ●"

### Loading States
- Shows "Loading venues..." when searching
- Shows results counter when search completes
- Shows error messages for network/API issues

### Map Visibility States
- **No Filters Applied**: Shows "🔍 Apply filters to see venues" message, no venues visible
- **Filters Applied with Results**: Shows filtered venues with "X venues found" counter
- **Filters Applied with No Results**: Shows "No venues found matching your filters" message
- **Only Filtered Venues**: Map only displays venues that match the current filters

### Error Handling
- Network errors: "Network error. Please check your internet connection."
- API errors: "Google Places API error. Please try again later."
- No results: "Unable to find venues in this area. Try adjusting your filters."

## API Integration Features

### Google Places API Types
The following venue types are mapped to Google Places API:
- gym → gym
- stadium → stadium
- swimming_pool → swimming_pool
- park → park
- sports_complex → sports_complex
- bowling_alley → bowling_alley
- golf_course → golf_course
- ice_rink → ice_rink
- tennis_court → tennis_court
- basketball_court → basketball_court

### Search Methods
- **Type-based search**: Uses Google Places Nearby Search API
- **Keyword search**: Uses Google Places Text Search API
- **Combined search**: Searches multiple types and combines results
- **Deduplication**: Removes duplicate venues based on place_id

### API Key Configuration
- Uses the API key from MyPlaceDetailsScreen: `AIzaSyDBJ65DOu4WMoTRjvz1J6i6VbYbjOoEW2E`
- Configured for Google Places API endpoints

## Troubleshooting

### Common Issues
1. **No venues found**: Try increasing the search radius or clearing filters
2. **API errors**: Check internet connection and API key validity
3. **Slow loading**: Google Places API has rate limits, wait a moment and try again

### Debug Information
- Check console logs for API requests and responses
- Filter state is logged when applied
- Error details are logged for troubleshooting
