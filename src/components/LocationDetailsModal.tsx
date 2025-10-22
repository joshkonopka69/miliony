/**
 * Location Details Modal
 * Shows details about a selected location with list of events at that location
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { PlaceLocation } from '../services/googlePlacesService';
import { getPlacePhotoUrl, calculateDistance } from '../services/googlePlacesService';

interface LocationEvent {
  id: string;
  title: string;
  sport_type: string;
  scheduled_datetime: string;
  min_participants: number;
  max_participants: number;
  skill_level?: string;
  currentParticipants: number;
}

interface LocationDetailsModalProps {
  visible: boolean;
  location: PlaceLocation | null;
  events: LocationEvent[];
  isLoading: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onCreateEvent: () => void;
  onEventPress: (event: LocationEvent) => void;
}

const getSportEmoji = (sportType: string): string => {
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
    boxing: '🥊',
  };
  return emojiMap[sportType.toLowerCase()] || '🏅';
};

const formatEventDate = (dateString: string): string => {
  const eventDate = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = eventDate.toDateString() === now.toDateString();
  const isTomorrow = eventDate.toDateString() === tomorrow.toDateString();

  const timeStr = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) {
    return `Today • ${timeStr}`;
  } else if (isTomorrow) {
    return `Tomorrow • ${timeStr}`;
  } else {
    const dateStr = eventDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `${dateStr} • ${timeStr}`;
  }
};

const EventCard: React.FC<{ event: LocationEvent; onPress: () => void }> = ({
  event,
  onPress,
}) => {
  const participantPercentage = (event.currentParticipants / event.max_participants) * 100;

  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventEmoji}>{getSportEmoji(event.sport_type)}</Text>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {event.title}
        </Text>
      </View>

      <Text style={styles.eventDateTime}>
        📅 {formatEventDate(event.scheduled_datetime)}
      </Text>

      <View style={styles.participantsSection}>
        <Text style={styles.participantsText}>
          👥 {event.currentParticipants}/{event.max_participants} players
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${Math.min(participantPercentage, 100)}%` }]}
          />
        </View>
      </View>

      <View style={styles.eventFooter}>
        <Text style={styles.skillLevel}>🎯 Skill: {event.skill_level || 'Any'}</Text>
        <View style={styles.joinButton}>
          <Text style={styles.joinButtonText}>View →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const EmptyState: React.FC = () => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyEmoji}>📅</Text>
    <Text style={styles.emptyTitle}>No events yet</Text>
    <Text style={styles.emptyDescription}>
      Be the first to create an event at this location!
    </Text>
  </View>
);

export const LocationDetailsModal: React.FC<LocationDetailsModalProps> = ({
  visible,
  location,
  events,
  isLoading,
  userLocation,
  onClose,
  onCreateEvent,
  onEventPress,
}) => {
  if (!location) return null;

  const distance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        location.latitude,
        location.longitude
      )
    : null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header with photo */}
        {location.photoReference && (
          <Image
            source={{ uri: getPlacePhotoUrl(location.photoReference, 800) }}
            style={styles.headerPhoto}
          />
        )}

        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color="#111827" />
        </TouchableOpacity>

        {/* Location info */}
        <ScrollView style={styles.content}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{location.name}</Text>
            <Text style={styles.locationAddress}>{location.address}</Text>
            <View style={styles.locationMeta}>
              {location.rating && (
                <Text style={styles.rating}>⭐ {location.rating.toFixed(1)}</Text>
              )}
              {distance !== null && (
                <Text style={styles.distance}>📍 {distance} km away</Text>
              )}
            </View>
          </View>

          {/* Events section */}
          <View style={styles.eventsSection}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Loading events...</Text>
              </View>
            ) : events.length > 0 ? (
              events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={() => onEventPress(event)}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </View>
        </ScrollView>

        {/* Create event button */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.createEventButton} onPress={onCreateEvent}>
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.createEventButtonText}>Create Event at This Location</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerPhoto: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  content: {
    flex: 1,
  },
  locationInfo: {
    padding: 20,
    backgroundColor: 'white',
  },
  locationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  locationAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  locationMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  rating: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  distance: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  eventsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  eventDateTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  participantsSection: {
    marginBottom: 8,
  },
  participantsText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  skillLevel: {
    fontSize: 12,
    color: '#6b7280',
  },
  joinButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  bottomButtonContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  createEventButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  createEventButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LocationDetailsModal;








