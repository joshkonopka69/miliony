import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail as firebaseSendPasswordResetEmail, 
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { supabaseService, User as SupabaseUser } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
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

export interface PasswordResetData {
  email: string;
}

// Auth state management
let authStateListeners: ((state: AuthState) => void)[] = [];
let currentAuthState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

// Initialize auth state listener will be set up in the AuthService constructor

class AuthService {
  private unsubscribeAuth: (() => void) | null = null;

  constructor() {
    // Initialize auth state listener
    this.unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Get user data from Supabase
          const supabaseUser = await supabaseService.getCurrentUser();
          
          if (supabaseUser) {
            const authUser: AuthUser = {
              id: supabaseUser.id,
              email: supabaseUser.email,
              displayName: supabaseUser.display_name,
              avatarUrl: supabaseUser.avatar_url,
              favoriteSports: supabaseUser.favorite_sports || [],
              isEmailVerified: firebaseUser.emailVerified,
              createdAt: supabaseUser.created_at,
              updatedAt: supabaseUser.updated_at,
            };
            
            currentAuthState = {
              user: authUser,
              isLoading: false,
              isAuthenticated: true,
            };
          } else {
            // User exists in Firebase but not in Supabase - create profile
            const authUser: AuthUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              avatarUrl: firebaseUser.photoURL || undefined,
              favoriteSports: [],
              isEmailVerified: firebaseUser.emailVerified,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            // Create user profile in Supabase
            await supabaseService.createUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              display_name: firebaseUser.displayName || '',
              avatar_url: firebaseUser.photoURL || undefined,
              favorite_sports: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            
            currentAuthState = {
              user: authUser,
              isLoading: false,
              isAuthenticated: true,
            };
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          currentAuthState = {
            user: null,
            isLoading: false,
            isAuthenticated: false,
          };
        }
      } else {
        currentAuthState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
        };
      }
      
      // Notify all listeners
      authStateListeners.forEach(listener => listener(currentAuthState));
    });
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
      // Create Firebase user
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      // Update Firebase profile
      await updateProfile(firebaseUser, {
        displayName: credentials.displayName,
      });

      // Send email verification
      await sendEmailVerification(firebaseUser);

      // Create user profile in Supabase
      const supabaseUser = await supabaseService.createUser({
        id: firebaseUser.uid,
        email: credentials.email,
        display_name: credentials.displayName,
        favorite_sports: credentials.favoriteSports,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (!supabaseUser) {
        throw new Error('Failed to create user profile');
      }

      const authUser: AuthUser = {
        id: firebaseUser.uid,
        email: credentials.email,
        displayName: credentials.displayName,
        favoriteSports: credentials.favoriteSports,
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save auth state to storage
      await AsyncStorage.setItem('auth_user', JSON.stringify(authUser));

      return { success: true, user: authUser };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: this.getErrorMessage(error.code),
          customData: error.customData,
          name: error.name,
        },
      };
    }
  }

  // Login with email and password
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: AuthUser; error?: AuthError }> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      // Get user data from Supabase
      const supabaseUser = await supabaseService.getCurrentUser();
      
      if (!supabaseUser) {
        throw new Error('User profile not found');
      }

      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        displayName: supabaseUser.display_name,
        avatarUrl: supabaseUser.avatar_url,
        favoriteSports: supabaseUser.favorite_sports || [],
        isEmailVerified: firebaseUser.emailVerified,
        createdAt: supabaseUser.created_at,
        updatedAt: supabaseUser.updated_at,
      };

      // Save auth state to storage
      await AsyncStorage.setItem('auth_user', JSON.stringify(authUser));

      return { success: true, user: authUser };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: this.getErrorMessage(error.code),
          customData: error.customData,
          name: error.name,
        },
      };
    }
  }

  // Google Sign-In
  async signInWithGoogle(): Promise<{ success: boolean; user?: AuthUser; error?: AuthError }> {
    try {
      // Note: In React Native, you'll need to use @react-native-google-signin/google-signin
      // This is a placeholder implementation for now
      throw new Error('Google Sign-In requires @react-native-google-signin/google-signin package');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: this.getErrorMessage(error.code),
          customData: error.customData,
          name: error.name,
        },
      };
    }
  }

  // Apple Sign-In (placeholder - requires @react-native-apple-authentication)
  async signInWithApple(): Promise<{ success: boolean; user?: AuthUser; error?: AuthError }> {
    try {
      // This is a placeholder implementation
      // In a real app, you'd use @react-native-apple-authentication
      throw new Error('Apple Sign-In not implemented yet');
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: this.getErrorMessage(error.code),
          customData: error.customData,
          name: error.name,
        },
      };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: this.getErrorMessage(error.code),
          customData: error.customData,
          name: error.name,
        },
      };
    }
  }

  // Send email verification
  async sendEmailVerification(): Promise<{ success: boolean; error?: AuthError }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      await sendEmailVerification(user);
      return { success: true };
    } catch (error: any) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: this.getErrorMessage(error.code),
          customData: error.customData,
          name: error.name,
        },
      };
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<AuthUser>): Promise<{ success: boolean; user?: AuthUser; error?: AuthError }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      // Update Firebase profile
      if (updates.displayName) {
        await updateProfile(user, {
          displayName: updates.displayName,
        });
      }

      // Update Supabase profile
      const supabaseUser = await supabaseService.updateUser(user.uid, {
        display_name: updates.displayName,
        avatar_url: updates.avatarUrl,
        favorite_sports: updates.favoriteSports,
        updated_at: new Date().toISOString(),
      });

      if (!supabaseUser) {
        throw new Error('Failed to update user profile');
      }

      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        displayName: supabaseUser.display_name,
        avatarUrl: supabaseUser.avatar_url,
        favoriteSports: supabaseUser.favorite_sports || [],
        isEmailVerified: user.emailVerified,
        createdAt: supabaseUser.created_at,
        updatedAt: supabaseUser.updated_at,
      };

      // Update stored auth state
      await AsyncStorage.setItem('auth_user', JSON.stringify(authUser));

      return { success: true, user: authUser };
    } catch (error: any) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: this.getErrorMessage(error.code),
          customData: error.customData,
          name: error.name,
        },
      };
    }
  }

  // Logout
  async logout(): Promise<{ success: boolean; error?: AuthError }> {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('auth_user');
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: {
          code: error.code || 'auth/unknown',
          message: this.getErrorMessage(error.code),
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

  // Get user from storage (for app initialization)
  async getUserFromStorage(): Promise<AuthUser | null> {
    try {
      const storedUser = await AsyncStorage.getItem('auth_user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (error) {
      console.error('Error getting user from storage:', error);
      return null;
    }
  }

  // Cleanup method
  cleanup(): void {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
      this.unsubscribeAuth = null;
    }
  }

  // Error message mapping
  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
      'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
      'auth/requires-recent-login': 'Please sign in again to complete this action.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled.',
      'auth/credential-already-in-use': 'This credential is already associated with a different user account.',
    };

    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }
}

// Create and export singleton instance
export const authService = new AuthService();
export default authService;
