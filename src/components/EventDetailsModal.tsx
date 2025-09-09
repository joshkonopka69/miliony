import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';

interface EventDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    sport: string;
    sportIcon: string;
    description: string;
    image?: string;
    minPlayers?: number;
    maxPlayers?: number;
    isOpen: boolean;
    currentPlayers: number;
    maxPlayers?: number;
    location: string;
    date: string;
    time: string;
    organizer: string;
    organizerAvatar?: string;
  } | null;
  onJoinEvent?: (eventId: string) => void;
}

const SPORT_ICONS: { [key: string]: string } = {
  'Basketball': '🏀',
  'Tennis': '🎾',
  'Running': '🏃',
  'Football': '⚽',
  'Volleyball': '🏐',
  'Badminton': '🏸',
  'Swimming': '🏊',
  'Cycling': '🚴',
  'Gym': '🏋️',
  'Yoga': '🧘',
};

export default function EventDetailsModal({ visible, onClose, event, onJoinEvent }: EventDetailsModalProps) {
  const [isJoining, setIsJoining] = useState(false);

  if (!event) return null;

  const handleJoinEvent = async () => {
    if (event.isOpen || (event.maxPlayers && event.currentPlayers < event.maxPlayers)) {
      setIsJoining(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsJoining(false);
        Alert.alert('Success', 'You have successfully joined the event!');
        if (onJoinEvent) {
          onJoinEvent(event.id);
        }
        onClose();
      }, 1500);
    } else {
      Alert.alert('Event Full', 'This event has reached maximum capacity.');
    }
  };

  const canJoin = event.isOpen || (event.maxPlayers && event.currentPlayers < event.maxPlayers);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Event Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Event Image */}
          {event.image && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              <View style={styles.imageOverlay}>
                <View style={styles.sportBadge}>
                  <Text style={styles.sportIcon}>{SPORT_ICONS[event.sport] || '🏃'}</Text>
                  <Text style={styles.sportName}>{event.sport}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Event Info */}
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            
            {/* Date and Time */}
            <View style={styles.timeInfo}>
              <View style={styles.timeItem}>
                <Text style={styles.timeIcon}>📅</Text>
                <Text style={styles.timeText}>{event.date}</Text>
              </View>
              <View style={styles.timeItem}>
                <Text style={styles.timeIcon}>🕐</Text>
                <Text style={styles.timeText}>{event.time}</Text>
              </View>
              <View style={styles.timeItem}>
                <Text style={styles.timeIcon}>📍</Text>
                <Text style={styles.timeText}>{event.location}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>

            {/* Player Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Players</Text>
              <View style={styles.playerInfo}>
                <View style={styles.playerCount}>
                  <Text style={styles.playerCountText}>
                    {event.currentPlayers} {event.isOpen ? 'joined' : `of ${event.maxPlayers} players`}
                  </Text>
                  {!event.isOpen && (
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${(event.currentPlayers / event.maxPlayers!) * 100}%` }
                        ]} 
                      />
                    </View>
                  )}
                </View>
                {event.isOpen && (
                  <View style={styles.openBadge}>
                    <Text style={styles.openBadgeText}>Open Event</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Organizer */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Organizer</Text>
              <View style={styles.organizerInfo}>
                {event.organizerAvatar && (
                  <Image source={{ uri: event.organizerAvatar }} style={styles.organizerAvatar} />
                )}
                <Text style={styles.organizerName}>{event.organizer}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Join Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.joinButton, 
              !canJoin && styles.joinButtonDisabled
            ]} 
            onPress={handleJoinEvent}
            disabled={!canJoin || isJoining}
          >
            <Text style={[
              styles.joinButtonText,
              !canJoin && styles.joinButtonTextDisabled
            ]}>
              {isJoining ? 'Joining...' : canJoin ? 'Join Event' : 'Event Full'}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sportIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  sportName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  eventInfo: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  timeInfo: {
    marginBottom: 24,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  timeText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerCount: {
    flex: 1,
  },
  playerCountText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  openBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  openBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  organizerName: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  joinButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  joinButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  joinButtonTextDisabled: {
    color: '#9CA3AF',
  },
});


