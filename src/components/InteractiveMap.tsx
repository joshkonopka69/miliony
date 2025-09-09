import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Callout } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

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

export default function InteractiveMap({ onLocationSelect, searchQuery, onMapReady }: InteractiveMapProps) {
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
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (onMapReady && mapRef) {
      onMapReady(mapRef);
    }
  }, [onMapReady]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show nearby sports facilities.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasLocationPermission(true);
          getCurrentLocation();
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      // iOS
      Geolocation.requestAuthorization('whenInUse').then((result) => {
        if (result === 'granted') {
          setHasLocationPermission(true);
          getCurrentLocation();
        }
      });
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newRegion: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setUserLocation(newRegion);
        
        // Animate to user location
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      },
      (error) => {
        console.log('Location error:', error);
        Alert.alert('Location Error', 'Unable to get your current location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
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
        showsUserLocation={hasLocationPermission}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onRegionChangeComplete={handleRegionChangeComplete}
        mapType="standard"
      >
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
          <Text style={styles.permissionText}>
            Enable location to find nearby sports facilities
          </Text>
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 15,
    borderRadius: 10,
  },
  permissionText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
});
