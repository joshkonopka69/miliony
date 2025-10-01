import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EnhancedInteractiveMap from '../components/EnhancedInteractiveMap';
import { placesApiService } from '../services/placesApi';
import { firestoreService } from '../services/firestore';

// Mock dependencies
jest.mock('../services/placesApi');
jest.mock('../services/firestore');
jest.mock('expo-location');
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Marker: View,
    Callout: View,
    PROVIDER_GOOGLE: 'google',
  };
});

const mockPlacesApiService = placesApiService as jest.Mocked<typeof placesApiService>;
const mockFirestoreService = firestoreService as jest.Mocked<typeof firestoreService>;

describe('EnhancedInteractiveMap', () => {
  const mockProps = {
    onLocationSelect: jest.fn(),
    searchQuery: '',
    onMapReady: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Alert
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  describe('Map Pin Placement', () => {
    it('should place a pin when map is pressed', async () => {
      const { getByTestId } = render(<EnhancedInteractiveMap {...mockProps} />);
      
      const mapView = getByTestId('map-view');
      const mockEvent = {
        nativeEvent: {
          coordinate: { latitude: 40.7128, longitude: -74.0060 }
        }
      };
      
      fireEvent.press(mapView, mockEvent);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Pin Placed',
          'Coordinates: 40.712800, -74.006000',
          [{ text: 'OK' }]
        );
      });
    });

    it('should display pin coordinates in alert', async () => {
      const { getByTestId } = render(<EnhancedInteractiveMap {...mockProps} />);
      
      const mapView = getByTestId('map-view');
      const mockEvent = {
        nativeEvent: {
          coordinate: { latitude: 37.7749, longitude: -122.4194 }
        }
      };
      
      fireEvent.press(mapView, mockEvent);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Pin Placed',
          'Coordinates: 37.774900, -122.419400',
          [{ text: 'OK' }]
        );
      });
    });
  });

  describe('Place Details Fetching', () => {
    it('should fetch place details when place is pressed', async () => {
      const mockPlace = {
        placeId: 'test-place-id',
        name: 'Test Place',
        address: 'Test Address',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        rating: 4.5,
        types: ['gym'],
      };

      const mockPlaceDetails = {
        placeId: 'test-place-id',
        name: 'Test Place',
        address: 'Test Address',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        rating: 4.5,
        phoneNumber: '+1234567890',
        website: 'https://test.com',
        types: ['gym'],
      };

      mockPlacesApiService.getPlaceDetails.mockResolvedValue(mockPlaceDetails);

      const { getByTestId } = render(<EnhancedInteractiveMap {...mockProps} />);
      
      // Simulate place press
      const placeMarker = getByTestId(`place-marker-${mockPlace.placeId}`);
      fireEvent.press(placeMarker);

      await waitFor(() => {
        expect(mockPlacesApiService.getPlaceDetails).toHaveBeenCalledWith('test-place-id');
      });
    });

    it('should handle place details fetch error', async () => {
      const mockPlace = {
        placeId: 'test-place-id',
        name: 'Test Place',
        address: 'Test Address',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        rating: 4.5,
        types: ['gym'],
      };

      mockPlacesApiService.getPlaceDetails.mockRejectedValue(new Error('API Error'));

      const { getByTestId } = render(<EnhancedInteractiveMap {...mockProps} />);
      
      const placeMarker = getByTestId(`place-marker-${mockPlace.placeId}`);
      fireEvent.press(placeMarker);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to load place details. Please try again.'
        );
      });
    });
  });

  describe('Meetup Creation Flow', () => {
    it('should open event creation modal when creating meetup from place', async () => {
      const mockPlaceDetails = {
        placeId: 'test-place-id',
        name: 'Test Place',
        address: 'Test Address',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        rating: 4.5,
        types: ['gym'],
      };

      const { getByTestId } = render(<EnhancedInteractiveMap {...mockProps} />);
      
      // Simulate creating meetup from place
      const createMeetupButton = getByTestId('create-meetup-button');
      fireEvent.press(createMeetupButton);

      await waitFor(() => {
        expect(getByTestId('event-creation-modal')).toBeTruthy();
      });
    });

    it('should pre-fill event form with place details', async () => {
      const mockPlaceDetails = {
        placeId: 'test-place-id',
        name: 'Test Gym',
        address: '123 Test St',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        rating: 4.5,
        types: ['gym'],
      };

      const { getByTestId } = render(<EnhancedInteractiveMap {...mockProps} />);
      
      // Open event creation modal
      const createMeetupButton = getByTestId('create-meetup-button');
      fireEvent.press(createMeetupButton);

      await waitFor(() => {
        const venueNameInput = getByTestId('venue-name-input');
        expect(venueNameInput.props.value).toBe('Test Gym');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle location permission error', async () => {
      const { getByTestId } = render(<EnhancedInteractiveMap {...mockProps} />);
      
      // Simulate location permission error
      const locationButton = getByTestId('location-button');
      fireEvent.press(locationButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Location Permission',
          'Location permission is required to use this feature.'
        );
      });
    });

    it('should handle API network error', async () => {
      mockPlacesApiService.searchNearby.mockRejectedValue(new Error('Network Error'));

      const { getByTestId } = render(<EnhancedInteractiveMap {...mockProps} />);
      
      const searchButton = getByTestId('search-button');
      fireEvent.press(searchButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to search places. Please try again.'
        );
      });
    });
  });

  describe('Component Rendering', () => {
    it('should render map view', () => {
      const { getByTestId } = render(<EnhancedInteractiveMap {...mockProps} />);
      expect(getByTestId('map-view')).toBeTruthy();
    });

    it('should render search bar', () => {
      const { getByTestId } = render(<EnhancedInteractiveMap {...mockProps} />);
      expect(getByTestId('search-container')).toBeTruthy();
    });

    it('should render filter button', () => {
      const { getByTestId } = render(<EnhancedInteractiveMap {...mockProps} />);
      expect(getByTestId('filter-button')).toBeTruthy();
    });

    it('should render pin management button when pins exist', () => {
      const { getByTestId } = render(<EnhancedInteractiveMap {...mockProps} />);
      
      // Add a pin first
      const mapView = getByTestId('map-view');
      fireEvent.press(mapView, {
        nativeEvent: { coordinate: { latitude: 40.7128, longitude: -74.0060 } }
      });

      expect(getByTestId('pin-management-button')).toBeTruthy();
    });
  });
});


