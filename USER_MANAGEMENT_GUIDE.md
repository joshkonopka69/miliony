# SportMap User Management System

This document describes the comprehensive user management system for SportMap, including user profiles, preferences, relationships, and privacy management.

## Overview

The user management system provides a complete solution for:
- User profile creation and management
- User preferences and settings
- Friend relationships and social features
- Privacy settings and data protection
- User search and discovery
- Activity tracking and statistics

## Architecture

### Core Services

1. **UserService** (`src/services/userService.ts`)
   - User profile CRUD operations
   - User search and discovery
   - Profile picture management
   - User statistics and activity tracking
   - User verification and blocking

2. **FriendService** (`src/services/friendService.ts`)
   - Friend request system
   - Friend management and relationships
   - Friend suggestions and recommendations
   - Friend search and filtering
   - Friend activity tracking

3. **PrivacyService** (`src/services/privacyService.ts`)
   - Privacy settings management
   - Data retention settings
   - Consent management
   - Data export and deletion
   - Privacy compliance checking

### State Management

4. **UserContext** (`src/contexts/UserContext.tsx`)
   - Global user state management
   - User profile and preferences state
   - Friends and relationships state
   - Error handling and loading states

### Custom Hooks

5. **useUserProfile** (`src/hooks/useUserProfile.ts`)
   - User profile management
   - Profile editing and validation
   - Profile display utilities
   - Profile completion tracking

6. **useFriends** (`src/hooks/useFriends.ts`)
   - Friends management
   - Friend requests handling
   - Friend suggestions
   - Friend search functionality

## Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  age INTEGER,
  gender VARCHAR(20),
  phone VARCHAR(20),
  date_of_birth DATE,
  timezone VARCHAR(50),
  language VARCHAR(10),
  favorite_sports TEXT[],
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  is_verified BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  last_active TIMESTAMP,
  total_events_created INTEGER DEFAULT 0,
  total_events_joined INTEGER DEFAULT 0,
  total_friends INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  badges TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### User Preferences Table
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notifications JSONB NOT NULL,
  privacy JSONB NOT NULL,
  location JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Friendships Table
```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  UNIQUE(user_id, friend_id)
);
```

#### Friend Requests Table
```sql
CREATE TABLE friend_requests (
  id UUID PRIMARY KEY,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP
);
```

#### Privacy Settings Table
```sql
CREATE TABLE privacy_settings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_visibility VARCHAR(20) DEFAULT 'public',
  show_location BOOLEAN DEFAULT TRUE,
  show_activity BOOLEAN DEFAULT TRUE,
  show_friends BOOLEAN DEFAULT TRUE,
  show_online_status BOOLEAN DEFAULT TRUE,
  allow_friend_requests BOOLEAN DEFAULT TRUE,
  allow_event_invites BOOLEAN DEFAULT TRUE,
  allow_messages BOOLEAN DEFAULT TRUE,
  show_birthday BOOLEAN DEFAULT FALSE,
  show_phone BOOLEAN DEFAULT FALSE,
  show_email BOOLEAN DEFAULT FALSE,
  data_sharing JSONB NOT NULL,
  search_visibility JSONB NOT NULL,
  activity_privacy JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Reference

### UserService

#### User Profile Operations

```typescript
// Create user profile
const profile = await userService.createUserProfile({
  id: 'user-id',
  email: 'user@example.com',
  display_name: 'John Doe',
  favorite_sports: ['basketball', 'football'],
  // ... other fields
});

// Get user profile
const profile = await userService.getUserProfile('user-id');

// Update user profile
const updatedProfile = await userService.updateUserProfile('user-id', {
  display_name: 'John Smith',
  bio: 'Updated bio',
});

// Delete user profile
const success = await userService.deleteUserProfile('user-id');
```

#### User Search

```typescript
// Search users with filters
const users = await userService.searchUsers({
  query: 'john',
  sports: ['basketball'],
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
    radius: 10
  },
  age_range: { min: 18, max: 35 },
  limit: 20
});
```

#### User Statistics

```typescript
// Get user statistics
const stats = await userService.getUserStats('user-id');
console.log(stats.total_events_created);
console.log(stats.total_friends);
console.log(stats.average_rating);
```

### FriendService

#### Friend Request Operations

```typescript
// Send friend request
const success = await friendService.sendFriendRequest(
  'sender-id', 
  'receiver-id', 
  'Hello, let\'s be friends!'
);

// Accept friend request
const success = await friendService.acceptFriendRequest('request-id');

// Decline friend request
const success = await friendService.declineFriendRequest('request-id');
```

#### Friend Management

```typescript
// Get friends
const friends = await friendService.getFriends('user-id', 50, 0);

// Remove friend
const success = await friendService.removeFriend('user-id', 'friend-id');

// Check if users are friends
const areFriends = await friendService.isFriend('user-id', 'friend-id');
```

#### Friend Suggestions

```typescript
// Get friend suggestions
const suggestions = await friendService.getFriendSuggestions('user-id', 10);

