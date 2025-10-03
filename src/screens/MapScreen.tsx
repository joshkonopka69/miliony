import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../navigation/hooks';
import { ROUTES } from '../navigation/types';
import { BottomNavBar } from '../components';
import EnhancedInteractiveMap from '../components/EnhancedInteractiveMap';
import { useTranslation } from '../contexts/TranslationContext';
import { theme } from '../styles/theme';
import * as Location from 'expo-location';
import DebugNavigation from '../components/DebugNavigation';

export default function MapScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const [showEventModal, setShowEventModal] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t.map.permissionDenied, t.map.locationAccessNeeded);
      }
    })();
  }, []);

  const handleLocationPermissionGranted = () => {
    console.log('Location permission granted');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <EnhancedInteractiveMap
        onMapReady={(ref) => {
          mapRef.current = ref;
        }}
        onLocationPermissionGranted={handleLocationPermissionGranted}
      />

      {/* Top Action Bar */}
      <View style={styles.topActionBar}>
        {/* My Location Button */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => {
            // Center map on user location
            console.log('Center on user location');
          }}
        >
          <Ionicons name="navigate" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        {/* Search Button */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.searchButton]} 
          onPress={() => {
            // Open search functionality
            console.log('Open search');
          }}
        >
          <Ionicons name="search" size={20} color="white" />
          <Text style={styles.searchText}>Search Events</Text>
        </TouchableOpacity>

        {/* Settings Button */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate(ROUTES.SETTINGS)}
        >
          <Ionicons name="settings-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Debug Navigation Button - Bottom Right */}
      <TouchableOpacity
        style={styles.debugButton}
        onPress={() => navigation.navigate(ROUTES.BACKEND_TEST)}
      >
        <Ionicons name="build" size={20} color="white" />
      </TouchableOpacity>

      <BottomNavBar 
        activeTab="Home"
        onProfilePress={() => navigation.navigate(ROUTES.PROFILE)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  topActionBar: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
    gap: 12,
  },
  actionButton: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  debugButton: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    width: 48,
    height: 48,
    backgroundColor: theme.colors.accent,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
});