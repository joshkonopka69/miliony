// Google Places API service for venue search and filtering
// Note: This is a mock implementation. In a real app, you would use the actual Google Places API

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

export interface ActivityFilter {
  types: string[];
  keywords: string[];
  radius: number;
}

class PlacesApiService {
  private apiKey: string = 'YOUR_GOOGLE_PLACES_API_KEY'; // Replace with actual API key
  private baseUrl: string = 'https://maps.googleapis.com/maps/api/place';

  // Mock places data for testing
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
  ];

  async searchNearby(
    location: { lat: number; lng: number },
    filter: ActivityFilter
  ): Promise<Place[]> {
    // Mock implementation - in real app, this would call Google Places API
    console.log('Searching nearby places:', { location, filter });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

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

    return results;
  }

  async getPlaceDetails(placeId: string): Promise<Place | null> {
    // Mock implementation - in real app, this would call Google Places Details API
    console.log('Getting place details for:', placeId);

    await new Promise(resolve => setTimeout(resolve, 500));

    return this.mockPlaces.find(place => place.placeId === placeId) || null;
  }

  async getPlacePhoto(photoReference: string, maxWidth: number = 400): Promise<string> {
    // Mock implementation - in real app, this would call Google Places Photo API
    console.log('Getting place photo:', photoReference);

    // Return a placeholder image URL
    return `https://via.placeholder.com/${maxWidth}x${Math.floor(maxWidth * 0.75)}/cccccc/666666?text=Place+Photo`;
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

  // Real Google Places API implementation (commented out for now)
  /*
  async searchNearby(
    location: { lat: number; lng: number },
    filter: ActivityFilter
  ): Promise<Place[]> {
    const params = new URLSearchParams({
      location: `${location.lat},${location.lng}`,
      radius: filter.radius.toString(),
      key: this.apiKey,
    });

    if (filter.types.length > 0) {
      params.append('type', filter.types[0]); // Google Places API only supports one type at a time
    }

    if (filter.keywords.length > 0) {
      params.append('keyword', filter.keywords.join(' '));
    }

    const response = await fetch(
      `${this.baseUrl}/nearbysearch/json?${params}`
    );
    const data = await response.json();

    return data.results.map((result: any) => ({
      placeId: result.place_id,
      name: result.name,
      address: result.vicinity,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      rating: result.rating,
      priceLevel: result.price_level,
      types: result.types,
    }));
  }
  */
}

export const placesApiService = new PlacesApiService();
export default placesApiService;
