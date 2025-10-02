import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ExpoGoMap from './ExpoGoMap';

export default function MapFallback() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺️ Map Fallback Test</Text>
      <MapView
        style={styles.map}
        // No provider specified - uses default
        initialRegion={{
          latitude: 40.7589,
          longitude: -73.9851,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onMapReady={() => console.log('✅ Fallback map ready!')}
      />
      <View style={styles.status}>
        <Text style={styles.statusText}>Testing map without Google provider</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  map: {
    flex: 1,
  },
  status: {
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
});

