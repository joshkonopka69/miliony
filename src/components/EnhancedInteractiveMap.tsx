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
import { useDialog } from '../contexts/DialogContext';
import GoogleMapsView from './GoogleMapsView';
import EventPin from './EventPin';
import EventSearchFilter, { EventSearchFilters } from './EventSearchFilter';
import LiveEventStatus from './LiveEventStatus';
import * as Location from 'expo-location';
import {
  VenueInfoSheet,
  PlaceInfoModal,
  ActivityFilterModal,
  EventCreationModal,
  EventDetailsModal
} from './index';
import { Place, PlaceDetails } from '../services/placesApi';
import { ActivityFilter } from './ActivityFilterModal';
import LoadingSpinner from './LoadingSpinner';
import { PlaceInfoSkeleton } from './SkeletonLoader';
import { placesApiService } from '../services/placesApi';
import { firestoreService } from '../services/firestore';
import { enhancedEventService } from '../services/enhancedEventService';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { useAppNavigation } from '../navigation';
import { ROUTES } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { errorHandler } from '../utils/errorHandler';
import { hapticFeedback } from '../utils/hapticFeedback';
import { performanceOptimizer } from '../utils/performanceOptimizer';
import { useToast } from './ToastProvider';
import { useConfirmation } from './ConfirmationModal';

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
  externalFilters?: any; // Filters from parent component
  highlightMarkers?: boolean; // Flag to highlight markers when filters are active
}

const { width, height } = Dimensions.get('window');

