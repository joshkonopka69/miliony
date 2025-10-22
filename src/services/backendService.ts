// BACKEND FUNCTIONS FOR SPORTMAP
// Complete backend integration with authentication, events, and chat

import { supabase } from '../config/supabase';

// Debug: Check if supabase is properly imported
console.log('🔧 BackendService: Supabase client:', supabase ? 'Loaded' : 'Undefined');
console.log('🔧 BackendService: Supabase auth:', supabase?.auth ? 'Available' : 'Undefined');

// Event interfaces
export interface Event {
  id: string;
  title: string;
  sport_type: string;
  description?: string;
  max_participants: number;
  latitude: number;
  longitude: number;
  location_name?: string;
  location_address?: string;
  scheduled_datetime?: string;
  status: 'active' | 'cancelled' | 'completed';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventData {
  title: string;
  sport_type: string;
  description?: string;
  max_participants: number;
  latitude: number;
  longitude: number;
  location_name?: string;
  location_address?: string;
  scheduled_datetime?: string;
}

export interface EventMessage {
  id: string;
  event_id: string;
  user_id: string;
  message: string;
  created_at: string;
  user?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  favorite_sports?: string[];
  created_at: string;
  updated_at: string;
}

// Authentication Service
export class AuthService {
  
  // Sign up new user
  static async signUp(email: string, password: string, userData: Partial<User>): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            display_name: userData.display_name || data.user.email!.split('@')[0],
            favorite_sports: userData.favorite_sports || [],
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Sign in user
  static async signIn(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Sign out user
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Get user session
  static async getSession(): Promise<any> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  // Add auth state listener
  static addAuthStateListener(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

// Event Management Service
export class EventService {
  
  // Create event
  static async createEvent(
    creatorId: string,
    eventData: CreateEventData
  ): Promise<{ success: boolean; event?: Event; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: creatorId,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating event:', error);
        return { success: false, error: error.message };
      }

      // Add creator as participant
      await this.joinEvent(data.id, creatorId);

      return { success: true, event: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get nearby events
  static async getNearbyEvents(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    limit: number = 20
  ): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'active')
        .limit(limit);

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      // Filter by distance (simple implementation)
      return data.filter(event => {
        const distance = this.calculateDistance(
          latitude, longitude,
          event.latitude, event.longitude
        );
        return distance <= radiusKm;
      });
    } catch (error) {
      console.error('Error in getNearbyEvents:', error);
      return [];
    }
  }

  // Join event
  static async joinEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: userId,
        });

      if (error) {
        console.error('Error joining event:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in joinEvent:', error);
      return false;
    }
  }

  // Leave event
  static async leaveEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error leaving event:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in leaveEvent:', error);
      return false;
    }
  }

  // Get event participants
  static async getEventParticipants(eventId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('user_id')
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching participants:', error);
        return [];
      }

      return data.map(p => p.user_id);
    } catch (error) {
      console.error('Error in getEventParticipants:', error);
      return [];
    }
  }

  // Get event by ID
  static async getEventById(eventId: string): Promise<Event | null> {
    try {
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
    } catch (error) {
      console.error('Error in getEventById:', error);
      return null;
    }
  }

  // Update event
  static async updateEvent(
    eventId: string,
    updates: Partial<CreateEventData>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId);

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

  // Delete event
  static async deleteEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      // Check if user is creator
      const { data: event } = await supabase
        .from('events')
        .select('created_by')
        .eq('id', eventId)
        .single();

      if (!event || event.created_by !== userId) {
        return false; // Not authorized
      }

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

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

  // Get user events
  static async getUserEvents(userId: string): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

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

  // Get joined events
  static async getJoinedEvents(userId: string): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          events (*)
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching joined events:', error);
        return [];
      }

      return data.map(item => item.events).filter(Boolean);
    } catch (error) {
      console.error('Error in getJoinedEvents:', error);
      return [];
    }
  }

  // Calculate distance between two points
  private static calculateDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

// Chat Service for Events
export class ChatService {
  
  // Send message to event
  static async sendMessage(
    eventId: string,
    userId: string,
    message: string
  ): Promise<{ success: boolean; message?: EventMessage; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('event_messages')
        .insert({
          event_id: eventId,
          user_id: userId,
          message: message.trim(),
        })
        .select(`
          *,
          user:users(display_name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Error sending message:', error);
        return { success: false, error: error.message };
      }

      return { success: true, message: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get event messages
  static async getEventMessages(eventId: string, limit: number = 50): Promise<EventMessage[]> {
    try {
      const { data, error } = await supabase
        .from('event_messages')
        .select(`
          *,
          user:users(display_name, avatar_url)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEventMessages:', error);
      return [];
    }
  }

  // Subscribe to event messages
  static subscribeToMessages(eventId: string, callback: (message: EventMessage) => void) {
    const subscription = supabase
      .channel(`event_messages:${eventId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'event_messages',
        filter: `event_id=eq.${eventId}`
      }, (payload) => {
        // Fetch the full message with user data
        supabase
          .from('event_messages')
          .select(`
            *,
            user:users(display_name, avatar_url)
          `)
          .eq('id', payload.new.id)
          .single()
          .then(({ data }) => {
            if (data) {
              callback(data);
            }
          });
      })
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(subscription);
      }
    };
  }

  // Delete message
  static async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', userId);

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
}

// User Service
export class UserService {
  
  // Get user profile
  static async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('Error updating user profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return false;
    }
  }

  // Search users
  static async searchUsers(query: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(20);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchUsers:', error);
      return [];
    }
  }
}

// Main Backend Service (combines all services)
export class BackendService {
  static Auth = AuthService;
  static Events = EventService;
  static Chat = ChatService;
  static Users = UserService;
}

export default BackendService;
