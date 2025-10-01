// Push notification service for real-time updates
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { Event } from './firestore';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private static expoPushToken: string | null = null;

  // Register for push notifications
  static async registerForPushNotifications(): Promise<string | null> {
    console.log('🔔 Registering for push notifications...');
    
    if (!Device.isDevice) {
      console.log('❌ Must use physical device for push notifications');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Failed to get push token for push notification!');
      return null;
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with your Expo project ID
      });
      
      this.expoPushToken = token.data;
      console.log('✅ Push token received:', this.expoPushToken);
      
      // Store token in Supabase
      await this.storePushToken(this.expoPushToken);
      
      return this.expoPushToken;
    } catch (error) {
      console.error('❌ Error getting push token:', error);
      return null;
    }
  }

  // Store push token in database
  private static async storePushToken(token: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_tokens')
        .upsert({
          user_id: user.id,
          push_token: token,
          platform: Platform.OS,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error storing push token:', error);
      } else {
        console.log('✅ Push token stored successfully');
      }
    } catch (error) {
      console.error('❌ Error in storePushToken:', error);
    }
  }

  // Send notification to specific user
  static async sendNotificationToUser(
    userId: string, 
    title: string, 
    body: string, 
    data?: any
  ) {
    try {
      // Get user's push token
      const { data: tokenData } = await supabase
        .from('user_tokens')
        .select('push_token')
        .eq('user_id', userId)
        .single();

      if (!tokenData?.push_token) {
        console.log('❌ No push token found for user:', userId);
        return;
      }

      // Send push notification
      const message = {
        to: tokenData.push_token,
        sound: 'default',
        title,
        body,
        data: data || {},
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
      console.log('📤 Notification sent:', result);
      
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  }

  // Send event notification to participants
  static async sendEventNotification(event: Event, participants: string[]) {
    console.log('📅 Sending event notification...');
    
    const title = `New Event: ${event.activity}`;
    const body = `${event.description} at ${event.placeName}`;
    
    // Send to all participants
    for (const participantId of participants) {
      await this.sendNotificationToUser(participantId, title, body, {
        type: 'event',
        eventId: event.id,
        action: 'view_event'
      });
    }
  }

  // Send friend request notification
  static async sendFriendRequestNotification(
    receiverId: string, 
    senderName: string
  ) {
    console.log('👥 Sending friend request notification...');
    
    const title = 'New Friend Request';
    const body = `${senderName} wants to be your friend`;
    
    await this.sendNotificationToUser(receiverId, title, body, {
      type: 'friend_request',
      action: 'view_friends'
    });
  }

  // Send message notification
  static async sendMessageNotification(
    receiverId: string, 
    senderName: string, 
    message: string
  ) {
    console.log('💬 Sending message notification...');
    
    const title = `Message from ${senderName}`;
    const body = message.length > 50 ? message.substring(0, 50) + '...' : message;
    
    await this.sendNotificationToUser(receiverId, title, body, {
      type: 'message',
      action: 'view_chat'
    });
  }

  // Schedule local notification
  static async scheduleLocalNotification(
    title: string,
    body: string,
    triggerDate: Date,
    data?: any
  ) {
    console.log('⏰ Scheduling local notification...');
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
      },
      trigger: triggerDate,
    });
  }

  // Cancel all scheduled notifications
  static async cancelAllScheduledNotifications() {
    console.log('❌ Canceling all scheduled notifications...');
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get notification permissions status
  static async getNotificationPermissions() {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  // Check if notifications are enabled
  static async areNotificationsEnabled(): Promise<boolean> {
    const status = await this.getNotificationPermissions();
    return status === 'granted';
  }

  // Get current push token
  static getCurrentPushToken(): string | null {
    return this.expoPushToken;
  }
}

export default NotificationService;