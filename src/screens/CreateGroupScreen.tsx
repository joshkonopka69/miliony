import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, SafeAreaView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../navigation';
import { useAuth } from '../contexts/AuthContext';
import { groupService } from '../services/groupService';
import { ROUTES } from '../navigation/types';

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  isSelected: boolean;
}

// Sport options with icons
const SPORTS = [
  { id: 'basketball', name: 'Basketball', icon: 'basketball' as const, emoji: '🏀', color: '#F97316' },
  { id: 'football', name: 'Football', icon: 'football' as const, emoji: '⚽', color: '#10B981' },
  { id: 'tennis', name: 'Tennis', icon: 'tennisball' as const, emoji: '🎾', color: '#EAB308' },
  { id: 'volleyball', name: 'Volleyball', icon: 'basketball' as const, emoji: '🏐', color: '#3B82F6' },
  { id: 'running', name: 'Running', icon: 'walk' as const, emoji: '🏃‍♂️', color: '#EF4444' },
  { id: 'cycling', name: 'Cycling', icon: 'bicycle' as const, emoji: '🚴‍♂️', color: '#8B5CF6' },
  { id: 'swimming', name: 'Swimming', icon: 'water' as const, emoji: '🏊‍♂️', color: '#06B6D4' },
  { id: 'gym', name: 'Gym', icon: 'fitness' as const, emoji: '💪', color: '#6B7280' },
];

export default function CreateGroupScreen() {
  const navigation = useAppNavigation();
  const { user } = useAuth();
  
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedSport, setSelectedSport] = useState('basketball');
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
    navigation.navigate(ROUTES.MY_GROUPS);
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

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    setIsCreating(true);
    
    try {
      if (!user?.id) {
        // Mock behavior for non-authenticated users
        setTimeout(() => {
          setIsCreating(false);
          Alert.alert(
            'Success!', 
            `Group "${groupName}" has been created!`,
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate(ROUTES.MY_GROUPS)
              }
            ]
          );
        }, 1500);
        return;
      }

      // Create group using groupService
      const newGroup = await groupService.createGroup(
        {
          name: groupName.trim(),
          description: groupDescription.trim() || undefined,
          sport: selectedSport,
          privacy: 'public',
          tags: [selectedSport],
        },
        user.id
      );

      if (newGroup) {
        // Add selected friends as members (if any)
        if (selectedFriends.length > 0) {
          for (const friendId of selectedFriends) {
            await groupService.addMember(newGroup.id, friendId, user.id);
          }
        }

        setIsCreating(false);
        Alert.alert(
          'Success!', 
          `Group "${groupName}" has been created${selectedFriends.length > 0 ? ` with ${selectedFriends.length} member${selectedFriends.length !== 1 ? 's' : ''}` : ''}!`,
          [
            {
              text: 'View Group',
              onPress: () => navigation.navigate(ROUTES.GROUP_DETAILS, { groupId: newGroup.id })
            },
            {
              text: 'My Groups',
              onPress: () => navigation.navigate(ROUTES.MY_GROUPS)
            }
          ]
        );
      } else {
        setIsCreating(false);
        Alert.alert('Error', 'Failed to create group. Please try again.');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setIsCreating(false);
      Alert.alert('Error', 'An error occurred while creating the group.');
    }
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
          {isSelected && <Ionicons name="checkmark" size={18} color="#000000" />}
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
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.myGroupsButton} onPress={handleMyGroups}>
            <Text style={styles.myGroupsButtonText}>My Groups</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.createButton, (!groupName.trim() || isCreating) && styles.createButtonDisabled]}
            onPress={handleCreateGroup}
            disabled={!groupName.trim() || isCreating}
          >
            <Text style={[styles.createButtonText, (!groupName.trim() || isCreating) && styles.createButtonTextDisabled]}>
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

        {/* Sport Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Sport</Text>
          <View style={styles.sportsGrid}>
            {SPORTS.map((sport) => {
              const isSelected = selectedSport === sport.id;
              return (
                <TouchableOpacity
                  key={sport.id}
                  style={[
                    styles.sportCard,
                    isSelected && styles.sportCardSelected,
                    { borderColor: isSelected ? sport.color : '#E5E5E5' }
                  ]}
                  onPress={() => setSelectedSport(sport.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.sportIconContainer,
                    { backgroundColor: isSelected ? sport.color + '20' : '#F5F5F5' }
                  ]}>
                    <Ionicons 
                      name={sport.icon} 
                      size={28} 
                      color={isSelected ? sport.color : '#9CA3AF'} 
                    />
                  </View>
                  <Text style={[
                    styles.sportName,
                    isSelected && styles.sportNameSelected
                  ]}>
                    {sport.name}
                  </Text>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={sport.color} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
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
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Friends List Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Friends (Optional)</Text>
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
  // Sport Selection Styles
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  sportCard: {
    width: '47%',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  sportCardSelected: {
    borderWidth: 2,
  },
  sportIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sportName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  sportNameSelected: {
    color: '#000000',
    fontWeight: '700',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  // Settings
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
