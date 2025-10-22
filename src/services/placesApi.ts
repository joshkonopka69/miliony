// Google Places API service for venue search and filtering
// Real implementation using Google Places API

import { performanceOptimizer } from '../utils/performanceOptimizer';

export interface Place {
  placeId: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  rating?: number;
  priceLevel?: number;
  phoneNumber?: string;
  website?: string;
  openingHours?: string[];
  photos?: string[];
  types: string[];
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  rating?: number;
  priceLevel?: number;
  phoneNumber?: string;
  website?: string;
  openingHours?: {
    openNow: boolean;
    periods: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
    weekdayText: string[];
  };
  photos?: Array<{
    photoReference: string;
    height: number;
    width: number;
  }>;
  reviews?: Array<{
    authorName: string;
    rating: number;
    text: string;
    time: number;
    profilePhotoUrl?: string;
  }>;
  types: string[];
  utcOffset?: number;
  vicinity?: string;
  formattedPhoneNumber?: string;
  internationalPhoneNumber?: string;
  url?: string;
  utcOffsetMinutes?: number;
}

export interface ActivityFilter {
  types: string[];
  keywords: string[];
  radius: number;
}

// Google Places API type mapping for activity filters
export const GOOGLE_PLACES_TYPES = {
  'gym': 'gym',
  'stadium': 'stadium',
  'swimming_pool': 'swimming_pool',
  'park': 'park',
  'sports_complex': 'sports_complex',
  'bowling_alley': 'bowling_alley',
  'golf_course': 'golf_course',
  'ice_rink': 'ice_rink',
  'tennis_court': 'tennis_court',
  'basketball_court': 'basketball_court',
} as const;

class PlacesApiService {
  private apiKey: string = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 'AIzaSyDBJ65DOu4WMoTRjvz1J6i6VbYbjOoEW2E';
  private baseUrl: string = 'https://maps.googleapis.com/maps/api/place';
  private useMockData: boolean = false; // Set to false to use real API (CHANGED TO FALSE)
  private placeDetailsCache: Map<string, { data: PlaceDetails; timestamp: number }> = new Map();
  private cacheExpiryTime: number = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  // Mock data for fallback when API fails (Wrocław, Poland area)
  private mockPlaces: Place[] = [
    {
      placeId: 'ChIJ_Wroclaw_Park1',
      name: 'Park Szczytnicki',
      address: 'Park Szczytnicki, Wrocław, Poland',
      coordinates: { lat: 51.1089, lng: 17.0770 },
      rating: 4.7,
      types: ['park', 'tourist_attraction'],
    },
    {
      placeId: 'ChIJ_Wroclaw_Gym1',
      name: 'CityFit Wrocław',
      address: 'Powstańców Śląskich 95, 53-332 Wrocław',
      coordinates: { lat: 51.0970, lng: 17.0340 },
      rating: 4.3,
      priceLevel: 2,
      phoneNumber: '+48-71-123-4567',
      website: 'https://cityfit.pl',
      types: ['gym', 'health'],
    },
    {
      placeId: 'ChIJ_Wroclaw_Stadium1',
      name: 'Stadion Wrocław',
      address: 'Aleja Śląska 1, 54-118 Wrocław',
      coordinates: { lat: 51.1408, lng: 16.9426 },
      rating: 4.6,
      priceLevel: 3,
      phoneNumber: '+48-71-366-0066',
      website: 'https://stadionwroclaw.pl',
      types: ['stadium', 'sports_complex'],
    },
    {
      placeId: 'ChIJ_Wroclaw_Park2',
      name: 'Park Południowy',
      address: 'Park Południowy, Wrocław, Poland',
      coordinates: { lat: 51.0838, lng: 17.0054 },
      rating: 4.5,
      types: ['park', 'tourist_attraction'],
    },
    {
      placeId: 'ChIJ_Wroclaw_Gym2',
      name: 'Fitness Club Wrocław',
      address: 'Oławska 23, 50-123 Wrocław',
      coordinates: { lat: 51.0948, lng: 17.0306 },
      rating: 4.2,
      priceLevel: 2,
      phoneNumber: '+48-71-987-6543',
      types: ['gym', 'health'],
    },
    {
      placeId: 'ChIJ_Wroclaw_Sports1',
      name: 'Hala Orbita',
      address: 'Wejherowska 34, 54-239 Wrocław',
      coordinates: { lat: 51.1278, lng: 16.9648 },
      rating: 4.4,
      priceLevel: 2,
      types: ['sports_complex', 'gym'],
    },
    {
      placeId: 'ChIJ_Wroclaw_Park3',
      name: 'Park Grabiszyński',
      address: 'Park Grabiszyński, Wrocław, Poland',
      coordinates: { lat: 51.0730, lng: 17.0050 },
      rating: 4.6,
      types: ['park', 'tourist_attraction'],
    },
    {
      placeId: 'ChIJ_Wroclaw_Pool1',
      name: 'Aqua Park Wrocław',
      address: 'Borowska 99, 50-558 Wrocław',
      coordinates: { lat: 51.0768, lng: 17.0458 },
      rating: 4.3,
      priceLevel: 3,
      phoneNumber: '+48-71-798-6590',
      website: 'https://aquapark.wroc.pl',
      types: ['swimming_pool', 'sports_complex'],
    },
  ];

