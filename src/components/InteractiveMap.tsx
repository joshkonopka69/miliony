import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Platform, TouchableOpacity } from 'react-native';
import ExpoGoMap from './ExpoGoMap';
import * as Location from 'expo-location';

interface SportLocation {
  id: string;
  name: string;
  sport: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  description: string;
  rating: number;
  icon: string;
  type: 'stadium' | 'court' | 'pool' | 'track' | 'gym' | 'field';
  facilities: string[];
  price: string;
  hours: string;
}

interface InteractiveMapProps {
  onLocationSelect?: (location: SportLocation) => void;
  searchQuery?: string;
  onMapReady?: (mapRef: React.RefObject<MapView>) => void;
  onLocationPermissionGranted?: () => void;
}

// Enhanced sports locations data
const sportsLocations: SportLocation[] = [
  {
    id: '1',
    name: 'Central Park Football Field',
    sport: 'Football',
    coordinate: { latitude: 40.7829, longitude: -73.9654 },
    description: 'Professional football field with lighting and seating',
    rating: 4.5,
    icon: '⚽',
    type: 'field',
    facilities: ['Lighting', 'Parking', 'Restrooms', 'Water Fountains'],
    price: 'Free',
    hours: '6:00 AM - 10:00 PM',
  },
  {
    id: '2',
    name: 'Downtown Basketball Court',
    sport: 'Basketball',
    coordinate: { latitude: 40.7589, longitude: -73.9851 },
    description: 'Outdoor basketball court with multiple hoops',
    rating: 4.2,
    icon: '🏀',
    type: 'court',
    facilities: ['Multiple Hoops', 'Benches', 'Water Fountains'],
    price: 'Free',
    hours: '24/7',
  },
  {
    id: '3',
    name: 'Aquatic Center Pool',
    sport: 'Swimming',
    coordinate: { latitude: 40.7505, longitude: -73.9934 },
    description: 'Olympic-size swimming pool with diving boards',
    rating: 4.8,
    icon: '🏊',
    type: 'pool',
    facilities: ['Olympic Pool', 'Diving Boards', 'Locker Rooms', 'Sauna'],
    price: '$15/day',
    hours: '5:00 AM - 9:00 PM',
  },
  {
    id: '4',
    name: 'Riverside Tennis Club',
    sport: 'Tennis',
    coordinate: { latitude: 40.7614, longitude: -73.9776 },
    description: 'Professional tennis courts with coaching available',
    rating: 4.6,
    icon: '🎾',
    type: 'court',
    facilities: ['8 Courts', 'Pro Shop', 'Coaching', 'Restaurant'],
    price: '$25/hour',
    hours: '6:00 AM - 11:00 PM',
  },
  {
    id: '5',
    name: 'Metro Fitness Center',
    sport: 'Gym',
    coordinate: { latitude: 40.7505, longitude: -73.9934 },
    description: 'Full-service gym with modern equipment',
    rating: 4.3,
    icon: '🏋️',
    type: 'gym',
    facilities: ['Cardio', 'Weights', 'Classes', 'Personal Training'],
    price: '$50/month',
    hours: '5:00 AM - 12:00 AM',
  },
  {
    id: '6',
    name: 'Central Park Running Track',
    sport: 'Running',
    coordinate: { latitude: 40.7851, longitude: -73.9683 },
    description: 'Professional running track with scenic views',
    rating: 4.7,
    icon: '🏃',
    type: 'track',
    facilities: ['400m Track', 'Water Stations', 'Stretching Area'],
    price: 'Free',
    hours: '5:00 AM - 11:00 PM',
  },
];

