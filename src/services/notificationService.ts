import { supabase } from './supabase';
import { fcmService } from './fcmService';

// Notification types and interfaces
export interface NotificationData {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: { [key: string]: any };
  image_url?: string;
  action_url?: string;
  is_read: boolean;
  is_sent: boolean;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export type NotificationType = 
  | 'new_event_nearby'
  | 'friend_request'
  | 'friend_request_accepted'
  | 'event_invitation'
  | 'event_cancelled'
  | 'event_updated'
  | 'event_reminder'
  | 'chat_message'
  | 'system_announcement'
  | 'event_participant_joined'
  | 'event_participant_left'
  | 'event_starting_soon'
  | 'weather_alert'
  | 'achievement_unlocked'
  | 'friend_activity';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  categories: {
    events: boolean;
    friends: boolean;
    messages: boolean;
    reminders: boolean;
    system: boolean;
    marketing: boolean;
  };
  quiet_hours: {
    enabled: boolean;
    start_time: string; // HH:MM format
    end_time: string; // HH:MM format
    timezone: string;
  };
  frequency: {
    immediate: boolean;
    daily_digest: boolean;
    weekly_digest: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  type: NotificationType;
  title_template: string;
  body_template: string;
  default_data?: { [key: string]: any };
  required_permissions?: string[];
}

export interface NotificationStats {
  total_sent: number;
  total_read: number;
  read_rate: number;
  click_rate: number;
  unread_count: number;
  by_type: { [key: string]: number };
  by_date: { [key: string]: number };
}

class NotificationService {
  // Notification Templates
  private templates: { [key in NotificationType]: NotificationTemplate } = {
    new_event_nearby: {
      type: 'new_event_nearby',
      title_template: 'New {sport} event near you!',
      body_template: '{event_name} is happening at {location} in {distance}km',
      default_data: { sport: 'sport', event_name: 'event', location: 'location', distance: 'distance' },
    },
    friend_request: {
      type: 'friend_request',
      title_template: 'New friend request',
      body_template: '{sender_name} wants to be your friend',
      default_data: { sender_name: 'sender' },
    },
    friend_request_accepted: {
      type: 'friend_request_accepted',
      title_template: 'Friend request accepted!',
      body_template: '{friend_name} accepted your friend request',
      default_data: { friend_name: 'friend' },
    },
    event_invitation: {
      type: 'event_invitation',
      title_template: 'Event invitation',
      body_template: '{inviter_name} invited you to {event_name}',
      default_data: { inviter_name: 'inviter', event_name: 'event' },
    },
    event_cancelled: {
      type: 'event_cancelled',
      title_template: 'Event cancelled',
      body_template: '{event_name} has been cancelled',
      default_data: { event_name: 'event' },
    },
    event_updated: {
      type: 'event_updated',
      title_template: 'Event updated',
      body_template: '{event_name} has been updated',
      default_data: { event_name: 'event' },
    },
    event_reminder: {
      type: 'event_reminder',
      title_template: 'Event reminder',
      body_template: '{event_name} starts in {time_remaining}',
      default_data: { event_name: 'event', time_remaining: 'time' },
    },
    chat_message: {
      type: 'chat_message',
      title_template: 'New message from {sender_name}',
      body_template: '{message_preview}',
      default_data: { sender_name: 'sender', message_preview: 'message' },
    },
    system_announcement: {
      type: 'system_announcement',
      title_template: 'SportMap Update',
      body_template: '{announcement_text}',
      default_data: { announcement_text: 'text' },
    },
    event_participant_joined: {
      type: 'event_participant_joined',
      title_template: 'New participant',
      body_template: '{participant_name} joined {event_name}',
      default_data: { participant_name: 'participant', event_name: 'event' },
    },
    event_participant_left: {
      type: 'event_participant_left',
      title_template: 'Participant left',
      body_template: '{participant_name} left {event_name}',
      default_data: { participant_name: 'participant', event_name: 'event' },
    },
    event_starting_soon: {
      type: 'event_starting_soon',
      title_template: 'Event starting soon',
      body_template: '{event_name} starts in {time_remaining}',
      default_data: { event_name: 'event', time_remaining: 'time' },
    },
    weather_alert: {
      type: 'weather_alert',
      title_template: 'Weather Alert',
      body_template: '{weather_condition} may affect your event',
      default_data: { weather_condition: 'condition' },
    },
    achievement_unlocked: {
      type: 'achievement_unlocked',
      title_template: 'Achievement unlocked!',
      body_template: 'You earned the {achievement_name} badge',
      default_data: { achievement_name: 'achievement' },
    },
    friend_activity: {
      type: 'friend_activity',
      title_template: 'Friend activity',
      body_template: '{friend_name} {activity_description}',
      default_data: { friend_name: 'friend', activity_description: 'activity' },
    },
  };

