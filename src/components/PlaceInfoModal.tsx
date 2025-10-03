import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { PlaceDetails } from '../services/placesApi';

interface PlaceInfoModalProps {
  visible: boolean;
  onClose: () => void;
  placeDetails: PlaceDetails | null;
  onCreateMeetup: (placeDetails: PlaceDetails) => void;
  loading?: boolean;
}

const { width, height } = Dimensions.get('window');

export default function PlaceInfoModal({
  visible,
  onClose,
  placeDetails,
  onCreateMeetup,
  loading = false,
}: PlaceInfoModalProps) {
  console.log('🏢 PlaceInfoModal rendered:', { visible, loading, placeDetails: !!placeDetails });
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (placeDetails?.photos && placeDetails.photos.length > 0) {
      setCurrentPhotoIndex(0);
    }
  }, [placeDetails]);

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Loading Place Details...</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Fetching place information...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (!placeDetails) return null;

  const handleCall = () => {
    if (placeDetails.phoneNumber) {
      const phoneUrl = `tel:${placeDetails.phoneNumber}`;
      Linking.openURL(phoneUrl).catch(() => {
        Alert.alert('Error', 'Unable to make phone call');
      });
    } else {
      Alert.alert('No Phone Number', 'Phone number not available for this place');
    }
  };

  const handleWebsite = () => {
    if (placeDetails.website) {
      Linking.openURL(placeDetails.website).catch(() => {
        Alert.alert('Error', 'Unable to open website');
      });
    } else {
      Alert.alert('No Website', 'Website not available for this place');
    }
  };

  const handleDirections = () => {
    const { lat, lng } = placeDetails.coordinates;
    const label = encodeURIComponent(placeDetails.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lng}(${label})`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        // Fallback to Google Maps web
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        Linking.openURL(webUrl);
      });
    }
  };

  const handleCreateMeetup = () => {
    onCreateMeetup(placeDetails);
    onClose();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('✨');
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push('☆');
    }

    return stars.join('');
  };

  const renderPriceLevel = (priceLevel?: number) => {
    if (!priceLevel) return null;
    return '💰'.repeat(priceLevel);
  };

  const renderPhotos = () => {
    if (!placeDetails.photos || placeDetails.photos.length === 0) {
      return (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoPlaceholderText}>📷 No photos available</Text>
        </View>
      );
    }

    return (
      <View style={styles.photosContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentPhotoIndex(index);
          }}
        >
          {placeDetails.photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image
                source={{ uri: photo.url || `https://via.placeholder.com/400x300/cccccc/666666?text=Photo+${index + 1}` }}
                style={styles.photo}
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>
        {placeDetails.photos.length > 1 && (
          <View style={styles.photoIndicator}>
            <Text style={styles.photoIndicatorText}>
              {currentPhotoIndex + 1} / {placeDetails.photos.length}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderReviews = () => {
    if (!placeDetails.reviews || placeDetails.reviews.length === 0) {
      return null;
    }

    return (
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        {placeDetails.reviews.slice(0, 3).map((review, index) => (
          <View key={index} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewAuthor}>{review.authorName}</Text>
              <View style={styles.reviewRating}>
                <Text>{renderStars(review.rating)}</Text>
              </View>
            </View>
            <Text style={styles.reviewText} numberOfLines={3}>
              {review.text}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderOpeningHours = () => {
    if (!placeDetails.openingHours) return null;

    return (
      <View style={styles.hoursSection}>
        <Text style={styles.sectionTitle}>Hours</Text>
        <View style={styles.hoursContainer}>
          <Text style={[
            styles.openStatus,
            placeDetails.openingHours.openNow ? styles.openNow : styles.closedNow
          ]}>
            {placeDetails.openingHours.openNow ? '🟢 Open Now' : '🔴 Closed'}
          </Text>
          {placeDetails.openingHours.weekdayText.map((day, index) => (
            <Text key={index} style={styles.hoursText}>{day}</Text>
          ))}
        </View>
      </View>
    );
  };

  const renderPlaceTypes = () => {
    if (!placeDetails.types || placeDetails.types.length === 0) return null;

    const typeIcons: { [key: string]: string } = {
      'gym': '💪',
      'park': '🌳',
      'stadium': '🏟️',
      'swimming_pool': '🏊',
      'sports_complex': '🏃',
      'restaurant': '🍽️',
      'cafe': '☕',
      'shopping_mall': '🛍️',
      'tourist_attraction': '🎯',
      'health': '🏥',
      'default': '📍'
    };

    return (
      <View style={styles.typesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.typesContainer}>
          {placeDetails.types.slice(0, 5).map((type, index) => (
            <View key={index} style={styles.typeChip}>
              <Text style={styles.typeIcon}>
                {typeIcons[type] || typeIcons.default}
              </Text>
              <Text style={styles.typeText}>
                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderFacilityInfo = () => {
    const facilities = [];
    
    if (placeDetails.phoneNumber) facilities.push('📞 Phone Available');
    if (placeDetails.website) facilities.push('🌐 Website Available');
    if (placeDetails.openingHours) facilities.push('🕒 Hours Listed');
    if (placeDetails.photos && placeDetails.photos.length > 0) facilities.push('📷 Photos Available');
    if (placeDetails.reviews && placeDetails.reviews.length > 0) facilities.push('⭐ Reviews Available');
    if (placeDetails.rating) facilities.push('⭐ Rated');

    if (facilities.length === 0) return null;

    return (
      <View style={styles.facilitiesSection}>
        <Text style={styles.sectionTitle}>Facilities & Services</Text>
        <View style={styles.facilitiesContainer}>
          {facilities.map((facility, index) => (
            <Text key={index} style={styles.facilityItem}>{facility}</Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Place Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Photos */}
          {renderPhotos()}

          {/* Basic Info */}
          <View style={styles.basicInfo}>
            <Text style={styles.placeName}>{placeDetails.name}</Text>
            <Text style={styles.address}>{placeDetails.address}</Text>
            
            <View style={styles.ratingContainer}>
              {placeDetails.rating && (
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingText}>{renderStars(placeDetails.rating)}</Text>
                  <Text style={styles.ratingNumber}>({placeDetails.rating})</Text>
                </View>
              )}
              {placeDetails.priceLevel && (
                <Text style={styles.priceText}>{renderPriceLevel(placeDetails.priceLevel)}</Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {placeDetails.phoneNumber && (
              <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                <Text style={styles.actionButtonIcon}>📞</Text>
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
            )}

            {placeDetails.website && (
              <TouchableOpacity style={styles.actionButton} onPress={handleWebsite}>
                <Text style={styles.actionButtonIcon}>🌐</Text>
                <Text style={styles.actionButtonText}>Website</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
              <Text style={styles.actionButtonIcon}>🧭</Text>
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Opening Hours */}
          {renderOpeningHours()}

          {/* Place Types */}
          {renderPlaceTypes()}

          {/* Facilities & Services */}
          {renderFacilityInfo()}

          {/* Reviews */}
          {renderReviews()}

          {/* Create Meetup Button */}
          <TouchableOpacity style={styles.createMeetupButton} onPress={handleCreateMeetup}>
            <Text style={styles.createMeetupButtonIcon}>🏃</Text>
            <Text style={styles.createMeetupButtonText}>Create Meetup Here</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 30,
  },
  content: {
    flex: 1,
  },
  photosContainer: {
    height: 200,
    position: 'relative',
  },
  photoContainer: {
    width: width,
    height: 200,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 16,
    color: '#666',
  },
  photoIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoIndicatorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  basicInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  placeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 16,
  },
  ratingNumber: {
    fontSize: 14,
    color: '#666',
  },
  priceText: {
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonIcon: {
    fontSize: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  hoursSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  hoursContainer: {
    gap: 4,
  },
  openStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  openNow: {
    color: '#22c55e',
  },
  closedNow: {
    color: '#ef4444',
  },
  hoursText: {
    fontSize: 14,
    color: '#666',
  },
  reviewsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewItem: {
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewRating: {
    fontSize: 12,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  createMeetupButton: {
    margin: 20,
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  createMeetupButtonIcon: {
    fontSize: 20,
  },
  createMeetupButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  typesSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  typeIcon: {
    fontSize: 14,
  },
  typeText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  facilitiesSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  facilitiesContainer: {
    gap: 8,
  },
  facilityItem: {
    fontSize: 14,
    color: '#666',
    paddingVertical: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  placeholder: {
    width: 30,
  },
});
