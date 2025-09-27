import { supabase } from './supabase';
import { UserProfile } from './userService';

// Friend relationship types
export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  updated_at: string;
  accepted_at?: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
}

export interface FriendSuggestion {
  user: UserProfile;
  mutual_friends: number;
  common_sports: string[];
  distance?: number;
  reason: string;
}

export interface FriendActivity {
  id: string;
  user_id: string;
  activity_type: 'friend_request_sent' | 'friend_request_accepted' | 'friend_request_declined' | 'friend_removed';
  target_user_id: string;
  created_at: string;
}

export interface FriendSearchFilters {
  query?: string;
  mutual_friends?: string[];
  common_sports?: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in km
  };
  online_only?: boolean;
  limit?: number;
  offset?: number;
}

class FriendService {
  // Friend Request Operations

  async sendFriendRequest(senderId: string, receiverId: string, message?: string): Promise<boolean> {
    try {
      // Check if friendship already exists
      const existingFriendship = await this.getFriendship(senderId, receiverId);
      if (existingFriendship) {
        console.error('Friendship already exists');
        return false;
      }

      // Check if user is blocked
      const isBlocked = await this.isUserBlocked(senderId, receiverId);
      if (isBlocked) {
        console.error('Cannot send friend request to blocked user');
        return false;
      }

      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          message,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error sending friend request:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      return false;
    }
  }

