import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useAppNavigation } from '../navigation';
import { BottomNavBar, InteractiveMap, EventCreationModal } from '../components';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

export default function MapScreen() {
  const navigation = useAppNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const mapRef = useRef<MapView>(null);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((camera) => {
        // Fix: Ensure camera.zoom is a number before incrementing
        if (typeof camera.zoom === 'number') {
          mapRef.current?.animateCamera({
            center: camera.center,
            zoom: camera.zoom + 1,
          });
        } else {
          // If zoom is not available, use a default value
          mapRef.current?.animateCamera({
            center: camera.center,
            zoom: 10,
          });
        }
      });
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((camera) => {
        // Fix: Ensure camera.zoom is a number before decrementing
        if (typeof camera.zoom === 'number') {
          mapRef.current?.animateCamera({
            center: camera.center,
            zoom: camera.zoom - 1,
          });
        } else {
          // If zoom is not available, use a default value
          mapRef.current?.animateCamera({
            center: camera.center,
            zoom: 10,
          });
        }
      });
    }
  };


  const handleSettings = () => {
    // Navigate to Settings screen
    navigation.navigate('Settings');
  };

  const handleFloatingSearch = () => {
    // Handle floating search button
    console.log('Floating search for:', searchQuery);
  };

  const handleLocationSelect = (location: any) => {
    console.log('Selected location:', location);
    // Here you could navigate to location details, show directions, etc.
  };

  const handleCreateEvent = (eventData: any) => {
    console.log('Event created:', eventData);
    // Here you would typically save the event to your backend/database
    // For now, we'll just log it and show a success message
    Alert.alert('Success', 'Event created successfully!');
  };

  const handleAddPress = () => {
    console.log('🔵 Add button pressed!');
    console.log('🔵 Current modal state:', showEventModal);
    setShowEventModal(true);
    console.log('🔵 Modal state set to true');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
            {/* Map with Enhanced Diagnostics */}
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: 40.7589,
                longitude: -73.9851,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              showsUserLocation={false}
              showsMyLocationButton={false}
              onMapReady={() => {
                console.log('✅ Map is ready!');
                console.log('✅ Google Maps API Key configured');
              }}
              onLayout={() => console.log('📐 Map layout complete')}
              loadingEnabled={true}
              loadingIndicatorColor="#ffd400"
              loadingBackgroundColor="#ffffff"
            />

      {/* Search Bar Overlay */}
      <View style={styles.searchOverlay}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for sports, clubs, places"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6B7280"
          />
        </View>
      </View>

      {/* Settings Button Overlay - Top Left */}
      <View style={styles.settingsOverlay}>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={handleSettings}
          activeOpacity={0.8}
        >
          <Text style={styles.controlIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Test Modal Button - Temporary for debugging */}
      {__DEV__ && (
        <View style={styles.testButtonOverlay}>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => {
              console.log('🧪 Test button pressed - forcing modal to show');
              setShowEventModal(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.testButtonText}>TEST</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map Controls Overlay */}
      <View style={styles.controlsOverlay}>
        {/* Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.zoomInButton]}
            onPress={handleZoomIn}
            activeOpacity={0.8}
          >
            <Text style={styles.controlIcon}>➕</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.controlButton, styles.zoomOutButton]}
            onPress={handleZoomOut}
            activeOpacity={0.8}
          >
            <Text style={styles.controlIcon}>➖</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Bottom Navigation */}
      <BottomNavBar 
        activeTab="Map"
        onAddPress={handleAddPress}
      />

      {/* Event Creation Modal */}
      <EventCreationModal
        visible={showEventModal}
        onClose={() => {
          console.log('🔴 Modal closing');
          setShowEventModal(false);
        }}
        onCreateEvent={handleCreateEvent}
      />
      
      {/* Debug Info */}
      {__DEV__ && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>Modal State: {showEventModal ? 'TRUE' : 'FALSE'}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  map: {
    flex: 1,
  },
  searchOverlay: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  settingsOverlay: {
    position: 'absolute',
    top: 120,
    left: 16,
    zIndex: 10,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 120,
    right: 16,
    zIndex: 10,
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  searchIcon: {
    fontSize: 20,
    color: '#6B7280',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  zoomControls: {
    flexDirection: 'column',
  },
  controlButton: {
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  zoomInButton: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  zoomOutButton: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  settingsButton: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  controlIcon: {
    fontSize: 18,
    color: '#1F2937',
  },
  debugInfo: {
    position: 'absolute',
    top: 200,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 4,
    zIndex: 1000,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  testButtonOverlay: {
    position: 'absolute',
    top: 180,
    left: 16,
    zIndex: 10,
  },
  testButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

