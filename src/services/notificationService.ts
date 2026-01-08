import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationType =
  | 'new_event_nearby'
  | 'friend_request'
  | 'friend_request_accepted'
  | 'friend_activity'
  | 'event_invite'
  | 'event_invitation'
  | 'event_cancelled'
  | 'event_updated'
  | 'event_update'
  | 'event_reminder'
  | 'event_participant_joined'
  | 'event_participant_left'
  | 'event_starting_soon'
  | 'chat_message'
  | 'system_announcement'
  | 'weather_alert'
  | 'achievement_unlocked'
  | 'group_invite'
  | 'general';

export type NotificationCategory =
  | 'events'
  | 'friends'
  | 'messages'
  | 'reminders'
  | 'system'
  | 'marketing';

export interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  categories: Record<NotificationCategory, boolean>;
  quiet_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
    timezone: string;
  };
  frequency: {
    immediate: boolean;
    daily_digest: boolean;
    weekly_digest: boolean;
  };
}

export interface NotificationStats {
  total_sent: number;
  total_read: number;
  unread_count: number;
  read_rate: number;
  by_type: Record<string, number>;
  by_date: Record<string, number>;
}

export interface NotificationData {
  id?: string;
  user_id?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type: NotificationType;
  read?: boolean;
  created_at?: string;
  read_at?: string;
  image_url?: string | null;
  action_url?: string | null;
  scheduled_at?: string | null;
}

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  push_enabled: true,
  email_enabled: false,
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

const PREFERENCES_KEY_PREFIX = 'notification_preferences_v1:';

const NOTIFICATION_CATEGORY_MAP: Partial<Record<NotificationType, NotificationCategory>> = {
  new_event_nearby: 'events',
  event_invite: 'events',
  event_invitation: 'events',
  event_updated: 'events',
  event_update: 'events',
  event_cancelled: 'events',
  event_starting_soon: 'events',
  event_participant_joined: 'events',
  event_participant_left: 'events',
  event_reminder: 'reminders',
  friend_activity: 'friends',
  friend_request: 'friends',
  friend_request_accepted: 'friends',
  group_invite: 'friends',
  chat_message: 'messages',
  system_announcement: 'system',
  weather_alert: 'system',
  achievement_unlocked: 'system',
  general: 'system',
};

class NotificationService {
  private expoPushToken: string | null = null;
  private isInitialized = false;
  private preferencesCache = new Map<string, NotificationPreferences>();
  private getCategoryForType(type: NotificationType): NotificationCategory {
    return NOTIFICATION_CATEGORY_MAP[type] ?? 'system';
  }

  private async getNotificationRecordById(notificationId: string): Promise<NotificationData | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single();

      if (error) {
        console.error('Error fetching notification by id:', error);
        return null;
      }