  async acceptFriendRequest(requestId: string): Promise<boolean> {
    try {
      // Get the friend request
      const { data: request, error: fetchError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError || !request) {
        console.error('Error fetching friend request:', fetchError);
        return false;
      }

      // Update the friend request status
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating friend request:', updateError);
        return false;
      }

      // Create friendship record
      const { error: friendshipError } = await supabase
        .from('friendships')
        .insert({
          user_id: request.sender_id,
          friend_id: request.receiver_id,
          status: 'accepted',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          accepted_at: new Date().toISOString(),
        });

      if (friendshipError) {
        console.error('Error creating friendship:', friendshipError);
        return false;
      }

      // Create reverse friendship record
      const { error: reverseFriendshipError } = await supabase
        .from('friendships')
        .insert({
          user_id: request.receiver_id,
          friend_id: request.sender_id,
          status: 'accepted',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          accepted_at: new Date().toISOString(),
        });

      if (reverseFriendshipError) {
        console.error('Error creating reverse friendship:', reverseFriendshipError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return false;
    }
  }

  async declineFriendRequest(requestId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({
          status: 'declined',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error declining friend request:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error declining friend request:', error);
      return false;
    }
  }

  async cancelFriendRequest(requestId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .delete()
        .eq('id', requestId);

      if (error) {
        console.error('Error canceling friend request:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error canceling friend request:', error);
      return false;
    }
  }

  // Friend Management

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      // Delete both friendship records
      const { error: deleteError1 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', friendId);

      const { error: deleteError2 } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', friendId)
        .eq('friend_id', userId);

      if (deleteError1 || deleteError2) {
        console.error('Error removing friend:', deleteError1 || deleteError2);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      return false;
    }
  }

  async getFriends(userId: string, limit: number = 50, offset: number = 0): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          friend_id,
          users!friendships_friend_id_fkey(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .order('accepted_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching friends:', error);
        return [];
      }

      return data?.map(item => item.users) || [];
    } catch (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
  }

  async getFriendRequests(userId: string, type: 'sent' | 'received'): Promise<FriendRequest[]> {
    try {
      const column = type === 'sent' ? 'sender_id' : 'receiver_id';
      
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender:users!friend_requests_sender_id_fkey(*),
          receiver:users!friend_requests_receiver_id_fkey(*)
        `)
        .eq(column, userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching friend requests:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      return [];
    }
  }

  async getFriendship(userId: string, friendId: string): Promise<Friendship | null> {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', userId)
        .eq('friend_id', friendId)
        .single();

      if (error) {
        console.error('Error fetching friendship:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching friendship:', error);
      return null;
    }
  }

  async isFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      const friendship = await this.getFriendship(userId, friendId);
      return friendship?.status === 'accepted' || false;
    } catch (error) {
      console.error('Error checking friendship:', error);
      return false;
    }
  }

  // Friend Suggestions

  async getFriendSuggestions(userId: string, limit: number = 10): Promise<FriendSuggestion[]> {
    try {
      // Get user's current friends
      const friends = await this.getFriends(userId, 100);
      const friendIds = friends.map(f => f.id);

      // Get user's profile
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!userProfile) return [];

      // Get mutual friends and common sports
      const { data: suggestions, error } = await supabase
        .from('users')
        .select(`
          *,
          friendships!friendships_friend_id_fkey(
            friend_id,
            users!friendships_user_id_fkey(*)
          )
        `)
        .neq('id', userId)
        .not('id', 'in', `(${friendIds.join(',')})`)
        .eq('is_public', true)
        .limit(limit * 2); // Get more to filter

      if (error) {
        console.error('Error fetching friend suggestions:', error);
        return [];
      }

      // Process suggestions
      const processedSuggestions: FriendSuggestion[] = suggestions?.map(suggestion => {
        const mutualFriends = suggestion.friendships?.filter(f => 
          friendIds.includes(f.users?.id)
        ).length || 0;

        const commonSports = suggestion.favorite_sports?.filter(sport => 
          userProfile.favorite_sports?.includes(sport)
        ) || [];

        return {
          user: suggestion,
          mutual_friends: mutualFriends,
          common_sports: commonSports,
          reason: this.generateSuggestionReason(mutualFriends, commonSports.length),
        };
      }) || [];

      // Sort by mutual friends and common sports, then limit
      return processedSuggestions
        .sort((a, b) => {
          if (a.mutual_friends !== b.mutual_friends) {
            return b.mutual_friends - a.mutual_friends;
          }
          return b.common_sports.length - a.common_sports.length;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting friend suggestions:', error);
      return [];
    }
  }

  // Friend Search

  async searchFriends(userId: string, filters: FriendSearchFilters): Promise<UserProfile[]> {
    try {
      // Get user's friends
      const friends = await this.getFriends(userId, 1000);
      const friendIds = friends.map(f => f.id);

      let query = supabase
        .from('users')
        .select('*')
        .in('id', friendIds);

      if (filters.query) {
        query = query.or(`display_name.ilike.%${filters.query}%,bio.ilike.%${filters.query}%`);
      }

      if (filters.common_sports && filters.common_sports.length > 0) {
        query = query.overlaps('favorite_sports', filters.common_sports);
      }

      if (filters.online_only) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        query = query.gte('last_active', oneHourAgo);
      }

      query = query
        .order('last_active', { ascending: false })
        .limit(filters.limit || 20)
        .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20) - 1);

      const { data, error } = await query;

      if (error) {
        console.error('Error searching friends:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching friends:', error);
      return [];
    }
  }

  // Friend Activity

  async getFriendActivity(userId: string, limit: number = 20): Promise<FriendActivity[]> {
    try {
      // Get user's friends
      const friends = await this.getFriends(userId, 100);
      const friendIds = friends.map(f => f.id);

      if (friendIds.length === 0) return [];

      const { data, error } = await supabase
        .from('friend_activities')
        .select('*')
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching friend activity:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching friend activity:', error);
      return [];
    }
  }

  async logFriendActivity(userId: string, activityType: FriendActivity['activity_type'], targetUserId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friend_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          target_user_id: targetUserId,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error logging friend activity:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error logging friend activity:', error);
      return false;
    }
  }

  // Friend Statistics

  async getFriendStats(userId: string): Promise<{
    total_friends: number;
    pending_requests: number;
    sent_requests: number;
    mutual_friends: { [friendId: string]: number };
  }> {
    try {
      const [friends, pendingRequests, sentRequests] = await Promise.all([
        this.getFriends(userId, 1000),
        this.getFriendRequests(userId, 'received'),
        this.getFriendRequests(userId, 'sent'),
      ]);

      // Calculate mutual friends for each friend
      const mutualFriends: { [friendId: string]: number } = {};
      for (const friend of friends) {
        const friendFriends = await this.getFriends(friend.id, 1000);
        const mutualCount = friendFriends.filter(f => 
          friends.some(userFriend => userFriend.id === f.id)
        ).length;
        mutualFriends[friend.id] = mutualCount;
      }

      return {
        total_friends: friends.length,
        pending_requests: pendingRequests.length,
        sent_requests: sentRequests.length,
        mutual_friends: mutualFriends,
      };
    } catch (error) {
      console.error('Error getting friend stats:', error);
      return {
        total_friends: 0,
        pending_requests: 0,
        sent_requests: 0,
        mutual_friends: {},
      };
    }
  }

  // Helper Methods

  private generateSuggestionReason(mutualFriends: number, commonSports: number): string {
    if (mutualFriends > 0 && commonSports > 0) {
      return `You have ${mutualFriends} mutual friends and ${commonSports} common sports`;
    } else if (mutualFriends > 0) {
      return `You have ${mutualFriends} mutual friends`;
    } else if (commonSports > 0) {
      return `You both enjoy ${commonSports} sports`;
    } else {
      return 'Suggested based on your activity';
    }
  }

  private async isUserBlocked(userId: string, targetUserId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_blocks')
        .select('id')
        .or(`user_id.eq.${userId}.and.blocked_user_id.eq.${targetUserId},user_id.eq.${targetUserId}.and.blocked_user_id.eq.${userId}`)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking if user is blocked:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false;
    }
  }

  // Friend Recommendations

  async getFriendRecommendations(userId: string, limit: number = 5): Promise<FriendSuggestion[]> {
    try {
      const suggestions = await this.getFriendSuggestions(userId, limit * 2);
      
      // Filter out users who have pending requests
      const pendingRequests = await this.getFriendRequests(userId, 'sent');
      const pendingIds = pendingRequests.map(r => r.receiver_id);
      
      return suggestions
        .filter(s => !pendingIds.includes(s.user.id))
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting friend recommendations:', error);
      return [];
    }
  }

  // Friend Groups (for future implementation)

  async createFriendGroup(userId: string, name: string, friendIds: string[]): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('friend_groups')
        .insert({
          user_id: userId,
          name,
          friend_ids: friendIds,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating friend group:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error creating friend group:', error);
      return null;
    }
  }
}

// Create and export singleton instance
export const friendService = new FriendService();
export default friendService;
