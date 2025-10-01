import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { simpleAuthService, AuthUser, AuthState, LoginCredentials, RegisterCredentials, AuthError } from '../services/simpleAuthService';
import { GoogleAuthService } from '../services/googleAuthService';
import { AppleAuthService } from '../services/appleAuthService';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Context interface
interface AuthContextType {
  // State
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: AuthError }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: AuthError }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: AuthError }>;
  loginWithApple: () => Promise<{ success: boolean; error?: AuthError }>;
  logout: () => Promise<{ success: boolean; error?: AuthError }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: AuthError }>;
  sendEmailVerification: () => Promise<{ success: boolean; error?: AuthError }>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ success: boolean; error?: AuthError }>;
  
  // Utilities
  refreshUser: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = simpleAuthService.onAuthStateChanged((newState: AuthState) => {
      setAuthState(newState);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Login with email and password
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      const result = await simpleAuthService.login(credentials);
      return result;
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: {
          code: 'auth/unknown',
          message: 'An unexpected error occurred during login.',
        },
      };
    }
  };

  // Register with email and password
  const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      const result = await simpleAuthService.register(credentials);
      return result;
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: {
          code: 'auth/unknown',
          message: 'An unexpected error occurred during registration.',
        },
      };
    }
  };

  // Login with Google
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      // Configure Google Sign-In if not already configured
      await GoogleAuthService.configure();
      
      const result = await GoogleAuthService.signIn();
      if (!result.success) {
        return {
          success: false,
          error: {
            code: 'auth/google-signin-failed',
            message: result.error || 'Google sign-in failed',
          },
        };
      }

      if (!result.user) {
        return {
          success: false,
          error: {
            code: 'auth/google-signin-failed',
            message: 'No user data received from Google',
          },
        };
      }

      // Sign in with Supabase using Google ID token
      const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: result.user.idToken,
        nonce: Math.random().toString(36), // Generate a random nonce
      });

      if (authError) {
        console.error('Supabase Google auth error:', authError);
        return {
          success: false,
          error: {
            code: 'auth/supabase-error',
            message: authError.message || 'Failed to authenticate with Supabase',
          },
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: {
            code: 'auth/no-user',
            message: 'No user data received from Supabase',
          },
        };
      }

      // Create or update user profile
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

      // Save to storage
      await AsyncStorage.setItem('auth_user', JSON.stringify(authUser));

      // Update auth state
      const newAuthState = {
        user: authUser,
        isLoading: false,
        isAuthenticated: true,
      };
      setAuthState(newAuthState);

      return { success: true };
    } catch (error: any) {
      console.error('Google login error:', error);
      return {
        success: false,
        error: {
          code: 'auth/unknown',
          message: error.message || 'Google sign-in failed',
        },
      };
    }
  };

  // Login with Apple
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
      if (!result.success) {
        return {
          success: false,
          error: {
            code: 'auth/apple-signin-failed',
            message: result.error || 'Apple sign-in failed',
          },
        };
      }

      if (!result.user) {
        return {
          success: false,
          error: {
            code: 'auth/apple-signin-failed',
            message: 'No user data received from Apple',
          },
        };
      }

      // Sign in with Supabase using Apple ID token
      const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: result.user.identityToken || '',
        nonce: Math.random().toString(36), // Generate a random nonce
      });

      if (authError) {
        console.error('Supabase Apple auth error:', authError);
        return {
          success: false,
          error: {
            code: 'auth/supabase-error',
            message: authError.message || 'Failed to authenticate with Supabase',
          },
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: {
            code: 'auth/no-user',
            message: 'No user data received from Supabase',
          },
        };
      }

      // Create or update user profile
      const authUser: AuthUser = {
        id: authData.user.id,
        email: result.user.email || 'apple-user@privaterelay.appleid.com',
        displayName: result.user.displayName || 'Apple User',
        favoriteSports: [],
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to storage
      await AsyncStorage.setItem('auth_user', JSON.stringify(authUser));

      // Update auth state
      const newAuthState = {
        user: authUser,
        isLoading: false,
        isAuthenticated: true,
      };
      setAuthState(newAuthState);

      return { success: true };
    } catch (error: any) {
      console.error('Apple login error:', error);
      return {
        success: false,
        error: {
          code: 'auth/unknown',
          message: error.message || 'Apple sign-in failed',
        },
      };
    }
  };

  // Logout
  const logout = async (): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      const result = await simpleAuthService.logout();
      return result;
    } catch (error: any) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: {
          code: 'auth/unknown',
          message: 'An unexpected error occurred during logout.',
        },
      };
    }
  };

  // Send password reset email (placeholder)
  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: AuthError }> => {
    return {
      success: false,
      error: {
        code: 'auth/not-implemented',
        message: 'Password reset not implemented yet',
        customData: {},
        name: 'NotImplementedError',
      },
    };
  };

  // Send email verification (placeholder)
  const sendEmailVerification = async (): Promise<{ success: boolean; error?: AuthError }> => {
    return {
      success: false,
      error: {
        code: 'auth/not-implemented',
        message: 'Email verification not implemented yet',
        customData: {},
        name: 'NotImplementedError',
      },
    };
  };

  // Update user profile (placeholder)
  const updateProfile = async (updates: Partial<AuthUser>): Promise<{ success: boolean; error?: AuthError }> => {
    return {
      success: false,
      error: {
        code: 'auth/not-implemented',
        message: 'Profile update not implemented yet',
        customData: {},
        name: 'NotImplementedError',
      },
    };
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      // Simple implementation - just get current user
      const user = simpleAuthService.getCurrentUser();
      if (user) {
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Context value
  const value: AuthContextType = {
    // State
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    
    // Actions
    login,
    register,
    loginWithGoogle,
    loginWithApple,
    logout,
    sendPasswordReset,
    sendEmailVerification,
    updateProfile,
    
    // Utilities
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export types for use in other components
export type { AuthUser, AuthError, LoginCredentials, RegisterCredentials };
