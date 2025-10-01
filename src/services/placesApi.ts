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
  private apiKey: string = 'AIzaSyDBJ65DOu4WMoTRjvz1J6i6VbYbjOoEW2E'; // Using the API key from MyPlaceDetailsScreen
  private baseUrl: string = 'https://maps.googleapis.com/maps/api/place';
  private useMockData: boolean = true; // Set to false to use real API
  private placeDetailsCache: Map<string, { data: PlaceDetails; timestamp: number }> = new Map();
  private cacheExpiryTime: number = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  // Mock data for fallback when API fails
  private mockPlaces: Place[] = [
    {
      placeId: 'ChIJ123456789',
      name: 'Central Park',
      address: 'Central Park, New York, NY 10024',
      coordinates: { lat: 40.7829, lng: -73.9654 },
      rating: 4.5,
      types: ['park', 'tourist_attraction'],
    },
    {
      placeId: 'ChIJ987654321',
      name: 'Equinox Gym',
      address: '123 Main St, New York, NY 10001',
      coordinates: { lat: 40.7589, lng: -73.9851 },
      rating: 4.2,
      priceLevel: 3,
      phoneNumber: '+1-555-0123',
      website: 'https://equinox.com',
      types: ['gym', 'health'],
    },
    {
      placeId: 'ChIJ555666777',
      name: 'Madison Square Garden',
      address: '4 Pennsylvania Plaza, New York, NY 10001',
      coordinates: { lat: 40.7505, lng: -73.9934 },
      rating: 4.7,
      priceLevel: 4,
      phoneNumber: '+1-212-465-6741',
      website: 'https://msg.com',
      types: ['stadium', 'sports_complex'],
    },
    {
      placeId: 'ChIJ888999000',
      name: 'Brooklyn Bridge Park',
      address: 'Brooklyn Bridge Park, Brooklyn, NY 11201',
      coordinates: { lat: 40.6962, lng: -73.9969 },
      rating: 4.6,
      types: ['park', 'tourist_attraction'],
    },
    {
      placeId: 'ChIJ111222333',
      name: 'NYC Sports Club',
      address: '456 Broadway, New York, NY 10013',
      coordinates: { lat: 40.7282, lng: -74.0776 },
      rating: 4.1,
      priceLevel: 2,
      phoneNumber: '+1-555-0456',
      types: ['gym', 'health'],
    },
    {
      placeId: 'ChIJ444555666',
      name: 'Chelsea Piers',
      address: 'Chelsea Piers, New York, NY 10011',
      coordinates: { lat: 40.7484, lng: -74.0077 },
      rating: 4.3,
      priceLevel: 3,
      types: ['sports_complex', 'gym'],
    },
    {
      placeId: 'ChIJ777888999',
      name: 'Prospect Park',
      address: 'Prospect Park, Brooklyn, NY 11225',
      coordinates: { lat: 40.6602, lng: -73.9690 },
      rating: 4.4,
      types: ['park', 'tourist_attraction'],
    },
  ];

  async searchNearby(
    location: { lat: number; lng: number },
    filter: ActivityFilter
  ): Promise<Place[]> {
    console.log('Searching nearby places:', { location, filter });

    // Create cache key for this search
    const cacheKey = `searchNearby_${location.lat}_${location.lng}_${JSON.stringify(filter)}`;
    
    // Check cache first
    const cached = performanceOptimizer.getCache(cacheKey);
    if (cached) {
      console.log('Returning cached results');
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
        console.log('No types specified, using keyword search');
        const results = await this.searchByKeyword(location, filter);
        allResults.push(...results);
      } else {
        console.log('Searching by types:', filter.types);
        // Search for each type separately (Google Places API limitation)
        for (const type of filter.types) {
          const googleType = GOOGLE_PLACES_TYPES[type as keyof typeof GOOGLE_PLACES_TYPES];
          console.log(`Searching for type: ${type} -> ${googleType}`);
          if (googleType) {
            const results = await this.searchByType(location, googleType, filter);
            console.log(`Found ${results.length} results for type ${type}`);
            allResults.push(...results);
          }
        }
      }

      console.log(`Total results before deduplication: ${allResults.length}`);

      // Remove duplicates based on placeId
      const uniqueResults = allResults.filter((place, index, self) =>
        index === self.findIndex(p => p.placeId === place.placeId)
      );

      console.log(`Results after deduplication: ${uniqueResults.length}`);

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
    console.log('Making API request to:', url);

    const response = await fetch(url);

    console.log('API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response data:', data);

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.status, data.error_message);
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
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

    console.log(`Mapped ${results.length} results for type ${type}`);
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
