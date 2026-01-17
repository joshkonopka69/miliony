import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, SafeAreaView, FlatList, Image, ActivityIndicator } from 'react-native';
import { useAppNavigation } from '../navigation';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../services/supabase';
import { friendService } from '../services/friendService';
import { useTranslation } from '../contexts/TranslationContext';
import { useFocusEffect } from '@react-navigation/native';
import { SMLogo } from '../components';


interface User {
  id: string;
  display_name: string;
  avatar_url?: string;
  isFriend: boolean;
  friendshipStatus?: 'none' | 'pending' | 'accepted' | 'blocked';
  isPendingSender?: boolean; // true if I SENT the pending request, false if I RECEIVED it
  mutualFriends?: number;
}

export default function AddFriendScreen() {
  const navigation = useAppNavigation();
  const { getUserId } = useAuth();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friends, setFriends] = useState<Set<string>>(new Set());

  // Load friends when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadFriends();
    }, [])
  );

  const loadFriends = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const friendsList = await supabaseService.getFriends(userId);
      const friendIds = new Set(friendsList.map((f: any) => f.id));
      setFriends(friendIds);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Debounce timer ref
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length > 2) {
      // Debounce search by 300ms
      searchTimeoutRef.current = setTimeout(async () => {
        const userId = getUserId();
        if (!userId) {
          Alert.alert(t.common.error, t.friends.loginRequired);
          return;
        }

        setIsSearching(true);
        try {
          // Search for users
          const users = await supabaseService.searchUsers(query, userId);

          if (users.length === 0) {
            setSearchResults([]);
            setIsSearching(false);
            return;
          }

          // Get user IDs for batch query
          const userIds = users.map((user: any) => user.id);

          // OPTIMIZED: Batch get friendship status and friend requests in parallel
          // Only 2 API calls total instead of 4*N where N = number of users
          const [friendRequestStatus] = await Promise.all([
            friendService.getBatchFriendRequestStatus(userId, userIds),
          ]);

          // Map results - no individual API calls per user!
          const usersWithStatus = users.map((user: any) => {
            const requestStatus = friendRequestStatus.get(user.id) || { sentRequestId: null, receivedRequestId: null };

            const isPendingSender = requestStatus.sentRequestId !== null;
            const isPendingReceiver = requestStatus.receivedRequestId !== null;

            // If there's a pending request, show pending status
            // Otherwise check if already friends from the friends set
            let effectiveStatus: 'none' | 'pending' | 'accepted' | 'blocked' = 'none';
            if (isPendingSender || isPendingReceiver) {
              effectiveStatus = 'pending';
            } else if (friends.has(user.id)) {
              effectiveStatus = 'accepted';
            }

            return {
              id: user.id,
              display_name: user.display_name,
              avatar_url: user.avatar_url,
              isFriend: friends.has(user.id),
              friendshipStatus: effectiveStatus,
              isPendingSender, // true = I sent, false = They sent (or no pending)
              mutualFriends: 0, // Skip expensive mutual friends count for performance
            };
          });

          setSearchResults(usersWithStatus);
        } catch (error: any) {
          console.error('Error searching users:', error);
          Alert.alert(t.common.error, error.message || t.common.error);
        } finally {
          setIsSearching(false);
        }
      }, 300); // 300ms debounce
    } else {
      setSearchResults([]);
    }
  };

  const handleAddFriend = async (friendId: string, userName: string) => {
    const userId = getUserId();
    if (!userId) {
      Alert.alert(t.common.error, t.friends.loginRequired);
      return;
    }

    Alert.alert(
      t.friends.addConfirmTitle,
      t.friends.addConfirmMessage.replace('{name}', userName),
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.friends.sendRequest,
          onPress: async () => {
            try {
              // Use friendService which correctly inserts into friend_requests table
              const success = await friendService.sendFriendRequest(userId, friendId, `Hi ${userName}!`);
              if (!success) {
                Alert.alert(t.common.error, 'Failed to send friend request.');
                return;
              }
              Alert.alert(t.common.success, t.friends.addSuccess.replace('{name}', userName));

              // Update search results to show pending status AND mark as sender
              setSearchResults(prev =>
                prev.map(user =>
                  user.id === friendId
                    ? { ...user, friendshipStatus: 'pending' as const, isPendingSender: true }
                    : user
                )
              );
            } catch (error: any) {
              console.error('Error sending friend request:', error);
              Alert.alert(t.common.error, error.message || t.common.error);
            }
          }
        }
      ]
    );
  };

  const handleCancelRequest = async (receiverId: string, userName: string) => {
    const userId = getUserId();
    if (!userId) {
      Alert.alert(t.common.error, t.friends.loginRequired);
      return;
    }

    Alert.alert(
      'Cancel Request',
      `Cancel friend request to ${userName}?`,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: 'Cancel Request',
          style: 'destructive',
          onPress: async () => {
            try {
              const requestId = await friendService.getPendingRequestIdToUser(userId, receiverId);

              if (!requestId) {
                Alert.alert(t.common.error, 'No pending request found.');
                return;
              }

              await friendService.cancelFriendRequest(requestId);
              Alert.alert(t.common.success, 'Friend request cancelled.');

              setSearchResults(prev =>
                prev.map(user =>
                  user.id === receiverId
                    ? { ...user, friendshipStatus: 'none' as const }
                    : user
                )
              );
            } catch (error: any) {
              console.error('Error cancelling friend request:', error);
              Alert.alert(t.common.error, error.message || t.common.error);
            }
          }
        }
      ]
    );
  };

  const handleAcceptRequest = async (senderId: string, senderName: string) => {
    const userId = getUserId();
    if (!userId) {
      Alert.alert(t.common.error, t.friends.loginRequired);
      return;
    }

    try {
      const requestId = await friendService.getReceivedRequestIdFromUser(userId, senderId);
      if (!requestId) {
        Alert.alert(t.common.error, 'No pending request found.');
        return;
      }

      const success = await friendService.acceptFriendRequest(requestId);
      if (success) {
        Alert.alert(t.common.success, `You are now friends with ${senderName}!`);
        setSearchResults(prev =>
          prev.map(user =>
            user.id === senderId
              ? { ...user, isFriend: true, friendshipStatus: 'accepted' as const }
              : user
          )
        );
      } else {
        Alert.alert(t.common.error, 'Failed to accept friend request.');
      }
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      Alert.alert(t.common.error, error.message || t.common.error);
    }
  };

  const handleDeclineRequest = async (senderId: string, senderName: string) => {
    const userId = getUserId();
    if (!userId) {
      Alert.alert(t.common.error, t.friends.loginRequired);
      return;
    }

    Alert.alert(
      'Decline Request',
      `Decline friend request from ${senderName}?`,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              const requestId = await friendService.getReceivedRequestIdFromUser(userId, senderId);
              if (!requestId) {
                Alert.alert(t.common.error, 'No pending request found.');
                return;
              }

              const success = await friendService.declineFriendRequest(requestId);
              if (success) {
                Alert.alert(t.common.success, 'Friend request declined.');
                setSearchResults(prev =>
                  prev.map(user =>
                    user.id === senderId
                      ? { ...user, friendshipStatus: 'none' as const }
                      : user
                  )
                );
              } else {
                Alert.alert(t.common.error, 'Failed to decline friend request.');
              }
            } catch (error: any) {
              console.error('Error declining friend request:', error);
              Alert.alert(t.common.error, error.message || t.common.error);
            }
          }
        }
      ]
    );
  };

  const handleRemoveFriend = async (friendId: string, userName: string) => {
    const userId = getUserId();
    if (!userId) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    Alert.alert(
      t.friends.removeConfirmTitle,
      t.friends.removeConfirmMessage.replace('{name}', userName),
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.friends.removeConfirmButton,
          style: 'destructive',
          onPress: async () => {
            try {
              await supabaseService.removeFriend(userId, friendId);
              Alert.alert(t.common.success, t.friends.removeSuccess.replace('{name}', userName));

              // Update search results and friends list
              setSearchResults(prev =>
                prev.map(user =>
                  user.id === friendId
                    ? { ...user, isFriend: false, friendshipStatus: 'none' as const }
                    : user
                )
              );
              setFriends(prev => {
                const newSet = new Set(prev);
                newSet.delete(friendId);
                return newSet;
              });
            } catch (error: any) {
              console.error('Error removing friend:', error);
              Alert.alert(t.common.error, error.message || t.common.error);
            }
          }
        }
      ]
    );
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const getButtonText = () => {
      if (item.friendshipStatus === 'pending') {
        // isPendingSender = true means I sent it, show Cancel
        // isPendingSender = false means They sent it to me, show Accept
        return item.isPendingSender ? (t.common.cancel || 'Cancel') : 'Accept';
      }
      if (item.isFriend) return t.friends.remove;
      return t.friends.add;
    };

    const getButtonStyle = () => {
      if (item.friendshipStatus === 'pending') {
        return item.isPendingSender ? styles.pendingButton : styles.acceptButton;
      }
      if (item.isFriend) return styles.removeButton;
      return styles.addButton;
    };

    const getButtonTextStyle = () => {
      if (item.friendshipStatus === 'pending') {
        return item.isPendingSender ? styles.pendingButtonText : styles.acceptButtonText;
      }
      if (item.isFriend) return styles.removeButtonText;
      return styles.addButtonText;
    };

    return (
      <View style={styles.userItem}>
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.userAvatarImage} />
        ) : (
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {getInitials(item.display_name)}
            </Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.display_name}</Text>
          <Text style={styles.userUsername}>@{item.display_name.toLowerCase().replace(/\s+/g, '')}</Text>
          {item.mutualFriends !== undefined && item.mutualFriends > 0 && (
            <Text style={styles.mutualFriends}>
              {item.mutualFriends} mutual friend{item.mutualFriends !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Show different buttons based on request direction */}
        {item.friendshipStatus === 'pending' && !item.isPendingSender ? (
          // I RECEIVED a request - show Accept and Decline buttons
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAcceptRequest(item.id, item.display_name)}
            >
              <Text style={[styles.actionButtonText, styles.acceptButtonText]}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleDeclineRequest(item.id, item.display_name)}
            >
              <Text style={[styles.actionButtonText, styles.declineButtonText]}>Decline</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Normal single button (Add, Cancel, Remove)
          <TouchableOpacity
            style={[styles.actionButton, getButtonStyle()]}
            onPress={() => {
              if (item.friendshipStatus === 'pending' && item.isPendingSender) {
                handleCancelRequest(item.id, item.display_name);
              } else if (item.isFriend) {
                handleRemoveFriend(item.id, item.display_name);
              } else {
                handleAddFriend(item.id, item.display_name);
              }
            }}
          >
            <Text style={[styles.actionButtonText, getButtonTextStyle()]}>
              {getButtonText()}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>👥</Text>
      <Text style={styles.emptyStateTitle}>{t.friends.emptyResultsTitle}</Text>
      <Text style={styles.emptyStateText}>
        {t.friends.emptyResultsSubtitle}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.profile.addFriends}</Text>
        <SMLogo />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>{t.friends.searchTitle}</Text>
          <Text style={styles.searchSubtitle}>
            {t.friends.searchSubtitle}
          </Text>

          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={t.friends.searchPlaceholder}
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results */}
        {searchQuery.length > 2 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              {isSearching
                ? t.common.loading
                : `${t.friends.resultsTitle} (${searchResults.length})`}
            </Text>

            {isSearching ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{t.common.loading}</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              renderEmptyState()
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.quickActionsTitle}>{t.friends.quickActionsTitle}</Text>

          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>📱</Text>
            </View>
            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>{t.friends.quickActions.contactsTitle}</Text>
              <Text style={styles.quickActionSubtitle}>{t.friends.quickActions.contactsSubtitle}</Text>
            </View>
            <Text style={styles.quickActionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>🔗</Text>
            </View>
            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>{t.friends.quickActions.inviteLinkTitle}</Text>
              <Text style={styles.quickActionSubtitle}>{t.friends.quickActions.inviteLinkSubtitle}</Text>
            </View>
            <Text style={styles.quickActionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>👥</Text>
            </View>
            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>{t.friends.quickActions.nearbyTitle}</Text>
              <Text style={styles.quickActionSubtitle}>{t.friends.quickActions.nearbySubtitle}</Text>
            </View>
            <Text style={styles.quickActionArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // bg-gray-50
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // border-gray-100
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#374151', // text-gray-700
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    textAlign: 'center',
    flex: 1,
    marginRight: 40, // pr-10 equivalent
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
  scrollView: {
    flex: 1,
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    marginBottom: 8,
  },
  searchSubtitle: {
    fontSize: 16,
    color: '#6b7280', // text-gray-500
    marginBottom: 16,
    lineHeight: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb', // bg-gray-50
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb', // border-gray-200
  },
  searchIcon: {
    fontSize: 18,
    color: '#9ca3af', // text-gray-400
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827', // text-gray-900
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: '#9ca3af', // text-gray-400
  },
  resultsSection: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280', // text-gray-500
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb', // bg-gray-50
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb', // border-gray-200
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb', // bg-gray-200
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151', // text-gray-700
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: '#6b7280', // text-gray-500
    marginBottom: 2,
  },
  mutualFriends: {
    fontSize: 12,
    color: '#9ca3af', // text-gray-400
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  addButton: {
    backgroundColor: '#10b981', // bg-emerald-500
    borderColor: '#10b981',
  },
  removeButton: {
    backgroundColor: '#ffffff',
    borderColor: '#ef4444', // border-red-500
  },
  pendingButton: {
    backgroundColor: '#f9fafb',
    borderColor: '#9ca3af',
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addButtonText: {
    color: '#ffffff',
  },
  removeButtonText: {
    color: '#ef4444', // text-red-500
  },
  pendingButtonText: {
    color: '#6b7280',
  },
  acceptButton: {
    backgroundColor: '#FFD700', // Yellow - app primary color
    borderColor: '#FFD700',
    marginRight: 4,
  },
  acceptButtonText: {
    color: '#000000', // Black text
  },
  declineButton: {
    backgroundColor: '#000000', // Black background
    borderColor: '#000000',
    marginLeft: 4,
  },
  declineButtonText: {
    color: '#FFD700', // Yellow text
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280', // text-gray-500
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActionsSection: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    marginBottom: 16,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb', // bg-gray-50
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb', // border-gray-200
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb', // bg-gray-200
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickActionIconText: {
    fontSize: 20,
  },
  quickActionInfo: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#6b7280', // text-gray-500
  },
  quickActionArrow: {
    fontSize: 20,
    color: '#9ca3af', // text-gray-400
  },
});