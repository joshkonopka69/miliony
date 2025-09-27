import { useGroups } from './useGroups';
import { GroupMessage, GroupChatSettings, GroupChatMember, ChatAnalytics, MessageReaction } from '../services/groupChatService';

// Hook for group chat functionality
export function useGroupChat(groupId: string) {
  const {
    groupMessages,
    chatMembers,
    chatSettings,
    chatAnalytics,
    unreadMessageCount,
    isChatLoading,
    isChatUpdating,
    chatError,
    sendMessage,
    getGroupMessages,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    searchMessages,
    markMessagesAsRead,
    getUnreadMessageCount,
    getChatSettings,
    updateChatSettings,
    getChatMembers,
    updateMemberStatus,
    updateNotificationSettings,
    getChatAnalytics,
    clearChatError,
    refreshChat,
  } = useGroups();

  // Send text message
  const sendTextMessage = async (content: string, replyTo?: string): Promise<GroupMessage | null> => {
    if (!content.trim()) return null;
    
    return await sendMessage(groupId, content.trim(), 'text', undefined, undefined, undefined, replyTo);
  };

  // Send image message
  const sendImageMessage = async (imageUrl: string, caption?: string, replyTo?: string): Promise<GroupMessage | null> => {
    if (!imageUrl) return null;
    
    const content = caption || '📷 Image';
    return await sendMessage(groupId, content, 'image', imageUrl, undefined, undefined, replyTo);
  };

  // Send video message
  const sendVideoMessage = async (videoUrl: string, caption?: string, replyTo?: string): Promise<GroupMessage | null> => {
    if (!videoUrl) return null;
    
    const content = caption || '🎥 Video';
    return await sendMessage(groupId, content, 'video', videoUrl, undefined, undefined, replyTo);
  };

  // Send file message
  const sendFileMessage = async (fileUrl: string, fileName: string, fileSize: number, replyTo?: string): Promise<GroupMessage | null> => {
    if (!fileUrl || !fileName) return null;
    
    const content = `📎 ${fileName}`;
    return await sendMessage(groupId, content, 'file', fileUrl, fileName, fileSize, replyTo);
  };

  // Send system message
  const sendSystemMessage = async (content: string): Promise<GroupMessage | null> => {
    return await sendMessage(groupId, content, 'system');
  };

  // Get messages with pagination
  const loadMessages = async (limit: number = 50, before?: string): Promise<GroupMessage[]> => {
    return await getGroupMessages(groupId, limit, 0, before);
  };

  // Load more messages
  const loadMoreMessages = async (limit: number = 50): Promise<GroupMessage[]> => {
    const oldestMessage = groupMessages[groupMessages.length - 1];
    const before = oldestMessage?.created_at;
    return await getGroupMessages(groupId, limit, 0, before);
  };

  // Get message by ID
  const getMessageById = (messageId: string): GroupMessage | null => {
    return groupMessages.find(message => message.id === messageId) || null;
  };

  // Get messages by sender
  const getMessagesBySender = (senderId: string): GroupMessage[] => {
    return groupMessages.filter(message => message.sender_id === senderId);
  };

  // Get messages by type
  const getMessagesByType = (type: 'text' | 'image' | 'video' | 'file' | 'system'): GroupMessage[] => {
    return groupMessages.filter(message => message.message_type === type);
  };

  // Get messages with media
  const getMessagesWithMedia = (): GroupMessage[] => {
    return groupMessages.filter(message => 
      message.message_type === 'image' || 
      message.message_type === 'video' || 
      message.message_type === 'file'
    );
  };

  // Get recent messages
  const getRecentMessages = (hours: number = 24): GroupMessage[] => {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);
    
    return groupMessages.filter(message => 
      new Date(message.created_at) >= cutoffDate
    );
  };

  // Search messages in group
  const searchMessagesInGroup = async (query: string, limit: number = 20): Promise<any[]> => {
    return await searchMessages(groupId, query, limit);
  };

  // Edit message with validation
  const editMessageWithValidation = async (messageId: string, newContent: string): Promise<boolean> => {
    if (!newContent.trim()) {
      throw new Error('Message content cannot be empty');
    }
    
    if (newContent.length > 1000) {
      throw new Error('Message content must be less than 1000 characters');
    }
    
    return await editMessage(messageId, newContent.trim());
  };

  // Delete message with confirmation
  const deleteMessageWithConfirmation = async (messageId: string): Promise<boolean> => {
    // In a real app, you would show a confirmation dialog
    return await deleteMessage(messageId);
  };

  // Add reaction with validation
  const addReactionWithValidation = async (messageId: string, emoji: string): Promise<boolean> => {
    if (!emoji.trim()) {
      throw new Error('Emoji is required');
    }
    
    // Validate emoji (basic check)
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    if (!emojiRegex.test(emoji)) {
      throw new Error('Invalid emoji');
    }
    
    return await addReaction(messageId, emoji);
  };

  // Remove reaction
  const removeReactionFromMessage = async (messageId: string, emoji: string): Promise<boolean> => {
    return await removeReaction(messageId, emoji);
  };

  // Get message reactions
  const getMessageReactions = (messageId: string): MessageReaction[] => {
    // This would need to be implemented with reaction data
    // For now, return empty array
    return [];
  };

  // Get reactions by emoji
  const getReactionsByEmoji = (messageId: string, emoji: string): MessageReaction[] => {
    return getMessageReactions(messageId).filter(reaction => reaction.emoji === emoji);
  };

  // Get reaction count for message
  const getReactionCount = (messageId: string): number => {
    return getMessageReactions(messageId).length;
  };

  // Get reaction count by emoji
  const getReactionCountByEmoji = (messageId: string, emoji: string): number => {
    return getReactionsByEmoji(messageId, emoji).length;
  };

  // Check if user has reacted
  const hasUserReacted = (messageId: string, userId: string, emoji: string): boolean => {
    return getMessageReactions(messageId).some(reaction => 
      reaction.user_id === userId && reaction.emoji === emoji
    );
  };

  // Mark messages as read
  const markAsRead = async (lastReadMessageId: string): Promise<boolean> => {
    return await markMessagesAsRead(groupId, lastReadMessageId);
  };

  // Get unread count
  const getUnreadCount = async (): Promise<number> => {
    return await getUnreadMessageCount(groupId);
  };

  // Get chat member by ID
  const getChatMemberById = (userId: string): GroupChatMember | null => {
    return chatMembers.find(member => member.user_id === userId) || null;
  };

  // Get online members
  const getOnlineMembers = (): GroupChatMember[] => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    return chatMembers.filter(member => 
      new Date(member.last_seen) >= fiveMinutesAgo
    );
  };

  // Get muted members
  const getMutedMembers = (): GroupChatMember[] => {
    return chatMembers.filter(member => member.is_muted);
  };

  // Get typing members
  const getTypingMembers = (): GroupChatMember[] => {
    return chatMembers.filter(member => member.is_typing);
  };

  // Update typing status
  const setTypingStatus = async (isTyping: boolean): Promise<boolean> => {
    return await updateMemberStatus(groupId, { is_typing: isTyping });
  };

  // Update mute status
  const setMuteStatus = async (isMuted: boolean): Promise<boolean> => {
    return await updateMemberStatus(groupId, { is_muted: isMuted });
  };

  // Update last seen
  const updateLastSeen = async (): Promise<boolean> => {
    return await updateMemberStatus(groupId, { last_seen: new Date().toISOString() });
  };

  // Get chat settings
  const loadChatSettings = async (): Promise<GroupChatSettings | null> => {
    return await getChatSettings(groupId);
  };

  // Update chat settings
  const updateChatSettingsWithValidation = async (settings: Partial<GroupChatSettings>): Promise<boolean> => {
    // Validate settings
    if (settings.auto_delete_days !== undefined && settings.auto_delete_days < 1) {
      throw new Error('Auto delete days must be at least 1');
    }
    
    if (settings.auto_delete_days !== undefined && settings.auto_delete_days > 365) {
      throw new Error('Auto delete days must be less than 365');
    }
    
    return await updateChatSettings(groupId, settings);
  };

  // Get chat members
  const loadChatMembers = async (): Promise<GroupChatMember[]> => {
    return await getChatMembers(groupId);
  };

  // Update notification settings
  const updateNotificationSettingsWithValidation = async (settings: {
    mentions?: boolean;
    all_messages?: boolean;
    quiet_hours?: boolean;
    quiet_start?: string;
    quiet_end?: string;
  }): Promise<boolean> => {
    // Validate quiet hours
    if (settings.quiet_hours && settings.quiet_start && settings.quiet_end) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(settings.quiet_start) || !timeRegex.test(settings.quiet_end)) {
        throw new Error('Invalid time format. Use HH:MM format');
      }
    }
    
    return await updateNotificationSettings(groupId, settings);
  };

  // Get chat analytics
  const loadChatAnalytics = async (): Promise<ChatAnalytics | null> => {
    return await getChatAnalytics(groupId);
  };

  // Get chat statistics
  const getChatStats = () => {
    if (!chatAnalytics) return null;
    
    return {
      totalMessages: chatAnalytics.total_messages,
      messagesToday: chatAnalytics.messages_today,
      activeMembers: chatAnalytics.active_members,
      mostActiveMembers: chatAnalytics.most_active_members,
      popularEmojis: chatAnalytics.popular_emojis,
      messageTypes: chatAnalytics.message_types,
      activityByHour: chatAnalytics.activity_by_hour,
    };
  };

  // Get message statistics
  const getMessageStats = () => {
    const totalMessages = groupMessages.length;
    const textMessages = getMessagesByType('text').length;
    const imageMessages = getMessagesByType('image').length;
    const videoMessages = getMessagesByType('video').length;
    const fileMessages = getMessagesByType('file').length;
    const systemMessages = getMessagesByType('system').length;
    
    return {
      total: totalMessages,
      text: textMessages,
      images: imageMessages,
      videos: videoMessages,
      files: fileMessages,
      system: systemMessages,
    };
  };

  // Get member statistics
  const getMemberStats = () => {
    const totalMembers = chatMembers.length;
    const onlineMembers = getOnlineMembers().length;
    const mutedMembers = getMutedMembers().length;
    const typingMembers = getTypingMembers().length;
    
    return {
      total: totalMembers,
      online: onlineMembers,
      muted: mutedMembers,
      typing: typingMembers,
    };
  };

  // Get activity summary
  const getActivitySummary = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentMessages = groupMessages.filter(message => 
      new Date(message.created_at) >= weekAgo
    );
    
    const messagesByDay = recentMessages.reduce((acc, message) => {
      const day = new Date(message.created_at).toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    return {
      messagesThisWeek: recentMessages.length,
      messagesByDay,
      mostActiveMembers: chatMembers
        .sort((a, b) => b.last_seen.localeCompare(a.last_seen))
        .slice(0, 5),
    };
  };

  // Get chat health score
  const getChatHealthScore = () => {
    if (!chatAnalytics) return 0;
    
    const { total_messages, active_members, messages_today } = chatAnalytics;
    
    // Calculate health score based on activity
    const messageActivity = Math.min(100, (messages_today / 10) * 100);
    const memberActivity = Math.min(100, (active_members / chatMembers.length) * 100);
    const overallActivity = (messageActivity + memberActivity) / 2;
    
    return Math.min(100, Math.max(0, overallActivity));
  };

  // Refresh chat data
  const refreshChatData = async (): Promise<void> => {
    await refreshChat(groupId);
  };

  // Clear chat error
  const clearError = (): void => {
    clearChatError();
  };

  return {
    // State
    groupMessages,
    chatMembers,
    chatSettings,
    chatAnalytics,
    unreadMessageCount,
    isChatLoading,
    isChatUpdating,
    chatError,
    
    // Message Actions
    sendTextMessage,
    sendImageMessage,
    sendVideoMessage,
    sendFileMessage,
    sendSystemMessage,
    loadMessages,
    loadMoreMessages,
    getMessageById,
    getMessagesBySender,
    getMessagesByType,
    getMessagesWithMedia,
    getRecentMessages,
    searchMessagesInGroup,
    editMessageWithValidation,
    deleteMessageWithConfirmation,
    
    // Reaction Actions
    addReactionWithValidation,
    removeReactionFromMessage,
    getMessageReactions,
    getReactionsByEmoji,
    getReactionCount,
    getReactionCountByEmoji,
    hasUserReacted,
    
    // Read Status Actions
    markAsRead,
    getUnreadCount,
    
    // Member Actions
    getChatMemberById,
    getOnlineMembers,
    getMutedMembers,
    getTypingMembers,
    setTypingStatus,
    setMuteStatus,
    updateLastSeen,
    
    // Settings Actions
    loadChatSettings,
    updateChatSettingsWithValidation,
    loadChatMembers,
    updateNotificationSettingsWithValidation,
    loadChatAnalytics,
    
    // Statistics
    getChatStats,
    getMessageStats,
    getMemberStats,
    getActivitySummary,
    getChatHealthScore,
    
    // Utility Actions
    refreshChatData,
    clearError,
  };
}
