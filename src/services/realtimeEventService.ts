import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface EventUpdate {
  eventId: string;
  type: 'participant_joined' | 'participant_left' | 'event_updated' | 'event_cancelled';
  data: any;
  timestamp: Date;
}

export interface EventSubscription {
  eventId: string;
  onUpdate: (update: EventUpdate) => void;
  onError?: (error: Error) => void;
}

class RealtimeEventService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscriptions: Map<string, EventSubscription[]> = new Map();

  // Subscribe to real-time updates for a specific event
  subscribeToEvent(eventId: string, callback: (update: EventUpdate) => void): () => void {
    const subscription: EventSubscription = {
      eventId,
      onUpdate: callback,
    };

    // Add to subscriptions
    if (!this.subscriptions.has(eventId)) {
      this.subscriptions.set(eventId, []);
    }
    this.subscriptions.get(eventId)!.push(subscription);

    // Create or get existing channel
    let channel = this.channels.get(eventId);
    if (!channel) {
      channel = supabase
        .channel(`event_${eventId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'event_participants',
            filter: `event_id=eq.${eventId}`,
          },
          (payload) => {
            this.handleEventUpdate(eventId, {
              type: payload.eventType === 'INSERT' ? 'participant_joined' : 'participant_left',
              eventId,
              data: payload,
              timestamp: new Date(),
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'events',
            filter: `id=eq.${eventId}`,
          },
          (payload) => {
            this.handleEventUpdate(eventId, {
              type: 'event_updated',
              eventId,
              data: payload,
              timestamp: new Date(),
            });
          }
        )
        .subscribe();

      this.channels.set(eventId, channel);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribeFromEvent(eventId, callback);
    };
  }

  // Subscribe to all events in an area
  subscribeToAreaEvents(
    bounds: { north: number; south: number; east: number; west: number },
    callback: (update: EventUpdate) => void
  ): () => void {
    const channelName = `area_events_${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        (payload) => {
          // Check if event is within bounds
          const event = (payload.new || payload.old) as any;
          if (event && this.isEventInBounds(event, bounds)) {
            callback({
              type: 'event_updated',
              eventId: event.id,
              data: payload,
              timestamp: new Date(),
            });
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  // Subscribe to user's events
  subscribeToUserEvents(userId: string, callback: (update: EventUpdate) => void): () => void {
    const channelName = `user_events_${userId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_participants',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;
          callback({
            type: payload.eventType === 'INSERT' ? 'participant_joined' : 'participant_left',
            eventId: newRecord?.event_id || oldRecord?.event_id,
            data: payload,
            timestamp: new Date(),
          });
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  // Send real-time notification
  async sendEventNotification(
    eventId: string,
    type: 'event_created' | 'participant_joined' | 'participant_left' | 'event_updated' | 'event_cancelled',
    data: any
  ): Promise<void> {
    try {
      await supabase
        .channel(`event_${eventId}`)
        .send({
          type: 'broadcast',
          event: type,
          payload: {
            eventId,
            data,
            timestamp: new Date().toISOString(),
          },
        });
    } catch (error) {
      console.error('Error sending event notification:', error);
    }
  }

  // Handle event updates
  private handleEventUpdate(eventId: string, update: EventUpdate): void {
    const subscriptions = this.subscriptions.get(eventId) || [];
    subscriptions.forEach(subscription => {
      try {
        subscription.onUpdate(update);
      } catch (error) {
        console.error('Error in event update callback:', error);
        subscription.onError?.(error as Error);
      }
    });
  }

  // Check if event is within bounds
  private isEventInBounds(event: any, bounds: { north: number; south: number; east: number; west: number }): boolean {
    const lat = event.latitude;
    const lng = event.longitude;
    
    return lat >= bounds.south && 
           lat <= bounds.north && 
           lng >= bounds.west && 
           lng <= bounds.east;
  }

  // Unsubscribe from specific event
  private unsubscribeFromEvent(eventId: string, callback: (update: EventUpdate) => void): void {
    const subscriptions = this.subscriptions.get(eventId);
    if (subscriptions) {
      const index = subscriptions.findIndex(sub => sub.onUpdate === callback);
      if (index > -1) {
        subscriptions.splice(index, 1);
      }
      
      // If no more subscriptions, unsubscribe from channel
      if (subscriptions.length === 0) {
        const channel = this.channels.get(eventId);
        if (channel) {
          channel.unsubscribe();
          this.channels.delete(eventId);
        }
        this.subscriptions.delete(eventId);
      }
    }
  }

  // Cleanup all subscriptions
  cleanup(): void {
    this.channels.forEach(channel => {
      channel.unsubscribe();
    });
    this.channels.clear();
    this.subscriptions.clear();
  }
}

export const realtimeEventService = new RealtimeEventService();



