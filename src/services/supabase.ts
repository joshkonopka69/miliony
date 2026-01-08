import { supabase } from '../config/supabase';
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
  participants_count: number;
  scheduled_datetime: string;
  end_datetime?: string;
  chat_enabled?: boolean;
  media_url?: string;
  location_name: string;
  latitude: number;
  longitude: number;
  place_id?: string;
  created_by: string;
  status: 'live' | 'past' | 'cancelled';
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
  sender?: {
    display_name: string;
    avatar_url?: string;
  };
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

// Use centralized Supabase client
export { supabase };

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
            created_by:users!events_created_by_fkey(id, display_name, avatar_url),
            event_participants(user_id)
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
          created_by:users!events_created_by_fkey(id, display_name, avatar_url),
          event_participants(user_id)
        `)
        .in('status', ['live', 'active', 'upcoming'])
        .gte('scheduled_datetime', new Date().toISOString())
        .gte('latitude', latitude - proximityThreshold)
        .lte('latitude', latitude + proximityThreshold)
        .gte('longitude', longitude - proximityThreshold)
        .lte('longitude', longitude + proximityThreshold)
        .order('scheduled_datetime', { ascending: true });

      if (error) throw error;

      console.log(`✓ Found ${data?.length || 0} events by proximity`);

      return this.formatEventsWithParticipants(data || []);

    } catch (error) {
      console.error('❌ Error fetching events at location:', error);
      throw error;
    }
  }

  /**
   * Format events with participant counts - counts from event_participants table
   */
  private formatEventsWithParticipants(events: any[]): any[] {
    return events.map(event => {
      // Count actual participants from the joined event_participants relation
      const actualParticipantCount = event.event_participants?.length || 0;

      return {
        ...event,
        currentParticipants: actualParticipantCount,
        participants_count: actualParticipantCount, // Keep consistent
        creator: event.created_by,
      };
    });
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
      // Fetch minimal event info for notifications (do not block on errors)
      const { data: eventMeta, error: eventMetaError } = await supabase
        .from('events')
        .select('id, name, created_by')
        .eq('id', eventId)
        .single();

      if (eventMetaError) {
        console.warn('joinEvent: could not load event metadata for notifications', eventMetaError);
      }

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

      // Update participants_count in the events table
      const { data: participantCountData } = await supabase
        .from('event_participants')
        .select('user_id')
        .eq('event_id', eventId);

      const newCount = participantCountData?.length || 1;
      await supabase
        .from('events')
        .update({ participants_count: newCount })
        .eq('id', eventId);

      console.log(`✅ Updated participants_count to ${newCount} for event ${eventId}`);

      // Notify organizer that someone joined (skip if user is the organizer)
      if (eventMeta?.created_by && eventMeta.created_by !== userId) {
        await notificationService.sendNotificationWithStorage(eventMeta.created_by, {
          title: 'New participant joined',
          body: `${eventMeta?.name || 'Your event'} has a new participant.`,
          type: 'event_participant_joined',
          data: {
            eventId,
            participantId: userId,
            eventName: eventMeta?.name,
          },
        });
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

      // Update participants_count in the events table
      const { data: participantCountData } = await supabase
        .from('event_participants')
        .select('user_id')
        .eq('event_id', eventId);

      const newCount = participantCountData?.length || 0;
      await supabase
        .from('events')
        .update({ participants_count: newCount })
        .eq('id', eventId);

      console.log(`✅ Updated participants_count to ${newCount} for event ${eventId} (user left)`);

      return true;
    } catch (error) {
      console.error('Unexpected error leaving event:', error);
      return false;
    }
  }

  /**
   * Get all events for a user (created and joined)
   */
  async getUserEvents(userId: string): Promise<any[]> {
    try {
      console.log('Fetching events for user:', userId);

      // Since creators are automatically added as participants, 
      // we only need to query event_participants to get BOTH created and joined events
      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          joined_at,
          event:events (
            *,
            created_by:users!events_created_by_fkey(id, display_name, avatar_url)
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      if (!data) return [];

      // Map the nested event objects to a flat array and add role info
      const events = data.map((item: any) => {
        const event = item.event;
        const isCreator = event.created_by.id === userId;

        return {
          ...event,
          role: isCreator ? 'created' : 'joined',
          // Ensure we have participant counts
          currentParticipants: event.participants_count || 1,
          maxParticipants: event.max_participants,
          creator: event.created_by
        };
      });

      return events;
    } catch (error) {
      console.error('Error fetching user events:', error);
      return [];
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
      console.log('💬 [SupabaseService] Loading event messages for event (direct query with joins):', eventId);

      // Using direct query instead of RPC to easily join with user profiles
      const { data, error } = await supabase
        .from('event_messages')
        .select(`
          *,
          sender:sender_id (
            display_name,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ [SupabaseService] Error fetching event messages:', error);
        return [];
      }

      console.log('✅ [SupabaseService] Loaded messages count:', data?.length || 0);
      return (data || []) as EventMessage[];
    } catch (error) {
      console.error('❌ [SupabaseService] Unexpected error fetching event messages:', error);
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
   * Check if a user is a participant of an event
   */
  async isParticipant(eventId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking event participation:', error);
      return false;
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
