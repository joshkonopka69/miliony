import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDialog } from '../contexts/DialogContext';
import ExpoGoMap from './ExpoGoMap';

export default function MapDiagnostic() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialog = useDialog();

  const handleMapReady = () => {
    setMapLoaded(true);
    console.log('✅ Map loaded successfully!');
  };

  const handleMapError = (error: any) => {
    setError(error.message || 'Unknown map error');
    console.error('❌ Map error:', error);
  };

  const testMap = () => {
    dialog.showInfo(
      'Map Diagnostic',
      `Map Loaded: ${mapLoaded ? '✅ Yes' : '❌ No'}\nError: ${error || 'None'}`
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
        <ExpoGoMap />
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

