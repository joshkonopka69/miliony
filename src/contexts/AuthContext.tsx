import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, AuthUser, AuthState, LoginCredentials, RegisterCredentials, AuthError } from '../services/authService';

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
    const unsubscribe = authService.onAuthStateChanged((newState: AuthState) => {
      setAuthState(newState);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Login with email and password
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      const result = await authService.login(credentials);
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
      const result = await authService.register(credentials);
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
      const result = await authService.signInWithGoogle();
      return result;
    } catch (error: any) {
      console.error('Google login error:', error);
      return {
        success: false,
        error: {
          code: 'auth/unknown',
          message: 'An unexpected error occurred during Google sign-in.',
        },
      };
    }
  };

  // Login with Apple
  const loginWithApple = async (): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      const result = await authService.signInWithApple();
      return result;
    } catch (error: any) {
      console.error('Apple login error:', error);
      return {
        success: false,
        error: {
          code: 'auth/unknown',
          message: 'An unexpected error occurred during Apple sign-in.',
        },
      };
    }
  };

  // Logout
  const logout = async (): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      const result = await authService.logout();
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

  // Send password reset email
  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      const result = await authService.sendPasswordResetEmail(email);
      return result;
    } catch (error: any) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: {
          code: 'auth/unknown',
          message: 'An unexpected error occurred while sending password reset email.',
        },
      };
    }
  };

  // Send email verification
  const sendEmailVerification = async (): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      const result = await authService.sendEmailVerification();
      return result;
    } catch (error: any) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: {
          code: 'auth/unknown',
          message: 'An unexpected error occurred while sending verification email.',
        },
      };
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<AuthUser>): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      const result = await authService.updateProfile(updates);
      return result;
    } catch (error: any) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: {
          code: 'auth/unknown',
          message: 'An unexpected error occurred while updating profile.',
        },
      };
    }
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      // The auth state will be automatically updated by the auth service
      // This method can be used to trigger a manual refresh if needed
      const currentState = authService.getCurrentAuthState();
      setAuthState(currentState);
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
