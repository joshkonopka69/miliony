import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { useDialog } from '../../contexts/DialogContext';
import { NotificationData } from '../../services/notificationService';

interface NotificationItemProps {
  notification: NotificationData;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  onMarkAsRead?: () => void;
  onDelete?: () => void;
  onSelectionToggle?: () => void;
  icon?: string;
  color?: string;
  timeAgo?: string;
  showActions?: boolean;
  compact?: boolean;
}

export default function NotificationItem({
  notification,
  isSelected = false,
  isSelectionMode = false,
  onPress,
  onLongPress,
  onMarkAsRead,
  onDelete,
  onSelectionToggle,
  icon = '🔔',
  color = '#666666',
  timeAgo,
  showActions = true,
  compact = false,
}: NotificationItemProps) {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const dialog = useDialog();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    if (isSelectionMode && onSelectionToggle) {
      onSelectionToggle();
    } else if (onPress) {
      onPress();
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress();
    }
  };

  const handleMarkAsRead = () => {
    if (onMarkAsRead) {
      onMarkAsRead();
    }
    setShowActionMenu(false);
  };

  const handleDelete = () => {
    dialog.showConfirm(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      () => {
        if (onDelete) {
          onDelete();
        }
        setShowActionMenu(false);
      }
    );
  };

  const handleActionMenuToggle = () => {
    setShowActionMenu(!showActionMenu);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const formatNotificationTime = (dateString: string): string => {
    if (timeAgo) return timeAgo;

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

  const getNotificationIcon = (): string => {
    if (icon) return icon;

    const icons: { [key: string]: string } = {
      new_event_nearby: '📍',
      friend_request: '👤',
      friend_request_accepted: '✅',
      event_invitation: '📅',
      group_invite: '👥',
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
    return icons[notification.type] || '🔔';
  };

  const getNotificationColor = (): string => {
    if (color !== '#666666') return color;

    const colors: { [key: string]: string } = {
      new_event_nearby: '#4CAF50',
      friend_request: '#2196F3',
      friend_request_accepted: '#4CAF50',
      event_invitation: '#FF9800',
      group_invite: '#3B82F6',
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
    return colors[notification.type] || '#666666';
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !notification.read && styles.notificationItemUnread,
          isSelected && styles.notificationItemSelected,
          compact && styles.notificationItemCompact,
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          {/* Header */}
          <View style={styles.notificationHeader}>
            <View style={styles.notificationIconContainer}>
              <View style={[styles.notificationIcon, { backgroundColor: getNotificationColor() }]}>
                <Text style={styles.notificationIconText}>
                  <Text style={{fontSize: 18, color: '#ffffff'}}>{getNotificationIcon()}</Text>
                </Text>
              </View>
              {!notification.read && <View style={styles.unreadIndicator} />}
            </View>

            <View style={styles.notificationInfo}>
              <Text style={[
                styles.notificationTitle,
                !notification.read && styles.notificationTitleUnread
              ]} numberOfLines={compact ? 1 : 2}>
                {notification.title || ''}
              </Text>
              <Text style={styles.notificationTime}>
                {formatNotificationTime(notification.created_at)}
              </Text>
            </View>

            {isSelectionMode && (
              <TouchableOpacity
                style={[styles.selectionIndicator, isSelected && styles.selectionIndicatorSelected]}
                onPress={() => onSelectionToggle?.()}
              >
                {isSelected && (
                  <Text style={{fontSize: 13, color: '#000000'}}>✓</Text>
                )}
              </TouchableOpacity>
            )}

            {!isSelectionMode && showActions && (
              <TouchableOpacity
                style={styles.actionMenuButton}
                onPress={handleActionMenuToggle}
              >
                <Text style={{fontSize: 14, color: '#666666'}}>•</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Body */}
          {!compact && (
            <Text style={styles.notificationBody} numberOfLines={3}>
              {notification.body}
            </Text>
          )}

          {/* Image */}
          {notification.image_url && !compact && (
            <View style={styles.notificationImageContainer}>
              <Image
                source={{ uri: notification.image_url }}
                style={styles.notificationImage}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Data Preview */}
          {notification.data && Object.keys(notification.data).length > 0 && !compact && (
            <View style={styles.dataPreview}>
              {Object.entries(notification.data).slice(0, 2).map(([key, value]) => (
                <View key={key} style={styles.dataItem}>
                  <Text style={styles.dataKey}>{key}:</Text>
                  <Text style={styles.dataValue}>{String(value)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Action Menu */}
      {showActionMenu && !isSelectionMode && (
        <Animated.View style={styles.actionMenu}>
          <TouchableOpacity
            style={styles.actionMenuItem}
            onPress={handleMarkAsRead}
            disabled={notification.read}
          >
            <Text style={{fontSize: 14, color: '#666666'}}>✓</Text>
            <Text style={[styles.actionMenuText, notification.read && styles.actionMenuTextDisabled]}>
              {notification.read ? 'Already Read' : 'Mark as Read'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionMenuItem}
            onPress={handleDelete}
          >
            <Text style={{fontSize: 14, color: '#F44336'}}>•</Text>
            <Text style={[styles.actionMenuText, styles.deleteText]}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  notificationItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationItemUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
    backgroundColor: '#fffbf0',
  },
  notificationItemSelected: {
    backgroundColor: '#f0f8ff',
    borderColor: '#2196F3',
  },
  notificationItemCompact: {
    padding: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIconText: {
    fontSize: 20,
  },
  unreadIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
    lineHeight: 22,
  },
  notificationTitleUnread: {
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
    color: '#666666',
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  selectionIndicatorSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  selectionCheckmark: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  actionMenuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionMenuIcon: {
    fontSize: 16,
    color: '#666666',
  },
  notificationBody: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  notificationImage: {
    width: '100%',
    height: '100%',
  },
  dataPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dataKey: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    marginRight: 4,
  },
  dataValue: {
    fontSize: 12,
    color: '#333333',
  },
  actionMenu: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
    minWidth: 150,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionMenuText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
  actionMenuTextDisabled: {
    color: '#999999',
  },
  deleteIcon: {
    color: '#F44336',
  },
  deleteText: {
    color: '#F44336',
  },
});
