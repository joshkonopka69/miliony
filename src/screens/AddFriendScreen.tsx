import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, SafeAreaView, FlatList } from 'react-native';
import { useAppNavigation } from '../navigation';

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
        <View style={styles.headerSpacer} />
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
              <Text style={styles.quickActionSubtitle}>Discover friends in your area</Text>
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
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#27272a', // text-zinc-800
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181b', // text-zinc-900
    letterSpacing: -0.015,
    paddingRight: 40,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#18181b',
    marginBottom: 4,
  },
  searchSubtitle: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#71717a',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#18181b',
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  clearIcon: {
    fontSize: 12,
    color: '#6b7280',
  },
  resultsSection: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181b',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#71717a',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9bc06',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#18181b',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 2,
  },
  mutualFriends: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#f9bc06',
  },
  removeButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addButtonText: {
    color: '#18181b',
  },
  removeButtonText: {
    color: '#6b7280',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActionsSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181b',
    marginBottom: 16,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionIconText: {
    fontSize: 18,
  },
  quickActionInfo: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: '#71717a',
  },
  quickActionArrow: {
    fontSize: 18,
    color: '#d1d5db',
  },
});