export default function EnhancedInteractiveMap({
  onLocationSelect,
  searchQuery,
  onMapReady,
  onLocationPermissionGranted,
  hideControls = false,
  events = [], // Default to empty array
  externalFilters, // Filters from parent
  highlightMarkers: externalHighlightMarkers,
}: EnhancedInteractiveMapProps) {
  const { getUserId } = useAuth();
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const navigation = useAppNavigation();
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const dialog = useDialog();
  const { showConfirmation } = useConfirmation();
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
    showEvents: true, // Default to showing events
  });

  // Update filters when external filters change
  useEffect(() => {
    if (externalFilters) {
      console.log('🔄 EnhancedInteractiveMap: Received external filters:', JSON.stringify(externalFilters));
      console.log('🔄 EnhancedInteractiveMap: Current filters before update:', JSON.stringify(currentFilters));
      setCurrentFilters(externalFilters);
    }
  }, [externalFilters]);
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
      console.log('🎯 EnhancedInteractiveMap: searchPlaces effect triggered');
      console.log('🎯 EnhancedInteractiveMap: userLocation:', JSON.stringify(userLocation));
      console.log('🎯 EnhancedInteractiveMap: currentFilters:', JSON.stringify(currentFilters));
      // Call searchPlaces directly to avoid stale closure in debounced function
      // Use a small timeout to debounce rapid changes
      const timeoutId = setTimeout(() => {
        console.log('⏰ EnhancedInteractiveMap: Timeout elapsed, calling searchPlaces now');
        searchPlaces();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [userLocation, currentFilters]);

  useEffect(() => {
    console.log('📊 EnhancedInteractiveMap: Places count changed:', places.length);
  }, [places]);

  useEffect(() => {
    console.log('🔍 EnhancedInteractiveMap: currentFilters changed:', JSON.stringify(currentFilters));
  }, [currentFilters]);

  useEffect(() => {
    // Filter events based on search query AND active sport filters (keywords AND types)
    let filtered = [...allEvents];

    // Map filter types to matching sport activities
    const typeToSportsMap: Record<string, string[]> = {
      'gym': ['gym', 'fitness', 'weightlifting', 'crossfit'],
      'parks': ['running', 'jogging', 'walking', 'outdoor', 'calisthenics'],
      'swimming_pool': ['swimming', 'aqua', 'water'],
      'stadium': ['football', 'soccer', 'athletics', 'running'],
      'tennis_court': ['tennis', 'padel'],
      'basketball_court': ['basketball'],
      'soccer': ['football', 'soccer'],
      'football': ['football', 'soccer'],
      'volleyball': ['volleyball', 'beach volleyball'],
      'sport_halls': ['basketball', 'volleyball', 'handball', 'badminton', 'futsal'],
      'sport_fields': ['football', 'soccer', 'rugby', 'baseball'],
      'fight_clubs': ['boxing', 'mma', 'martial arts', 'kickboxing', 'muay thai', 'judo', 'wrestling', 'bjj'],
      'outside_courts': ['basketball', 'tennis', 'volleyball'],
      'water_sports': ['swimming', 'water polo', 'diving'],
      'fitness': ['gym', 'fitness', 'crossfit', 'yoga', 'pilates'],
      'outdoor': ['running', 'hiking', 'climbing', 'cycling'],
      'martial_arts_gym': ['boxing', 'mma', 'kickboxing', 'muay thai'],
      'grappling_hall': ['judo', 'wrestling', 'bjj', 'grappling'],
      'climbing': ['climbing', 'bouldering'],
      'yoga': ['yoga', 'pilates'],
    };

    const hasActiveFilters =
      (currentFilters.keywords && currentFilters.keywords.length > 0) ||
      (currentFilters.types && currentFilters.types.length > 0);

    if (hasActiveFilters) {
      console.log('🏀 Filtering events by active filters:', JSON.stringify({
        keywords: currentFilters.keywords,
        types: currentFilters.types
      }));

      filtered = filtered.filter(event => {
        const activity = (event.activity || '').toLowerCase();

        // Check keywords match
        const matchesKeywords = currentFilters.keywords?.some((keyword: string) =>
          activity.includes(keyword.toLowerCase())
        ) || false;

        // Check types match (using mapping)
        const matchesTypes = currentFilters.types?.some((type: string) => {
          const matchingSports = typeToSportsMap[type.toLowerCase()] || [type.toLowerCase()];
          return matchingSports.some(sport => activity.includes(sport));
        }) || false;

        return matchesKeywords || matchesTypes;
      });

      console.log(`🏀 Filtered to ${filtered.length} events matching filters`);
    }

    // Then, apply search query filter if present
    if (localSearchQuery.length > 0) {
      filtered = filtered.filter(event =>
        event.activity?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        event.placeName?.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        event.name?.toLowerCase().includes(localSearchQuery.toLowerCase())
      );

      // Navigate to search results screen if there are results
      if (filtered.length > 0) {
        navigation.navigate(ROUTES.EVENT_SEARCH_RESULTS, {
          searchQuery: localSearchQuery,
          events: filtered
        });
      }
    }

    setFilteredEvents(filtered);
  }, [localSearchQuery, allEvents, currentFilters.keywords, currentFilters.types, navigation]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showError('Location permission is required to show nearby venues.', 'Permission Denied');
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
      showError('Failed to get current location', 'Error');
    }
  };

  const loadInitialData = async () => {
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

    // Only search for places if filters (sport types or keywords) are active
    const hasActiveFilters =
      (currentFilters.types && currentFilters.types.length > 0) ||
      (currentFilters.keywords && currentFilters.keywords.length > 0);

    if (!hasActiveFilters) {
      console.log('EnhancedInteractiveMap: No active filters, skipping places search');
      setPlaces([]);
      setLoading(false);
      return;
    }

    console.log('EnhancedInteractiveMap: searchPlaces called with filters:', currentFilters);
    console.log('EnhancedInteractiveMap: userLocation:', userLocation);

    setLoading(true);
    try {
      const placesData = await placesApiService.searchNearby(userLocation, currentFilters);
      console.log('EnhancedInteractiveMap: Received places data:', placesData.length, 'places');

      if (placesData.length > 0) {
        console.log('EnhancedInteractiveMap: First place sample:', JSON.stringify(placesData[0], null, 2));
      }

      // Optimize markers for performance
      const optimizedPlaces = performanceOptimizer.optimizeMapMarkers(placesData, 50);
      console.log('EnhancedInteractiveMap: Optimized to', optimizedPlaces.length, 'places');
      setPlaces(optimizedPlaces);

      // Load events in the current region using Supabase
      const eventsData = await enhancedEventService.getEvents({
        bounds: {
          north: region.latitude + region.latitudeDelta,
          south: region.latitude - region.latitudeDelta,
          east: region.longitude + region.longitudeDelta,
          west: region.longitude - region.longitudeDelta,
        },
        ...eventSearchFilters,
      });

      // Ensure events is an array and filter out any null/undefined events
      const validEvents = Array.isArray(eventsData) ? eventsData.filter(event => event && event.id) : [];
      setAllEvents(validEvents);
      setFilteredEvents(validEvents);
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
        showError('Unable to load place details', 'Error');
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

  // Handle custom event marker click - converts event to place format for PlaceInfoModal
  const handleEventSelect = async (event: any) => {
    if (!event) {
      console.error('Event is null or undefined');
      return;
    }

    console.log('🎯 Custom event marker selected:', event);

    // Convert event to a place-like object for PlaceInfoModal
    const placeFromEvent = {
      placeId: event.place_id || `event_${event.id}`,
      name: event.name || event.activity || 'Event Location',
      address: event.location_name || event.address || '',
      coordinates: {
        lat: event.latitude,
        lng: event.longitude,
        latitude: event.latitude,
        longitude: event.longitude,
      },
      latitude: event.latitude,
      longitude: event.longitude,
      types: ['event_location'],
      // Event-specific info
      isEvent: true,
      eventId: event.id,
      eventData: event,
      activity: event.activity,
      participants_count: event.participants_count || 0,
      max_participants: event.max_participants || 0,
      description: event.description,
    };

    setSelectedPlace(placeFromEvent);

    // Create enhanced details for the modal
    const eventDetails = {
      ...placeFromEvent,
      formattedAddress: event.location_name || event.address || 'Event Location',
      openingHours: event.start_time ? {
        weekdayDescriptions: [`Event: ${new Date(event.start_time).toLocaleString()}`],
        isOpen: event.status === 'active' || event.status === 'live',
      } : undefined,
      rating: undefined,
      userRatingCount: event.participants_count,
      photos: [],
      // Custom event info
      eventInfo: {
        activity: event.activity,
        participants: `${event.participants_count || 0}/${event.max_participants || 0}`,
        status: event.status,
        startTime: event.start_time,
      },
    };

    setSelectedPlaceDetails(eventDetails as any);
    setShowPlaceInfo(true);

    console.log('✅ Event PlaceInfoModal should be visible now');
  };

  const handleCreateEvent = () => {
    setShowEventCreation(true);
    setShowVenueInfo(false);
  };

  const handleEventCreated = async (eventData: any) => {
    if (!selectedPlace) return;

    try {
      setLoading(true);
      const result = await enhancedEventService.createEvent({
        name: eventData.title,
        activity: eventData.sportType || eventData.activity,
        location_name: selectedPlace.name,
        latitude: selectedPlace.latitude || selectedPlace.coordinates?.latitude,
        longitude: selectedPlace.longitude || selectedPlace.coordinates?.longitude,
        place_id: selectedPlace.placeId,
        description: eventData.description,
        max_participants: eventData.playersNeeded || eventData.maxParticipants,
        start_time: (eventData.dateTime || eventData.time)?.toISOString(),
      });

      if (result.success && result.event) {
        // Refresh events list to show the new event
        await loadEvents();
        setShowEventCreation(false);
        showSuccess('Event created successfully!', 'Success');
      } else {
        showError(result.error || 'Failed to create event', 'Error');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      showError('Failed to create event', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!eventId) {
      console.error('Event ID is null or undefined');
      return;
    }

    try {
      const userId = getUserId();
      if (!userId) {
        showError('You must be logged in to delete events', 'Error');
        return;
      }
      await firestoreService.deleteEvent(eventId, userId);
      setFilteredEvents(prev => prev.filter(event => event && event.id !== eventId));
      setShowEventDetails(false);
      showSuccess('Event deleted', 'Success');
    } catch (error) {
      console.error('Error deleting event:', error);
      showError('Failed to delete event', 'Error');
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

    // Show coordinates in a toast
    showSuccess(`Coordinates: ${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`, 'Pin Placed');
  };

  const handleDeletePin = (pinId: string) => {
    showConfirmation({
      title: 'Delete Pin',
      message: 'Are you sure you want to delete this pin?',
      icon: '🗑️',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCustomPins(prev => prev.filter(pin => pin.id !== pinId));
            if (selectedPin === pinId) {
              setSelectedPin(null);
            }
            showSuccess('Pin deleted successfully', 'Success');
          },
        },
      ]
    });
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
          onPress: (newTitle: string | undefined) => {
            if (newTitle && newTitle.trim()) {
              setCustomPins(prev =>
                prev.map(p =>
                  p.id === pinId
                    ? { ...p, title: newTitle.trim() }
                    : p
                )
              );
              showSuccess('Pin updated successfully', 'Success');
            } else {
              showError('Please enter a valid title', 'Error');
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
      showInfo('No Pins', 'You haven\'t placed any pins yet.');
      return;
    }

    const pinList = customPins.map(pin =>
      `${pin.title}\n${pin.description}`
    ).join('\n\n');

    dialog.showDialog({
      type: 'info',
      title: 'Your Pins',
      message: pinList,
      buttons: [
        { text: 'OK', style: 'default' },
        { text: 'Clear All', style: 'destructive', onPress: handleClearAllPins }
      ],
      autoHide: false,
    });
  };

  const handleClearAllPins = () => {
    showConfirmation({
      title: 'Clear All Pins',
      message: 'Are you sure you want to delete all pins?',
      icon: '🗑️',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setCustomPins([]);
            setSelectedPin(null);
            showSuccess('All pins cleared', 'Success');
          },
        },
      ]
    });
  };

  const handlePinLongPress = (pinId: string) => {
    showConfirmation({
      title: 'Pin Options',
      message: 'What would you like to do with this pin?',
      icon: '📍',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => handleEditPin(pinId) },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeletePin(pinId) },
      ]
    });
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
    console.log('📍 EnhancedInteractiveMap: Place selected, forwarding to parent:', place);
    // Forward to parent (MapScreen) to show PlaceInfoModal
    if (onLocationSelect) {
      onLocationSelect(place);
    } else {
      // No fallback - parent should always provide handler
      console.warn('EnhancedInteractiveMap: No onLocationSelect handler provided');
    }
  };

  const handleLocationLongPress = (location: { latitude: number; longitude: number }) => {
    console.log('🖐️ EnhancedInteractiveMap: Long press detected at:', location);

    // Create a place object for the random location
    const randomPlace = {
      name: 'Custom Location',
      address: `Lat: ${location.latitude.toFixed(5)}, Lng: ${location.longitude.toFixed(5)}`,
      latitude: location.latitude,
      longitude: location.longitude,
      placeId: null,
      rating: null,
      types: ['custom_location'],
      isCustomLocation: true, // Flag to identify this as a random location
    };

    // Forward to parent (MapScreen) to show PlaceInfoModal
    if (onLocationSelect) {
      onLocationSelect(randomPlace);
    } else {
      dialog.showConfirm(
        'Create Event Here?',
        `Would you like to create an event at this location?\n\nLat: ${location.latitude.toFixed(5)}\nLng: ${location.longitude.toFixed(5)}`,
        () => {
          showInfo('Feature Coming Soon', 'Event creation at custom locations will be available in the next update!');
        }
      );
    }
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
        showSuccess('You have joined the event!', 'Success');
        // Refresh events list
        loadEvents();
      } else {
        showError(result.error || 'Failed to join event', 'Error');
      }
    } catch (error) {
      console.error('Error joining event:', error);
      showError('Failed to join event', 'Error');
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
        showSuccess('You have left the event', 'Success');
        // Refresh events list
        loadEvents();
      } else {
        showError(result.error || 'Failed to leave event', 'Error');
      }
    } catch (error) {
      console.error('Error leaving event:', error);
      showError('Failed to leave event', 'Error');
    }
  };

  const handleApplyEventFilters = (filters: EventSearchFilters) => {
    setEventSearchFilters(filters);
    console.log('Applied filters:', filters);
    // Add filter application logic here
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      <GoogleMapsView
        onLocationSelect={onLocationSelect}
        onPlaceSelect={handlePlaceSelect}
        onLocationLongPress={handleLocationLongPress}
        onEventSelect={handleEventSelect}
        searchQuery={searchQuery}
        events={currentFilters.showEvents !== false
          ? (filteredEvents.length > 0 || currentFilters.keywords?.length > 0 ? filteredEvents : events)
          : []}
        places={places}
        highlightMarkers={externalHighlightMarkers ||
          currentFilters.types.length > 0 ||
          currentFilters.keywords.length > 0 ||
          eventSearchFilters.activities.length > 0 ||
          !!eventSearchFilters.query}
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
        onEventCreated={handleEventCreated}
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
          currentUserId={getUserId() || undefined}
          onJoinEvent={handleJoinEvent}
          onLeaveEvent={handleLeaveEvent}
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

      {/* PlaceDetailsModal removed - MapScreen uses PlaceInfoModal instead */}

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          visible={showEventDetails}
          onClose={() => setShowEventDetails(false)}
          event={selectedEvent}
          currentUserId={getUserId() || undefined}
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
    backgroundColor: '#FFD700',
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
  pinManagementButton: {
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
  pinManagementButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
});
