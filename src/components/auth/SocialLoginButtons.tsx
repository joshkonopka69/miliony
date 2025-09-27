import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useAuth, AuthError } from '../../contexts/AuthContext';

// Types
export interface SocialLoginButtonsProps {
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
  style?: any;
}

export default function SocialLoginButtons({
  onSuccess,
  onError,
  style,
}: SocialLoginButtonsProps) {
  const { loginWithGoogle, loginWithApple } = useAuth();
  const [isLoading, setIsLoading] = useState<'google' | 'apple' | null>(null);

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setIsLoading('google');
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        onSuccess?.();
      } else {
        if (result.error) {
          onError?.(result.error);
        }
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      onError?.({
        code: 'auth/unknown',
        message: 'An unexpected error occurred during Google sign-in.',
      });
    } finally {
      setIsLoading(null);
    }
  };

  // Handle Apple sign-in
  const handleAppleSignIn = async () => {
    setIsLoading('apple');
    try {
      const result = await loginWithApple();
      if (result.success) {
        onSuccess?.();
      } else {
        if (result.error) {
          onError?.(result.error);
        }
      }
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      onError?.({
        code: 'auth/unknown',
        message: 'An unexpected error occurred during Apple sign-in.',
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Buttons */}
      <View style={styles.buttonsContainer}>
        {/* Google Sign-In Button */}
        <TouchableOpacity 
          style={[styles.socialButton, styles.googleButton]}
          onPress={handleGoogleSignIn}
          activeOpacity={0.7}
          disabled={isLoading !== null}
        >
          {isLoading === 'google' ? (
            <ActivityIndicator color="#333333" size="small" />
          ) : (
            <>
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Apple Sign-In Button */}
        <TouchableOpacity 
          style={[styles.socialButton, styles.appleButton]}
          onPress={handleAppleSignIn}
          activeOpacity={0.7}
          disabled={isLoading !== null}
        >
          {isLoading === 'apple' ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <View style={styles.appleIcon}>
                <Text style={styles.appleIconText}>🍎</Text>
              </View>
              <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                Continue with Apple
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e5e9',
  },
  dividerText: {
    fontSize: 13,
    color: '#8e8e93',
    marginHorizontal: 16,
    fontWeight: '500',
  },
  buttonsContainer: {
    gap: 12,
  },
  socialButton: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 16,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderColor: '#e1e5e9',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285f4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIconText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  appleIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appleIconText: {
    fontSize: 16,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333333',
  },
  appleButtonText: {
    color: '#ffffff',
  },
});
