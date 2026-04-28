import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../navigation/hooks';
import { ROUTES } from '../navigation/types';
import { BottomNavBar, ActivityFilterModal, CreateEventModal } from '../components';
import EnhancedInteractiveMap from '../components/EnhancedInteractiveMap';
import PlaceInfoModal from '../components/PlaceInfoModal';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import * as Location from 'expo-location';
import { userService } from '../services/userService';
import { supabase } from '../config/supabase';
import { MyEvent, SportActivity } from '../types/event';
import { useToast } from '../components/ToastProvider';

// ===========================
// SPORT TYPE TO EMOJI MAPPING
// ===========================
// NOTE: Unused now that events don't show on map
// const SPORT_EMOJI_MAP: Record<string, string> = {
//   basketball: '🏀',
//   football: '⚽',
//   soccer: '⚽',
//   running: 'walk-outline‍♂️',
//   tennis: '🎾',
//   cycling: 'bicycle-outline‍♂️',
//   swimming: 'water-outline‍♂️',
//   gym: '💪',
//   volleyball: '🏐',
//   climbing: 'trending-up-outline‍♂️',
//   yoga: '🧘',
//   badminton: '🏸',
//   baseball: '⚾',
//   golf: 'golf-outline',
//   hockey: '🏒',
//   // Fallback
//   default: '🏃',
// };

// // Helper function to get sport emoji
// const getSportEmoji = (sportType: string): string => {
//   const normalizedSport = sportType.toLowerCase().trim();
//   return SPORT_EMOJI_MAP[normalizedSport] || SPORT_EMOJI_MAP.default;
// };

// ===========================
// INTERFACES & TYPES
// ===========================
// NOTE: Unused now that events don't show on map
const EVENT_DURATION_MS = 2 * 60 * 60 * 1000;

const normalizeSportActivity = (activity?: string): SportActivity => {
  const value = (activity || 'basketball').toLowerCase().trim();
  switch (value) {
    case 'football':
    case 'soccer':
      return 'football';
    case 'tennis':
      return 'tennis';
    case 'volleyball':
      return 'volleyball';
    case 'running':
      return 'running';
    case 'cycling':
      return 'cycling';
    case 'swimming':
      return 'swimming';
    case 'gym':
    case 'fitness':
      return 'gym';
    case 'judo':
      return 'judo';
    case 'wrestling':
      return 'wrestling';
    case 'muay thai':
      return 'muay thai';
    case 'kickboxing':
      return 'kickboxing';
    case 'rollerblading':
      return 'rollerblading';
    case 'ice skating':
      return 'ice skating';
    case 'skating':
      return 'skating';
    case 'padel':
      return 'padel';
    case 'squash':
      return 'squash';
    case 'bouldering':
    case 'climbing':
      return 'bouldering';
    case 'table tennis':
      return 'table tennis';
    case 'yoga':
      return 'yoga';
    case 'pilates':
      return 'pilates';
    case 'crossfit':
      return 'crossfit';
    case 'badminton':
      return 'badminton';
    default:
      return 'basketball';
  }
};

