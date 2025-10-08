import { supabase } from './supabase';

export interface ChatMessage {
  id: string;
  event_id: string;
  user_id: string;
  message: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface ChatRoom {
  event_id: string;
  event_title: string;
  participants_count: number;
  last_message?: ChatMessage;
  unread_count: number;
}

class ChatService {
  // Send a message to an event chat
  async sendMessage(eventId: string, userId: string, message: string): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('event_chat_messages')
        .insert({
          event_id: eventId,
          user_id: userId,
          message: message.trim(),
        })
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return null;
      }

      // Transform the data to match our interface
      return {
        id: data.id,
        event_id: data.event_id,
        user_id: data.user_id,
        message: data.message,
        created_at: data.created_at,
        user_name: data.profiles?.full_name || data.profiles?.username || 'Unknown User',
        user_avatar: data.profiles?.avatar_url,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  // Get messages for an event
  async getEventMessages(eventId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('event_chat_messages')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return data.map(msg => ({
        id: msg.id,
        event_id: msg.event_id,
        user_id: msg.user_id,
        message: msg.message,
        created_at: msg.created_at,
        user_name: msg.profiles?.full_name || msg.profiles?.username || 'Unknown User',
        user_avatar: msg.profiles?.avatar_url,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  // Subscribe to new messages for an event
  subscribeToEventMessages(eventId: string, onNewMessage: (message: ChatMessage) => void) {
    const subscription = supabase
      .channel(`event_chat_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_chat_messages',
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          try {
            // Fetch the full message with user details
            const { data, error } = await supabase
              .from('event_chat_messages')
              .select(`
                *,
                profiles:user_id (
                  username,
                  full_name,
                  avatar_url
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && data) {
              const message: ChatMessage = {
                id: data.id,
                event_id: data.event_id,
                user_id: data.user_id,
                message: data.message,
                created_at: data.created_at,
                user_name: data.profiles?.full_name || data.profiles?.username || 'Unknown User',
                user_avatar: data.profiles?.avatar_url,
              };
              onNewMessage(message);
            }
          } catch (error) {
            console.error('Error processing new message:', error);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  // Get chat rooms for a user (events they're participating in)
  async getUserChatRooms(userId: string): Promise<ChatRoom[]> {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          events!inner (
            id,
            title,
            status,
            scheduled_datetime
          ),
          event_chat_messages!inner (
            id,
            message,
            created_at,
            user_id
          )
        `)
        .eq('user_id', userId)
        .eq('events.status', 'active')
        .order('event_chat_messages.created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chat rooms:', error);
        return [];
      }

      // Group by event and get latest message
      const roomsMap = new Map<string, ChatRoom>();
      
      data.forEach(participant => {
        const event = participant.events;
        const messages = participant.event_chat_messages;
        
        if (!roomsMap.has(event.id)) {
          roomsMap.set(event.id, {
            event_id: event.id,
            event_title: event.title,
            participants_count: 0, // TODO: Get actual count
            unread_count: 0, // TODO: Implement unread tracking
          });
        }

        // Get the latest message
        if (messages.length > 0) {
          const latestMessage = messages[0];
          roomsMap.get(event.id)!.last_message = {
            id: latestMessage.id,
            event_id: event.id,
            user_id: latestMessage.user_id,
            message: latestMessage.message,
            created_at: latestMessage.created_at,
          };
        }
      });

      return Array.from(roomsMap.values());
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      return [];
    }
  }

  // Mark messages as read (for unread count tracking)
  async markMessagesAsRead(eventId: string, userId: string): Promise<void> {
    // TODO: Implement unread message tracking
    // This would require adding a read_status table or field
    console.log('Marking messages as read for event:', eventId, 'user:', userId);
  }
}

export const chatService = new ChatService();