// Get friend recommendations
const recommendations = await friendService.getFriendRecommendations('user-id', 5);
```

### PrivacyService

#### Privacy Settings

```typescript
// Get privacy settings
const settings = await privacyService.getPrivacySettings('user-id');

// Update privacy settings
const updatedSettings = await privacyService.updatePrivacySettings('user-id', {
  profile_visibility: 'friends',
  show_location: false,
  allow_friend_requests: true
});
```

#### Data Management

```typescript
// Export user data
const userData = await privacyService.exportUserData('user-id');

// Delete user data
const success = await privacyService.deleteUserData('user-id');

// Check privacy compliance
const compliance = await privacyService.checkPrivacyCompliance('user-id');
```

## React Hooks Usage

### useUserProfile Hook

```typescript
import { useUserProfile } from '../hooks/useUserProfile';

function ProfileScreen() {
  const {
    profile,
    preferences,
    stats,
    isLoading,
    updateProfile,
    uploadProfilePicture,
    isProfileComplete,
    profileCompletionPercentage,
  } = useUserProfile();

  const handleUpdateProfile = async () => {
    const success = await updateProfile({
      display_name: 'New Name',
      bio: 'Updated bio',
    });
    
    if (success) {
      console.log('Profile updated successfully');
    }
  };

  return (
    <View>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View>
          <Text>Name: {profile?.display_name}</Text>
          <Text>Bio: {profile?.bio}</Text>
          <Text>Completion: {profileCompletionPercentage}%</Text>
          <Button title="Update Profile" onPress={handleUpdateProfile} />
        </View>
      )}
    </View>
  );
}
```

### useFriends Hook

```typescript
import { useFriends } from '../hooks/useFriends';

function FriendsScreen() {
  const {
    friends,
    friendRequests,
    suggestions,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    isLoading,
  } = useFriends();

  const handleSendRequest = async (userId: string) => {
    const success = await sendFriendRequest(userId, 'Let\'s be friends!');
    if (success) {
      console.log('Friend request sent');
    }
  };

  return (
    <View>
      <Text>Friends: {friends.length}</Text>
      <Text>Pending Requests: {friendRequests.received.length}</Text>
      
      {suggestions.map(suggestion => (
        <View key={suggestion.user.id}>
          <Text>{suggestion.user.display_name}</Text>
          <Text>{suggestion.reason}</Text>
          <Button 
            title="Send Request" 
            onPress={() => handleSendRequest(suggestion.user.id)} 
          />
        </View>
      ))}
    </View>
  );
}
```

### useUserProfileEditor Hook

```typescript
import { useUserProfileEditor } from '../hooks/useUserProfile';

