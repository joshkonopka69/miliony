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
  ImageSourcePropType,
} from 'react-native';
import { useTranslation } from '../contexts/TranslationContext';
import * as WebBrowser from 'expo-web-browser';
import { theme } from '../styles/theme';
import Button from './ui/Button';
import Card from './ui/Card';

// Sport-specific fallback images mapping
const SPORT_FALLBACK_IMAGES: Record<string, ImageSourcePropType> = {
  gym: require('../../assets/filter icons/gym.png'),
  stadium: require('../../assets/filter icons/stadium.png'),
  swimming_pool: require('../../assets/filter icons/swimming pool.png'),
  park: require('../../assets/filter icons/park.png'),
  sports_complex: require('../../assets/filters/icon_trophy_gold.png'),
  bowling_alley: require('../../assets/filter icons/bowling alley.png'),
  golf_course: require('../../assets/filter icons/golf course.png'),
  ice_rink: require('../../assets/filter icons/ice rink.png'),
  tennis_court: require('../../assets/filter icons/tennis court.png'),
  basketball_court: require('../../assets/filter icons/basketball court.png'),
  martial_arts_gym: require('../../assets/filter icons/Martial arts gyms.png'),
  grappling_hall: require('../../assets/filter icons/Grappling sport halls.png'),
};

// Get sport icon based on place types, searchType, or name
const getSportFallbackImage = (place: { types?: string[]; name?: string; searchType?: string } | null): ImageSourcePropType | null => {
  if (!place) return null;

  // Check searchType first (most reliable - set during API search)
  if (place.searchType && SPORT_FALLBACK_IMAGES[place.searchType]) {
    return SPORT_FALLBACK_IMAGES[place.searchType];
  }

  // Check place types
  if (place.types && Array.isArray(place.types)) {
    for (const type of place.types) {
      if (SPORT_FALLBACK_IMAGES[type]) {
        return SPORT_FALLBACK_IMAGES[type];
      }
    }
    // Check for common Google Places types
    if (place.types.includes('gym')) return SPORT_FALLBACK_IMAGES['gym'];
    if (place.types.includes('stadium')) return SPORT_FALLBACK_IMAGES['stadium'];
    if (place.types.includes('park')) return SPORT_FALLBACK_IMAGES['park'];
    if (place.types.includes('bowling_alley')) return SPORT_FALLBACK_IMAGES['bowling_alley'];
  }

  // Check name for keywords
  const name = (place.name || '').toLowerCase();
  if (name.includes('basketball') || name.includes('koszyków') || name.includes('boisko')) return SPORT_FALLBACK_IMAGES['basketball_court'];
  if (name.includes('tennis') || name.includes('kort')) return SPORT_FALLBACK_IMAGES['tennis_court'];
  if (name.includes('swim') || name.includes('pool') || name.includes('basen') || name.includes('pływal')) return SPORT_FALLBACK_IMAGES['swimming_pool'];
  if (name.includes('gym') || name.includes('fitness') || name.includes('siłownia')) return SPORT_FALLBACK_IMAGES['gym'];
  if (name.includes('stadium') || name.includes('stadion')) return SPORT_FALLBACK_IMAGES['stadium'];
  if (name.includes('golf')) return SPORT_FALLBACK_IMAGES['golf_course'];
  if (name.includes('bowling') || name.includes('kręgiel')) return SPORT_FALLBACK_IMAGES['bowling_alley'];
  if (name.includes('ice') || name.includes('skating') || name.includes('lodowisko')) return SPORT_FALLBACK_IMAGES['ice_rink'];
  if (name.includes('park')) return SPORT_FALLBACK_IMAGES['park'];
  if (name.includes('martial') || name.includes('boxing') || name.includes('mma') || name.includes('karate') || name.includes('taekwondo')) return SPORT_FALLBACK_IMAGES['martial_arts_gym'];
  if (name.includes('judo') || name.includes('wrestling') || name.includes('bjj') || name.includes('grappling')) return SPORT_FALLBACK_IMAGES['grappling_hall'];

  return null;
};

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
    searchType?: string; // Category used to search (for fallback icon)
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
      } else {
        setPhotoUrl(null);
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

  // Get fallback image for when no photo is available
  const fallbackImage = getSportFallbackImage(place);

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
            <Text style={{fontSize: 22, color: '#333'}}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.placeDetails?.title || 'Place Details'}<Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Photo or Fallback Sport Icon */}
          <View style={styles.photoContainer}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.photo} />
            ) : fallbackImage ? (
              <View style={styles.fallbackContainer}>
                <Image source={fallbackImage} style={styles.fallbackImage} resizeMode="contain" />
              </View>
            ) : (
              <View style={styles.noPhotoContainer}>
                <Text style={{fontSize: 54, color: '#FFD700'}}>📍</Text>
              </View>
            )}
          </View>

          {/* Place Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.address}>{place.address}</Text>

            {/* Rating and Price */}
            <View style={styles.ratingContainer}>
              {place.rating && (
                <View style={styles.rating}>
                  <Text style={{fontSize: 14, color: '#FFA500'}}>•</Text>
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
              <Text style={{fontSize: 18, color: '#4285F4'}}>•</Text>
              <Text style={styles.actionButtonText}>{t.placeDetails?.viewOnMaps || 'View on Maps'}<Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
              <Text style={{fontSize: 18, color: '#4285F4'}}>🧭</Text>
              <Text style={styles.actionButtonText}>{t.placeDetails?.directions || 'Directions'}<Text>
            </TouchableOpacity>
          </View>

          {/* Plan Event Button */}
          <TouchableOpacity
            style={styles.planEventButton}
            onPress={handlePlanEvent}
            activeOpacity={0.8}
          >
            <Text style={{fontSize: 22, color: 'white'}}>📅</Text>
            <Text style={styles.planEventButtonText}>{t.placeDetails?.planEvent || 'Plan Event Here'}<Text>
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4285F4" />
              <Text style={styles.loadingText}>{t.placeDetails?.loadingDetails || 'Loading details...'}<Text>
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
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 20,
  },
  fallbackImage: {
    width: 120,
    height: 120,
  },
  noPhotoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 40,
  },
});
