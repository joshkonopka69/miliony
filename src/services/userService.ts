import { supabase, User as SupabaseUser } from './supabase';
import { supabaseService } from './supabase';

// Extended user types for comprehensive user management
export interface UserProfile extends SupabaseUser {
  bio?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phone?: string;
  date_of_birth?: string;
  timezone?: string;
  language?: string;
  is_verified?: boolean;
  is_public?: boolean;
  last_active?: string;
  total_events_created?: number;
  total_events_joined?: number;
  total_friends?: number;
  rating?: number;
  badges?: string[];
}

export interface UserPreferences {
  id: string;
  user_id: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    friend_requests: boolean;
    event_invites: boolean;
    event_reminders: boolean;
    event_updates: boolean;
    social_activity: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'friends' | 'private';
    show_location: boolean;
    show_activity: boolean;
    show_friends: boolean;
    allow_friend_requests: boolean;
    allow_event_invites: boolean;
    show_online_status: boolean;
  };
  location: {
    share_location: boolean;
    location_accuracy: 'exact' | 'approximate' | 'city' | 'none';
    auto_update_location: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'login' | 'logout' | 'event_created' | 'event_joined' | 'event_left' | 'friend_added' | 'profile_updated' | 'location_updated';
  activity_data?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface UserSearchFilters {
  query?: string;
  sports?: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in km
  };
  age_range?: {
    min: number;
    max: number;
  };
  gender?: string[];
  is_online?: boolean;
  has_events?: boolean;
  limit?: number;
  offset?: number;
}

export interface UserStats {
  total_events_created: number;
  total_events_joined: number;
  total_friends: number;
  total_events_attended: number;
  average_rating: number;
  badges_earned: number;
  days_active: number;
  favorite_sport: string;
  most_active_time: string;
  longest_streak: number;
}

export interface CreateUserProfileData {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phone?: string;
  date_of_birth?: string;
  timezone?: string;
  language?: string;
  favorite_sports: string[];
  location_latitude?: number;
  location_longitude?: number;
  is_public?: boolean;
}

export interface UpdateUserProfileData {
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phone?: string;
  date_of_birth?: string;
  timezone?: string;
  language?: string;
  favorite_sports?: string[];
  location_latitude?: number;
  location_longitude?: number;
  is_public?: boolean;
}

class UserService {
  // User Profile Operations
  