function ProfileEditorScreen() {
  const {
    profile,
    isEditing,
    startEditing,
    saveEdit,
    cancelEditing,
    getEditingValue,
  } = useUserProfileEditor();

  const handleEditName = () => {
    startEditing('display_name', profile?.display_name || '');
  };

  const handleSaveName = async (newName: string) => {
    const success = await saveEdit('display_name', newName);
    if (success) {
      console.log('Name updated successfully');
    }
  };

  return (
    <View>
      {isEditing('display_name') ? (
        <TextInput
          value={getEditingValue('display_name', '')}
          onChangeText={handleSaveName}
          placeholder="Enter name"
        />
      ) : (
        <TouchableOpacity onPress={handleEditName}>
          <Text>{profile?.display_name}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

## Context Provider Setup

### App.tsx Integration

```typescript
import React from 'react';
import { UserProvider } from './src/contexts/UserContext';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        {/* Your app components */}
      </UserProvider>
    </AuthProvider>
  );
}
```

## Data Types

### UserProfile Interface

```typescript
interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phone?: string;
  date_of_birth?: string;
  timezone?: string;
  language?: string;
  favorite_sports: string[];
  location_latitude?: number;
  location_longitude?: number;
  is_verified?: boolean;
  is_public?: boolean;
  last_active?: string;
  total_events_created?: number;
  total_events_joined?: number;
  total_friends?: number;
  rating?: number;
  badges?: string[];
  created_at: string;
  updated_at: string;
}
```

### UserPreferences Interface

```typescript
interface UserPreferences {
  id: string;
  user_id: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    friend_requests: boolean;
    event_invites: boolean;
    event_reminders: boolean;
    event_updates: boolean;
    social_activity: boolean;
  };
  privacy: {
    profile_visibility: 'public' | 'friends' | 'private';
    show_location: boolean;
    show_activity: boolean;
    show_friends: boolean;
    allow_friend_requests: boolean;
    allow_event_invites: boolean;
    show_online_status: boolean;
  };
  location: {
    share_location: boolean;
    location_accuracy: 'exact' | 'approximate' | 'city' | 'none';
    auto_update_location: boolean;
  };
  created_at: string;
  updated_at: string;
}
```

## Error Handling

### Service Level Errors

```typescript
try {
  const profile = await userService.getUserProfile('user-id');
  if (!profile) {
    console.error('User profile not found');
    return;
  }
} catch (error) {
  console.error('Error fetching user profile:', error);
  // Handle error appropriately
}
```

### Context Level Errors

```typescript
const { userState, clearError } = useUser();

if (userState.error) {
  return (
    <View>
      <Text>Error: {userState.error}</Text>
      <Button title="Retry" onPress={clearError} />
    </View>
  );
}
```

## Performance Optimization

### Lazy Loading

```typescript
// Load friends data only when needed
const { refreshFriends } = useFriends();

useEffect(() => {
  const loadFriends = async () => {
    await refreshFriends();
  };
  
  loadFriends();
}, []);
```

### Caching

```typescript
// Cache user profiles to avoid repeated API calls
const [profileCache, setProfileCache] = useState<Map<string, UserProfile>>(new Map());

const getCachedProfile = useCallback((userId: string) => {
  if (profileCache.has(userId)) {
    return profileCache.get(userId);
  }
  
  // Fetch from API and cache
  const profile = await userService.getUserProfile(userId);
  if (profile) {
    setProfileCache(prev => new Map(prev).set(userId, profile));
  }
  
  return profile;
}, [profileCache]);
```

## Security Considerations

### Data Validation

```typescript
// Validate user input before processing
const validateUserData = (data: any): boolean => {
  if (!data.display_name || data.display_name.length < 2) {
    return false;
  }
  
  if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
    return false;
  }
  
  return true;
};
```

### Privacy Protection

```typescript
// Check privacy settings before showing user data
const canShowUserData = (user: UserProfile, viewerId: string): boolean => {
  if (user.id === viewerId) return true;
  if (user.is_public) return true;
  
  // Check if users are friends
  const areFriends = friendService.isFriend(viewerId, user.id);
  return areFriends;
};
```

## Testing

### Unit Tests

```typescript
// Test user service functions
describe('UserService', () => {
  it('should create user profile', async () => {
    const userData = {
      id: 'test-user',
      email: 'test@example.com',
      display_name: 'Test User',
      favorite_sports: ['basketball'],
    };
    
    const profile = await userService.createUserProfile(userData);
    expect(profile).toBeTruthy();
    expect(profile?.display_name).toBe('Test User');
  });
});
```

### Integration Tests

```typescript
// Test user context integration
describe('UserContext', () => {
  it('should load user data on authentication', async () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: ({ children }) => (
        <UserProvider>{children}</UserProvider>
      ),
    });
    
    await waitFor(() => {
      expect(result.current.userState.profile).toBeTruthy();
    });
  });
});
```

## Best Practices

### 1. Error Handling
- Always handle errors gracefully
- Provide meaningful error messages
- Implement retry mechanisms for network errors

### 2. Performance
- Use lazy loading for large datasets
- Implement proper caching strategies
- Optimize database queries

### 3. Security
- Validate all user input
- Implement proper authorization checks
- Protect sensitive user data

### 4. User Experience
- Provide loading states
- Show progress indicators
- Handle edge cases gracefully

### 5. Code Organization
- Keep services focused on single responsibilities
- Use TypeScript for type safety
- Implement proper error boundaries

## Troubleshooting

### Common Issues

1. **Profile Not Loading**
   - Check authentication state
   - Verify user ID is correct
   - Check network connectivity

2. **Friend Requests Not Working**
   - Ensure users are not already friends
   - Check for blocked users
   - Verify request status

3. **Privacy Settings Not Saving**
   - Check user permissions
   - Verify data format
   - Check for validation errors

### Debug Mode

```typescript
// Enable debug logging
const DEBUG = __DEV__;

if (DEBUG) {
  console.log('User profile:', profile);
  console.log('Friends:', friends);
  console.log('Privacy settings:', privacySettings);
}
```

## Future Enhancements

### Planned Features
- Advanced user analytics
- Social media integration
- Enhanced privacy controls
- User verification system
- Advanced friend recommendations

### Performance Improvements
- Real-time updates with WebSockets
- Advanced caching strategies
- Database query optimization
- Image compression and optimization

### Security Enhancements
- Two-factor authentication
- Advanced privacy controls
- Data encryption
- Audit logging

## Support

For issues or questions regarding the user management system:
1. Check the console for error messages
2. Verify user permissions and authentication
3. Test with different user scenarios
4. Review privacy settings and compliance
5. Check database connectivity and queries

## Conclusion

The SportMap user management system provides a comprehensive solution for user profiles, relationships, and privacy management. It's designed to be scalable, secure, and user-friendly while maintaining high performance and data protection standards.

The system includes:
- Complete user profile management
- Advanced friend relationship handling
- Comprehensive privacy controls
- Flexible search and discovery
- Robust error handling and validation
- Type-safe TypeScript implementation
- Extensive documentation and testing

This foundation enables SportMap to provide a rich social experience while maintaining user privacy and data security.
