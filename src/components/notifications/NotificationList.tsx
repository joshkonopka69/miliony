import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from 'react-native';
import { NotificationData, NotificationType } from '../../services/notificationService';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: NotificationData[];
  isLoading?: boolean;
  isUpdating?: boolean;
  onRefresh?: () => void;
  onNotificationPress?: (notification: NotificationData) => void;
  onNotificationLongPress?: (notification: NotificationData) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onDelete?: (notificationId: string) => void;
  selectedNotifications?: Set<string>;
  isSelectionMode?: boolean;
  onSelectionToggle?: (notificationId: string) => void;
  emptyMessage?: string;
  emptySubtitle?: string;
  showFilters?: boolean;
  activeFilter?: 'all' | 'unread' | NotificationType;
  onFilterChange?: (filter: 'all' | 'unread' | NotificationType) => void;
  filterOptions?: Array<{ key: 'all' | 'unread' | NotificationType; label: string; count?: number }>;
}

export default function NotificationList({
  notifications,
  isLoading = false,
  isUpdating = false,
  onRefresh,
  onNotificationPress,
  onNotificationLongPress,
  onMarkAsRead,
  onDelete,
  selectedNotifications = new Set(),
  isSelectionMode = false,
  onSelectionToggle,
  emptyMessage = 'No notifications yet',
  emptySubtitle = 'You\'ll receive notifications about events, friends, and more!',
  showFilters = false,
  activeFilter = 'all',
  onFilterChange,
  filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
  ],
}: NotificationListProps) {
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setRefreshing(false);
  };

  const handleNotificationPress = (notification: NotificationData) => {
    if (onNotificationPress) {
      onNotificationPress(notification);
    }
  };

  const handleNotificationLongPress = (notification: NotificationData) => {
    if (onNotificationLongPress) {
      onNotificationLongPress(notification);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(notificationId);
    }
  };

  const handleDelete = (notificationId: string) => {
    if (onDelete) {
      onDelete(notificationId);
    }
  };

  const handleSelectionToggle = (notificationId: string) => {
    if (onSelectionToggle) {
      onSelectionToggle(notificationId);
    }
  };

  const handleFilterPress = (filter: 'all' | 'unread' | NotificationType) => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  const getNotificationIcon = (type: NotificationType): string => {
    const icons: { [key in NotificationType]: string } = {
      new_event_nearby: '📍',
      friend_request: '👤',
      friend_request_accepted: '✅',
      event_invitation: '📅',
      event_cancelled: '❌',
      event_updated: '📝',
      event_reminder: '⏰',
      chat_message: '💬',
      system_announcement: '📢',
      event_participant_joined: '👥',
      event_participant_left: '👋',
      event_starting_soon: '🚀',
      weather_alert: '🌤️',
      achievement_unlocked: '🏆',
      friend_activity: '🎯',
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type: NotificationType): string => {
    const colors: { [key in NotificationType]: string } = {
      new_event_nearby: '#4CAF50',
      friend_request: '#2196F3',
      friend_request_accepted: '#4CAF50',
      event_invitation: '#FF9800',
      event_cancelled: '#F44336',
      event_updated: '#FF9800',
      event_reminder: '#9C27B0',
      chat_message: '#2196F3',
      system_announcement: '#607D8B',
      event_participant_joined: '#4CAF50',
      event_participant_left: '#F44336',
      event_starting_soon: '#FF5722',
      weather_alert: '#FFC107',
      achievement_unlocked: '#FFD700',
      friend_activity: '#E91E63',
    };
    return colors[type] || '#666666';
  };

  const formatNotificationTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersList}>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterChip,
                    activeFilter === option.key && styles.filterChipActive
                  ]}
                  onPress={() => handleFilterPress(option.key)}
                >
                  <Text style={[
                    styles.filterChipText,
                    activeFilter === option.key && styles.filterChipTextActive
                  ]}>
                    {option.label} {option.count !== undefined ? `(${option.count})` : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Notifications List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {notifications.length > 0 ? (
            <View style={styles.notificationsList}>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  isSelected={selectedNotifications.has(notification.id)}
                  isSelectionMode={isSelectionMode}
                  onPress={() => handleNotificationPress(notification)}
                  onLongPress={() => handleNotificationLongPress(notification)}
                  onMarkAsRead={() => handleMarkAsRead(notification.id)}
                  onDelete={() => handleDelete(notification.id)}
                  onSelectionToggle={() => handleSelectionToggle(notification.id)}
                  icon={getNotificationIcon(notification.type)}
                  color={getNotificationColor(notification.type)}
                  timeAgo={formatNotificationTime(notification.created_at)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>{emptyMessage}</Text>
              <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
            </View>
          )}

          {/* Updating State */}
          {isUpdating && (
            <View style={styles.updatingContainer}>
              <ActivityIndicator size="small" color="#FFD700" />
              <Text style={styles.updatingText}>Updating...</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filtersList: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  filterChipActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  filterChipTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  notificationsList: {
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  updatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  updatingText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
});
