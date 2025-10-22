import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  type: 'event_invite' | 'friend_request' | 'event_update' | 'event_reminder' | 'event_cancelled' | 'event_updated' | 'general';
}

class NotificationService {
  private expoPushToken: string | null = null;
  private isInitialized = false;

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
        }),
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
        .select('expo_push_token')
        .eq('user_id', userId)
        .not('expo_push_token', 'is', null);

      if (!tokens || tokens.length === 0) {
        console.warn('No push tokens found for user:', userId);
        return;
      }

      const messages = tokens.map(token => ({
        to: token.expo_push_token,
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
          date: reminderTime,
        },
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

  // Get user notifications from database
  async getUserNotifications(userId: string, options: { limit?: number } = {}): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(options.limit || 50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Get notification preferences
  async getNotificationPreferences(userId: string): Promise<any> {
    try {
      const settings = await this.getNotificationSettings();
      return {
        eventReminders: settings.eventReminders,
        participantUpdates: settings.participantUpdates,
        eventUpdates: settings.eventUpdates,
        pushEnabled: true,
        emailEnabled: false,
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        eventReminders: true,
        participantUpdates: true,
        eventUpdates: true,
        pushEnabled: true,
        emailEnabled: false,
      };
    }
  }

  // Get notification stats
  async getNotificationStats(userId: string): Promise<any> {
    try {
      const notifications = await this.getUserNotifications(userId);
      const unreadCount = notifications.filter(n => !n.read).length;
      return {
        total: notifications.length,
        unread: unreadCount,
        read: notifications.length - unreadCount,
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return {
        total: 0,
        unread: 0,
        read: 0,
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

  // ===== NEW NOTIFICATIONS TABLE METHODS =====

  // Save notification to database
  async saveNotificationToDatabase(
    userId: string,
    notification: NotificationData
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: notification.title,
          body: notification.body,
          type: notification.type,
          data: notification.data || {},
          read: false,
        });

      if (error) {
        console.error('Error saving notification to database:', error);
        throw error;
      }

      console.log('✅ Notification saved to database for user:', userId);
    } catch (error) {
      console.error('Error saving notification to database:', error);
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

      return data || [];
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
  async markNotificationAsRead(notificationId: string): Promise<void> {
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
        throw error;
      }

      console.log('✅ Notification marked as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read for user
  async markAllNotificationsAsRead(userId: string): Promise<void> {
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
        throw error;
      }

      console.log('✅ All notifications marked as read for user:', userId);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        throw error;
      }

      console.log('✅ Notification deleted:', notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
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

      // Then send push notification
      await this.sendPushNotification(userId, notification);

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