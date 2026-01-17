import { supabase } from '../config/supabase';
import { UserProfile } from './userService';
import { notificationService } from './notificationService';

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
      console.log(`[FriendService] sendFriendRequest: ${senderId} -> ${receiverId}`);

      // Check if already ACCEPTED friends (ignore pending/declined)
      const existingFriendship = await this.getFriendship(senderId, receiverId);
      if (existingFriendship && existingFriendship.status === 'accepted') {
        console.error('[FriendService] Already friends');
        return false;
      }

      // Delete any old declined/cancelled friend_requests so we can insert a new one
      // (UNIQUE constraint on sender_id, receiver_id)
      console.log('[FriendService] Deleting old declined/cancelled requests...');
      await supabase
        .from('friend_requests')
        .delete()
        .eq('sender_id', senderId)
        .eq('receiver_id', receiverId)
        .in('status', ['declined', 'cancelled']);

      // Check if user is blocked
      const isBlocked = await this.isUserBlocked(senderId, receiverId);
      if (isBlocked) {
        console.error('[FriendService] Cannot send friend request to blocked user');
        return false;
      }

      console.log('[FriendService] Inserting into friend_requests table...');
      const { data, error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          message,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('[FriendService] INSERT ERROR:', error.code, error.message, error.details);
        return false;
      }

      console.log('[FriendService] INSERT SUCCESS, request ID:', data?.id);

      const { data: senderProfile } = await supabase
        .from('public_profiles')
        .select('display_name')
        .eq('id', senderId)
        .single();

      await notificationService.sendFriendRequestNotification(
        receiverId,
        senderProfile?.display_name || 'Someone',
        senderId
      );

      return true;
    } catch (error) {
      console.error('[FriendService] sendFriendRequest EXCEPTION:', error);
      return false;
    }
  }

  /**
   * Get the ID of a pending friend request sent from senderId to receiverId.
   * Useful for cancelling a pending request.
   */
  async getPendingRequestIdToUser(senderId: string, receiverId: string): Promise<string | null> {
    try {
      console.log(`[FriendService] getPendingRequestIdToUser: sender=${senderId}, receiver=${receiverId}`);

      const { data, error } = await supabase
        .from('friend_requests')
        .select('id')
        .eq('sender_id', senderId)
        .eq('receiver_id', receiverId)
        .eq('status', 'pending')
        .maybeSingle();

      if (error) {
        console.error('[FriendService] getPendingRequestIdToUser ERROR:', error.code, error.message);
        return null;
      }

      console.log(`[FriendService] getPendingRequestIdToUser result:`, data?.id || 'null');
      return data?.id || null;
    } catch (error) {
      console.error('[FriendService] getPendingRequestIdToUser EXCEPTION:', error);
      return null;
    }
  }

  /**
   * Get the ID of a pending friend request received BY receiverId FROM senderId.
   * Useful for accepting/declining a pending request.
   */
  async getReceivedRequestIdFromUser(receiverId: string, senderId: string): Promise<string | null> {
    try {
      console.log(`[FriendService] getReceivedRequestIdFromUser: receiver=${receiverId}, sender=${senderId}`);

      const { data, error } = await supabase
        .from('friend_requests')
        .select('id')
        .eq('sender_id', senderId)
        .eq('receiver_id', receiverId)
        .eq('status', 'pending')
        .maybeSingle();

      if (error) {
        console.error('[FriendService] getReceivedRequestIdFromUser ERROR:', error.code, error.message);
        return null;
      }

      console.log(`[FriendService] getReceivedRequestIdFromUser result:`, data?.id || 'null');
      return data?.id || null;
    } catch (error) {
      console.error('[FriendService] getReceivedRequestIdFromUser EXCEPTION:', error);
      return null;
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
        .from('user_friendships')
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
        .from('user_friendships')
        .insert({
          user_id: request.receiver_id,
          friend_id: request.sender_id,
          status: 'accepted',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          accepted_at: new Date().toISOString(),
        });

      // Notify the original sender
      try {
        const { data: acceptor } = await supabase
          .from('public_profiles')
          .select('display_name')
          .eq('id', request.receiver_id)
          .single();

        if (acceptor) {
          await notificationService.sendFriendRequestAcceptedNotification(
            request.sender_id,
            acceptor.display_name,
            request.receiver_id
          );
        }
      } catch (notifyError) {
        console.error('Error sending friend request accepted notification:', notifyError);
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
        .from('user_friendships')
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', friendId);

      const { error: deleteError2 } = await supabase
        .from('user_friendships')
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

  async blockUser(userId: string, targetUserId: string): Promise<boolean> {
    try {
      // Create block record
      const { error } = await supabase
        .from('user_blocks')
        .insert({
          user_id: userId,
          blocked_user_id: targetUserId,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error blocking user:', error);
        return false;
      }

      // If they are friends, remove the friendship
      await this.removeFriend(userId, targetUserId);

      // If there's a pending request, remove it
      const { data: request } = await supabase
        .from('friend_requests')
        .select('id')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${userId})`)
        .maybeSingle();

      if (request) {
        await this.cancelFriendRequest(request.id);
      }

      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      return false;
    }
  }

  async getFriends(userId: string, limit: number = 50, offset: number = 0): Promise<UserProfile[]> {
    try {
      // 1. Get friend IDs from friendships table
      const { data: friendships, error } = await supabase
        .from('user_friendships')
        .select('friend_id, accepted_at')
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .order('accepted_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching friends:', error);
        return [];
      }

      if (!friendships || friendships.length === 0) {
        return [];
      }

      const friendIds = friendships.map(f => f.friend_id);

      // 2. Fetch public profiles for these friends
      const { data: profiles, error: profilesError } = await supabase
        .from('public_profiles') // Use VIEW
        .select('*')
        .in('id', friendIds);

      if (profilesError) {
        console.error('Error fetching friend profiles:', profilesError);
        return [];
      }

      return (profiles || []) as UserProfile[];
    } catch (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
  }

  async getFriendRequests(userId: string, type: 'sent' | 'received'): Promise<FriendRequest[]> {
    try {
      const column = type === 'sent' ? 'sender_id' : 'receiver_id';
      const otherColumn = type === 'sent' ? 'receiver_id' : 'sender_id';

      console.log(`[FriendService] Fetching ${type} requests for user: ${userId}`);

      // 1. Fetch requests
      const { data: requests, error } = await supabase
        .from('friend_requests')
        .select('*')
        .eq(column, userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`[FriendService] Error fetching ${type} friend requests:`, error);
        return [];
      }

      if (!requests || requests.length === 0) {
        console.log(`[FriendService] Found 0 ${type} requests`);
        return [];
      }

      // 2. Collect IDs to fetch profiles
      const userIdsToFetch = requests.map(r => r[otherColumn]);

      // 3. Fetch public profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('public_profiles')
        .select('*')
        .in('id', userIdsToFetch);

      if (profilesError) {
        console.error('Error fetching profiles for requests:', profilesError);
        return requests as any; // Return requests without profiles if profile fetch fails
      }

      const profilesMap = new Map(profiles?.map(p => [p.id, p]));

      // 4. Attach profiles to requests
      const enrichedRequests = requests.map(req => ({
        ...req,
        sender: type === 'received' ? profilesMap.get(req.sender_id) : undefined, // If I received, I need sender profile
        receiver: type === 'sent' ? profilesMap.get(req.receiver_id) : undefined, // If I sent, I need receiver profile
      }));

      console.log(`[FriendService] Found ${enrichedRequests.length} ${type} requests`);
      return enrichedRequests as FriendRequest[];
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      return [];
    }
  }

  async getFriendship(userId: string, friendId: string): Promise<Friendship | null> {
    try {
      const { data, error } = await supabase
        .from('user_friendships')
        .select('*')
        .eq('user_id', userId)
        .eq('friend_id', friendId)
        .maybeSingle(); // Use maybeSingle to avoid PGRST116 when no rows found

      if (error) {
        // Only log if it's not a "no rows" error
        if (error.code !== 'PGRST116') {
          console.error('Error fetching friendship:', error);
        }
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
      // We cannot join on friendships easily with public_profiles view without setup
      // So we will fetch candidates from public_profiles first
      const { data: suggestions, error } = await supabase
        .from('public_profiles')
        .select('*')
        .neq('id', userId)
        .not('id', 'in', `(${friendIds.join(',')})`)
        // .eq('is_public', true) // View handles this
        .limit(limit * 2);

      // Note: fetching mutual friends count efficiently without join is hard
      // For now we might skip deep mutual friend counting in this simple version
      // or do it per user if list is small.

      if (error) {
        console.error('Error fetching friend suggestions:', error);
        return [];
      }

      // Process suggestions
      const processedSuggestions: FriendSuggestion[] = suggestions?.map((suggestion: any) => {
        const mutualFriends = suggestion.friendships?.filter((f: any) =>
          friendIds.includes(f.users?.id)
        ).length || 0;

        const commonSports = suggestion.favorite_sports?.filter((sport: string) =>
          userProfile.favorite_sports?.includes(sport)
        ) || [];

        return {
          user: suggestion as UserProfile,
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
        .from('public_profiles')
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

      // Calculate mutual friends (placeholder replaced with actual counts if available)
      const mutualFriends: { [friendId: string]: number } = {};
      for (const friend of friends) {
        const mutualCount = await this.getMutualFriendsCount(userId, friend.id);
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

  async getMutualFriendsCount(userId: string, targetUserId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_mutual_friends_count', {
          user_id_1: userId,
          user_id_2: targetUserId
        });

      if (error) {
        // Fallback to manual calculation if RPC is missing
        const [friends1, friends2] = await Promise.all([
          this.getFriends(userId, 1000),
          this.getFriends(targetUserId, 1000)
        ]);

        const friendIds1 = new Set(friends1.map(f => f.id));
        return friends2.filter(f => friendIds1.has(f.id)).length;
      }

      return data || 0;
    } catch (error) {
      console.error('Error fetching mutual friends count:', error);
      return 0;
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
    // user_blocks table doesn't exist yet - always return false
    // TODO: Create user_blocks table if blocking functionality is needed
    return false;
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

  /**
   * OPTIMIZED: Get friend request status for multiple users in a single query
   * This replaces 2 separate API calls per user with 1 batch call
   */
  async getBatchFriendRequestStatus(
    currentUserId: string,
    userIds: string[]
  ): Promise<Map<string, { sentRequestId: string | null; receivedRequestId: string | null }>> {
    const result = new Map<string, { sentRequestId: string | null; receivedRequestId: string | null }>();

    // Initialize all users with null values
    userIds.forEach(userId => {
      result.set(userId, { sentRequestId: null, receivedRequestId: null });
    });

    if (userIds.length === 0) return result;

    try {
      // Get all pending requests involving current user and any of the target users
      const { data, error } = await supabase
        .from('friend_requests')
        .select('id, sender_id, receiver_id')
        .eq('status', 'pending')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

      if (error) {
        console.error('Error fetching batch friend requests:', error);
        return result;
      }

      if (data) {
        for (const request of data) {
          // I sent to them
          if (request.sender_id === currentUserId && userIds.includes(request.receiver_id)) {
            const existing = result.get(request.receiver_id) || { sentRequestId: null, receivedRequestId: null };
            existing.sentRequestId = request.id;
            result.set(request.receiver_id, existing);
          }
          // They sent to me
          if (request.receiver_id === currentUserId && userIds.includes(request.sender_id)) {
            const existing = result.get(request.sender_id) || { sentRequestId: null, receivedRequestId: null };
            existing.receivedRequestId = request.id;
            result.set(request.sender_id, existing);
          }
        }
      }
    } catch (error) {
      console.error('Error in getBatchFriendRequestStatus:', error);
    }

    return result;
  }
}

// Create and export singleton instance
export const friendService = new FriendService();
export default friendService;
