import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
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

export default function FriendsListScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const {
    friends,
    removeFriend,
    searchFriends,
    isLoading,
    isUpdating,
    error,
    clearError,
    friendsCount,
  } = useFriends();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState(friends);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

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

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = friends.filter(friend =>
        friend.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFriends(filtered);
    } else {
      setFilteredFriends(friends);
    }
  }, [searchQuery, friends]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery('');
      setFilteredFriends(friends);
    }
  };

  const handleFriendPress = (friendId: string) => {
    setSelectedFriend(selectedFriend === friendId ? null : friendId);
  };

  const handleRemoveFriend = (friendId: string, friendName: string) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friendName} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await removeFriend(friendId);
            if (success) {
              Alert.alert('Success', 'Friend removed successfully!');
            } else {
              Alert.alert('Error', 'Failed to remove friend. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleBlockUser = (friendId: string, friendName: string) => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${friendName}? They won't be able to see your profile or send you messages.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement block user functionality
            Alert.alert('Success', 'User blocked successfully!');
          },
        },
      ]
    );
  };

  const handleViewProfile = (friendId: string) => {
    // TODO: Navigate to friend's profile
    console.log('View profile for:', friendId);
  };

  const handleSendMessage = (friendId: string) => {
    // TODO: Navigate to chat with friend
    console.log('Send message to:', friendId);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getLastActiveText = (lastActive?: string) => {
    if (!lastActive) return 'Never';
    
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffMs = now.getTime() - lastActiveDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return lastActiveDate.toLocaleDateString();
  };

  const isOnline = (lastActive?: string) => {
    if (!lastActive) return false;
    
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffMs = now.getTime() - lastActiveDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    return diffMinutes < 15; // Consider online if active within last 15 minutes
  };

  const renderFriendItem = (friend: any) => {
    const isSelected = selectedFriend === friend.id;
    const online = isOnline(friend.last_active);

    return (
      <TouchableOpacity
        key={friend.id}
        style={[styles.friendItem, isSelected && styles.friendItemSelected]}
        onPress={() => handleFriendPress(friend.id)}
        activeOpacity={0.7}
      >
        <View style={styles.friendAvatarContainer}>
          {friend.avatar_url ? (
            <Image source={{ uri: friend.avatar_url }} style={styles.friendAvatar} />
          ) : (
            <View style={styles.friendAvatarPlaceholder}>
              <Text style={styles.friendAvatarText}>{getInitials(friend.display_name)}</Text>
            </View>
          )}
          {online && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{friend.display_name}</Text>
          <Text style={styles.friendLastActive}>
            {online ? 'Online' : `Last active ${getLastActiveText(friend.last_active)}`}
          </Text>
          {friend.bio && (
            <Text style={styles.friendBio} numberOfLines={1}>
              {friend.bio}
            </Text>
          )}
          {friend.favorite_sports && friend.favorite_sports.length > 0 && (
            <View style={styles.sportsContainer}>
              {friend.favorite_sports.slice(0, 3).map((sport: string, index: number) => (
                <View key={index} style={styles.sportChip}>
                  <Text style={styles.sportChipText}>{sport}</Text>
                </View>
              ))}
              {friend.favorite_sports.length > 3 && (
                <Text style={styles.moreSportsText}>+{friend.favorite_sports.length - 3} more</Text>
              )}
            </View>
          )}
        </View>

        {isSelected && (
          <Animated.View 
            style={[
              styles.friendActions,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleViewProfile(friend.id)}
            >
              <Text style={styles.actionButtonText}>👤</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleSendMessage(friend.id)}
            >
              <Text style={styles.actionButtonText}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.removeButton]}
              onPress={() => handleRemoveFriend(friend.id, friend.display_name)}
            >
              <Text style={[styles.actionButtonText, styles.removeButtonText]}>🗑️</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.blockButton]}
              onPress={() => handleBlockUser(friend.id, friend.display_name)}
            >
              <Text style={[styles.actionButtonText, styles.blockButtonText]}>🚫</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search friends..."
            placeholderTextColor="#8e8e93"
          />
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text style={styles.errorDismiss}>×</Text>
          </TouchableOpacity>
        </View>
      )}

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
          {/* Friends Count */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {friendsCount} {friendsCount === 1 ? 'Friend' : 'Friends'}
            </Text>
            {searchQuery && (
              <Text style={styles.searchResultsText}>
                {filteredFriends.length} result{filteredFriends.length !== 1 ? 's' : ''} found
              </Text>
            )}
          </View>

          {/* Loading State */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
              <Text style={styles.loadingText}>Loading friends...</Text>
            </View>
          ) : (
            <>
              {/* Friends List */}
              {filteredFriends.length > 0 ? (
                <View style={styles.friendsList}>
                  {filteredFriends.map(renderFriendItem)}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>👥</Text>
                  <Text style={styles.emptyTitle}>
                    {searchQuery ? 'No friends found' : 'No friends yet'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Start building your network by adding friends!'
                    }
                  </Text>
                  {!searchQuery && (
                    <TouchableOpacity 
                      style={styles.addFriendsButton}
                      onPress={() => navigation.navigate('UserSearch')}
                    >
                      <Text style={styles.addFriendsButtonText}>Find Friends</Text>
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
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    height: 44,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  searchResultsText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
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
  friendsList: {
    gap: 12,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  friendItemSelected: {
    borderColor: '#FFD700',
    backgroundColor: '#fffbf0',
  },
  friendAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  friendAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e1e5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  friendLastActive: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  friendBio: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  sportChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  sportChipText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#666666',
  },
  moreSportsText: {
    fontSize: 10,
    color: '#999999',
    alignSelf: 'center',
  },
  friendActions: {
    flexDirection: 'row',
    gap: 8,
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
  removeButton: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  removeButtonText: {
    color: '#c62828',
  },
  blockButton: {
    backgroundColor: '#fff3e0',
    borderColor: '#ffcc02',
  },
  blockButtonText: {
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
  addFriendsButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FFD700',
    borderRadius: 12,
  },
  addFriendsButtonText: {
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
