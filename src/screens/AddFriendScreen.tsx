import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, SafeAreaView, FlatList } from 'react-native';
import { useAppNavigation } from '../navigation';

// Custom SM Logo Component
const SMLogo = ({ size = 30 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  isFriend: boolean;
  mutualFriends?: number;
}

export default function AddFriendScreen() {
  const navigation = useAppNavigation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock users data
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      username: '@alex.johnson',
      isFriend: false,
      mutualFriends: 3,
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      username: '@sarah.wilson',
      isFriend: false,
      mutualFriends: 1,
    },
    {
      id: '3',
      name: 'Mike Chen',
      username: '@mike.chen',
      isFriend: true,
      mutualFriends: 5,
    },
    {
      id: '4',
      name: 'Emma Davis',
      username: '@emma.davis',
      isFriend: false,
      mutualFriends: 2,
    },
    {
      id: '5',
      name: 'David Brown',
      username: '@david.brown',
      isFriend: false,
      mutualFriends: 0,
    },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setIsSearching(true);
      // Simulate search delay
      setTimeout(() => {
        const filtered = mockUsers.filter(user => 
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.username.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
        setIsSearching(false);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddFriend = (userId: string, userName: string) => {
    Alert.alert(
      'Add Friend',
      `Send friend request to ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Request', 
          onPress: () => {
            Alert.alert('Success', `Friend request sent to ${userName}!`);
            // Update user status to pending or friend
          }
        }
      ]
    );
  };

  const handleRemoveFriend = (userId: string, userName: string) => {
    Alert.alert(
      'Remove Friend',
      `Remove ${userName} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', `${userName} has been removed from your friends.`);
            // Update user status
          }
        }
      ]
    );
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <View style={styles.userAvatar}>
        <Text style={styles.userAvatarText}>
          {item.name.split(' ').map(n => n[0]).join('')}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userUsername}>{item.username}</Text>
        {item.mutualFriends !== undefined && item.mutualFriends > 0 && (
          <Text style={styles.mutualFriends}>
            {item.mutualFriends} mutual friend{item.mutualFriends !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.actionButton,
          item.isFriend ? styles.removeButton : styles.addButton
        ]}
        onPress={() => 
          item.isFriend 
            ? handleRemoveFriend(item.id, item.name)
            : handleAddFriend(item.id, item.name)
        }
      >
        <Text style={[
          styles.actionButtonText,
          item.isFriend ? styles.removeButtonText : styles.addButtonText
        ]}>
          {item.isFriend ? 'Remove' : 'Add'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>👥</Text>
      <Text style={styles.emptyStateTitle}>No users found</Text>
      <Text style={styles.emptyStateText}>
        Try searching with a different name or username
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
        <Text style={styles.headerTitle}>Add Friend</Text>
        <SMLogo size={30} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>Find Friends</Text>
          <Text style={styles.searchSubtitle}>
            Search for friends by name or username
          </Text>
          
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or username..."
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
              {isSearching ? 'Searching...' : `Results (${searchResults.length})`}
            </Text>
            
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Searching...</Text>
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
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>📱</Text>
            </View>
            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>Invite from Contacts</Text>
              <Text style={styles.quickActionSubtitle}>Find friends from your phone contacts</Text>
            </View>
            <Text style={styles.quickActionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>🔗</Text>
            </View>
            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>Share Invite Link</Text>
              <Text style={styles.quickActionSubtitle}>Send a link to invite friends</Text>
            </View>
            <Text style={styles.quickActionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem}>
            <View style={styles.quickActionIcon}>
              <Text style={styles.quickActionIconText}>👥</Text>
            </View>
            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>Find Nearby Users</Text>
              <Text style={styles.quickActionSubtitle}>Discover people in your area</Text>
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
    backgroundColor: '#fbbf24',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fbbf24',
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