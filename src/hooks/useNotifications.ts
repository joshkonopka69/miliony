import { useNotifications as useNotificationContext } from '../contexts/NotificationContext';
import { notificationService, NotificationType } from '../services/notificationService';
import { fcmService } from '../services/fcmService';

// Re-export the context hook for convenience
export { useNotificationContext as useNotifications };

// Additional hook for notification management
export function useNotificationManager() {
  const context = useNotificationContext();
  
  // Create and send notification
  const createNotification = async (
    userId: string,
    type: NotificationType,
    data: { [key: string]: any },
    options: {
      scheduled_at?: string;
      image_url?: string;
      action_url?: string;
    } = {}
  ) => {
    try {
      const notification = await notificationService.createNotification(
        userId,
        type,
        data,
        options
      );
      
      if (notification) {
        // Send immediately if not scheduled
        if (!options.scheduled_at) {
          await notificationService.sendNotification(notification.id);
        }
        
        // Refresh notifications if it's for current user
        if (context.notifications.length > 0) {
          await context.refreshNotifications();
        }
      }
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  };

  // Send notification to multiple users
  const sendBulkNotification = async (
    userIds: string[],
    type: NotificationType,
    data: { [key: string]: any },
    options: {
      scheduled_at?: string;
      image_url?: string;
      action_url?: string;
    } = {}
  ) => {
    try {
      const result = await notificationService.sendBulkNotification(
        userIds,
        type,
        data,
        options
      );
      
      return result;
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      return { success: 0, failed: userIds.length };
    }
  };

  // Schedule notification
  const scheduleNotification = async (
    userId: string,
    type: NotificationType,
    data: { [key: string]: any },
    scheduledAt: string,
    options: {
      image_url?: string;
      action_url?: string;
    } = {}
  ) => {
    try {
      const notification = await notificationService.scheduleNotification(
        userId,
        type,
        data,
        scheduledAt,
        options
      );
      
      return notification;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  };

  // Get notification by ID
  const getNotificationById = async (notificationId: string) => {
    try {
      // This would need to be implemented in the service
      // For now, find in local state
      return context.notifications.find(n => n.id === notificationId);
    } catch (error) {
      console.error('Error getting notification by ID:', error);
      return null;
    }
  };

  // Filter notifications by type
  const getNotificationsByType = (type: NotificationType) => {
    return context.notifications.filter(n => n.type === type);
  };

  // Filter unread notifications
  const getUnreadNotifications = () => {
    return context.notifications.filter(n => !n.is_read);
  };

  // Filter notifications by date range
  const getNotificationsByDateRange = (startDate: Date, endDate: Date) => {
    return context.notifications.filter(n => {
      const notificationDate = new Date(n.created_at);
      return notificationDate >= startDate && notificationDate <= endDate;
    });
  };

  // Search notifications
  const searchNotifications = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return context.notifications.filter(n => 
      n.title.toLowerCase().includes(lowercaseQuery) ||
      n.body.toLowerCase().includes(lowercaseQuery)
    );
  };

  // Get notification count by type
  const getNotificationCountByType = () => {
    const counts: { [key: string]: number } = {};
    context.notifications.forEach(n => {
      counts[n.type] = (counts[n.type] || 0) + 1;
    });
    return counts;
  };

  // Get recent notifications (last 7 days)
  const getRecentNotifications = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return context.notifications.filter(n => 
      new Date(n.created_at) >= sevenDaysAgo
    );
  };

  // Check if user has notification preferences
  const hasNotificationPreferences = () => {
    return context.preferences !== null;
  };

  // Get notification preference for category
  const getCategoryPreference = (category: keyof typeof context.preferences.categories) => {
    return context.preferences?.categories[category] ?? true;
  };

  // Check if quiet hours are active
  const isQuietHoursActive = () => {
    if (!context.preferences?.quiet_hours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const startTime = context.preferences.quiet_hours.start_time;
    const endTime = context.preferences.quiet_hours.end_time;
    
    if (startTime > endTime) {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      // Quiet hours within same day
      return currentTime >= startTime && currentTime <= endTime;
    }
  };

  // Check if notification should be sent based on preferences
  const shouldSendNotification = async (type: NotificationType) => {
    try {
      return await notificationService.shouldSendNotification(
        context.notifications[0]?.user_id || '',
        type
      );
    } catch (error) {
      console.error('Error checking notification preferences:', error);
      return true; // Default to sending on error
    }
  };

  // Update notification preferences with validation
  const updatePreferencesWithValidation = async (
    newPreferences: Partial<typeof context.preferences>
  ) => {
    try {
      // Validate preferences
      if (newPreferences.categories) {
        // Ensure at least one category is enabled
        const hasEnabledCategory = Object.values(newPreferences.categories).some(Boolean);
        if (!hasEnabledCategory) {
          throw new Error('At least one notification category must be enabled');
        }
      }

      if (newPreferences.quiet_hours) {
        // Validate time format
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (newPreferences.quiet_hours.start_time && !timeRegex.test(newPreferences.quiet_hours.start_time)) {
          throw new Error('Invalid start time format. Use HH:MM format');
        }
        if (newPreferences.quiet_hours.end_time && !timeRegex.test(newPreferences.quiet_hours.end_time)) {
          throw new Error('Invalid end time format. Use HH:MM format');
        }
      }

      return await context.updatePreferences(newPreferences);
    } catch (error) {
      console.error('Error updating preferences with validation:', error);
      return false;
    }
  };

  // Reset notification preferences to default
  const resetPreferencesToDefault = async () => {
    try {
      const defaultPreferences = {
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

      return await context.updatePreferences(defaultPreferences);
    } catch (error) {
      console.error('Error resetting preferences to default:', error);
      return false;
    }
  };

  // Export notification data
  const exportNotificationData = async () => {
    try {
      // This would need to be implemented in the service
      // For now, return local notifications
      return {
        notifications: context.notifications,
        preferences: context.preferences,
        stats: context.stats,
        exported_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error exporting notification data:', error);
      return null;
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      // Delete all notifications for current user
      const deletePromises = context.notifications.map(n => 
        context.deleteNotification(n.id)
      );
      
      const results = await Promise.all(deletePromises);
      const successCount = results.filter(Boolean).length;
      
      return successCount === context.notifications.length;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      return false;
    }
  };

  // Get notification statistics
  const getNotificationStatistics = () => {
    if (!context.stats) return null;
    
    return {
      totalSent: context.stats.total_sent,
      totalRead: context.stats.total_read,
      readRate: context.stats.read_rate,
      unreadCount: context.stats.unread_count,
      byType: context.stats.by_type,
      byDate: context.stats.by_date,
    };
  };

  // Check FCM status
  const getFCMStatus = () => {
    return {
      isInitialized: context.isFCMInitialized,
      hasToken: !!context.fcmToken,
      permissionsGranted: context.permissions.granted,
      canAskAgain: context.permissions.canAskAgain,
    };
  };

  // Test FCM connection
  const testFCMConnection = async () => {
    try {
      if (!context.isFCMInitialized) {
        return { success: false, error: 'FCM not initialized' };
      }
      
      const success = await context.sendTestNotification();
      return { success, error: success ? null : 'Failed to send test notification' };
    } catch (error) {
      console.error('Error testing FCM connection:', error);
      return { success: false, error: 'FCM test failed' };
    }
  };

  return {
    // Context
    ...context,
    
    // Additional methods
    createNotification,
    sendBulkNotification,
    scheduleNotification,
    getNotificationById,
    getNotificationsByType,
    getUnreadNotifications,
    getNotificationsByDateRange,
    searchNotifications,
    getNotificationCountByType,
    getRecentNotifications,
    hasNotificationPreferences,
    getCategoryPreference,
    isQuietHoursActive,
    shouldSendNotification,
    updatePreferencesWithValidation,
    resetPreferencesToDefault,
    exportNotificationData,
    clearAllNotifications,
    getNotificationStatistics,
    getFCMStatus,
    testFCMConnection,
  };
}
