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
  Dimensions,
} from 'react-native';
import { useAppNavigation } from '../../navigation';
import { useGroupManager } from '../../hooks/useGroups';
import { Group, GroupMember } from '../../services/groupService';

const { width } = Dimensions.get('window');

// Custom SM Logo Component
const SMLogo = ({ size = 30 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

interface GroupDetailsScreenProps {
  route: {
    params: {
      groupId: string;
    };
  };
}

export default function GroupDetailsScreen({ route }: GroupDetailsScreenProps) {
  const { groupId } = route.params;
  const navigation = useAppNavigation();
  const {
    currentGroup,
    groupMembers,
    groupAnalytics,
    isLoading,
    error,
    clearError,
    getGroup,
    getGroupMembers,
    getGroupAnalytics,
    isMember,
    getUserRole,
    addMember,
    removeMember,
    refreshGroup,
  } = useGroupManager();

  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'moderator' | 'member' | null>(null);
  const [isUserMember, setIsUserMember] = useState(false);

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
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    await Promise.all([
      getGroup(groupId),
      getGroupMembers(groupId),
      getGroupAnalytics(groupId),
    ]);
    
    // Check user membership and role
    const membership = await isMember(groupId, currentGroup?.created_by || '');
    const role = await getUserRole(groupId, currentGroup?.created_by || '');
    
    setIsUserMember(membership);
    setUserRole(role);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleJoinGroup = async () => {
    try {
      setIsJoining(true);
      const success = await addMember(groupId, currentGroup?.created_by || '');
      if (success) {
        setIsUserMember(true);
        setUserRole('member');
        Alert.alert('Success', 'You have joined the group!');
      } else {
        Alert.alert('Error', 'Failed to join group. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to join group');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLeaving(true);
              const success = await removeMember(groupId, currentGroup?.created_by || '');
              if (success) {
                setIsUserMember(false);
                setUserRole(null);
                Alert.alert('Success', 'You have left the group.');
              } else {
                Alert.alert('Error', 'Failed to leave group. Please try again.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to leave group');
            } finally {
              setIsLeaving(false);
            }
          },
        },
      ]
    );
  };

  const handleViewMembers = () => {
    navigation.navigate('GroupMembers', { groupId });
  };

  const handleViewChat = () => {
    navigation.navigate('GroupChat', { groupId });
  };

  const handleViewEvents = () => {
    navigation.navigate('GroupEvents', { groupId });
  };

  const handleViewSettings = () => {
    navigation.navigate('GroupSettings', { groupId });
  };

  const handleInviteMembers = () => {
    navigation.navigate('GroupInvite', { groupId });
  };

  const getPrivacyIcon = (privacy: string): string => {
    switch (privacy) {
      case 'public': return '🌍';
      case 'private': return '🔒';
      case 'invite_only': return '👥';
      default: return '🔒';
    }
  };

  const getPrivacyLabel = (privacy: string): string => {
    switch (privacy) {
      case 'public': return 'Public';
      case 'private': return 'Private';
      case 'invite_only': return 'Invite Only';
      default: return 'Private';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSportIcon = (sport: string): string => {
    const sportIcons: { [key: string]: string } = {
      basketball: '🏀',
      football: '🏈',
      soccer: '⚽',
      tennis: '🎾',
      volleyball: '🏐',
      baseball: '⚾',
      hockey: '🏒',
      swimming: '🏊',
      running: '🏃',
      cycling: '🚴',
      golf: '⛳',
      boxing: '🥊',
      yoga: '🧘',
      weightlifting: '🏋️',
      crossfit: '💪',
      climbing: '🧗',
      surfing: '🏄',
      skiing: '⛷️',
      snowboarding: '🏂',
    };
    return sportIcons[sport.toLowerCase()] || '🏆';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading group details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentGroup) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Group not found</Text>
          <TouchableOpacity style={styles.errorButton} onPress={handleBack}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Details</Text>
        <SMLogo size={30} />
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text style={styles.errorBannerDismiss}>×</Text>
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
          {/* Group Header */}
          <View style={styles.groupHeader}>
            {currentGroup.cover_url ? (
              <Image source={{ uri: currentGroup.cover_url }} style={styles.coverImage} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Text style={styles.coverPlaceholderText}>
                  {getSportIcon(currentGroup.sport)}
                </Text>
              </View>
            )}
            
            <View style={styles.groupInfo}>
              <View style={styles.groupTitleRow}>
                <Text style={styles.groupTitle}>{currentGroup.name}</Text>
                <View style={styles.privacyBadge}>
                  <Text style={styles.privacyIcon}>
                    {getPrivacyIcon(currentGroup.privacy)}
                  </Text>
                  <Text style={styles.privacyLabel}>
                    {getPrivacyLabel(currentGroup.privacy)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.groupMeta}>
                <Text style={styles.sportText}>
                  {getSportIcon(currentGroup.sport)} {currentGroup.sport}
                </Text>
                <Text style={styles.memberCount}>
                  👥 {currentGroup.member_count} member{currentGroup.member_count !== 1 ? 's' : ''}
                </Text>
              </View>
              
              {currentGroup.description && (
                <Text style={styles.groupDescription}>
                  {currentGroup.description}
                </Text>
              )}
            </View>
          </View>

          {/* Tags */}
          {currentGroup.tags && currentGroup.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {currentGroup.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Location */}
          {currentGroup.location && (
            <View style={styles.locationSection}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.locationCard}>
                <Text style={styles.locationIcon}>📍</Text>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>{currentGroup.location.name}</Text>
                  <Text style={styles.locationRadius}>
                    Within {currentGroup.location.radius} km
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Rules */}
          {currentGroup.rules && currentGroup.rules.length > 0 && (
            <View style={styles.rulesSection}>
              <Text style={styles.sectionTitle}>Group Rules</Text>
              <View style={styles.rulesContainer}>
                {currentGroup.rules.map((rule, index) => (
                  <View key={index} style={styles.ruleItem}>
                    <Text style={styles.ruleNumber}>{index + 1}.</Text>
                    <Text style={styles.ruleText}>{rule}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Requirements */}
          {currentGroup.requirements && (
            <View style={styles.requirementsSection}>
              <Text style={styles.sectionTitle}>Member Requirements</Text>
              <View style={styles.requirementsCard}>
                {currentGroup.requirements.age_min && currentGroup.requirements.age_max && (
                  <View style={styles.requirementItem}>
                    <Text style={styles.requirementIcon}>🎂</Text>
                    <Text style={styles.requirementText}>
                      Age: {currentGroup.requirements.age_min} - {currentGroup.requirements.age_max}
                    </Text>
                  </View>
                )}
                
                {currentGroup.requirements.skill_level && currentGroup.requirements.skill_level !== 'any' && (
                  <View style={styles.requirementItem}>
                    <Text style={styles.requirementIcon}>⭐</Text>
                    <Text style={styles.requirementText}>
                      Skill Level: {currentGroup.requirements.skill_level}
                    </Text>
                  </View>
                )}
                
                {currentGroup.requirements.gender_preference && currentGroup.requirements.gender_preference !== 'any' && (
                  <View style={styles.requirementItem}>
                    <Text style={styles.requirementIcon}>👤</Text>
                    <Text style={styles.requirementText}>
                      Gender: {currentGroup.requirements.gender_preference}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Analytics */}
          {groupAnalytics && (
            <View style={styles.analyticsSection}>
              <Text style={styles.sectionTitle}>Group Analytics</Text>
              <View style={styles.analyticsGrid}>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsValue}>{groupAnalytics.total_members}</Text>
                  <Text style={styles.analyticsLabel}>Total Members</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsValue}>{groupAnalytics.total_events}</Text>
                  <Text style={styles.analyticsLabel}>Total Events</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsValue}>{groupAnalytics.engagement_score.toFixed(1)}</Text>
                  <Text style={styles.analyticsLabel}>Engagement</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsValue}>{groupAnalytics.growth_rate.toFixed(1)}%</Text>
                  <Text style={styles.analyticsLabel}>Growth Rate</Text>
                </View>
              </View>
            </View>
          )}

          {/* Group Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Group Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Created</Text>
                <Text style={styles.infoValue}>{formatDate(currentGroup.created_at)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Updated</Text>
                <Text style={styles.infoValue}>{formatDate(currentGroup.updated_at)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={[styles.infoValue, styles.statusActive]}>
                  {currentGroup.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
              {currentGroup.member_limit && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Member Limit</Text>
                  <Text style={styles.infoValue}>{currentGroup.member_limit}</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {!isUserMember ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.joinButton]}
            onPress={handleJoinGroup}
            disabled={isJoining}
          >
            {isJoining ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <Text style={styles.joinButtonText}>Join Group</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.memberActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.leaveButton]}
              onPress={handleLeaveGroup}
              disabled={isLeaving}
            >
              {isLeaving ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.leaveButtonText}>Leave Group</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.chatButton]}
              onPress={handleViewChat}
            >
              <Text style={styles.chatButtonText}>💬 Chat</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Navigation Tabs */}
      {isUserMember && (
        <View style={styles.navigationTabs}>
          <TouchableOpacity style={styles.navTab} onPress={handleViewMembers}>
            <Text style={styles.navTabIcon}>👥</Text>
            <Text style={styles.navTabText}>Members</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navTab} onPress={handleViewEvents}>
            <Text style={styles.navTabIcon}>📅</Text>
            <Text style={styles.navTabText}>Events</Text>
          </TouchableOpacity>
          
          {(userRole === 'admin' || userRole === 'moderator') && (
            <TouchableOpacity style={styles.navTab} onPress={handleViewSettings}>
              <Text style={styles.navTabIcon}>⚙️</Text>
              <Text style={styles.navTabText}>Settings</Text>
            </TouchableOpacity>
          )}
          
          {userRole === 'admin' && (
            <TouchableOpacity style={styles.navTab} onPress={handleInviteMembers}>
              <Text style={styles.navTabIcon}>➕</Text>
              <Text style={styles.navTabText}>Invite</Text>
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
    backgroundColor: '#000000',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#c62828',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FFD700',
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  errorBanner: {
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
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#c62828',
  },
  errorBannerDismiss: {
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
  groupHeader: {
    marginBottom: 24,
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  coverPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  coverPlaceholderText: {
    fontSize: 48,
  },
  groupInfo: {
    gap: 12,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  privacyIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  privacyLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sportText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  memberCount: {
    fontSize: 14,
    color: '#666666',
  },
  groupDescription: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  tagsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  locationSection: {
    marginBottom: 24,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  locationRadius: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  rulesSection: {
    marginBottom: 24,
  },
  rulesContainer: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  ruleNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    marginRight: 12,
    minWidth: 20,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  requirementsSection: {
    marginBottom: 24,
  },
  requirementsCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  requirementText: {
    fontSize: 14,
    color: '#333333',
  },
  analyticsSection: {
    marginBottom: 24,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analyticsItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  statusActive: {
    color: '#4CAF50',
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#FFD700',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 12,
  },
  leaveButton: {
    flex: 1,
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c62828',
  },
  chatButton: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  navigationTabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navTabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navTabText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
});
