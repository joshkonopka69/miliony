import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
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
import * as Location from 'expo-location';
import { supabase } from '../services/supabase';
import type { Event } from '../services/supabase';

// ===========================
// SPORT TYPE TO EMOJI MAPPING
// ===========================
// NOTE: Unused now that events don't show on map
// const SPORT_EMOJI_MAP: Record<string, string> = {
//   basketball: '🏀',
//   football: '⚽',
//   soccer: '⚽',
//   running: '🏃‍♂️',
//   tennis: '🎾',
//   cycling: '🚴‍♂️',
//   swimming: '🏊‍♂️',
//   gym: '💪',
//   volleyball: '🏐',
//   climbing: '🧗‍♂️',
//   yoga: '🧘',
//   badminton: '🏸',
//   baseball: '⚾',
//   golf: '⛳',
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
// interface MapEvent {
//   id: string;
//   name: string; // Will be mapped from 'title'
//   activity: string; // Will be mapped from 'sport_type'
//   latitude: number;
//   longitude: number;
//   participants_count: number;
//   max_participants: number;
//   status: 'live' | 'past' | 'cancelled' | 'active'; // Added 'active' for your schema
//   created_at: string;
// }

export default function MapScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
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
  //     Alert.alert(
  //       'Error Loading Events',
  //       'Could not fetch sport events. Please try again later.',
  //       [{ text: 'OK' }]
  //     );
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
          Alert.alert(t.map.permissionDenied, t.map.locationAccessNeeded);
          return;
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        console.log('📍 User location obtained:', location.coords);

      } catch (error) {
        console.error('Error setting up location:', error);
      }
    };

    setupLocation();
  }, [t.map.locationAccessNeeded, t.map.permissionDenied]);

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
          const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 'AIzaSyDBJ65DOu4WMoTRjvz1J6i6VbYbjOoEW2E';
          return {
            ...photo,
            url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photoReference}&key=${GOOGLE_API_KEY}`
          };
        }
        
        // Fallback for old format (string photoReference)
        if (typeof photo === 'string') {
          const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 'AIzaSyDBJ65DOu4WMoTRjvz1J6i6VbYbjOoEW2E';
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
    Alert.alert(
      'Event Created! 🎉',
      `Your "${newEvent.name}" event is now live! Visit this location on the map to see it.`,
      [{ text: 'Awesome!' }]
    );
  };

  // Handle event press from place modal
  const handleEventPress = (event: any) => {
    console.log('🎮 MapScreen: Event selected:', event.name);
    // TODO: Navigate to event details or show event details modal
    Alert.alert(
      'Event Details',
      `Event: ${event.name}\nCreator: ${event.creator?.display_name || 'Unknown'}\nParticipants: ${event.currentParticipants}/${event.max_participants}`,
      [{ text: 'OK' }]
    );
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
      />

      {/* Clean Top Bar - Overlaid */}
      <SafeAreaView style={styles.topBarSafeArea}>
        <View style={styles.topBar}>
          {/* Logo on Left */}
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />

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
  // Top Bar Styles (taller and more prominent)
  topBar: {
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  // Logo Styles
  logo: {
    width: 46,
    height: 46,
  },
  // Action Buttons on Right
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
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
    backgroundColor: '#FDB924',
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