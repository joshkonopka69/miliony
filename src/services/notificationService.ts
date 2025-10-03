import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
  type: 'event_reminder' | 'participant_joined' | 'event_cancelled' | 'event_updated' | 'general';
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
}

export const notificationService = new NotificationService();