import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import Button from './ui/Button';

interface LiveEventStatusProps {
  event: {
    id: string;
    name: string;
    activity: string;
    participants_count: number;
    max_participants: number;
    status: 'live' | 'past' | 'cancelled';
    start_time?: string;
    created_at: string;
    created_by?: string;
  };
  participants: Array<{
    id: string;
    display_name: string;
    avatar_url?: string;
  }>;
  currentUserId?: string;
  onJoin: () => void;
  onLeave: () => void;
  onViewParticipants: () => void;
}

const { width } = Dimensions.get('window');

export default function LiveEventStatus({
  event,
  participants,
  currentUserId,
  onJoin,
  onLeave,
  onViewParticipants,
}: LiveEventStatusProps) {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isJoined, setIsJoined] = useState(
    currentUserId ? participants.some(p => p.id === currentUserId) : false
  );

  const isLive = event.status === 'live';
  const isFull = event.participants_count >= event.max_participants;
  const isCreator = currentUserId === event.created_by;
  const canJoin = isLive && !isFull && !isJoined && !isCreator;

  // Pulse animation for live events
  useEffect(() => {
    if (isLive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isLive, pulseAnim]);

  const getTimeUntilStart = () => {
    if (!event.start_time) return null;
    const startTime = new Date(event.start_time);
    const now = new Date();
    const diff = startTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Started';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `Starts in ${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `Starts in ${minutes}m`;
    } else {
      return 'Starting now';
    }
  };

  const getStatusColor = () => {
    if (isFull) return '#ef4444';
    if (isLive) return '#10b981';
    return '#6b7280';
  };

  const getStatusText = () => {
    if (isFull) return 'FULL';
    if (isLive) return 'LIVE';
    return 'INACTIVE';
  };

  return (
    <View style={styles.container}>
      {/* Live Indicator */}
      {isLive && (
        <Animated.View 
          style={[
            styles.liveIndicator,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </Animated.View>
      )}

      {/* Event Info */}
      <View style={styles.eventInfo}>
        <Text style={styles.eventName}>{event.name}</Text>
        <Text style={styles.activity}>{event.activity}</Text>
        
        {event.start_time && (
          <Text style={styles.timeText}>{getTimeUntilStart()}</Text>
        )}
      </View>

      {/* Participants Count */}
      <View style={styles.participantsContainer}>
        <View style={styles.participantsInfo}>
          <Ionicons name="people" size={16} color={theme.colors.textPrimary} />
          <Text style={styles.participantsText}>
            {event.participants_count}/{event.max_participants}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.participantsButton}
          onPress={onViewParticipants}
        >
          <Text style={styles.participantsButtonText}>View</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {isCreator ? (
          <Button
            title="You Created This Event"
            onPress={() => {}}
            style={{...styles.actionButton, ...styles.creatorButton}}
            disabled
          />
        ) : isJoined ? (
          <Button
            title="Leave Event"
            onPress={() => {
              setIsJoined(false);
              onLeave();
            }}
            style={{...styles.actionButton, ...styles.leaveButton}}
          />
        ) : canJoin ? (
          <Button
            title="Join Event"
            onPress={() => {
              setIsJoined(true);
              onJoin();
            }}
            style={{...styles.actionButton, ...styles.joinButton}}
          />
        ) : (
          <Button
            title={isFull ? "Event Full" : "Event Not Available"}
            onPress={() => {}}
            style={{...styles.actionButton, ...styles.disabledButton}}
            disabled
          />
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="time" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.statText}>
            {new Date(event.created_at).toLocaleTimeString()}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="location" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.statText}>Nearby</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  liveIndicator: {
    position: 'absolute',
    top: -8,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
  },
  eventInfo: {
    marginBottom: 12,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  activity: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginLeft: 6,
    fontWeight: '500',
  },
  participantsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
    marginRight: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  actionContainer: {
    marginBottom: 12,
  },
  actionButton: {
    height: 44,
    borderRadius: 8,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
});



