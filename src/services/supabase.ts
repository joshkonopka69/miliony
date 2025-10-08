import { createClient } from '@supabase/supabase-js';

// Types for our database
export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  friends: string[];
  favorite_sports: string[];
  location_latitude?: number;
  location_longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string; // Changed from 'name' to 'title'
  sport_type: string; // Changed from 'activity' to 'sport_type'
  description?: string;
  max_participants: number;
  latitude: number;
  longitude: number;
  scheduled_datetime: string; // Added this field
  status: 'active' | 'cancelled' | 'completed'; // Updated status values
  creator_id: string; // Changed from 'created_by' to 'creator_id'
  created_at: string;
  updated_at: string;
}

export interface Sport {
  id: string;
  name: string;
  icon_url?: string;
  category: string;
}

export interface EventParticipant {
  event_id: string;
  user_id: string;
  joined_at: string;
}

export interface EventMessage {
  id: string;
  event_id: string;
  sender_id: string;
  message_text: string;
  message_type: 'text' | 'image' | 'system';
  created_at: string;
}

export interface CreateEventData {
  title: string; // Changed from 'name' to 'title'
  sport_type: string; // Changed from 'activity' to 'sport_type'
  description?: string;
  max_participants: number;
  latitude: number;
  longitude: number;
  scheduled_datetime: string; // Added this field
  creator_id: string; // Changed from 'created_by' to 'creator_id'
}

export interface EventFilters {
  sport_type?: string; // Changed from 'activity' to 'sport_type'
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in km
  };
  status?: 'active' | 'cancelled' | 'completed'; // Updated status values
}

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'your_supabase_url';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your_supabase_anon_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

