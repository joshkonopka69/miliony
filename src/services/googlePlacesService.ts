/**
 * Google Places API Service
 * Handles location search, place details, and photo retrieval
 */

// Get API key from environment (you'll need to add this to your .env file)
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';

// Location result interface
export interface PlaceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  rating?: number;
  photoReference?: string;
  types: string[];
  placeId: string;
  category?: string;
}

// Cache for reducing API calls
const locationCache = new Map<string, { data: PlaceLocation[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get place type for Google Places API based on filter category
 */
const getCategoryType = (category: string): string => {
  const typeMap: Record<string, string> = {
    sport_halls: 'gym',
    sport_fields: 'stadium',
    parks: 'park',
    fitness: 'gym',
    all: 'point_of_interest',
  };
  return typeMap[category] || 'point_of_interest';
};

/**
 * Get search keywords for categories without specific types
 */
const getCategoryKeyword = (category: string): string => {
  const keywordMap: Record<string, string> = {
    fight_clubs: 'martial arts boxing mma',
    outside_courts: 'basketball court tennis court',
    water_sports: 'kayak canoe water sports',
    outdoor: 'hiking climbing outdoor',
  };
  return keywordMap[category] || '';
};

/**
 * Search for nearby places using Google Places API
 */
export const searchNearbyPlaces = async (
  latitude: number,
  longitude: number,
  category: string,
  radius: number = 5000
): Promise<PlaceLocation[]> => {
  try {
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    
    const params: Record<string, string> = {
      location: `${latitude},${longitude}`,
      radius: radius.toString(),
      type: getCategoryType(category),
      key: GOOGLE_PLACES_API_KEY,
    };

    // Add keyword if category needs it
    const keyword = getCategoryKeyword(category);
    if (keyword) {
      params.keyword = keyword;
    }

    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${baseUrl}?${queryString}`);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    if (data.status === 'ZERO_RESULTS') {
      return [];
    }

    return data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      address: place.vicinity || place.formatted_address || '',
      rating: place.rating,
      photoReference: place.photos?.[0]?.photo_reference,
      types: place.types || [],
      placeId: place.place_id,
      category,
    }));
  } catch (error) {
    console.error('Error searching nearby places:', error);
    throw error;
  }
};

/**
 * Search with caching to reduce API calls
 */
export const searchWithCache = async (
  latitude: number,
  longitude: number,
  category: string,
  radius: number = 5000
): Promise<PlaceLocation[]> => {
  const cacheKey = `${latitude.toFixed(4)}-${longitude.toFixed(4)}-${category}-${radius}`;
  const cached = locationCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 Using cached location data');
    return cached.data;
  }
  
  console.log('🌐 Fetching fresh location data from Google Places');
  const data = await searchNearbyPlaces(latitude, longitude, category, radius);
  locationCache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
};

/**
 * Get detailed information about a specific place
 */
export const getPlaceDetails = async (placeId: string): Promise<any> => {
  try {
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
    
    const params = {
      place_id: placeId,
      fields: 'name,formatted_address,geometry,rating,photos,opening_hours,formatted_phone_number,website',
      key: GOOGLE_PLACES_API_KEY,
    };

    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${baseUrl}?${queryString}`);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    return data.result;
  } catch (error) {
    console.error('Error getting place details:', error);
    throw error;
  }
};

/**
 * Get photo URL from Google Places photo reference
 */
export const getPlacePhotoUrl = (
  photoReference: string,
  maxWidth: number = 400
): string => {
  if (!photoReference) return '';
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Clear the location cache (useful for forcing fresh data)
 */
export const clearLocationCache = (): void => {
  locationCache.clear();
  console.log('🗑️ Location cache cleared');
};








