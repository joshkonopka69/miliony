import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';

interface ExpoGoMapProps {
  onLocationSelect?: (location: { latitude: number; longitude: number }) => void;
  searchQuery?: string;
}

export default function ExpoGoMap({ onLocationSelect, searchQuery }: ExpoGoMapProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const handleLocationPress = () => {
    if (location) {
      onLocationSelect?.({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    }
  };

  const openMapsApp = () => {
    if (location) {
      const url = `https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;
      Alert.alert(
        'Open in Maps',
        'This will open your device\'s default maps app',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open', onPress: () => console.log('Opening maps:', url) }
        ]
      );
    }
  };

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapTitle}>🗺️ Map View</Text>
        <Text style={styles.coordinates}>
          Lat: {location.coords.latitude.toFixed(6)}
        </Text>
        <Text style={styles.coordinates}>
          Lng: {location.coords.longitude.toFixed(6)}
        </Text>
        
        {searchQuery && (
          <Text style={styles.searchText}>
            Searching for: {searchQuery}
          </Text>
        )}
        
        <TouchableOpacity style={styles.button} onPress={handleLocationPress}>
          <Text style={styles.buttonText}>Use Current Location</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={openMapsApp}>
          <Text style={styles.buttonText}>Open in Maps App</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f4f8',
    margin: 10,
    borderRadius: 10,
    padding: 20,
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  coordinates: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 5,
  },
  searchText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 10,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    padding: 20,
  },
});


