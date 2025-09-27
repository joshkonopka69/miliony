import { supabase } from './supabase';

// Group chat types and interfaces
export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'video' | 'file' | 'system';
  content: string;
  media_url?: string;
  file_name?: string;
  file_size?: number;
  reply_to?: string;
  edited_at?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  sender?: {
    id: string;
    display_name: string;
    avatar_url?: string;
    role: 'admin' | 'moderator' | 'member';
  };
  reply_to_message?: GroupMessage;
}

export interface GroupChatSettings {
  id: string;
  group_id: string;
  enabled: boolean;
  allow_media: boolean;
  allow_links: boolean;
  allow_mentions: boolean;
  moderation_enabled: boolean;
  auto_delete_messages: boolean;
  auto_delete_days?: number;
  mute_keywords: string[];
  created_at: string;
  updated_at: string;
}

export interface GroupChatMember {
  id: string;
  group_id: string;
  user_id: string;
  is_muted: boolean;
  is_typing: boolean;
  last_seen: string;
  notification_settings: {
    mentions: boolean;
    all_messages: boolean;
    quiet_hours: boolean;
    quiet_start?: string;
    quiet_end?: string;
  };
  user?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface TypingIndicator {
  user_id: string;
  display_name: string;
  timestamp: number;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface ChatSearchResult {
  message: GroupMessage;
  context: string;
  relevance_score: number;
}

export interface ChatAnalytics {
  group_id: string;
  total_messages: number;
  messages_today: number;
  active_members: number;
  most_active_members: {
    user_id: string;
    display_name: string;
    message_count: number;
  }[];
  popular_emojis: {
    emoji: string;
    count: number;
  }[];
  message_types: {
    type: string;
    count: number;
  }[];
  activity_by_hour: { hour: number; count: number }[];
}

class GroupChatService {
  // Send message to group
  async sendMessage(
    groupId: string,
    senderId: string,
    content: string,
    messageType: 'text' | 'image' | 'video' | 'file' = 'text',
    mediaUrl?: string,
    fileName?: string,
    fileSize?: number,
    replyTo?: string
  ): Promise<GroupMessage | null> {
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          sender_id: senderId,
          message_type: messageType,
          content,
          media_url: mediaUrl,
          file_name: fileName,
          file_size: fileSize,
          reply_to: replyTo,
          is_deleted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(`
          *,
          sender:users!group_messages_sender_id_fkey (
            id,
            display_name,
            avatar_url
          ),
          reply_to_message:group_messages!group_messages_reply_to_fkey (
            id,
            content,
            sender:users!group_messages_sender_id_fkey (
              id,
              display_name
            )
          )
        `)
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  // Get group messages
  async getGroupMessages(
    groupId: string,
    limit: number = 50,
    offset: number = 0,
    before?: string
  ): Promise<GroupMessage[]> {
    try {
      let query = supabase
        .from('group_messages')
        .select(`
          *,
          sender:users!group_messages_sender_id_fkey (
            id,
            display_name,
            avatar_url
          ),
          reply_to_message:group_messages!group_messages_reply_to_fkey (
            id,
            content,
            sender:users!group_messages_sender_id_fkey (
              id,
              display_name
            )
          )
        `)
        .eq('group_id', groupId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (before) {
        query = query.lt('created_at', before);
      }

      const { data, error } = await query
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching group messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching group messages:', error);
      return [];
    }
  }

  // Get message by ID
  async getMessage(messageId: string): Promise<GroupMessage | null> {
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select(`
          *,
          sender:users!group_messages_sender_id_fkey (
            id,
            display_name,
            avatar_url
          ),
          reply_to_message:group_messages!group_messages_reply_to_fkey (
            id,
            content,
            sender:users!group_messages_sender_id_fkey (
              id,
              display_name
            )
          )
        `)
        .eq('id', messageId)
        .single();

      if (error) {
        console.error('Error fetching message:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching message:', error);
      return null;
    }
  }

  // Edit message
  async editMessage(messageId: string, newContent: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_messages')
        .update({
          content: newContent,
          edited_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error editing message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error editing message:', error);
      return false;
    }
  }

  // Delete message
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_messages')
        .update({
          is_deleted: true,
          content: '[Message deleted]',
          updated_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  // Add reaction to message
  async addReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: userId,
          emoji,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error adding reaction:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error adding reaction:', error);
      return false;
    }
  }

  // Remove reaction from message
  async removeReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('emoji', emoji);

      if (error) {
        console.error('Error removing reaction:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing reaction:', error);
      return false;
    }
  }

  // Get message reactions
  async getMessageReactions(messageId: string): Promise<MessageReaction[]> {
    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .select(`
          *,
          user:users!message_reactions_user_id_fkey (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching message reactions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching message reactions:', error);
      return [];
    }
  }

  // Search messages in group
  async searchMessages(
    groupId: string,
    query: string,
    limit: number = 20
  ): Promise<ChatSearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select(`
          *,
          sender:users!group_messages_sender_id_fkey (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .eq('is_deleted', false)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error searching messages:', error);
        return [];
      }

      return (data || []).map(message => ({
        message,
        context: message.content,
        relevance_score: 1, // Would need more sophisticated scoring
      }));
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  // Get chat settings
  async getChatSettings(groupId: string): Promise<GroupChatSettings | null> {
    try {
      const { data, error } = await supabase
        .from('group_chat_settings')
        .select('*')
        .eq('group_id', groupId)
        .single();

      if (error) {
        console.error('Error fetching chat settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching chat settings:', error);
      return null;
    }
  }

  // Update chat settings
  async updateChatSettings(groupId: string, settings: Partial<GroupChatSettings>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_chat_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('group_id', groupId);

      if (error) {
        console.error('Error updating chat settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating chat settings:', error);
      return false;
    }
  }

  // Get chat members
  async getChatMembers(groupId: string): Promise<GroupChatMember[]> {
    try {
      const { data, error } = await supabase
        .from('group_chat_members')
        .select(`
          *,
          user:users!group_chat_members_user_id_fkey (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .order('last_seen', { ascending: false });

      if (error) {
        console.error('Error fetching chat members:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching chat members:', error);
      return [];
    }
  }

  // Update member status
  async updateMemberStatus(
    groupId: string,
    userId: string,
    status: { is_muted?: boolean; is_typing?: boolean; last_seen?: string }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_chat_members')
        .update({
          ...status,
          updated_at: new Date().toISOString(),
        })
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating member status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating member status:', error);
      return false;
    }
  }

  // Update notification settings
  async updateNotificationSettings(
    groupId: string,
    userId: string,
    settings: {
      mentions?: boolean;
      all_messages?: boolean;
      quiet_hours?: boolean;
      quiet_start?: string;
      quiet_end?: string;
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_chat_members')
        .update({
          notification_settings: settings,
          updated_at: new Date().toISOString(),
        })
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating notification settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }

  // Get chat analytics
  async getChatAnalytics(groupId: string): Promise<ChatAnalytics | null> {
    try {
      // Get total messages
      const { data: totalMessages } = await supabase
        .from('group_messages')
        .select('id')
        .eq('group_id', groupId)
        .eq('is_deleted', false);

      // Get messages today
      const today = new Date().toISOString().split('T')[0];
      const { data: messagesToday } = await supabase
        .from('group_messages')
        .select('id')
        .eq('group_id', groupId)
        .eq('is_deleted', false)
        .gte('created_at', today);

      // Get active members
      const { data: activeMembers } = await supabase
        .from('group_chat_members')
        .select('user_id')
        .eq('group_id', groupId);

      return {
        group_id: groupId,
        total_messages: totalMessages?.length || 0,
        messages_today: messagesToday?.length || 0,
        active_members: activeMembers?.length || 0,
        most_active_members: [], // Would need complex query
        popular_emojis: [], // Would need to analyze reactions
        message_types: [], // Would need to group by message_type
        activity_by_hour: [], // Would need time-based analysis
      };
    } catch (error) {
      console.error('Error fetching chat analytics:', error);
      return null;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(groupId: string, userId: string, lastReadMessageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_chat_members')
        .update({
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error marking messages as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  // Get unread message count
  async getUnreadMessageCount(groupId: string, userId: string): Promise<number> {
    try {
      // Get user's last seen timestamp
      const { data: member } = await supabase
        .from('group_chat_members')
        .select('last_seen')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (!member?.last_seen) {
        return 0;
      }

      // Count messages after last seen
      const { data: unreadMessages } = await supabase
        .from('group_messages')
        .select('id')
        .eq('group_id', groupId)
        .eq('is_deleted', false)
        .gt('created_at', member.last_seen)
        .neq('sender_id', userId);

      return unreadMessages?.length || 0;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      return 0;
    }
  }

  // Upload media file
  async uploadMedia(
    groupId: string,
    file: File,
    fileType: 'image' | 'video' | 'file'
  ): Promise<string | null> {
    try {
      // This would integrate with Supabase Storage
      // For now, return a placeholder URL
      const fileName = `${groupId}/${Date.now()}-${file.name}`;
      
      // In a real implementation, you would:
      // 1. Upload to Supabase Storage
      // 2. Get the public URL
      // 3. Return the URL
      
      return `https://storage.supabase.co/group-media/${fileName}`;
    } catch (error) {
      console.error('Error uploading media:', error);
      return null;
    }
  }

  // Delete old messages (cleanup)
  async deleteOldMessages(groupId: string, daysOld: number): Promise<boolean> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await supabase
        .from('group_messages')
        .delete()
        .eq('group_id', groupId)
        .lt('created_at', cutoffDate.toISOString());

      if (error) {
        console.error('Error deleting old messages:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting old messages:', error);
      return false;
    }
  }
}

// Create and export singleton instance
export const groupChatService = new GroupChatService();
export default groupChatService;
