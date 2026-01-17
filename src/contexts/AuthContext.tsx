import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BackendService } from '../services/backendService';

// Debug: Check if BackendService is properly imported
console.log('🔧 AuthContext: BackendService:', BackendService ? 'Loaded' : 'Undefined');
console.log('🔧 AuthContext: BackendService.Auth:', BackendService?.Auth ? 'Available' : 'Undefined');

interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  favorite_sports?: string[];
  created_at: string;
  updated_at: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: {
    display_name: string;
    favorite_sports: string[];
    avatar_url?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  getUserId: () => string | null;
  refreshUser: () => Promise<void>;
  sendEmailVerification: () => Promise<{ success: boolean; error?: AuthError }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: AuthError }>;
  loginWithApple: () => Promise<{ success: boolean; error?: AuthError }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: AuthError }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: AuthError }>;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Load user profile
  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await BackendService.Users.getUserProfile(userId);
      if (profile) {
        setAuthState({
          user: profile,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const session = await BackendService.Auth.getSession();
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    checkSession();

    // Listen to auth state changes
    const { data: { subscription } } = BackendService.Auth.addAuthStateListener(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);

      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const result = await BackendService.Auth.signIn(email, password);

      if (result.success && result.user) {
        await loadUserProfile(result.user.id);
        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email: string, password: string, userData: {
    display_name: string;
    favorite_sports: string[];
    avatar_url?: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const result = await BackendService.Auth.signUp(email, password, userData);

      if (result.success && result.user) {
        await loadUserProfile(result.user.id);
        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      await BackendService.Auth.signOut();

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!authState.user) {
        return { success: false, error: 'No user logged in' };
      }

      const success = await BackendService.Users.updateUserProfile(authState.user.id, updates);

      if (success) {
        // Reload user profile to get updated data
        await loadUserProfile(authState.user.id);
        return { success: true };
      } else {
        return { success: false, error: 'Failed to update profile' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const getUserId = () => {
    return authState.user?.id || null;
  };

  const refreshUser = async () => {
    if (authState.user) {
      await loadUserProfile(authState.user.id);
    }
  };

  const sendEmailVerification = async (): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      const email = authState.user?.email;
      if (!email) {
        return { success: false, error: { message: 'No email address available for verification.' } };
      }

      const result = await BackendService.Auth.sendEmailVerification(email);
      if (!result.success) {
        return {
          success: false,
          error: { message: result.error || 'Failed to send verification email.' },
        };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      return { success: false, error: { message: error.message } };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      const result = await BackendService.Auth.signInWithGoogle();
      if (!result.success) {
        return { success: false, error: { message: result.error || 'Google sign-in failed.' } };
      }
      return { success: true };
    } catch (error: any) {
      console.error('Google login error:', error);
      return { success: false, error: { message: error.message } };
    }
  };

  const loginWithApple = async (): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      const result = await BackendService.Auth.signInWithApple();
      if (!result.success) {
        return { success: false, error: { message: result.error || 'Apple sign-in failed.' } };
      }
      return { success: true };
    } catch (error: any) {
      console.error('Apple login error:', error);
      return { success: false, error: { message: error.message } };
    }
  };


  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      const result = await BackendService.Auth.sendPasswordReset(email);
      if (!result.success) {
        return { success: false, error: { message: result.error || 'Failed to send reset email.' } };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: { message: error.message } };
    }
  };

  const resetPassword = async (newPassword: string): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      const result = await BackendService.Auth.resetPassword(newPassword);
      if (!result.success) {
        return { success: false, error: { message: result.error || 'Failed to reset password.' } };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: { message: error.message } };
    }
  };


  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
    getUserId,
    refreshUser,
    sendEmailVerification,
    loginWithGoogle,
    loginWithApple,
    sendPasswordReset,
    resetPassword,
  };


  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};