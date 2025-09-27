import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  groupService, 
  Group, 
  GroupMember, 
  GroupEvent, 
  GroupSettings, 
  GroupInvitation, 
  GroupAnalytics,
  CreateGroupData,
  UpdateGroupData,
  GroupFilters
} from '../services/groupService';
import { 
  groupChatService, 
  GroupMessage, 
  GroupChatSettings, 
  GroupChatMember,
  ChatAnalytics
} from '../services/groupChatService';
import { useAuth } from './AuthContext';

interface GroupContextType {
  // State
  groups: Group[];
  currentGroup: Group | null;
  groupMembers: GroupMember[];
  groupEvents: GroupEvent[];
  groupSettings: GroupSettings | null;
  groupInvitations: GroupInvitation[];
  groupAnalytics: GroupAnalytics | null;
  
  // Chat State
  groupMessages: GroupMessage[];
  chatMembers: GroupChatMember[];
  chatSettings: GroupChatSettings | null;
  chatAnalytics: ChatAnalytics | null;
  unreadMessageCount: number;
  
  // Loading States
  isLoading: boolean;
  isUpdating: boolean;
  isChatLoading: boolean;
  isChatUpdating: boolean;
  
  // Error States
  error: string | null;
  chatError: string | null;
  
  // Group Actions
  createGroup: (groupData: CreateGroupData) => Promise<Group | null>;
  updateGroup: (groupId: string, updates: UpdateGroupData) => Promise<boolean>;
  deleteGroup: (groupId: string) => Promise<boolean>;
  searchGroups: (filters: GroupFilters, limit?: number, offset?: number) => Promise<Group[]>;
  getUserGroups: () => Promise<Group[]>;
  getGroup: (groupId: string) => Promise<Group | null>;
  setCurrentGroup: (group: Group | null) => void;
  
  // Member Actions
  getGroupMembers: (groupId: string) => Promise<GroupMember[]>;
  addMember: (groupId: string, userId: string, invitedBy?: string) => Promise<boolean>;
  removeMember: (groupId: string, userId: string) => Promise<boolean>;
  updateMemberRole: (groupId: string, userId: string, role: 'admin' | 'moderator' | 'member') => Promise<boolean>;
  isMember: (groupId: string, userId: string) => Promise<boolean>;
  getUserRole: (groupId: string, userId: string) => Promise<'admin' | 'moderator' | 'member' | null>;
  
  // Invitation Actions
  sendInvitation: (groupId: string, invitedUserId: string, invitedBy: string, message?: string) => Promise<GroupInvitation | null>;
  acceptInvitation: (invitationId: string) => Promise<boolean>;
  declineInvitation: (invitationId: string) => Promise<boolean>;
  getGroupInvitations: (groupId: string) => Promise<GroupInvitation[]>;
  
  // Settings Actions
  getGroupSettings: (groupId: string) => Promise<GroupSettings | null>;
  updateGroupSettings: (groupId: string, settings: Partial<GroupSettings>) => Promise<boolean>;
  
  // Analytics Actions
  getGroupAnalytics: (groupId: string) => Promise<GroupAnalytics | null>;
  
