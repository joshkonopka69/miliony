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
  searchQuery?: string;
  initialLocation?: { latitude: number; longitude: number };
  events?: MapEvent[]; // Events to display as markers
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
  searchQuery,
  initialLocation,
  events = [] // Default to empty array
}: GoogleMapsViewProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [mapHtml, setMapHtml] = useState<string>('');
  const webViewRef = useRef<WebView>(null);

  // Debug: Log events when component receives them
  console.log('🗺️ GoogleMapsView received events:', events);
  console.log('🗺️ GoogleMapsView events count:', events.length);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (location) {
      generateMapHtml();
    }
  }, [location, searchQuery, events]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is needed to show your position on the map.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      onLocationSelect?.({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const generateMapHtml = () => {
    const lat = initialLocation?.latitude || location?.coords.latitude || 51.1079;
    const lng = initialLocation?.longitude || location?.coords.longitude || 17.0385;
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html { margin: 0; padding: 0; height: 100%; }
          #map { height: 100%; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          let map;
          let service;
          let infowindow;
          let markers = [];
          
          function initMap() {
            const center = { lat: ${lat}, lng: ${lng} };
            
            map = new google.maps.Map(document.getElementById("map"), {
              zoom: 15,
              center: center,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                }
              ]
            });
            
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
            
            // Search for places if query provided
            ${searchQuery ? `searchPlaces("${searchQuery}");` : 'searchNearbyPlaces();'}
            
            // Add event markers
            ${events.length > 0 ? 'createEventMarkers();' : ''}
            
            // Add click listener for map
            map.addListener('click', (event) => {
              const lat = event.latLng.lat();
              const lng = event.latLng.lng();
              window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'location_click',
                latitude: lat,
                longitude: lng
              }));
            });
          }
          
          // Create event markers
          function createEventMarkers() {
            const sportEvents = ${JSON.stringify(events)};
            
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
                        <circle cx="24" cy="24" r="20" fill="#FDB924" stroke="white" stroke-width="4"/>
                        <text x="24" y="32" font-size="24" text-anchor="middle" fill="black">\${emoji}</text>
                      </g>
                      <rect x="18" y="42" width="12" height="18" rx="6" fill="white" stroke="#FDB924" stroke-width="2"/>
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
                    <p style="margin: 0; color: #FDB924; font-weight: 600; font-size: 14px;">
                      👥 \${sportEvent.participants_count}/\${sportEvent.max_participants} participants
                    </p>
                    <button style="
                      width: 100%;
                      margin-top: 10px;
                      padding: 8px;
                      background: #FDB924;
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
              'badminton': '🏸',
              'baseball': '⚾',
              'golf': '⛳',
              'hockey': '🏒'
            };
            return map[sport.toLowerCase()] || '🏃';
          }
          
          function searchPlaces(query) {
            const request = {
                  query: query,
                  fields: ['name', 'geometry', 'formatted_address', 'place_id', 'rating', 'price_level', 'photos', 'types'],
                  locationBias: map.getCenter(),
                  radius: 5000
                };
                
                service.textSearch(request, (results, status) => {
                  if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    clearMarkers();
                    results.forEach(place => {
                      if (place.geometry && place.geometry.location) {
                        createMarker(place);
                      }
                    });
                  }
                });
          }
          
          function searchNearbyPlaces() {
            const request = {
              location: map.getCenter(),
              radius: 1000,
              type: ['gym', 'stadium', 'park', 'sports_complex']
            };
            
            service.nearbySearch(request, (results, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                clearMarkers();
                results.forEach(place => {
                  createMarker(place);
                });
              }
            });
          }
          
          function createMarker(place) {
            const marker = new google.maps.Marker({
              position: place.geometry.location,
              map: map,
              title: place.name,
              icon: {
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(\`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 2C10.48 2 6 6.48 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.52-4.48-10-10-10z" fill="#EA4335"/>
                    <circle cx="16" cy="12" r="4" fill="white"/>
                  </svg>
                \`),
                scaledSize: new google.maps.Size(32, 32)
              }
            });
            
            markers.push(marker);
            
            marker.addListener('click', () => {
              const placeDetails = {
                name: place.name,
                address: place.formatted_address || place.vicinity,
                placeId: place.place_id,
                rating: place.rating,
                priceLevel: place.price_level,
                photos: place.photos,
                types: place.types,
                location: {
                  latitude: place.geometry.location.lat(),
                  longitude: place.geometry.location.lng()
                }
              };
              
              window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'place_click',
                place: placeDetails
              }));
              
              // Show info window
              infowindow.setContent(\`
                <div style="padding: 10px; max-width: 200px;">
                  <h3 style="margin: 0 0 5px 0; font-size: 16px;">\${place.name}</h3>
                  <p style="margin: 0; color: #666; font-size: 14px;">\${place.formatted_address || place.vicinity}</p>
                  \${place.rating ? \`<p style="margin: 5px 0 0 0; color: #FFA500; font-size: 14px;">⭐ \${place.rating}/5</p>\` : ''}
                </div>
              \`);
              infowindow.open(map, marker);
            });
          }
          
          function clearMarkers() {
            markers.forEach(marker => marker.setMap(null));
            markers = [];
          }
        </script>
        <script async defer 
          src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap">
        </script>
      </body>
      </html>
    `;
    
    setMapHtml(html);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'place_click') {
        onPlaceSelect?.(data.place);
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