class SupabaseService {
  // User operations
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  }

  async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      // Try the Firebase UID to UUID function first
      const { data, error } = await supabase.rpc('create_user_with_firebase_uid', {
        firebase_uid: userData.id,
        user_email: userData.email,
        user_display_name: userData.display_name,
        user_favorite_sports: userData.favorite_sports || []
      });

      if (error) {
        console.error('Error creating user with function:', error);
        
        // Fallback to direct insert (this will work if RLS is disabled)
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .insert({
            ...userData,
            id: userData.id || 'temp-id-' + Date.now() // Use Firebase UID or temp ID
          })
          .select()
          .single();

        if (fallbackError) {
          console.error('Error creating user (fallback):', fallbackError);
          return null;
        }

        return fallbackData;
      }

      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  }

  // Event operations
  async createEvent(eventData: CreateEventData): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        status: 'active', // Set default status
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return null;
    }

    // Add creator as participant
    await this.joinEvent(data.id, eventData.creator_id);

    return data;
  }

  async getEvents(filters?: EventFilters): Promise<Event[]> {
    let query = supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false});

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.sport_type) {
      query = query.eq('sport_type', filters.sport_type);
    }

    if (filters?.location) {
      // Use the custom function for location-based search
      const { data, error } = await supabase.rpc('get_events_near_location', {
        user_lat: filters.location.latitude,
        user_lng: filters.location.longitude,
        radius_km: filters.location.radius,
      });

      if (error) {
        console.error('Error fetching events by location:', error);
        return [];
      }

      return data || [];
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }

    return data || [];
  }

  async getEventById(eventId: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return null;
    }

    return data;
  }

  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      return null;
    }

    return data;
  }

  async deleteEvent(eventId: string, userId: string): Promise<boolean> {
    // Only allow creator to delete
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('creator_id', userId);

    if (error) {
      console.error('Error deleting event:', error);
      return false;
    }

    return true;
  }

  // Event participation
  async joinEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      console.log('🔗 Joining event:', { eventId, userId });

      // Try direct insert into event_participants table first
      const { data, error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: userId,
          joined_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('❌ Error joining event (direct insert):', error);
        
        // If direct insert fails, try RPC function as fallback
        console.log('🔄 Trying RPC function as fallback...');
        const { data: rpcData, error: rpcError } = await supabase.rpc('join_event', {
          event_uuid: eventId,
          user_uuid: userId,
        });

        if (rpcError) {
          console.error('❌ Error joining event (RPC):', rpcError);
          console.error('❌ Error details:', JSON.stringify(rpcError, null, 2));
          return false;
        }

        console.log('✅ Successfully joined event via RPC:', rpcData);
        return rpcData;
      }

      console.log('✅ Successfully joined event via direct insert:', data);
      return true;
    } catch (error) {
      console.error('❌ Exception in joinEvent:', error);
      return false;
    }
  }

  async leaveEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      console.log('🚪 Leaving event:', { eventId, userId });

      // Try direct delete from event_participants table first
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error leaving event (direct delete):', error);
        
        // If direct delete fails, try RPC function as fallback
        console.log('🔄 Trying RPC function as fallback...');
        const { data: rpcData, error: rpcError } = await supabase.rpc('leave_event', {
          event_uuid: eventId,
          user_uuid: userId,
        });

        if (rpcError) {
          console.error('❌ Error leaving event (RPC):', rpcError);
          console.error('❌ Error details:', JSON.stringify(rpcError, null, 2));
          return false;
        }

        console.log('✅ Successfully left event via RPC:', rpcData);
        return rpcData;
      }

      console.log('✅ Successfully left event via direct delete');
      return true;
    } catch (error) {
      console.error('❌ Exception in leaveEvent:', error);
      return false;
    }
  }

  async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    const { data, error } = await supabase
      .from('event_participants')
      .select(`
        *,
        user:profiles!event_participants_user_id_fkey(display_name, avatar_url)
      `)
      .eq('event_id', eventId);

    if (error) {
      console.error('Error fetching event participants:', error);
      return [];
    }

    return data || [];
  }

  async isUserParticipant(eventId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('event_participants')
      .select('user_id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }

  // Get user's joined events
  async getMyEvents(userId: string): Promise<Event[]> {
    try {
      console.log('🔍 Fetching events for user:', userId);
      
      // First, get the event IDs that the user has joined
      const { data: participants, error: participantsError } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', userId);

      if (participantsError) {
        console.error('❌ Error fetching event participants:', participantsError);
        return [];
      }

      if (!participants || participants.length === 0) {
        console.log('📋 No events found for user');
        return [];
      }

      console.log('📋 Found participants:', participants);

      // Extract event IDs
      const eventIds = participants.map(p => p.event_id);
      console.log('📋 Event IDs:', eventIds);

      // Now fetch the actual events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds)
        .order('created_at', { ascending: false });

      if (eventsError) {
        console.error('❌ Error fetching events:', eventsError);
        return [];
      }

      console.log('📋 Fetched events:', events);
      return events || [];
      
    } catch (error) {
      console.error('❌ Exception in getMyEvents:', error);
      return [];
    }
  }

  // Sports operations
  async getSports(): Promise<Sport[]> {
    const { data, error } = await supabase
      .from('sports')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching sports:', error);
      return [];
    }

    return data || [];
  }

  // Event messages (for persistent chat history)
  async getEventMessages(eventId: string, limit: number = 50): Promise<EventMessage[]> {
    const { data, error } = await supabase
      .from('event_messages')
      .select(`
        *,
        sender:profiles!event_messages_sender_id_fkey(display_name, avatar_url)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching event messages:', error);
      return [];
    }

    return data || [];
  }

  async sendEventMessage(eventId: string, senderId: string, messageText: string): Promise<EventMessage | null> {
    const { data, error } = await supabase
      .from('event_messages')
      .insert({
        event_id: eventId,
        sender_id: senderId,
        message_text: messageText,
        message_type: 'text',
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    return data;
  }

  // Storage operations
  async uploadAvatar(userId: string, file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  async uploadEventMedia(eventId: string, file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${eventId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('events')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading event media:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('events')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  // Real-time subscriptions
  subscribeToEvents(callback: (event: Event) => void) {
    return supabase
      .channel('events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new as Event);
          }
        }
      )
      .subscribe();
  }

  subscribeToEventMessages(eventId: string, callback: (message: EventMessage) => void) {
    return supabase
      .channel(`event_messages_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_messages',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new as EventMessage);
          }
        }
      )
      .subscribe();
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;