  async searchNearby(
    location: { lat: number; lng: number },
    filter: ActivityFilter
  ): Promise<Place[]> {
    console.log('🔍 Searching nearby places:', { location, filter });
    console.log('🔍 Filter types:', filter.types);
    console.log('🔍 Filter keywords:', filter.keywords);
    console.log('🔍 Filter radius:', filter.radius);

    // Create cache key for this search
    const cacheKey = `searchNearby_${location.lat}_${location.lng}_${JSON.stringify(filter)}`;
    
    // Check cache first
    const cached = performanceOptimizer.getCache(cacheKey);
    if (cached) {
      console.log('✅ Returning cached results:', cached.length, 'places');
      return cached;
    }

    // Use mock data for testing - set useMockData to false to use real API
    if (this.useMockData) {
      console.log('Using mock data for testing');
      const mockResults = this.getMockResults(location, filter);
      performanceOptimizer.setCache(cacheKey, mockResults, 2 * 60 * 1000); // 2 minutes cache
      return mockResults;
    }

    try {
      const allResults: Place[] = [];
      
      // If no types specified, search for general establishments
      if (filter.types.length === 0) {
        console.log('⚠️ No types specified, using keyword search');
        const results = await this.searchByKeyword(location, filter);
        console.log(`📊 Keyword search found ${results.length} results`);
        allResults.push(...results);
      } else {
        console.log('🎯 Searching by types:', filter.types);
        // Search for each type separately (Google Places API limitation)
        for (const type of filter.types) {
          const googleType = GOOGLE_PLACES_TYPES[type as keyof typeof GOOGLE_PLACES_TYPES];
          console.log(`🔎 Searching for type: ${type} -> Google type: ${googleType}`);
          if (googleType) {
            const results = await this.searchByType(location, googleType, filter);
            console.log(`✅ Found ${results.length} results for type ${type}`);
            allResults.push(...results);
          } else {
            console.warn(`⚠️ No Google Places type mapping for: ${type}`);
          }
        }
      }

      console.log(`📊 Total results before deduplication: ${allResults.length}`);

      // Remove duplicates based on placeId
      const uniqueResults = allResults.filter((place, index, self) =>
        index === self.findIndex(p => p.placeId === place.placeId)
      );

      console.log(`✅ Results after deduplication: ${uniqueResults.length}`);
      
      // Log sample of results for debugging
      if (uniqueResults.length > 0 && uniqueResults.length <= 5) {
        console.log('📍 Sample results:', uniqueResults.map(p => ({ name: p.name, types: p.types })));
      }

      // Apply keyword filtering if specified
      let filteredResults = uniqueResults;
      if (filter.keywords.length > 0) {
        console.log('Applying keyword filtering:', filter.keywords);
        filteredResults = uniqueResults.filter(place =>
          filter.keywords.some(keyword =>
            place.name.toLowerCase().includes(keyword.toLowerCase()) ||
            place.address.toLowerCase().includes(keyword.toLowerCase())
          )
        );
        console.log(`Results after keyword filtering: ${filteredResults.length}`);
      }

      console.log('Final results:', filteredResults);
      
      // Cache the results
      performanceOptimizer.setCache(cacheKey, filteredResults, 5 * 60 * 1000); // 5 minutes cache
      
      return filteredResults;
    } catch (error) {
      console.error('Error searching nearby places, using mock data:', error);
      
      // Fallback to mock data when API fails
      return this.getMockResults(location, filter);
    }
  }

