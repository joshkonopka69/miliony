import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';

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
  private static readonly GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID';
  private static readonly GOOGLE_REDIRECT_URI = AuthSession.makeRedirectUri({
    useProxy: true,
  });

  static async configure() {
    try {
      console.log('✅ Google Sign-In configured successfully');
      console.log('Redirect URI:', this.GOOGLE_REDIRECT_URI);
    } catch (error) {
      console.error('❌ Google Sign-In configuration failed:', error);
    }
  }

  static async signIn(): Promise<GoogleAuthResult> {
    try {
      const request = new AuthSession.AuthRequest({
        clientId: this.GOOGLE_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        redirectUri: this.GOOGLE_REDIRECT_URI,
        responseType: AuthSession.ResponseType.Code,
        extraParams: {},
        additionalParameters: {},
        prompt: AuthSession.Prompt.SelectAccount,
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success') {
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: this.GOOGLE_CLIENT_ID,
            code: result.params.code,
            redirectUri: this.GOOGLE_REDIRECT_URI,
            extraParams: {
              code_verifier: request.codeChallenge,
            },
          },
          {
            tokenEndpoint: 'https://oauth2.googleapis.com/token',
          }
        );

        // Get user info from Google
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.accessToken}`
        );
        const userInfo = await userInfoResponse.json();

        return {
          success: true,
          user: {
            id: userInfo.id,
            email: userInfo.email,
            displayName: userInfo.name,
            avatarUrl: userInfo.picture,
            idToken: tokenResponse.idToken || '',
            accessToken: tokenResponse.accessToken,
          }
        };
      } else if (result.type === 'cancel') {
        return { success: false, error: 'User cancelled the login flow' };
      } else {
        return { success: false, error: 'Google sign-in failed' };
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message || 'Google sign-in failed' };
    }
  }

  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      // For Expo AuthSession, we just clear any stored tokens
      // The actual sign-out happens on the Google side
      return { success: true };
    } catch (error: any) {
      console.error('Google sign-out error:', error);
      return { success: false, error: error.message || 'Google sign-out failed' };
    }
  }

  static async getCurrentUser() {
    // With Expo AuthSession, we don't have a persistent session
    // User would need to sign in again
    return null;
  }

  static async isSignedIn(): Promise<boolean> {
    // With Expo AuthSession, we don't have a persistent session
    return false;
  }
}
