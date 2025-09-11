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
import { WebView } from 'react-native-webview';
import { useAppNavigation } from '../navigation';
import { BottomNavBar, EventCreationModal } from '../components';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

// --- Google Maps HTML for WebView ---
const getGoogleMapsHTML = (apiKey: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; overflow: hidden; }
        #map { width: 100%; height: 100vh; }
        .loading {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255,255,255,0.9); padding: 20px;
            border-radius: 10px; text-align: center; z-index: 1000;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <div id="loading" class="loading">
        <h3>🗺️ Loading Google Maps...</h3>
    </div>

    <script>
        let map;
        let userMarker;

        function initMap() {
            try {
                document.getElementById('loading').style.display = 'none';
                if (typeof google === 'undefined' || !google.maps) {
                    throw new Error('Google Maps API not loaded');
                }
                map = new google.maps.Map(document.getElementById('map'), {
                    center: { lat: 40.7589, lng: -73.9851 },
                    zoom: 12,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    disableDefaultUI: true,
                });
                
                addDefaultMarkers();

                postMessageToReactNative({ type: 'map_ready' });
                console.log('✅ Google Maps initialized successfully!');
                
                // Automatically find user's location on load
                findUserLocation();
            } catch (error) {
                console.error('❌ Google Maps error:', error);
                postMessageToReactNative({ type: 'map_error', error: error.message });
            }
        }

        function addDefaultMarkers() {
            const defaultLocations = [
                { lat: 40.7829, lng: -73.9654, title: 'Central Park' },
                { lat: 40.7580, lng: -73.9855, title: 'Times Square' },
                { lat: 40.7061, lng: -73.9969, title: 'Brooklyn Bridge' }
            ];
            defaultLocations.forEach(loc => {
                new google.maps.Marker({ position: loc, map: map, title: loc.title });
            });
        }
        
        function postMessageToReactNative(message) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify(message));
            }
        }

        
        function findUserLocation() {
            postMessageToReactNative({ type: 'locating_started' });
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
                    if (userMarker) userMarker.setMap(null); // Remove old marker
                    
                    // A more prominent blue circle for the user's location
                    userMarker = new google.maps.Marker({
                        position: userLocation,
                        map: map,
                        title: 'Your Location',
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10, // Larger
                            fillColor: '#4285F4',
                            fillOpacity: 1,
                            strokeColor: 'white',
                            strokeWeight: 3 // Thicker border
                        }
                    });

                    map.setCenter(userLocation);
                    map.setZoom(15);
                    postMessageToReactNative({ type: 'user_location', location: userLocation });
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    postMessageToReactNative({ type: 'location_error', error: error.message });
                },
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
        }

        

    </script>
    <script async defer
        src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap">
    </script>
</body>
</html>
`;

export default function MapScreen() {
  const navigation = useAppNavigation();
  const [showEventModal, setShowEventModal] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const webViewRef = useRef<WebView>(null);
    
    const GOOGLE_MAPS_API_KEY = "AIzaSyAc8dM1yogG1P4TzKr_xUn9ycs9BfrXA4g"; // This is the correct key for Maps, Places, and Geocoding.
    const mapHtml = getGoogleMapsHTML(GOOGLE_MAPS_API_KEY);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location access is needed to show your position on the map.');
            }
        })();
    }, []);

    
    const handleWebViewMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            switch (data.type) {
                case 'map_ready':
                    setMapLoaded(true);
                    console.log('✅ Map is ready!');
                    break;
                case 'map_error':
                    setMapLoaded(false);
                    Alert.alert('Map Error', data.error);
                    break;
                case 'user_location':
                    console.log('User location found:', data.location);
                    break;
            }
        } catch (error) {
            console.error('Error handling WebView message:', error);
        }
  };

  return (
    <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.mapContainer}>
                <WebView
                    ref={webViewRef}
              style={styles.map}
                    source={{ html: mapHtml }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    onMessage={handleWebViewMessage}
                    onError={(error) => console.error('WebView Error:', error)}
                    geolocationEnabled={true}
                />
                {!mapLoaded && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#4285F4" />
                        <Text style={styles.loadingText}>Loading Map...</Text>
                    </View>
                )}
            </View>

            {/* Settings Button */}
            <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
                <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>

            {/* Event Creation Modal & Bottom Nav */}
            <EventCreationModal
                visible={showEventModal}
                onClose={() => setShowEventModal(false)}
                onCreateEvent={() => {}}
            />
      <BottomNavBar 
        activeTab="Map"
                onAddPress={() => setShowEventModal(true)}
            />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    mapContainer: { flex: 1 },
    map: { flex: 1 },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    loadingText: { marginTop: 10, fontSize: 16, color: '#333' },
    settingsButton: {
        position: 'absolute', right: 20, top: 60,
        width: 50, height: 50, backgroundColor: 'white', borderRadius: 8,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, zIndex: 10,
    },
    settingsIcon: { fontSize: 20 },
});