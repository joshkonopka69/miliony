import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';
import { NavigationUtils } from '../navigation/utils';
import { ROUTES } from '../navigation/types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationPayload {
  token: string;
  title: string;
  body: string;
  data?: { [key: string]: any };
  imageUrl?: string;
  sound?: string;
  badge?: number;
  priority?: 'high' | 'normal';
  ttl?: number; // Time to live in seconds
}

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: 'min' | 'low' | 'default' | 'high' | 'max';
  sound?: string;
  vibration?: boolean;
  lights?: boolean;
  lightColor?: string;
}

class FCMService {
  private fcmToken: string | null = null;
  private isInitialized = false;

  // Initialize FCM service
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Check if device is physical
      if (!Device.isDevice) {
        console.warn('Must use physical device for push notifications');
        return false;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permissions not granted. Skipping FCM setup.');
        return false;
      }

      // Get FCM token
      this.fcmToken = await this.getFCMToken();
      if (!this.fcmToken) {
        console.warn('Failed to obtain FCM token. Push notifications will be disabled until permissions are granted.');
        return false;
      }

      // Create notification channels for Android
      if (Platform.OS === 'android') {
        await this.createNotificationChannels();
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log('✅ FCM service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing FCM service:', error);
      return false;
    }
  }

  // Get FCM token
  async getFCMToken(): Promise<string | null> {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'sportmap-cc906',
      });
      return token.data;
    } catch (error) {
      console.warn('Error getting FCM token:', error);
      return null;
    }
  }

  // Register FCM token with backend
  async registerToken(userId: string): Promise<boolean> {
    try {
      if (!this.fcmToken) {
        console.warn('No FCM token available');
        return false;
      }

      const { error } = await supabase
        .from('user_tokens')
        .upsert({
          user_id: userId,
          fcm_token: this.fcmToken,
          expo_push_token: this.fcmToken, // Ensure this matches notificationService lookup
          platform: Platform.OS, // Changed from device_type for consistency with notificationService
          device_id: Device.osInternalBuildId || 'unknown',
          updated_at: new Date().toISOString(),
        });


      if (error) {
        console.error('Error registering FCM token:', error);
        return false;
      }

      console.log('✅ FCM token registered successfully');
      return true;
    } catch (error) {
      console.error('Error registering FCM token:', error);
      return false;
    }
  }

  // Unregister FCM token
  async unregisterToken(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_tokens')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error unregistering FCM token:', error);
        return false;
      }

      console.log('✅ FCM token unregistered successfully');
      return true;
    } catch (error) {
      console.error('Error unregistering FCM token:', error);
      return false;
    }
  }

  // Send push notification
  async sendPushNotification(payload: PushNotificationPayload): Promise<boolean> {
    try {
      const message = {
        to: payload.token,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        sound: payload.sound || 'default',
        badge: payload.badge,
        priority: payload.priority || 'high',
        ttl: payload.ttl || 86400, // 24 hours default
        ...(payload.imageUrl && { image: payload.imageUrl }),
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();

      if (result.data && result.data[0] && result.data[0].status === 'ok') {
        console.log('✅ Push notification sent successfully');
        return true;
      } else {
        console.error('❌ Failed to send push notification:', result);
        return false;
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  // Send notification to multiple tokens
  async sendBulkPushNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: { [key: string]: any }
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const token of tokens) {
      const sent = await this.sendPushNotification({
        token,
        title,
        body,
        data,
      });

      if (sent) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }

  // Create notification channels for Android
  private async createNotificationChannels(): Promise<void> {
    try {
      const channels: NotificationChannel[] = [
        {
          id: 'events',
          name: 'Events',
          description: 'Notifications about sports events',
          importance: 'high',
          sound: 'default',
          vibration: true,
          lights: true,
          lightColor: '#FFD700',
        },
        {
          id: 'friends',
          name: 'Friends',
          description: 'Notifications about friends and social activities',
          importance: 'default',
          sound: 'default',
          vibration: true,
        },
        {
          id: 'messages',
          name: 'Messages',
          description: 'Chat messages and conversations',
          importance: 'high',
          sound: 'default',
          vibration: true,
          lights: true,
          lightColor: '#4CAF50',
        },
        {
          id: 'reminders',
          name: 'Reminders',
          description: 'Event reminders and notifications',
          importance: 'default',
          sound: 'default',
          vibration: true,
        },
        {
          id: 'system',
          name: 'System',
          description: 'System announcements and updates',
          importance: 'low',
          sound: 'default',
          vibration: false,
        },
      ];

      for (const channel of channels) {
        await Notifications.setNotificationChannelAsync(channel.id, {
          name: channel.name,
          description: channel.description,
          importance: Notifications.AndroidImportance[channel.importance.toUpperCase() as keyof typeof Notifications.AndroidImportance],
          sound: channel.sound,
          vibrationPattern: channel.vibration ? [0, 250, 250, 250] : undefined,
          lightColor: channel.lightColor,
          enableLights: channel.lights,
          enableVibrate: channel.vibration,
        });
      }

      console.log('✅ Notification channels created successfully');
    } catch (error) {
      console.error('Error creating notification channels:', error);
    }
  }

  // Set up notification listeners
  private setupNotificationListeners(): void {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification received:', notification);
      // You can handle the notification here, e.g., update UI, play sound, etc.
    });

    // Handle notification tapped/opened
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification tapped:', response);
      // Handle notification tap, e.g., navigate to specific screen
      this.handleNotificationTap(response);
    });
  }

  // Handle notification tap
  private handleNotificationTap(response: Notifications.NotificationResponse): void {
    try {
      const data = response.notification.request.content.data;

      if (data?.action_url && typeof data.action_url === 'string') {
        const url = data.action_url;
        console.log('Navigate to action_url:', url);

        // Handle custom sportapp:// links or direct routes
        if (url.startsWith('sportapp://')) {
          const parsed = url.replace('sportapp://', '');
          const [route, query] = parsed.split('?');
          NavigationUtils.navigate(route as any);
        } else {
          NavigationUtils.navigate(url as any);
        }
      }

      if (data?.type) {
        // Handle different notification types
        switch (data.type) {
          case 'friend_request':
            NavigationUtils.navigate(ROUTES.FRIEND_REQUESTS);
            break;
          case 'friend_request_accepted':
            if (data.acceptorId) {
              NavigationUtils.navigate(ROUTES.PROFILE, { userId: String(data.acceptorId) });
            }
            break;
          case 'event_invitation':
          case 'event_reminder':
          case 'event_participant_joined':
          case 'event_created':
          case 'event_updated':
            console.log('Navigate to event:', data.event_id || data.eventId);
            NavigationUtils.navigate(ROUTES.EVENT_DETAILS, {
              eventId: (data.event_id || data.eventId) as string,
              id: (data.event_id || data.eventId) as string
            });
            break;
          case 'group_invite':
          case 'group_invite_accepted':
            if (data.groupId) {
              NavigationUtils.navigate(ROUTES.GROUP_DETAILS as any, { groupId: data.groupId });
            } else {
              NavigationUtils.navigate(ROUTES.MY_GROUPS);
            }
            break;
          case 'achievement_unlocked':
            NavigationUtils.navigate(ROUTES.ALL_BADGES);
            break;
          case 'chat_message':
            console.log('Navigate to chat:', data.chat_id || data.chatId);
            NavigationUtils.navigate(ROUTES.GAME_CHAT, {
              game: { id: data.event_id || data.eventId || data.chat_id || data.chatId }
            });
            break;
          default:
            console.log('Handle notification type:', data.type);
            // Default to notifications screen for unknown types
            NavigationUtils.navigate(ROUTES.NOTIFICATIONS);
        }
      } else if (data?.action_url) {
        // Fallback for action_url if type is missing
        console.log('Handle action_url:', data.action_url);
        NavigationUtils.navigate(ROUTES.NOTIFICATIONS);
      }
    } catch (error) {
      console.error('Error handling notification tap:', error);
    }
  }

  // Schedule local notification
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: { [key: string]: any },
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string | null> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: trigger || null,
      });

      console.log('✅ Local notification scheduled:', identifier);
      return identifier;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      return null;
    }
  }

  // Cancel scheduled notification
  async cancelScheduledNotification(identifier: string): Promise<boolean> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log('✅ Scheduled notification cancelled:', identifier);
      return true;
    } catch (error) {
      console.error('Error cancelling scheduled notification:', error);
      return false;
    }
  }

  // Cancel all scheduled notifications
  async cancelAllScheduledNotifications(): Promise<boolean> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ All scheduled notifications cancelled');
      return true;
    } catch (error) {
      console.error('Error cancelling all scheduled notifications:', error);
      return false;
    }
  }

  // Get notification permissions
  async getPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    try {
      return await Notifications.getPermissionsAsync();
    } catch (error) {
      console.error('Error getting notification permissions:', error);
      return { status: Notifications.PermissionStatus.UNDETERMINED, expires: 'never', granted: false, canAskAgain: true };
    }
  }

  // Request notification permissions
  async requestPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    try {
      return await Notifications.requestPermissionsAsync();
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return { status: Notifications.PermissionStatus.DENIED, expires: 'never', granted: false, canAskAgain: true };
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
  async setBadgeCount(count: number): Promise<boolean> {
    try {
      await Notifications.setBadgeCountAsync(count);
      return true;
    } catch (error) {
      console.error('Error setting badge count:', error);
      return false;
    }
  }

  // Clear badge count
  async clearBadgeCount(): Promise<boolean> {
    try {
      await Notifications.setBadgeCountAsync(0);
      return true;
    } catch (error) {
      console.error('Error clearing badge count:', error);
      return false;
    }
  }

  // Get FCM token (public method)
  getToken(): string | null {
    return this.fcmToken;
  }

  // Check if service is initialized
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  // Test notification
  async sendTestNotification(): Promise<boolean> {
    try {
      if (!this.fcmToken) {
        console.error('No FCM token available for test notification');
        return false;
      }

      return await this.sendPushNotification({
        token: this.fcmToken,
        title: 'Test Notification',
        body: 'This is a test notification from SportMap',
        data: { type: 'test', timestamp: Date.now() },
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }
}

// Create and export singleton instance
export const fcmService = new FCMService();
export default fcmService;
