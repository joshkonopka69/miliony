import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import PlaceDetailsMap from '../components/PlaceDetailsMap';

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

export default function PlaceDetailsExampleScreen() {
  const [apiKey, setApiKey] = useState('');
  const [placeId, setPlaceId] = useState('ChIJN1t_tDeuEmsRUsoyG83frY4'); // Sydney Opera House
  const [currentPlace, setCurrentPlace] = useState<PlaceDetails | null>(null);
  const [showMap, setShowMap] = useState(false);

  // Example place IDs for testing
  const examplePlaces = [
    { id: 'ChIJN1t_tDeuEmsRUsoyG83frY4', name: 'Sydney Opera House' },
    { id: 'ChIJj61dQgK6j4AR4GeTYWZsKWw', name: 'Golden Gate Bridge' },
    { id: 'ChIJE9on3F3HwoAR9AhGJW_fL-I', name: 'Hollywood Sign' },
    { id: 'ChIJdd4hrwug2EcRmSrV3Vo6llI', name: 'Big Ben' },
    { id: 'ChIJu46S-ZZhLxMROG5lkwZ3D7k', name: 'Colosseum' },
  ];

  const handlePlaceDetailsLoaded = (place: PlaceDetails) => {
    setCurrentPlace(place);
    Alert.alert('Success', `Loaded details for: ${place.name}`);
  };

  const handleError = (error: string) => {
    Alert.alert('Error', error);
  };

  const handleLoadMap = () => {
    if (!apiKey.trim()) {
      Alert.alert('API Key Required', 'Please enter your Google Places API key');
      return;
    }
    setShowMap(true);
  };

  const handlePlaceSelect = (selectedPlaceId: string) => {
    setPlaceId(selectedPlaceId);
    setShowMap(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>📍 Place Details Map</Text>
          <Text style={styles.subtitle}>
            React Native version of Google Maps Place Details example
          </Text>
        </View>

        {!showMap ? (
          <View style={styles.setupContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Google Places API Key:</Text>
              <TextInput
                style={styles.input}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="Enter your Google Places API key"
                secureTextEntry={true}
                autoCapitalize="none"
              />
              <Text style={styles.helpText}>
                Get your API key from Google Cloud Console. Enable Places API.
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Place ID (optional):</Text>
              <TextInput
                style={styles.input}
                value={placeId}
                onChangeText={setPlaceId}
                placeholder="Enter a Google Place ID"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={styles.loadButton} onPress={handleLoadMap}>
              <Text style={styles.loadButtonText}>Load Map</Text>
            </TouchableOpacity>

            <View style={styles.examplesContainer}>
              <Text style={styles.examplesTitle}>Example Places:</Text>
              {examplePlaces.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.exampleButton}
                  onPress={() => handlePlaceSelect(place.id)}
                >
                  <Text style={styles.exampleButtonText}>{place.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.mapContainer}>
            <View style={styles.mapHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowMap(false)}
              >
                <Text style={styles.backButtonText}>← Back to Setup</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mapWrapper}>
              <PlaceDetailsMap
                placeId={placeId}
                apiKey={apiKey}
                onPlaceDetailsLoaded={handlePlaceDetailsLoaded}
                onError={handleError}
              />
            </View>

            {currentPlace && (
              <View style={styles.placeInfoContainer}>
                <Text style={styles.placeInfoTitle}>📍 Current Place</Text>
                <Text style={styles.placeInfoName}>{currentPlace.name}</Text>
                <Text style={styles.placeInfoAddress}>{currentPlace.formatted_address}</Text>
                <Text style={styles.placeInfoId}>ID: {currentPlace.place_id}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  setupContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  loadButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  loadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  examplesContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  exampleButton: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  exampleButtonText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  mapHeader: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  mapWrapper: {
    flex: 1,
    minHeight: 400,
  },
  placeInfoContainer: {
    backgroundColor: 'white',
    padding: 15,
    margin: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  placeInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  placeInfoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  placeInfoAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  placeInfoId: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
});


