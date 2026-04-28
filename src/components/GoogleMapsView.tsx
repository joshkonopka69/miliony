import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useDialog } from '../contexts/DialogContext';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

// MapEvent interface for event markers
interface MapEvent {
  id: string;
  name: string;
  activity: string;
  latitude: number;
  longitude: number;
  participants_count: number;
  max_participants: number;
  status: 'live' | 'past' | 'cancelled' | 'active'; // Added 'active' status
  created_at: string;
}

interface GoogleMapsViewProps {
  onPlaceSelect?: (place: any) => void;
  onLocationSelect?: (location: { latitude: number; longitude: number }) => void;
  onLocationLongPress?: (location: { latitude: number; longitude: number }) => void;
  onEventSelect?: (event: any) => void; // Handler for custom event marker clicks
  searchQuery?: string;
  initialLocation?: { latitude: number; longitude: number };
  events?: MapEvent[]; // Events to display as markers
  places?: any[]; // Venue places to display as markers
  highlightMarkers?: boolean; // Highlight markers when filters are active
}

const { width, height } = Dimensions.get('window');

// Helper function to get sport emoji
const getSportEmoji = (activity: string): string => {
  const emojiMap: Record<string, string> = {
    basketball: '🏀',
    football: '⚽',
    soccer: '⚽',
    running: 'walk-outline‍♂️',
    tennis: '🎾',
    cycling: 'bicycle-outline‍♂️',
    swimming: 'water-outline‍♂️',
    gym: '💪',
    volleyball: '🏐',
    climbing: 'trending-up-outline‍♂️',
    yoga: '🧘',
    badminton: '🏸',
    baseball: '⚾',
    golf: 'golf-outline',
    hockey: '🏒',
  };
  return emojiMap[activity.toLowerCase()] || 'walk-outline';
};

