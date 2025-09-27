import { supabase } from './supabase';

// Group types and interfaces
export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  cover_url?: string;
  sport: string;
  location?: {
    name: string;
    latitude: number;
    longitude: number;
    radius: number; // in km
  };
  privacy: 'public' | 'private' | 'invite_only';
  member_limit?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count: number;
  is_active: boolean;
  tags: string[];
  rules?: string[];
  requirements?: {
    age_min?: number;
    age_max?: number;
    skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'any';
    gender_preference?: 'male' | 'female' | 'any';
  };
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  invited_by?: string;
  status: 'active' | 'pending' | 'banned' | 'left';
  permissions: {
    can_invite: boolean;
    can_create_events: boolean;
    can_moderate: boolean;
    can_edit_group: boolean;
  };
  user?: {
    id: string;
    display_name: string;
    avatar_url?: string;
    bio?: string;
    favorite_sports: string[];
  };
}

export interface GroupEvent {
  id: string;
  group_id: string;
  name: string;
  description?: string;
  sport: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  start_time: string;
  end_time?: string;
  max_participants?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  participant_count: number;
  is_recurring: boolean;
  recurrence_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    days_of_week?: number[];
    end_date?: string;
  };
}

export interface GroupSettings {
  id: string;
  group_id: string;
  allow_member_invites: boolean;
  require_approval: boolean;
  allow_anonymous_events: boolean;
  auto_approve_events: boolean;
  notification_settings: {
    new_members: boolean;
    new_events: boolean;
    event_reminders: boolean;
    group_updates: boolean;
  };
  chat_settings: {
    enabled: boolean;
    allow_media: boolean;
    allow_links: boolean;
    moderation_enabled: boolean;
  };
  privacy_settings: {
    show_members: boolean;
    show_events: boolean;
    allow_search: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface GroupInvitation {
  id: string;
  group_id: string;
  invited_user_id: string;
  invited_by: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at: string;
  group?: Group;
  inviter?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface GroupAnalytics {
  group_id: string;
  total_members: number;
  active_members: number;
  total_events: number;
  upcoming_events: number;
  total_messages: number;
  engagement_score: number;
  growth_rate: number;
  popular_sports: { sport: string; count: number }[];
  activity_by_day: { date: string; events: number; messages: number }[];
  member_retention: number;
  event_attendance_rate: number;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  sport: string;
  location?: {
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
  };
  privacy: 'public' | 'private' | 'invite_only';
  member_limit?: number;
  tags?: string[];
  rules?: string[];
  requirements?: {
    age_min?: number;
    age_max?: number;
    skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'any';
    gender_preference?: 'male' | 'female' | 'any';
  };
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  sport?: string;
  location?: {
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
  };
  privacy?: 'public' | 'private' | 'invite_only';
  member_limit?: number;
  tags?: string[];
  rules?: string[];
  requirements?: {
    age_min?: number;
    age_max?: number;
    skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'any';
    gender_preference?: 'male' | 'female' | 'any';
  };
  is_active?: boolean;
}

export interface GroupFilters {
  sport?: string;
  privacy?: 'public' | 'private' | 'invite_only';
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  tags?: string[];
  member_count_min?: number;
  member_count_max?: number;
  created_after?: string;
  is_active?: boolean;
}

class GroupService {
  // Create a new group
  async createGroup(groupData: CreateGroupData, creatorId: string): Promise<Group | null> {
    try {
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          ...groupData,
          created_by: creatorId,
          member_count: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (groupError) {
        console.error('Error creating group:', groupError);
        return null;
      }

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: creatorId,
          role: 'admin',
          joined_at: new Date().toISOString(),
          status: 'active',
          permissions: {
            can_invite: true,
            can_create_events: true,
            can_moderate: true,
            can_edit_group: true,
          },
        });

      if (memberError) {
        console.error('Error adding creator as member:', memberError);
        return null;
      }

      // Create default group settings
      const { error: settingsError } = await supabase
        .from('group_settings')
        .insert({
          group_id: group.id,
          allow_member_invites: true,
          require_approval: false,
          allow_anonymous_events: false,
          auto_approve_events: true,
          notification_settings: {
            new_members: true,
            new_events: true,
            event_reminders: true,
            group_updates: true,
          },
          chat_settings: {
            enabled: true,
            allow_media: true,
            allow_links: true,
            moderation_enabled: false,
          },
          privacy_settings: {
            show_members: true,
            show_events: true,
            allow_search: true,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (settingsError) {
        console.error('Error creating group settings:', settingsError);
      }

      return group;
    } catch (error) {
      console.error('Error creating group:', error);
      return null;
    }
  }

  // Get group by ID
  async getGroup(groupId: string): Promise<Group | null> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) {
        console.error('Error fetching group:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching group:', error);
      return null;
    }
  }

  // Update group
  async updateGroup(groupId: string, updates: UpdateGroupData): Promise<Group | null> {
    try {
      const { data, error } = await supabase
        .from('groups')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', groupId)
        .select()
        .single();

      if (error) {
        console.error('Error updating group:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating group:', error);
      return null;
    }
  }

  // Delete group
  async deleteGroup(groupId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) {
        console.error('Error deleting group:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      return false;
    }
  }

  // Search groups
  async searchGroups(filters: GroupFilters, limit: number = 20, offset: number = 0): Promise<Group[]> {
    try {
      let query = supabase
        .from('groups')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters.sport) {
        query = query.eq('sport', filters.sport);
      }

      if (filters.privacy) {
        query = query.eq('privacy', filters.privacy);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters.member_count_min) {
        query = query.gte('member_count', filters.member_count_min);
      }

      if (filters.member_count_max) {
        query = query.lte('member_count', filters.member_count_max);
      }

      if (filters.created_after) {
        query = query.gte('created_at', filters.created_after);
      }

      if (filters.location) {
        // This would need a more sophisticated location query
        // For now, we'll just return all groups and filter client-side
      }

      const { data, error } = await query
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error searching groups:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching groups:', error);
      return [];
    }
  }

  // Get user's groups
  async getUserGroups(userId: string): Promise<Group[]> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          groups (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching user groups:', error);
        return [];
      }

      return data?.map(item => item.groups).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching user groups:', error);
      return [];
    }
  }

