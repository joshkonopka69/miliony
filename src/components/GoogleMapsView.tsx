import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
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
  searchQuery?: string;
  initialLocation?: { latitude: number; longitude: number };
  events?: MapEvent[]; // Events to display as markers
  places?: any[]; // Venue places to display as markers
}

const { width, height } = Dimensions.get('window');

// Helper function to get sport emoji
const getSportEmoji = (activity: string): string => {
  const emojiMap: Record<string, string> = {
    basketball: '🏀',
    football: '⚽',
    soccer: '⚽',
    running: '🏃‍♂️',
    tennis: '🎾',
    cycling: '🚴‍♂️',
    swimming: '🏊‍♂️',
    gym: '💪',
    volleyball: '🏐',
    climbing: '🧗‍♂️',
    yoga: '🧘',
    badminton: '🏸',
    baseball: '⚾',
    golf: '⛳',
    hockey: '🏒',
  };
  return emojiMap[activity.toLowerCase()] || '🏃';
};

export default function GoogleMapsView({
  onPlaceSelect,
  onLocationSelect,
  onLocationLongPress,
  searchQuery,
  initialLocation,
  events = [], // Default to empty array
  places = [] // Default to empty array
}: GoogleMapsViewProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [mapHtml, setMapHtml] = useState<string>('');
  const webViewRef = useRef<WebView>(null);

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
          updateVenueMarkers(${venuesJson});
        }
        if (typeof updateEventMarkers === 'function') {
          updateEventMarkers(${eventsJson});
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
        Alert.alert('Permission Denied', 'Location access is needed to show your position on the map.');
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
          function getMarkerIcon(place) {
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
            markerDiv.style.cssText = 'width: 52px; height: 52px; border-radius: 50%; border: 4px solid #FFD700; background-color: white; box-shadow: 0 3px 8px rgba(0,0,0,0.4); overflow: hidden; display: flex; align-items: center; justify-content: center; cursor: pointer;';
            
            if (photoUrl) {
              const img = document.createElement('img');
              img.src = photoUrl;
              img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 50%;';
              img.onerror = function() {
                // If image fails to load, show SM text instead
                markerDiv.innerHTML = '<span style="font-family: Arial, sans-serif; font-weight: bold; font-size: 16px; color: black;">SM</span>';
                markerDiv.style.backgroundColor = '#FFD700';
              };
              markerDiv.appendChild(img);
            } else {
              // Fallback to SM Logo
              markerDiv.style.backgroundColor = '#FFD700';
              markerDiv.innerHTML = '<span style="font-family: Arial, sans-serif; font-weight: bold; font-size: 16px; color: black;">SM</span>';
            }
            
            return markerDiv;
          }

          // Create venue markers from places data
          function createVenueMarkers(venuesToCreate) {
            try {
              // Use provided venues or fall back to initial injected data
              const venues = venuesToCreate || ${JSON.stringify(places).replace(/`/g, '\\`').replace(/\$/g, '\\$')};
              
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
                    const markerContent = getMarkerIcon(venue);
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
          window.updateEventMarkers = function(events) {
            // Logic for event markers if needed...
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
                  window.ReactNativeWebView?.postMessage(JSON.stringify({
                    type: 'event_click',
                    event: sportEvent
                  }));
                  
                  infowindow.setContent(\`
                    <div style="padding: 12px; max-width: 250px;">
                      <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">\${sportEvent.name}</h3>
                      <p style="margin: 0 0 6px 0; color: #666; font-size: 14px;">
                        <span style="font-size: 20px; margin-right: 6px;">\${emoji}</span>
                        \${sportEvent.activity}
                      </p>
                      <p style="margin: 0; color: #FFD700; font-weight: 600; font-size: 14px;">
                        👥 \${sportEvent.participants_count}/\${sportEvent.max_participants} participants
                      </p>
                      <button style="
                        width: 100%;
                        margin-top: 10px;
                        padding: 8px;
                        background: #FFD700;
                        color: black;
                        border: none;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 14px;
                      " onclick="window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'event_join',
                        eventId: '\${sportEvent.id}'
                      }))">
                        Join Event
                      </button>
                    </div>
                  \`);
                  infowindow.open(map, marker);
                });
              });
            } catch (e) {
              console.error('Error in createEventMarkers:', e);
            }
          }
          
          // Helper function for emoji mapping in browser
          function getEmojiForSport(sport) {
            const map = {
              'basketball': '🏀',
              'football': '⚽',
              'soccer': '⚽',
              'running': '🏃‍♂️',
              'tennis': '🎾',
              'cycling': '🚴‍♂️',
              'swimming': '🏊‍♂️',
              'gym': '💪',
              'volleyball': '🏐',
              'climbing': '🧗‍♂️',
              'yoga': '🧘',
              'pilates': '🧘',
              'crossfit': '🏋️‍♂️',
              'judo': '🥋',
              'wrestling': '🤼‍♂️',
              'muay thai': '🥊',
              'kickboxing': '🥊',
              'rollerblading': '🛼',
              'ice skating': '⛸️',
              'skating': '🛹',
              'padel': '🎾',
              'squash': '🎾',
              'badminton': '🏸',
              'table tennis': '🏓',
              'baseball': '⚾',
              'golf': '⛳',
              'hockey': '🏒'
            };
            return map[sport.toLowerCase()] || '🏃';
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
        // Handle event marker click
        console.log('Event clicked:', data.event);
        Alert.alert(
          data.event.name,
          `${data.event.activity}\n${data.event.participants_count}/${data.event.max_participants} participants`,
          [
            { text: 'Close', style: 'cancel' },
            { text: 'View Details', onPress: () => console.log('View details:', data.event.id) }
          ]
        );
      } else if (data.type === 'event_join') {
        // Handle join event button click
        console.log('Join event:', data.eventId);
        Alert.alert(
          'Join Event',
          'Would you like to join this event?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Join', onPress: () => console.log('Joining event:', data.eventId) }
          ]
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

