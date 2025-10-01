// Real-time service for live event synchronization
import { supabase } from '../config/supabase';
import { Event } from './firestore';

export class RealtimeService {
  private static subscriptions: Map<string, any> = new Map();

  // Subscribe to all events for real-time updates
  static subscribeToEvents(callback: (events: Event[]) => void) {
    console.log('🔄 Subscribing to events...');
    
    const subscription = supabase
      .channel('events')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'events' 
        },
        (payload) => {
          console.log('📡 Event change received:', payload);
          // Trigger callback to refresh events
          callback([]); // Will be replaced with actual events
        }
      )
      .subscribe();

    this.subscriptions.set('events', subscription);
    return subscription;
  }

  // Subscribe to specific event participants
  static subscribeToEventParticipants(eventId: string, callback: (participants: string[]) => void) {
    console.log(`🔄 Subscribing to event ${eventId} participants...`);
    
    const subscription = supabase
      .channel(`event_${eventId}`)
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'event_participants', 
          filter: `event_id=eq.${eventId}` 
        },
        (payload) => {
          console.log(`📡 Event ${eventId} participant change:`, payload);
          callback([]); // Will be replaced with actual participants
        }
      )
      .subscribe();

    this.subscriptions.set(`event_${eventId}`, subscription);
    return subscription;
  }

  // Subscribe to friend requests
  static subscribeToFriendRequests(userId: string, callback: (requests: any[]) => void) {
    console.log(`🔄 Subscribing to friend requests for user ${userId}...`);
    
    const subscription = supabase
      .channel(`friend_requests_${userId}`)
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'friend_requests',
          filter: `receiver_id=eq.${userId}` 
        },
        (payload) => {
          console.log(`📡 Friend request change:`, payload);
          callback([]); // Will be replaced with actual requests
        }
      )
      .subscribe();

    this.subscriptions.set(`friend_requests_${userId}`, subscription);
    return subscription;
  }

  // Subscribe to messages
  static subscribeToMessages(chatId: string, callback: (messages: any[]) => void) {
    console.log(`🔄 Subscribing to messages for chat ${chatId}...`);
    
    const subscription = supabase
      .channel(`messages_${chatId}`)
      .on('postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `chat_id=eq.${chatId}` 
        },
        (payload) => {
          console.log(`📡 New message received:`, payload);
          callback([]); // Will be replaced with actual messages
        }
      )
      .subscribe();

    this.subscriptions.set(`messages_${chatId}`, subscription);
    return subscription;
  }

  // Unsubscribe from specific channel
  static unsubscribe(channelName: string) {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      console.log(`🔌 Unsubscribing from ${channelName}...`);
      supabase.removeChannel(subscription);
      this.subscriptions.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  static unsubscribeAll() {
    console.log('🔌 Unsubscribing from all channels...');
    this.subscriptions.forEach((subscription, channelName) => {
      supabase.removeChannel(subscription);
    });
    this.subscriptions.clear();
  }

  // Get active subscriptions
  static getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }
}

export default RealtimeService;


