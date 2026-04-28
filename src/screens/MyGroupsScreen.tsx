import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppNavigation } from '../navigation/hooks';
import { ROUTES } from '../navigation/types';
import { BottomNavBar, SMLogo } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { groupService, Group } from '../services/groupService';
import { useToast } from '../components/ToastProvider';
import { useConfirmation } from '../components/ConfirmationModal';

// Sport emoji mapping
const SPORT_EMOJI_MAP: Record<string, string> = {
  basketball: '🏀',
  football: '⚽',
  soccer: '⚽',
  tennis: '🎾',
  running: 'walk-outline‍♂️',
  cycling: 'bicycle-outline‍♂️',
  swimming: 'water-outline‍♂️',
  gym: '💪',
  volleyball: '🏐',
  baseball: '⚾',
  golf: 'golf-outline',
  hockey: '🏒',
  default: '🏆',
};

const getSportEmoji = (sportType: string): string => {
  return SPORT_EMOJI_MAP[sportType?.toLowerCase()] || SPORT_EMOJI_MAP.default;
};

interface GroupWithRole extends Group {
  userRole?: 'admin' | 'moderator' | 'member';
}

export default function MyGroupsScreen() {
  const navigation = useAppNavigation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { showSuccess, showError, showInfo } = useToast();
  const { showConfirmation } = useConfirmation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<GroupWithRole[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'admin' | 'member'>('all');

  // Load groups on mount
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);

      if (!user?.id) {
        // Mock data for preview
        const mockGroups: GroupWithRole[] = [
          {
            id: '1',
            name: 'Basketball Enthusiasts',
            description: 'Weekly basketball games in Central Park',
            sport: 'basketball',
            privacy: 'public',
            member_count: 24,
            created_by: user?.id || 'mock-user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            tags: ['basketball', 'casual', 'weekly'],
            userRole: 'admin',
          },
          {
            id: '2',
            name: 'Sunday Runners',
            description: 'Morning running group every Sunday',
            sport: 'running',
            privacy: 'public',
            member_count: 18,
            created_by: 'other-user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            tags: ['running', 'morning', 'fitness'],
            userRole: 'member',
          },
          {
            id: '3',
            name: 'Tennis Club NYC',
            description: 'Competitive tennis players looking for matches',
            sport: 'tennis',
            privacy: 'private',
            member_count: 12,
            created_by: user?.id || 'mock-user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            tags: ['tennis', 'competitive'],
            userRole: 'admin',
          },
          {
            id: '4',
            name: 'Cycling Adventures',
            description: 'Explore the city on two wheels',
            sport: 'cycling',
            privacy: 'public',
            member_count: 31,
            created_by: 'other-user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            tags: ['cycling', 'adventure', 'outdoors'],
            userRole: 'member',
          },
        ];

        setGroups(mockGroups);
        setLoading(false);
        return;
      }

      // Fetch user's groups
      const userGroups = await groupService.getUserGroups(user.id);

      // Fetch user role for each group
      const groupsWithRoles = await Promise.all(
        userGroups.map(async (group) => {
          const role = await groupService.getUserRole(group.id, user.id);
          return {
            ...group,
            userRole: role || 'member',
          };
        })
      );

      setGroups(groupsWithRoles);
    } catch (error) {
      console.error('Error loading groups:', error);
      showError('Failed to load groups', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  const handleGroupPress = (group: GroupWithRole) => {
    // Navigate to group details
    navigation.navigate(ROUTES.GROUP_DETAILS, { groupId: group.id });
  };

  const handleCreateGroup = () => {
    // Navigate to create group screen
    navigation.navigate(ROUTES.CREATE_GROUP);
  };

  const handleLeaveGroup = (group: GroupWithRole) => {
    if (group.userRole === 'admin') {
      showInfo('You are the admin of this group. Please transfer ownership or delete the group first.', 'Cannot Leave Group');
      return;
    }

    showConfirmation({
      title: 'Leave Group',
      message: `Are you sure you want to leave "${group.name}"?`,
      icon: '??',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user?.id) {
                const success = await groupService.removeMember(group.id, user.id);
                if (success) {
                  setGroups(prev => prev.filter(g => g.id !== group.id));
                  showSuccess('You have left the group', 'Success');
                } else {
                  showError('Failed to leave group', 'Error');
                }
              } else {
                // Mock behavior
                setGroups(prev => prev.filter(g => g.id !== group.id));
                showSuccess('You have left the group', 'Success');
              }
            } catch (error) {
              console.error('Error leaving group:', error);
              showError('Failed to leave group', 'Error');
            }
          },
        },
      ]
    });
  };

  // Filter groups
  const filteredGroups = selectedFilter === 'all'
    ? groups
    : selectedFilter === 'admin'
      ? groups.filter(g => g.userRole === 'admin')
      : groups.filter(g => g.userRole === 'member');

  // Group by role
  const adminGroups = filteredGroups.filter(g => g.userRole === 'admin');
  const memberGroups = filteredGroups.filter(g => g.userRole === 'member');

  const renderGroupCard = (group: GroupWithRole) => (
    <TouchableOpacity
      key={group.id}
      style={styles.groupCard}
      onPress={() => handleGroupPress(group)}
      activeOpacity={0.7}
    >
      {/* Group Icon */}
      <View style={styles.groupIconContainer}>
        <Text style={{fontSize: 18, color: '#FFD700'}}>{getSportEmoji(group.sport)}</Text>
      </View>

      {/* Group Info */}
      <View style={styles.groupInfo}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupName} numberOfLines={1}>
            {group.name}
          </Text>
          {group.userRole === 'admin' && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>

        {group.description && (
          <Text style={styles.groupDescription} numberOfLines={1}>
            {group.description}
          </Text>
        )}

        <View style={styles.groupMeta}>
          <View style={styles.memberCount}>
            <Text style={{fontSize: 13, color: '#6B7280'}}>👥</Text>
            <Text style={styles.memberCountText}>{group.member_count} {t.myGroups.members}</Text>
          </View>

          <View style={styles.privacyBadge}>
            <Text style={{fontSize: 11, color: '#6B7280'}}>{group.privacy === 'public' ? '🌐' : '•'}</Text>
            <Text style={styles.privacyText}>
              {group.privacy === 'public' ? t.myGroups.public :
                group.privacy === 'private' ? t.myGroups.private : t.myGroups.inviteOnly}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={styles.leaveButton}
        onPress={(e) => {
          e.stopPropagation();
          handleLeaveGroup(group);
        }}
        activeOpacity={0.7}
      >
        <Text style={{fontSize: 18, color: '#EF4444'}}>•</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>{t.myGroups.loadingGroups}</Text>
        </View>
      );
    }

    if (groups.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <View style={styles.emptyState}>
            <Text style={{fontSize: 72, color: '#D1D5DB'}}>•</Text>
            <Text style={styles.emptyTitle}>{t.myGroups.noGroupsTitle}</Text>
            <Text style={styles.emptyMessage}>
              {t.myGroups.noGroupsMessage}
            </Text>
            <TouchableOpacity
              style={styles.createGroupButton}
              onPress={handleCreateGroup}
              activeOpacity={0.8}
            >
              <Text style={{fontSize: 18, color: '#000000'}}>＋</Text>
              <Text style={styles.createGroupButtonText}>{t.myGroups.createFirstGroup}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (filteredGroups.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <View style={styles.emptyState}>
            <Text style={{fontSize: 54, color: '#D1D5DB'}}>🔍</Text>
            <Text style={styles.emptyTitle}>{t.myGroups.noGroupsFound}</Text>
            <Text style={styles.emptyMessage}>
              {t.myGroups.noGroupsFoundMessage.replace('{filter}', selectedFilter === 'admin' ? t.myGroups.admin : t.myGroups.member)}
            </Text>
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={() => setSelectedFilter('all')}
              activeOpacity={0.8}
            >
              <Text style={styles.clearFilterButtonText}>{t.myGroups.clearFilter}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FFD700"
          />
        }
      >
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, selectedFilter === 'all' && styles.filterTabTextActive]}>
              {t.myGroups.all} ({groups.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'admin' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('admin')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, selectedFilter === 'admin' && styles.filterTabTextActive]}>
              {t.myGroups.admin} ({adminGroups.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'member' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('member')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, selectedFilter === 'member' && styles.filterTabTextActive]}>
              {t.myGroups.member} ({memberGroups.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Admin Groups */}
        {adminGroups.length > 0 && selectedFilter === 'all' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.myGroups.adminGroupsTitle}</Text>
              <Text style={styles.sectionCount}>{adminGroups.length}</Text>
            </View>
            {adminGroups.map(renderGroupCard)}
          </View>
        )}

        {/* Member Groups */}
        {memberGroups.length > 0 && selectedFilter === 'all' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.myGroups.memberGroupsTitle}</Text>
              <Text style={styles.sectionCount}>{memberGroups.length}</Text>
            </View>
            {memberGroups.map(renderGroupCard)}
          </View>
        )}

        {/* Filtered View */}
        {selectedFilter !== 'all' && (
          <View style={styles.section}>
            {filteredGroups.map(renderGroupCard)}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <SafeAreaView style={styles.topBarSafeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={{fontSize: 22, color: '#000000'}}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.myGroups.title}</Text>
          <TouchableOpacity
            style={styles.createIconButton}
            onPress={handleCreateGroup}
            activeOpacity={0.7}
          >
            <SMLogo size={45} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Main Content */}
      {renderContent()}

      {/* Floating Action Button */}
      {!loading && groups.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateGroup}
          activeOpacity={0.8}
        >
          <Text style={{fontSize: 25, color: '#000000'}}>•</Text>
        </TouchableOpacity>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <BottomNavBar
          activeTab="MyProfile"
          onProfilePress={() => navigation.navigate(ROUTES.PROFILE)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  // Top Bar Styles
  topBarSafeArea: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
  },
  topBar: {
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  createIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Content Styles
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  createGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createGroupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  clearFilterButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  clearFilterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },
  // Filter Tabs
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#FFD700',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#000000',
  },
  // Section Styles
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  // Group Card Styles
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  groupIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupIcon: {
    fontSize: 28,
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  adminBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  groupDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCountText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  privacyText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  leaveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSpacing: {
    height: 100,
  },
  // Bottom Nav Container
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});




