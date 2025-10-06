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
  TextInput,
  ActivityIndicator
} from 'react-native';
import GoogleMapsView from './GoogleMapsView';
import PlaceDetailsModal from './PlaceDetailsModal';
import EventPin from './EventPin';
import EventSearchFilter, { EventSearchFilters } from './EventSearchFilter';
import LiveEventStatus from './LiveEventStatus';
import * as Location from 'expo-location';
import { 
  ActivityFilterModal, 
  EventCreationModal, 
  EventDetailsModal, 
  VenueInfoSheet,
  PlaceInfoModal
} from './index';
import LoadingSpinner from './LoadingSpinner';
import { PlaceInfoSkeleton } from './SkeletonLoader';
import { placesApiService } from '../services/placesApi';
import { firestoreService } from '../services/firestore';
import { enhancedEventService } from '../services/enhancedEventService';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { useAppNavigation } from '../navigation';
import { ROUTES } from '../navigation/types';
import { errorHandler } from '../utils/errorHandler';
import { hapticFeedback } from '../utils/hapticFeedback';
import { performanceOptimizer } from '../utils/performanceOptimizer';

// MapEvent interface for event markers
interface MapEvent {
  id: string;
  name: string;
  activity: string;
  latitude: number;
  longitude: number;
  participants_count: number;
  max_participants: number;
  status: 'live' | 'past' | 'cancelled' | 'active'; // Added 'active' status
  created_at: string;
}

interface EnhancedInteractiveMapProps {
  onLocationSelect?: (location: any) => void;
  searchQuery?: string;
  onMapReady?: (mapRef: React.RefObject<any>) => void;
  onLocationPermissionGranted?: () => void;
  hideControls?: boolean; // Hide search bar and filter buttons
  events?: MapEvent[]; // Events to display as markers
}

const { width, height } = Dimensions.get('window');

