import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import ExpoGoMap from './ExpoGoMap';

export default function MapDiagnostic() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMapReady = () => {
    setMapLoaded(true);
    console.log('✅ Map loaded successfully!');
  };

  const handleMapError = (error: any) => {
    setError(error.message || 'Unknown map error');
    console.error('❌ Map error:', error);
  };

  const testMap = () => {
    Alert.alert(
      'Map Diagnostic',
      `Map Loaded: ${mapLoaded ? '✅ Yes' : '❌ No'}\nError: ${error || 'None'}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ Map Diagnostic</Text>
        <TouchableOpacity style={styles.testButton} onPress={testMap}>
          <Text style={styles.testButtonText}>Test Map</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: 40.7589,
            longitude: -73.9851,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onMapReady={handleMapReady}
          showsUserLocation={false}
          showsMyLocationButton={false}
        />
      </View>
      
      <View style={styles.status}>
        <Text style={styles.statusText}>
          Status: {mapLoaded ? '✅ Map Loaded' : '⏳ Loading...'}
        </Text>
        {error && (
          <Text style={styles.errorText}>
            Error: {error}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  status: {
    padding: 15,
    backgroundColor: '#f8f8f8',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    marginTop: 5,
  },
});