  // Get group members
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          user:users (
            id,
            display_name,
            avatar_url,
            bio,
            favorite_sports
          )
        `)
        .eq('group_id', groupId)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Error fetching group members:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching group members:', error);
      return [];
    }
  }

  // Add member to group
  async addMember(groupId: string, userId: string, invitedBy?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member',
          joined_at: new Date().toISOString(),
          invited_by: invitedBy,
          status: 'active',
          permissions: {
            can_invite: false,
            can_create_events: true,
            can_moderate: false,
            can_edit_group: false,
          },
        });

      if (error) {
        console.error('Error adding member:', error);
        return false;
      }

      // Update member count
      await this.updateMemberCount(groupId);

      return true;
    } catch (error) {
      console.error('Error adding member:', error);
      return false;
    }
  }

  // Remove member from group
  async removeMember(groupId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ status: 'left' })
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing member:', error);
        return false;
      }

      // Update member count
      await this.updateMemberCount(groupId);

      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      return false;
    }
  }

  // Update member role
  async updateMemberRole(groupId: string, userId: string, role: 'admin' | 'moderator' | 'member'): Promise<boolean> {
    try {
      const permissions = this.getRolePermissions(role);

      const { error } = await supabase
        .from('group_members')
        .update({
          role,
          permissions,
          updated_at: new Date().toISOString(),
        })
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating member role:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      return false;
    }
  }

  // Check if user is member
  async isMember(groupId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) {
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking membership:', error);
      return false;
    }
  }

  // Get user's role in group
  async getUserRole(groupId: string, userId: string): Promise<'admin' | 'moderator' | 'member' | null> {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) {
        return null;
      }

      return data?.role || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  // Send group invitation
  async sendInvitation(groupId: string, invitedUserId: string, invitedBy: string, message?: string): Promise<GroupInvitation | null> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      const { data, error } = await supabase
        .from('group_invitations')
        .insert({
          group_id: groupId,
          invited_user_id: invitedUserId,
          invited_by,
          message,
          status: 'pending',
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .select(`
          *,
          group:groups (*),
          inviter:users!group_invitations_invited_by_fkey (
            id,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error sending invitation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error sending invitation:', error);
      return null;
    }
  }

  // Accept group invitation
  async acceptInvitation(invitationId: string): Promise<boolean> {
    try {
      // Get invitation details
      const { data: invitation, error: fetchError } = await supabase
        .from('group_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (fetchError || !invitation) {
        console.error('Error fetching invitation:', fetchError);
        return false;
      }

      // Add user to group
      const success = await this.addMember(invitation.group_id, invitation.invited_user_id, invitation.invited_by);
      if (!success) {
        return false;
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('group_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);

      if (updateError) {
        console.error('Error updating invitation:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return false;
    }
  }

  // Decline group invitation
  async declineInvitation(invitationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId);

      if (error) {
        console.error('Error declining invitation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error declining invitation:', error);
      return false;
    }
  }

  // Get group settings
  async getGroupSettings(groupId: string): Promise<GroupSettings | null> {
    try {
      const { data, error } = await supabase
        .from('group_settings')
        .select('*')
        .eq('group_id', groupId)
        .single();

      if (error) {
        console.error('Error fetching group settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching group settings:', error);
      return null;
    }
  }

  // Update group settings
  async updateGroupSettings(groupId: string, settings: Partial<GroupSettings>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('group_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('group_id', groupId);

      if (error) {
        console.error('Error updating group settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating group settings:', error);
      return false;
    }
  }

  // Get group analytics
  async getGroupAnalytics(groupId: string): Promise<GroupAnalytics | null> {
    try {
      // This would need more complex queries to calculate analytics
      // For now, return basic structure
      const { data: members } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('status', 'active');

      const { data: events } = await supabase
        .from('group_events')
        .select('id, status')
        .eq('group_id', groupId);

      const totalMembers = members?.length || 0;
      const totalEvents = events?.length || 0;
      const upcomingEvents = events?.filter(e => e.status === 'scheduled').length || 0;

      return {
        group_id: groupId,
        total_members: totalMembers,
        active_members: totalMembers, // Would need activity tracking
        total_events: totalEvents,
        upcoming_events: upcomingEvents,
        total_messages: 0, // Would need to count from group_messages
        engagement_score: 0, // Would need complex calculation
        growth_rate: 0, // Would need historical data
        popular_sports: [],
        activity_by_day: [],
        member_retention: 0,
        event_attendance_rate: 0,
      };
    } catch (error) {
      console.error('Error fetching group analytics:', error);
      return null;
    }
  }

  // Helper methods
  private async updateMemberCount(groupId: string): Promise<void> {
    try {
      const { data: members } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('status', 'active');

      const memberCount = members?.length || 0;

      await supabase
        .from('groups')
        .update({ member_count: memberCount })
        .eq('id', groupId);
    } catch (error) {
      console.error('Error updating member count:', error);
    }
  }

  private getRolePermissions(role: 'admin' | 'moderator' | 'member') {
    switch (role) {
      case 'admin':
        return {
          can_invite: true,
          can_create_events: true,
          can_moderate: true,
          can_edit_group: true,
        };
      case 'moderator':
        return {
          can_invite: true,
          can_create_events: true,
          can_moderate: true,
          can_edit_group: false,
        };
      case 'member':
        return {
          can_invite: false,
          can_create_events: true,
          can_moderate: false,
          can_edit_group: false,
        };
    }
  }
}

// Create and export singleton instance
export const groupService = new GroupService();
export default groupService;
