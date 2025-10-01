# Social Authentication Implementation Guide

This guide shows how to implement Google and Apple authentication for the SportMap app.

## Overview

The app currently uses Supabase for authentication, but the Google and Apple sign-in methods are placeholder implementations. This guide will show you how to implement real authentication for both providers.

## Step 1: Configure Google Sign-In

### 1.1 Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Create credentials for:
   - **Android**: Use your app's package name and SHA-1 fingerprint
   - **iOS**: Use your app's bundle identifier
   - **Web**: For Expo development

### 1.2 Update app.json

Add Google Sign-In configuration to your `app.json`:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.yourcompany.sportmap"
        }
      ]
    ]
  }
}
```

### 1.3 Configure Google Sign-In Service

Create a new service file for Google authentication:

```typescript
// src/services/googleAuthService.ts
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export class GoogleAuthService {
  static async configure() {
    await GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID', // From Google Cloud Console
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
  }

  static async signIn() {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      return {
        success: true,
        user: {
          id: userInfo.user.id,
          email: userInfo.user.email,
          displayName: userInfo.user.name,
          avatarUrl: userInfo.user.photo,
          idToken: userInfo.idToken,
          accessToken: userInfo.serverAuthCode,
        }
      };
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return { success: false, error: 'User cancelled the login flow' };
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return { success: false, error: 'Sign in is in progress already' };
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return { success: false, error: 'Play services not available' };
      } else {
        return { success: false, error: error.message };
      }
    }
  }

  static async signOut() {
    try {
      await GoogleSignin.signOut();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
```

## Step 2: Configure Apple Sign-In

### 2.1 Apple Developer Console Setup

1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Create an App ID with Sign In with Apple capability
3. Configure your app's bundle identifier
4. Download the Apple Sign In configuration

### 2.2 Update app.json for Apple Sign-In

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.sportmap",
      "entitlements": {
        "com.apple.developer.applesignin": ["Default"]
      }
    },
    "plugins": [
      "expo-apple-authentication"
    ]
  }
}
```

### 2.3 Configure Apple Sign-In Service

Create a service file for Apple authentication:

```typescript
// src/services/appleAuthService.ts
import * as AppleAuthentication from 'expo-apple-authentication';

export class AppleAuthService {
  static async isAvailable() {
    return await AppleAuthentication.isAvailableAsync();
  }

  static async signIn() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      return {
        success: true,
        user: {
          id: credential.user,
          email: credential.email,
          displayName: credential.fullName ? 
            `${credential.fullName.givenName} ${credential.fullName.familyName}` : 
            'Apple User',
          identityToken: credential.identityToken,
          authorizationCode: credential.authorizationCode,
        }
      };
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        return { success: false, error: 'User cancelled the login flow' };
      } else {
        return { success: false, error: error.message };
      }
    }
  }
}
```

## Step 3: Update Authentication Context

Update the `AuthContext.tsx` to implement real Google and Apple authentication:

```typescript
// Update the loginWithGoogle method in AuthContext.tsx
const loginWithGoogle = async (): Promise<{ success: boolean; error?: AuthError }> => {
  try {
    const result = await GoogleAuthService.signIn();
    if (result.success) {
      // Create or update user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: result.user.idToken,
        nonce: 'random-nonce', // Generate a proper nonce
      });

      if (authError) throw authError;

      // Update auth state
      const authUser: AuthUser = {
        id: authData.user.id,
        email: result.user.email,
        displayName: result.user.displayName,
        avatarUrl: result.user.avatarUrl,
        favoriteSports: [],
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('auth_user', JSON.stringify(authUser));
      
      currentAuthState = {
        user: authUser,
        isLoading: false,
        isAuthenticated: true,
      };

      authStateListeners.forEach(listener => listener(currentAuthState));
      
      return { success: true };
    } else {
      return {
        success: false,
        error: {
          code: 'auth/google-signin-failed',
          message: result.error,
        },
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'auth/unknown',
        message: error.message || 'Google sign-in failed',
      },
    };
  }
};

// Update the loginWithApple method in AuthContext.tsx
const loginWithApple = async (): Promise<{ success: boolean; error?: AuthError }> => {
  try {
    const isAvailable = await AppleAuthService.isAvailable();
    if (!isAvailable) {
      return {
        success: false,
        error: {
          code: 'auth/apple-not-available',
          message: 'Apple Sign-In is not available on this device',
        },
      };
    }

    const result = await AppleAuthService.signIn();
    if (result.success) {
      // Create or update user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: result.user.identityToken,
        nonce: 'random-nonce', // Generate a proper nonce
      });

      if (authError) throw authError;

      // Update auth state
      const authUser: AuthUser = {
        id: authData.user.id,
        email: result.user.email || 'apple-user@privaterelay.appleid.com',
        displayName: result.user.displayName,
        favoriteSports: [],
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('auth_user', JSON.stringify(authUser));
      
      currentAuthState = {
        user: authUser,
        isLoading: false,
        isAuthenticated: true,
      };

      authStateListeners.forEach(listener => listener(currentAuthState));
      
      return { success: true };
    } else {
      return {
        success: false,
        error: {
          code: 'auth/apple-signin-failed',
          message: result.error,
        },
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: 'auth/unknown',
        message: error.message || 'Apple sign-in failed',
      },
    };
  }
};
```

## Step 4: Update WelcomeScreen

Update the `WelcomeScreen.tsx` to use the real authentication methods:

```typescript
// Update the handleGoogleAuth and handleAppleAuth methods
const handleGoogleAuth = async () => {
  try {
    const { loginWithGoogle } = useAuth();
    const result = await loginWithGoogle();
    if (result.success) {
      navigation.navigate('Map');
    } else {
      Alert.alert('Authentication Error', result.error?.message || 'Google sign-in failed');
    }
  } catch (error: any) {
    Alert.alert('Authentication Error', error.message || 'An error occurred');
  }
};

const handleAppleAuth = async () => {
  try {
    const { loginWithApple } = useAuth();
    const result = await loginWithApple();
    if (result.success) {
      navigation.navigate('Map');
    } else {
      Alert.alert('Authentication Error', result.error?.message || 'Apple sign-in failed');
    }
  } catch (error: any) {
    Alert.alert('Authentication Error', error.message || 'An error occurred');
  }
};
```

## Step 5: Environment Variables

Create a `.env` file with your configuration:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
EXPO_PUBLIC_APPLE_SERVICE_ID=your_apple_service_id
```

## Step 6: Supabase Configuration

Make sure your Supabase project has the following providers enabled:

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider and add your Google OAuth credentials
3. Enable Apple provider and add your Apple OAuth credentials

## Step 7: Testing

### For Development:
1. Use Expo Go app for testing
2. Test on both iOS and Android devices
3. Test the sign-in flow and error handling

### For Production:
1. Build the app with EAS Build
2. Test on real devices
3. Verify the authentication flow works correctly

## Troubleshooting

### Common Issues:

1. **Google Sign-In not working**: Check your SHA-1 fingerprint and package name
2. **Apple Sign-In not available**: Ensure you're testing on iOS 13+ devices
3. **Supabase integration**: Make sure your Supabase project has the correct OAuth providers configured

### Debug Steps:

1. Check console logs for authentication errors
2. Verify your OAuth credentials are correct
3. Test on both development and production environments

## Security Considerations

1. **Never commit OAuth credentials** to version control
2. **Use environment variables** for sensitive configuration
3. **Implement proper error handling** for authentication failures
4. **Validate tokens** on your backend if needed

## Next Steps

After implementing this guide:

1. Test the authentication flow thoroughly
2. Add proper error handling and user feedback
3. Implement user profile management
4. Add logout functionality
5. Consider adding more social providers if needed

This implementation will give you fully functional Google and Apple authentication integrated with your existing Supabase backend.