export default function InteractiveMap({ onLocationSelect, searchQuery, onMapReady, onLocationPermissionGranted }: InteractiveMapProps) {
  const [sportsLocationsData, setSportsLocationsData] = useState<SportLocation[]>(sportsLocations);
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Default region (New York City)
  const initialRegion: Region = {
    latitude: 40.7589,
    longitude: -73.9851,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  useEffect(() => {
    // Check if we already have permission
    checkExistingPermission();
  }, []);

  const checkExistingPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      console.log('🔍 Existing permission status:', status);
      
      if (status === 'granted') {
        console.log('✅ Location permission already granted');
        setHasLocationPermission(true);
        getCurrentLocation();
      } else {
        console.log('❌ No location permission, will request when needed');
      }
    } catch (err) {
      console.warn('Permission check error:', err);
    }
  };

  useEffect(() => {
    if (onMapReady && mapRef && mapRef.current) {
      onMapReady(mapRef);
    }
  }, [onMapReady]);

  const requestLocationPermission = async () => {
    try {
      console.log('🔍 Requesting location permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('📍 Permission status:', status);
      
      if (status === 'granted') {
        console.log('✅ Location permission granted!');
        setHasLocationPermission(true);
        getCurrentLocation();
        if (onLocationPermissionGranted) {
          onLocationPermissionGranted();
        }
      } else {
        console.log('❌ Location permission denied');
        Alert.alert('Permission denied', 'Location permission is required to show nearby sports facilities.');
      }
    } catch (err) {
      console.error('🚨 Location permission error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Error', `Failed to request location permission: ${errorMessage}`);
    }
  };

  const getCurrentLocation = async () => {
    try {
      console.log('🌍 Getting current location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 60000,
      });
      
      console.log('📍 Location received:', location.coords);
      const { latitude, longitude } = location.coords;
      const newRegion: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      console.log('🗺️ Setting user location region:', newRegion);
      setUserLocation(newRegion);
      
      // Animate to user location
      if (mapRef.current) {
        console.log('🎯 Animating to user location...');
        mapRef.current.animateToRegion(newRegion, 1000);
      } else {
        console.log('⚠️ Map ref not available');
      }
    } catch (error) {
      console.error('🚨 Location error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Location Error', `Unable to get your current location: ${errorMessage}`);
    }
  };

  const handleMarkerPress = (location: SportLocation) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const handleRegionChangeComplete = (region: Region) => {
    // You could implement location-based filtering here
    console.log('Map region changed:', region);
  };

  // Filter locations based on search query
  const filteredLocations = searchQuery
    ? sportsLocationsData.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sportsLocationsData;

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'field': return '#4CAF50'; // Green
      case 'court': return '#FF9800'; // Orange
      case 'pool': return '#2196F3'; // Blue
      case 'gym': return '#9C27B0'; // Purple
      case 'track': return '#F44336'; // Red
      default: return '#FFE600'; // Yellow
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        userLocationAnnotationTitle="You are here"
        followsUserLocation={hasLocationPermission}
        userLocationPriority="high"
        showsCompass={true}
        showsScale={true}
        onRegionChangeComplete={handleRegionChangeComplete}
        mapType="standard"
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="You are here"
            description="Your current location"
            pinColor="#007AFF"
          >
            <View style={styles.userLocationMarker}>
              <View style={styles.userLocationDot} />
              <View style={styles.userLocationPulse} />
            </View>
          </Marker>
        )}

        {/* Sports Location Markers */}
        {filteredLocations.map((location) => (
          <Marker
            key={location.id}
            coordinate={location.coordinate}
            title={location.name}
            description={`${location.sport} • ${location.rating}⭐ • ${location.price}`}
            pinColor={getMarkerColor(location.type)}
            onPress={() => handleMarkerPress(location)}
          >
            <Callout style={styles.callout}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{location.name}</Text>
                <Text style={styles.calloutSport}>{location.sport}</Text>
                <Text style={styles.calloutDescription}>{location.description}</Text>
                <View style={styles.calloutDetails}>
                  <Text style={styles.calloutRating}>⭐ {location.rating}/5</Text>
                  <Text style={styles.calloutPrice}>{location.price}</Text>
                </View>
                <Text style={styles.calloutHours}>🕒 {location.hours}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Location Permission Button */}
      {!hasLocationPermission && (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>📍 Enable Location</Text>
          <Text style={styles.permissionText}>
            Allow location access to find nearby sports facilities and show your current position on the map.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={requestLocationPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.permissionButtonText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Location Status Indicator */}
      {hasLocationPermission && userLocation && (
        <View style={styles.locationStatusContainer}>
          <Text style={styles.locationStatusText}>📍 Location enabled</Text>
        </View>
      )}
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
  callout: {
    width: 250,
    height: 120,
  },
  calloutContainer: {
    flex: 1,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  calloutSport: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  calloutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  calloutRating: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  calloutPrice: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  calloutHours: {
    fontSize: 11,
    color: '#999',
  },
  permissionContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  permissionTitle: {
    color: '#1F2937',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  permissionText: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: '#ffd400',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  locationStatusContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    padding: 12,
    borderRadius: 10,
    alignSelf: 'center',
  },
  locationStatusText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  userLocationMarker: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  userLocationPulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.5)',
  },
});
