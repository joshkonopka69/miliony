import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { useAppNavigation } from '../navigation';
import { useNotificationManager } from '../hooks/useNotifications';
import { NotificationData, NotificationType } from '../services/notificationService';

// Custom SM Logo Component
const SMLogo = ({ size = 30 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

export default function NotificationsScreen() {
  const navigation = useAppNavigation();
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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSettings = () => {
    navigation.navigate('NotificationSettings');
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
      toggleNotificationSelection(notification.id);
    } else {
      // Mark as read if unread
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }
      
      // Navigate based on notification type
      handleNotificationNavigation(notification);
    }
  };

  const handleNotificationNavigation = (notification: NotificationData) => {
    switch (notification.type) {
      case 'friend_request':
        navigation.navigate('FriendRequests');
        break;
      case 'event_invitation':
      case 'event_updated':
      case 'event_cancelled':
        if (notification.data?.event_id) {
          navigation.navigate('EventDetails', { eventId: notification.data.event_id });
        }
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

  const toggleNotificationSelection = (notificationId: string) => {
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
      const allIds = new Set(getFilteredNotifications().map(n => n.id));
      setSelectedNotifications(allIds);
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
      'Delete Notifications',
      `Are you sure you want to delete ${selectedNotifications.size} notification${selectedNotifications.size !== 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
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
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All Read',
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

  const filteredNotifications = getFilteredNotifications();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleSettings}>
            <Text style={styles.headerButtonIcon}>⚙️</Text>
          </TouchableOpacity>
          <SMLogo size={30} />
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
          placeholder="Search notifications..."
          placeholderTextColor="#8e8e93"
        />
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchIcon}>🔍</Text>
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
                All ({notifications.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'unread' && styles.filterChipActive]}
              onPress={() => handleFilterChange('unread')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'unread' && styles.filterChipTextActive]}>
                Unread ({unreadCount})
              </Text>
            </TouchableOpacity>

            {['friend_request', 'event_invitation', 'chat_message', 'system_announcement'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.filterChip, activeFilter === type && styles.filterChipActive]}
                onPress={() => handleFilterChange(type as NotificationType)}
              >
                <Text style={[styles.filterChipText, activeFilter === type && styles.filterChipTextActive]}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
              {selectedNotifications.size === filteredNotifications.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.actionButtonGroup}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleMarkSelectedAsRead}
              disabled={selectedNotifications.size === 0}
            >
              <Text style={[styles.actionButtonText, selectedNotifications.size === 0 && styles.actionButtonTextDisabled]}>
                Mark Read
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDeleteSelected}
              disabled={selectedNotifications.size === 0}
            >
              <Text style={[styles.actionButtonText, styles.deleteButtonText, selectedNotifications.size === 0 && styles.actionButtonTextDisabled]}>
                Delete
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
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : (
            <>
              {/* Notifications */}
              {filteredNotifications.length > 0 ? (
                <View style={styles.notificationsList}>
                  {filteredNotifications.map((notification) => (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.notificationItem,
                        !notification.is_read && styles.notificationItemUnread,
                        selectedNotifications.has(notification.id) && styles.notificationItemSelected,
                      ]}
                      onPress={() => handleNotificationPress(notification)}
                      onLongPress={() => {
                        setIsSelectionMode(true);
                        toggleNotificationSelection(notification.id);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.notificationContent}>
                        <View style={styles.notificationHeader}>
                          <View style={styles.notificationIconContainer}>
                            <Text style={styles.notificationIcon}>
                              {getNotificationIcon(notification.type)}
                            </Text>
                            {!notification.is_read && <View style={styles.unreadIndicator} />}
                          </View>
                          
                          <View style={styles.notificationInfo}>
                            <Text style={[styles.notificationTitle, !notification.is_read && styles.notificationTitleUnread]}>
                              {notification.title}
                            </Text>
                            <Text style={styles.notificationTime}>
                              {formatNotificationTime(notification.created_at)}
                            </Text>
                          </View>
                          
                          {isSelectionMode && (
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
                          {notification.body}
                        </Text>
                        
                        {notification.image_url && (
                          <View style={styles.notificationImageContainer}>
                            <Text style={styles.notificationImagePlaceholder}>📷</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>🔔</Text>
                  <Text style={styles.emptyTitle}>
                    {searchQuery ? 'No notifications found' : 'No notifications yet'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'You\'ll receive notifications about events, friends, and more!'
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
              <Text style={styles.updatingText}>Updating...</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      {!isSelectionMode && filteredNotifications.length > 0 && (
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.bottomActionButton} onPress={() => setIsSelectionMode(true)}>
            <Text style={styles.bottomActionButtonText}>Select</Text>
          </TouchableOpacity>
          
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.bottomActionButton} onPress={handleMarkAllAsRead}>
              <Text style={styles.bottomActionButtonText}>Mark All Read</Text>
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
});
