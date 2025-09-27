# SportMap Authentication System

This document describes the comprehensive authentication system implemented for SportMap, integrating Firebase Auth with Supabase for user management.

## Overview

The authentication system provides:
- Email/password registration and login
- Google and Apple sign-in options (Apple requires additional setup)
- Password reset functionality
- Email verification
- User session management
- Logout functionality
- User profile creation and updates
- Graceful error handling
- Loading states and user feedback

## Architecture

### Core Components

1. **AuthService** (`src/services/authService.ts`)
   - Handles all Firebase Auth operations
   - Manages Supabase user profile synchronization
   - Provides error handling and user feedback
   - Manages authentication state

2. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - React context for authentication state management
   - Provides authentication methods to components
   - Handles state updates and notifications

3. **AuthForm** (`src/components/AuthForm.tsx`)
   - Reusable authentication form component
   - Supports both login and registration modes
   - Includes form validation and error handling
   - Provides social sign-in options

4. **Updated Screens**
   - `AuthScreen.tsx` - Updated to use real authentication
   - `RegisterScreen.tsx` - Updated to use real authentication

## Features

### Authentication Methods

#### Email/Password Authentication
```typescript
// Login
const result = await login({
  email: 'user@example.com',
  password: 'password123'
});

// Register
const result = await register({
  email: 'user@example.com',
  password: 'password123',
  displayName: 'John Doe',
  favoriteSports: ['basketball', 'football']
});
```

#### Social Authentication
```typescript
// Google Sign-In
const result = await loginWithGoogle();

// Apple Sign-In (requires additional setup)
const result = await loginWithApple();
```

#### Password Reset
```typescript
const result = await sendPasswordReset('user@example.com');
```

#### Email Verification
```typescript
const result = await sendEmailVerification();
```

### User Profile Management

#### Update Profile
```typescript
const result = await updateProfile({
  displayName: 'New Name',
  favoriteSports: ['tennis', 'swimming']
});
```

#### Get Current User
```typescript
const user = getCurrentUser();
const isAuthenticated = isAuthenticated();
const isLoading = isLoading();
```

### State Management

The authentication state is managed through the AuthContext:

```typescript
const { user, isLoading, isAuthenticated, login, register, logout } = useAuth();
```

## Integration Points

### Firebase Configuration
The system uses the existing Firebase configuration in `src/config/firebase.ts`:
- Firebase Auth for authentication
- Firestore for real-time features
- Firebase Cloud Messaging for notifications

### Supabase Integration
User profiles are synchronized with Supabase:
- User data stored in Supabase `users` table
- Profile updates sync between Firebase and Supabase
- User preferences and settings managed in Supabase

### Navigation Integration
- Authentication state determines navigation flow
- Protected routes require authentication
- Automatic redirect to login for unauthenticated users

## Error Handling

The system provides comprehensive error handling:

### Common Error Codes
- `auth/user-not-found` - No account found with email
- `auth/wrong-password` - Incorrect password
- `auth/email-already-in-use` - Email already registered
- `auth/weak-password` - Password too weak
- `auth/invalid-email` - Invalid email format
- `auth/too-many-requests` - Too many failed attempts
- `auth/network-request-failed` - Network connectivity issues

### Error Display
- Form validation errors shown inline
- General errors displayed in alerts
- Loading states during authentication operations

## Security Features

### Password Requirements
- Minimum 6 characters
- Client-side validation
- Server-side enforcement

### Email Verification
- Automatic email verification on registration
- Manual verification resend option
- Verification status tracking

### Session Management
- Automatic session persistence
- Secure token storage
- Session timeout handling

## Usage Examples

### Basic Authentication Flow
```typescript
import { useAuth } from '../contexts/AuthContext';

function LoginScreen() {
  const { login, isLoading, user } = useAuth();
  
  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
      // Navigate to main app
    } else {
      // Show error message
      console.error(result.error?.message);
    }
  };
  
  return (
    // Login form UI
  );
}
```

### Protected Route Example
```typescript
function ProtectedScreen() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <LoginScreen />;
  }
  
  return <MainContent />;
}
```

## Setup Requirements

### Environment Variables
Ensure the following environment variables are set:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Firebase Configuration
1. Enable Authentication in Firebase Console
2. Enable Email/Password authentication
3. Configure Google Sign-In (optional)
4. Set up Apple Sign-In (optional)

### Supabase Configuration
1. Create `users` table with required fields
2. Set up Row Level Security (RLS) policies
3. Configure authentication settings

## Testing

### Manual Testing
1. Test email/password registration
2. Test email/password login
3. Test password reset functionality
4. Test email verification
5. Test profile updates
6. Test logout functionality

### Error Scenarios
1. Invalid email format
2. Weak password
3. Non-existent user login
4. Network connectivity issues
5. Server errors

## Future Enhancements

### Planned Features
- Two-factor authentication (2FA)
- Biometric authentication
- Social login with more providers
- Advanced security settings
- Account linking
- Admin user management

### Performance Optimizations
- Lazy loading of authentication components
- Caching of user profile data
- Optimistic updates for better UX
- Background sync of user data

## Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check Firebase configuration
   - Verify environment variables
   - Check network connectivity

2. **User profile not syncing**
   - Check Supabase configuration
   - Verify database permissions
   - Check for API errors in console

3. **Social login not working**
   - Verify provider configuration
   - Check OAuth settings
   - Ensure proper app registration

### Debug Mode
Enable debug logging by setting:
```typescript
console.log('Auth Debug:', authState);
```

## Support

For issues or questions regarding the authentication system:
1. Check the console for error messages
2. Verify configuration settings
3. Test with different user accounts
4. Check Firebase and Supabase logs
