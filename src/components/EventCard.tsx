import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MyEvent, SPORT_COLORS } from '../types/event';
import {
  formatEventDate,
  formatEventTime,
  formatDistance,
  getStatusBadge,
  isEventLive,
} from '../utils/eventGrouping';

interface EventCardProps {
  event: MyEvent;
  onPress: () => void;
  onChatPress: () => void;
  onLeavePress: () => void;
}

export default function EventCard({
  event,
  onPress,
  onChatPress,
  onLeavePress,
}: EventCardProps) {
  const sportColor = SPORT_COLORS[event.activity];
  const statusBadge = getStatusBadge(event);
  const isLive = isEventLive(event);
  
  // Calculate participant percentage for progress bar
  const participantPercent = (event.participants.current / event.participants.max) * 100;
  const isAlmostFull = participantPercent >= 80;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header Row: Sport Icon + Name + Status Badge */}
      <View style={styles.header}>
        {/* Sport Icon */}
        <View style={[styles.sportIcon, { backgroundColor: sportColor }]}>
          <Ionicons 
            name={getSportIcon(event.activity)} 
            size={22} 
            color="#000000" 
          />
        </View>

        {/* Event Name */}
        <View style={styles.headerInfo}>
          <Text style={styles.eventName} numberOfLines={1}>
            {event.name}
          </Text>
          <Text style={styles.activityLabel}>{event.activity}</Text>
        </View>

        {/* Status Badge */}
        {statusBadge && (
          <View style={[
            styles.statusBadge,
            isLive && styles.statusBadgeLive
          ]}>
            <Text style={[
              styles.statusBadgeText,
              isLive && styles.statusBadgeTextLive
            ]}>
              {statusBadge}
            </Text>
          </View>
        )}
      </View>

      {/* Participants Progress */}
      <View style={styles.participantsSection}>
        <View style={styles.participantsRow}>
          <Ionicons name="people" size={16} color="#6B7280" />
          <Text style={styles.participantsText}>
            {event.participants.current}/{event.participants.max} joined
          </Text>
          {isAlmostFull && (
            <View style={styles.almostFullBadge}>
              <Text style={styles.almostFullText}>Almost full</Text>
            </View>
          )}
        </View>
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${participantPercent}%`,
                backgroundColor: isAlmostFull ? '#F59E0B' : '#10B981'
              }
            ]} 
          />
        </View>
      </View>

      {/* Location */}
      <View style={styles.infoRow}>
        <Ionicons name="location" size={16} color="#6B7280" />
        <Text style={styles.infoText} numberOfLines={1}>
          {event.location.name}
          {event.location.distance && ` (${formatDistance(event.location.distance)})`}
        </Text>
      </View>

      {/* Time */}
      <View style={styles.infoRow}>
        <Ionicons name="time" size={16} color="#6B7280" />
        <Text style={styles.infoText}>
          {formatEventDate(event.startTime)}, {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        {/* Primary: View Details */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryButton]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>View Details</Text>
        </TouchableOpacity>

        {/* Secondary: Chat */}
        {event.chatEnabled && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={onChatPress}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble" size={18} color="#000000" />
          </TouchableOpacity>
        )}

        {/* Tertiary: Leave */}
        {event.role === 'joined' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.tertiaryButton]}
            onPress={onLeavePress}
            activeOpacity={0.7}
          >
            <Ionicons name="exit-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Helper function to get sport-specific icon
function getSportIcon(activity: string): keyof typeof Ionicons.glyphMap {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    Football: 'football',
    Basketball: 'basketball',
    Tennis: 'tennisball',
    Volleyball: 'basketball', // Volleyball uses same
    Running: 'walk',
    Cycling: 'bicycle',
    Swimming: 'water',
    Gym: 'barbell',
  };
  return icons[activity] || 'fitness';
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  activityLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  statusBadgeLive: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  statusBadgeTextLive: {
    color: '#EF4444',
  },
  participantsSection: {
    marginBottom: 12,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  participantsText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  almostFullBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
  },
  almostFullText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#FDB924',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  secondaryButton: {
    width: 44,
    backgroundColor: '#F3F4F6',
  },
  tertiaryButton: {
    width: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
  },
});

