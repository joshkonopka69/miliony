import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Image,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation, useAppRoute } from '../navigation/hooks';
import { ROUTES } from '../navigation/types';
import { MyEvent, SPORT_COLORS } from '../types/event';

// Sport emoji mapping
const SPORT_EMOJI_MAP: Record<string, string> = {
  basketball: '🏀',
  football: '⚽',
  soccer: '⚽',
  tennis: '🎾',
  running: '🏃‍♂️',
  cycling: '🚴‍♂️',
  swimming: '🏊‍♂️',
  gym: '💪',
  volleyball: '🏐',
  default: '🏅',
};

const getSportEmoji = (sportType: string): string => {
  return SPORT_EMOJI_MAP[sportType?.toLowerCase()] || SPORT_EMOJI_MAP.default;
};

// Format date and time
const formatEventDate = (date: Date): string => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) {
    return 'Today';
  } else if (isTomorrow) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    });
  }
};

const formatEventTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

const getTimeUntilEvent = (date: Date): string => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff < 0) return 'Event has started';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `In ${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `In ${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    const minutes = Math.floor(diff / (1000 * 60));
    return `In ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
};

export default function EventDetailsScreen() {
  const navigation = useAppNavigation();
  const route = useAppRoute<'EventDetails'>();
  const event = route.params?.game as MyEvent;

  const [hasJoined, setHasJoined] = useState(event?.role === 'joined');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleJoinEvent = () => {
    Alert.alert(
      'Join Event',
      `Are you sure you want to join "${event?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: () => {
            setHasJoined(true);
            Alert.alert('Success', 'You have joined the event!');
          },
        },
      ]
    );
  };

  const handleLeaveEvent = () => {
    Alert.alert(
      'Leave Event',
      `Are you sure you want to leave "${event?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            setHasJoined(false);
            Alert.alert('Left Event', 'You have left the event.');
          },
        },
      ]
    );
  };

  const handleChatPress = () => {
    navigation.navigate(ROUTES.GAME_CHAT, { game: event });
  };

  const handleShareEvent = async () => {
    try {
      const result = await Share.share({
        message: `Join me for ${event?.name} at ${event?.location.name} on ${formatEventDate(event?.startTime)}!`,
      });
      if (result.action === Share.sharedAction) {
        console.log('Event shared successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share event');
    }
  };

  const handleViewLocation = () => {
    // Navigate to map with this location
    Alert.alert('View Location', 'Opening map view...');
  };

  const handleViewParticipants = () => {
    Alert.alert('Participants', `${event?.participants.current} people have joined this event.`);
  };

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#D1D5DB" />
          <Text style={styles.errorTitle}>Event Not Found</Text>
          <Text style={styles.errorMessage}>
            This event could not be loaded
          </Text>
          <TouchableOpacity style={styles.errorButton} onPress={handleBack}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCreator = event.role === 'created';
  const sportColor = SPORT_COLORS[event.activity] || '#FDB924';

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <SafeAreaView style={styles.topBarSafeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareEvent}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Event Header Card */}
        <View style={styles.headerCard}>
          <View style={[styles.sportIconLarge, { backgroundColor: sportColor + '20' }]}>
            <Text style={styles.sportEmojiLarge}>{getSportEmoji(event.activity)}</Text>
          </View>
          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={styles.eventActivity}>{event.activity}</Text>
          
          {/* Time Until Event */}
          <View style={styles.timeUntilBadge}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.timeUntilText}>{getTimeUntilEvent(event.startTime)}</Text>
          </View>

          {/* Creator Badge */}
          {isCreator && (
            <View style={styles.creatorBadge}>
              <Ionicons name="star" size={14} color="#FDB924" />
              <Text style={styles.creatorBadgeText}>You created this event</Text>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Ionicons name="people" size={24} color="#FDB924" />
            <Text style={styles.statValue}>{event.participants.current}/{event.participants.max}</Text>
            <Text style={styles.statLabel}>Players</Text>
          </View>
          
          <View style={styles.statBox}>
            <Ionicons name="location" size={24} color="#FDB924" />
            <Text style={styles.statValue}>{event.location.distance?.toFixed(1) || '—'} km</Text>
            <Text style={styles.statLabel}>Away</Text>
          </View>
          
          <View style={styles.statBox}>
            <Ionicons name="trophy" size={24} color="#FDB924" />
            <Text style={styles.statValue}>All</Text>
            <Text style={styles.statLabel}>Levels</Text>
          </View>
        </View>

        {/* Date & Time Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={20} color="#1F2937" />
            <Text style={styles.sectionTitle}>Date & Time</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatEventDate(event.startTime)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Start Time</Text>
              <Text style={styles.detailValue}>{formatEventTime(event.startTime)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>End Time</Text>
              <Text style={styles.detailValue}>{formatEventTime(event.endTime)}</Text>
            </View>
          </View>
        </View>

        {/* Location Section */}
          <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color="#1F2937" />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.locationName}>{event.location.name}</Text>
            <Text style={styles.locationAddress}>{event.location.address}</Text>
            <TouchableOpacity
              style={styles.viewMapButton}
              onPress={handleViewLocation}
              activeOpacity={0.7}
            >
              <Ionicons name="map" size={16} color="#FDB924" />
              <Text style={styles.viewMapText}>View on Map</Text>
            </TouchableOpacity>
          </View>
              </View>

        {/* Participants Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={20} color="#1F2937" />
            <Text style={styles.sectionTitle}>Participants</Text>
              </View>
          <View style={styles.sectionContent}>
            <View style={styles.participantsInfo}>
              <View style={styles.participantsStat}>
                <Text style={styles.participantsNumber}>
                  {event.participants.current}
                </Text>
                <Text style={styles.participantsLabel}>Joined</Text>
              </View>
              <View style={styles.participantsDivider} />
              <View style={styles.participantsStat}>
                <Text style={styles.participantsNumber}>
                  {event.participants.max - event.participants.current}
                </Text>
                <Text style={styles.participantsLabel}>Spots Left</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewParticipantsButton}
              onPress={handleViewParticipants}
              activeOpacity={0.7}
            >
              <Text style={styles.viewParticipantsText}>View All Participants</Text>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </TouchableOpacity>
            </View>
          </View>

        {/* Description Section */}
        {event.description && (
            <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color="#1F2937" />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.descriptionText}>{event.description}</Text>
            </View>
            </View>
          )}

        {/* Organizer Section */}
            <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color="#1F2937" />
              <Text style={styles.sectionTitle}>Organizer</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.organizerCard}>
              <View style={styles.organizerAvatar}>
                <Text style={styles.organizerInitials}>
                  {event.createdBy.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              </View>
              <View style={styles.organizerInfo}>
                <Text style={styles.organizerName}>{event.createdBy.name}</Text>
                <Text style={styles.organizerRole}>Event Creator</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons */}
      <SafeAreaView style={styles.actionSafeArea}>
      <View style={styles.actionContainer}>
          {event.chatEnabled && (
        <TouchableOpacity
          style={styles.chatButton}
          onPress={handleChatPress}
              activeOpacity={0.7}
        >
              <Ionicons name="chatbubble-outline" size={20} color="#1F2937" />
              <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>
          )}

          {isCreator ? (
            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => Alert.alert('Manage Event', 'Event management options')}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={20} color="#000000" />
              <Text style={styles.manageButtonText}>Manage Event</Text>
            </TouchableOpacity>
          ) : hasJoined ? (
          <TouchableOpacity
            style={styles.leaveButton}
              onPress={handleLeaveEvent}
              activeOpacity={0.7}
          >
              <Ionicons name="exit-outline" size={20} color="#FFFFFF" />
              <Text style={styles.leaveButtonText}>Leave Event</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
              onPress={handleJoinEvent}
              activeOpacity={0.7}
              disabled={event.participants.current >= event.participants.max}
          >
              <Ionicons name="add-circle-outline" size={20} color="#000000" />
              <Text style={styles.joinButtonText}>
                {event.participants.current >= event.participants.max ? 'Event Full' : 'Join Event'}
              </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  // Top Bar Styles
  topBarSafeArea: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
  },
  topBar: {
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  // Header Card
  headerCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sportIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sportEmojiLarge: {
    fontSize: 40,
  },
  eventName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  eventActivity: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  timeUntilBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    marginTop: 8,
  },
  timeUntilText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
  },
  creatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDB924',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    marginTop: 8,
  },
  creatorBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Section Styles
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionContent: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  // Location
  locationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  viewMapText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FDB924',
  },
  // Participants
  participantsInfo: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  participantsStat: {
    flex: 1,
    alignItems: 'center',
  },
  participantsNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  participantsLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  participantsDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  viewParticipantsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  viewParticipantsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  // Description
  descriptionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  // Organizer
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDB924',
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  organizerRole: {
    fontSize: 13,
    color: '#6B7280',
  },
  // Action Buttons
  actionSafeArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  joinButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDB924',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  leaveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  manageButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDB924',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#FDB924',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  bottomSpacing: {
    height: 20,
  },
});