      return this.mapNotificationRow(data);
    } catch (error) {
      console.error('Error fetching notification by id:', error);
      return null;
    }
  }


  private isRLSPolicyError(error: any): boolean {
    if (!error) return false;
    const code = (error as any).code;
    const message = (error as any).message;
    return code === '42501' || (typeof message === 'string' && message.includes('row-level security'));
  }

  private getPreferencesKey(userId: string): string {
    return `${PREFERENCES_KEY_PREFIX}${userId}`;
  }

  private async getOrCreatePreferences(userId: string): Promise<NotificationPreferences> {
    if (this.preferencesCache.has(userId)) {
      return this.preferencesCache.get(userId)!;
    }

    try {
      const stored = await AsyncStorage.getItem(this.getPreferencesKey(userId));
      if (stored) {
        const parsed = this.mergePreferences(
          DEFAULT_NOTIFICATION_PREFERENCES,
          JSON.parse(stored)
        );
        this.preferencesCache.set(userId, parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Error loading notification preferences from storage:', error);
    }

    const fallback = this.mergePreferences(
      DEFAULT_NOTIFICATION_PREFERENCES,
      {}
    );
    this.preferencesCache.set(userId, fallback);
    await AsyncStorage.setItem(
      this.getPreferencesKey(userId),
      JSON.stringify(fallback)
    );
    return fallback;
  }

  private mergePreferences(
    current: NotificationPreferences,
    update: Partial<NotificationPreferences>
  ): NotificationPreferences {
    return {
      push_enabled: update.push_enabled ?? current.push_enabled,
      email_enabled: update.email_enabled ?? current.email_enabled,
      sms_enabled: update.sms_enabled ?? current.sms_enabled,
      categories: {
        ...current.categories,
        ...(update.categories || {}),
      },
      quiet_hours: {
        ...current.quiet_hours,
        ...(update.quiet_hours || {}),
      },
      frequency: {
        ...current.frequency,
        ...(update.frequency || {}),
      },
    };
  }

  private isWithinQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quiet_hours.enabled) return false;

    const now = new Date();
    const current = now.toTimeString().slice(0, 5);
    const start = preferences.quiet_hours.start_time;
    const end = preferences.quiet_hours.end_time;

    if (start === end) {
      return true;
    }

    if (start < end) {
      return current >= start && current <= end;
    }

    return current >= start || current <= end;
  }

  private mapNotificationRow(row: any): NotificationData {
    if (!row) return row;

    const isRead = row.read ?? false;
    return {
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      body: row.body,
      data: row.data || {},
      type: row.type,
      read: isRead,
      created_at: row.created_at,
      read_at: row.read_at,
      image_url: row.image_url ?? null,
      action_url: row.action_url ?? null,
      scheduled_at: row.scheduled_at ?? null,
    };
  }

  // Initialize notification service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Skip notifications in Expo Go (SDK 53+ limitation)
    if (__DEV__ && !Device.isDevice) {
      console.log('Notifications disabled in Expo Go - use development build for full functionality');
      return;
    }

    try {
      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        } as any),
      });

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
      }

      // Get push token
      if (Device.isDevice) {
        this.expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Expo push token:', this.expoPushToken);

        // Save token to database
        await this.savePushToken(this.expoPushToken);
      } else {
        console.warn('Must use physical device for push notifications');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  // Save push token to database
  private async savePushToken(token: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_tokens')
        .upsert({
          user_id: user.id,
          expo_push_token: token,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  // Send local notification
  async sendLocalNotification(notification: NotificationData): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Send push notification to specific user
  async sendPushNotification(
    userId: string,
    notification: NotificationData
  ): Promise<void> {
    try {
      const { data: tokens } = await supabase
        .from('user_tokens')
        .select('expo_push_token, fcm_token')
        .eq('user_id', userId);

      const pushTokens = (tokens || [])
        .map((token) => token.expo_push_token || token.fcm_token)
        .filter(Boolean);

      if (pushTokens.length === 0) {
        console.warn('No push tokens found for user:', userId);
        return;
      }

      const messages = pushTokens.map(token => ({
        to: token,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data,
      }));

      // Send via Expo push service
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        throw new Error(`Push notification failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Send notification to event participants
  async sendEventNotification(
    eventId: string,
    notification: NotificationData,
    excludeUserId?: string
  ): Promise<void> {
    try {
      // Get event participants
      const { data: participants } = await supabase
        .from('event_participants')
        .select('user_id')
        .eq('event_id', eventId);

      if (!participants) return;

      // Send to each participant (except excluded user)
      const promises = participants
        .filter(p => p.user_id !== excludeUserId)
        .map(participant =>
          this.sendPushNotification(participant.user_id, notification)
        );

      await Promise.all(promises);
    } catch (error) {
      console.error('Error sending event notification:', error);
    }
  }

  // Schedule event reminder
  async scheduleEventReminder(
    eventId: string,
    eventTitle: string,
    reminderTime: Date
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Event Reminder',
          body: `${eventTitle} is starting soon!`,
          data: { eventId, type: 'event_reminder' },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderTime,
        } as any,
      });
    } catch (error) {
      console.error('Error scheduling event reminder:', error);
    }
  }

  // Cancel event reminder
  async cancelEventReminder(eventId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

      const eventReminders = scheduledNotifications.filter(
        notification => notification.content.data?.eventId === eventId
      );

      for (const reminder of eventReminders) {
        await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
      }
    } catch (error) {
      console.error('Error canceling event reminder:', error);
    }
  }

  // Handle notification received
  async handleNotificationReceived(notification: Notifications.Notification): Promise<void> {
    const data = notification.request.content.data;

    if (data?.type === 'event_reminder') {
      // Handle event reminder
      console.log('Event reminder received:', data);
    } else if (data?.type === 'participant_joined') {
      // Handle participant joined
      console.log('Participant joined notification:', data);
    }
  }

  // Handle notification response (when user taps notification)
  async handleNotificationResponse(response: Notifications.NotificationResponse): Promise<void> {
    const data = response.notification.request.content.data;

    if (data?.eventId) {
      // Navigate to event details
      console.log('Navigate to event:', data.eventId);
      // Add navigation logic here
    }
  }

  // Get notification settings
  async getNotificationSettings(): Promise<{
    eventReminders: boolean;
    participantUpdates: boolean;
    eventUpdates: boolean;
  }> {
    try {
      const settings = await AsyncStorage.getItem('notification_settings');
      return settings ? JSON.parse(settings) : {
        eventReminders: true,
        participantUpdates: true,
        eventUpdates: true,
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {
        eventReminders: true,
        participantUpdates: true,
        eventUpdates: true,
      };
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings: {
    eventReminders: boolean;
    participantUpdates: boolean;
    eventUpdates: boolean;
  }): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }

  // Get notification preferences
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      return await this.getOrCreatePreferences(userId);
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(
    userId: string,
    newPreferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences | null> {
    try {
      const current = await this.getOrCreatePreferences(userId);
      const merged = this.mergePreferences(current, newPreferences);
      await AsyncStorage.setItem(
        this.getPreferencesKey(userId),
        JSON.stringify(merged)
      );
      this.preferencesCache.set(userId, merged);
      return merged;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return null;
    }
  }

  // Get notification stats
  async getNotificationStats(userId: string): Promise<NotificationStats> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, read, created_at')
        .eq('user_id', userId);

      if (error) {
        console.error('Error getting notification stats:', error);
        throw error;
      }

      const records = data || [];
      const totalSent = records.length;
      const unreadCount = records.filter((n) => !n.read).length;
      const totalRead = totalSent - unreadCount;
      const byType = records.reduce<Record<string, number>>((acc: any, curr: any) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
      }, {});
      const byDate = records.reduce<Record<string, number>>((acc: any, curr: any) => {
        const date = curr.created_at ? curr.created_at.slice(0, 10) : 'unknown';
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return {
        total_sent: totalSent,
        total_read: totalRead,
        unread_count: unreadCount,
        read_rate: totalSent === 0 ? 0 : (totalRead / totalSent) * 100,
        by_type: byType,
        by_date: byDate,
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return {
        total_sent: 0,
        total_read: 0,
        unread_count: 0,
        read_rate: 0,
        by_type: {},
        by_date: {},
      };
    }
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  // Get badge count
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  // Set badge count
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  // Ensure reminders exist for upcoming events (12h & 1h)
  async ensureEventReminders(userId: string): Promise<boolean> {
    try {
      const now = new Date();

      const { data: upcomingEvents, error } = await supabase
        .from('event_participants')
        .select(`
          event_id,
          events (
            id,
            name,
            scheduled_datetime
          )
        `)
        .eq('user_id', userId)
        .gte('events.scheduled_datetime', new Date(now.getTime() - 5 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error fetching upcoming events for reminders:', error);
        return false;
      }

      if (!upcomingEvents || upcomingEvents.length === 0) {
        return false;
      }

      const { data: existing } = await supabase
        .from('notifications')
        .select('id, data')
        .eq('user_id', userId)
        .eq('type', 'event_reminder');

      const sentKeys = new Set(
        (existing || [])
          .map((item) => {
            const payload = item.data as { eventId?: string; reminder?: string };
            return payload?.eventId && payload?.reminder
              ? `${payload.eventId}-${payload.reminder}`
              : null;
          })
          .filter(Boolean) as string[]
      );

      const thresholds = [
        {
          hours: 12,
          minHours: 1,
          reminder: '12h',
          title: 'Upcoming Event',
          buildBody: (name: string) => `${name} starts in 12 hours.`,
        },
        {
          hours: 1,
          minHours: 0,
          reminder: '1h',
          title: 'Event Starting Soon',
          buildBody: (name: string) => `${name} starts in 1 hour.`,
        },
      ];

      let created = false;

      for (const participant of (upcomingEvents as any[])) {
        const event = participant.events;
        if (!event) continue;

        // Handle the case where events might be returned as an array
        const eventData = Array.isArray(event) ? event[0] : event;
        if (!eventData) continue;

        const start = new Date(eventData.scheduled_datetime);
        const diffHours = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (diffHours <= 0) continue;

        for (const threshold of thresholds) {
          if (diffHours <= threshold.hours && diffHours > threshold.minHours) {
            const key = `${eventData.id}-${threshold.reminder}`;
            if (sentKeys.has(key)) continue;

            await this.sendNotificationWithStorage(userId, {
              title: threshold.title,
              body: threshold.buildBody(eventData.name),
              type: 'event_reminder',
              data: {
                eventId: eventData.id,
                reminder: threshold.reminder,
                eventName: eventData.name,
                scheduledAt: eventData.scheduled_datetime,
              },
            });

            sentKeys.add(key);
            created = true;
          }
        }
      }

      return created;
    } catch (err) {
      console.error('Error ensuring event reminders:', err);
      return false;
    }
  }

  // ===== NEW NOTIFICATIONS TABLE METHODS =====

  // Save notification to database
  async saveNotificationToDatabase(
    userId: string,
    notification: NotificationData
  ): Promise<NotificationData | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: notification.title,
          body: notification.body,
          type: notification.type,
          data: notification.data || {},
          read: false,
          image_url: notification.image_url || null,
          action_url: notification.action_url || null,
          scheduled_at: notification.scheduled_at || null,
        })
        .select('*')
        .single();

      if (error) {
        if (this.isRLSPolicyError(error)) {
          console.warn('Skipping notification DB save due to RLS policy. Please ensure notifications table policies permit inserts.');
          return null;
        }
        console.error('Error saving notification to database:', error);
        throw error;
      }

      console.log('✅ Notification saved to database for user:', userId);
      return this.mapNotificationRow(data);
    } catch (error) {
      console.error('Error saving notification to database:', error);
      return null;
    }
  }

  // Get user notifications
  async getUserNotifications(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user notifications:', error);
        return [];
      }

      return (data || []).map((item) => this.mapNotificationRow(item));
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  // Get unread notifications count
  async getUnreadNotificationsCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error fetching unread notifications count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
      return 0;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      console.log('✅ Notification marked as read:', notificationId);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
      }

      console.log('✅ All notifications marked as read for user:', userId);
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

      console.log('✅ Notification deleted:', notificationId);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  async createNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, any>,
    options: {
      scheduled_at?: string;
      title?: string;
      body?: string;
      image_url?: string;
      action_url?: string;
    } = {}
  ): Promise<NotificationData | null> {
    try {
      const notification: NotificationData = {
        title: options.title || data.title || 'Notification',
        body: options.body || data.body || '',
        type,
        data,
        image_url: options.image_url,
        action_url: options.action_url,
        scheduled_at: options.scheduled_at,
      };

      return await this.saveNotificationToDatabase(userId, notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  async sendNotification(notificationId: string): Promise<boolean> {
    try {
      const record = await this.getNotificationRecordById(notificationId);
      if (!record || !record.user_id) {
        console.warn('Notification not found or missing user_id:', notificationId);
        return false;
      }

      const shouldSend = await this.shouldSendNotification(record.user_id, record.type);
      if (!shouldSend) {
        console.log('Skipping notification due to user preferences/quiet hours');
        return false;
      }

      await this.sendPushNotification(record.user_id, {
        title: record.title,
        body: record.body,
        data: record.data,
        type: record.type,
      });

      const unreadCount = await this.getUnreadNotificationsCount(record.user_id);
      await this.setBadgeCount(unreadCount);
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  async sendBulkNotification(
    userIds: string[],
    type: NotificationType,
    data: Record<string, any>,
    options: {
      title?: string;
      body?: string;
      image_url?: string;
      action_url?: string;
    } = {}
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        await this.sendNotificationWithStorage(userId, {
          title: options.title || data.title || 'Notification',
          body: options.body || data.body || '',
          type,
          data,
          image_url: options.image_url,
          action_url: options.action_url,
        });
        success++;
      } catch (error) {
        console.error('Error sending bulk notification:', error);
        failed++;
      }
    }

    return { success, failed };
  }

  async scheduleNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, any>,
    scheduledAt: string,
    options: {
      title?: string;
      body?: string;
      image_url?: string;
      action_url?: string;
    } = {}
  ): Promise<NotificationData | null> {
    try {
      const notification = await this.createNotification(userId, type, data, {
        ...options,
        scheduled_at: scheduledAt,
        title: options.title || data.title,
        body: options.body || data.body,
      });

      if (notification?.id && new Date(scheduledAt).getTime() <= Date.now()) {
        await this.sendNotification(notification.id);
      }

      return notification;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async shouldSendNotification(userId: string, type: NotificationType): Promise<boolean> {
    try {
      if (!userId) return true;

      const preferences = await this.getNotificationPreferences(userId);
      if (!preferences.push_enabled) return false;

      const category = this.getCategoryForType(type);
      if (preferences.categories[category] === false) {
        return false;
      }

      if (this.isWithinQuietHours(preferences)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error determining notification preference:', error);
      return true;
    }
  }

  // Send notification with database storage
  async sendNotificationWithStorage(
    userId: string,
    notification: NotificationData
  ): Promise<void> {
    try {
      // Save to database first
      await this.saveNotificationToDatabase(userId, notification);

      // Then send push notification (respecting preferences)
      const shouldSend = await this.shouldSendNotification(userId, notification.type);
      if (shouldSend) {
        await this.sendPushNotification(userId, {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          type: notification.type,
        });
      }

      // Update badge count
      const unreadCount = await this.getUnreadNotificationsCount(userId);
      await this.setBadgeCount(unreadCount);

      console.log('✅ Notification sent and stored for user:', userId);
    } catch (error) {
      console.error('Error sending notification with storage:', error);
    }
  }
}

export const notificationService = new NotificationService();