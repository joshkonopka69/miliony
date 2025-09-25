// Integrated Event Service combining Supabase and Firebase
import { supabaseService, Event, CreateEventData, EventFilters } from './supabase';
import { firebaseService, LiveEvent, LiveMessage } from './firebase';

export interface IntegratedEvent extends Event {
  liveEvent?: LiveEvent;
  isLive: boolean;
  participants: string[];
  messages: LiveMessage[];
}

export interface CreateEventRequest extends CreateEventData {
  // Additional fields for real-time features
  enableChat?: boolean;
  enablePresence?: boolean;
}

class EventService {
  // Create event in both Supabase and Firebase
  async createEvent(eventData: CreateEventRequest): Promise<IntegratedEvent | null> {
    try {
      // 1. Create event in Supabase (persistent)
      const supabaseEvent = await supabaseService.createEvent(eventData);
      if (!supabaseEvent) {
        throw new Error('Failed to create event in Supabase');
      }

      // 2. Create live event in Firebase (real-time)
      const liveEvent = await firebaseService.createLiveEvent({
        supabaseEventId: supabaseEvent.id,
        name: supabaseEvent.name,
        activity: supabaseEvent.activity,
        location: {
          latitude: supabaseEvent.latitude,
          longitude: supabaseEvent.longitude,
          placeId: supabaseEvent.place_id,
          name: supabaseEvent.location_name,
        },
        createdBy: supabaseEvent.created_by,
        maxParticipants: supabaseEvent.max_participants,
      });

      // 3. Return integrated event
      return {
        ...supabaseEvent,
        liveEvent,
        isLive: true,
        participants: liveEvent.participants,
        messages: [],
      } as IntegratedEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      return null;
    }
  }

  // Get events with real-time data
  async getEvents(filters?: EventFilters): Promise<IntegratedEvent[]> {
    try {
      // 1. Get events from Supabase
      const supabaseEvents = await supabaseService.getEvents(filters);
      
      // 2. Get live events from Firebase
      const liveEvents = await firebaseService.getLiveEvents();
      
      // 3. Combine data
      const integratedEvents: IntegratedEvent[] = supabaseEvents.map(event => {
        const liveEvent = liveEvents.find(le => le.supabaseEventId === event.id);
        
        return {
          ...event,
          liveEvent,
          isLive: !!liveEvent,
          participants: liveEvent?.participants || [],
          messages: [], // Will be loaded separately if needed
        };
      });

      return integratedEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  // Get single event with real-time data
  async getEventById(eventId: string): Promise<IntegratedEvent | null> {
    try {
      // 1. Get event from Supabase
      const supabaseEvent = await supabaseService.getEventById(eventId);
      if (!supabaseEvent) {
        return null;
      }

      // 2. Get live event from Firebase
      const liveEvent = await firebaseService.getLiveEvent(eventId);
      
      // 3. Get messages if event is live
      let messages: LiveMessage[] = [];
      if (liveEvent) {
        messages = await firebaseService.getEventMessages(eventId);
      }

      return {
        ...supabaseEvent,
        liveEvent: liveEvent || undefined,
        isLive: !!liveEvent,
        participants: liveEvent?.participants || [],
        messages,
      };
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  }

  // Join event (both Supabase and Firebase)
  async joinEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      // 1. Join in Supabase
      const supabaseSuccess = await supabaseService.joinEvent(eventId, userId);
      if (!supabaseSuccess) {
        return false;
      }

      // 2. Join in Firebase (if event is live)
      const liveEvent = await firebaseService.getLiveEvent(eventId);
      if (liveEvent) {
        const firebaseSuccess = await firebaseService.joinLiveEvent(eventId, userId);
        if (!firebaseSuccess) {
          // Rollback Supabase join
          await supabaseService.leaveEvent(eventId, userId);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error joining event:', error);
      return false;
    }
  }

  // Leave event (both Supabase and Firebase)
  async leaveEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      // 1. Leave in Supabase
      const supabaseSuccess = await supabaseService.leaveEvent(eventId, userId);
      if (!supabaseSuccess) {
        return false;
      }

      // 2. Leave in Firebase (if event is live)
      const liveEvent = await firebaseService.getLiveEvent(eventId);
      if (liveEvent) {
        await firebaseService.leaveLiveEvent(eventId, userId);
      }

      return true;
    } catch (error) {
      console.error('Error leaving event:', error);
      return false;
    }
  }

  // End event (mark as past in both systems)
  async endEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      // 1. Update status in Supabase
      const supabaseSuccess = await supabaseService.updateEvent(eventId, { status: 'past' });
      if (!supabaseSuccess) {
        return false;
      }

      // 2. End live event in Firebase
      const firebaseSuccess = await firebaseService.endLiveEvent(eventId, userId);
      if (!firebaseSuccess) {
        // Rollback Supabase update
        await supabaseService.updateEvent(eventId, { status: 'live' });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error ending event:', error);
      return false;
    }
  }