  private getMockResults(
    location: { lat: number; lng: number },
    filter: ActivityFilter
  ): Place[] {
    console.log('Using mock data for search');
    
    // Filter mock data based on criteria
    let results = this.mockPlaces.filter(place => {
      // Check if place is within radius (simplified distance calculation)
      const distance = this.calculateDistance(location, place.coordinates);
      if (distance > filter.radius) return false;

      // Check if place matches any selected types
      if (filter.types.length > 0) {
        const hasMatchingType = filter.types.some(type => 
          place.types.includes(type)
        );
        if (!hasMatchingType) return false;
      }

      // Check if place matches keywords
      if (filter.keywords.length > 0) {
        const hasMatchingKeyword = filter.keywords.some(keyword =>
          place.name.toLowerCase().includes(keyword.toLowerCase()) ||
          place.address.toLowerCase().includes(keyword.toLowerCase())
        );
        if (!hasMatchingKeyword) return false;
      }

      return true;
    });

    console.log(`Mock results: ${results.length} places found`);
    return results;
  }

  private async searchByType(
    location: { lat: number; lng: number },
    type: string,
    filter: ActivityFilter
  ): Promise<Place[]> {
    const params = new URLSearchParams({
      location: `${location.lat},${location.lng}`,
      radius: filter.radius.toString(),
      type: type,
      key: this.apiKey,
    });

    // Add keyword search if specified
    if (filter.keywords.length > 0) {
      params.append('keyword', filter.keywords.join(' '));
    }

    const url = `${this.baseUrl}/nearbysearch/json?${params}`;
    console.log(`🌐 Making API request for type "${type}":`, url);

    const response = await fetch(url);

    console.log(`📡 API response status for "${type}":`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`📦 API response for "${type}":`, {
      status: data.status,
      resultsCount: data.results?.length || 0,
      errorMessage: data.error_message
    });

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error(`❌ Google Places API error for "${type}":`, data.status, data.error_message);
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    if (data.status === 'ZERO_RESULTS') {
      console.log(`⚠️ No results found for type "${type}"`);
      return [];
    }

    const results = data.results.map((result: any) => ({
      placeId: result.place_id,
      name: result.name,
      address: result.vicinity || result.formatted_address || 'Address not available',
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      rating: result.rating,
      priceLevel: result.price_level,
      types: result.types || [],
    }));

    console.log(`✅ Mapped ${results.length} results for type "${type}"`);
    if (results.length > 0 && results.length <= 3) {
      console.log(`📍 Sample results for "${type}":`, results.map(r => ({ name: r.name, types: r.types })));
    }
    return results;
  }

  private async searchByKeyword(
    location: { lat: number; lng: number },
    filter: ActivityFilter
  ): Promise<Place[]> {
    // Use text search when no specific types are selected
    const keyword = filter.keywords.length > 0 
      ? filter.keywords.join(' ') 
      : 'sports fitness gym park';

    console.log('Using keyword search with:', keyword);

    const params = new URLSearchParams({
      query: keyword,
      location: `${location.lat},${location.lng}`,
      radius: filter.radius.toString(),
      key: this.apiKey,
    });

    const url = `${this.baseUrl}/textsearch/json?${params}`;
    console.log('Making keyword API request to:', url);

    const response = await fetch(url);

    console.log('Keyword API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Keyword API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Keyword API response data:', data);

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    const results = data.results.map((result: any) => ({
      placeId: result.place_id,
      name: result.name,
      address: result.formatted_address || 'Address not available',
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      rating: result.rating,
      priceLevel: result.price_level,
      types: result.types || [],
    }));

    console.log(`Mapped ${results.length} results for keyword search`);
    return results;
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    console.log('Getting place details for:', placeId);

    // Check cache first
    const cached = this.placeDetailsCache.get(placeId);
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiryTime) {
      console.log('Returning cached place details for:', placeId);
      return cached.data;
    }

