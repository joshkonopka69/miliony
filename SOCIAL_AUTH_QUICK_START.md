# Social Authentication Quick Start Guide

## 🚀 What's Been Implemented

Your SportMap app now has **real Google and Apple authentication** integrated with Supabase! Here's what was added:

### ✅ New Files Created:
- `src/services/googleAuthService.ts` - Google Sign-In service
- `src/services/appleAuthService.ts` - Apple Sign-In service  
- `SOCIAL_AUTH_IMPLEMENTATION_GUIDE.md` - Detailed implementation guide
- `setup-social-auth.sh` - Setup script

### ✅ Updated Files:
- `src/contexts/AuthContext.tsx` - Real Google/Apple authentication methods
- `src/screens/WelcomeScreen.tsx` - Updated to use real authentication

## 🔧 Quick Setup (5 minutes)

### 1. Run the setup script:
```bash
./setup-social-auth.sh
```

### 2. Update your `.env` file:
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Update `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.yourcompany.sportmap"
        }
      ],
      "expo-apple-authentication"
    ]
  }
}
```

## 🎯 How It Works Now

### Before (Placeholder):
```typescript
const handleGoogleAuth = () => {
  navigation.navigate('Auth'); // Just navigates to auth screen
};
```

### After (Real Authentication):
```typescript
const handleGoogleAuth = async () => {
  try {
    const result = await loginWithGoogle();
    if (result.success) {
      navigation.navigate('Map'); // Direct to main app
    } else {
      Alert.alert('Error', result.error?.message);
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

## 🔑 Key Features

1. **Google Sign-In**: Full OAuth flow with Supabase integration
2. **Apple Sign-In**: Native Apple authentication with privacy features
3. **Error Handling**: Comprehensive error messages and user feedback
4. **State Management**: Automatic auth state updates
5. **Storage**: User data persisted in AsyncStorage

## 🧪 Testing

### Development:
```bash
npm start
# Test on Expo Go app
```

### Production:
```bash
eas build --platform all
# Test on real devices
```

## 🚨 Important Notes

1. **Google Setup Required**: You need Google Cloud Console credentials
2. **Apple Setup Required**: You need Apple Developer account
3. **Supabase Configuration**: Enable Google/Apple providers in Supabase
4. **iOS 13+**: Apple Sign-In requires iOS 13 or later
5. **Android**: Google Play Services required

## 🐛 Troubleshooting

### Common Issues:

1. **"Google Sign-In not working"**
   - Check SHA-1 fingerprint in Google Console
   - Verify package name matches

2. **"Apple Sign-In not available"**
   - Test on iOS 13+ device
   - Check Apple Developer configuration

3. **"Supabase authentication failed"**
   - Verify OAuth providers are enabled
   - Check credentials in Supabase dashboard

### Debug Steps:
1. Check console logs for detailed error messages
2. Verify all credentials are correct
3. Test on both development and production builds

## 📚 Next Steps

1. **Configure OAuth Providers**: Set up Google Cloud Console and Apple Developer
2. **Update Supabase**: Enable Google/Apple providers in your Supabase project
3. **Test Authentication**: Try both Google and Apple sign-in flows
4. **Customize UI**: Adjust button styles and error messages as needed
5. **Add More Providers**: Consider adding Facebook, Twitter, etc.

## 🎉 You're Ready!

Your authentication buttons now have **real functionality**! Users can sign in with Google or Apple and be automatically authenticated with your Supabase backend.

For detailed configuration instructions, see `SOCIAL_AUTH_IMPLEMENTATION_GUIDE.md`.
