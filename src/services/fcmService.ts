/**
 * FCM Service Stub
 * 
 * This is a compatibility layer that replaces Firebase Cloud Messaging (FCM)
 * with Expo Notifications. It maintains the same API interface to prevent
 * breaking changes in the application.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';

interface PermissionStatus {
  status: 'granted' | 'denied' | 'undetermined';
  canAskAgain: boolean;
}

class FCMService {
  private token: string | null = null;
  private isInitialized = false;

  /**
   * Initialize the notification service
   * Uses Expo Notifications instead of Firebase FCM
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Skip in Expo Go on simulator
      if (__DEV__ && !Device.isDevice) {
        console.log('[FCMService] Notifications disabled in Expo Go simulator');
        this.isInitialized = true;
        return true;
      }

      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
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
        console.log('[FCMService] Notification permissions not granted');
        this.isInitialized = true;
        return true;
      }

      // Get push token
      if (Device.isDevice) {
        try {
          const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'SportsMap-cc906',
          });
          this.token = tokenData.data;
          console.log('[FCMService] Push token obtained:', this.token?.substring(0, 20) + '...');
        } catch (tokenError) {
          console.warn('[FCMService] Could not get push token:', tokenError);
        }
      }

      // Set up Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      this.isInitialized = true;
      console.log('[FCMService] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[FCMService] Initialization error:', error);
      this.isInitialized = true; // Mark as initialized to prevent retries
      return false;
    }
  }

  /**
   * Get the current push token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Get current permission status
   */
  async getPermissions(): Promise<PermissionStatus> {
    try {
      const { status, canAskAgain } = await Notifications.getPermissionsAsync();
      return {
        status: status as 'granted' | 'denied' | 'undetermined',
        canAskAgain: canAskAgain ?? true,
      };
    } catch (error) {
      console.error('[FCMService] Error getting permissions:', error);
      return { status: 'undetermined', canAskAgain: true };
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<PermissionStatus> {
    try {
      const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
      return {
        status: status as 'granted' | 'denied' | 'undetermined',
        canAskAgain: canAskAgain ?? false,
      };
    } catch (error) {
      console.error('[FCMService] Error requesting permissions:', error);
      return { status: 'denied', canAskAgain: false };
    }
  }

  /**
   * Register push token for a user
   */
  async registerToken(userId: string): Promise<boolean> {
    if (!this.token) {
      console.warn('[FCMService] No token to register');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_tokens')
        .upsert(
          {
            user_id: userId,
            expo_push_token: this.token,
            platform: Platform.OS,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('[FCMService] Error registering token:', error);
        return false;
      }

      console.log('[FCMService] Token registered for user:', userId);
      return true;
    } catch (error) {
      console.error('[FCMService] Error registering token:', error);
      return false;
    }
  }

  /**
   * Unregister push token for a user
   */
  async unregisterToken(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_tokens')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('[FCMService] Error unregistering token:', error);
        return false;
      }

      console.log('[FCMService] Token unregistered for user:', userId);
      return true;
    } catch (error) {
      console.error('[FCMService] Error unregistering token:', error);
      return false;
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(Math.max(0, count));
    } catch (error) {
      console.error('[FCMService] Error setting badge count:', error);
    }
  }

  /**
   * Clear badge count
   */
  async clearBadgeCount(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('[FCMService] Error clearing badge count:', error);
    }
  }

  /**
   * Send a test notification
   */
  async sendTestNotification(): Promise<boolean> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification 🎉',
          body: 'This is a test notification from SportsMap!',
          data: { type: 'test' },
          sound: 'default',
        },
        trigger: null, // Show immediately
      });

      console.log('[FCMService] Test notification sent');
      return true;
    } catch (error) {
      console.error('[FCMService] Error sending test notification:', error);
      return false;
    }
  }
}

// Export singleton instance
export const fcmService = new FCMService();
