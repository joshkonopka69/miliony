import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { useAppNavigation } from '../../navigation';
import { useGroupManager } from '../../hooks/useGroups';
import { GroupMember } from '../../services/groupService';

// Custom SM Logo Component
const SMLogo = ({ size = 30 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

interface GroupMembersScreenProps {
  route: {
    params: {
      groupId: string;
    };
  };
}

export default function GroupMembersScreen({ route }: GroupMembersScreenProps) {
  const { groupId } = route.params;
  const navigation = useAppNavigation();
  const {
    groupMembers,
    currentGroup,
    isLoading,
    error,
    clearError,
    getGroupMembers,
    updateMemberRole,
    removeMember,
    getUserRole,
    canPerformAction,
  } = useGroupManager();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [selectedMemberForRole, setSelectedMemberForRole] = useState<GroupMember | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'moderator' | 'member' | null>(null);

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
    loadMembers();
    loadUserRole();
  }, [groupId]);

  const loadMembers = async () => {
    await getGroupMembers(groupId);
  };

  const loadUserRole = async () => {
    const role = await getUserRole(groupId, currentGroup?.created_by || '');
    setUserRole(role);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleMemberPress = (member: GroupMember) => {
    if (isSelectionMode) {
      toggleMemberSelection(member.user_id);
    } else {
      // Navigate to member profile or show member details
      navigation.navigate('UserProfile', { userId: member.user_id });
    }
  };

  const handleMemberLongPress = (member: GroupMember) => {
    if (userRole === 'admin' || userRole === 'moderator') {
      setIsSelectionMode(true);
      toggleMemberSelection(member.user_id);
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    const newSelection = new Set(selectedMembers);
    if (newSelection.has(memberId)) {
      newSelection.delete(memberId);
    } else {
      newSelection.add(memberId);
    }
    setSelectedMembers(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedMembers.size === getFilteredMembers().length) {
      setSelectedMembers(new Set());
    } else {
      const allIds = new Set(getFilteredMembers().map(m => m.user_id));
      setSelectedMembers(allIds);
    }
  };

  const handleChangeRole = (member: GroupMember) => {
    setSelectedMemberForRole(member);
    setShowRolePicker(true);
  };

  const handleRoleChange = async (newRole: 'admin' | 'moderator' | 'member') => {
    if (!selectedMemberForRole) return;

    try {
      const success = await updateMemberRole(groupId, selectedMemberForRole.user_id, newRole);
      if (success) {
        Alert.alert('Success', `Member role updated to ${newRole}`);
        await loadMembers();
      } else {
        Alert.alert('Error', 'Failed to update member role');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update member role');
    } finally {
      setShowRolePicker(false);
      setSelectedMemberForRole(null);
    }
  };

  const handleRemoveMember = (member: GroupMember) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${member.user?.display_name || 'this member'} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await removeMember(groupId, member.user_id);
              if (success) {
                Alert.alert('Success', 'Member removed from group');
                await loadMembers();
              } else {
                Alert.alert('Error', 'Failed to remove member');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  const handleRemoveSelected = () => {
    Alert.alert(
      'Remove Members',
      `Are you sure you want to remove ${selectedMembers.size} member${selectedMembers.size !== 1 ? 's' : ''} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const promises = Array.from(selectedMembers).map(memberId => 
                removeMember(groupId, memberId)
              );
              await Promise.all(promises);
              Alert.alert('Success', 'Members removed from group');
              setSelectedMembers(new Set());
              setIsSelectionMode(false);
              await loadMembers();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove members');
            }
          },
        },
      ]
    );
  };

  const getFilteredMembers = (): GroupMember[] => {
    let filtered = groupMembers;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member => 
        member.user?.display_name?.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const getRoleIcon = (role: string): string => {
    switch (role) {
      case 'admin': return '👑';
      case 'moderator': return '🛡️';
      case 'member': return '👤';
      default: return '👤';
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'admin': return '#FFD700';
      case 'moderator': return '#2196F3';
      case 'member': return '#666666';
      default: return '#666666';
    }
  };

  const formatJoinDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getMembersByRole = (role: 'admin' | 'moderator' | 'member'): GroupMember[] => {
    return groupMembers.filter(member => member.role === role);
  };

  const filteredMembers = getFilteredMembers();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Members</Text>
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search members..."
          placeholderTextColor="#8e8e93"
        />
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Member Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getMembersByRole('admin').length}</Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getMembersByRole('moderator').length}</Text>
          <Text style={styles.statLabel}>Moderators</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getMembersByRole('member').length}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{groupMembers.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Action Bar */}
      {isSelectionMode && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSelectAll}>
            <Text style={styles.actionButtonText}>
              {selectedMembers.size === filteredMembers.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.removeButton]}
            onPress={handleRemoveSelected}
            disabled={selectedMembers.size === 0}
          >
            <Text style={[styles.actionButtonText, styles.removeButtonText, selectedMembers.size === 0 && styles.actionButtonTextDisabled]}>
              Remove ({selectedMembers.size})
            </Text>
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
          {/* Loading State */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
              <Text style={styles.loadingText}>Loading members...</Text>
            </View>
          ) : (
            <>
              {/* Members List */}
              {filteredMembers.length > 0 ? (
                <View style={styles.membersList}>
                  {filteredMembers.map((member) => (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.memberItem,
                        selectedMembers.has(member.user_id) && styles.memberItemSelected,
                      ]}
                      onPress={() => handleMemberPress(member)}
                      onLongPress={() => handleMemberLongPress(member)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.memberContent}>
                        <View style={styles.memberHeader}>
                          <View style={styles.memberAvatar}>
                            {member.user?.avatar_url ? (
                              <Image 
                                source={{ uri: member.user.avatar_url }} 
                                style={styles.memberAvatarImage}
                              />
                            ) : (
                              <View style={styles.memberAvatarPlaceholder}>
                                <Text style={styles.memberAvatarText}>
                                  {member.user?.display_name?.charAt(0) || '?'}
                                </Text>
                              </View>
                            )}
                          </View>
                          
                          <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>
                              {member.user?.display_name || 'Unknown User'}
                            </Text>
                            <Text style={styles.memberJoinDate}>
                              Joined {formatJoinDate(member.joined_at)}
                            </Text>
                          </View>
                          
                          <View style={styles.memberRole}>
                            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(member.role) }]}>
                              <Text style={styles.roleIcon}>
                                {getRoleIcon(member.role)}
                              </Text>
                              <Text style={styles.roleText}>
                                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                              </Text>
                            </View>
                          </View>
                          
                          {isSelectionMode && (
                            <TouchableOpacity
                              style={[styles.selectionIndicator, selectedMembers.has(member.user_id) && styles.selectionIndicatorSelected]}
                              onPress={() => toggleMemberSelection(member.user_id)}
                            >
                              {selectedMembers.has(member.user_id) && (
                                <Text style={styles.selectionCheckmark}>✓</Text>
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                        
                        {/* Member Actions */}
                        {!isSelectionMode && (userRole === 'admin' || userRole === 'moderator') && member.role !== 'admin' && (
                          <View style={styles.memberActions}>
                            <TouchableOpacity
                              style={styles.memberActionButton}
                              onPress={() => handleChangeRole(member)}
                            >
                              <Text style={styles.memberActionButtonText}>Change Role</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                              style={[styles.memberActionButton, styles.removeMemberButton]}
                              onPress={() => handleRemoveMember(member)}
                            >
                              <Text style={[styles.memberActionButtonText, styles.removeMemberButtonText]}>
                                Remove
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>👥</Text>
                  <Text style={styles.emptyTitle}>
                    {searchQuery ? 'No members found' : 'No members yet'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Members will appear here when they join the group'
                    }
                  </Text>
                </View>
              )}
            </>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      {!isSelectionMode && (userRole === 'admin' || userRole === 'moderator') && (
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.bottomActionButton}
            onPress={() => setIsSelectionMode(true)}
          >
            <Text style={styles.bottomActionButtonText}>Select Members</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.bottomActionButton}
            onPress={() => navigation.navigate('GroupInvite', { groupId })}
          >
            <Text style={styles.bottomActionButtonText}>Invite Members</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Role Picker Modal */}
      <Modal visible={showRolePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.rolePickerModal}>
            <Text style={styles.rolePickerTitle}>Change Member Role</Text>
            <Text style={styles.rolePickerSubtitle}>
              {selectedMemberForRole?.user?.display_name}
            </Text>
            
            <View style={styles.roleOptions}>
              <TouchableOpacity
                style={styles.roleOption}
                onPress={() => handleRoleChange('admin')}
              >
                <Text style={styles.roleOptionIcon}>👑</Text>
                <Text style={styles.roleOptionText}>Admin</Text>
                <Text style={styles.roleOptionDescription}>Full group control</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.roleOption}
                onPress={() => handleRoleChange('moderator')}
              >
                <Text style={styles.roleOptionIcon}>🛡️</Text>
                <Text style={styles.roleOptionText}>Moderator</Text>
                <Text style={styles.roleOptionDescription}>Moderate content and members</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.roleOption}
                onPress={() => handleRoleChange('member')}
              >
                <Text style={styles.roleOptionIcon}>👤</Text>
                <Text style={styles.roleOptionText}>Member</Text>
                <Text style={styles.roleOptionDescription}>Basic group access</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.rolePickerCancelButton}
              onPress={() => setShowRolePicker(false)}
            >
              <Text style={styles.rolePickerCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
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
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  actionButtonTextDisabled: {
    color: '#999999',
  },
  removeButton: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  removeButtonText: {
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
  membersList: {
    gap: 12,
  },
  memberItem: {
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
  memberItemSelected: {
    backgroundColor: '#f0f8ff',
    borderColor: '#2196F3',
  },
  memberContent: {
    flex: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberAvatar: {
    marginRight: 12,
  },
  memberAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  memberAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  memberJoinDate: {
    fontSize: 12,
    color: '#666666',
  },
  memberRole: {
    marginRight: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  roleText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
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
  memberActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  memberActionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    alignItems: 'center',
  },
  memberActionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
  },
  removeMemberButton: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  removeMemberButtonText: {
    color: '#c62828',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rolePickerModal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  rolePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rolePickerSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    paddingVertical: 8,
  },
  roleOptions: {
    padding: 16,
    gap: 12,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  roleOptionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  roleOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  roleOptionDescription: {
    fontSize: 12,
    color: '#666666',
  },
  rolePickerCancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  rolePickerCancelButtonText: {
    fontSize: 16,
    color: '#666666',
  },
});