  // Send message to event
  async sendMessage(eventId: string, senderId: string, senderName: string, text: string): Promise<LiveMessage | null> {
    try {
      // 1. Send message in Firebase
      const message = await firebaseService.sendMessage(eventId, senderId, senderName, text);
      if (!message) {
        return null;
      }

      // 2. Optionally save to Supabase for persistence
      await supabaseService.sendEventMessage(eventId, senderId, text);

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  // Get event messages
  async getEventMessages(eventId: string, limit: number = 50): Promise<LiveMessage[]> {
    try {
      return await firebaseService.getEventMessages(eventId, limit);
    } catch (error) {
      console.error('Error fetching event messages:', error);
      return [];
    }
  }

  // Subscribe to live events (real-time updates)
  subscribeToLiveEvents(callback: (events: LiveEvent[]) => void): () => void {
    return firebaseService.subscribeToLiveEvents(callback);
  }

  // Subscribe to specific event updates
  subscribeToEvent(eventId: string, callback: (event: LiveEvent | null) => void): () => void {
    return firebaseService.subscribeToLiveEvent(eventId, callback);
  }

  // Subscribe to event messages
  subscribeToEventMessages(eventId: string, callback: (message: LiveMessage) => void): () => void {
    return firebaseService.subscribeToEventMessages(eventId, callback);
  }

  // Subscribe to event presence
  subscribeToEventPresence(eventId: string, callback: (presence: any[]) => void): () => void {
    return firebaseService.subscribeToEventPresence(eventId, callback);
  }

  // Update user presence in event
  async updateUserPresence(eventId: string, userId: string, status: 'online' | 'away' | 'offline'): Promise<void> {
    try {
      await firebaseService.updateUserPresence(eventId, userId, status);
    } catch (error) {
      console.error('Error updating user presence:', error);
    }
  }

  // Get events near location
  async getEventsNearLocation(latitude: number, longitude: number, radius: number = 10): Promise<IntegratedEvent[]> {
    try {
      const filters: EventFilters = {
        location: { latitude, longitude, radius },
        status: 'live',
      };

      return await this.getEvents(filters);
    } catch (error) {
      console.error('Error fetching events near location:', error);
      return [];
    }
  }

  // Search events by activity
  async searchEventsByActivity(activity: string): Promise<IntegratedEvent[]> {
    try {
      const filters: EventFilters = {
        activity,
        status: 'live',
      };

      return await this.getEvents(filters);
    } catch (error) {
      console.error('Error searching events by activity:', error);
      return [];
    }
  }

  // Get user's events (created and joined)
  async getUserEvents(userId: string): Promise<IntegratedEvent[]> {
    try {
      // This would require additional Supabase functions
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error fetching user events:', error);
      return [];
    }
  }
}

export const eventService = new EventService();
export default eventService;
