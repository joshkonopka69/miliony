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
  Image,
} from 'react-native';
import { useAppNavigation } from '../navigation';
import { useFriends } from '../hooks/useFriends';
import { useTranslation } from '../contexts/TranslationContext';

// Custom SM Logo Component
const SMLogo = ({ size = 30 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

export default function FriendRequestsScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const {
    friendRequests,
    acceptFriendRequest,
    declineFriendRequest,
    isLoading,
    isUpdating,
    error,
    clearError,
    pendingRequestsCount,
    sentRequestsCount,
  } = useFriends();

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

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

  const handleTabChange = (tab: 'received' | 'sent') => {
    setActiveTab(tab);
    setSelectedRequest(null);
  };

  const handleAcceptRequest = async (requestId: string, senderName: string) => {
    const success = await acceptFriendRequest(requestId);
    if (success) {
      Alert.alert('Success', `You are now friends with ${senderName}!`);
    } else {
      Alert.alert('Error', 'Failed to accept friend request. Please try again.');
    }
  };

  const handleDeclineRequest = async (requestId: string, senderName: string) => {
    Alert.alert(
      'Decline Friend Request',
      `Are you sure you want to decline ${senderName}'s friend request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            const success = await declineFriendRequest(requestId);
            if (success) {
              Alert.alert('Success', 'Friend request declined.');
            } else {
              Alert.alert('Error', 'Failed to decline friend request. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleCancelRequest = (requestId: string, receiverName: string) => {
    Alert.alert(
      'Cancel Friend Request',
      `Are you sure you want to cancel your friend request to ${receiverName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Cancel Request',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement cancel friend request functionality
            Alert.alert('Success', 'Friend request cancelled.');
          },
        },
      ]
    );
  };

  const handleViewProfile = (userId: string) => {
    // TODO: Navigate to user's profile
    console.log('View profile for:', userId);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTimeAgo = (dateString: string) => {
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

  const renderRequestItem = (request: any, type: 'received' | 'sent') => {
    const user = type === 'received' ? request.sender : request.receiver;
    const isSelected = selectedRequest === request.id;

    return (
      <TouchableOpacity
        key={request.id}
        style={[styles.requestItem, isSelected && styles.requestItemSelected]}
        onPress={() => setSelectedRequest(selectedRequest === request.id ? null : request.id)}
        activeOpacity={0.7}
      >
        <View style={styles.requestHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              {user.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{getInitials(user.display_name)}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.display_name}</Text>
              <Text style={styles.requestTime}>{getTimeAgo(request.created_at)}</Text>
              {request.message && (
                <Text style={styles.requestMessage}>"{request.message}"</Text>
              )}
            </View>
          </View>

          <View style={styles.requestStatus}>
            <Text style={styles.statusText}>
              {type === 'received' ? 'Received' : 'Sent'}
            </Text>
          </View>
        </View>

        {isSelected && (
          <Animated.View 
            style={[
              styles.requestActions,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {type === 'received' ? (
              <>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleViewProfile(user.id)}
                >
                  <Text style={styles.actionButtonText}>👤</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAcceptRequest(request.id, user.display_name)}
                >
                  <Text style={[styles.actionButtonText, styles.acceptButtonText]}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={() => handleDeclineRequest(request.id, user.display_name)}
                >
                  <Text style={[styles.actionButtonText, styles.declineButtonText]}>✗</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleViewProfile(user.id)}
                >
                  <Text style={styles.actionButtonText}>👤</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => handleCancelRequest(request.id, user.display_name)}
                >
                  <Text style={[styles.actionButtonText, styles.cancelButtonText]}>🗑️</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };

  const currentRequests = activeTab === 'received' ? friendRequests.received : friendRequests.sent;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friend Requests</Text>
        <SMLogo size={30} />
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

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'received' && styles.activeTab]}
            onPress={() => handleTabChange('received')}
          >
            <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
              Received ({pendingRequestsCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
            onPress={() => handleTabChange('sent')}
          >
            <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
              Sent ({sentRequestsCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
              <Text style={styles.loadingText}>Loading friend requests...</Text>
            </View>
          ) : (
            <>
              {/* Requests List */}
              {currentRequests.length > 0 ? (
                <View style={styles.requestsList}>
                  {currentRequests.map((request) => renderRequestItem(request, activeTab))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>
                    {activeTab === 'received' ? '📥' : '📤'}
                  </Text>
                  <Text style={styles.emptyTitle}>
                    {activeTab === 'received' 
                      ? 'No friend requests' 
                      : 'No sent requests'
                    }
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {activeTab === 'received'
                      ? 'You don\'t have any pending friend requests'
                      : 'You haven\'t sent any friend requests yet'
                    }
                  </Text>
                  {activeTab === 'received' && (
                    <TouchableOpacity 
                      style={styles.findFriendsButton}
                      onPress={() => navigation.navigate('UserSearch')}
                    >
                      <Text style={styles.findFriendsButtonText}>Find Friends</Text>
                    </TouchableOpacity>
                  )}
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
  tabsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFD700',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  activeTabText: {
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  requestsList: {
    gap: 12,
  },
  requestItem: {
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
  requestItemSelected: {
    borderColor: '#FFD700',
    backgroundColor: '#fffbf0',
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e1e5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  requestTime: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  requestMessage: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  requestStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  actionButtonText: {
    fontSize: 16,
  },
  acceptButton: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  acceptButtonText: {
    color: '#2e7d32',
  },
  declineButton: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  declineButtonText: {
    color: '#c62828',
  },
  cancelButton: {
    backgroundColor: '#fff3e0',
    borderColor: '#ff9800',
  },
  cancelButtonText: {
    color: '#ef6c00',
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
    marginBottom: 20,
  },
  findFriendsButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FFD700',
    borderRadius: 12,
  },
  findFriendsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
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