export default function GoogleMapsView({
  onPlaceSelect,
  onLocationSelect,
  onLocationLongPress,
  onEventSelect,
  searchQuery,
  initialLocation,
  events = [], // Default to empty array
  places = [], // Default to empty array
  highlightMarkers = false
}: GoogleMapsViewProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [mapHtml, setMapHtml] = useState<string>('');
  const webViewRef = useRef<WebView>(null);
  const dialog = useDialog();

  // Track if map is initialized to avoid redundant reloads
  const mapInitialized = useRef(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Update markers when places or events change without reloading the whole map
  useEffect(() => {
    if (mapInitialized.current && webViewRef.current) {
      console.log('🗺️ GoogleMapsView: Updating markers dynamically');
      const venuesJson = JSON.stringify(places).replace(/`/g, '\\`').replace(/\$/g, '\\$');
      const eventsJson = JSON.stringify(events).replace(/`/g, '\\`').replace(/\$/g, '\\$');

      const script = `
        if (typeof updateVenueMarkers === 'function') {
          updateVenueMarkers(${venuesJson}, ${highlightMarkers});
        }
        if (typeof updateEventMarkers === 'function') {
          updateEventMarkers(${eventsJson}, ${highlightMarkers});
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [places, events]);

  // Only reload the entire HTML if the center changes significantly or for initial load
  useEffect(() => {
    if (location && !mapInitialized.current) {
      generateMapHtml();
      mapInitialized.current = true;
    }
  }, [location]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        dialog.showInfo('Permission Denied', 'Location access is needed to show your position on the map.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      // Don't call onLocationSelect here - it's only for when user actively selects a place
      // onLocationSelect is for filtered locations/place markers, not initial user location
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const generateMapHtml = () => {
    const lat = initialLocation?.latitude || location?.coords.latitude || 51.1079;
    const lng = initialLocation?.longitude || location?.coords.longitude || 17.0385;
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    console.log('🗺️ GoogleMapsView: Generating map HTML with API key:', apiKey ? '✅ Loaded' : '❌ Missing');
    console.log('🗺️ GoogleMapsView: Map center:', { lat, lng });
    console.log('🗺️ GoogleMapsView: Events count:', events.length);
    console.log('🗺️ GoogleMapsView: Places count:', places.length);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { 
            margin: 0; 
            padding: 0; 
            height: 100%; 
            width: 100%;
            overflow: hidden;
          }
          #map { 
            height: 100vh; 
            width: 100vw; 
            position: absolute;
            top: 0;
            left: 0;
          }
          .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            font-family: Arial, sans-serif;
          }
          .error {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            background: #ffebee;
            color: #c62828;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            font-family: Arial, sans-serif;
            max-width: 300px;
            text-align: center;
          }
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 10px #FFD700; }
            50% { transform: scale(1.08); box-shadow: 0 0 25px #FFD700, 0 0 10px #FFD700; }
            100% { transform: scale(1); box-shadow: 0 0 10px #FFD700; }
          }
        </style>
      </head>
      <body>
        <div class="loading" id="loading">Loading map...</div>
        <div id="map"></div>
        <script>
          // Immediate log to confirm script execution
          console.log('🗺️ WebView: Script loading...');
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'log',
            message: '🗺️ WebView: Script execution started'
          }));

          let map;
          let service;
          let infowindow;
          let markers = [];
          
          function initMap() {
            // Send log to React Native
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: 'log',
              message: '🗺️ WebView: Initializing map...'
            }));
            
            const center = { lat: ${lat}, lng: ${lng} };
            
            try {
              map = new google.maps.Map(document.getElementById("map"), {
                zoom: 15,
                center: center,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapId: 'c88fb0e8effe04d0c29944aa',
                clickableIcons: false,
                disableDefaultUI: true,
                styles: [
                  { "featureType": "all", "elementType": "labels.text", "stylers": [{ "color": "#fffe00" }] },
                  { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "saturation": 36 }, { "color": "#000000" }, { "lightness": 40 }] },
                  { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "visibility": "on" }, { "color": "#0b0b0b" }, { "lightness": 16 }] },
                  { "featureType": "all", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
                  { "featureType": "administrative", "elementType": "all", "stylers": [{ "color": "#fffe00" }] },
                  { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#000000" }, { "lightness": 20 }] },
                  { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#000000" }, { "lightness": 17 }, { "weight": 1.2 }] },
                  { "featureType": "administrative", "elementType": "labels.text.stroke", "stylers": [{ "color": "#000000" }] },
                  { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#444435" }] },
                  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#000000" }, { "lightness": 20 }] },
                  { "featureType": "landscape", "elementType": "labels.text.stroke", "stylers": [{ "color": "#000000" }] },
                  { "featureType": "landscape.man_made", "elementType": "geometry", "stylers": [{ "color": "#181414" }] },
                  { "featureType": "landscape.natural", "elementType": "all", "stylers": [{ "color": "#242421" }] },
                  { "featureType": "landscape.natural", "elementType": "labels.text.stroke", "stylers": [{ "color": "#000000" }] },
                  { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] },
                  { "featureType": "road", "elementType": "all", "stylers": [{ "color": "#6a6a53" }] },
                  { "featureType": "road", "elementType": "geometry", "stylers": [{ "visibility": "on" }, { "color": "#5c4b4b" }] },
                  { "featureType": "road", "elementType": "labels.text", "stylers": [{ "color": "#f5f2f2" }] },
                  { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#847f7f" }, { "lightness": 16 }] },
                  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#badff6" }, { "lightness": 17 }] }
                ]
              });
              
              window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'log',
                message: '🗺️ WebView: Map instance created. Map ID: ' + map.mapId + '. Marker library check: ' + (google.maps.marker ? '✅ Loaded' : '❌ NOT Loaded')
              }));
              
              // Send log to React Native
              window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'log',
                message: '🗺️ WebView: Map created successfully!'
              }));
              
              // Hide loading indicator
              const loading = document.getElementById('loading');
              if (loading) {
                loading.style.display = 'none';
              }
              
              infowindow = new google.maps.InfoWindow();
              service = new google.maps.places.PlacesService(map);
            
            // Add user location marker
            new google.maps.Marker({
              position: center,
              map: map,
              title: "Your Location",
              icon: {
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(\`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="white"/>
                  </svg>
                \`),
                scaledSize: new google.maps.Size(24, 24)
              }
            });
            
            // Create venue markers from passed places data
            try {
              if (typeof createVenueMarkers === 'function') {
                createVenueMarkers();
              }
            } catch (e) {
              console.error('Error creating venue markers:', e);
            }
            
            // Add event markers
            try {
              if (typeof createEventMarkers === 'function') {
                createEventMarkers();
              }
            } catch (e) {
              console.error('Error creating event markers:', e);
            }
            
            // Add LONG-PRESS listener for map (5 seconds of calm holding)
            let longPressTimer = null;
            let longPressPosition = null;
            let longPressStartCoords = null;
            const LONG_PRESS_DURATION = 5000; // 5 seconds
            const MOVEMENT_TOLERANCE = 10; // pixels - allow small finger drift
            
            // Helper to calculate pixel distance
            function getPixelDistance(latLng1, latLng2) {
              if (!latLng1 || !latLng2) return Infinity;
              const projection = map.getProjection();
              if (!projection) return Infinity;
              const p1 = projection.fromLatLngToPoint(latLng1);
              const p2 = projection.fromLatLngToPoint(latLng2);
              const scale = Math.pow(2, map.getZoom());
              return Math.sqrt(Math.pow((p1.x - p2.x) * scale, 2) + Math.pow((p1.y - p2.y) * scale, 2));
            }
            
            function cancelLongPress() {
              if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
              }
              longPressPosition = null;
              longPressStartCoords = null;
            }
            
            map.addListener('mousedown', (event) => {
              cancelLongPress(); // Cancel any existing timer
              longPressPosition = event.latLng;
              longPressStartCoords = event.latLng;
              
              longPressTimer = setTimeout(() => {
                if (longPressPosition && longPressStartCoords) {
                  // Verify finger hasn't moved too much
                  const distance = getPixelDistance(longPressPosition, longPressStartCoords);
                  if (distance < MOVEMENT_TOLERANCE) {
                    const lat = longPressPosition.lat();
                    const lng = longPressPosition.lng();
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                      type: 'location_longpress',
                      latitude: lat,
                      longitude: lng
                    }));
                    // Visual feedback - show a pulse animation
                    const pulseMarker = new google.maps.Marker({
                      position: { lat, lng },
                      map: map,
                      icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#FFD700',
                        fillOpacity: 0.8,
                        strokeColor: '#FFD700',
                        strokeWeight: 3,
                        scale: 20
                      },
                      animation: google.maps.Animation.BOUNCE
                    });
                    // Remove marker after 1.5 seconds
                    setTimeout(() => pulseMarker.setMap(null), 1500);
                  }
                }
                cancelLongPress();
              }, LONG_PRESS_DURATION);
            });
            
            map.addListener('mouseup', () => {
              cancelLongPress();
            });
            
            // Cancel on any mouse movement (drag)
            map.addListener('mousemove', (event) => {
              if (longPressTimer && longPressStartCoords) {
                const distance = getPixelDistance(event.latLng, longPressStartCoords);
                if (distance > MOVEMENT_TOLERANCE) {
                  cancelLongPress();
                }
              }
            });
            
            // Cancel on drag start
            map.addListener('dragstart', () => {
              cancelLongPress();
            });
            
            // Cancel on zoom change (pinch gesture)
            map.addListener('zoom_changed', () => {
              cancelLongPress();
            });
            
            // Cancel on map center change
            map.addListener('center_changed', () => {
              cancelLongPress();
            });
            
            // Send log to React Native
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: 'log',
              message: '🗺️ WebView: Map initialization complete!'
            }));
            
            } catch (error) {
              // Send error to React Native
              window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'error',
                message: '🗺️ WebView: Error initializing map: ' + error.message
              }));
              const loading = document.getElementById('loading');
              if (loading) {
                loading.innerHTML = 'Error loading map: ' + error.message;
                loading.className = 'error';
              }
            }
          }
          
          // Error handling
          window.onerror = function(msg, url, lineNo, columnNo, error) {
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: 'error',
              message: '🗺️ WebView: JavaScript error: ' + msg + ' at ' + url + ':' + lineNo
            }));
            return false;
          };
          
          // Log when Google Maps API loads
          window.gm_authFailure = function() {
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: 'error',
              message: '🗺️ WebView: Google Maps API authentication failed'
            }));
            const loading = document.getElementById('loading');
            if (loading) {
              loading.innerHTML = 'Google Maps API authentication failed. Please check your API key.';
              loading.className = 'error';
            }
          };
          
          // Helper function for custom marker icons with gold circular border
          // Returns HTML element for AdvancedMarkerElement
          
          // Sport-specific fallback icons (hosted on Supabase Storage)
          const SPORT_ICON_URLS = {
            'gym': 'https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/filter-icons/gym.png',
            'stadium': 'https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/filter-icons/stadium.png',
            'swimming_pool': 'https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/filter-icons/swimming-pool.png',
            'park': 'https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/filter-icons/park.png',
            'sports_complex': 'https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/filter-icons/stadium.png',
            'bowling_alley': 'https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/filter-icons/bowling-alley.png',
            'golf_course': 'https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/filter-icons/golf-course.png',
            'ice_rink': 'https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/filter-icons/ice-rink.png',
            'tennis_court': 'https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/filter-icons/tennis-court.png',
            'basketball_court': 'https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/filter-icons/basketball-court.png',
            'martial_arts_gym': 'https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/filter-icons/martial-arts.png',
            'grappling_hall': 'https://ujfeqshqhlplmolfrlvc.supabase.co/storage/v1/object/public/public-assets/5f294203-9369-442d-a91d-cec972253d10/filter-icons/grappling.png',
          };
          
          // Get sport icon URL based on place types or name
          function getSportIconUrl(place) {
            // Check searchType first (most reliable - set during API search)
            if (place.searchType && SPORT_ICON_URLS[place.searchType]) {
              return SPORT_ICON_URLS[place.searchType];
            }
            
            // Check place types
            if (place.types && Array.isArray(place.types)) {
              for (const type of place.types) {
                if (SPORT_ICON_URLS[type]) {
                  return SPORT_ICON_URLS[type];
                }
              }
              // Check for common Google Places types
              if (place.types.includes('gym')) return SPORT_ICON_URLS['gym'];
              if (place.types.includes('stadium')) return SPORT_ICON_URLS['stadium'];
              if (place.types.includes('park')) return SPORT_ICON_URLS['park'];
              if (place.types.includes('bowling_alley')) return SPORT_ICON_URLS['bowling_alley'];
            }
            
            // Check name for keywords
            const name = (place.name || '').toLowerCase();
            if (name.includes('basketball') || name.includes('koszyków') || name.includes('boisko')) return SPORT_ICON_URLS['basketball_court'];
            if (name.includes('tennis') || name.includes('kort')) return SPORT_ICON_URLS['tennis_court'];
            if (name.includes('swim') || name.includes('pool') || name.includes('basen') || name.includes('pływal')) return SPORT_ICON_URLS['swimming_pool'];
            if (name.includes('gym') || name.includes('fitness') || name.includes('siłownia')) return SPORT_ICON_URLS['gym'];
            if (name.includes('stadium') || name.includes('stadion')) return SPORT_ICON_URLS['stadium'];
            if (name.includes('golf')) return SPORT_ICON_URLS['golf_course'];
            if (name.includes('bowling') || name.includes('kręgiel')) return SPORT_ICON_URLS['bowling_alley'];
            if (name.includes('ice') || name.includes('skating') || name.includes('lodowisko')) return SPORT_ICON_URLS['ice_rink'];
            if (name.includes('park')) return SPORT_ICON_URLS['park'];
            if (name.includes('martial') || name.includes('boxing') || name.includes('mma') || name.includes('karate') || name.includes('taekwondo')) return SPORT_ICON_URLS['martial_arts_gym'];
            if (name.includes('judo') || name.includes('wrestling') || name.includes('bjj') || name.includes('grappling')) return SPORT_ICON_URLS['grappling_hall'];
            
            return null;
          }
          
          function getMarkerIcon(place, isHighlighted) {
            let photoUrl = null;
            
            // Try to get photo URL from various formats
            if (place.photos && place.photos.length > 0) {
              const firstPhoto = place.photos[0];
              if (firstPhoto.url) {
                photoUrl = firstPhoto.url;
              } else if (firstPhoto.photo_url) {
                photoUrl = firstPhoto.photo_url;
              } else if (firstPhoto.photoReference) {
                photoUrl = 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=100&photo_reference=' + firstPhoto.photoReference + '&key=${apiKey}';
              }
            } else if (place.photo_url) {
              photoUrl = place.photo_url;
            }

            // Create HTML element for circular marker with gold border
            const markerDiv = document.createElement('div');
            
            // Premium Gold Glow for highlighted markers
            const glowStyle = isHighlighted 
              ? 'box-shadow: 0 0 15px #FFD700, 0 0 5px #FFD700; animation: pulse 2s infinite;' 
              : 'box-shadow: 0 3px 8px rgba(0,0,0,0.4);';
            
            markerDiv.style.cssText = 'width: 52px; height: 52px; border-radius: 50%; border: 4px solid #FFD700; background-color: white; overflow: hidden; display: flex; align-items: center; justify-content: center; cursor: pointer; ' + glowStyle;
            
            if (photoUrl) {
              const img = document.createElement('img');
              img.src = photoUrl;
              img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 50%;';
              img.onerror = function() {
                // If image fails to load, try sport-specific icon or show SM text
                const sportIcon = getSportIconUrl(place);
                if (sportIcon) {
                  const fallbackImg = document.createElement('img');
                  fallbackImg.src = sportIcon;
                  fallbackImg.style.cssText = 'width: 70%; height: 70%; object-fit: contain;';
                  fallbackImg.onerror = function() {
                    markerDiv.innerHTML = '<span style="font-family: Arial, sans-serif; font-weight: bold; font-size: 16px; color: black;">SM</span>';
                    markerDiv.style.backgroundColor = '#FFD700';
                  };
                  markerDiv.innerHTML = '';
                  markerDiv.appendChild(fallbackImg);
                } else {
                  markerDiv.innerHTML = '<span style="font-family: Arial, sans-serif; font-weight: bold; font-size: 16px; color: black;">SM</span>';
                  markerDiv.style.backgroundColor = '#FFD700';
                }
              };
              markerDiv.appendChild(img);
            } else {
              // No photo available - try sport-specific icon first
              const sportIcon = getSportIconUrl(place);
              if (sportIcon) {
                const img = document.createElement('img');
                img.src = sportIcon;
                img.style.cssText = 'width: 70%; height: 70%; object-fit: contain;';
                img.onerror = function() {
                  markerDiv.innerHTML = '<span style="font-family: Arial, sans-serif; font-weight: bold; font-size: 16px; color: black;">SM</span>';
                  markerDiv.style.backgroundColor = '#FFD700';
                };
                markerDiv.appendChild(img);
              } else {
                // Fallback to SM Logo
                markerDiv.style.backgroundColor = '#FFD700';
                markerDiv.innerHTML = '<span style="font-family: Arial, sans-serif; font-weight: bold; font-size: 16px; color: black;">SM</span>';
              }
            }
            
            return markerDiv;
          }

          // Create venue markers from places data
          function createVenueMarkers(venuesToCreate, highlightAll) {
            try {
              // Use provided venues or fall back to initial injected data
              const venues = venuesToCreate || ${JSON.stringify(places).replace(/`/g, '\\`').replace(/\$/g, '\\$')};
              const isGlobalHighlight = highlightAll !== undefined ? highlightAll : ${highlightMarkers};
              
              window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'log',
                message: '🗺️ WebView: createVenueMarkers called with ' + venues.length + ' venues'
              }));
              
              if (!venues) return;

              // Clear existing markers
              if (markers && markers.length > 0) {
                markers.forEach(m => {
                  if (m.setMap) m.setMap(null);
                  else if (m.map) m.map = null;
                });
                markers = [];
              }
              
              let createdCount = 0;
              let advancedCount = 0;
              let regularCount = 0;

              venues.forEach(function(venue, index) {
                if (!venue.coordinates) return;
                
                try {
                  let marker;
                  // Try to use AdvancedMarkerElement if library is available
                  if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
                    const markerContent = getMarkerIcon(venue, isGlobalHighlight);
                    marker = new google.maps.marker.AdvancedMarkerElement({
                      position: { lat: venue.coordinates.lat, lng: venue.coordinates.lng },
                      map: map,
                      title: venue.name,
                      content: markerContent
                    });
                    advancedCount++;
                  } else {
                    // Fallback to regular marker if library not loaded
                    marker = new google.maps.Marker({
                      position: { lat: venue.coordinates.lat, lng: venue.coordinates.lng },
                      map: map,
                      title: venue.name,
                      icon: {
                        url: venue.photo_url || 'https://maps.google.com/mapfiles/ms/icons/gold-pushpin.png',
                        scaledSize: new google.maps.Size(40, 40)
                      }
                    });
                    regularCount++;
                  }
                  
                  if (marker) {
                    marker.addListener('click', function() {
                      window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'place_click',
                        place: venue
                      }));
                    });
                    markers.push(marker);
                    createdCount++;
                  }
                } catch (err) {
                  console.error('Error creating individual marker:', err);
                }
              });
              
              window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'log',
                message: '🗺️ WebView: Created ' + createdCount + ' markers (Advanced: ' + advancedCount + ', Regular: ' + regularCount + ')'
              }));
            } catch (e) {
              console.error('Error in createVenueMarkers:', e);
            }
          }

          // Expose functions globally for injectJavaScript
          window.updateVenueMarkers = createVenueMarkers;
          
          // Track event markers separately from venue markers
          var eventMarkers = [];
          
          window.updateEventMarkers = function(eventsToCreate, highlightAll) {
            try {
              const sportEvents = eventsToCreate || [];
              const isGlobalHighlight = highlightAll !== undefined ? highlightAll : false;
              
              window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'log',
                message: '🗺️ WebView: updateEventMarkers called with ' + sportEvents.length + ' events'
              }));
              
              // Clear existing event markers
              if (eventMarkers && eventMarkers.length > 0) {
                eventMarkers.forEach(m => {
                  if (m.setMap) m.setMap(null);
                  else if (m.map) m.map = null;
                });
                eventMarkers = [];
              }
              
              if (!sportEvents || sportEvents.length === 0) return;
              
              let createdCount = 0;
              
              sportEvents.forEach(function(sportEvent) {
                if (!sportEvent.latitude || !sportEvent.longitude) return;
                
                const emoji = getEmojiForSport(sportEvent.activity || '');
                
                // Create custom HTML marker element with sM logo styling
                const markerDiv = document.createElement('div');
                const glowStyle = isGlobalHighlight 
                  ? 'box-shadow: 0 0 15px #FFD700, 0 0 5px #FFD700; animation: pulse 2s infinite;'
                  : 'box-shadow: 0 3px 8px rgba(0,0,0,0.4);';
                
                markerDiv.style.cssText = 'width: 52px; height: 52px; border-radius: 50%; border: 4px solid #FFD700; background-color: #FFD700; overflow: hidden; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; ' + glowStyle;
                markerDiv.innerHTML = '<span style="font-family: Arial, sans-serif; font-weight: bold; font-size: 14px; color: black;">sM</span>';
                
                // Add participant badge
                const badge = document.createElement('div');
                badge.style.cssText = 'position: absolute; bottom: -4px; right: -4px; background: #10b981; color: white; border-radius: 10px; padding: 2px 6px; font-size: 10px; font-weight: bold; border: 2px solid white;';
                badge.innerText = (sportEvent.participants_count || 0) + '/' + (sportEvent.max_participants || 0);
                markerDiv.appendChild(badge);
                
                let marker;
                try {
                  if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
                    marker = new google.maps.marker.AdvancedMarkerElement({
                      position: { lat: sportEvent.latitude, lng: sportEvent.longitude },
                      map: map,
                      title: sportEvent.name || sportEvent.activity || 'Event',
                      content: markerDiv,
                      zIndex: 1000
                    });
                  } else {
                    marker = new google.maps.Marker({
                      position: { lat: sportEvent.latitude, lng: sportEvent.longitude },
                      map: map,
                      title: sportEvent.name || sportEvent.activity || 'Event',
                      icon: {
                        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent('<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="20" fill="#FFD700" stroke="white" stroke-width="4"/><text x="24" y="30" font-size="14" text-anchor="middle" font-weight="bold" fill="black">sM</text></svg>'),
                        scaledSize: new google.maps.Size(48, 48),
                        anchor: new google.maps.Point(24, 24)
                      },
                      zIndex: 1000
                    });
                  }
                  
                  if (marker) {
                    marker.addListener('click', function() {
                      // Only send to React Native for PlaceInfoModal - no infowindow
                      window.ReactNativeWebView?.postMessage(JSON.stringify({
                        type: 'event_click',
                        event: sportEvent
                      }));
                    });
                    
                    eventMarkers.push(marker);
                    createdCount++;
                  }
                } catch (err) {
                  console.error('Error creating event marker:', err);
                }
              });
              
              window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'log',
                message: '🗺️ WebView: Created ' + createdCount + ' event markers'
              }));
            } catch (e) {
              console.error('Error in updateEventMarkers:', e);
              window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'error',
                message: '🗺️ WebView: Error in updateEventMarkers: ' + e.message
              }));
            }
          };
          
          // Create event markers
          function createEventMarkers() {
            try {
              const sportEvents = ${JSON.stringify(events).replace(/`/g, '\\`').replace(/\$/g, '\\$')};
              
              sportEvents.forEach(function(sportEvent) {
                const emoji = getEmojiForSport(sportEvent.activity);
                const marker = new google.maps.Marker({
                  position: { lat: sportEvent.latitude, lng: sportEvent.longitude },
                  map: map,
                  title: sportEvent.name,
                  icon: {
                    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(\`
                      <svg width="48" height="64" viewBox="0 0 48 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g filter="url(#shadow)">
                          <circle cx="24" cy="24" r="20" fill="#FFD700" stroke="white" stroke-width="4"/>
                          <text x="24" y="32" font-size="24" text-anchor="middle" fill="black">\${emoji}</text>
                        </g>
                        <rect x="18" y="42" width="12" height="18" rx="6" fill="white" stroke="#FFD700" stroke-width="2"/>
                        <text x="24" y="55" font-size="10" text-anchor="middle" font-weight="bold" fill="#000000">\${sportEvent.participants_count}/\${sportEvent.max_participants}</text>
                        <defs>
                          <filter id="shadow">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
                          </filter>
                        </defs>
                      </svg>
                    \`),
                    scaledSize: new google.maps.Size(48, 64),
                    anchor: new google.maps.Point(24, 64)
                  },
                  zIndex: 1000
                });
                
                marker.addListener('click', function() {
                  // Only send to React Native for PlaceInfoModal - no infowindow
                  window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'event_click',
                    event: sportEvent
                  }));
                });
              });
            } catch (e) {
              console.error('Error in createEventMarkers:', e);
            }
          }
          
          // Helper function for emoji mapping in browser
          function getEmojiForSport(sport) {
            const map = {
              'basketball': 'basketball-outline',
              'football': 'football-outline',
              'soccer': 'football-outline',
              'running': 'walk-outline‍♂️',
              'tennis': 'tennisball-outline',
              'cycling': 'bicycle-outline‍♂️',
              'swimming': 'water-outline‍♂️',
              'gym': 'barbell-outline',
              'volleyball': 'baseball-outline',
              'climbing': 'trending-up-outline‍♂️',
              'yoga': '🧘',
              'pilates': '🧘',
              'crossfit': '🏋️‍♂️',
              'judo': '🥋',
              'wrestling': '🤼‍♂️',
              'muay thai': 'fitness-outline',
              'kickboxing': 'fitness-outline',
              'rollerblading': '🛼',
              'ice skating': '⛸️',
              'skating': '🛹',
              'padel': 'tennisball-outline',
              'squash': 'tennisball-outline',
              'badminton': '🏸',
              'table tennis': '🏓',
              'baseball': '⚾',
              'golf': 'golf-outline',
              'hockey': '🏒'
            };
            return map[sport.toLowerCase()] || 'walk-outline';
          }
          

          

          

        </script>
        <script async defer 
          src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=beta&libraries=places,marker&callback=initMap">
        </script>
      </body>
      </html>
    `;

    console.log('🗺️ GoogleMapsView: HTML generated, length:', html.length);
    setMapHtml(html);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // Handle logs from WebView
      if (data.type === 'log') {
        console.log(data.message);
      } else if (data.type === 'error') {
        console.error(data.message);
      } else if (data.type === 'place_click') {
        onPlaceSelect?.(data.place);
      } else if (data.type === 'location_longpress') {
        console.log('🖐️ Long press detected at:', data.latitude, data.longitude);
        onLocationLongPress?.({
          latitude: data.latitude,
          longitude: data.longitude
        });
      } else if (data.type === 'location_click') {
        onLocationSelect?.({
          latitude: data.latitude,
          longitude: data.longitude
        });
      } else if (data.type === 'event_click') {
        // Handle custom event marker click - pass to parent for PlaceInfoModal
        console.log('🎯 Event marker clicked:', data.event);
        if (onEventSelect) {
          onEventSelect(data.event);
        } else {
          // Fallback to dialog if no handler provided
          dialog.showDialog({
            title: data.event.name || data.event.activity,
            message: `${data.event.activity}\n${data.event.participants_count || 0}/${data.event.max_participants || 0} participants`,
            type: 'info',
            buttons: [
              { text: 'Close', style: 'cancel' }
            ]
          });
        }
      } else if (data.type === 'event_join') {
        // Handle join event button click
        console.log('Join event:', data.eventId);
        dialog.showConfirm(
          'Join Event',
          'Would you like to join this event?',
          () => console.log('Joining event:', data.eventId)
        );
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  if (!location && !initialLocation) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        mixedContentMode="compatibility"
        onLoadStart={() => console.log('🗺️ WebView: Loading started')}
        onLoadEnd={() => console.log('🗺️ WebView: Loading finished')}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('🗺️ WebView: Error loading:', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('🗺️ WebView: HTTP error:', nativeEvent);
        }}
        onLoadProgress={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('🗺️ WebView: Loading progress:', nativeEvent.progress);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

