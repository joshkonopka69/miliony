import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  Platform, 
  TouchableOpacity,
  Modal,
  Dimensions 
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

  useEffect(() => {
    requestLocationPermission();
    loadInitialData();
  }, []);

  useEffect(() => {
    if (userLocation) {
      searchPlaces();
    }
  }, [userLocation, currentFilters]);

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

    setLoading(true);
    try {
      const placesData = await placesApiService.searchNearby(userLocation, currentFilters);
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
      setEvents(eventsData);
    } catch (error) {
      console.error('Error searching places:', error);
      Alert.alert('Error', 'Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterApply = (filters: ActivityFilter) => {
    setCurrentFilters(filters);
    setShowFilterModal(false);
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

      {/* Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilterModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.filterButtonText}>🔍 Filter</Text>
      </TouchableOpacity>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading venues...</Text>
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
  },
  map: {
    width: width,
    height: height,
  },
  filterButton: {
    position: 'absolute',
    top: 50,
    right: 20,
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
  filterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
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
});
