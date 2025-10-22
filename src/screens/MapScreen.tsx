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
import { BottomNavBar, ActivityFilterModal } from '../components';
import EnhancedInteractiveMap from '../components/EnhancedInteractiveMap';
import { useTranslation } from '../contexts/TranslationContext';
import * as Location from 'expo-location';
import { BackendService } from '../services/backendService';
import { useAuth } from '../contexts/AuthContext';
import CreateEventModal from '../components/CreateEventModal';
import { supabase } from '../config/supabase';

// ===========================
// SPORT TYPE TO EMOJI MAPPING
// ===========================
const SPORT_EMOJI_MAP: Record<string, string> = {
  basketball: '🏀',
  football: '⚽',
  soccer: '⚽',
  running: '🏃‍♂️',
  tennis: '🎾',
  cycling: '🚴‍♂️',
  swimming: '🏊‍♂️',
  gym: '💪',
  volleyball: '🏐',
  climbing: '🧗‍♂️',
  yoga: '🧘',
  badminton: '🏸',
  baseball: '⚾',
  golf: '⛳',
  hockey: '🏒',
  // Fallback
  default: '🏃',
};

// Helper function to get sport emoji
const getSportEmoji = (sportType: string): string => {
  const normalizedSport = sportType.toLowerCase().trim();
  return SPORT_EMOJI_MAP[normalizedSport] || SPORT_EMOJI_MAP.default;
};

// ===========================
// INTERFACES & TYPES
// ===========================
interface MapEvent {
  id: string;
  name: string; // Will be mapped from 'title'
  activity: string; // Will be mapped from 'sport_type'
  latitude: number;
  longitude: number;
  participants_count: number;
  max_participants: number;
  status: 'live' | 'past' | 'cancelled' | 'active'; // Added 'active' for your schema
  created_at: string;
}

export default function MapScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [filters, setFilters] = useState({
    types: [],
    keywords: [],
    radius: 3000,
  });
  const mapRef = useRef<any>(null);
  
  // ===========================
  // STATE MANAGEMENT
  // ===========================
  const [events, setEvents] = useState<MapEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // ===========================
  // FETCH EVENTS FROM BACKEND
  // ===========================
  const fetchEventsFromBackend = useCallback(async () => {
    if (!userLocation) {
      console.log('⚠️ No user location available');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching events from backend...');

      // Use the new backend service to get nearby events
      const backendEvents = await BackendService.Events.getNearbyEvents(
        userLocation.latitude,
        userLocation.longitude,
        filters.radius / 1000, // Convert meters to kilometers
        50 // limit
      );

      console.log('📊 Backend events:', backendEvents);

      if (!backendEvents || backendEvents.length === 0) {
        console.log('⚠️ No events found');
        setEvents([]);
        return;
      }

      // Transform backend events to MapEvent format
      const transformedEvents: MapEvent[] = await Promise.all(
        backendEvents.map(async (event) => {
          // Get participant count for each event
          const participants = await BackendService.Events.getEventParticipants(event.id);
          
          return {
            id: event.id,
            name: event.title,
            activity: event.sport_type,
            latitude: event.latitude,
            longitude: event.longitude,
            participants_count: participants.length,
            max_participants: event.max_participants,
            status: event.status as 'live' | 'past' | 'cancelled' | 'active',
            created_at: event.created_at,
          };
        })
      );

      console.log('✅ Transformed events:', transformedEvents);
      setEvents(transformedEvents);

    } catch (error: any) {
      console.error('❌ Error fetching events:', error);
      setError(`Failed to load events: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [userLocation, filters.radius]);

  // ===========================
  // LOCATION PERMISSION & SETUP
  // ===========================
  useEffect(() => {
    const setupLocationAndFetchEvents = async () => {
      try {
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t.map.permissionDenied, t.map.locationAccessNeeded);
          // Still fetch events even without location
          await fetchEventsFromBackend();
          return;
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        console.log('📍 User location obtained:', location.coords);

        // Fetch events
        await fetchEventsFromBackend();

      } catch (error) {
        console.error('Error setting up location:', error);
        // Still try to fetch events
        await fetchEventsFromBackend();
      }
    };

    setupLocationAndFetchEvents();
  }, [fetchEventsFromBackend, t.map.locationAccessNeeded, t.map.permissionDenied]);

  // ===========================
  // REAL-TIME EVENT UPDATES
  // ===========================
  useEffect(() => {
    console.log('🔔 Setting up real-time event subscriptions...');

    // Subscribe to changes in events table
    const channel = supabase
      .channel('map-events')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'events',
        },
        (payload) => {
          console.log('🔔 Event change detected:', payload);
          
          // Refetch events when changes occur
          fetchEventsFromBackend();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      console.log('🔕 Cleaning up event subscriptions...');
      supabase.removeChannel(channel);
    };
  }, [fetchEventsFromBackend]);

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

  const handleCreateEvent = () => {
    if (!user) {
      Alert.alert('Login Required', 'You must be logged in to create an event');
      return;
    }
    setShowCreateEventModal(true);
  };

  const handleEventCreated = (newEvent: any) => {
    console.log('New event created:', newEvent);
    // Refresh events list
    fetchEventsFromBackend();
  };

  const handleEventPress = (event: MapEvent) => {
    // Navigate to event details with chat
    navigation.navigate('EventDetails', { 
      eventId: event.id,
      eventTitle: event.name,
      event: event 
    });
  };

  // Handle map tap to create event at that location
  const handleMapTap = (location: { latitude: number; longitude: number }) => {
    console.log('🗺️ Map tapped at:', location);
    
    // Update user location to tapped location
    setUserLocation(location);
    
    // Show create event modal
    setShowCreateEventModal(true);
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
        onLocationSelect={handleMapTap}
        hideControls={true}
        events={events}
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

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#FDB924" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        </View>
      )}

      {/* Event Count Badge */}
      {!loading && events.length > 0 && (
        <View style={styles.eventCountBadge}>
          <Text style={styles.eventCountText}>
            {events.length} event{events.length !== 1 ? 's' : ''} nearby
          </Text>
        </View>
      )}

      {/* Debug Info (remove in production) */}
      {__DEV__ && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Events: {events.length} | Loading: {loading ? 'Yes' : 'No'}
          </Text>
          {events.length > 0 && (
            <Text style={styles.debugText}>
              Sports: {[...new Set(events.map(e => e.activity))].join(', ')}
            </Text>
          )}
        </View>
      )}

      {/* Create Event Button */}
      <TouchableOpacity
        style={styles.createEventButton}
        onPress={handleCreateEvent}
        activeOpacity={0.8}
      >
        <Text style={styles.createEventButtonText}>+ Create Event</Text>
      </TouchableOpacity>

      {/* Filter Modal */}
      <ActivityFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        visible={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        onEventCreated={handleEventCreated}
        userLocation={userLocation || undefined}
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
  // Create Event Button
  createEventButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 500,
  },
  createEventButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});