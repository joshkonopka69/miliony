import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, TouchableOpacity, Modal } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { placesApiService, PlaceDetails } from '../services/placesApi';

// MapEvent interface for event markers
interface MapEvent {
  id: string;
  name: string;
  activity: string;
  latitude: number;
  longitude: number;
  participants_count: number;
  max_participants: number;
  status: 'live' | 'past' | 'cancelled' | 'active';
  created_at: string;
}

interface GoogleMapsViewProps {
  onPlaceSelect?: (place: any) => void;
  onLocationSelect?: (location: { latitude: number; longitude: number }) => void;
  searchQuery?: string;
  initialLocation?: { latitude: number; longitude: number };
  events?: MapEvent[];
}

const { width, height } = Dimensions.get('window');

// Helper function to get sport emoji
const getSportEmoji = (activity: string): string => {
  const emojiMap: Record<string, string> = {
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
  };
  return emojiMap[activity.toLowerCase()] || '🏃';
};

export default function GoogleMapsView({ 
  onPlaceSelect, 
  onLocationSelect, 
  searchQuery,
  initialLocation,
  events = []
}: GoogleMapsViewProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 51.1079, // Wroclaw default
    longitude: 17.0385,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [showPlaceDetails, setShowPlaceDetails] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Debug: Log events when component receives them
  console.log('🗺️ GoogleMapsView received events:', events);
  console.log('🗺️ GoogleMapsView events count:', events.length);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (location) {
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(newRegion);
      onLocationSelect?.({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    }
  }, [location]);

  useEffect(() => {
    if (initialLocation) {
      const newRegion = {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(newRegion);
    }
  }, [initialLocation]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is needed to show your position on the map.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log('🗺️ Map pressed at:', latitude, longitude);
    
    try {
      // Try to get place details for this location
      const placeDetails = await placesApiService.getPlaceDetails('ChIJ123456789'); // Mock place ID for now
      if (placeDetails) {
        setPlaceDetails(placeDetails);
        setShowPlaceDetails(true);
      }
    } catch (error) {
      console.log('No place details available for this location');
      // Still call onLocationSelect for event creation
      onLocationSelect?.({ latitude, longitude });
    }
  };

  const handleMapLongPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log('🗺️ Long press detected at:', latitude, longitude);
    onLocationSelect?.({ latitude, longitude });
  };

  const handleEventPress = async (event: MapEvent) => {
    // Navigate to event details instead of showing alert
    try {
      const { useAppNavigation } = await import('../navigation/hooks');
      const navigation = useAppNavigation();
      
      // Navigate to event details with event data
      navigation.navigate('EventDetails', {
        game: {
          id: event.id,
          title: event.name,
          players: event.participants_count,
          maxPlayers: event.max_participants,
          location: `${event.latitude}, ${event.longitude}`, // Simple location display
          time: new Date(event.created_at).toLocaleTimeString(),
          image: 'https://via.placeholder.com/300x200/FDB924/FFFFFF?text=Sport+Event',
          isJoined: false,
          description: `${event.activity} event`,
          date: new Date(event.created_at).toLocaleDateString(),
          skillLevel: 'All Levels',
          equipment: 'Bring your own equipment',
          rules: 'Standard rules apply',
          organizer: 'Event Organizer'
        }
      });
    } catch (error) {
      console.error('Error navigating to event details:', error);
      // Fallback to alert if navigation fails
        Alert.alert(
        event.name,
        `${event.activity}\n${event.participants_count}/${event.max_participants} participants`,
          [
            { text: 'Close', style: 'cancel' },
          { 
            text: 'Join Event', 
            onPress: async () => {
              try {
                const { supabaseService } = await import('../services/supabase');
                const currentUserId = 'd31adacf-886d-4198-859c-2c36695e644c';
                
                const success = await supabaseService.joinEvent(event.id, currentUserId);
                if (success) {
                  Alert.alert('Success', 'You have joined the event!');
                } else {
                  Alert.alert('Error', 'Failed to join event. Please try again.');
                }
              } catch (error) {
                console.error('Error joining event:', error);
                Alert.alert('Error', 'Failed to join event. Please try again.');
              }
            }
          }
        ]
      );
    }
  };

  if (!location && !initialLocation) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={mapRegion}
        onPress={handleMapPress}
        onLongPress={handleMapLongPress}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
      >
        {/* User location marker */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            description="You are here"
            pinColor="blue"
          />
        )}

        {/* Event markers */}
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude,
            }}
            title={event.name}
            description={`${event.activity} • ${event.participants_count}/${event.max_participants} participants`}
            onPress={() => handleEventPress(event)}
            pinColor="#FDB924"
          />
        ))}
      </MapView>

      {/* Place Details Modal */}
      <Modal
        visible={showPlaceDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPlaceDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.placeDetailsModal}>
            <View style={styles.placeDetailsHeader}>
              <Text style={styles.placeDetailsTitle}>Place Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPlaceDetails(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {placeDetails && (
              <View style={styles.placeDetailsContent}>
                <Text style={styles.placeName}>{placeDetails.name}</Text>
                <Text style={styles.placeAddress}>{placeDetails.address}</Text>
                
                {placeDetails.rating && (
                  <Text style={styles.placeRating}>
                    ⭐ {placeDetails.rating}/5
                  </Text>
                )}
                
                {placeDetails.phoneNumber && (
                  <Text style={styles.placeInfo}>
                    📞 {placeDetails.phoneNumber}
                  </Text>
                )}
                
                {placeDetails.website && (
                  <Text style={styles.placeInfo}>
                    🌐 {placeDetails.website}
                  </Text>
                )}
                
                <View style={styles.placeActions}>
                  <TouchableOpacity
                    style={styles.createEventButton}
                    onPress={() => {
                      setShowPlaceDetails(false);
                      onLocationSelect?.({
                        latitude: placeDetails.coordinates.lat,
                        longitude: placeDetails.coordinates.lng
                      });
                    }}
                  >
                    <Text style={styles.createEventButtonText}>Create Event Here</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  eventMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    backgroundColor: '#FDB924',
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  eventEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  eventInfo: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: 'white',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDB924',
  },
  eventParticipants: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
  },
  // Place Details Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeDetailsModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  placeDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  placeDetailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: 'bold',
  },
  placeDetailsContent: {
    padding: 20,
  },
  placeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  placeAddress: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  placeRating: {
    fontSize: 16,
    color: '#FDB924',
    marginBottom: 8,
  },
  placeInfo: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  placeActions: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  createEventButton: {
    backgroundColor: '#FDB924',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  createEventButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});