    // Use mock data for testing
    if (this.useMockData) {
      console.log('Using mock place details for:', placeId);
      const mockDetails = this.getMockPlaceDetails(placeId);
      if (mockDetails) {
        // Cache the mock data
        this.placeDetailsCache.set(placeId, {
          data: mockDetails,
          timestamp: Date.now()
        });
        return mockDetails;
      }
    }

    try {
      const params = new URLSearchParams({
        place_id: placeId,
        fields: 'place_id,name,formatted_address,geometry,rating,price_level,formatted_phone_number,website,opening_hours,photos,reviews,types,utc_offset,vicinity,international_phone_number,url,utc_offset_minutes',
        key: this.apiKey,
      });

      const response = await fetch(
        `${this.baseUrl}/details/json?${params}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
      }

      const result = data.result;
      const placeDetails: PlaceDetails = {
        placeId: result.place_id,
        name: result.name,
        address: result.formatted_address || 'Address not available',
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
        rating: result.rating,
        priceLevel: result.price_level,
        phoneNumber: result.formatted_phone_number,
        website: result.website,
        openingHours: result.opening_hours ? {
          openNow: result.opening_hours.open_now,
          periods: result.opening_hours.periods || [],
          weekdayText: result.opening_hours.weekday_text || []
        } : undefined,
        photos: result.photos?.map((photo: any) => ({
          photoReference: photo.photo_reference,
          height: photo.height,
          width: photo.width
        })) || [],
        reviews: result.reviews?.map((review: any) => ({
          authorName: review.author_name,
          rating: review.rating,
          text: review.text,
          time: review.time,
          profilePhotoUrl: review.profile_photo_url
        })) || [],
        types: result.types || [],
        utcOffset: result.utc_offset,
        vicinity: result.vicinity,
        formattedPhoneNumber: result.formatted_phone_number,
        internationalPhoneNumber: result.international_phone_number,
        url: result.url,
        utcOffsetMinutes: result.utc_offset_minutes
      };

      // Cache the result
      this.placeDetailsCache.set(placeId, {
        data: placeDetails,
        timestamp: Date.now()
      });

      console.log('Place details fetched and cached for:', placeId);
      return placeDetails;
    } catch (error) {
      console.error('Error getting place details:', error);
      
      // Fallback to mock data
      const mockDetails = this.getMockPlaceDetails(placeId);
      if (mockDetails) {
        console.log('Using mock data as fallback for:', placeId);
        return mockDetails;
      }
      
      throw new Error('Failed to get place details');
    }
  }

  private getMockPlaceDetails(placeId: string): PlaceDetails | null {
    const mockPlacesDetails: { [key: string]: PlaceDetails } = {
      'ChIJ123456789': {
        placeId: 'ChIJ123456789',
        name: 'Central Park',
        address: 'Central Park, New York, NY 10024',
        coordinates: { lat: 40.7829, lng: -73.9654 },
        rating: 4.5,
        priceLevel: 0,
        phoneNumber: '+1-212-310-6600',
        website: 'https://www.centralparknyc.org',
        openingHours: {
          openNow: true,
          periods: [],
          weekdayText: ['Monday: 6:00 AM – 1:00 AM', 'Tuesday: 6:00 AM – 1:00 AM', 'Wednesday: 6:00 AM – 1:00 AM', 'Thursday: 6:00 AM – 1:00 AM', 'Friday: 6:00 AM – 1:00 AM', 'Saturday: 6:00 AM – 1:00 AM', 'Sunday: 6:00 AM – 1:00 AM']
        },
        photos: [
          { photoReference: 'mock_photo_1', height: 400, width: 600 }
        ],
        reviews: [
          {
            authorName: 'John Doe',
            rating: 5,
            text: 'Beautiful park with great walking trails and recreational facilities.',
            time: Date.now() - 86400000, // 1 day ago
            profilePhotoUrl: 'https://via.placeholder.com/50'
          }
        ],
        types: ['park', 'tourist_attraction'],
        utcOffset: -300,
        vicinity: 'Manhattan, New York'
      },
      'ChIJ987654321': {
        placeId: 'ChIJ987654321',
        name: 'Equinox Gym',
        address: '123 Main St, New York, NY 10001',
        coordinates: { lat: 40.7589, lng: -73.9851 },
        rating: 4.2,
        priceLevel: 3,
        phoneNumber: '+1-555-0123',
        website: 'https://equinox.com',
        openingHours: {
          openNow: true,
          periods: [],
          weekdayText: ['Monday: 5:00 AM – 11:00 PM', 'Tuesday: 5:00 AM – 11:00 PM', 'Wednesday: 5:00 AM – 11:00 PM', 'Thursday: 5:00 AM – 11:00 PM', 'Friday: 5:00 AM – 11:00 PM', 'Saturday: 6:00 AM – 10:00 PM', 'Sunday: 7:00 AM – 9:00 PM']
        },
        photos: [
          { photoReference: 'mock_photo_2', height: 400, width: 600 }
        ],
        reviews: [
          {
            authorName: 'Jane Smith',
            rating: 4,
            text: 'Great gym with excellent equipment and clean facilities.',
            time: Date.now() - 172800000, // 2 days ago
            profilePhotoUrl: 'https://via.placeholder.com/50'
          }
        ],
        types: ['gym', 'health'],
        utcOffset: -300,
        vicinity: 'Manhattan, New York'
      }
    };

    return mockPlacesDetails[placeId] || null;
  }

  async getPlacePhoto(photoReference: string, maxWidth: number = 400): Promise<string> {
    console.log('Getting place photo:', photoReference);

    try {
      const params = new URLSearchParams({
        photo_reference: photoReference,
        maxwidth: maxWidth.toString(),
        key: this.apiKey,
      });

      const response = await fetch(
        `${this.baseUrl}/photo?${params}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Return the photo URL
      return response.url;
    } catch (error) {
      console.error('Error getting place photo:', error);
      // Return a placeholder image URL as fallback
      return `https://via.placeholder.com/${maxWidth}x${Math.floor(maxWidth * 0.75)}/cccccc/666666?text=Photo+Not+Available`;
    }
  }

