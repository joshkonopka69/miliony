import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export interface GoogleUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  idToken: string;
  accessToken?: string;
}

export interface GoogleAuthResult {
  success: boolean;
  user?: GoogleUser;
  error?: string;
}

export class GoogleAuthService {
  static async configure() {
    try {
      await GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID',
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
      });
      console.log('✅ Google Sign-In configured successfully');
    } catch (error) {
      console.error('❌ Google Sign-In configuration failed:', error);
    }
  }

  static async signIn(): Promise<GoogleAuthResult> {
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
      console.error('Google sign-in error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return { success: false, error: 'User cancelled the login flow' };
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return { success: false, error: 'Sign in is in progress already' };
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return { success: false, error: 'Play services not available' };
      } else {
        return { success: false, error: error.message || 'Google sign-in failed' };
      }
    }
  }

  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await GoogleSignin.signOut();
      return { success: true };
    } catch (error: any) {
      console.error('Google sign-out error:', error);
      return { success: false, error: error.message || 'Google sign-out failed' };
    }
  }

  static async getCurrentUser() {
    try {
      const userInfo = await GoogleSignin.getCurrentUser();
      return userInfo;
    } catch (error) {
      console.error('Error getting current Google user:', error);
      return null;
    }
  }

  static async isSignedIn(): Promise<boolean> {
    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      console.error('Error checking Google sign-in status:', error);
      return false;
    }
  }
}
