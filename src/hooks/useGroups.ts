import { useGroups as useGroupContext } from '../contexts/GroupContext';
import { Group, GroupMember, GroupEvent, GroupSettings, GroupInvitation, GroupAnalytics, CreateGroupData, UpdateGroupData, GroupFilters } from '../services/groupService';
import { GroupMessage, GroupChatSettings, GroupChatMember, ChatAnalytics } from '../services/groupChatService';

// Re-export the context hook for convenience
export { useGroupContext as useGroups };

// Additional hook for group management
export function useGroupManager() {
  const context = useGroupContext();
  
  // Group creation with validation
  const createGroupWithValidation = async (groupData: CreateGroupData) => {
    try {
      // Validate required fields
      if (!groupData.name.trim()) {
        throw new Error('Group name is required');
      }
      
      if (!groupData.sport.trim()) {
        throw new Error('Sport is required');
      }
      
      if (groupData.name.length < 3) {
        throw new Error('Group name must be at least 3 characters');
      }
      
      if (groupData.name.length > 50) {
        throw new Error('Group name must be less than 50 characters');
      }
      
      if (groupData.description && groupData.description.length > 500) {
        throw new Error('Description must be less than 500 characters');
      }
      
      if (groupData.member_limit && (groupData.member_limit < 2 || groupData.member_limit > 1000)) {
        throw new Error('Member limit must be between 2 and 1000');
      }
      
      return await context.createGroup(groupData);
    } catch (error) {
      console.error('Error creating group with validation:', error);
      return null;
    }
  };

  // Update group with validation
  const updateGroupWithValidation = async (groupId: string, updates: UpdateGroupData) => {
    try {
      // Validate updates
      if (updates.name !== undefined) {
        if (!updates.name.trim()) {
          throw new Error('Group name is required');
        }
        if (updates.name.length < 3) {
          throw new Error('Group name must be at least 3 characters');
        }
        if (updates.name.length > 50) {
          throw new Error('Group name must be less than 50 characters');
        }
      }
      
      if (updates.description !== undefined && updates.description && updates.description.length > 500) {
        throw new Error('Description must be less than 500 characters');
      }
      
      if (updates.member_limit !== undefined && (updates.member_limit < 2 || updates.member_limit > 1000)) {
        throw new Error('Member limit must be between 2 and 1000');
      }
      
      return await context.updateGroup(groupId, updates);
    } catch (error) {
      console.error('Error updating group with validation:', error);
      return false;
    }
  };

  // Get groups by sport
  const getGroupsBySport = (sport: string): Group[] => {
    return context.groups.filter(group => group.sport.toLowerCase() === sport.toLowerCase());
  };

  // Get groups by privacy
  const getGroupsByPrivacy = (privacy: 'public' | 'private' | 'invite_only'): Group[] => {
    return context.groups.filter(group => group.privacy === privacy);
  };

  // Get groups by location
  const getGroupsByLocation = (latitude: number, longitude: number, radius: number): Group[] => {
    return context.groups.filter(group => {
      if (!group.location) return false;
      
      const distance = calculateDistance(
        latitude,
        longitude,
        group.location.latitude,
        group.location.longitude
      );
      
      return distance <= radius;
    });
  };

  // Search groups by name or description
  const searchGroupsByText = (query: string): Group[] => {
    const lowercaseQuery = query.toLowerCase();
    return context.groups.filter(group => 
      group.name.toLowerCase().includes(lowercaseQuery) ||
      (group.description && group.description.toLowerCase().includes(lowercaseQuery)) ||
      group.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  // Get groups with available spots
  const getGroupsWithAvailableSpots = (): Group[] => {
    return context.groups.filter(group => 
      !group.member_limit || group.member_count < group.member_limit
    );
  };

  // Get recently created groups
  const getRecentlyCreatedGroups = (days: number = 7): Group[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return context.groups.filter(group => 
      new Date(group.created_at) >= cutoffDate
    );
  };

  // Get most active groups (by member count)
  const getMostActiveGroups = (limit: number = 10): Group[] => {
    return [...context.groups]
      .sort((a, b) => b.member_count - a.member_count)
      .slice(0, limit);
  };

  // Get groups by tags
  const getGroupsByTags = (tags: string[]): Group[] => {
    return context.groups.filter(group => 
      tags.some(tag => group.tags.includes(tag))
    );
  };

  // Get user's role in group
  const getUserRoleInGroup = (groupId: string): Promise<'admin' | 'moderator' | 'member' | null> => {
    return context.getUserRole(groupId, context.currentGroup?.created_by || '');
  };

  // Check if user can perform action
  const canPerformAction = async (groupId: string, action: 'invite' | 'create_events' | 'moderate' | 'edit_group'): Promise<boolean> => {
    try {
      const role = await context.getUserRole(groupId, context.currentGroup?.created_by || '');
      if (!role) return false;
      
      const member = context.groupMembers.find(m => m.role === role);
      if (!member) return false;
      
      switch (action) {
        case 'invite':
          return member.permissions.can_invite;
        case 'create_events':
          return member.permissions.can_create_events;
        case 'moderate':
          return member.permissions.can_moderate;
        case 'edit_group':
          return member.permissions.can_edit_group;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  };

  // Get group statistics
  const getGroupStatistics = () => {
    if (!context.groupAnalytics) return null;
    
    return {
      totalMembers: context.groupAnalytics.total_members,
      activeMembers: context.groupAnalytics.active_members,
      totalEvents: context.groupAnalytics.total_events,
      upcomingEvents: context.groupAnalytics.upcoming_events,
      engagementScore: context.groupAnalytics.engagement_score,
      growthRate: context.groupAnalytics.growth_rate,
      memberRetention: context.groupAnalytics.member_retention,
      eventAttendanceRate: context.groupAnalytics.event_attendance_rate,
    };
  };

  // Get chat statistics
  const getChatStatistics = () => {
    if (!context.chatAnalytics) return null;
    
    return {
      totalMessages: context.chatAnalytics.total_messages,
      messagesToday: context.chatAnalytics.messages_today,
      activeMembers: context.chatAnalytics.active_members,
      mostActiveMembers: context.chatAnalytics.most_active_members,
      popularEmojis: context.chatAnalytics.popular_emojis,
      messageTypes: context.chatAnalytics.message_types,
      activityByHour: context.chatAnalytics.activity_by_hour,
    };
  };

  // Get group member by ID
  const getGroupMemberById = (userId: string): GroupMember | null => {
    return context.groupMembers.find(member => member.user_id === userId) || null;
  };

  // Get group member by role
  const getGroupMembersByRole = (role: 'admin' | 'moderator' | 'member'): GroupMember[] => {
    return context.groupMembers.filter(member => member.role === role);
  };

  // Get recent group members
  const getRecentGroupMembers = (days: number = 7): GroupMember[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return context.groupMembers.filter(member => 
      new Date(member.joined_at) >= cutoffDate
    );
  };

  // Get group invitations for user
  const getUserInvitations = (): GroupInvitation[] => {
    return context.groupInvitations.filter(invitation => 
      invitation.status === 'pending'
    );
  };

  // Get group invitations sent by user
  const getSentInvitations = (): GroupInvitation[] => {
    return context.groupInvitations.filter(invitation => 
      invitation.invited_by === context.currentGroup?.created_by
    );
  };

  // Get group events by status
  const getGroupEventsByStatus = (status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'): GroupEvent[] => {
    return context.groupEvents.filter(event => event.status === status);
  };

  // Get upcoming group events
  const getUpcomingGroupEvents = (days: number = 30): GroupEvent[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return context.groupEvents.filter(event => 
      event.status === 'scheduled' && 
      new Date(event.start_time) <= cutoffDate
    );
  };

  // Get group events by sport
  const getGroupEventsBySport = (sport: string): GroupEvent[] => {
    return context.groupEvents.filter(event => 
      event.sport.toLowerCase() === sport.toLowerCase()
    );
  };

  // Get group events by location
  const getGroupEventsByLocation = (latitude: number, longitude: number, radius: number): GroupEvent[] => {
    return context.groupEvents.filter(event => {
      const distance = calculateDistance(
        latitude,
        longitude,
        event.location.latitude,
        event.location.longitude
      );
      return distance <= radius;
    });
  };

  // Get group messages by type
  const getGroupMessagesByType = (type: 'text' | 'image' | 'video' | 'file' | 'system'): GroupMessage[] => {
    return context.groupMessages.filter(message => message.message_type === type);
  };

  // Get recent group messages
  const getRecentGroupMessages = (hours: number = 24): GroupMessage[] => {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);
    
    return context.groupMessages.filter(message => 
      new Date(message.created_at) >= cutoffDate
    );
  };

  // Get group messages by sender
  const getGroupMessagesBySender = (senderId: string): GroupMessage[] => {
    return context.groupMessages.filter(message => message.sender_id === senderId);
  };

  // Get group messages with media
  const getGroupMessagesWithMedia = (): GroupMessage[] => {
    return context.groupMessages.filter(message => 
      message.message_type === 'image' || 
      message.message_type === 'video' || 
      message.message_type === 'file'
    );
  };

  // Get group messages with reactions
  const getGroupMessagesWithReactions = (): GroupMessage[] => {
    // This would need to be implemented with reaction data
    return context.groupMessages;
  };

  // Get group activity summary
  const getGroupActivitySummary = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentMessages = context.groupMessages.filter(message => 
      new Date(message.created_at) >= weekAgo
    );
    
    const recentMembers = context.groupMembers.filter(member => 
      new Date(member.joined_at) >= weekAgo
    );
    
    const recentEvents = context.groupEvents.filter(event => 
      new Date(event.created_at) >= weekAgo
    );
    
    return {
      messagesThisWeek: recentMessages.length,
      newMembersThisWeek: recentMembers.length,
      eventsThisWeek: recentEvents.length,
      mostActiveMembers: context.chatMembers
        .sort((a, b) => b.last_seen.localeCompare(a.last_seen))
        .slice(0, 5),
    };
  };

  // Get group health score
  const getGroupHealthScore = () => {
    if (!context.groupAnalytics) return 0;
    
    const { engagement_score, growth_rate, member_retention, event_attendance_rate } = context.groupAnalytics;
    
    // Calculate health score based on various metrics
    const healthScore = (
      (engagement_score || 0) * 0.3 +
      (growth_rate || 0) * 0.2 +
      (member_retention || 0) * 0.3 +
      (event_attendance_rate || 0) * 0.2
    );
    
    return Math.min(100, Math.max(0, healthScore));
  };

  // Get group recommendations
  const getGroupRecommendations = (userId: string): Group[] => {
    // This would need more sophisticated recommendation logic
    // For now, return groups with similar sports or tags
    const userGroups = context.groups.filter(group => 
      context.groupMembers.some(member => 
        member.user_id === userId && member.group_id === group.id
      )
    );
    
    const userSports = userGroups.map(group => group.sport);
    const userTags = userGroups.flatMap(group => group.tags);
    
    return context.groups.filter(group => 
      !userGroups.some(userGroup => userGroup.id === group.id) &&
      (userSports.includes(group.sport) || 
       group.tags.some(tag => userTags.includes(tag)))
    );
  };

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  return {
    // Context
    ...context,
    
    // Additional methods
    createGroupWithValidation,
    updateGroupWithValidation,
    getGroupsBySport,
    getGroupsByPrivacy,
    getGroupsByLocation,
    searchGroupsByText,
    getGroupsWithAvailableSpots,
    getRecentlyCreatedGroups,
    getMostActiveGroups,
    getGroupsByTags,
    getUserRoleInGroup,
    canPerformAction,
    getGroupStatistics,
    getChatStatistics,
    getGroupMemberById,
    getGroupMembersByRole,
    getRecentGroupMembers,
    getUserInvitations,
    getSentInvitations,
    getGroupEventsByStatus,
    getUpcomingGroupEvents,
    getGroupEventsBySport,
    getGroupEventsByLocation,
    getGroupMessagesByType,
    getRecentGroupMessages,
    getGroupMessagesBySender,
    getGroupMessagesWithMedia,
    getGroupMessagesWithReactions,
    getGroupActivitySummary,
    getGroupHealthScore,
    getGroupRecommendations,
  };
}