  // Create notification
  async createNotification(
    userId: string,
    type: NotificationType,
    data: { [key: string]: any },
    options: {
      scheduled_at?: string;
      image_url?: string;
      action_url?: string;
    } = {}
  ): Promise<NotificationData | null> {
    try {
      const template = this.templates[type];
      const title = this.interpolateTemplate(template.title_template, data);
      const body = this.interpolateTemplate(template.body_template, data);

      const notificationData = {
        user_id: userId,
        type,
        title,
        body,
        data: { ...template.default_data, ...data },
        image_url: options.image_url,
        action_url: options.action_url,
        is_read: false,
        is_sent: false,
        scheduled_at: options.scheduled_at,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: notification, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Send notification immediately
  async sendNotification(notificationId: string): Promise<boolean> {
    try {
      const { data: notification, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single();

      if (fetchError || !notification) {
        console.error('Error fetching notification:', fetchError);
        return false;
      }

      // Get user's FCM token
      const { data: userToken } = await supabase
        .from('user_tokens')
        .select('fcm_token')
        .eq('user_id', notification.user_id)
        .single();

      if (!userToken?.fcm_token) {
        console.error('No FCM token found for user');
        return false;
      }

      // Send push notification
      const success = await fcmService.sendPushNotification({
        token: userToken.fcm_token,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        imageUrl: notification.image_url,
      });

      if (success) {
        // Update notification as sent
        await supabase
          .from('notifications')
          .update({
            is_sent: true,
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', notificationId);
      }

      return success;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // Send notification to multiple users
  async sendBulkNotification(
    userIds: string[],
    type: NotificationType,
    data: { [key: string]: any },
    options: {
      scheduled_at?: string;
      image_url?: string;
      action_url?: string;
    } = {}
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const userId of userIds) {
      const notification = await this.createNotification(userId, type, data, options);
      if (notification) {
        const sent = await this.sendNotification(notification.id);
        if (sent) {
          success++;
        } else {
          failed++;
        }
      } else {
        failed++;
      }
    }

    return { success, failed };
  }

  // Get user notifications
  async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unread_only?: boolean;
      type?: NotificationType;
    } = {}
  ): Promise<NotificationData[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options.unread_only) {
        query = query.eq('is_read', false);
      }

      if (options.type) {
        query = query.eq('type', options.type);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Get notification preferences
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching notification preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating notification preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return null;
    }
  }

  // Create default notification preferences
  async createDefaultPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const defaultPreferences: Omit<NotificationPreferences, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        push_enabled: true,
        email_enabled: true,
        sms_enabled: false,
        categories: {
          events: true,
          friends: true,
          messages: true,
          reminders: true,
          system: true,
          marketing: false,
        },
        quiet_hours: {
          enabled: false,
          start_time: '22:00',
          end_time: '08:00',
          timezone: 'UTC',
        },
        frequency: {
          immediate: true,
          daily_digest: false,
          weekly_digest: false,
        },
      };

      const { data, error } = await supabase
        .from('notification_preferences')
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

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<NotificationStats | null> {
    try {
      const [notifications, unreadCount] = await Promise.all([
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId),
        supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('is_read', false),
      ]);

      if (notifications.error) {
        console.error('Error fetching notification stats:', notifications.error);
        return null;
      }

      const totalSent = notifications.data?.length || 0;
      const totalRead = notifications.data?.filter(n => n.is_read).length || 0;
      const unread = unreadCount.data?.length || 0;
      const readRate = totalSent > 0 ? (totalRead / totalSent) * 100 : 0;

      // Group by type
      const byType: { [key: string]: number } = {};
      notifications.data?.forEach(notification => {
        byType[notification.type] = (byType[notification.type] || 0) + 1;
      });

      // Group by date
      const byDate: { [key: string]: number } = {};
      notifications.data?.forEach(notification => {
        const date = new Date(notification.created_at).toISOString().split('T')[0];
        byDate[date] = (byDate[date] || 0) + 1;
      });

      return {
        total_sent: totalSent,
        total_read: totalRead,
        read_rate: readRate,
        click_rate: 0, // TODO: Implement click tracking
        unread_count: unread,
        by_type: byType,
        by_date: byDate,
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return null;
    }
  }

  // Schedule notification
  async scheduleNotification(
    userId: string,
    type: NotificationType,
    data: { [key: string]: any },
    scheduledAt: string,
    options: {
      image_url?: string;
      action_url?: string;
    } = {}
  ): Promise<NotificationData | null> {
    return this.createNotification(userId, type, data, {
      ...options,
      scheduled_at: scheduledAt,
    });
  }

  // Process scheduled notifications
  async processScheduledNotifications(): Promise<{ processed: number; sent: number }> {
    try {
      const now = new Date().toISOString();
      
      const { data: scheduledNotifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_sent', false)
        .lte('scheduled_at', now)
        .not('scheduled_at', 'is', null);

      if (error) {
        console.error('Error fetching scheduled notifications:', error);
        return { processed: 0, sent: 0 };
      }

      let processed = 0;
      let sent = 0;

      for (const notification of scheduledNotifications || []) {
        processed++;
        const success = await this.sendNotification(notification.id);
        if (success) {
          sent++;
        }
      }

      return { processed, sent };
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
      return { processed: 0, sent: 0 };
    }
  }

  // Helper method to interpolate template strings
  private interpolateTemplate(template: string, data: { [key: string]: any }): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  // Check if user should receive notification based on preferences
  async shouldSendNotification(
    userId: string,
    type: NotificationType
  ): Promise<boolean> {
    try {
      const preferences = await this.getNotificationPreferences(userId);
      if (!preferences) return true; // Default to sending if no preferences

      // Check if push notifications are enabled
      if (!preferences.push_enabled) return false;

      // Check category preferences
      const categoryMap: { [key in NotificationType]: keyof typeof preferences.categories } = {
        new_event_nearby: 'events',
        friend_request: 'friends',
        friend_request_accepted: 'friends',
        event_invitation: 'events',
        event_cancelled: 'events',
        event_updated: 'events',
        event_reminder: 'reminders',
        chat_message: 'messages',
        system_announcement: 'system',
        event_participant_joined: 'events',
        event_participant_left: 'events',
        event_starting_soon: 'reminders',
        weather_alert: 'system',
        achievement_unlocked: 'system',
        friend_activity: 'friends',
      };

      const category = categoryMap[type];
      if (category && !preferences.categories[category]) return false;

      // Check quiet hours
      if (preferences.quiet_hours.enabled) {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const startTime = preferences.quiet_hours.start_time;
        const endTime = preferences.quiet_hours.end_time;

        if (startTime > endTime) {
          // Quiet hours span midnight
          if (currentTime >= startTime || currentTime <= endTime) {
            return false;
          }
        } else {
          // Quiet hours within same day
          if (currentTime >= startTime && currentTime <= endTime) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking notification preferences:', error);
      return true; // Default to sending on error
    }
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
