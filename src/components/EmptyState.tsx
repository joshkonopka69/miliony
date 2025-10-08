import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'map' | 'events' | 'profile';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  variant = 'default',
}) => {
  const getIconColor = () => {
    switch (variant) {
      case 'map': return '#FDB924';
      case 'events': return '#10B981';
      case 'profile': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'map': return '#FEF3C7';
      case 'events': return '#D1FAE5';
      case 'profile': return '#EDE9FE';
      default: return '#F9FAFB';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <View style={[styles.iconContainer, { backgroundColor: getIconColor() }]}>
        <Ionicons name={icon as any} size={32} color="#FFFFFF" />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Predefined empty states for common scenarios
export const NoEventsEmptyState: React.FC<{ onBrowseEvents: () => void }> = ({ onBrowseEvents }) => (
  <EmptyState
    icon="calendar-outline"
    title="No Events Today"
    message="No sport events are happening today. Be the first to create one!"
    actionLabel="Browse Map"
    onAction={onBrowseEvents}
    variant="events"
  />
);

export const NoJoinedEventsEmptyState: React.FC<{ onBrowseEvents: () => void }> = ({ onBrowseEvents }) => (
  <EmptyState
    icon="people-outline"
    title="No Events Joined"
    message="You haven't joined any events yet. Find exciting events on the map!"
    actionLabel="Browse Events"
    onAction={onBrowseEvents}
    variant="events"
  />
);

export const NoNearbyEventsEmptyState: React.FC<{ onCreateEvent: () => void }> = ({ onCreateEvent }) => (
  <EmptyState
    icon="location-outline"
    title="No Events Nearby"
    message="No events found in your area. Create the first one!"
    actionLabel="Create Event"
    onAction={onCreateEvent}
    variant="map"
  />
);

export const NoFriendsEmptyState: React.FC<{ onAddFriends: () => void }> = ({ onAddFriends }) => (
  <EmptyState
    icon="person-add-outline"
    title="No Friends Yet"
    message="Add friends to see their events and invite them to yours!"
    actionLabel="Add Friends"
    onAction={onAddFriends}
    variant="profile"
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    margin: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#FDB924',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});