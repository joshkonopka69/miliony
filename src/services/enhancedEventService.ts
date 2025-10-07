import { supabase } from './supabase';
import { authService } from './authService';
import { realtimeEventService } from './realtimeEventService';
import { notificationService } from './notificationService';

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
  creator_name?: string;
  creator_avatar?: string;
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

export interface EventFilters {
  activities?: string[];
  timeFilter?: 'all' | 'now' | 'today' | 'tomorrow' | 'this_week';
  distance?: number;
  skillLevel?: 'all' | 'beginner' | 'intermediate' | 'advanced';
  maxParticipants?: number;
  showFullEvents?: boolean;
  showLiveOnly?: boolean;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

class EnhancedEventService {
  // Create event with real-time updates
  async createEvent(eventData: CreateEventData): Promise<{ success: boolean; event?: Event; error?: string }> {
    try {
      const userId = authService.getUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      // Create event
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: userId,
          participants_count: 1,
          status: 'live',
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Add creator as participant
      await supabase
        .from('event_participants')
        .insert({
          event_id: data.id,
          user_id: userId,
          joined_at: new Date().toISOString(),
        });

      // Schedule reminder if start_time is set
      if (eventData.start_time) {
        const reminderTime = new Date(eventData.start_time);
        reminderTime.setMinutes(reminderTime.getMinutes() - 30); // 30 minutes before
        await notificationService.scheduleEventReminder(data.id, data.name, reminderTime);
      }

      // Send real-time update
      await realtimeEventService.sendEventNotification(
        data.id,
        'event_created',
        { event: data }
      );

      return { success: true, event: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get events with filters
  async getEvents(filters: EventFilters = {}): Promise<Event[]> {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .eq('status', 'active');

      // Apply filters
      if (filters.activities && filters.activities.length > 0) {
        query = query.in('activity', filters.activities);
      }

      if (filters.showLiveOnly) {
        query = query.eq('status', 'live');
      }

      if (filters.maxParticipants) {
        query = query.lte('max_participants', filters.maxParticipants);
      }

      if (filters.bounds) {
        query = query
          .gte('latitude', filters.bounds.south)
          .lte('latitude', filters.bounds.north)
          .gte('longitude', filters.bounds.west)
          .lte('longitude', filters.bounds.east);
      }

      // Time filters
      if (filters.timeFilter === 'now') {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        query = query
          .gte('start_time', now.toISOString())
          .lte('start_time', oneHourFromNow.toISOString());
      } else if (filters.timeFilter === 'today') {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        query = query
          .gte('start_time', today.toISOString())
          .lt('start_time', tomorrow.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      // Transform data
      let events = data.map(event => ({
        ...event,
        participants: event.participants?.map((p: any) => p.user_id) || [],
        creator_name: event.creator?.display_name,
        creator_avatar: event.creator?.avatar_url,
      }));

      // Filter out full events if needed
      if (!filters.showFullEvents) {
        events = events.filter(event => event.participants_count < event.max_participants);
      }

      return events;
    } catch (error) {
      console.error('Error in getEvents:', error);
      return [];
    }
  }

  // Join event with real-time updates
  async joinEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = authService.getUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if already joined
      const { data: existingParticipant } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (existingParticipant) {
        return { success: false, error: 'Already joined this event' };
      }

      // Join event
      const { data, error } = await supabase.rpc('join_event', {
        event_uuid: eventId,
        user_uuid: userId,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Send real-time update
      await realtimeEventService.sendEventNotification(
        eventId,
        'participant_joined',
        { userId, eventId }
      );

      // Send notification to event participants
      const { data: event } = await supabase
        .from('events')
        .select('name, created_by')
        .eq('id', eventId)
        .single();

      if (event) {
        await notificationService.sendEventNotification(
          eventId,
          {
            title: 'New Participant',
            body: `Someone joined ${event.name}`,
            type: 'participant_joined',
            data: { eventId, userId },
          },
          userId // Exclude the person who joined
        );
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Leave event with real-time updates
  async leaveEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = authService.getUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase.rpc('leave_event', {
        event_uuid: eventId,
        user_uuid: userId,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Send real-time update
      await realtimeEventService.sendEventNotification(
        eventId,
        'participant_left',
        { userId, eventId }
      );

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Subscribe to event updates
  subscribeToEventUpdates(
    eventId: string,
    onUpdate: (update: any) => void
  ): () => void {
    return realtimeEventService.subscribeToEvent(eventId, onUpdate);
  }

  // Subscribe to area events
  subscribeToAreaEvents(
    bounds: { north: number; south: number; east: number; west: number },
    onUpdate: (update: any) => void
  ): () => void {
    return realtimeEventService.subscribeToAreaEvents(bounds, onUpdate);
  }

  // Subscribe to user events
  subscribeToUserEvents(onUpdate: (update: any) => void): () => void {
    const userId = authService.getUserId();
    if (!userId) return () => {};
    
    return realtimeEventService.subscribeToUserEvents(userId, onUpdate);
  }

  // Get event by ID
  async getEventById(eventId: string): Promise<Event | null> {
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
  async updateEvent(
    eventId: string,
    updates: Partial<CreateEventData>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = authService.getUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if user is the creator
      const { data: event } = await supabase
        .from('events')
        .select('created_by')
        .eq('id', eventId)
        .single();

      if (!event || event.created_by !== userId) {
        return { success: false, error: 'Not authorized to update this event' };
      }

      const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Send real-time update
      await realtimeEventService.sendEventNotification(
        eventId,
        'event_updated',
        { eventId, updates }
      );

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Cancel event
  async cancelEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userId = authService.getUserId();
      if (!userId) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if user is the creator
      const { data: event } = await supabase
        .from('events')
        .select('created_by, name')
        .eq('id', eventId)
        .single();

      if (!event || event.created_by !== userId) {
        return { success: false, error: 'Not authorized to cancel this event' };
      }

      const { error } = await supabase
        .from('events')
        .update({ status: 'cancelled' })
        .eq('id', eventId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Cancel reminder
      await notificationService.cancelEventReminder(eventId);

      // Send real-time update
      await realtimeEventService.sendEventNotification(
        eventId,
        'event_cancelled',
        { eventId }
      );

      // Send notification to participants
      await notificationService.sendEventNotification(
        eventId,
        {
          title: 'Event Cancelled',
          body: `${event.name} has been cancelled`,
          type: 'event_cancelled',
          data: { eventId },
        }
      );

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const enhancedEventService = new EnhancedEventService();



