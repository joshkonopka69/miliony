import { supabase } from './supabase';

export interface Event {
  id: string;
  name: string;
  description: string;
  activity: string;
  max_participants: number;
  participants_count: number;
  location_name: string;
  latitude: number;
  longitude: number;
  place_id?: string;
  created_by: string;
  status: 'live' | 'past' | 'cancelled';
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
  participants: string[];
  is_joined?: boolean;
}

export interface CreateEventData {
  name: string;
  description: string;
  activity: string;
  max_participants: number;
  location_name: string;
  latitude: number;
  longitude: number;
  place_id?: string;
  start_time?: string;
  end_time?: string;
}

export class EventService {
  // Create a new event
  static async createEvent(
    creatorId: string,
    eventData: CreateEventData
  ): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: creatorId,
          participants_count: 1,
          status: 'live',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating event:', error);
        return null;
      }

      // Add creator as participant
      await this.joinEvent(data.id, creatorId);

      return data;
    } catch (error) {
      console.error('Error in createEvent:', error);
      return null;
    }
  }

  // Get events near location
  static async getNearbyEvents(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    limit: number = 20
  ): Promise<Event[]> {
    try {
      const { data, error } = await supabase.rpc('get_events_near_location', {
        user_lat: latitude,
        user_lng: longitude,
        radius_km: radiusKm,
      });

      if (error) {
        console.error('Error fetching nearby events:', error);
        return [];
      }

      return data?.slice(0, limit) || [];
    } catch (error) {
      console.error('Error in getNearbyEvents:', error);
      return [];
    }
  }

  // Get user's events
  static async getUserEvents(userId: string): Promise<Event[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_events', {
        user_uuid: userId,
      });

      if (error) {
        console.error('Error fetching user events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserEvents:', error);
      return [];
    }
  }

  // Join an event
  static async joinEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('join_event', {
        event_uuid: eventId,
        user_uuid: userId,
      });

      if (error) {
        console.error('Error joining event:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in joinEvent:', error);
      return false;
    }
  }

  // Leave an event
  static async leaveEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('leave_event', {
        event_uuid: eventId,
        user_uuid: userId,
      });

      if (error) {
        console.error('Error leaving event:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in leaveEvent:', error);
      return false;
    }
  }

  // Get event details
  static async getEventDetails(eventId: string): Promise<Event | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_participants!inner(user_id)
        `)
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error fetching event details:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getEventDetails:', error);
      return null;
    }
  }

  // Update event
  static async updateEvent(
    eventId: string,
    userId: string,
    updates: Partial<CreateEventData>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .eq('created_by', userId);

      if (error) {
        console.error('Error updating event:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateEvent:', error);
      return false;
    }
  }

  // Cancel event
  static async cancelEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'cancelled' })
        .eq('id', eventId)
        .eq('created_by', userId);

      if (error) {
        console.error('Error cancelling event:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in cancelEvent:', error);
      return false;
    }
  }

  // Delete event
  static async deleteEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('created_by', userId);

      if (error) {
        console.error('Error deleting event:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      return false;
    }
  }

  // Search events
  static async searchEvents(
    query: string,
    activity?: string,
    latitude?: number,
    longitude?: number,
    radiusKm?: number
  ): Promise<Event[]> {
    try {
      let supabaseQuery = supabase
        .from('events')
        .select('*')
        .eq('status', 'live')
        .ilike('name', `%${query}%`);

      if (activity) {
        supabaseQuery = supabaseQuery.eq('activity', activity);
      }

      if (latitude && longitude && radiusKm) {
        // This would need a custom function for distance filtering
        // For now, we'll get all matching events
      }

      const { data, error } = await supabaseQuery
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error searching events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchEvents:', error);
      return [];
    }
  }

  // Get event participants
  static async getEventParticipants(eventId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          user_id,
          users!inner(id, display_name, avatar_url)
        `)
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching event participants:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEventParticipants:', error);
      return [];
    }
  }

  // Subscribe to event updates
  static subscribeToEventUpdates(
    eventId: string,
    onUpdate: (event: Event) => void,
    onError?: (error: any) => void
  ) {
    return supabase
      .channel(`event-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          onUpdate(payload.new as Event);
        }
      )
      .subscribe((status, error) => {
        if (error) {
          console.error('Subscription error:', error);
          onError?.(error);
        }
      });
  }
}

export default EventService;