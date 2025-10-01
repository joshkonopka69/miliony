import * as AppleAuthentication from 'expo-apple-authentication';

export interface AppleUser {
  id: string;
  email?: string;
  displayName?: string;
  identityToken?: string;
  authorizationCode?: string;
}

export interface AppleAuthResult {
  success: boolean;
  user?: AppleUser;
  error?: string;
}

export class AppleAuthService {
  static async isAvailable(): Promise<boolean> {
    try {
      return await AppleAuthentication.isAvailableAsync();
    } catch (error) {
      console.error('Error checking Apple Sign-In availability:', error);
      return false;
    }
  }

  static async signIn(): Promise<AppleAuthResult> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Apple Sign-In is not available on this device'
        };
      }

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
            `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim() : 
            'Apple User',
          identityToken: credential.identityToken,
          authorizationCode: credential.authorizationCode,
        }
      };
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      
      if (error.code === 'ERR_CANCELED') {
        return { success: false, error: 'User cancelled the login flow' };
      } else {
        return { success: false, error: error.message || 'Apple sign-in failed' };
      }
    }
  }

  static async getCredentialState(userID: string): Promise<AppleAuthentication.AppleAuthenticationCredentialState> {
    try {
      return await AppleAuthentication.getCredentialStateAsync(userID);
    } catch (error) {
      console.error('Error getting Apple credential state:', error);
      return AppleAuthentication.AppleAuthenticationCredentialState.UNKNOWN;
    }
  }
}
