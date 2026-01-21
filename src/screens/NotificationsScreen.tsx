import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Animated,
  RefreshControl,
  TextInput,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../navigation';
import { ROUTES } from '../navigation/types';
import { useNotificationManager } from '../hooks/useNotifications';
import { NotificationData, NotificationType } from '../services/notificationService';
import { useTranslation, Language } from '../contexts/TranslationContext';
import { SMLogo } from '../components';
import { friendService } from '../services/friendService';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';


const LOCALE_MAP: Record<Language, string> = {
  en: 'en-US',
  pl: 'pl-PL',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
};


export default function NotificationsScreen() {
  const navigation = useAppNavigation();
  const { t, language } = useTranslation();
  const locale = LOCALE_MAP[language] ?? 'en-US';
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    isUpdating,
    error,
    clearError,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationsByType,
    searchNotifications,
    getUnreadNotifications,
  } = useNotificationManager();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | NotificationType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Real-time notifications subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('[NotificationsScreen] New notification received:', payload);
        refreshNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refreshNotifications]);

  // Handle Accept Friend Request
  const handleAcceptFriendRequest = async (notification: NotificationData) => {
    const senderId = notification.data?.senderId;
    if (!senderId || !user?.id) {
      Alert.alert('Error', 'Unable to accept request. Missing sender information.');
      return;
    }

    setProcessingRequests(prev => new Set(prev).add(notification.id || ''));

    try {
      // Get the request ID from friend_requests table
      const requestId = await friendService.getReceivedRequestIdFromUser(user.id, senderId);
      if (!requestId) {
        Alert.alert('Error', 'Friend request not found. It may have been cancelled.');
        return;
      }

      const success = await friendService.acceptFriendRequest(requestId);
      if (success) {
        Alert.alert('Success', 'Friend request accepted! You are now friends.');
        if (notification.id) {
          await deleteNotification(notification.id);
        }
        await refreshNotifications();
      } else {
        Alert.alert('Error', 'Failed to accept friend request. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setProcessingRequests(prev => {
        const next = new Set(prev);
        next.delete(notification.id || '');
        return next;
      });
    }
  };

  // Handle Decline Friend Request
  const handleDeclineFriendRequest = async (notification: NotificationData) => {
    const senderId = notification.data?.senderId;
    if (!senderId || !user?.id) {
      Alert.alert('Error', 'Unable to decline request. Missing sender information.');
      return;
    }

    Alert.alert(
      'Decline Friend Request',
      'Are you sure you want to decline this friend request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setProcessingRequests(prev => new Set(prev).add(notification.id || ''));

            try {
              const requestId = await friendService.getReceivedRequestIdFromUser(user.id, senderId);
              if (!requestId) {
                Alert.alert('Error', 'Friend request not found.');
                return;
              }

              const success = await friendService.declineFriendRequest(requestId);
              if (success) {
                if (notification.id) {
                  await deleteNotification(notification.id);
                }
                await refreshNotifications();
              } else {
                Alert.alert('Error', 'Failed to decline friend request.');
              }
            } catch (error) {
              console.error('Error declining friend request:', error);
              Alert.alert('Error', 'An error occurred.');
            } finally {
              setProcessingRequests(prev => {
                const next = new Set(prev);
                next.delete(notification.id || '');
                return next;
              });
            }
          },
        },
      ]
    );
  };

  const getNotificationCopy = useCallback(
    (notification: NotificationData) => {
      if (!notification) {
        return { title: '', body: '' };
      }

      const data = notification.data || {};

      // OPTIMIZATION: If we have a descriptive title and body from the server, 
      // and it's not a type that requires complex local variable replacement (like reminders),
      // we should prefer the server-provided values to avoid localization sync issues.
      const useServerContent = notification.title && notification.body &&
        !['event_reminder', 'friend_request', 'group_invite'].includes(notification.type);

      if (useServerContent) {
        return {
          title: notification.title,
          body: notification.body,
        };
      }

      switch (notification.type) {
        case 'friend_request': {
          const name = data.senderName || data.sender_id || 'Someone';
          return {
            title: t.notifications.friendRequestTitle,
            body: t.notifications.friendRequestBody.replace('{name}', String(name)),
          };
        }
        case 'group_invite': {
          const inviterName = data.inviterName || 'Someone';
          const groupName = data.groupName || 'your group';
          return {
            title: t.notifications.groupInviteTitle,
            body: t.notifications.groupInviteBody
              .replace('{name}', String(inviterName))
              .replace('{group}', String(groupName)),
          };
        }
        case 'event_reminder': {
          const eventName = data.eventName || notification.title || 'Event';
          const reminderOffset = data.reminder || data.offsetHours || '24h';

          let bodyText = '';
          if (reminderOffset === '1h' || reminderOffset === 1) {
            bodyText = t.notifications.reminder1h.replace('{event}', String(eventName));
          } else if (reminderOffset === '24h' || reminderOffset === 24) {
            bodyText = (t.notifications.reminder24h || '{event} starts in 24 hours.').replace('{event}', String(eventName));
          } else if (reminderOffset === '12h' || reminderOffset === 12) {
            bodyText = t.notifications.reminder12h.replace('{event}', String(eventName));
          } else {
            bodyText = t.notifications.reminder12h.replace('{event}', String(eventName));
          }

          return {
            title: notification.title || t.notifications.title,
            body: bodyText,
          };
        }
        case 'event_participant_joined': {
          const eventName = data.eventName || 'an event';
          return {
            title: t.notifications.participantJoinedTitle || 'New Participant',
            body: (t.notifications.participantJoinedBody || 'Someone joined {event}')
              .replace('{event}', String(eventName)),
          };
        }
        case 'event_cancelled': {
          const eventName = data.eventName || 'an event';
          return {
            title: t.notifications.eventCancelledTitle || 'Event Cancelled',
            body: (t.notifications.eventCancelledBody || '{event} has been cancelled')
              .replace('{event}', String(eventName)),
          };
        }
        case 'event_invitation': {
          const inviterName = data.inviterName || 'Someone';
          const eventName = data.eventName || 'an event';
          return {
            title: t.notifications.eventInviteTitle || 'Event Invitation',
            body: (t.notifications.eventInviteBody || '{name} invited you to {event}')
              .replace('{name}', String(inviterName))
              .replace('{event}', String(eventName)),
          };
        }
        default:

          return {
            title: notification.title,
            body: notification.body,
          };
      }
    },
    [t.notifications]
  );

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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleFilterChange = (filter: 'all' | 'unread' | NotificationType) => {
    setActiveFilter(filter);
    setSelectedNotifications(new Set());
    setIsSelectionMode(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleNotificationPress = async (notification: NotificationData) => {
    if (isSelectionMode) {
      if (notification.id) {
        toggleNotificationSelection(notification.id);
      }
    } else {
      // Mark as read if unread
      if (!notification.read && notification.id) {
        await markAsRead(notification.id);
      }

      // Navigate based on notification type
      handleNotificationNavigation(notification);
    }
  };

  const handleNotificationNavigation = (notification: NotificationData) => {
    switch (notification.type) {
      case 'friend_request':
        // Handle inline with Accept/Decline buttons - no navigation needed
        break;

      case 'friend_request_accepted':
        if (notification.data?.acceptorId) {
          navigation.navigate('Profile', { userId: notification.data.acceptorId });
        }
        break;
      case 'event_invitation':
      case 'event_updated':
      case 'event_cancelled':
      case 'event_reminder':
      case 'event_starting_soon':
      case 'event_participant_joined':
      case 'event_created':
        const eventId = notification.data?.event_id || notification.data?.eventId;
        if (eventId) {
          navigation.navigate('EventDetails', { id: eventId } as any);
        }
        break;
      case 'group_invite':
      case 'group_invite_accepted':
        if (notification.data?.groupId) {
          navigation.navigate('GroupDetails' as any, { groupId: notification.data.groupId });
        } else {
          navigation.navigate(ROUTES.MY_GROUPS);
        }
        break;
      case 'achievement_unlocked':
        navigation.navigate('AllBadges');
        break;
      case 'chat_message':
        if (notification.data?.chat_id) {
          navigation.navigate('Chat', { chatId: notification.data.chat_id });
        }
        break;
      default:
        // Default navigation or no action
        break;
    }
  };

  const toggleNotificationSelection = (notificationId?: string) => {
    if (!notificationId) return;
    const newSelection = new Set(selectedNotifications);
    if (newSelection.has(notificationId)) {
      newSelection.delete(notificationId);
    } else {
      newSelection.add(notificationId);
    }
    setSelectedNotifications(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === getFilteredNotifications().length) {
      setSelectedNotifications(new Set());
    } else {
      const validIds = getFilteredNotifications()
        .map(n => n.id)
        .filter((id): id is string => id !== undefined);
      setSelectedNotifications(new Set(validIds));
    }
  };

  const handleMarkSelectedAsRead = async () => {
    const promises = Array.from(selectedNotifications).map(id => markAsRead(id));
    await Promise.all(promises);
    setSelectedNotifications(new Set());
    setIsSelectionMode(false);
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      t.notifications.deleteConfirmTitle,
      t.notifications.deleteConfirmMessage.replace(
        '{count}',
        String(selectedNotifications.size)
      ),
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.notifications.deleteSelected,
          style: 'destructive',
          onPress: async () => {
            const promises = Array.from(selectedNotifications).map(id => deleteNotification(id));
            await Promise.all(promises);
            setSelectedNotifications(new Set());
            setIsSelectionMode(false);
          },
        },
      ]
    );
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      t.notifications.markAllReadTitle,
      t.notifications.markAllReadMessage,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.notifications.markAllReadConfirm,
          onPress: markAllAsRead,
        },
      ]
    );
  };

  const getFilteredNotifications = (): NotificationData[] => {
    let filtered = notifications;

    // Apply filter
    if (activeFilter === 'unread') {
      filtered = getUnreadNotifications();
    } else if (activeFilter !== 'all') {
      filtered = getNotificationsByType(activeFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      filtered = searchNotifications(searchQuery);
    }

    return filtered;
  };

  const getNotificationIcon = (type: NotificationType): string => {
    const icons: { [key in NotificationType]: string } = {
      new_event_nearby: 'location-outline',
      friend_request: 'person-outline',
      friend_request_accepted: 'checkmark-circle-outline',
      event_invitation: 'calendar-outline',
      event_invite: 'calendar-outline',
      group_invite: 'people-outline',
      event_cancelled: 'close-circle-outline',
      event_updated: 'create-outline',
      event_update: 'create-outline',
      event_reminder: 'alarm-outline',
      chat_message: 'chatbubble-outline',
      system_announcement: 'megaphone-outline',
      event_participant_joined: 'people-outline',
      event_participant_left: 'exit-outline',
      event_starting_soon: 'rocket-outline',
      weather_alert: 'partly-sunny-outline',
      achievement_unlocked: 'trophy-outline',
      friend_activity: 'flash-outline',
      event_created: 'add-circle-outline',
      group_invite_accepted: 'hand-right-outline',
      general: 'notifications-outline',
    };
    return icons[type] || 'notifications-outline';
  };

  const getNotificationColor = (type: NotificationType): string => {
    const colors: { [key in NotificationType]: string } = {
      new_event_nearby: '#4CAF50',
      friend_request: '#2196F3',
      friend_request_accepted: '#4CAF50',
      event_invitation: '#FF9800',
      event_invite: '#FF9800',
      group_invite: '#3B82F6',
      event_cancelled: '#F44336',
      event_updated: '#FF9800',
      event_update: '#FF9800',
      event_reminder: '#9C27B0',
      chat_message: '#2196F3',
      system_announcement: '#607D8B',
      event_participant_joined: '#4CAF50',
      event_participant_left: '#F44336',
      event_starting_soon: '#FF5722',
      weather_alert: '#FFC107',
      achievement_unlocked: '#FFD700',
      friend_activity: '#E91E63',
      event_created: '#4CAF50',
      group_invite_accepted: '#3B82F6',
      general: '#666666',
    };
    return colors[type] || '#666666';
  };

  const formatNotificationTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      // Check if Intl.RelativeTimeFormat is available
      const hasRelativeTimeFormat =
        typeof Intl !== 'undefined' &&
        typeof Intl.RelativeTimeFormat === 'function';

      if (!hasRelativeTimeFormat) {
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;

        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
      }

      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

      if (diffMinutes < 1) return rtf.format(0, 'minute');
      if (diffMinutes < 60) return rtf.format(-diffMinutes, 'minute');

      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return rtf.format(-diffHours, 'hour');

      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return rtf.format(-diffDays, 'day');

      return date.toLocaleDateString(locale);
    } catch (e) {
      console.error('Error formatting notification time:', e);
      return '';
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.notifications.title}</Text>
        <View style={styles.headerActions}>
          <SMLogo />
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text style={styles.errorDismiss}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder={t.notifications.searchPlaceholder}
          placeholderTextColor="#8e8e93"
        />
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={20} color="#8e8e93" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersList}>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
              onPress={() => handleFilterChange('all')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
                {t.notifications.filterAll} ({notifications.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'unread' && styles.filterChipActive]}
              onPress={() => handleFilterChange('unread')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'unread' && styles.filterChipTextActive]}>
                {t.notifications.filterUnread} ({unreadCount})
              </Text>
            </TouchableOpacity>

            {(['friend_request', 'event_invitation', 'group_invite', 'chat_message', 'system_announcement'] as NotificationType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.filterChip, activeFilter === type && styles.filterChipActive]}
                onPress={() => handleFilterChange(type)}
              >
                <Text style={[styles.filterChipText, activeFilter === type && styles.filterChipTextActive]}>
                  {(t.notifications.filterLabels as any)[type] ?? type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Action Bar */}
      {isSelectionMode && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSelectAll}>
            <Text style={styles.actionButtonText}>
              {selectedNotifications.size === filteredNotifications.length
                ? t.notifications.deselectAll
                : t.notifications.selectAll}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionButtonGroup}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleMarkSelectedAsRead}
              disabled={selectedNotifications.size === 0}
            >
              <Text style={[styles.actionButtonText, selectedNotifications.size === 0 && styles.actionButtonTextDisabled]}>
                {t.notifications.markAsRead}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDeleteSelected}
              disabled={selectedNotifications.size === 0}
            >
              <Text style={[styles.actionButtonText, styles.deleteButtonText, selectedNotifications.size === 0 && styles.actionButtonTextDisabled]}>
                {t.notifications.deleteSelected}
              </Text>
            </TouchableOpacity>
          </View>
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
          {/* Loading State */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
              <Text style={styles.loadingText}>{t.notifications.loading}</Text>
            </View>
          ) : (
            <>
              {/* Notifications */}
              {filteredNotifications.length > 0 ? (
                <View style={styles.notificationsList}>
                  {filteredNotifications.map((notification) => {
                    const copy = getNotificationCopy(notification);
                    return (
                      <TouchableOpacity
                        key={notification.id}
                        style={[
                          styles.notificationItem,
                          !notification.read && styles.notificationItemUnread,
                          notification.id ? selectedNotifications.has(notification.id) && styles.notificationItemSelected : false,
                        ]}
                        onPress={() => handleNotificationPress(notification)}
                        onLongPress={() => {
                          setIsSelectionMode(true);
                          if (notification.id) toggleNotificationSelection(notification.id);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.notificationContent}>
                          <View style={styles.notificationHeader}>
                            <View style={styles.notificationIconContainer}>
                              <Ionicons 
                                name={getNotificationIcon(notification.type) as any}
                                size={22}
                                color={getNotificationColor(notification.type)}
                              />
                              {!notification.read && <View style={styles.unreadIndicator} />}
                            </View>

                            <View style={styles.notificationInfo}>
                              <Text style={[styles.notificationTitle, !notification.read && styles.notificationTitleUnread]}>
                                {copy.title}
                              </Text>
                              <Text style={styles.notificationTime}>
                                {notification.created_at ? formatNotificationTime(notification.created_at) : ''}
                              </Text>
                            </View>

                            {!isSelectionMode && (
                              <TouchableOpacity
                                style={styles.dismissButton}
                                onPress={() => notification.id && deleteNotification(notification.id)}
                              >
                                <Text style={styles.dismissIcon}>×</Text>
                              </TouchableOpacity>
                            )}

                            {isSelectionMode && notification.id && (
                              <TouchableOpacity
                                style={[styles.selectionIndicator, selectedNotifications.has(notification.id) && styles.selectionIndicatorSelected]}
                                onPress={() => toggleNotificationSelection(notification.id)}
                              >
                                {selectedNotifications.has(notification.id) && (
                                  <Text style={styles.selectionCheckmark}>✓</Text>
                                )}
                              </TouchableOpacity>
                            )}
                          </View>

                          <Text style={styles.notificationBody} numberOfLines={2}>
                            {copy.body}
                          </Text>

                          {/* Accept/Decline buttons for friend requests */}
                          {notification.type === 'friend_request' && !isSelectionMode && (
                            <View style={styles.friendRequestActions}>
                              {processingRequests.has(notification.id || '') ? (
                                <ActivityIndicator size="small" color="#FFD700" />
                              ) : (
                                <>
                                  <TouchableOpacity
                                    style={styles.acceptButton}
                                    onPress={() => handleAcceptFriendRequest(notification)}
                                  >
                                    <Text style={styles.acceptButtonText}>Accept</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={styles.declineButton}
                                    onPress={() => handleDeclineFriendRequest(notification)}
                                  >
                                    <Text style={styles.declineButtonText}>Decline</Text>
                                  </TouchableOpacity>
                                </>
                              )}
                            </View>
                          )}

                          {notification.image_url && (
                            <View style={styles.notificationImageContainer}>
                              <Text style={styles.notificationImagePlaceholder}>📷</Text>
                            </View>
                          )}
                        </View>

                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>🔔</Text>
                  <Text style={styles.emptyTitle}>
                    {searchQuery ? t.notifications.emptySearchTitle : t.notifications.emptyTitle}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery
                      ? t.notifications.emptySearchSubtitle
                      : t.notifications.emptySubtitle
                    }
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Updating State */}
          {isUpdating && (
            <View style={styles.updatingContainer}>
              <ActivityIndicator size="small" color="#FFD700" />
              <Text style={styles.updatingText}>{t.notifications.updating}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      {!isSelectionMode && filteredNotifications.length > 0 && (
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.bottomActionButton} onPress={() => setIsSelectionMode(true)}>
            <Text style={styles.bottomActionButtonText}>{t.notifications.select}</Text>
          </TouchableOpacity>

          {unreadCount > 0 && (
            <TouchableOpacity style={styles.bottomActionButton} onPress={handleMarkAllAsRead}>
              <Text style={styles.bottomActionButtonText}>{t.notifications.markAllReadButton}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonIcon: {
    fontSize: 16,
    color: '#333333',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#c62828',
  },
  errorDismiss: {
    fontSize: 18,
    color: '#c62828',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 16,
    color: '#000000',
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
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  actionButtonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  actionButtonTextDisabled: {
    color: '#999999',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  deleteButtonText: {
    color: '#c62828',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  notificationsList: {
    gap: 12,
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
    fontSize: 24,
  },
  unreadIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  notificationInfo: {
    flex: 1,
  },
  dismissButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissIcon: {
    fontSize: 22,
    color: '#8e8e93',
    fontWeight: '300',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  notificationTitleUnread: {
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
    color: '#666666',
  },
  notificationBody: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  notificationImagePlaceholder: {
    fontSize: 24,
    color: '#999999',
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    justifyContent: 'center',
    alignItems: 'center',
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
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  bottomActionButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    alignItems: 'center',
  },
  bottomActionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  // Friend request action buttons
  friendRequestActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#FFD700', // Yellow - app primary color
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#000000', // Black text
    fontWeight: '600',
    fontSize: 14,
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#000000', // Black background
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#FFD700', // Yellow text
    fontWeight: '600',
    fontSize: 14,
  },
});