  // Chat Actions
  sendMessage: (groupId: string, content: string, messageType?: 'text' | 'image' | 'video' | 'file', mediaUrl?: string, fileName?: string, fileSize?: number, replyTo?: string) => Promise<GroupMessage | null>;
  getGroupMessages: (groupId: string, limit?: number, offset?: number, before?: string) => Promise<GroupMessage[]>;
  editMessage: (messageId: string, newContent: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  addReaction: (messageId: string, emoji: string) => Promise<boolean>;
  removeReaction: (messageId: string, emoji: string) => Promise<boolean>;
  searchMessages: (groupId: string, query: string, limit?: number) => Promise<any[]>;
  markMessagesAsRead: (groupId: string, lastReadMessageId: string) => Promise<boolean>;
  getUnreadMessageCount: (groupId: string) => Promise<number>;
  
  // Chat Settings Actions
  getChatSettings: (groupId: string) => Promise<GroupChatSettings | null>;
  updateChatSettings: (groupId: string, settings: Partial<GroupChatSettings>) => Promise<boolean>;
  getChatMembers: (groupId: string) => Promise<GroupChatMember[]>;
  updateMemberStatus: (groupId: string, status: { is_muted?: boolean; is_typing?: boolean; last_seen?: string }) => Promise<boolean>;
  updateNotificationSettings: (groupId: string, settings: any) => Promise<boolean>;
  getChatAnalytics: (groupId: string) => Promise<ChatAnalytics | null>;
  
  // Utility Actions
  clearError: () => void;
  clearChatError: () => void;
  refreshGroup: (groupId: string) => Promise<void>;
  refreshChat: (groupId: string) => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

interface GroupProviderProps {
  children: ReactNode;
}

export function GroupProvider({ children }: GroupProviderProps) {
  const { user } = useAuth();
  
  // State
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [groupEvents, setGroupEvents] = useState<GroupEvent[]>([]);
  const [groupSettings, setGroupSettings] = useState<GroupSettings | null>(null);
  const [groupInvitations, setGroupInvitations] = useState<GroupInvitation[]>([]);
  const [groupAnalytics, setGroupAnalytics] = useState<GroupAnalytics | null>(null);
  
  // Chat State
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [chatMembers, setChatMembers] = useState<GroupChatMember[]>([]);
  const [chatSettings, setChatSettings] = useState<GroupChatSettings | null>(null);
  const [chatAnalytics, setChatAnalytics] = useState<ChatAnalytics | null>(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  
  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatUpdating, setIsChatUpdating] = useState(false);
  
  // Error States
  const [error, setError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  // Load user's groups when user changes
  useEffect(() => {
    if (user) {
      loadUserGroups();
    } else {
      // Clear data when user logs out
      setGroups([]);
      setCurrentGroup(null);
      setGroupMembers([]);
      setGroupEvents([]);
      setGroupSettings(null);
      setGroupInvitations([]);
      setGroupAnalytics(null);
      setGroupMessages([]);
      setChatMembers([]);
      setChatSettings(null);
      setChatAnalytics(null);
      setUnreadMessageCount(0);
    }
  }, [user]);

  // Load user's groups
  const loadUserGroups = async (): Promise<void> => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const userGroups = await groupService.getUserGroups();
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading user groups:', error);
      setError('Failed to load groups');
    } finally {
      setIsLoading(false);
    }
  };

  // Group Actions
  const createGroup = async (groupData: CreateGroupData): Promise<Group | null> => {
    if (!user) return null;

    try {
      setIsUpdating(true);
      setError(null);

      const group = await groupService.createGroup(groupData, user.id);
      if (group) {
        setGroups(prev => [group, ...prev]);
        setCurrentGroup(group);
      }

      return group;
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group');
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateGroup = async (groupId: string, updates: UpdateGroupData): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);

      const updatedGroup = await groupService.updateGroup(groupId, updates);
      if (updatedGroup) {
        setGroups(prev => prev.map(g => g.id === groupId ? updatedGroup : g));
        if (currentGroup?.id === groupId) {
          setCurrentGroup(updatedGroup);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating group:', error);
      setError('Failed to update group');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteGroup = async (groupId: string): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);

      const success = await groupService.deleteGroup(groupId);
      if (success) {
        setGroups(prev => prev.filter(g => g.id !== groupId));
        if (currentGroup?.id === groupId) {
          setCurrentGroup(null);
        }
      }

      return success;
    } catch (error) {
      console.error('Error deleting group:', error);
      setError('Failed to delete group');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const searchGroups = async (filters: GroupFilters, limit: number = 20, offset: number = 0): Promise<Group[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const results = await groupService.searchGroups(filters, limit, offset);
      return results;
    } catch (error) {
      console.error('Error searching groups:', error);
      setError('Failed to search groups');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getUserGroups = async (): Promise<Group[]> => {
    if (!user) return [];

    try {
      setIsLoading(true);
      setError(null);

      const userGroups = await groupService.getUserGroups();
      setGroups(userGroups);
      return userGroups;
    } catch (error) {
      console.error('Error fetching user groups:', error);
      setError('Failed to load groups');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getGroup = async (groupId: string): Promise<Group | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const group = await groupService.getGroup(groupId);
      if (group) {
        setCurrentGroup(group);
      }

      return group;
    } catch (error) {
      console.error('Error fetching group:', error);
      setError('Failed to load group');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Member Actions
  const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const members = await groupService.getGroupMembers(groupId);
      setGroupMembers(members);
      return members;
    } catch (error) {
      console.error('Error fetching group members:', error);
      setError('Failed to load group members');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const addMember = async (groupId: string, userId: string, invitedBy?: string): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);

      const success = await groupService.addMember(groupId, userId, invitedBy);
      if (success) {
        // Refresh group members
        await getGroupMembers(groupId);
        // Refresh current group to update member count
        if (currentGroup?.id === groupId) {
          await getGroup(groupId);
        }
      }

      return success;
    } catch (error) {
      console.error('Error adding member:', error);
      setError('Failed to add member');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const removeMember = async (groupId: string, userId: string): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);

      const success = await groupService.removeMember(groupId, userId);
      if (success) {
        // Refresh group members
        await getGroupMembers(groupId);
        // Refresh current group to update member count
        if (currentGroup?.id === groupId) {
          await getGroup(groupId);
        }
      }

      return success;
    } catch (error) {
      console.error('Error removing member:', error);
      setError('Failed to remove member');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateMemberRole = async (groupId: string, userId: string, role: 'admin' | 'moderator' | 'member'): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);

      const success = await groupService.updateMemberRole(groupId, userId, role);
      if (success) {
        // Refresh group members
        await getGroupMembers(groupId);
      }

      return success;
    } catch (error) {
      console.error('Error updating member role:', error);
      setError('Failed to update member role');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const isMember = async (groupId: string, userId: string): Promise<boolean> => {
    try {
      return await groupService.isMember(groupId, userId);
    } catch (error) {
      console.error('Error checking membership:', error);
      return false;
    }
  };

  const getUserRole = async (groupId: string, userId: string): Promise<'admin' | 'moderator' | 'member' | null> => {
    try {
      return await groupService.getUserRole(groupId, userId);
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  };

  // Invitation Actions
  const sendInvitation = async (groupId: string, invitedUserId: string, invitedBy: string, message?: string): Promise<GroupInvitation | null> => {
    try {
      setIsUpdating(true);
      setError(null);

      const invitation = await groupService.sendInvitation(groupId, invitedUserId, invitedBy, message);
      return invitation;
    } catch (error) {
      console.error('Error sending invitation:', error);
      setError('Failed to send invitation');
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  const acceptInvitation = async (invitationId: string): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);

      const success = await groupService.acceptInvitation(invitationId);
      if (success) {
        // Refresh user's groups
        await loadUserGroups();
      }

      return success;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('Failed to accept invitation');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const declineInvitation = async (invitationId: string): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);

      const success = await groupService.declineInvitation(invitationId);
      return success;
    } catch (error) {
      console.error('Error declining invitation:', error);
      setError('Failed to decline invitation');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const getGroupInvitations = async (groupId: string): Promise<GroupInvitation[]> => {
    try {
      // This would need to be implemented in the service
      return [];
    } catch (error) {
      console.error('Error fetching group invitations:', error);
      return [];
    }
  };

  // Settings Actions
  const getGroupSettings = async (groupId: string): Promise<GroupSettings | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const settings = await groupService.getGroupSettings(groupId);
      setGroupSettings(settings);
      return settings;
    } catch (error) {
      console.error('Error fetching group settings:', error);
      setError('Failed to load group settings');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateGroupSettings = async (groupId: string, settings: Partial<GroupSettings>): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);

      const success = await groupService.updateGroupSettings(groupId, settings);
      if (success) {
        // Refresh settings
        await getGroupSettings(groupId);
      }

      return success;
    } catch (error) {
      console.error('Error updating group settings:', error);
      setError('Failed to update group settings');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Analytics Actions
  const getGroupAnalytics = async (groupId: string): Promise<GroupAnalytics | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const analytics = await groupService.getGroupAnalytics(groupId);
      setGroupAnalytics(analytics);
      return analytics;
    } catch (error) {
      console.error('Error fetching group analytics:', error);
      setError('Failed to load group analytics');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Chat Actions
  const sendMessage = async (
    groupId: string, 
    content: string, 
    messageType: 'text' | 'image' | 'video' | 'file' = 'text',
    mediaUrl?: string,
    fileName?: string,
    fileSize?: number,
    replyTo?: string
  ): Promise<GroupMessage | null> => {
    if (!user) return null;

    try {
      setIsChatUpdating(true);
      setChatError(null);

      const message = await groupChatService.sendMessage(
        groupId, 
        user.id, 
        content, 
        messageType, 
        mediaUrl, 
        fileName, 
        fileSize, 
        replyTo
      );

      if (message) {
        setGroupMessages(prev => [message, ...prev]);
      }

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      setChatError('Failed to send message');
      return null;
    } finally {
      setIsChatUpdating(false);
    }
  };

  const getGroupMessages = async (groupId: string, limit: number = 50, offset: number = 0, before?: string): Promise<GroupMessage[]> => {
    try {
      setIsChatLoading(true);
      setChatError(null);

      const messages = await groupChatService.getGroupMessages(groupId, limit, offset, before);
      setGroupMessages(messages);
      return messages;
    } catch (error) {
      console.error('Error fetching group messages:', error);
      setChatError('Failed to load messages');
      return [];
    } finally {
      setIsChatLoading(false);
    }
  };

  const editMessage = async (messageId: string, newContent: string): Promise<boolean> => {
    try {
      setIsChatUpdating(true);
      setChatError(null);

      const success = await groupChatService.editMessage(messageId, newContent);
      if (success) {
        setGroupMessages(prev => 
          prev.map(m => m.id === messageId ? { ...m, content: newContent, edited_at: new Date().toISOString() } : m)
        );
      }

      return success;
    } catch (error) {
      console.error('Error editing message:', error);
      setChatError('Failed to edit message');
      return false;
    } finally {
      setIsChatUpdating(false);
    }
  };

  const deleteMessage = async (messageId: string): Promise<boolean> => {
    try {
      setIsChatUpdating(true);
      setChatError(null);

      const success = await groupChatService.deleteMessage(messageId);
      if (success) {
        setGroupMessages(prev => 
          prev.map(m => m.id === messageId ? { ...m, is_deleted: true, content: '[Message deleted]' } : m)
        );
      }

      return success;
    } catch (error) {
      console.error('Error deleting message:', error);
      setChatError('Failed to delete message');
      return false;
    } finally {
      setIsChatUpdating(false);
    }
  };

  const addReaction = async (messageId: string, emoji: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsChatUpdating(true);
      setChatError(null);

      const success = await groupChatService.addReaction(messageId, user.id, emoji);
      return success;
    } catch (error) {
      console.error('Error adding reaction:', error);
      setChatError('Failed to add reaction');
      return false;
    } finally {
      setIsChatUpdating(false);
    }
  };

  const removeReaction = async (messageId: string, emoji: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsChatUpdating(true);
      setChatError(null);

      const success = await groupChatService.removeReaction(messageId, user.id, emoji);
      return success;
    } catch (error) {
      console.error('Error removing reaction:', error);
      setChatError('Failed to remove reaction');
      return false;
    } finally {
      setIsChatUpdating(false);
    }
  };

  const searchMessages = async (groupId: string, query: string, limit: number = 20): Promise<any[]> => {
    try {
      setIsChatLoading(true);
      setChatError(null);

      const results = await groupChatService.searchMessages(groupId, query, limit);
      return results;
    } catch (error) {
      console.error('Error searching messages:', error);
      setChatError('Failed to search messages');
      return [];
    } finally {
      setIsChatLoading(false);
    }
  };

  const markMessagesAsRead = async (groupId: string, lastReadMessageId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await groupChatService.markMessagesAsRead(groupId, user.id, lastReadMessageId);
      if (success) {
        // Update unread count
        const count = await getUnreadMessageCount(groupId);
        setUnreadMessageCount(count);
      }

      return success;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  };

  const getUnreadMessageCount = async (groupId: string): Promise<number> => {
    if (!user) return 0;

    try {
      const count = await groupChatService.getUnreadMessageCount(groupId, user.id);
      setUnreadMessageCount(count);
      return count;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
  };

  // Chat Settings Actions
  const getChatSettings = async (groupId: string): Promise<GroupChatSettings | null> => {
    try {
      setIsChatLoading(true);
      setChatError(null);

      const settings = await groupChatService.getChatSettings(groupId);
      setChatSettings(settings);
      return settings;
    } catch (error) {
      console.error('Error fetching chat settings:', error);
      setChatError('Failed to load chat settings');
      return null;
    } finally {
      setIsChatLoading(false);
    }
  };

  const updateChatSettings = async (groupId: string, settings: Partial<GroupChatSettings>): Promise<boolean> => {
    try {
      setIsChatUpdating(true);
      setChatError(null);

      const success = await groupChatService.updateChatSettings(groupId, settings);
      if (success) {
        // Refresh settings
        await getChatSettings(groupId);
      }

      return success;
    } catch (error) {
      console.error('Error updating chat settings:', error);
      setChatError('Failed to update chat settings');
      return false;
    } finally {
      setIsChatUpdating(false);
    }
  };

  const getChatMembers = async (groupId: string): Promise<GroupChatMember[]> => {
    try {
      setIsChatLoading(true);
      setChatError(null);

      const members = await groupChatService.getChatMembers(groupId);
      setChatMembers(members);
      return members;
    } catch (error) {
      console.error('Error fetching chat members:', error);
      setChatError('Failed to load chat members');
      return [];
    } finally {
      setIsChatLoading(false);
    }
  };

  const updateMemberStatus = async (groupId: string, status: { is_muted?: boolean; is_typing?: boolean; last_seen?: string }): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await groupChatService.updateMemberStatus(groupId, user.id, status);
      return success;
    } catch (error) {
      console.error('Error updating member status:', error);
      return false;
    }
  };