  // Utility methods
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    // Simplified distance calculation (not accurate for large distances)
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLng = this.toRad(point2.lng - point1.lng);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.lat)) * Math.cos(this.toRad(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Return distance in meters
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Cache management methods
  clearCache(): void {
    this.placeDetailsCache.clear();
    console.log('Place details cache cleared');
  }

  getCacheSize(): number {
    return this.placeDetailsCache.size;
  }

  isCached(placeId: string): boolean {
    const cached = this.placeDetailsCache.get(placeId);
    return cached !== undefined && (Date.now() - cached.timestamp) < this.cacheExpiryTime;
  }

  // Enhanced photo URL generation
  getPlacePhotoUrl(photoReference: string, maxWidth: number = 400, maxHeight?: number): string {
    const params = new URLSearchParams({
      photo_reference: photoReference,
      maxwidth: maxWidth.toString(),
      key: this.apiKey,
    });

    if (maxHeight) {
      params.append('maxheight', maxHeight.toString());
    }

    return `${this.baseUrl}/photo?${params}`;
  }

  // Get place details with photo URLs
  async getPlaceDetailsWithPhotos(placeId: string): Promise<PlaceDetails | null> {
    const placeDetails = await this.getPlaceDetails(placeId);
    if (!placeDetails || !placeDetails.photos) {
      return placeDetails;
    }

    // Add photo URLs to the place details
    const placeDetailsWithPhotos = {
      ...placeDetails,
      photos: placeDetails.photos.map(photo => ({
        ...photo,
        url: this.getPlacePhotoUrl(photo.photoReference, 400, 300)
      }))
    };

    return placeDetailsWithPhotos;
  }

}

export const placesApiService = new PlacesApiService();
export default placesApiService;
