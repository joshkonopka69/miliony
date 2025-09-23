import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Linking,
} from 'react-native';

interface VenueInfo {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  priceLevel?: number;
  phoneNumber?: string;
  website?: string;
  openingHours?: string[];
  photos?: string[];
}

interface VenueInfoSheetProps {
  visible: boolean;
  venue: VenueInfo | null;
  onClose: () => void;
  onCreateEvent: () => void;
}

export default function VenueInfoSheet({
  visible,
  venue,
  onClose,
  onCreateEvent,
}: VenueInfoSheetProps) {
  if (!visible || !venue) return null;

  const handleCall = () => {
    if (venue.phoneNumber) {
      Linking.openURL(`tel:${venue.phoneNumber}`);
    }
  };

  const handleWebsite = () => {
    if (venue.website) {
      Linking.openURL(venue.website);
    }
  };

  const handleDirections = () => {
    const encodedAddress = encodeURIComponent(venue.address);
    const url = `https://maps.google.com/maps?q=${encodedAddress}`;
    Linking.openURL(url);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push('☆');
    }
    return stars.join('');
  };

  const renderPriceLevel = (level: number) => {
    return '$'.repeat(level);
  };

  const formatOpeningHours = (hours: string[]) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = hours.find(hour => 
      hour.toLowerCase().includes(today.toLowerCase())
    );
    return todayHours || 'Hours not available';
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.dragHandle} />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Venue Name and Rating */}
          <View style={styles.venueHeader}>
            <Text style={styles.venueName}>{venue.name}</Text>
            <View style={styles.ratingContainer}>
              {venue.rating && (
                <View style={styles.rating}>
                  <Text style={styles.ratingStars}>{renderStars(venue.rating)}</Text>
                  <Text style={styles.ratingText}>{venue.rating.toFixed(1)}</Text>
                </View>
              )}
              {venue.priceLevel && (
                <Text style={styles.priceLevel}>
                  {renderPriceLevel(venue.priceLevel)}
                </Text>
              )}
            </View>
          </View>

          {/* Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Address</Text>
            <Text style={styles.addressText}>{venue.address}</Text>
            <TouchableOpacity style={styles.directionsButton} onPress={handleDirections}>
              <Text style={styles.directionsText}>Get Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Contact Info */}
          {(venue.phoneNumber || venue.website) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📞 Contact</Text>
              {venue.phoneNumber && (
                <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
                  <Text style={styles.contactText}>{venue.phoneNumber}</Text>
                  <Text style={styles.contactAction}>Call</Text>
                </TouchableOpacity>
              )}
              {venue.website && (
                <TouchableOpacity style={styles.contactItem} onPress={handleWebsite}>
                  <Text style={styles.contactText}>Visit Website</Text>
                  <Text style={styles.contactAction}>Open</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Opening Hours */}
          {venue.openingHours && venue.openingHours.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🕒 Hours</Text>
              <Text style={styles.hoursText}>{formatOpeningHours(venue.openingHours)}</Text>
            </View>
          )}

          {/* Photos Placeholder */}
          {venue.photos && venue.photos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📸 Photos</Text>
              <View style={styles.photosContainer}>
                <Text style={styles.photosText}>
                  {venue.photos.length} photo{venue.photos.length !== 1 ? 's' : ''} available
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.createEventButton}
            onPress={onCreateEvent}
            activeOpacity={0.8}
          >
            <Text style={styles.createEventText}>Create Event Here</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: '80%',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  venueHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  venueName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingStars: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  priceLevel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  directionsButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  directionsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#374151',
  },
  contactAction: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 16,
    color: '#374151',
  },
  photosContainer: {
    paddingVertical: 8,
  },
  photosText: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  createEventButton: {
    height: 56,
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fbbf24',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createEventText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
