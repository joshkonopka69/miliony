import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Callout } from 'react-native-maps';

interface PlaceDetails {
  name: string;
  formatted_address: string;
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface PlaceDetailsMapProps {
  placeId?: string;
  apiKey?: string;
  onPlaceDetailsLoaded?: (place: PlaceDetails) => void;
  onError?: (error: string) => void;
}

export default function PlaceDetailsMap({ 
  placeId = "ChIJN1t_tDeuEmsRUsoyG83frY4", // Default to Sydney Opera House
  apiKey,
  onPlaceDetailsLoaded,
  onError 
}: PlaceDetailsMapProps) {
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  // Default region (Sydney, Australia - same as original HTML)
  const initialRegion: Region = {
    latitude: -33.866,
    longitude: 151.196,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  useEffect(() => {
    if (placeId) {
      fetchPlaceDetails();
    }
  }, [placeId]);

  const fetchPlaceDetails = async () => {
    if (!apiKey) {
      const errorMsg = 'Google Places API key is required';
      setError(errorMsg);
      setLoading(false);
      if (onError) onError(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Google Places API endpoint
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,place_id,geometry&key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        const place: PlaceDetails = data.result;
        setPlaceDetails(place);
        
        // Update map region to show the place
        if (mapRef.current && place.geometry?.location) {
          const newRegion: Region = {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          
          mapRef.current.animateToRegion(newRegion, 1000);
        }

        if (onPlaceDetailsLoaded) {
          onPlaceDetailsLoaded(place);
        }
      } else {
        const errorMsg = `Failed to fetch place details: ${data.status} - ${data.error_message || 'Unknown error'}`;
        setError(errorMsg);
        if (onError) onError(errorMsg);
      }
    } catch (err) {
      const errorMsg = `Network error: ${err.message}`;
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = () => {
    // Marker press is handled by the Callout
    console.log('Marker pressed for place:', placeDetails?.name);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        mapType="standard"
      >
        {/* Place Marker */}
        {placeDetails && placeDetails.geometry?.location && (
          <Marker
            coordinate={{
              latitude: placeDetails.geometry.location.lat,
              longitude: placeDetails.geometry.location.lng,
            }}
            title={placeDetails.name}
            description={placeDetails.formatted_address}
            onPress={handleMarkerPress}
          >
            <Callout style={styles.callout}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{placeDetails.name}</Text>
                <Text style={styles.calloutPlaceId}>Place ID: {placeDetails.place_id}</Text>
                <Text style={styles.calloutAddress}>{placeDetails.formatted_address}</Text>
              </View>
            </Callout>
          </Marker>
        )}
      </MapView>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading place details...</Text>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Place Info Overlay */}
      {placeDetails && !loading && !error && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>📍 Place Details</Text>
          <Text style={styles.infoName}>{placeDetails.name}</Text>
          <Text style={styles.infoAddress}>{placeDetails.formatted_address}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  callout: {
    width: 280,
    height: 100,
  },
  calloutContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  calloutPlaceId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  calloutAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -25 }],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 10,
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
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  errorTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 18,
  },
  infoContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoAddress: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
});


