/**
 * Firestore Service Stub
 * 
 * This is a compatibility layer that replaces Firebase Firestore
 * with Supabase. It maintains the same API interface to prevent
 * breaking changes in the application.
 */

import { supabase } from '../config/supabase';
import { enhancedEventService, Event } from './enhancedEventService';

class FirestoreService {
  /**
   * Delete an event
   * Delegates to enhancedEventService.deleteEvent
   */
  async deleteEvent(eventId: string, userId: string): Promise<void> {
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.id !== userId) {
      throw new Error('Not authorized to delete this event');
    }

    const result = await enhancedEventService.deleteEvent(eventId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete event');
    }
  }

  /**
   * Get events by place ID
   * Returns events that were created at a specific place
   */
  async getEventsByPlace(placeId: string): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creator:users!events_created_by_fkey(display_name, avatar_url),
          participants:event_participants(user_id)
        `)
        .eq('place_id', placeId)
        .in('status', ['live', 'active', 'upcoming'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[FirestoreService] Error fetching events by place:', error);
        return [];
      }

      // Transform data to match Event interface
      return (data || []).map(event => ({
        ...event,
        participants: event.participants?.map((p: any) => p.user_id) || [],
        creator_name: event.creator?.display_name,
        creator_avatar: event.creator?.avatar_url,
      }));
    } catch (error) {
      console.error('[FirestoreService] Error in getEventsByPlace:', error);
      return [];
    }
  }

  /**
   * Get event by ID
   * Delegates to enhancedEventService.getEventById
   */
  async getEvent(eventId: string): Promise<Event | null> {
    return enhancedEventService.getEventById(eventId);
  }

  /**
   * Get all events in bounds
   * Delegates to enhancedEventService.getEvents
   */
  async getEvents(bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<Event[]> {
    return enhancedEventService.getEvents({ bounds });
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService();
