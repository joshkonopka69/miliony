import { supabase } from '../config/supabase';

export interface PrivacySettings {
  id: string;
  user_id: string;
  
  // Basic Privacy Settings
  profile_visibility: 'public' | 'friends' | 'private';
  show_location: boolean;
  show_activity: boolean;
  show_friends: boolean;
  show_online_status: boolean;
  
  // Interaction Settings
  allow_friend_requests: boolean;
  allow_event_invites: boolean;
  allow_messages: boolean;
  
  // Personal Info Settings
  show_birthday: boolean;
  show_phone: boolean;
  show_email: boolean;
  
  // Data Sharing Settings (JSON)
  data_sharing: {
    analytics: boolean;
    marketing: boolean;
    third_party: boolean;
    location_tracking: boolean;
  };
  
  // Search Visibility Settings (JSON)
  search_visibility: {
    searchable_by_name: boolean;
    searchable_by_email: boolean;
    searchable_by_phone: boolean;
    appear_in_suggestions: boolean;
  };
  
  // Activity Privacy Settings (JSON)
  activity_privacy: {
    show_events_created: boolean;
    show_events_joined: boolean;
    show_friend_activity: boolean;
    show_profile_views: boolean;
  };
  
  created_at: string;
  updated_at: string;
}

export interface CreatePrivacySettingsData {
  user_id: string;
  profile_visibility?: 'public' | 'friends' | 'private';
  show_location?: boolean;
  show_activity?: boolean;
  show_friends?: boolean;
  show_online_status?: boolean;
  allow_friend_requests?: boolean;
  allow_event_invites?: boolean;
  allow_messages?: boolean;
  show_birthday?: boolean;
  show_phone?: boolean;
  show_email?: boolean;
  data_sharing?: Partial<PrivacySettings['data_sharing']>;
  search_visibility?: Partial<PrivacySettings['search_visibility']>;
  activity_privacy?: Partial<PrivacySettings['activity_privacy']>;
}

class PrivacySettingsService {
  
