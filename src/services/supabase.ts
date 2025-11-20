import { createClient } from '@supabase/supabase-js';
import { notificationService } from './notificationService';

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

// Initialize Supabase client - CONFIGURED
const supabaseUrl = 'https://ujfeqshqhlplmolfrlvc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZmVxc2hxaGxwbG1vbGZybHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzI0NDQsImV4cCI6MjA3NTQwODQ0NH0.vUEi4gl7qsl7fU518CMV79TJG9j3MWgwBQHEzbfuwIA';

console.log('✅ Supabase connected to:', supabaseUrl);

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
          .from('users')
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
  /**
   * Fetch all active events at a specific location
   * Matches by place_id (if available) or by proximity (within 100m)
   */
  async fetchEventsAtLocation(
    placeId: string | null,
    latitude: number,
    longitude: number
  ): Promise<any[]> {
    try {
      console.log(`\n📍 Fetching events at location:`);
      console.log(`   Place ID: ${placeId || 'none'}`);
      console.log(`   Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);

      // Match by place_id if available
      if (placeId) {
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            created_by:users!events_created_by_fkey(id, display_name, avatar_url)
          `)
          .in('status', ['live', 'active', 'upcoming'])
          .eq('place_id', placeId)
          .gte('scheduled_datetime', new Date().toISOString())
          .order('scheduled_datetime', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          console.log(`✓ Found ${data.length} events by place_id`);
          return this.formatEventsWithParticipants(data);
        }
        
        console.log(`⚠️  No events found by place_id, checking proximity...`);
      }

      // Fallback: Match by proximity (within ~100m = 0.001 degrees)
      const proximityThreshold = 0.001;
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          created_by:users!events_created_by_fkey(id, display_name, avatar_url)
        `)
        .in('status', ['live', 'active', 'upcoming'])
        .gte('scheduled_datetime', new Date().toISOString())
        .gte('latitude', latitude - proximityThreshold)
        .lte('latitude', latitude + proximityThreshold)
        .gte('longitude', longitude - proximityThreshold)
        .lte('longitude', longitude + proximityThreshold)
        .order('scheduled_datetime', { ascending: true});

      if (error) throw error;

      console.log(`✓ Found ${data?.length || 0} events by proximity`);
      
      return this.formatEventsWithParticipants(data || []);

    } catch (error) {
      console.error('❌ Error fetching events at location:', error);
      throw error;
    }
  }

  /**
   * Format events with participant counts
   */
  private formatEventsWithParticipants(events: any[]): any[] {
    return events.map(event => ({
      ...event,
      currentParticipants: event.participants_count || 0,
      creator: event.created_by,
    }));
  }

  /**
   * Update user profile with new avatar URL
   */
  async updateProfilePhoto(userId: string, avatarUrl: string): Promise<void> {
    try {
      console.log('💾 Updating profile photo in database (direct UPDATE)...');
      console.log('   User ID:', userId);
      console.log('   New URL:', avatarUrl);

      const { error } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);

      if (error) {
        console.error('❌ Database update error:', error);
        throw error;
      }

      console.log('✅ Profile updated successfully (direct UPDATE)');
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUserProfile(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

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
    try {
      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: userId,
        });

      if (error) {
        // Unique violations mean the user is already in the event – treat as success
        if ((error as any)?.code === '23505') {
          console.warn('User already joined event, skipping duplicate insert', { eventId, userId });
          return true;
        }
        console.error('Error joining event:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error joining event:', error);
      return false;
    }
  }

  async leaveEvent(eventId: string, userId: string): Promise<boolean> {
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
      console.error('Unexpected error leaving event:', error);
      return false;
    }
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

  /**
   * Get all events for a user (both created and joined)
   * Returns upcoming events sorted by scheduled_datetime
   */
  async getUserEvents(userId: string): Promise<Event[]> {
    try {
      console.log(`\n👤 Fetching events for user: ${userId}`);

      // Get event IDs where user is a participant
      const { data: participantData, error: participantError } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', userId);

      if (participantError) {
        console.error('❌ Error fetching participant events:', participantError);
        // Don't throw - user might just not have joined any events yet
      }

      const participantEventIds = participantData?.map(p => p.event_id) || [];
      console.log(`   Found ${participantEventIds.length} joined events`);
      console.log(`   Participant event IDs:`, participantEventIds);

      // Build query for events where user is creator OR participant
      let query = supabase
        .from('events')
        .select('*')
        .in('status', ['live', 'upcoming', 'active'])
        .gte('scheduled_datetime', new Date().toISOString())
        .order('scheduled_datetime', { ascending: true });

      // Add creator OR participant filter
      if (participantEventIds.length > 0) {
        // User has joined events - get created OR joined
        query = query.or(`created_by.eq.${userId},id.in.(${participantEventIds.join(',')})`);
      } else {
        // User has no joined events - get only created events
        query = query.eq('created_by', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching user events:', error);
        throw error;
      }

      console.log(`✅ Found ${data?.length || 0} total events for user`);
      console.log(`   Events:`, data?.map(e => ({ id: e.id, name: e.name, created_by: e.created_by })));

      // Get creator details for each event
      const eventsWithCreators = await Promise.all(
        (data || []).map(async (event) => {
          let creatorData = null;
          
          // Fetch creator details from users table
          if (event.created_by) {
            const { data: userData } = await supabase
              .from('users')
              .select('id, display_name, avatar_url')
              .eq('id', event.created_by)
              .single();
            
            creatorData = userData;
          }

          return {
            ...event,
            currentParticipants: event.participants_count || 0,
            creator: creatorData,
            isCreator: event.created_by === userId,
            isParticipant: participantEventIds.includes(event.id),
          };
        })
      );

      return eventsWithCreators;

    } catch (error) {
      console.error('❌ Error in getUserEvents:', error);
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
    try {
      console.log('💬 [SupabaseService] Loading event messages for event (via RPC):', eventId);

      const { data, error } = await supabase.rpc('get_event_messages', {
        p_event_id: eventId,
        p_limit: limit,
      });

      if (error) {
        console.error('❌ [SupabaseService] Error fetching event messages via RPC:', error);
        return [];
      }

      console.log('✅ [SupabaseService] Loaded messages count (via RPC):', data?.length || 0);
      return (data || []) as EventMessage[];
    } catch (error) {
      console.error('❌ [SupabaseService] Unexpected error fetching event messages via RPC:', error);
      return [];
    }
  }

  async sendEventMessage(eventId: string, senderId: string, messageText: string): Promise<EventMessage | null> {
    try {
      console.log('💬 Sending event message via RPC:', { eventId, senderId });

      const { data, error } = await supabase.rpc('send_event_message', {
        p_event_id: eventId,
        p_message: messageText,
      });

      if (error) {
        console.error('Error sending message via RPC:', error);
        return null;
      }

      return data as EventMessage;
    } catch (error) {
      console.error('Unexpected error sending event message:', error);
      return null;
    }
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

  // Helper to remove a realtime channel (used by screens to clean up)
  removeChannel(channel: any) {
    return supabase.removeChannel(channel);
  }

  /**
   * ============================================
   * FRIENDS & SOCIAL FEATURES
   * ============================================
   */

  /**
   * Search for users by display name
   */
  async searchUsers(query: string, currentUserId: string): Promise<any[]> {
    try {
      console.log('🔍 Searching for users:', query);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, avatar_url, created_at')
        .ilike('display_name', `%${query}%`)
        .neq('id', currentUserId) // Exclude current user
        .limit(20);

      if (error) throw error;

      console.log(`✅ Found ${data.length} users`);
      return data || [];
    } catch (error) {
      console.error('❌ Error searching users:', error);
      throw error;
    }
  }

  /**
   * Send a friend request
   */
  async sendFriendRequest(userId: string, friendId: string): Promise<void> {
    try {
      console.log('📤 Sending friend request (direct INSERT):', { userId, friendId });

      const { error } = await supabase
        .from('user_friendships')
        .insert({
          user_id: userId,
          friend_id: friendId,
          status: 'pending',
        });

      if (error) {
        console.error('❌ Error sending friend request:', error);
        throw error;
      }

      const { data: senderProfile } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', userId)
        .single();

      await notificationService.sendNotificationWithStorage(friendId, {
        title: 'New Friend Request',
        body: `${senderProfile?.display_name || 'Someone'} wants to connect with you.`,
        type: 'friend_request',
        data: {
          senderId: userId,
          senderName: senderProfile?.display_name || 'Someone',
        },
      });

      console.log('✅ Friend request sent (direct INSERT)');
    } catch (error) {
      console.error('❌ Error sending friend request:', error);
      throw error;
    }
  }

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(userId: string, friendId: string): Promise<void> {
    try {
      console.log('✅ Accepting friend request:', { userId, friendId });

      // Update the original request
      const { error } = await supabase
        .from('user_friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('user_id', friendId)
        .eq('friend_id', userId);

      if (error) throw error;

      // Create reciprocal friendship
      const { error: reciprocalError } = await supabase
        .from('user_friendships')
        .insert({
          user_id: userId,
          friend_id: friendId,
          status: 'accepted',
        });

      if (reciprocalError) {
        // If reciprocal already exists, just update it
        if (reciprocalError.code === '23505') {
          await supabase
            .from('user_friendships')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('friend_id', friendId);
        } else {
          throw reciprocalError;
        }
      }

      console.log('✅ Friend request accepted');
    } catch (error) {
      console.error('❌ Error accepting friend request:', error);
      throw error;
    }
  }

  /**
   * Remove a friend or reject a friend request
   */
  async removeFriend(userId: string, friendId: string): Promise<void> {
    try {
      console.log('🗑️ Removing friend:', { userId, friendId });

      // Delete both directions of the friendship
      const { error: error1 } = await supabase
        .from('user_friendships')
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', friendId);

      const { error: error2 } = await supabase
        .from('user_friendships')
        .delete()
        .eq('user_id', friendId)
        .eq('friend_id', userId);

      if (error1 || error2) {
        console.warn('⚠️ Errors removing friendships:', { error1, error2 });
      }

      console.log('✅ Friend removed');
    } catch (error) {
      console.error('❌ Error removing friend:', error);
      throw error;
    }
  }

  /**
   * Get friendship status between two users
   */
  async getFriendshipStatus(userId: string, friendId: string): Promise<'none' | 'pending' | 'accepted' | 'blocked'> {
    try {
      const { data, error } = await supabase
        .from('user_friendships')
        .select('status')
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found

      return data?.status || 'none';
    } catch (error) {
      console.error('❌ Error getting friendship status:', error);
      return 'none';
    }
  }

  /**
   * Get all friends for a user
   */
  async getFriends(userId: string): Promise<any[]> {
    try {
      console.log('👥 Fetching friends for user:', userId);

      const { data, error } = await supabase
        .from('user_friendships')
        .select(`
          friend_id,
          status,
          users:friend_id (
            id,
            display_name,
            avatar_url,
            created_at
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (error) throw error;

      const friends = data?.map(f => f.users).filter(Boolean) || [];
      console.log(`✅ Found ${friends.length} friends`);
      return friends;
    } catch (error) {
      console.error('❌ Error fetching friends:', error);
      throw error;
    }
  }

  /**
   * Get pending friend requests for a user
   */
  async getPendingRequests(userId: string): Promise<any[]> {
    try {
      console.log('📬 Fetching pending requests for user:', userId);

      const { data, error } = await supabase
        .from('user_friendships')
        .select(`
          user_id,
          created_at,
          users:user_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) throw error;

      const requests = data?.map(r => ({
        ...r.users,
        request_date: r.created_at
      })).filter(Boolean) || [];

      console.log(`✅ Found ${requests.length} pending requests`);
      return requests;
    } catch (error) {
      console.error('❌ Error fetching pending requests:', error);
      throw error;
    }
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;
