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
  name: string;
  activity: string;
  description?: string;
  min_participants: number;
  max_participants: number;
  media_url?: string;
  location_name: string;
  latitude: number;
  longitude: number;
  place_id?: string;
  created_by: string;
  status: 'live' | 'past' | 'cancelled';
  participants_count: number;
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
  name: string;
  activity: string;
  description?: string;
  min_participants?: number;
  max_participants: number;
  media_url?: string;
  location_name: string;
  latitude: number;
  longitude: number;
  place_id?: string;
  created_by: string;
}

export interface EventFilters {
  activity?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in km
  };
  status?: 'live' | 'past' | 'cancelled';
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
      .from('users')
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
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
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
        participants_count: 1, // Creator is automatically a participant
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return null;
    }

    // Add creator as participant
    await this.joinEvent(data.id, eventData.created_by);

    return data;
  }

  async getEvents(filters?: EventFilters): Promise<Event[]> {
    let query = supabase
      .from('events')
      .select(`
        *,
        created_by:users!events_created_by_fkey(display_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.activity) {
      query = query.eq('activity', filters.activity);
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
      .select(`
        *,
        created_by:users!events_created_by_fkey(display_name, avatar_url)
      `)
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
      .eq('created_by', userId);

    if (error) {
      console.error('Error deleting event:', error);
      return false;
    }

    return true;
  }

  // Event participation
  async joinEvent(eventId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('join_event', {
      event_uuid: eventId,
      user_uuid: userId,
    });

    if (error) {
      console.error('Error joining event:', error);
      return false;
    }

    return data;
  }

  async leaveEvent(eventId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('leave_event', {
      event_uuid: eventId,
      user_uuid: userId,
    });

    if (error) {
      console.error('Error leaving event:', error);
      return false;
    }

    return data;
  }

  async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    const { data, error } = await supabase
      .from('event_participants')
      .select(`
        *,
        user:users!event_participants_user_id_fkey(display_name, avatar_url)
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
        sender:users!event_messages_sender_id_fkey(display_name, avatar_url)
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
