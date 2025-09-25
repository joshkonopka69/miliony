import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAppNavigation } from '../navigation';
import { BottomNavBar } from '../components';
import EnhancedInteractiveMap from '../components/EnhancedInteractiveMap';
import * as Location from 'expo-location';

export default function MapScreen() {
  const navigation = useAppNavigation();
  const [showEventModal, setShowEventModal] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is needed to show your position on the map.');
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

      {/* Settings Button */}
      <TouchableOpacity 
        style={styles.settingsButton} 
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.settingsIcon}>⚙️</Text>
      </TouchableOpacity>

      <BottomNavBar 
        activeTab="Home"
        onAddPress={() => setShowEventModal(true)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  settingsButton: {
    position: 'absolute', 
    right: 20, 
    top: 60,
    width: 50, 
    height: 50, 
    backgroundColor: 'white', 
    borderRadius: 8,
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3, 
    zIndex: 10,
  },
  settingsIcon: { 
    fontSize: 20 
  },
});