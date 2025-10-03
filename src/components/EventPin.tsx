import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface EventPinProps {
  event: {
    id: string;
    name: string;
    activity: string;
    participants_count: number;
    max_participants: number;
    status: 'live' | 'past' | 'cancelled';
    start_time?: string;
    created_at: string;
  };
  onPress: () => void;
  isSelected: boolean;
}

export default function EventPin({ event, onPress, isSelected }: EventPinProps) {
  const isLive = event.status === 'live';
  const isFull = event.participants_count >= event.max_participants;
  const isStartingSoon = event.start_time && 
    new Date(event.start_time).getTime() - Date.now() < 30 * 60 * 1000; // 30 minutes

  const getPinColor = () => {
    if (isFull) return '#ef4444'; // Red for full
    if (isStartingSoon) return '#f59e0b'; // Orange for starting soon
    if (isLive) return '#10b981'; // Green for live
    return '#6b7280'; // Gray for past/cancelled
  };

  const getActivityIcon = (activity: string) => {
    const activityIcons: { [key: string]: string } = {
      'Football': 'football',
      'Basketball': 'basketball',
      'Tennis': 'tennisball',
      'Swimming': 'water',
      'Gym Workout': 'fitness',
      'Yoga': 'leaf',
      'Running': 'walk',
      'Cycling': 'bicycle',
      'Volleyball': 'volleyball',
      'Badminton': 'badminton',
      'Soccer': 'football',
      'Baseball': 'baseball',
      'Hockey': 'hockey-puck',
      'Golf': 'golf',
      'Boxing': 'fist',
      'Martial Arts': 'shield',
    };
    return activityIcons[activity] || 'fitness';
  };

  return (
    <TouchableOpacity
      style={[
        styles.pinContainer,
        { backgroundColor: getPinColor() },
        isSelected && styles.selectedPin
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.pinContent}>
        <Ionicons 
          name={getActivityIcon(event.activity) as any} 
          size={16} 
          color="white" 
        />
        <Text style={styles.participantCount}>
          {event.participants_count}/{event.max_participants}
        </Text>
      </View>
      
      {/* Status indicator */}
      {isLive && (
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
        </View>
      )}
      
      {isStartingSoon && (
        <View style={styles.startingSoonIndicator}>
          <Text style={styles.startingSoonText}>!</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pinContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'white',
  },
  selectedPin: {
    transform: [{ scale: 1.2 }],
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },
  pinContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantCount: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 2,
  },
  liveIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  startingSoonIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startingSoonText: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
  },
});



