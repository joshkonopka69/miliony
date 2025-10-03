import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import Button from './ui/Button';
import Card from './ui/Card';
import { EventService } from '../services/eventService';

interface EventDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  event: {
    id: string;
    name: string;
    description: string;
    activity: string;
    max_participants: number;
    participants_count: number;
    location_name: string;
    latitude: number;
    longitude: number;
    created_by: string;
    status: 'live' | 'past' | 'cancelled';
    start_time?: string;
    end_time?: string;
    created_at: string;
    participants: string[];
  };
  currentUserId?: string;
  onJoinEvent?: (eventId: string) => void;
  onLeaveEvent?: (eventId: string) => void;
}

const { width } = Dimensions.get('window');

export default function EventDetailsModal({
  visible,
  onClose,
  event,
  currentUserId,
  onJoinEvent,
  onLeaveEvent,
}: EventDetailsModalProps) {
  // Safety check for null event
  if (!event) {
    return null;
  }
  const [loading, setLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(
    currentUserId && event.participants ? event.participants.includes(currentUserId) : false
  );

  const isLive = event.status === 'live';
  const isFull = event.participants_count >= event.max_participants;
  const isCreator = currentUserId === event.created_by;
  const canJoin = isLive && !isFull && !isJoined && !isCreator;

  const handleJoinEvent = async () => {
    if (!currentUserId) {
      Alert.alert('Login Required', 'Please log in to join events.');
      return;
    }

    setLoading(true);
    try {
      await EventService.joinEvent(event.id, currentUserId);
      setIsJoined(true);
      onJoinEvent?.(event.id);
      Alert.alert('Success', 'You have joined the event!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join event');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!currentUserId) {
      return;
    }

    setLoading(true);
    try {
      await EventService.leaveEvent(event.id, currentUserId);
      setIsJoined(false);
      onLeaveEvent?.(event.id);
      Alert.alert('Success', 'You have left the event.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to leave event');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'No specific time';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = () => {
    switch (event.status) {
      case 'live': return '#10b981';
      case 'past': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (event.status) {
      case 'live': return 'Live';
      case 'past': return 'Past';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

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
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Event Status */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
            {isLive && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>

          {/* Event Info */}
          <Card style={styles.eventCard}>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.activity}>{event.activity}</Text>
            
            {event.description && (
              <Text style={styles.description}>{event.description}</Text>
            )}

            <View style={styles.detailsRow}>
              <Ionicons name="location" size={16} color={theme.colors.text} />
              <Text style={styles.detailText}>{event.location_name}</Text>
            </View>

            <View style={styles.detailsRow}>
              <Ionicons name="people" size={16} color={theme.colors.text} />
              <Text style={styles.detailText}>
                {event.participants_count}/{event.max_participants} participants
              </Text>
            </View>

            {event.start_time && (
              <View style={styles.detailsRow}>
                <Ionicons name="time" size={16} color={theme.colors.text} />
                <Text style={styles.detailText}>
                  Starts: {formatDateTime(event.start_time)}
                </Text>
              </View>
            )}

            {event.end_time && (
              <View style={styles.detailsRow}>
                <Ionicons name="time" size={16} color={theme.colors.text} />
                <Text style={styles.detailText}>
                  Ends: {formatDateTime(event.end_time)}
                </Text>
              </View>
            )}
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {isCreator ? (
              <Button
                title="You Created This Event"
                onPress={() => {}}
                style={[styles.actionButton, styles.creatorButton]}
                disabled
              />
            ) : isJoined ? (
              <Button
                title="Leave Event"
                onPress={handleLeaveEvent}
                style={[styles.actionButton, styles.leaveButton]}
                loading={loading}
              />
            ) : canJoin ? (
              <Button
                title="Join Event"
                onPress={handleJoinEvent}
                style={[styles.actionButton, styles.joinButton]}
                loading={loading}
              />
            ) : (
              <Button
                title={isFull ? "Event Full" : "Event Not Available"}
                onPress={() => {}}
                style={[styles.actionButton, styles.disabledButton]}
                disabled
              />
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  liveText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  eventCard: {
    marginBottom: 20,
  },
  eventName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  activity: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
  },
  actionContainer: {
    marginTop: 20,
  },
  actionButton: {
    height: 50,
    borderRadius: 12,
  },
  joinButton: {
    backgroundColor: theme.colors.primary,
  },
  leaveButton: {
    backgroundColor: '#ef4444',
  },
  creatorButton: {
    backgroundColor: '#6b7280',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
});