  const updateNotificationSettings = async (groupId: string, settings: any): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await groupChatService.updateNotificationSettings(groupId, user.id, settings);
      return success;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  };

  const getChatAnalytics = async (groupId: string): Promise<ChatAnalytics | null> => {
    try {
      setIsChatLoading(true);
      setChatError(null);

      const analytics = await groupChatService.getChatAnalytics(groupId);
      setChatAnalytics(analytics);
      return analytics;
    } catch (error) {
      console.error('Error fetching chat analytics:', error);
      setChatError('Failed to load chat analytics');
      return null;
    } finally {
      setIsChatLoading(false);
    }
  };

  // Utility Actions
  const clearError = (): void => {
    setError(null);
  };

  const clearChatError = (): void => {
    setChatError(null);
  };

  const refreshGroup = async (groupId: string): Promise<void> => {
    await Promise.all([
      getGroup(groupId),
      getGroupMembers(groupId),
      getGroupSettings(groupId),
      getGroupAnalytics(groupId),
    ]);
  };

  const refreshChat = async (groupId: string): Promise<void> => {
    await Promise.all([
      getGroupMessages(groupId),
      getChatMembers(groupId),
      getChatSettings(groupId),
      getChatAnalytics(groupId),
      getUnreadMessageCount(groupId),
    ]);
  };

  const contextValue: GroupContextType = {
    // State
    groups,
    currentGroup,
    groupMembers,
    groupEvents,
    groupSettings,
    groupInvitations,
    groupAnalytics,
    groupMessages,
    chatMembers,
    chatSettings,
    chatAnalytics,
    unreadMessageCount,
    
    // Loading States
    isLoading,
    isUpdating,
    isChatLoading,
    isChatUpdating,
    
    // Error States
    error,
    chatError,
    
    // Group Actions
    createGroup,
    updateGroup,
    deleteGroup,
    searchGroups,
    getUserGroups,
    getGroup,
    setCurrentGroup,
    
    // Member Actions
    getGroupMembers,
    addMember,
    removeMember,
    updateMemberRole,
    isMember,
    getUserRole,
    
    // Invitation Actions
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    getGroupInvitations,
    
    // Settings Actions
    getGroupSettings,
    updateGroupSettings,
    
    // Analytics Actions
    getGroupAnalytics,
    
    // Chat Actions
    sendMessage,
    getGroupMessages,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    searchMessages,
    markMessagesAsRead,
    getUnreadMessageCount,
    
    // Chat Settings Actions
    getChatSettings,
    updateChatSettings,
    getChatMembers,
    updateMemberStatus,
    updateNotificationSettings,
    getChatAnalytics,
    
    // Utility Actions
    clearError,
    clearChatError,
    refreshGroup,
    refreshChat,
  };

  return (
    <GroupContext.Provider value={contextValue}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups(): GroupContextType {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
}
