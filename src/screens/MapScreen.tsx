import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../navigation/hooks';
import { ROUTES } from '../navigation/types';
import { BottomNavBar } from '../components';
import EnhancedInteractiveMap from '../components/EnhancedInteractiveMap';
import { useTranslation } from '../contexts/TranslationContext';
import * as Location from 'expo-location';

// Simple Logo Component
const SportMapLogo = () => (
  <View style={styles.logoContainer}>
    <View style={styles.logoCircle}>
      <Text style={styles.logoText}>SM</Text>
    </View>
    <Text style={styles.logoTitle}>SportMap</Text>
  </View>
);

export default function MapScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const [showFilterModal, setShowFilterModal] = useState(false);
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

  const handleFilterPress = () => {
    setShowFilterModal(true);
    // TODO: Open filter modal
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Map - Full Screen (underneath top bar) */}
      <EnhancedInteractiveMap
        onMapReady={(ref) => {
          mapRef.current = ref;
        }}
        onLocationPermissionGranted={handleLocationPermissionGranted}
        hideControls={true}
      />

      {/* Clean Top Bar - Overlaid */}
      <SafeAreaView style={styles.topBarSafeArea}>
        <View style={styles.topBar}>
          {/* Logo on Left */}
          <SportMapLogo />

          {/* Action Buttons on Right */}
          <View style={styles.topBarActions}>
            <TouchableOpacity 
              style={styles.topBarButton} 
              onPress={handleFilterPress}
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={24} color="#000000" />
            </TouchableOpacity>

          <TouchableOpacity 
            style={styles.topBarButton} 
            onPress={() => navigation.navigate(ROUTES.SETTINGS)}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>

    {/* Bottom Navigation */}
    <View style={styles.bottomNavContainer}>
      <BottomNavBar 
        activeTab="Home"
        onProfilePress={() => navigation.navigate(ROUTES.PROFILE)}
      />
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
  },
  // Top Bar Safe Area Wrapper
  topBarSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    // Enhanced shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
  },
  // Top Bar Styles (taller and more prominent)
  topBar: {
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  // Logo Styles (larger)
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FDB924', // Yellow
    justifyContent: 'center',
    alignItems: 'center',
    // Slight shadow on logo
    shadowColor: '#FDB924',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.3,
  },
  // Action Buttons on Right
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  // Bottom Nav Container
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});