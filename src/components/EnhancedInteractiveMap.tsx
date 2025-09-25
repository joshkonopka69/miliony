import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  Platform, 
  TouchableOpacity,
  Modal,
  Dimensions,
  TextInput
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { 
  ActivityFilterModal, 
  EventCreationModal, 
  EventDetailsModal, 
  VenueInfoSheet 
} from './index';
import { placesApiService, Place, ActivityFilter } from '../services/placesApi';
import { firestoreService, Event } from '../services/firestore';
import { useAppNavigation } from '../navigation';
import { ROUTES } from '../navigation/types';

interface EnhancedInteractiveMapProps {
  onLocationSelect?: (location: any) => void;
  searchQuery?: string;
  onMapReady?: (mapRef: React.RefObject<MapView>) => void;
  onLocationPermissionGranted?: () => void;
}

const { width, height } = Dimensions.get('window');

export default function EnhancedInteractiveMap({
  onLocationSelect,
  searchQuery,
  onMapReady,
  onLocationPermissionGranted,
}: EnhancedInteractiveMapProps) {
  const navigation = useAppNavigation();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 40.7829,
    longitude: -73.9654,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showEventCreation, setShowEventCreation] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showVenueInfo, setShowVenueInfo] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<ActivityFilter>({
    types: [],
    keywords: [],
    radius: 3000,
  });
  const [loading, setLoading] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');

  useEffect(() => {
    requestLocationPermission();
    loadInitialData();
  }, []);

  useEffect(() => {
    setLocalSearchQuery(searchQuery || '');
  }, [searchQuery]);

  useEffect(() => {
    if (userLocation) {
      searchPlaces();
    }
  }, [userLocation, currentFilters]);

  useEffect(() => {
    // Filter events based on search query
    if (localSearchQuery.length > 0) {
      const filteredEvents = allEvents.filter(event =>
        event.activity.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        event.placeName.toLowerCase().includes(localSearchQuery.toLowerCase())
      );
      setEvents(filteredEvents);
      
      // Navigate to search results screen if there are results
      if (filteredEvents.length > 0) {
        navigation.navigate(ROUTES.EVENT_SEARCH_RESULTS, {
          searchQuery: localSearchQuery,
          events: filteredEvents
        });
      }
    } else {
      // Show all events when search is cleared
      setEvents(allEvents);
    }
  }, [localSearchQuery, allEvents, navigation]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show nearby venues.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      setUserLocation({ lat: latitude, lng: longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      onLocationPermissionGranted?.();
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const loadInitialData = async () => {
    // Seed mock data
    await firestoreService.seedMockData();
  };

  const searchPlaces = async () => {
    if (!userLocation) return;

    console.log('EnhancedInteractiveMap: searchPlaces called with filters:', currentFilters);
    console.log('EnhancedInteractiveMap: userLocation:', userLocation);
    
    setLoading(true);
    try {
      const placesData = await placesApiService.searchNearby(userLocation, currentFilters);
      console.log('EnhancedInteractiveMap: Received places data:', placesData.length, 'places');
      setPlaces(placesData);

      // Load events in the current region
      const eventsData = await firestoreService.getEventsInBounds(
        {
          lat: region.latitude + region.latitudeDelta / 2,
          lng: region.longitude + region.longitudeDelta / 2,
        },
        {
          lat: region.latitude - region.latitudeDelta / 2,
          lng: region.longitude - region.longitudeDelta / 2,
        }
      );
      setAllEvents(eventsData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error searching places:', error);
      
      // Show more specific error messages based on error type
      let errorMessage = 'Failed to load venues';
      if (error instanceof Error) {
        if (error.message.includes('HTTP error')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('Google Places API error')) {
          errorMessage = 'Google Places API error. Please try again later.';
        } else if (error.message.includes('Failed to search nearby places')) {
          errorMessage = 'Unable to find venues in this area. Try adjusting your filters.';
        }
      }
      
      Alert.alert('Error', errorMessage);
      
      // Set empty results to clear the map
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterApply = (filters: ActivityFilter) => {
    console.log('EnhancedInteractiveMap: Received filters:', filters);
    console.log('EnhancedInteractiveMap: Previous filters:', currentFilters);
    setCurrentFilters(filters);
    setShowFilterModal(false);
    console.log('EnhancedInteractiveMap: Filters updated, will trigger searchPlaces');
  };

  const handlePlacePress = (place: Place) => {
    setSelectedPlace(place);
    setShowVenueInfo(true);
  };

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleCreateEvent = () => {
    setShowEventCreation(true);
    setShowVenueInfo(false);
  };

  const handleEventCreated = async (eventData: any) => {
    if (!selectedPlace) return;

    try {
      const newEvent = await firestoreService.createEvent({
        creatorId: 'user123', // Mock user ID
        activity: eventData.activity,
        placeId: selectedPlace.placeId,
        placeName: selectedPlace.name,
        address: selectedPlace.address,
        description: eventData.description,
        maxParticipants: eventData.maxParticipants,
        time: eventData.time.toISOString(),
        coordinates: selectedPlace.coordinates,
      });

      setEvents(prev => [...prev, newEvent]);
      setShowEventCreation(false);
      Alert.alert('Success', 'Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event');
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      await firestoreService.joinEvent(eventId, 'user123');
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, participants: [...event.participants, 'user123'] }
            : event
        )
      );
      Alert.alert('Success', 'You joined the event!');
    } catch (error) {
      console.error('Error joining event:', error);
      Alert.alert('Error', 'Failed to join event');
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    try {
      await firestoreService.leaveEvent(eventId, 'user123');
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, participants: event.participants.filter(id => id !== 'user123') }
            : event
        )
      );
      Alert.alert('Success', 'You left the event');
    } catch (error) {
      console.error('Error leaving event:', error);
      Alert.alert('Error', 'Failed to leave event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await firestoreService.deleteEvent(eventId, 'user123');
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setShowEventDetails(false);
      Alert.alert('Success', 'Event deleted');
    } catch (error) {
      console.error('Error deleting event:', error);
      Alert.alert('Error', 'Failed to delete event');
    }
  };

  const getEventIcon = (activity: string) => {
    const iconMap: { [key: string]: string } = {
      'Football': '⚽',
      'Basketball': '🏀',
      'Tennis': '🎾',
      'Swimming': '🏊',
      'Gym Workout': '💪',
      'Yoga': '🧘',
      'Running': '🏃',
      'Cycling': '🚴',
      'Volleyball': '🏐',
      'Badminton': '🏸',
    };
    return iconMap[activity] || '🏃';
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onMapReady={() => onMapReady?.(mapRef)}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        moveOnMarkerPress={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={false}
        showsIndoors={false}
        showsTraffic={false}
        showsPointsOfInterest={false}
      >
        {/* Place Markers */}
        {places.map((place) => (
          <Marker
            key={place.placeId}
            coordinate={place.coordinates}
            title={place.name}
            description={place.address}
            onPress={() => handlePlacePress(place)}
          >
            <View style={styles.placeMarker}>
              <Text style={styles.placeMarkerText}>📍</Text>
            </View>
          </Marker>
        ))}

        {/* Event Markers */}
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={event.coordinates || { latitude: 0, longitude: 0 }}
            title={event.activity}
            description={`${event.participants.length}/${event.maxParticipants} participants`}
            onPress={() => handleEventPress(event)}
          >
            <View style={styles.eventMarker}>
              <Text style={styles.eventMarkerText}>
                {getEventIcon(event.activity)}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Search and Filter Container */}
      <View style={styles.searchFilterContainer} pointerEvents="box-none">
        {/* Search Field */}
        <View style={styles.searchContainer} pointerEvents="auto">
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            placeholderTextColor="#9ca3af"
            value={localSearchQuery}
            onChangeText={setLocalSearchQuery}
          />
          {localSearchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setLocalSearchQuery('')}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            (currentFilters.types.length > 0 || currentFilters.keywords.length > 0) && styles.filterButtonActive
          ]}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.8}
          pointerEvents="auto"
        >
          <Text style={[
            styles.filterButtonText,
            (currentFilters.types.length > 0 || currentFilters.keywords.length > 0) && styles.filterButtonTextActive
          ]}>
            Filter {(currentFilters.types.length > 0 || currentFilters.keywords.length > 0) && '●'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer} pointerEvents="none">
          <Text style={styles.loadingText}>Loading venues...</Text>
        </View>
      )}

      {/* Results Counter */}
      {!loading && places.length > 0 && (
        <View style={styles.resultsContainer} pointerEvents="none">
          <Text style={styles.resultsText}>
            {places.length} venue{places.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      )}

      {/* Modals */}
      <ActivityFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleFilterApply}
        currentFilters={currentFilters}
      />

      <EventCreationModal
        visible={showEventCreation}
        onClose={() => setShowEventCreation(false)}
        onCreateEvent={handleEventCreated}
        venueName={selectedPlace?.name || ''}
        venueAddress={selectedPlace?.address || ''}
        placeId={selectedPlace?.placeId}
        coordinates={selectedPlace?.coordinates}
      />

      <EventDetailsModal
        visible={showEventDetails}
        onClose={() => setShowEventDetails(false)}
        event={selectedEvent}
        currentUserId="user123"
        onJoinEvent={handleJoinEvent}
        onLeaveEvent={handleLeaveEvent}
        onDeleteEvent={handleDeleteEvent}
      />

      <VenueInfoSheet
        visible={showVenueInfo}
        venue={selectedPlace ? {
          placeId: selectedPlace.placeId,
          name: selectedPlace.name,
          address: selectedPlace.address,
          rating: selectedPlace.rating,
          priceLevel: selectedPlace.priceLevel,
          phoneNumber: selectedPlace.phoneNumber,
          website: selectedPlace.website,
          openingHours: selectedPlace.openingHours,
          photos: selectedPlace.photos,
        } : null}
        onClose={() => setShowVenueInfo(false)}
        onCreateEvent={handleCreateEvent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  map: {
    width: width,
    height: height,
  },
  filterButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterButtonActive: {
    backgroundColor: '#f9bc06',
    borderWidth: 2,
    borderColor: '#d97706',
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f9bc06',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  searchFilterContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 1000,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    fontSize: 16,
    color: '#9ca3af',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: '#9ca3af',
  },
  placeMarker: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeMarkerText: {
    fontSize: 20,
  },
  eventMarker: {
    backgroundColor: '#fbbf24',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventMarkerText: {
    fontSize: 20,
  },
  loadingContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  resultsContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultsText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});
