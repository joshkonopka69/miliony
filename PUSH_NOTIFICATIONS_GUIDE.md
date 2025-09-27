# Push Notifications Implementation Guide

This guide covers the complete implementation of push notifications for SportMap using Firebase Cloud Messaging (FCM) with Expo.

## Overview

The push notification system includes:
- Firebase Cloud Messaging integration
- Notification service with templates
- Context and hooks for state management
- Notification settings component
- Support for various notification types
- Quiet hours and preferences management

## Files Created

### Services
- `src/services/notificationService.ts` - Core notification management
- `src/services/fcmService.ts` - Firebase Cloud Messaging integration

### Context & Hooks
- `src/contexts/NotificationContext.tsx` - Global notification state
- `src/hooks/useNotifications.ts` - Notification management hook

### Components
- `src/components/NotificationSettings.tsx` - Settings UI component

## Setup Instructions

### 1. Install Required Dependencies

```bash
npm install expo-notifications expo-device
```

### 2. Configure Firebase

Add to your `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#FFD700",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
}
```

### 3. Environment Variables

Add to your `.env`:
```
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
```

### 4. Database Schema

Create the following tables in your Supabase database:

```sql
-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  image_url TEXT,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_sent BOOLEAN DEFAULT FALSE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification preferences table
CREATE TABLE notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  categories JSONB DEFAULT '{
    "events": true,
    "friends": true,
    "messages": true,
    "reminders": true,
    "system": true,
    "marketing": false
  }',
  quiet_hours JSONB DEFAULT '{
    "enabled": false,
    "start_time": "22:00",
    "end_time": "08:00",
    "timezone": "UTC"
  }',
  frequency JSONB DEFAULT '{
    "immediate": true,
    "daily_digest": false,
    "weekly_digest": false
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User tokens table
CREATE TABLE user_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL,
  device_type VARCHAR(20),
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, fcm_token)
);

-- Indexes for better performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_user_tokens_user_id ON user_tokens(user_id);
CREATE INDEX idx_user_tokens_fcm_token ON user_tokens(fcm_token);
```

## Usage

### 1. Initialize Notifications

In your main App component:

```tsx
import { NotificationProvider } from './src/contexts/NotificationContext';

export default function App() {
  return (
    <NotificationProvider>
      {/* Your app components */}
    </NotificationProvider>
  );
}
```

### 2. Using the Notification Hook

```tsx
import { useNotificationManager } from './src/hooks/useNotifications';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    createNotification,
    sendTestNotification,
  } = useNotificationManager();

  // Create a notification
  const handleCreateNotification = async () => {
    await createNotification(
      'user-id',
      'friend_request',
      {
        sender_name: 'John Doe',
        sender_id: 'sender-id'
      }
    );
  };

  return (
    <View>
      <Text>Unread notifications: {unreadCount}</Text>
      <TouchableOpacity onPress={sendTestNotification}>
        <Text>Send Test Notification</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 3. Notification Settings Component

```tsx
import NotificationSettings from './src/components/NotificationSettings';

