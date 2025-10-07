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
import { BottomNavBar } from '../components';
import EnhancedInteractiveMap from '../components/EnhancedInteractiveMap';
import { useTranslation } from '../contexts/TranslationContext';
import * as Location from 'expo-location';
import { supabase } from '../services/supabase';
import type { Event } from '../services/supabase';

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

// Simple Logo Component
const SportMapLogo = () => (
  <View style={styles.logoContainer}>
    <View style={styles.logoCircle}>
      <Text style={styles.logoText}>SM</Text>
    </View>
    <Text style={styles.logoTitle}>SportMap</Text>
  </View>
);

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
  const [showFilterModal, setShowFilterModal] = useState(false);
  const mapRef = useRef<any>(null);
  
  // ===========================
  // STATE MANAGEMENT
  // ===========================
  const [events, setEvents] = useState<MapEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState<boolean>(__DEV__); // Show debug in development
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // ===========================
  // FETCH EVENTS FROM SUPABASE
  // ===========================
  const fetchEventsFromSupabase = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching events from Supabase...');
      console.log('🔄 MapScreen: Starting fetchEventsFromSupabase function');

      // Query events table with filters matching YOUR schema
      console.log('🔄 MapScreen: About to query events table');
      const { data, error: queryError } = await supabase
        .from('events')
        .select('*')
        // .eq('status', 'active') // TEMPORARILY DISABLED - RLS might be blocking this
        .order('scheduled_datetime', { ascending: true })
        .limit(100); // Limit to avoid performance issues

      console.log('🔄 MapScreen: Query completed. Data:', data?.length || 0, 'events');
      console.log('🔄 MapScreen: Query error:', queryError);

      if (queryError) {
        console.error('❌ Supabase query error:', queryError);
        throw queryError;
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ No active events found');
        setEvents([]);
        return;
      }

      // Filter for active events only (since RLS might block the WHERE clause)
      const activeEvents = data.filter((event: any) => event.status === 'active');
      console.log(`🔄 MapScreen: Filtered to ${activeEvents.length} active events from ${data.length} total events`);

      // Transform YOUR Supabase schema to MapEvent format
      const transformedEvents: MapEvent[] = activeEvents.map((event: any) => ({
        id: event.id,
        name: event.title, // YOUR schema: 'title' → 'name'
        activity: event.sport_type, // YOUR schema: 'sport_type' → 'activity'
        latitude: event.latitude,
        longitude: event.longitude,
        participants_count: 0, // TODO: Calculate from event_participants table
        max_participants: event.max_participants,
        status: event.status,
        created_at: event.scheduled_datetime, // Using scheduled_datetime for display
      }));

      console.log(`✅ Fetched ${transformedEvents.length} events successfully`);
      console.log('📊 Events data:', transformedEvents);
      setEvents(transformedEvents);

    } catch (err: any) {
      console.error('❌ Error fetching events:', err);
      setError(err.message || 'Failed to load events');
      Alert.alert(
        'Error Loading Events',
        'Could not fetch sport events. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  }, []);

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
          await fetchEventsFromSupabase();
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
        console.log('🔄 MapScreen: About to call fetchEventsFromSupabase');
        await fetchEventsFromSupabase();

      } catch (error) {
        console.error('Error setting up location:', error);
        // Still try to fetch events
        await fetchEventsFromSupabase();
      }
    };

    setupLocationAndFetchEvents();
  }, [fetchEventsFromSupabase, t.map.locationAccessNeeded, t.map.permissionDenied]);

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
          fetchEventsFromSupabase();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      console.log('🔕 Cleaning up event subscriptions...');
      supabase.removeChannel(channel);
    };
  }, [fetchEventsFromSupabase]);

  const handleLocationPermissionGranted = () => {
    console.log('Location permission granted');
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
    // TODO: Open filter modal
  };

  // Debug: Log events before passing to map
  console.log('🗺️ MapScreen passing events to EnhancedInteractiveMap:', events.length, 'events');
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Map - Full Screen (underneath top bar) */}
      <EnhancedInteractiveMap
        onMapReady={(ref) => {
          mapRef.current = ref;
        }}
        onLocationPermissionGranted={handleLocationPermissionGranted}
        hideControls={true}
        events={events}
      />

      {/* Clean Top Bar - Overlaid */}
      <SafeAreaView style={styles.topBarSafeArea}>
        <View style={styles.topBar}>
          {/* Logo on Left */}
          <SportMapLogo />

          {/* Action Buttons on Right */}
          <View style={styles.topBarActions}>
            <TouchableOpacity 
              style={styles.topBarButton} 
              onPress={handleFilterPress}
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={24} color="#000000" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.topBarButton} 
              onPress={() => navigation.navigate(ROUTES.SETTINGS)}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={24} color="#000000" />
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

      {/* Debug Toggle Button */}
      {__DEV__ && (
        <TouchableOpacity 
          style={styles.debugToggle}
          onPress={() => setShowDebug(!showDebug)}
        >
          <Text style={styles.debugToggleText}>
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Debug Info */}
      {showDebug && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Events: {events.length} | Loading: {loading ? 'Yes' : 'No'}
          </Text>
          {events.length > 0 && (
            <Text style={styles.debugText}>
              Sports: {[...new Set(events.map(e => e.activity))].join(', ')}
            </Text>
          )}
          {error && (
            <Text style={styles.debugText}>
              Error: {error}
            </Text>
          )}
        </View>
      )}

      {/* Debug Test Component */}
      {/* Debug Test Component */}
      {showDebug && (
        <View style={styles.debugTestContainer}>
          <Text style={styles.debugText}>Debug Test Component Placeholder</Text>
        </View>
      )}
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
  // Logo Styles (larger)
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FDB924', // Yellow
    justifyContent: 'center',
    alignItems: 'center',
    // Slight shadow on logo
    shadowColor: '#FDB924',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.3,
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
  // Debug Toggle Button
  debugToggle: {
    position: 'absolute',
    top: 150,
    right: 20,
    backgroundColor: '#FDB924',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 600,
  },
  debugToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  // Debug Test Container
  debugTestContainer: {
    position: 'absolute',
    top: 200,
    left: 10,
    right: 10,
    bottom: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    zIndex: 600,
    maxHeight: 400,
  },
});