  async createUserProfile(userData: CreateUserProfileData): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          total_events_created: 0,
          total_events_joined: 0,
          total_friends: 0,
          rating: 0,
          badges: [],
          is_verified: false,
          last_active: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      // Create default preferences
      await this.createDefaultPreferences(userData.id);

      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      // Transform the data to match UserProfile interface
      return {
        id: data.id,
        email: data.email || '',
        display_name: data.full_name || data.username || 'Unknown User',
        avatar_url: data.avatar_url,
        friends: data.friends || [],
        favorite_sports: data.favorite_sports || [],
        location_latitude: data.location_latitude,
        location_longitude: data.location_longitude,
        created_at: data.created_at,
        updated_at: data.updated_at || data.created_at
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: UpdateUserProfileData): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  async deleteUserProfile(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting user profile:', error);
      return false;
    }
  }

  // User Search and Discovery

  async searchUsers(filters: UserSearchFilters): Promise<UserProfile[]> {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true);

      if (filters.query) {
        query = query.or(`display_name.ilike.%${filters.query}%,bio.ilike.%${filters.query}%`);
      }

      if (filters.sports && filters.sports.length > 0) {
        query = query.overlaps('favorite_sports', filters.sports);
      }

      if (filters.location) {
        // Use the custom function for location-based search
        const { data, error } = await supabase.rpc('get_users_near_location', {
          user_lat: filters.location.latitude,
          user_lng: filters.location.longitude,
          radius_km: filters.location.radius,
        });

        if (error) {
          console.error('Error searching users by location:', error);
          return [];
        }

        return data || [];
      }

      if (filters.age_range) {
        query = query
          .gte('age', filters.age_range.min)
          .lte('age', filters.age_range.max);
      }

      if (filters.gender && filters.gender.length > 0) {
        query = query.in('gender', filters.gender);
      }

      if (filters.is_online) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        query = query.gte('last_active', oneHourAgo);
      }

      if (filters.has_events) {
        query = query.gt('total_events_created', 0);
      }

      query = query
        .order('last_active', { ascending: false })
        .limit(filters.limit || 20)
        .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20) - 1);

      const { data, error } = await query;

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  // User Preferences

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating user preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return null;
    }
  }

  async createDefaultPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const defaultPreferences: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        notifications: {
          email: true,
          push: true,
          sms: false,
          friend_requests: true,
          event_invites: true,
          event_reminders: true,
          event_updates: true,
          social_activity: true,
        },
        privacy: {
          profile_visibility: 'public',
          show_location: true,
          show_activity: true,
          show_friends: true,
          allow_friend_requests: true,
          allow_event_invites: true,
          show_online_status: true,
        },
        location: {
          share_location: true,
          location_accuracy: 'approximate',
          auto_update_location: false,
        },
      };

      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          ...defaultPreferences,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating default preferences:', error);
      return null;
    }
  }

  // User Activity Tracking

  async logUserActivity(userId: string, activityType: UserActivity['activity_type'], activityData?: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          activity_data: activityData,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error logging user activity:', error);
        return false;
      }

      // Update user's last active timestamp
      await this.updateUserProfile(userId, {
        last_active: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Error logging user activity:', error);
      return false;
    }
  }

  async getUserActivity(userId: string, limit: number = 50): Promise<UserActivity[]> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user activity:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  }

  // User Statistics

  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const user = await this.getUserProfile(userId);
      if (!user) return null;

      // Get events created by user
      const { data: eventsCreated } = await supabase
        .from('events')
        .select('id')
        .eq('created_by', userId);

      // Get events joined by user
      const { data: eventsJoined } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', userId);

      // Get friends count
      const { data: friends } = await supabase
        .from('friendships')
        .select('id')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');

      const stats: UserStats = {
        total_events_created: eventsCreated?.length || 0,
        total_events_joined: eventsJoined?.length || 0,
        total_friends: friends?.length || 0,
        total_events_attended: eventsJoined?.length || 0,
        average_rating: user.rating || 0,
        badges_earned: user.badges?.length || 0,
        days_active: this.calculateDaysActive(user.created_at),
        favorite_sport: user.favorite_sports?.[0] || 'Unknown',
        most_active_time: this.calculateMostActiveTime(userId),
        longest_streak: this.calculateLongestStreak(userId),
      };

      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }

  // Profile Picture Management

  async uploadProfilePicture(userId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading profile picture:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile with new avatar URL
      await this.updateUserProfile(userId, {
        avatar_url: urlData.publicUrl,
      });

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return null;
    }
  }

  async deleteProfilePicture(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserProfile(userId);
      if (!user?.avatar_url) return true;

      // Extract file path from URL
      const urlParts = user.avatar_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `profile-pictures/${fileName}`;

      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting profile picture:', error);
        return false;
      }

      // Update user profile to remove avatar URL
      await this.updateUserProfile(userId, {
        avatar_url: null,
      });

      return true;
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      return false;
    }
  }

  // Helper Methods

  private calculateDaysActive(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private async calculateMostActiveTime(userId: string): Promise<string> {
    // This would require more complex analytics
    // For now, return a placeholder
    return 'Evening';
  }

  private async calculateLongestStreak(userId: string): Promise<number> {
    // This would require more complex analytics
    // For now, return a placeholder
    return 7;
  }

  // User Verification

  async verifyUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', userId);

      if (error) {
        console.error('Error verifying user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verifying user:', error);
      return false;
    }
  }

  // User Blocking and Reporting

  async blockUser(userId: string, blockedUserId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_blocks')
        .insert({
          user_id: userId,
          blocked_user_id: blockedUserId,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error blocking user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      return false;
    }
  }

  async unblockUser(userId: string, blockedUserId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('user_id', userId)
        .eq('blocked_user_id', blockedUserId);

      if (error) {
        console.error('Error unblocking user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      return false;
    }
  }

  async reportUser(userId: string, reportedUserId: string, reason: string, description?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: userId,
          reported_user_id: reportedUserId,
          reason,
          description,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error reporting user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error reporting user:', error);
      return false;
    }
  }

  async getBlockedUsers(userId: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_blocks')
        .select(`
          blocked_user_id,
          users!user_blocks_blocked_user_id_fkey(*)
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching blocked users:', error);
        return [];
      }

      return data?.map(item => item.users) || [];
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      return [];
    }
  }
}

// Create and export singleton instance
export const userService = new UserService();
export default userService;