export default function EnhancedInteractiveMap({
  onLocationSelect,
  searchQuery,
  onMapReady,
  onLocationPermissionGranted,
  hideControls = false,
  events = [], // Default to empty array
}: EnhancedInteractiveMapProps) {
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [showPlaceDetails, setShowPlaceDetails] = useState(false);
  const navigation = useAppNavigation();
  const mapRef = useRef<any>(null);
  const [region, setRegion] = useState<any>({
    latitude: 40.7829,
    longitude: -73.9654,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showEventCreation, setShowEventCreation] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showVenueInfo, setShowVenueInfo] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<any>({
    types: [],
    keywords: [],
    radius: 3000,
  });
  const [loading, setLoading] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
  
  // Custom pin state variables
  const [customPins, setCustomPins] = useState<Array<{
    id: string;
    coordinate: { latitude: number; longitude: number };
    title: string;
    description: string;
  }>>([]);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [showPinDetails, setShowPinDetails] = useState(false);
  
  // Place details state variables
  const [showPlaceInfo, setShowPlaceInfo] = useState(false);
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState<PlaceDetails | null>(null);
  const [placeDetailsLoading, setPlaceDetailsLoading] = useState(false);
  
  // Event management state
  const [showEventSearchFilter, setShowEventSearchFilter] = useState(false);
  const [eventSearchFilters, setEventSearchFilters] = useState<EventSearchFilters>({
    query: '',
    activities: [],
    timeFilter: 'all',
    distance: 10,
    skillLevel: 'all',
    maxParticipants: 20,
    showFullEvents: true,
    showLiveOnly: false,
  });

  useEffect(() => {
    requestLocationPermission();
    loadInitialData();
    initializeNotifications();
    setupRealtimeSubscriptions();
  }, []);

  // Initialize notifications
  const initializeNotifications = async () => {
    try {
      await notificationService.initialize();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  // Setup real-time subscriptions
  const setupRealtimeSubscriptions = () => {
    // Subscribe to area events
    const unsubscribeAreaEvents = enhancedEventService.subscribeToAreaEvents(
      {
        north: region.latitude + region.latitudeDelta,
        south: region.latitude - region.latitudeDelta,
        east: region.longitude + region.longitudeDelta,
        west: region.longitude - region.longitudeDelta,
      },
      (update) => {
        console.log('Area event update:', update);
        loadEvents(); // Refresh events when area updates
      }
    );

    // Subscribe to user events
    const unsubscribeUserEvents = enhancedEventService.subscribeToUserEvents((update) => {
      console.log('User event update:', update);
      loadEvents(); // Refresh events when user events update
    });

    return () => {
      unsubscribeAreaEvents();
      unsubscribeUserEvents();
    };
  };

  useEffect(() => {
    setLocalSearchQuery(searchQuery || '');
  }, [searchQuery]);

  useEffect(() => {
    if (userLocation) {
      debouncedSearchPlaces();
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
      setFilteredEvents(filteredEvents);
      
      // Navigate to search results screen if there are results
      if (filteredEvents.length > 0) {
        navigation.navigate(ROUTES.EVENT_SEARCH_RESULTS, {
          searchQuery: localSearchQuery,
          events: filteredEvents
        });
      }
    } else {
      // Show all events when search is cleared
      setFilteredEvents(allEvents);
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
    // Load events
    await loadEvents();
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const events = await enhancedEventService.getEvents({
        bounds: {
          north: region.latitude + region.latitudeDelta,
          south: region.latitude - region.latitudeDelta,
          east: region.longitude + region.longitudeDelta,
          west: region.longitude - region.longitudeDelta,
        },
        ...eventSearchFilters,
      });
      
      // Ensure events is an array and filter out any null/undefined events
      const validEvents = Array.isArray(events) ? events.filter(event => event && event.id) : [];
      setFilteredEvents(validEvents);
      setAllEvents(validEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setFilteredEvents([]);
      setAllEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const searchPlaces = async () => {
    if (!userLocation) return;

    console.log('EnhancedInteractiveMap: searchPlaces called with filters:', currentFilters);
    console.log('EnhancedInteractiveMap: userLocation:', userLocation);
    
    setLoading(true);
    try {
      const placesData = await placesApiService.searchNearby(userLocation, currentFilters);
      console.log('EnhancedInteractiveMap: Received places data:', placesData.length, 'places');
      
      // Optimize markers for performance
      const optimizedPlaces = performanceOptimizer.optimizeMapMarkers(placesData, 50);
      setPlaces(optimizedPlaces);

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
      setFilteredEvents(eventsData);
    } catch (error) {
      const appError = errorHandler.handleApiError(error, 'searchPlaces');
      errorHandler.showUserFriendlyError(appError, 'Search');
      
      // Set empty results to clear the map
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearchPlaces = performanceOptimizer.debounce(
    'searchPlaces',
    searchPlaces,
    500 // 500ms delay
  );

  const handleFilterApply = (filters: ActivityFilter) => {
    console.log('EnhancedInteractiveMap: Received filters:', filters);
    console.log('EnhancedInteractiveMap: Previous filters:', currentFilters);
    setCurrentFilters(filters);
    setShowFilterModal(false);
    console.log('EnhancedInteractiveMap: Filters updated, will trigger searchPlaces');
  };

  const handlePlacePress = async (place: Place) => {
    console.log('🎯 Place pressed:', place.name, place.placeId);
    setSelectedPlace(place);
    
    // Haptic feedback for place selection
    try {
      await hapticFeedback.placeSelected();
    } catch (error) {
      console.log('Haptic feedback error:', error);
    }
    
    // Fetch detailed place information with loading state
    setPlaceDetailsLoading(true);
    console.log('🔄 Fetching place details for:', place.placeId);
    
    try {
      const placeDetails = await placesApiService.getPlaceDetails(place.placeId);
      console.log('📋 Place details received:', placeDetails);
      
      if (placeDetails) {
        setSelectedPlaceDetails(placeDetails);
        setShowPlaceInfo(true);
        console.log('✅ Place info modal should be visible now');
      } else {
        console.log('❌ No place details received');
        Alert.alert('Error', 'Unable to load place details');
      }
    } catch (error) {
      console.log('❌ Error fetching place details:', error);
      const appError = errorHandler.handleApiError(error, 'getPlaceDetails');
      errorHandler.showUserFriendlyError(appError, 'Place Details');
    } finally {
      setPlaceDetailsLoading(false);
    }
  };

  const handleEventPress = (event: Event) => {
    if (!event) {
      console.error('Event is null or undefined');
      return;
    }
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

      setFilteredEvents(prev => [...prev, newEvent]);
      setShowEventCreation(false);
      Alert.alert('Success', 'Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!eventId) {
      console.error('Event ID is null or undefined');
      return;
    }
    
    try {
      await firestoreService.deleteEvent(eventId, 'user123');
      setFilteredEvents(prev => prev.filter(event => event && event.id !== eventId));
      setShowEventDetails(false);
      Alert.alert('Success', 'Event deleted');
    } catch (error) {
      console.error('Error deleting event:', error);
      Alert.alert('Error', 'Failed to delete event');
    }
  };

  const handleMapPress = async (event: any) => {
    const { coordinate } = event.nativeEvent;
    const pinId = `pin_${Date.now()}`;
    
    const newPin = {
      id: pinId,
      coordinate,
      title: 'Custom Location',
      description: `Lat: ${coordinate.latitude.toFixed(6)}, Lng: ${coordinate.longitude.toFixed(6)}`
    };
    
    setCustomPins(prev => [...prev, newPin]);
    setSelectedPin(pinId);
    
    // Haptic feedback for pin placement
    await hapticFeedback.mapPinPlaced();
    
    // Show coordinates in an alert
    Alert.alert(
      'Pin Placed',
      `Coordinates: ${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`,
      [{ text: 'OK' }]
    );
  };

  const handleDeletePin = (pinId: string) => {
    Alert.alert(
      'Delete Pin',
      'Are you sure you want to delete this pin?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCustomPins(prev => prev.filter(pin => pin.id !== pinId));
            if (selectedPin === pinId) {
              setSelectedPin(null);
            }
            Alert.alert('Success', 'Pin deleted successfully');
          },
        },
      ]
    );
  };

  const handleEditPin = (pinId: string) => {
    const pin = customPins.find(p => p.id === pinId);
    if (!pin) return;

    Alert.prompt(
      'Edit Pin',
      'Enter new title for this pin:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (newTitle) => {
            if (newTitle && newTitle.trim()) {
              setCustomPins(prev => 
                prev.map(p => 
                  p.id === pinId 
                    ? { ...p, title: newTitle.trim() }
                    : p
                )
              );
              Alert.alert('Success', 'Pin updated successfully');
            } else {
              Alert.alert('Error', 'Please enter a valid title');
            }
          },
        },
      ],
      'plain-text',
      pin.title
    );
  };

  const handleShowPinList = () => {
    if (customPins.length === 0) {
      Alert.alert('No Pins', 'You haven\'t placed any pins yet.');
      return;
    }

    const pinList = customPins.map(pin => 
      `${pin.title}\n${pin.description}`
    ).join('\n\n');

    Alert.alert(
      'Your Pins',
      pinList,
      [
        { text: 'OK' },
        { text: 'Clear All', style: 'destructive', onPress: handleClearAllPins }
      ]
    );
  };

  const handleClearAllPins = () => {
    Alert.alert(
      'Clear All Pins',
      'Are you sure you want to delete all pins?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setCustomPins([]);
            setSelectedPin(null);
            Alert.alert('Success', 'All pins cleared');
          },
        },
      ]
    );
  };

  const handlePinLongPress = (pinId: string) => {
    Alert.alert(
      'Pin Options',
      'What would you like to do with this pin?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => handleEditPin(pinId) },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeletePin(pinId) },
      ]
    );
  };

  const handleCreateMeetupFromPlace = (placeDetails: PlaceDetails) => {
    // Close place info modal
    setShowPlaceInfo(false);
    
    // Open event creation modal with place details pre-filled
    setShowEventCreation(true);
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

  const handlePlaceSelect = (place: any) => {
    setSelectedPlace(place);
    setShowPlaceDetails(true);
  };

  const handlePlanEvent = (place: any) => {
    // Navigate to event creation with place data
    console.log('Planning event at:', place);
    // You can add navigation logic here
  };

  // Event handling functions

  const handleJoinEvent = async (eventId: string) => {
    if (!eventId) {
      console.error('Event ID is null or undefined');
      return;
    }
    
    try {
      const result = await enhancedEventService.joinEvent(eventId);
      if (result.success) {
        Alert.alert('Success', 'You have joined the event!');
        // Refresh events list
        loadEvents();
      } else {
        Alert.alert('Error', result.error || 'Failed to join event');
      }
    } catch (error) {
      console.error('Error joining event:', error);
      Alert.alert('Error', 'Failed to join event');
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    if (!eventId) {
      console.error('Event ID is null or undefined');
      return;
    }
    
    try {
      const result = await enhancedEventService.leaveEvent(eventId);
      if (result.success) {
        Alert.alert('Success', 'You have left the event');
        // Refresh events list
        loadEvents();
      } else {
        Alert.alert('Error', result.error || 'Failed to leave event');
      }
    } catch (error) {
      console.error('Error leaving event:', error);
      Alert.alert('Error', 'Failed to leave event');
    }
  };

  const handleApplyEventFilters = (filters: EventSearchFilters) => {
    setEventSearchFilters(filters);
    console.log('Applied filters:', filters);
    // Add filter application logic here
  };

  return (
    <View style={styles.container}>
      <GoogleMapsView
        onLocationSelect={onLocationSelect}
        onPlaceSelect={handlePlaceSelect}
        searchQuery={searchQuery}
        events={events}
      />

      {/* Search and Filter Container - Only show if hideControls is false */}
      {!hideControls && (
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
          {loading ? (
            <View style={styles.searchLoading}>
              <ActivityIndicator size="small" color="#3b82f6" />
            </View>
          ) : localSearchQuery.length > 0 ? (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setLocalSearchQuery('')}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
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

        {/* Event Search Filter Button */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            (eventSearchFilters.activities.length > 0 || eventSearchFilters.query) && styles.filterButtonActive
          ]}
          onPress={() => setShowEventSearchFilter(true)}
          activeOpacity={0.8}
          pointerEvents="auto"
        >
          <Text style={[
            styles.filterButtonText,
            (eventSearchFilters.activities.length > 0 || eventSearchFilters.query) && styles.filterButtonTextActive
          ]}>
            Events {(eventSearchFilters.activities.length > 0 || eventSearchFilters.query) && '●'}
          </Text>
        </TouchableOpacity>

        {/* Pin Management Button */}
        {customPins.length > 0 && (
          <TouchableOpacity
            style={styles.pinManagementButton}
            onPress={handleShowPinList}
            activeOpacity={0.8}
            pointerEvents="auto"
          >
            <Text style={styles.pinManagementButtonText}>
              📍 {customPins.length}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      )}

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
        placeDetails={selectedPlaceDetails}
      />

      {selectedEvent && (
        <EventDetailsModal
          visible={showEventDetails}
          onClose={() => setShowEventDetails(false)}
          event={selectedEvent}
          currentUserId="user123"
          onJoinEvent={handleJoinEvent}
          onLeaveEvent={handleLeaveEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      )}

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

      <PlaceInfoModal
        visible={showPlaceInfo}
        onClose={() => setShowPlaceInfo(false)}
        placeDetails={selectedPlaceDetails}
        onCreateMeetup={handleCreateMeetupFromPlace}
        loading={placeDetailsLoading}
      />

      <PlaceDetailsModal
        visible={showPlaceDetails}
        onClose={() => setShowPlaceDetails(false)}
        place={selectedPlace}
        onPlanEvent={handlePlanEvent}
      />

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          visible={showEventDetails}
          onClose={() => setShowEventDetails(false)}
          event={selectedEvent}
          currentUserId="current-user-id" // Replace with actual user ID
          onJoinEvent={handleJoinEvent}
          onLeaveEvent={handleLeaveEvent}
        />
      )}

      {/* Event Search Filter Modal */}
      <EventSearchFilter
        visible={showEventSearchFilter}
        onClose={() => setShowEventSearchFilter(false)}
        onApplyFilters={handleApplyEventFilters}
        currentFilters={eventSearchFilters}
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
  searchLoading: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  customPinMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedPinMarker: {
    backgroundColor: '#FF6B6B',
    transform: [{ scale: 1.2 }],
  },
  customPinText: {
    fontSize: 16,
    color: '#ffffff',
  },
});
