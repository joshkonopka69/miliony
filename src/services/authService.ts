import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  favorite_sports: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  is_online: boolean;
  last_active: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    this.initializeAuth();
  }

  // Initialize authentication
  private async initializeAuth(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  // Load user profile from database
  private async loadUserProfile(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      this.currentUser = {
        id: data.id,
        email: data.email,
        display_name: data.display_name,
        avatar_url: data.avatar_url,
        favorite_sports: data.favorite_sports || [],
        location: data.location_latitude && data.location_longitude ? {
          latitude: data.location_latitude,
          longitude: data.location_longitude,
        } : undefined,
        is_online: data.is_online || false,
        last_active: data.last_active || new Date().toISOString(),
      };

      this.notifyListeners();
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  // Sign up with email and password
  async signUp(email: string, password: string, userData: {
    display_name: string;
    favorite_sports: string[];
    avatar_url?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔵 Starting signup for:', email);
      console.log('🔵 Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: userData.display_name,
          },
        },
      });

      if (error) {
        console.error('🔴 Signup error:', error);
        return { success: false, error: error.message };
      }

      console.log('🟢 Signup successful, user ID:', data.user?.id);

      if (data.user) {
        console.log('🔵 Creating user profile...');
        // Create or update user profile in database (upsert to handle existing users)
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email!,
            display_name: userData.display_name,
            avatar_url: userData.avatar_url,
            favorite_sports: userData.favorite_sports,
            is_online: true,
            last_active: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('🔴 Error creating user profile:', profileError);
          return { success: false, error: `Failed to create user profile: ${profileError.message}` };
        }

        console.log('🟢 User profile created successfully');
        await this.loadUserProfile(data.user.id);
        console.log('🟢 User profile loaded');
        return { success: true };
      }

      return { success: false, error: 'User creation failed' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await this.loadUserProfile(data.user.id);
        await this.updateUserOnlineStatus(true);
        return { success: true };
      }

      return { success: false, error: 'Sign in failed' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await this.updateUserOnlineStatus(false);
      await supabase.auth.signOut();
      this.currentUser = null;
      this.notifyListeners();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Update user profile
  async updateProfile(updates: Partial<AuthUser>): Promise<{ success: boolean; error?: string }> {
    if (!this.currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          display_name: updates.display_name,
          avatar_url: updates.avatar_url,
          favorite_sports: updates.favorite_sports,
          location_latitude: updates.location?.latitude,
          location_longitude: updates.location?.longitude,
          last_active: new Date().toISOString(),
        })
        .eq('id', this.currentUser.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update local user data
      this.currentUser = { ...this.currentUser, ...updates };
      this.notifyListeners();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Update user online status
  async updateUserOnlineStatus(isOnline: boolean): Promise<void> {
    if (!this.currentUser) return;

    try {
      await supabase
        .from('users')
        .update({
          is_online: isOnline,
          last_active: new Date().toISOString(),
        })
        .eq('id', this.currentUser.id);

      this.currentUser.is_online = isOnline;
      this.currentUser.last_active = new Date().toISOString();
      this.notifyListeners();
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }

  // Update user location
  async updateLocation(latitude: number, longitude: number): Promise<void> {
    if (!this.currentUser) return;

    try {
      await supabase
        .from('users')
        .update({
          location_latitude: latitude,
          location_longitude: longitude,
          last_active: new Date().toISOString(),
        })
        .eq('id', this.currentUser.id);

      this.currentUser.location = { latitude, longitude };
      this.currentUser.last_active = new Date().toISOString();
      this.notifyListeners();
    } catch (error) {
      console.error('Error updating location:', error);
    }
  }

  // Add auth state listener
  addAuthStateListener(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    // Call immediately with current state
    listener(this.getAuthState());
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get current auth state
  getAuthState(): AuthState {
    return {
      user: this.currentUser,
      isLoading: false,
      isAuthenticated: this.currentUser !== null,
    };
  }

  // Notify listeners of auth state changes
  private notifyListeners(): void {
    const state = this.getAuthState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  // Get user ID for event actions
  getUserId(): string | null {
    return this.currentUser?.id || null;
  }

  // Register new user
  async register(email: string, password: string, userData: {
    display_name: string;
    favorite_sports: string[];
    avatar_url?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create or update user profile in users table (upsert to handle existing users)
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email!,
            display_name: userData.display_name,
            favorite_sports: userData.favorite_sports,
            avatar_url: userData.avatar_url,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          return { success: false, error: 'Failed to create user profile' };
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  // Check if user can perform action
  canPerformAction(action: string, resourceId?: string): boolean {
    if (!this.currentUser) return false;
    
    // Add specific permission checks here
    switch (action) {
      case 'join_event':
        return true;
      case 'create_event':
        return true;
      case 'edit_event':
        return resourceId ? this.currentUser.id === resourceId : false;
      case 'delete_event':
        return resourceId ? this.currentUser.id === resourceId : false;
      default:
        return false;
    }
  }
}

export const authService = new AuthService();