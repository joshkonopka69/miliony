import { supabase } from './supabase';

// Privacy settings types
export interface PrivacySettings {
  id: string;
  user_id: string;
  profile_visibility: 'public' | 'friends' | 'private';
  show_location: boolean;
  show_activity: boolean;
  show_friends: boolean;
  show_online_status: boolean;
  allow_friend_requests: boolean;
  allow_event_invites: boolean;
  allow_messages: boolean;
  show_birthday: boolean;
  show_phone: boolean;
  show_email: boolean;
  data_sharing: {
    analytics: boolean;
    marketing: boolean;
    third_party: boolean;
    location_tracking: boolean;
  };
  search_visibility: {
    searchable_by_name: boolean;
    searchable_by_email: boolean;
    searchable_by_phone: boolean;
    appear_in_suggestions: boolean;
  };
  activity_privacy: {
    show_events_created: boolean;
    show_events_joined: boolean;
    show_friend_activity: boolean;
    show_profile_views: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface DataRetentionSettings {
  id: string;
  user_id: string;
  activity_history_days: number;
  message_history_days: number;
  location_history_days: number;
  auto_delete_inactive_days: number;
  export_data_frequency: 'never' | 'monthly' | 'quarterly' | 'yearly';
  created_at: string;
  updated_at: string;
}

export interface ConsentSettings {
  id: string;
  user_id: string;
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
  cookies_accepted: boolean;
  analytics_consent: boolean;
  marketing_consent: boolean;
  location_consent: boolean;
  notification_consent: boolean;
  data_processing_consent: boolean;
  third_party_sharing_consent: boolean;
  consent_date: string;
  updated_at: string;
}

export interface PrivacyAuditLog {
  id: string;
  user_id: string;
  action: 'settings_updated' | 'data_exported' | 'data_deleted' | 'consent_updated' | 'privacy_request';
  details: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface PrivacyRequest {
  id: string;
  user_id: string;
  request_type: 'data_export' | 'data_deletion' | 'data_correction' | 'consent_withdrawal';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  description?: string;
  requested_at: string;
  processed_at?: string;
  response?: string;
}

class PrivacyService {
  // Privacy Settings Management

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

  async updatePrivacySettings(userId: string, settings: Partial<PrivacySettings>): Promise<PrivacySettings | null> {
    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating privacy settings:', error);
        return null;
      }

      // Log privacy settings update
      await this.logPrivacyAction(userId, 'settings_updated', settings);

      return data;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return null;
    }
  }

  async createDefaultPrivacySettings(userId: string): Promise<PrivacySettings | null> {
    try {
      const defaultSettings: Omit<PrivacySettings, 'id' | 'created_at' | 'updated_at'> = {
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
        console.error('Error creating default privacy settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating default privacy settings:', error);
      return null;
    }
  }

  // Data Retention Settings

  async getDataRetentionSettings(userId: string): Promise<DataRetentionSettings | null> {
    try {
      const { data, error } = await supabase
        .from('data_retention_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching data retention settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching data retention settings:', error);
      return null;
    }
  }

  async updateDataRetentionSettings(userId: string, settings: Partial<DataRetentionSettings>): Promise<DataRetentionSettings | null> {
    try {
      const { data, error } = await supabase
        .from('data_retention_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating data retention settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating data retention settings:', error);
      return null;
    }
  }

  async createDefaultDataRetentionSettings(userId: string): Promise<DataRetentionSettings | null> {
    try {
      const defaultSettings: Omit<DataRetentionSettings, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        activity_history_days: 365,
        message_history_days: 90,
        location_history_days: 30,
        auto_delete_inactive_days: 730, // 2 years
        export_data_frequency: 'yearly',
      };

      const { data, error } = await supabase
        .from('data_retention_settings')
        .insert({
          ...defaultSettings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default data retention settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating default data retention settings:', error);
      return null;
    }
  }

  // Consent Management

  async getConsentSettings(userId: string): Promise<ConsentSettings | null> {
    try {
      const { data, error } = await supabase
        .from('consent_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching consent settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching consent settings:', error);
      return null;
    }
  }

  async updateConsentSettings(userId: string, consent: Partial<ConsentSettings>): Promise<ConsentSettings | null> {
    try {
      const { data, error } = await supabase
        .from('consent_settings')
        .upsert({
          user_id: userId,
          ...consent,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating consent settings:', error);
        return null;
      }

      // Log consent update
      await this.logPrivacyAction(userId, 'consent_updated', consent);

      return data;
    } catch (error) {
      console.error('Error updating consent settings:', error);
      return null;
    }
  }

  async createDefaultConsentSettings(userId: string): Promise<ConsentSettings | null> {
    try {
      const defaultConsent: Omit<ConsentSettings, 'id' | 'updated_at'> = {
        user_id: userId,
        terms_accepted: true,
        privacy_policy_accepted: true,
        cookies_accepted: true,
        analytics_consent: true,
        marketing_consent: false,
        location_consent: true,
        notification_consent: true,
        data_processing_consent: true,
        third_party_sharing_consent: false,
        consent_date: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('consent_settings')
        .insert({
          ...defaultConsent,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating default consent settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating default consent settings:', error);
      return null;
    }
  }

  // Privacy Audit and Logging

  async logPrivacyAction(userId: string, action: PrivacyAuditLog['action'], details: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('privacy_audit_logs')
        .insert({
          user_id: userId,
          action,
          details,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error logging privacy action:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error logging privacy action:', error);
      return false;
    }
  }

  async getPrivacyAuditLog(userId: string, limit: number = 50): Promise<PrivacyAuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('privacy_audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching privacy audit log:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching privacy audit log:', error);
      return [];
    }
  }

  // Privacy Requests

  async createPrivacyRequest(userId: string, requestType: PrivacyRequest['request_type'], description?: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('privacy_requests')
        .insert({
          user_id: userId,
          request_type: requestType,
          status: 'pending',
          description,
          requested_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating privacy request:', error);
        return null;
      }

      // Log privacy request
      await this.logPrivacyAction(userId, 'privacy_request', { request_type: requestType, request_id: data.id });

      return data.id;
    } catch (error) {
      console.error('Error creating privacy request:', error);
      return null;
    }
  }

  async getPrivacyRequests(userId: string): Promise<PrivacyRequest[]> {
    try {
      const { data, error } = await supabase
        .from('privacy_requests')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error fetching privacy requests:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching privacy requests:', error);
      return [];
    }
  }

  // Data Export

  async exportUserData(userId: string): Promise<any> {
    try {
      // Get all user data
      const [
        profile,
        preferences,
        privacySettings,
        consentSettings,
        activities,
        friends,
        events,
        messages
      ] = await Promise.all([
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
        supabase.from('privacy_settings').select('*').eq('user_id', userId).single(),
        supabase.from('consent_settings').select('*').eq('user_id', userId).single(),
        supabase.from('user_activities').select('*').eq('user_id', userId),
        supabase.from('friendships').select('*').eq('user_id', userId),
        supabase.from('events').select('*').eq('created_by', userId),
        supabase.from('event_messages').select('*').eq('sender_id', userId),
      ]);

      const exportData = {
        export_date: new Date().toISOString(),
        user_id: userId,
        profile: profile.data,
        preferences: preferences.data,
        privacy_settings: privacySettings.data,
        consent_settings: consentSettings.data,
        activities: activities.data,
        friends: friends.data,
        events: events.data,
        messages: messages.data,
      };

      // Log data export
      await this.logPrivacyAction(userId, 'data_exported', { export_date: exportData.export_date });

      return exportData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      return null;
    }
  }

  // Data Deletion

  async deleteUserData(userId: string): Promise<boolean> {
    try {
      // Delete all user-related data
      const tables = [
        'users',
        'user_preferences',
        'privacy_settings',
        'consent_settings',
        'data_retention_settings',
        'user_activities',
        'friendships',
        'friend_requests',
        'user_blocks',
        'user_reports',
        'event_participants',
        'event_messages',
        'privacy_audit_logs',
        'privacy_requests',
      ];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', userId);

        if (error) {
          console.error(`Error deleting data from ${table}:`, error);
        }
      }

      // Delete events created by user
      await supabase
        .from('events')
        .delete()
        .eq('created_by', userId);

      // Log data deletion
      await this.logPrivacyAction(userId, 'data_deleted', { deletion_date: new Date().toISOString() });

      return true;
    } catch (error) {
      console.error('Error deleting user data:', error);
      return false;
    }
  }

  // Privacy Compliance

  async checkPrivacyCompliance(userId: string): Promise<{
    gdpr_compliant: boolean;
    ccpa_compliant: boolean;
    issues: string[];
  }> {
    try {
      const issues: string[] = [];
      
      // Check if user has accepted terms and privacy policy
      const consent = await this.getConsentSettings(userId);
      if (!consent?.terms_accepted || !consent?.privacy_policy_accepted) {
        issues.push('Terms and privacy policy not accepted');
      }

      // Check if user has data retention settings
      const retentionSettings = await this.getDataRetentionSettings(userId);
      if (!retentionSettings) {
        issues.push('Data retention settings not configured');
      }

      // Check if user has privacy settings
      const privacySettings = await this.getPrivacySettings(userId);
      if (!privacySettings) {
        issues.push('Privacy settings not configured');
      }

      const gdpr_compliant = issues.length === 0;
      const ccpa_compliant = issues.length === 0;

      return {
        gdpr_compliant,
        ccpa_compliant,
        issues,
      };
    } catch (error) {
      console.error('Error checking privacy compliance:', error);
      return {
        gdpr_compliant: false,
        ccpa_compliant: false,
        issues: ['Error checking compliance'],
      };
    }
  }

  // Privacy Analytics

  async getPrivacyAnalytics(userId: string): Promise<{
    data_retention_days: number;
    last_data_export?: string;
    privacy_requests_count: number;
    consent_updates_count: number;
    data_sharing_consent: boolean;
  }> {
    try {
      const [retentionSettings, auditLog, consentSettings] = await Promise.all([
        this.getDataRetentionSettings(userId),
        this.getPrivacyAuditLog(userId, 100),
        this.getConsentSettings(userId),
      ]);

      const lastDataExport = auditLog.find(log => log.action === 'data_exported')?.created_at;
      const privacyRequestsCount = auditLog.filter(log => log.action === 'privacy_request').length;
      const consentUpdatesCount = auditLog.filter(log => log.action === 'consent_updated').length;

      return {
        data_retention_days: retentionSettings?.activity_history_days || 365,
        last_data_export: lastDataExport,
        privacy_requests_count: privacyRequestsCount,
        consent_updates_count: consentUpdatesCount,
        data_sharing_consent: consentSettings?.data_processing_consent || false,
      };
    } catch (error) {
      console.error('Error getting privacy analytics:', error);
      return {
        data_retention_days: 365,
        privacy_requests_count: 0,
        consent_updates_count: 0,
        data_sharing_consent: false,
      };
    }
  }
}

// Create and export singleton instance
export const privacyService = new PrivacyService();
export default privacyService;
