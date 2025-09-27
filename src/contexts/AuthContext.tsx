import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { simpleAuthService, AuthUser, AuthState, LoginCredentials, RegisterCredentials, AuthError } from '../services/simpleAuthService';

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

  // Login with Google (placeholder)
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: AuthError }> => {
    return {
      success: false,
      error: {
        code: 'auth/not-implemented',
        message: 'Google Sign-In not implemented yet',
        customData: {},
        name: 'NotImplementedError',
      },
    };
  };

  // Login with Apple (placeholder)
  const loginWithApple = async (): Promise<{ success: boolean; error?: AuthError }> => {
    return {
      success: false,
      error: {
        code: 'auth/not-implemented',
        message: 'Apple Sign-In not implemented yet',
        customData: {},
        name: 'NotImplementedError',
      },
    };
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