function SettingsScreen() {
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  return (
    <View>
      <TouchableOpacity onPress={() => setShowNotificationSettings(true)}>
        <Text>Notification Settings</Text>
      </TouchableOpacity>
      
      <NotificationSettings
        visible={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />
    </View>
  );
}
```

## Notification Types

The system supports the following notification types:

### Event Notifications
- `new_event_nearby` - New event created nearby
- `event_invitation` - Invited to an event
- `event_cancelled` - Event was cancelled
- `event_updated` - Event details changed
- `event_reminder` - Event starting soon
- `event_starting_soon` - Event starting in X minutes
- `event_participant_joined` - Someone joined your event
- `event_participant_left` - Someone left your event

### Social Notifications
- `friend_request` - New friend request
- `friend_request_accepted` - Friend request accepted
- `friend_activity` - Friend's activity update
- `chat_message` - New chat message

### System Notifications
- `system_announcement` - App updates and announcements
- `weather_alert` - Weather affecting events
- `achievement_unlocked` - New achievement earned

## Creating Notifications

### Basic Notification
```tsx
await createNotification(
  userId,
  'friend_request',
  {
    sender_name: 'John Doe',
    sender_id: 'sender-id'
  }
);
```

### Scheduled Notification
```tsx
await createNotification(
  userId,
  'event_reminder',
  {
    event_name: 'Basketball Game',
    time_remaining: '1 hour'
  },
  {
    scheduled_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
  }
);
```

### Notification with Image and Action
```tsx
await createNotification(
  userId,
  'new_event_nearby',
  {
    sport: 'Basketball',
    event_name: 'Basketball Game',
    location: 'Central Park',
    distance: '0.5'
  },
  {
    image_url: 'https://example.com/event-image.jpg',
    action_url: '/events/event-id'
  }
);
```

## Notification Preferences

Users can customize their notification preferences:

### Categories
- **Events**: Event-related notifications
- **Friends**: Social and friend notifications
- **Messages**: Chat and communication
- **Reminders**: Event reminders and alerts
- **System**: App updates and system messages
- **Marketing**: Promotional content

### Quiet Hours
- Enable/disable quiet hours
- Set start and end times
- Automatically pause notifications during specified hours

### Frequency Options
- **Immediate**: Receive notifications as they happen
- **Daily Digest**: Daily summary of notifications
- **Weekly Digest**: Weekly summary of notifications

## Testing Notifications

### 1. Test FCM Connection
```tsx
const { testFCMConnection } = useNotificationManager();

const handleTest = async () => {
  const result = await testFCMConnection();
  if (result.success) {
    console.log('Test notification sent successfully');
  } else {
    console.error('Test failed:', result.error);
  }
};
```

### 2. Check FCM Status
```tsx
const { getFCMStatus } = useNotificationManager();

const status = getFCMStatus();
console.log('FCM Status:', status);
// {
//   isInitialized: true,
//   hasToken: true,
//   permissionsGranted: true,
//   canAskAgain: true
// }
```

## Advanced Features

### 1. Bulk Notifications
```tsx
const { sendBulkNotification } = useNotificationManager();

await sendBulkNotification(
  ['user1', 'user2', 'user3'],
  'system_announcement',
  {
    announcement_text: 'App update available!'
  }
);
```

### 2. Notification Statistics
```tsx
const { getNotificationStatistics } = useNotificationManager();

const stats = getNotificationStatistics();
console.log('Notification Stats:', stats);
// {
//   totalSent: 150,
//   totalRead: 120,
//   readRate: 80,
//   unreadCount: 5,
//   byType: { 'friend_request': 10, 'event_invitation': 5 },
//   byDate: { '2024-01-01': 20, '2024-01-02': 15 }
// }
```

### 3. Search and Filter
```tsx
const { searchNotifications, getNotificationsByType } = useNotificationManager();

// Search notifications
const searchResults = searchNotifications('friend');

// Filter by type
const friendRequests = getNotificationsByType('friend_request');
```

## Error Handling

The system includes comprehensive error handling:

```tsx
const {
  error,
  clearError,
  isLoading,
  isUpdating
} = useNotificationManager();

if (error) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity onPress={clearError}>
        <Text>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Best Practices

### 1. Permission Handling
Always check and request permissions before sending notifications:

```tsx
const { requestPermissions, permissions } = useNotificationManager();

if (!permissions.granted) {
  await requestPermissions();
}
```

### 2. Token Management
Register and unregister tokens when users log in/out:

```tsx
useEffect(() => {
  if (user) {
    registerToken();
  } else {
    unregisterToken();
  }
}, [user]);
```

### 3. Quiet Hours
Respect user's quiet hours settings:

```tsx
const { isQuietHoursActive } = useNotificationManager();

if (isQuietHoursActive()) {
  // Don't send non-urgent notifications
  return;
}
```

### 4. Notification Templates
Use the built-in templates for consistent messaging:

```tsx
// Templates are automatically applied based on notification type
await createNotification(userId, 'friend_request', {
  sender_name: 'John Doe'
});
// Automatically uses: "New friend request" title and "{sender_name} wants to be your friend" body
```

## Troubleshooting

### Common Issues

1. **Notifications not received**
   - Check FCM token registration
   - Verify notification permissions
   - Check quiet hours settings

2. **Test notification fails**
   - Ensure FCM is properly initialized
   - Check device is physical (not simulator)
   - Verify Firebase configuration

3. **Preferences not saving**
   - Check database connection
   - Verify user authentication
   - Check for validation errors

### Debug Information

```tsx
const { getFCMStatus, getNotificationStatistics } = useNotificationManager();

// Check FCM status
console.log('FCM Status:', getFCMStatus());

// Check notification stats
console.log('Stats:', getNotificationStatistics());
```

## Security Considerations

1. **Token Security**: FCM tokens are stored securely in the database
2. **User Privacy**: Users can control all notification preferences
3. **Data Protection**: Notification data is encrypted in transit
4. **Access Control**: Only authenticated users can manage notifications

## Performance Optimization

1. **Batch Operations**: Use bulk notifications for multiple users
2. **Scheduled Notifications**: Use scheduling for non-urgent notifications
3. **Caching**: Notification preferences are cached for performance
4. **Cleanup**: Old notifications are automatically cleaned up

## Monitoring and Analytics

The system provides comprehensive monitoring:

- Notification delivery rates
- User engagement metrics
- Error tracking and logging
- Performance monitoring
- User preference analytics

This implementation provides a complete, production-ready push notification system for SportMap with all the features needed for a modern sports social app.