export default function MapScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const { getUserId } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const userId = getUserId();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<{
    types: string[];
    keywords: string[];
    radius: number;
  }>({
    types: [],
    keywords: [],
    radius: 3000,
  });
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isPlaceModalVisible, setIsPlaceModalVisible] = useState(false);
  const [isLoadingPlaceDetails, setIsLoadingPlaceDetails] = useState(false);
  const [isCreateEventModalVisible, setIsCreateEventModalVisible] = useState(false);
  const [selectedLocationForEvent, setSelectedLocationForEvent] = useState<any>(null);
  const mapRef = useRef<any>(null);

  // ===========================
  // STATE MANAGEMENT
  // ===========================
  // NOTE: Event state disabled - events now only show in PlaceInfoModal
  // const [events, setEvents] = useState<MapEvent[]>([]);
  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const mapEventRecordToMyEvent = useCallback(
    (eventRecord: any): MyEvent => {
      const start = eventRecord?.scheduled_datetime
        ? new Date(eventRecord.scheduled_datetime)
        : new Date();
      const end = new Date(start.getTime() + EVENT_DURATION_MS);
      const creator = eventRecord?.creator || {};
      const creatorId = creator.id || eventRecord.created_by;

      return {
        id: eventRecord.id,
        name: eventRecord.name || eventRecord.title || 'Event',
        activity: normalizeSportActivity(eventRecord.activity || eventRecord.sport_type),
        startTime: start,
        endTime: end,
        location: {
          name:
            eventRecord.location_name ||
            eventRecord.place_name ||
            eventRecord.location?.name ||
            'Selected Location',
          address:
            eventRecord.location_address ||
            eventRecord.place_address ||
            eventRecord.location?.address ||
            '',
          distance: eventRecord.distance ?? 0,
          lat: eventRecord.latitude || eventRecord.location?.lat || 0,
          lng: eventRecord.longitude || eventRecord.location?.lng || 0,
        },
        participants: {
          current: eventRecord.currentParticipants ?? eventRecord.participants_count ?? 0,
          max: eventRecord.max_participants ?? eventRecord.maxParticipants ?? 0,
        },
        status: 'upcoming',
        role: creatorId && userId && creatorId === userId ? 'created' : 'invited',
        chatEnabled: true,
        createdBy: {
          id: creatorId || 'unknown',
          name: creator.display_name || 'Organizer',
          avatar: creator.avatar_url,
        },
        description: eventRecord.description,
        requiresApproval: !!(eventRecord.requires_approval ?? eventRecord.requiresApproval),
        placeId: eventRecord.place_id || null,
      };
    },
    [userId]
  );

  // ===========================
  // FETCH EVENTS FROM SUPABASE
  // ===========================
  // NOTE: Event fetching disabled - events now only show in PlaceInfoModal
  // when clicking on filtered locations, not as map markers
  // const fetchEventsFromSupabase = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);

  //     console.log('🔄 Fetching events from Supabase...');

  //     // Query events table with filters matching YOUR schema
  //     const { data, error: queryError } = await supabase
  //       .from('events')
  //       .select('*')
  //       .in('status', ['live', 'active', 'upcoming']) // Support multiple status values
  //       .gte('scheduled_datetime', new Date().toISOString()) // Future events only
  //       .order('scheduled_datetime', { ascending: true })
  //       .limit(100); // Limit to avoid performance issues

  //     if (queryError) {
  //       console.error('❌ Supabase query error:', queryError);
  //       throw queryError;
  //     }

  //     if (!data || data.length === 0) {
  //       console.log('ℹ️ No active events found');
  //       setEvents([]);
  //       return;
  //     }

  //     // Transform YOUR Supabase schema to MapEvent format
  //     const transformedEvents: MapEvent[] = data.map((event: any) => ({
  //       id: event.id,
  //       name: event.name, // Column: 'name'
  //       activity: event.activity, // Column: 'activity'
  //       latitude: event.latitude,
  //       longitude: event.longitude,
  //       participants_count: event.participants_count || 0,
  //       max_participants: event.max_participants,
  //       status: event.status,
  //       created_at: event.scheduled_datetime, // Using scheduled_datetime for display
  //     }));

  //     console.log(`✅ Fetched ${transformedEvents.length} events successfully`);
  //     console.log('📊 Events data:', transformedEvents);
  //     setEvents(transformedEvents);

  //   } catch (err: any) {
  //     console.error('❌ Error fetching events:', err);
  //     setError(err.message || 'Failed to load events');
  //      showError(err.message || 'Failed to load events', 'Error Loading Events');
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  // ===========================
  // LOCATION PERMISSION & SETUP
  // ===========================
  useEffect(() => {
    const setupLocation = async () => {
      try {
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          showInfo(t.map.locationAccessNeeded, t.map.permissionDenied);
          return;
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        console.log('📍 User location obtained:', location.coords);

        // Fetch user preferences for personalized filtering
        if (userId) {
          console.log('👤 Fetching user preferences for personalized filtering...');
          try {
            const profile = await userService.getUserProfile(userId);
            console.log('👤 Profile data received:', profile ? 'yes' : 'null');
            console.log('👤 Favorite sports:', profile?.favorite_sports);

            if (profile && profile.favorite_sports && profile.favorite_sports.length > 0) {
              console.log('basketball-outline Setting default filters based on favorite sports:', profile.favorite_sports);
              setFilters(prev => ({
                ...prev,
                keywords: profile.favorite_sports
              }));
              showSuccess(t.map.personalizedFiltersApplied, 'Personalized View');
            } else {
              console.log('⚠️ No favorite sports found in profile');
            }
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
          }
        } else {
          console.log('⚠️ No userId available for personalized filtering');
        }

      } catch (error) {
        console.error('Error setting up location:', error);
      }
    };

    setupLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ===========================
  // REAL-TIME EVENT UPDATES
  // ===========================
  // NOTE: Event fetching disabled - events now only show in PlaceInfoModal
  // when clicking on filtered locations, not as map markers
  // useEffect(() => {
  //   console.log('🔔 Setting up real-time event subscriptions...');

  //   // Subscribe to changes in events table
  //   const channel = supabase
  //     .channel('map-events')
  //     .on(
  //       'postgres_changes',
  //       {
  //         event: '*', // Listen to INSERT, UPDATE, DELETE
  //         schema: 'public',
  //         table: 'events',
  //       },
  //       (payload) => {
  //         console.log('🔔 Event change detected:', payload);
  //         
  //         // Refetch events when changes occur
  //         fetchEventsFromSupabase();
  //       }
  //     )
  //     .subscribe();

  //   // Cleanup subscription on unmount
  //   return () => {
  //     console.log('🔕 Cleaning up event subscriptions...');
  //     supabase.removeChannel(channel);
  //   };
  // }, [fetchEventsFromSupabase]);

  const handleLocationPermissionGranted = () => {
    console.log('Location permission granted');
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleApplyFilters = (newFilters: any) => {
    console.log('MapScreen: Applying filters:', newFilters);
    setFilters(newFilters);
    setShowFilterModal(false);
  };

  // Handle place/location marker press (for filtered locations)
  const handleLocationSelect = (place: any) => {
    console.log('📍 MapScreen: Filtered location selected:', place);
    setIsLoadingPlaceDetails(true);
    setIsPlaceModalVisible(true);

    // Convert photo references to URLs if photos exist
    const placeWithPhotoUrls = {
      ...place,
      photos: place.photos?.map((photo: any) => {
        // If photo already has url, keep it
        if (photo.url) return photo;

        // If photo has photoReference, convert to URL
        if (photo.photoReference) {
          const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';
          return {
            ...photo,
            url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photoReference}&key=${GOOGLE_API_KEY}`
          };
        }

        // Fallback for old format (string photoReference)
        if (typeof photo === 'string') {
          const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';
          return {
            photoReference: photo,
            url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo}&key=${GOOGLE_API_KEY}`
          };
        }

        return photo;
      })
    };

    setSelectedPlace(placeWithPhotoUrls);
    setIsLoadingPlaceDetails(false);
  };

  // Handle create event at place
  const handleCreateMeetup = (placeDetails: any) => {
    console.log('✨ MapScreen: Opening create event modal for:', placeDetails.name);

    // Prepare location data for event creation modal
    const locationData = {
      name: placeDetails.name || 'Selected Location',
      address: placeDetails.address || placeDetails.vicinity || '',
      latitude: placeDetails.coordinates?.lat || placeDetails.latitude,
      longitude: placeDetails.coordinates?.lng || placeDetails.longitude,
      placeId: placeDetails.placeId || placeDetails.place_id || null,
    };

    setSelectedLocationForEvent(locationData);
    setIsCreateEventModalVisible(true);
    setIsPlaceModalVisible(false); // Close location modal
  };

  // Handler for when event is created
  const handleEventCreated = (newEvent: any) => {
    console.log('🎉 New event created:', newEvent.name);

    // Event created successfully - it will now be visible in PlaceInfoModal
    // when users click on this location

    // Show success feedback
    showSuccess(`Your "${newEvent.name}" event is now live! Visit this location on the map to see it.`, 'Event Created! 🎉');
  };

  // Handle event press from place modal
  const handleEventPress = (event: any) => {
    try {
      const mappedEvent = mapEventRecordToMyEvent(event);
      navigation.navigate(ROUTES.EVENT_DETAILS, { game: mappedEvent });
      setIsPlaceModalVisible(false);
    } catch (error) {
      console.error('Failed to open event details:', error);
      showError(t.eventDetails.errorMessage, t.common.error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Map - Full Screen (underneath top bar) */}
      <EnhancedInteractiveMap
        onMapReady={(ref) => {
          mapRef.current = ref;
        }}
        onLocationPermissionGranted={handleLocationPermissionGranted}
        onLocationSelect={handleLocationSelect}
        hideControls={true}
        externalFilters={filters}
        highlightMarkers={filters.keywords.length > 0 || filters.types.length > 0}
      />

      {/* Clean Top Bar - Overlaid */}
      <SafeAreaView style={styles.topBarSafeArea}>
        <View style={styles.topBar}>
          {/* Logo on Left */}
          {/* Logo on Left */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo/sm-icon-logo.png')}
              style={styles.logoIcon}
              resizeMode="contain"
            />
            <Image
              source={require('../../assets/logo/sportsmap-text-logo.png')}
              style={styles.logoText}
              resizeMode="contain"
            />
          </View>

          {/* Action Buttons on Right */}
          <View style={styles.topBarActions}>
            <TouchableOpacity
              style={styles.topBarButton}
              onPress={handleFilterPress}
              activeOpacity={0.7}
            >
              <Image
                source={require('../../assets/filters.png')}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.topBarButton}
              onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
              activeOpacity={0.7}
            >
              <Image
                source={require('../../assets/notification.png')}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.topBarButton}
              onPress={() => navigation.navigate(ROUTES.SETTINGS)}
              activeOpacity={0.7}
            >
              <Image
                source={require('../../assets/options.png')}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>


      {/* Filter Modal */}
      <ActivityFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />

      {/* Place Info Modal */}
      <PlaceInfoModal
        visible={isPlaceModalVisible}
        placeDetails={selectedPlace}
        onClose={() => setIsPlaceModalVisible(false)}
        onCreateMeetup={handleCreateMeetup}
        onEventPress={handleEventPress}
        userLocation={userLocation}
        loading={isLoadingPlaceDetails}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        visible={isCreateEventModalVisible}
        location={selectedLocationForEvent}
        onClose={() => setIsCreateEventModalVisible(false)}
        onEventCreated={handleEventCreated}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <BottomNavBar
          activeTab="Home"
          onProfilePress={() => navigation.navigate(ROUTES.PROFILE)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Top Bar Safe Area Wrapper
  topBarSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    // Enhanced shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
  },
  // Top Bar Styles
  topBar: {
    height: 100, // Increased height for bigger elements
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2, // Minimal padding to maximize width
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  // Logo Styles
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 0,
    marginRight: 0,
    // Allow text to overlap if absolutely necessary, but prioritize visibility
  },
  logoIcon: {
    width: 70, // Slightly bigger icon
    height: 70,
    zIndex: 10,
  },
  logoText: {
    width: 320,
    height: 100,
    transform: [{ translateX: -85 }], // Massive left shift
    zIndex: 1,
  },
  // Action Buttons on Right
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    display: 'flex',
    gap: 4, // Tight gap
    paddingRight: 4,
    flexShrink: 0,
    zIndex: 10,
    backgroundColor: 'transparent', // Ensure transparency
  },
  topBarButton: {
    width: 52, // Restored to 52 as requested
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  // Bottom Nav Container
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  // Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 500,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  // Event Count Badge
  eventCountBadge: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: '#FFD700',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 500,
  },
  eventCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  // Debug Info
  debugInfo: {
    position: 'absolute',
    bottom: 90,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 12,
    zIndex: 500,
  },
  debugText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
});