  // Get privacy settings for user
  async getPrivacySettings(userId: string): Promise<PrivacySettings | null> {
    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching privacy settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      return null;
    }
  }

  // Create privacy settings for user
  async createPrivacySettings(settingsData: CreatePrivacySettingsData): Promise<PrivacySettings | null> {
    try {
      const defaultSettings: Omit<PrivacySettings, 'id' | 'created_at' | 'updated_at'> = {
        user_id: settingsData.user_id,
        profile_visibility: settingsData.profile_visibility || 'public',
        show_location: settingsData.show_location ?? true,
        show_activity: settingsData.show_activity ?? true,
        show_friends: settingsData.show_friends ?? true,
        show_online_status: settingsData.show_online_status ?? true,
        allow_friend_requests: settingsData.allow_friend_requests ?? true,
        allow_event_invites: settingsData.allow_event_invites ?? true,
        allow_messages: settingsData.allow_messages ?? true,
        show_birthday: settingsData.show_birthday ?? false,
        show_phone: settingsData.show_phone ?? false,
        show_email: settingsData.show_email ?? false,
        data_sharing: {
          analytics: settingsData.data_sharing?.analytics ?? true,
          marketing: settingsData.data_sharing?.marketing ?? false,
          third_party: settingsData.data_sharing?.third_party ?? false,
          location_tracking: settingsData.data_sharing?.location_tracking ?? true,
        },
        search_visibility: {
          searchable_by_name: settingsData.search_visibility?.searchable_by_name ?? true,
          searchable_by_email: settingsData.search_visibility?.searchable_by_email ?? false,
          searchable_by_phone: settingsData.search_visibility?.searchable_by_phone ?? false,
          appear_in_suggestions: settingsData.search_visibility?.appear_in_suggestions ?? true,
        },
        activity_privacy: {
          show_events_created: settingsData.activity_privacy?.show_events_created ?? true,
          show_events_joined: settingsData.activity_privacy?.show_events_joined ?? true,
          show_friend_activity: settingsData.activity_privacy?.show_friend_activity ?? true,
          show_profile_views: settingsData.activity_privacy?.show_profile_views ?? false,
        },
      };

      const { data, error } = await supabase
        .from('privacy_settings')
        .insert({
          ...defaultSettings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating privacy settings:', error);
        return null;
      }

      console.log('✅ Privacy settings created for user:', settingsData.user_id);
      return data;
    } catch (error) {
      console.error('Error creating privacy settings:', error);
      return null;
    }
  }

  // Update privacy settings
  async updatePrivacySettings(
    userId: string, 
    updates: Partial<Omit<PrivacySettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<PrivacySettings | null> {
    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating privacy settings:', error);
        return null;
      }

      console.log('✅ Privacy settings updated for user:', userId);
      return data;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return null;
    }
  }

  // Update specific privacy setting
  async updatePrivacySetting(
    userId: string,
    key: keyof Omit<PrivacySettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    value: any
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('privacy_settings')
        .update({
          [key]: value,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating privacy setting:', error);
        return false;
      }

      console.log(`✅ Privacy setting ${key} updated for user:`, userId);
      return true;
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      return false;
    }
  }

  // Update data sharing settings
  async updateDataSharingSettings(
    userId: string,
    dataSharing: Partial<PrivacySettings['data_sharing']>
  ): Promise<boolean> {
    try {
      // First get current settings
      const currentSettings = await this.getPrivacySettings(userId);
      if (!currentSettings) {
        console.error('Could not fetch current privacy settings');
        return false;
      }

      // Merge with new settings
      const updatedDataSharing = {
        ...currentSettings.data_sharing,
        ...dataSharing,
      };

      const { error } = await supabase
        .from('privacy_settings')
        .update({
          data_sharing: updatedDataSharing,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating data sharing settings:', error);
        return false;
      }

      console.log('✅ Data sharing settings updated for user:', userId);
      return true;
    } catch (error) {
      console.error('Error updating data sharing settings:', error);
      return false;
    }
  }

  // Update search visibility settings
  async updateSearchVisibilitySettings(
    userId: string,
    searchVisibility: Partial<PrivacySettings['search_visibility']>
  ): Promise<boolean> {
    try {
      // First get current settings
      const currentSettings = await this.getPrivacySettings(userId);
      if (!currentSettings) {
        console.error('Could not fetch current privacy settings');
        return false;
      }

      // Merge with new settings
      const updatedSearchVisibility = {
        ...currentSettings.search_visibility,
        ...searchVisibility,
      };

      const { error } = await supabase
        .from('privacy_settings')
        .update({
          search_visibility: updatedSearchVisibility,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating search visibility settings:', error);
        return false;
      }

      console.log('✅ Search visibility settings updated for user:', userId);
      return true;
    } catch (error) {
      console.error('Error updating search visibility settings:', error);
      return false;
    }
  }

  // Update activity privacy settings
  async updateActivityPrivacySettings(
    userId: string,
    activityPrivacy: Partial<PrivacySettings['activity_privacy']>
  ): Promise<boolean> {
    try {
      // First get current settings
      const currentSettings = await this.getPrivacySettings(userId);
      if (!currentSettings) {
        console.error('Could not fetch current privacy settings');
        return false;
      }

      // Merge with new settings
      const updatedActivityPrivacy = {
        ...currentSettings.activity_privacy,
        ...activityPrivacy,
      };

      const { error } = await supabase
        .from('privacy_settings')
        .update({
          activity_privacy: updatedActivityPrivacy,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating activity privacy settings:', error);
        return false;
      }

      console.log('✅ Activity privacy settings updated for user:', userId);
      return true;
    } catch (error) {
      console.error('Error updating activity privacy settings:', error);
      return false;
    }
  }

  // Create default privacy settings for new user
  async createDefaultPrivacySettings(userId: string): Promise<PrivacySettings | null> {
    try {
      const defaultSettings: CreatePrivacySettingsData = {
        user_id: userId,
        profile_visibility: 'public',
        show_location: true,
        show_activity: true,
        show_friends: true,
        show_online_status: true,
        allow_friend_requests: true,
        allow_event_invites: true,
        allow_messages: true,
        show_birthday: false,
        show_phone: false,
        show_email: false,
        data_sharing: {
          analytics: true,
          marketing: false,
          third_party: false,
          location_tracking: true,
        },
        search_visibility: {
          searchable_by_name: true,
          searchable_by_email: false,
          searchable_by_phone: false,
          appear_in_suggestions: true,
        },
        activity_privacy: {
          show_events_created: true,
          show_events_joined: true,
          show_friend_activity: true,
          show_profile_views: false,
        },
      };

      return await this.createPrivacySettings(defaultSettings);
    } catch (error) {
      console.error('Error creating default privacy settings:', error);
      return null;
    }
  }

  // Check if user has privacy settings
  async hasPrivacySettings(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking privacy settings:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking privacy settings:', error);
      return false;
    }
  }

  // Get privacy settings or create default if not exists
  async getOrCreatePrivacySettings(userId: string): Promise<PrivacySettings | null> {
    try {
      let settings = await this.getPrivacySettings(userId);
      
      if (!settings) {
        console.log('No privacy settings found, creating default settings for user:', userId);
        settings = await this.createDefaultPrivacySettings(userId);
      }

      return settings;
    } catch (error) {
      console.error('Error getting or creating privacy settings:', error);
      return null;
    }
  }

  // Delete privacy settings (for account deletion)
  async deletePrivacySettings(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('privacy_settings')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting privacy settings:', error);
        return false;
      }

      console.log('✅ Privacy settings deleted for user:', userId);
      return true;
    } catch (error) {
      console.error('Error deleting privacy settings:', error);
      return false;
    }
  }
}

export const privacySettingsService = new PrivacySettingsService();
export default privacySettingsService;
