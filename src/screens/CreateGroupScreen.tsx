import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, SafeAreaView, FlatList } from 'react-native';
import { useAppNavigation } from '../navigation';

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  isSelected: boolean;
}

export default function CreateGroupScreen() {
  const navigation = useAppNavigation();
  
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Mock friends data
  const friends: Friend[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      username: '@alex.johnson',
      isSelected: false,
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      username: '@sarah.wilson',
      isSelected: false,
    },
    {
      id: '3',
      name: 'Mike Chen',
      username: '@mike.chen',
      isSelected: false,
    },
    {
      id: '4',
      name: 'Emma Davis',
      username: '@emma.davis',
      isSelected: false,
    },
    {
      id: '5',
      name: 'David Brown',
      username: '@david.brown',
      isSelected: false,
    },
    {
      id: '6',
      name: 'Lisa Garcia',
      username: '@lisa.garcia',
      isSelected: false,
    },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleMyGroups = () => {
    navigation.navigate('MyGroups');
  };

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriends(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedFriends.length === 0) {
      Alert.alert('Error', 'Please select at least one friend');
      return;
    }

    setIsCreating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsCreating(false);
      Alert.alert(
        'Success!', 
        `Group "${groupName}" has been created with ${selectedFriends.length} member${selectedFriends.length !== 1 ? 's' : ''}!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }, 1500);
  };

  const renderFriendItem = ({ item }: { item: Friend }) => {
    const isSelected = selectedFriends.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.friendItem, isSelected && styles.friendItemSelected]}
        onPress={() => handleFriendToggle(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.friendAvatar}>
          <Text style={styles.friendAvatarText}>
            {item.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendUsername}>{item.username}</Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const selectedFriendsData = friends.filter(friend => selectedFriends.includes(friend.id));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.myGroupsButton} onPress={handleMyGroups}>
            <Text style={styles.myGroupsButtonText}>My Groups</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.createButton, (!groupName.trim() || selectedFriends.length === 0 || isCreating) && styles.createButtonDisabled]}
            onPress={handleCreateGroup}
            disabled={!groupName.trim() || selectedFriends.length === 0 || isCreating}
          >
            <Text style={[styles.createButtonText, (!groupName.trim() || selectedFriends.length === 0 || isCreating) && styles.createButtonTextDisabled]}>
              {isCreating ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Group Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Group Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter group name..."
              value={groupName}
              onChangeText={setGroupName}
              maxLength={50}
            />
            <Text style={styles.characterCount}>{groupName.length}/50</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Enter group description..."
              value={groupDescription}
              onChangeText={setGroupDescription}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={styles.characterCount}>{groupDescription.length}/200</Text>
          </View>
        </View>

        {/* Selected Members Preview */}
        {selectedFriends.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Selected Members ({selectedFriends.length})
            </Text>
            <View style={styles.selectedMembersContainer}>
              {selectedFriendsData.map(friend => (
                <View key={friend.id} style={styles.selectedMemberItem}>
                  <View style={styles.selectedMemberAvatar}>
                    <Text style={styles.selectedMemberAvatarText}>
                      {friend.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <Text style={styles.selectedMemberName}>{friend.name}</Text>
                  <TouchableOpacity 
                    style={styles.removeMemberButton}
                    onPress={() => handleFriendToggle(friend.id)}
                  >
                    <Text style={styles.removeMemberIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Friends List Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Friends</Text>
          <Text style={styles.sectionSubtitle}>
            Choose friends to add to your group
          </Text>
          
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Group Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Privacy</Text>
              <Text style={styles.settingSubtitle}>Only group members can see posts</Text>
            </View>
            <View style={styles.settingToggle}>
              <Text style={styles.settingToggleText}>Private</Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingSubtitle}>Get notified about group activity</Text>
            </View>
            <View style={styles.settingToggle}>
              <Text style={styles.settingToggleText}>On</Text>
            </View>
          </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  myGroupsButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  myGroupsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f9bc06',
    borderRadius: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#18181b',
  },
  createButtonTextDisabled: {
    color: '#9ca3af',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#18181b',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#18181b',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  selectedMembersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9bc06',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  selectedMemberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedMemberAvatarText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  selectedMemberName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#18181b',
  },
  removeMemberButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMemberIcon: {
    fontSize: 10,
    color: '#ffffff',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  friendItemSelected: {
    backgroundColor: '#fef3c7', // bg-yellow-100
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9bc06',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#18181b',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: '#71717a',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#f9bc06',
    borderColor: '#f9bc06',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#18181b',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#71717a',
  },
  settingToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  settingToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
  },
});

