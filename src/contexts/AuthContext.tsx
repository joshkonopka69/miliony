import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, AuthUser, AuthState } from '../services/authService';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: {
    display_name: string;
    favorite_sports: string[];
    avatar_url?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>;
  updateLocation: (latitude: number, longitude: number) => Promise<void>;
  getUserId: () => string | null;
  canPerformAction: (action: string, resourceId?: string) => boolean;
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

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = authService.addAuthStateListener((state) => {
      setAuthState(state);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    return result;
  };

  const signUp = async (email: string, password: string, userData: {
    display_name: string;
    favorite_sports: string[];
    avatar_url?: string;
  }) => {
    const result = await authService.register(email, password, userData);
    return result;
  };

  const signOut = async () => {
    await authService.signOut();
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    const result = await authService.updateProfile(updates);
    return result;
  };

  const updateLocation = async (latitude: number, longitude: number) => {
    await authService.updateLocation(latitude, longitude);
  };

  const getUserId = () => {
    return authService.getUserId();
  };

  const canPerformAction = (action: string, resourceId?: string) => {
    return authService.canPerformAction(action, resourceId);
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateLocation,
    getUserId,
    canPerformAction,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};