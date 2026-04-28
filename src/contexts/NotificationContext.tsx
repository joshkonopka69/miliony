import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { notificationService, NotificationData, NotificationPreferences, NotificationStats } from '../services/notificationService';
import { fcmService } from '../services/fcmService';
import { useAuth } from './AuthContext';
import { supabase } from '../config/supabase';

interface NotificationContextType {
  // State
  notifications: NotificationData[];
  preferences: NotificationPreferences | null;
  stats: NotificationStats | null;
  unreadCount: number;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;

  // FCM State
  fcmToken: string | null;
  isFCMInitialized: boolean;
  permissions: {
    granted: boolean;
    canAskAgain: boolean;
  };

  // Actions
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<boolean>;
  sendTestNotification: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;

  // FCM Actions
  initializeFCM: () => Promise<boolean>;
  registerToken: () => Promise<boolean>;
  unregisterToken: () => Promise<boolean>;

  // Utility
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();

  // State
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FCM State
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isFCMInitialized, setIsFCMInitialized] = useState(false);
  const [permissions, setPermissions] = useState({
    granted: false,
    canAskAgain: true,
  });


  // Initialize FCM service
  const initializeFCM = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const initialized = await fcmService.initialize();
      // Initialize local notification service as well
      await notificationService.initialize();

      if (initialized) {

        setIsFCMInitialized(true);
        setFcmToken(fcmService.getToken());

        // Check permissions
        const perms = await fcmService.getPermissions();
        setPermissions({
          granted: perms.status === 'granted',
          canAskAgain: perms.status !== 'denied',
        });

        // Register token if user is authenticated
        if (user && perms.status === 'granted') {
          await registerToken();
        }
      }

      return initialized;
    } catch (error) {
      console.error('Error initializing FCM:', error);
      setError('Failed to initialize notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register FCM token
  const registerToken = async (): Promise<boolean> => {
    try {
      if (!user) return false;

      const success = await fcmService.registerToken(user.id);
      if (success) {
        console.log('✅ FCM token registered successfully');
      }
      return success;
    } catch (error) {
      console.error('Error registering FCM token:', error);
      setError('Failed to register notification token');
      return false;
    }
  };

  // Unregister FCM token
  const unregisterToken = async (): Promise<boolean> => {
    try {
      if (!user) return false;

      const success = await fcmService.unregisterToken(user.id);
      if (success) {
        console.log('✅ FCM token unregistered successfully');
      }
      return success;
    } catch (error) {
      console.error('Error unregistering FCM token:', error);
      setError('Failed to unregister notification token');
      return false;
    }
  };

  // Request notification permissions
  const requestPermissions = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const perms = await fcmService.requestPermissions();
      setPermissions({
        granted: perms.status === 'granted',
        canAskAgain: perms.status !== 'denied',
      });

      if (perms.status === 'granted' && user) {
        await registerToken();
      }

      return perms.status === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setError('Failed to request notification permissions');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load user data
  const loadUserData = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Ensure reminders exist before fetching
      await notificationService.ensureEventReminders(user.id);

      // Load notifications, preferences, and stats in parallel
      const [notificationsData, preferencesData, statsData] = await Promise.all([
        notificationService.getUserNotifications(user.id, 50),
        notificationService.getNotificationPreferences(user.id),
        notificationService.getNotificationStats(user.id),
      ]);

      setNotifications(notificationsData);
      setPreferences(preferencesData);
      setStats(statsData);

      // Calculate unread count
      const unread = notificationsData.filter(n => !n.read).length;
      setUnreadCount(unread);

      // Update badge count
      await fcmService.setBadgeCount(unread);
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Refresh notifications
  const refreshNotifications = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // NOTE: Removed ensureEventReminders() here - it was causing duplicate reminders
      // when real-time subscription triggered refresh. Reminders are checked on initial load only.
      const notificationsData = await notificationService.getUserNotifications(user.id, 50);
      setNotifications(notificationsData);

      // Update unread count
      const unread = notificationsData.filter(n => !n.read).length;
      setUnreadCount(unread);

      // Update badge count
      await fcmService.setBadgeCount(unread);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      setError('Failed to refresh notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = async (notificationId: string): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);

      const success = await notificationService.markAsRead(notificationId);
      if (success) {
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );

        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Update badge count
        await fcmService.setBadgeCount(unreadCount - 1);
      }

      return success;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsUpdating(true);
      setError(null);

      const success = await notificationService.markAllAsRead(user.id);
      if (success) {
        // Update local state
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );

        // Update unread count
        setUnreadCount(0);

        // Clear badge count
        await fcmService.clearBadgeCount();
      }

      return success;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark all notifications as read');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);

      const success = await notificationService.deleteNotification(notificationId);
      if (success) {
        // Update local state
        setNotifications(prev => prev.filter(n => n.id !== notificationId));

        // Update unread count if the deleted notification was unread
        const deletedNotification = notifications.find(n => n.id === notificationId);
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
          await fcmService.setBadgeCount(unreadCount - 1);
        }
      }

      return success;
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError('Failed to delete notification');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Update notification preferences
  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsUpdating(true);
      setError(null);

      const updatedPreferences = await notificationService.updateNotificationPreferences(
        user.id,
        newPreferences
      );

      if (updatedPreferences) {
        setPreferences(updatedPreferences);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating preferences:', error);
      setError('Failed to update notification preferences');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Send test notification
  const sendTestNotification = async (): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);

      const success = await fcmService.sendTestNotification();
      if (!success) {
        setError('Failed to send test notification');
      }

      return success;
    } catch (error) {
      console.error('Error sending test notification:', error);
      setError('Failed to send test notification');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Clear error
  const clearError = (): void => {
    setError(null);
  };

  // Lifecycle effects - moved after callbacks to avoid hoisting errors
  useEffect(() => {
    if (user) {
      initializeFCM();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setNotifications([]);
      setPreferences(null);
      setStats(null);
      setUnreadCount(0);
    }
  }, [user, loadUserData]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          refreshNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshNotifications]);

  const contextValue: NotificationContextType = {
    // State
    notifications,
    preferences,
    stats,
    unreadCount,
    isLoading,
    isUpdating,
    error,

    // FCM State
    fcmToken,
    isFCMInitialized,
    permissions,

    // Actions
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    sendTestNotification,
    requestPermissions,

    // FCM Actions
    initializeFCM,
    registerToken,
    unregisterToken,

    // Utility
    clearError,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
