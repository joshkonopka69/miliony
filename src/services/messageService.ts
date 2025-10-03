import { supabase } from './supabase';

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  message_type: 'text' | 'image' | 'system' | 'event_invite';
  event_id?: string;
  group_id?: string;
  created_at: string;
  updated_at: string;
  read_by: string[];
  metadata?: any;
}

export interface CreateMessageData {
  content: string;
  message_type: 'text' | 'image' | 'system' | 'event_invite';
  event_id?: string;
  group_id?: string;
  metadata?: any;
}

export class MessageService {
  // Send a message
  static async sendMessage(
    senderId: string,
    senderName: string,
    senderAvatar: string | undefined,
    messageData: CreateMessageData
  ): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          sender_name: senderName,
          sender_avatar: senderAvatar,
          content: messageData.content,
          message_type: messageData.message_type,
          event_id: messageData.event_id,
          group_id: messageData.group_id,
          read_by: [senderId],
          metadata: messageData.metadata,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return null;
    }
  }

  // Get messages for an event
  static async getEventMessages(eventId: string, limit: number = 50): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching event messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEventMessages:', error);
      return [];
    }
  }

  // Get messages for a group
  static async getGroupMessages(groupId: string, limit: number = 50): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching group messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getGroupMessages:', error);
      return [];
    }
  }

  // Mark message as read
  static async markAsRead(messageId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('mark_message_as_read', {
        message_id: messageId,
        user_id: userId,
      });

      if (error) {
        console.error('Error marking message as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  }

  // Get unread message count for user
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('get_unread_message_count', {
        user_id: userId,
      });

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  }

  // Subscribe to new messages
  static subscribeToMessages(
    eventId: string | null,
    groupId: string | null,
    onNewMessage: (message: Message) => void,
    onError?: (error: any) => void
  ) {
    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (eventId) {
      query = query.eq('event_id', eventId);
    } else if (groupId) {
      query = query.eq('group_id', groupId);
    }

    return query.on('INSERT', (payload) => {
      onNewMessage(payload.new as Message);
    }).subscribe((status, error) => {
      if (error) {
        console.error('Subscription error:', error);
        onError?.(error);
      }
    });
  }

  // Send event invitation message
  static async sendEventInvite(
    senderId: string,
    senderName: string,
    senderAvatar: string | undefined,
    eventId: string,
    eventName: string,
    recipientIds: string[]
  ): Promise<boolean> {
    try {
      const messages = recipientIds.map(recipientId => ({
        sender_id: senderId,
        sender_name: senderName,
        sender_avatar: senderAvatar,
        content: `You're invited to join "${eventName}"!`,
        message_type: 'event_invite' as const,
        event_id: eventId,
        read_by: [senderId],
        metadata: {
          event_name: eventName,
          recipient_id: recipientId,
        },
      }));

      const { error } = await supabase
        .from('messages')
        .insert(messages);

      if (error) {
        console.error('Error sending event invites:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in sendEventInvite:', error);
      return false;
    }
  }

  // Delete message
  static async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', userId); // Only sender can delete

      if (error) {
        console.error('Error deleting message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteMessage:', error);
      return false;
    }
  }

  // Update message
  static async updateMessage(
    messageId: string,
    userId: string,
    newContent: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content: newContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('sender_id', userId); // Only sender can update

      if (error) {
        console.error('Error updating message:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateMessage:', error);
      return false;
    }
  }
}

export default MessageService;



