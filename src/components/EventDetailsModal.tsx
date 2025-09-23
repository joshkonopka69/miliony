import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
} from 'react-native';

interface Event {
  id: string;
  creatorId: string;
  activity: string;
  placeName: string;
  address: string;
  description: string;
  maxParticipants: number;
  participants: string[];
  time: string;
  createdAt: string;
}

interface EventDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  event: Event | null;
  currentUserId: string;
  onJoinEvent: (eventId: string) => void;
  onLeaveEvent: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
}

export default function EventDetailsModal({
  visible,
  onClose,
  event,
  currentUserId,
  onJoinEvent,
  onLeaveEvent,
  onDeleteEvent,
}: EventDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!event) return null;

  const isCreator = event.creatorId === currentUserId;
  const isParticipant = event.participants.includes(currentUserId);
  const canJoin = !isParticipant && event.participants.length < event.maxParticipants;
  const isFull = event.participants.length >= event.maxParticipants;

  const handleJoin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await onJoinEvent(event.id);
    } catch (error) {
      Alert.alert('Error', 'Failed to join event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeave = async () => {
    if (isLoading) return;
    
    Alert.alert(
      'Leave Event',
      'Are you sure you want to leave this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await onLeaveEvent(event.id);
            } catch (error) {
              Alert.alert('Error', 'Failed to leave event. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await onDeleteEvent(event.id);
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete event. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (activity: string) => {
    const iconMap: { [key: string]: string } = {
      'Football': '⚽',
      'Basketball': '🏀',
      'Tennis': '🎾',
      'Swimming': '🏊',
      'Gym Workout': '💪',
      'Yoga': '🧘',
      'Running': '🏃',
      'Cycling': '🚴',
      'Volleyball': '🏐',
      'Badminton': '🏸',
      'Squash': '🎾',
      'Boxing': '🥊',
      'Martial Arts': '🥋',
      'Dancing': '💃',
      'Hiking': '🥾',
      'Rock Climbing': '🧗',
      'Bouldering': '🧗‍♂️',
      'Skateboarding': '🛹',
    };
    return iconMap[activity] || '🏃';
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Event Details</Text>
          {isCreator && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Event Header */}
          <View style={styles.eventHeader}>
            <View style={styles.activityContainer}>
              <Text style={styles.activityIcon}>{getActivityIcon(event.activity)}</Text>
              <Text style={styles.activityName}>{event.activity}</Text>
            </View>
            <Text style={styles.venueName}>{event.placeName}</Text>
            <Text style={styles.venueAddress}>{event.address}</Text>
          </View>

          {/* Event Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📅 Date & Time</Text>
              <Text style={styles.infoValue}>{formatTime(event.time)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👥 Participants</Text>
              <Text style={styles.infoValue}>
                {event.participants.length}/{event.maxParticipants}
              </Text>
            </View>

            {event.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>📝 Description</Text>
                <Text style={styles.descriptionText}>{event.description}</Text>
              </View>
            )}
          </View>

          {/* Participants List */}
          <View style={styles.participantsSection}>
            <Text style={styles.participantsTitle}>
              Participants ({event.participants.length})
            </Text>
            <View style={styles.participantsList}>
              {event.participants.map((participantId, index) => (
                <View key={participantId} style={styles.participantItem}>
                  <View style={styles.participantAvatar}>
                    <Text style={styles.participantInitial}>
                      {participantId.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>
                      {participantId === event.creatorId ? 'You (Creator)' : `User ${index + 1}`}
                    </Text>
                    {participantId === event.creatorId && (
                      <Text style={styles.creatorBadge}>Event Creator</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          {isCreator ? (
            <View style={styles.creatorActions}>
              <Text style={styles.creatorText}>You created this event</Text>
            </View>
          ) : isParticipant ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.leaveButton]}
              onPress={handleLeave}
              disabled={isLoading}
            >
              <Text style={styles.leaveButtonText}>
                {isLoading ? 'Leaving...' : 'Leave Event'}
              </Text>
            </TouchableOpacity>
          ) : canJoin ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.joinButton]}
              onPress={handleJoin}
              disabled={isLoading}
            >
              <Text style={styles.joinButtonText}>
                {isLoading ? 'Joining...' : 'Join Event'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.fullEvent}>
              <Text style={styles.fullEventText}>Event is full</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
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
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  deleteText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventHeader: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  activityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  venueName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoSection: {
    paddingVertical: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 16,
  },
  descriptionLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
  participantsSection: {
    paddingVertical: 20,
  },
  participantsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  participantsList: {
    gap: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  participantInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  creatorBadge: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  leaveButton: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  creatorActions: {
    alignItems: 'center',
  },
  creatorText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  fullEvent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  fullEventText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
});
