import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { theme } from '../styles/theme';
import Button from './ui/Button';
import Card from './ui/Card';

interface PlaceDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  place: {
    name: string;
    address: string;
    placeId: string;
    rating?: number;
    priceLevel?: number;
    photos?: any[];
    types?: string[];
    location: {
      latitude: number;
      longitude: number;
    };
  } | null;
  onPlanEvent: (place: any) => void;
}

const { width, height } = Dimensions.get('window');

export default function PlaceDetailsModal({
  visible,
  onClose,
  place,
  onPlanEvent,
}: PlaceDetailsModalProps) {
  const [placeDetails, setPlaceDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (visible && place) {
      fetchPlaceDetails();
    }
  }, [visible, place]);

  const fetchPlaceDetails = async () => {
    if (!place) return;
    
    setLoading(true);
    try {
      // In a real app, you would call Google Places API here
      // For now, we'll use the basic place data
      setPlaceDetails(place);
      
      // Get photo URL if available
      if (place.photos && place.photos.length > 0) {
        const photo = place.photos[0];
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
        setPhotoUrl(photoUrl);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanEvent = () => {
    if (place) {
      onPlanEvent(place);
      onClose();
    }
  };

  const handleOpenInMaps = async () => {
    if (!place) return;
    
    const url = `https://www.google.com/maps/place/?q=place_id:${place.placeId}`;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Error opening maps:', error);
    }
  };

  const handleDirections = async () => {
    if (!place) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.location.latitude},${place.location.longitude}`;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Error opening directions:', error);
    }
  };

  const getPriceLevelText = (level?: number) => {
    if (level === undefined) return '';
    return '€'.repeat(level + 1);
  };

  const getTypeText = (types?: string[]) => {
    if (!types) return '';
    return types.slice(0, 3).join(' • ');
  };

  if (!place) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Place Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Photo */}
          {photoUrl && (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photoUrl }} style={styles.photo} />
            </View>
          )}

          {/* Place Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.address}>{place.address}</Text>
            
            {/* Rating and Price */}
            <View style={styles.ratingContainer}>
              {place.rating && (
                <View style={styles.rating}>
                  <Ionicons name="star" size={16} color="#FFA500" />
                  <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
                </View>
              )}
              {place.priceLevel !== undefined && (
                <Text style={styles.priceText}>{getPriceLevelText(place.priceLevel)}</Text>
              )}
            </View>

            {/* Types */}
            {place.types && (
              <Text style={styles.types}>{getTypeText(place.types)}</Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleOpenInMaps}>
              <Ionicons name="map" size={20} color="#4285F4" />
              <Text style={styles.actionButtonText}>View on Maps</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
              <Ionicons name="navigate" size={20} color="#4285F4" />
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Plan Event Button */}
          <TouchableOpacity 
            style={styles.planEventButton} 
            onPress={handlePlanEvent}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={24} color="white" />
            <Text style={styles.planEventButtonText}>Plan Event Here</Text>
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4285F4" />
              <Text style={styles.loadingText}>Loading details...</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  photoContainer: {
    height: 200,
    backgroundColor: '#F5F5F5',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 20,
  },
  placeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    lineHeight: 22,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  types: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4285F4',
    marginLeft: 8,
  },
  planEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700', // Yellow color
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  planEventButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
});
