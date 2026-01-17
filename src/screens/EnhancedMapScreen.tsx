/**
 * Enhanced MapScreen with Location Discovery & Event Management
 * Includes: Filter bar, location markers, event markers, modals
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAppNavigation } from '../navigation/hooks';
import { ROUTES } from '../navigation/types';
import { BottomNavBar } from '../components';
import PlaceInfoModal from '../components/PlaceInfoModal';
import { CreateEventModal } from '../components/CreateEventModal';
import type { EventFormData } from '../components/CreateEventModal';
import { useTranslation } from '../contexts/TranslationContext';
import { supabase } from '../config/supabase';
import {
  searchWithCache,
  calculateDistance,
  getPlacePhotoUrl,
  type PlaceLocation,
} from '../services/googlePlacesService';

// Filter categories
const FILTER_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🏆' },
  { id: 'sport_halls', label: 'Sport Halls', emoji: '🏟️' },
  { id: 'sport_fields', label: 'Sport Fields', emoji: '⚽' },
  { id: 'parks', label: 'Parks', emoji: '🌳' },
  { id: 'fight_clubs', label: 'Fight Clubs', emoji: '🥊' },
  { id: 'outside_courts', label: 'Outside Courts', emoji: '🏀' },
  { id: 'water_sports', label: 'Water Sports', emoji: '🚣' },
  { id: 'fitness', label: 'Fitness', emoji: '🏋️' },
  { id: 'outdoor', label: 'Outdoor', emoji: '⛰️' },
];

// Sport emoji mapping
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
  boxing: '🥊',
  default: '🏅',
};

const getSportEmoji = (sportType: string): string => {
  return SPORT_EMOJI_MAP[sportType.toLowerCase()] || SPORT_EMOJI_MAP.default;
};

const getSportColor = (sportType: string): string => {
  const colorMap: Record<string, string> = {
    basketball: '#ff6b35',
    football: '#4ecdc4',
    running: '#95e1d3',
    tennis: '#ffeb3b',
    cycling: '#f38181',
    swimming: '#03a9f4',
    gym: '#9c27b0',
    volleyball: '#ff9800',
    climbing: '#795548',
    boxing: '#e91e63',
  };
  return colorMap[sportType.toLowerCase()] || '#6366f1';
};

interface MapEvent {
  id: string;
  title: string;
  sport_type: string;
  latitude: number;
  longitude: number;
  max_participants: number;
  scheduled_datetime: string;
  currentParticipants: number;
  skill_level?: string;
  place_id?: string;
}

interface LocationEvent {
  id: string;
  title: string;
  sport_type: string;
  scheduled_datetime: string;
  min_participants: number;
  max_participants: number;
  skill_level?: string;
  currentParticipants: number;
}

// Filter Chip Component
const FilterChip: React.FC<{
  emoji: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
  isLoading?: boolean;
}> = ({ emoji, label, isActive, onPress, isLoading }) => (
  <TouchableOpacity
    style={[styles.filterChip, isActive && styles.filterChipActive]}
    onPress={onPress}
    disabled={isLoading}
  >
    {isLoading ? (
      <ActivityIndicator size="small" color={isActive ? 'white' : '#6366f1'} />
    ) : (
      <>
        <Text style={styles.filterEmoji}>{emoji}</Text>
        <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>{label}</Text>
      </>
    )}
  </TouchableOpacity>
);

// Logo Component
const SportMapLogo = () => (
  <View style={styles.logoContainer}>
    <View style={styles.logoCircle}>
      <Text style={styles.logoText}>SM</Text>
    </View>
    <Text style={styles.logoTitle}>SportMap</Text>
  </View>
);

export default function EnhancedMapScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const mapRef = useRef<MapView>(null);

  // Map & Location State
  const [region, setRegion] = useState({
    latitude: 52.2297,
    longitude: 21.0122,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Filter State
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchRadius] = useState(5000);

  // Locations State (Google Places)
  const [locations, setLocations] = useState<PlaceLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  // Events State (Supabase)
  const [events, setEvents] = useState<MapEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Selected Location State
  const [selectedLocation, setSelectedLocation] = useState<PlaceLocation | null>(null);
  const [locationEvents, setLocationEvents] = useState<LocationEvent[]>([]);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);

  // Create Event State
  const [isCreateEventModalVisible, setIsCreateEventModalVisible] = useState(false);
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    title: '',
    sportType: 'basketball',
    dateTime: new Date(),
    playersNeeded: 10,
    playersConfirmed: 1,
    skillLevel: 'any',
    description: '',
  });

  // UI State
  const [error, setError] = useState<string | null>(null);

  // ===========================
  // LOCATION PERMISSION & SETUP
  // ===========================
  const getUserLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show nearby venues'
        );
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(userCoords);

      // Animate map to user location
      mapRef.current?.animateToRegion(
        {
          ...userCoords,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000
      );

      return userCoords;
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Could not get your location');
      return null;
    }
  }, []);

  // ===========================
  // FETCH EVENTS FROM SUPABASE
  // ===========================
  const fetchEventsFromSupabase = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - 24);

      const { data, error: queryError } = await supabase
        .from('events')
        .select(
          `
          *,
          event_participants (
            id,
            user_id,
            status
          )
        `
        )
        .eq('status', 'active')
        .gte('scheduled_datetime', cutoff.toISOString())
        .order('scheduled_datetime', { ascending: true })
        .limit(100);

      if (queryError) throw queryError;

      const eventsWithCounts: MapEvent[] = (data || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        sport_type: event.sport_type,
        latitude: event.latitude,
        longitude: event.longitude,
        max_participants: event.max_participants,
        scheduled_datetime: event.scheduled_datetime,
        skill_level: event.skill_level,
        place_id: event.place_id,
        currentParticipants: event.event_participants.filter((p: any) => p.status === 'joined')
          .length,
      }));

      setEvents(eventsWithCounts);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  // ===========================
  // FILTER HANDLING
  // ===========================
  const handleFilterSelect = useCallback(
    async (filter: string) => {
      setActiveFilter(filter);

      if (filter === 'all') {
        setLocations([]);
        return;
      }

      setIsLoadingLocations(true);
      setError(null);

      try {
        const currentLocation = userLocation || region;
        const results = await searchWithCache(
          currentLocation.latitude,
          currentLocation.longitude,
          filter,
          searchRadius
        );

        setLocations(results);

        if (results.length === 0) {
          Alert.alert('No Results', `No ${filter} found within ${searchRadius / 1000}km`);
        }
      } catch (error: any) {
        console.error('Error fetching locations:', error);
        setError('Failed to load locations. Please try again.');
      } finally {
        setIsLoadingLocations(false);
      }
    },
    [userLocation, region, searchRadius]
  );

  // ===========================
  // LOCATION MARKER HANDLING
  // ===========================
  const handleLocationMarkerPress = (location: PlaceLocation) => {
    setSelectedLocation(location);
    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  };

  const handleCalloutPress = async (location: PlaceLocation) => {
    setIsLocationModalVisible(true);
    setLoading(true);

    try {
      const events = await fetchEventsAtLocation(
        location.placeId,
        location.latitude,
        location.longitude
      );
      setLocationEvents(events);
    } catch (error) {
      console.error('Error fetching location events:', error);
      setError('Failed to load events at this location');
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // FETCH EVENTS AT LOCATION
  // ===========================
  const fetchEventsAtLocation = async (
    placeId: string,
    latitude: number,
    longitude: number
  ): Promise<LocationEvent[]> => {
    const latRange = 0.001;
    const lngRange = 0.001;

    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    const { data, error } = await supabase
      .from('events')
      .select(
        `
        *,
        event_participants (
          id,
          user_id,
          status
        )
      `
      )
      .eq('status', 'active')
      .gte('scheduled_datetime', cutoff.toISOString())
      .or(
        `place_id.eq.${placeId},and(latitude.gte.${latitude - latRange},latitude.lte.${latitude + latRange
        },longitude.gte.${longitude - lngRange},longitude.lte.${longitude + lngRange})`
      )
      .order('scheduled_datetime', { ascending: true });

    if (error) throw error;

    return (data || []).map((event: any) => ({
      id: event.id,
      title: event.title,
      sport_type: event.sport_type,
      scheduled_datetime: event.scheduled_datetime,
      min_participants: event.min_participants,
      max_participants: event.max_participants,
      skill_level: event.skill_level,
      currentParticipants: event.event_participants.filter((p: any) => p.status === 'joined')
        .length,
    }));
  };

  // ===========================
  // CREATE EVENT HANDLING
  // ===========================
  const handleCreateEvent = () => {
    setIsLocationModalVisible(false);
    setIsCreateEventModalVisible(true);
  };

  const submitCreateEvent = async () => {
    try {
      // Validation
      if (!eventFormData.title.trim()) {
        Alert.alert('Error', 'Please enter an event title');
        return;
      }

      if (eventFormData.dateTime <= new Date()) {
        Alert.alert('Error', 'Event must be scheduled for a future time');
        return;
      }

      if (eventFormData.playersConfirmed > eventFormData.playersNeeded) {
        Alert.alert('Error', 'Confirmed players cannot exceed total players needed');
        return;
      }

      setLoading(true);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('Error', 'You must be logged in to create events');
        return;
      }

      // Create event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          creator_id: user.id,
          title: eventFormData.title,
          description: eventFormData.description || null,
          sport_type: eventFormData.sportType,
          latitude: selectedLocation!.latitude,
          longitude: selectedLocation!.longitude,
          place_name: selectedLocation!.name,
          place_id: selectedLocation!.placeId || null,
          scheduled_datetime: eventFormData.dateTime.toISOString(),
          min_participants: eventFormData.playersConfirmed,
          max_participants: eventFormData.playersNeeded,
          skill_level: eventFormData.skillLevel,
          requires_approval: false,
          status: 'active',
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Add creator as participant
      await supabase.from('event_participants').insert({
        event_id: event.id,
        user_id: user.id,
        status: 'joined',
      });

      Alert.alert('Success', 'Event created successfully!');

      // Close modal and reset form
      setIsCreateEventModalVisible(false);
      setEventFormData({
        title: '',
        sportType: 'basketball',
        dateTime: new Date(),
        playersNeeded: 10,
        playersConfirmed: 1,
        skillLevel: 'any',
        description: '',
      });

      // Refresh events
      await fetchEventsFromSupabase();
    } catch (error: any) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventPress = (event: LocationEvent) => {
    // TODO: Navigate to event details screen
    Alert.alert('Event', event.title);
  };

  // ===========================
  // REAL-TIME SUBSCRIPTIONS
  // ===========================
  useEffect(() => {
    const channel = supabase
      .channel('map-events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        () => {
          fetchEventsFromSupabase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEventsFromSupabase]);

  // ===========================
  // INITIALIZATION
  // ===========================
  useEffect(() => {
    getUserLocation();
    fetchEventsFromSupabase();
  }, [getUserLocation, fetchEventsFromSupabase]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onRegionChangeComplete={setRegion}
      >
        {/* Location Markers (Google Places) */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            onPress={() => handleLocationMarkerPress(location)}
          >
            <View style={styles.locationMarker}>
              <Text style={styles.markerEmoji}>
                {FILTER_CATEGORIES.find((f) => f.id === activeFilter)?.emoji || '📍'}
              </Text>
            </View>
            <Callout onPress={() => handleCalloutPress(location)}>
              <View style={styles.calloutContainer}>
                <View style={styles.calloutText}>
                  <Text style={styles.calloutTitle} numberOfLines={1}>
                    {location.name}
                  </Text>
                  <Text style={styles.calloutSubtitle}>Tap to see events →</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}

        {/* Event Markers (Supabase Events) */}
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
          >
            <View
              style={[styles.eventMarker, { backgroundColor: getSportColor(event.sport_type) }]}
            >
              <Text style={styles.markerEmoji}>{getSportEmoji(event.sport_type)}</Text>
              {event.currentParticipants > 0 && (
                <View style={styles.participantBadge}>
                  <Text style={styles.badgeText}>{event.currentParticipants}</Text>
                </View>
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Filter Bar */}
      <SafeAreaView style={styles.filterBarSafeArea} edges={['top']}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBar}
        >
          {FILTER_CATEGORIES.map((category) => (
            <FilterChip
              key={category.id}
              emoji={category.emoji}
              label={category.label}
              isActive={activeFilter === category.id}
              onPress={() => handleFilterSelect(category.id)}
              isLoading={isLoadingLocations && activeFilter === category.id}
            />
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Top Bar */}
      <SafeAreaView style={styles.topBarSafeArea} edges={[]}>
        <View style={styles.topBar}>
          <SportMapLogo />
          <View style={styles.topBarActions}>
            <TouchableOpacity
              style={styles.topBarButton}
              onPress={() => navigation.navigate(ROUTES.NOTIFICATIONS)}
            >
              <Ionicons name="notifications-outline" size={24} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.topBarButton}
              onPress={() => navigation.navigate(ROUTES.SETTINGS)}
            >
              <Ionicons name="settings-outline" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Event Count Badge */}
      {!loading && events.length > 0 && (
        <View style={styles.eventCountBadge}>
          <Text style={styles.eventCountText}>
            {events.length} event{events.length !== 1 ? 's' : ''} nearby
          </Text>
        </View>
      )}

      {/* Place Details Modal */}
      <PlaceInfoModal
        visible={isLocationModalVisible}
        placeDetails={selectedLocation as any}
        onClose={() => setIsLocationModalVisible(false)}
        onCreateMeetup={handleCreateEvent}
        onEventPress={handleEventPress}
        userLocation={userLocation}
        loading={loading}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        visible={isCreateEventModalVisible}
        location={selectedLocation}
        onClose={() => setIsCreateEventModalVisible(false)}
        onEventCreated={(event) => {
          console.log('Event created:', event);
          setIsCreateEventModalVisible(false);
          // Trigger refresh if needed
        }}
      />

      {/* Error Toast */}
      {error && (
        <View style={styles.errorToast}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Ionicons name="close" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
      )}

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
  map: {
    flex: 1,
  },
  // Filter Bar
  filterBarSafeArea: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 900,
  },
  filterBar: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterLabelActive: {
    color: 'white',
  },
  // Markers
  locationMarker: {
    backgroundColor: 'white',
    width: 40,
    height: 50,
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 2,
    borderColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    transform: [{ rotate: '45deg' }],
  },
  markerEmoji: {
    fontSize: 20,
    transform: [{ rotate: '-45deg' }],
  },
  eventMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 7,
  },
  participantBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#10b981',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Callout
  calloutContainer: {
    minWidth: 150,
    maxWidth: 200,
    padding: 4,
  },
  calloutText: {
    flex: 1,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  calloutSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  // Top Bar
  topBarSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
  },
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  topBarActions: {
    flexDirection: 'row',
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
  // Event Count
  eventCountBadge: {
    position: 'absolute',
    top: 150,
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
  // Error Toast
  errorToast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 600,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
  },
  // Bottom Nav
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

