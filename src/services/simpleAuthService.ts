// Simple authentication service that works with Expo Go
// Uses only Supabase for authentication (no Firebase)

import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  favoriteSports: string[];
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthError {
  code: string;
  message: string;
  customData?: any;
  name?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
  favoriteSports: string[];
}

// Auth state management
let currentAuthState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
};

const authStateListeners: ((state: AuthState) => void)[] = [];

class SimpleAuthService {
  constructor() {
    // Initialize auth state from storage
    this.initializeAuthState();
  }

  // Initialize auth state from storage
  private async initializeAuthState() {
    try {
      const storedUser = await AsyncStorage.getItem('auth_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        currentAuthState = {
          user,
          isLoading: false,
          isAuthenticated: true,
        };
      } else {
        currentAuthState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
        };
      }
      
      // Notify listeners
      authStateListeners.forEach(listener => listener(currentAuthState));
    } catch (error) {
      console.error('Error initializing auth state:', error);
      currentAuthState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      };
    }
  }

  // Subscribe to auth state changes
  onAuthStateChanged(callback: (state: AuthState) => void): () => void {
    authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = authStateListeners.indexOf(callback);
      if (index > -1) {
        authStateListeners.splice(index, 1);
      }
    };
  }

  // Get current auth state
  getCurrentAuthState(): AuthState {
    return currentAuthState;
  }

  // Register with email and password
  async register(credentials: RegisterCredentials): Promise<{ success: boolean; user?: AuthUser; error?: AuthError }> {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            display_name: credentials.displayName,
            favorite_sports: credentials.favoriteSports,
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Create user profile in Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: credentials.email,
          display_name: credentials.displayName,
          favorite_sports: credentials.favoriteSports,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Continue anyway - user is created in auth
      }

      const authUser: AuthUser = {
        id: authData.user.id,
        email: credentials.email,
        displayName: credentials.displayName,
        favoriteSports: credentials.favoriteSports,
        isEmailVerified: authData.user.email_confirmed_at ? true : false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save auth state to storage
      await AsyncStorage.setItem('auth_user', JSON.stringify(authUser));

      // Update current state
      currentAuthState = {
        user: authUser,
        isLoading: false,
        isAuthenticated: true,
      };

      // Notify listeners
      authStateListeners.forEach(listener => listener(currentAuthState));

      return { success: true, user: authUser };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: error.message || 'Registration failed',
          customData: error.customData,
          name: error.name,
        },
      };
    }
  }

  // Login with email and password
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: AuthUser; error?: AuthError }> {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Login failed');
      }

      // Get user profile from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Create basic profile if not exists
        const { data: newProfile } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: credentials.email,
            display_name: authData.user.user_metadata?.display_name || credentials.email,
            favorite_sports: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (newProfile) {
          profileData = newProfile;
        }
      }

      const authUser: AuthUser = {
        id: authData.user.id,
        email: credentials.email,
        displayName: profileData?.display_name || authData.user.user_metadata?.display_name || credentials.email,
        favoriteSports: profileData?.favorite_sports || [],
        isEmailVerified: authData.user.email_confirmed_at ? true : false,
        createdAt: profileData?.created_at || new Date().toISOString(),
        updatedAt: profileData?.updated_at || new Date().toISOString(),
      };

      // Save auth state to storage
      await AsyncStorage.setItem('auth_user', JSON.stringify(authUser));

      // Update current state
      currentAuthState = {
        user: authUser,
        isLoading: false,
        isAuthenticated: true,
      };

      // Notify listeners
      authStateListeners.forEach(listener => listener(currentAuthState));

      return { success: true, user: authUser };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: error.message || 'Login failed',
          customData: error.customData,
          name: error.name,
        },
      };
    }
  }

  // Logout
  async logout(): Promise<{ success: boolean; error?: AuthError }> {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear storage
      await AsyncStorage.removeItem('auth_user');

      // Update current state
      currentAuthState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      };

      // Notify listeners
      authStateListeners.forEach(listener => listener(currentAuthState));

      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: error.message || 'Logout failed',
          customData: error.customData,
          name: error.name,
        },
      };
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return currentAuthState.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return currentAuthState.isAuthenticated;
  }

  // Check if auth is loading
  isLoading(): boolean {
    return currentAuthState.isLoading;
  }

  // Error message mapping
  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'No user found with this email address.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account already exists with this email address.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
    };

    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }
}

// Create and export singleton instance
export const simpleAuthService = new SimpleAuthService();
export default simpleAuthService;
