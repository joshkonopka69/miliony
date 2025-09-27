import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  userService, 
  UserProfile, 
  UserPreferences, 
  UserStats,
  CreateUserProfileData,
  UpdateUserProfileData,
  UserSearchFilters
} from '../services/userService';
import { 
  friendService, 
  FriendRequest, 
  FriendSuggestion,
  FriendSearchFilters
} from '../services/friendService';
import { 
  privacyService, 
  PrivacySettings, 
  ConsentSettings,
  DataRetentionSettings
} from '../services/privacyService';
import { useAuth } from './AuthContext';

// User context types
export interface UserState {
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  privacySettings: PrivacySettings | null;
  consentSettings: ConsentSettings | null;
  stats: UserStats | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

export interface FriendsState {
  friends: UserProfile[];
  friendRequests: {
    sent: FriendRequest[];
    received: FriendRequest[];
  };
  suggestions: FriendSuggestion[];
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

export interface UserContextType {
  // User state
  userState: UserState;
  friendsState: FriendsState;
  
  // User profile actions
  createUserProfile: (data: CreateUserProfileData) => Promise<boolean>;
  updateUserProfile: (updates: UpdateUserProfileData) => Promise<boolean>;
  refreshUserProfile: () => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<string | null>;
  deleteProfilePicture: () => Promise<boolean>;
  
  // User preferences
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<boolean>;
  refreshUserPreferences: () => Promise<void>;
  
  // Privacy settings
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<boolean>;
  updateConsentSettings: (consent: Partial<ConsentSettings>) => Promise<boolean>;
  refreshPrivacySettings: () => Promise<void>;
  
  // User search
  searchUsers: (filters: UserSearchFilters) => Promise<UserProfile[]>;
  
  // Friends actions
  sendFriendRequest: (userId: string, message?: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<boolean>;
  declineFriendRequest: (requestId: string) => Promise<boolean>;
  removeFriend: (friendId: string) => Promise<boolean>;
  refreshFriends: () => Promise<void>;
  refreshFriendRequests: () => Promise<void>;
  refreshFriendSuggestions: () => Promise<void>;
  searchFriends: (filters: FriendSearchFilters) => Promise<UserProfile[]>;
  
  // User statistics
  refreshUserStats: () => Promise<void>;
  
  // Data management
  exportUserData: () => Promise<any>;
  deleteUserData: () => Promise<boolean>;
  
  // Utility functions
  clearError: () => void;
  refreshAll: () => Promise<void>;
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authUser, isAuthenticated } = useAuth();
  
  // User state
  const [userState, setUserState] = useState<UserState>({
    profile: null,
    preferences: null,
    privacySettings: null,
    consentSettings: null,
    stats: null,
    isLoading: false,
    isUpdating: false,
    error: null,
  });

  // Friends state
  const [friendsState, setFriendsState] = useState<FriendsState>({
    friends: [],
    friendRequests: {
      sent: [],
      received: [],
    },
    suggestions: [],
    isLoading: false,
    isUpdating: false,
    error: null,
  });

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated && authUser) {
      loadUserData();
    } else {
      // Clear user data when not authenticated
      setUserState(prev => ({
        ...prev,
        profile: null,
        preferences: null,
        privacySettings: null,
        consentSettings: null,
        stats: null,
      }));
      setFriendsState(prev => ({
        ...prev,
        friends: [],
        friendRequests: { sent: [], received: [] },
        suggestions: [],
      }));
    }
  }, [isAuthenticated, authUser]);

  // Load user data
  const loadUserData = async () => {
    if (!authUser) return;

    setUserState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [
        profile,
        preferences,
        privacySettings,
        consentSettings,
        stats
      ] = await Promise.all([
        userService.getUserProfile(authUser.id),
        userService.getUserPreferences(authUser.id),
        privacyService.getPrivacySettings(authUser.id),
        privacyService.getConsentSettings(authUser.id),
        userService.getUserStats(authUser.id),
      ]);

      setUserState(prev => ({
        ...prev,
        profile,
        preferences,
        privacySettings,
        consentSettings,
        stats,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error loading user data:', error);
      setUserState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to load user data',
      }));
    }
  };

  // Load friends data
  const loadFriendsData = async () => {
    if (!authUser) return;

    setFriendsState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [friends, sentRequests, receivedRequests, suggestions] = await Promise.all([
        friendService.getFriends(authUser.id),
        friendService.getFriendRequests(authUser.id, 'sent'),
        friendService.getFriendRequests(authUser.id, 'received'),
        friendService.getFriendSuggestions(authUser.id),
      ]);

      setFriendsState(prev => ({
        ...prev,
        friends,
        friendRequests: {
          sent: sentRequests,
          received: receivedRequests,
        },
        suggestions,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error loading friends data:', error);
      setFriendsState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to load friends data',
      }));
    }
  };

  // User profile actions
  const createUserProfile = async (data: CreateUserProfileData): Promise<boolean> => {
    if (!authUser) return false;

    setUserState(prev => ({ ...prev, isUpdating: true, error: null }));

    try {
      const profile = await userService.createUserProfile(data);
      if (profile) {
        setUserState(prev => ({
          ...prev,
          profile,
          isUpdating: false,
        }));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      setUserState(prev => ({
        ...prev,
        isUpdating: false,
        error: error.message || 'Failed to create user profile',
      }));
      return false;
    }
  };

  const updateUserProfile = async (updates: UpdateUserProfileData): Promise<boolean> => {
    if (!authUser) return false;

    setUserState(prev => ({ ...prev, isUpdating: true, error: null }));

    try {
      const profile = await userService.updateUserProfile(authUser.id, updates);
      if (profile) {
        setUserState(prev => ({
          ...prev,
          profile,
          isUpdating: false,
        }));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      setUserState(prev => ({
        ...prev,
        isUpdating: false,
        error: error.message || 'Failed to update user profile',
      }));
      return false;
    }
  };

  const refreshUserProfile = async (): Promise<void> => {
    if (!authUser) return;

    try {
      const profile = await userService.getUserProfile(authUser.id);
      setUserState(prev => ({ ...prev, profile }));
    } catch (error: any) {
      console.error('Error refreshing user profile:', error);
      setUserState(prev => ({
        ...prev,
        error: error.message || 'Failed to refresh user profile',
      }));
    }
  };

  const uploadProfilePicture = async (file: File): Promise<string | null> => {
    if (!authUser) return null;

    setUserState(prev => ({ ...prev, isUpdating: true, error: null }));

    try {
      const avatarUrl = await userService.uploadProfilePicture(authUser.id, file);
      if (avatarUrl) {
        await refreshUserProfile();
        setUserState(prev => ({ ...prev, isUpdating: false }));
        return avatarUrl;
      }
      return null;
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      setUserState(prev => ({
        ...prev,
        isUpdating: false,
        error: error.message || 'Failed to upload profile picture',
      }));
      return null;
    }
  };

  const deleteProfilePicture = async (): Promise<boolean> => {
    if (!authUser) return false;

    setUserState(prev => ({ ...prev, isUpdating: true, error: null }));

    try {
      const success = await userService.deleteProfilePicture(authUser.id);
      if (success) {
        await refreshUserProfile();
        setUserState(prev => ({ ...prev, isUpdating: false }));
      }
      return success;
    } catch (error: any) {
      console.error('Error deleting profile picture:', error);
      setUserState(prev => ({
        ...prev,
        isUpdating: false,
        error: error.message || 'Failed to delete profile picture',
      }));
      return false;
    }
  };

  // User preferences
  const updateUserPreferences = async (preferences: Partial<UserPreferences>): Promise<boolean> => {
    if (!authUser) return false;

    setUserState(prev => ({ ...prev, isUpdating: true, error: null }));

    try {
      const updatedPreferences = await userService.updateUserPreferences(authUser.id, preferences);
      if (updatedPreferences) {
        setUserState(prev => ({
          ...prev,
          preferences: updatedPreferences,
          isUpdating: false,
        }));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error updating user preferences:', error);
      setUserState(prev => ({
        ...prev,
        isUpdating: false,
        error: error.message || 'Failed to update user preferences',
      }));
      return false;
    }
  };

  const refreshUserPreferences = async (): Promise<void> => {
    if (!authUser) return;

    try {
      const preferences = await userService.getUserPreferences(authUser.id);
      setUserState(prev => ({ ...prev, preferences }));
    } catch (error: any) {
      console.error('Error refreshing user preferences:', error);
      setUserState(prev => ({
        ...prev,
        error: error.message || 'Failed to refresh user preferences',
      }));
    }
  };

  // Privacy settings
  const updatePrivacySettings = async (settings: Partial<PrivacySettings>): Promise<boolean> => {
    if (!authUser) return false;

    setUserState(prev => ({ ...prev, isUpdating: true, error: null }));

    try {
      const updatedSettings = await privacyService.updatePrivacySettings(authUser.id, settings);
      if (updatedSettings) {
        setUserState(prev => ({
          ...prev,
          privacySettings: updatedSettings,
          isUpdating: false,
        }));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error updating privacy settings:', error);
      setUserState(prev => ({
        ...prev,
        isUpdating: false,
        error: error.message || 'Failed to update privacy settings',
      }));
      return false;
    }
  };

  const updateConsentSettings = async (consent: Partial<ConsentSettings>): Promise<boolean> => {
    if (!authUser) return false;

    setUserState(prev => ({ ...prev, isUpdating: true, error: null }));

    try {
      const updatedConsent = await privacyService.updateConsentSettings(authUser.id, consent);
      if (updatedConsent) {
        setUserState(prev => ({
          ...prev,
          consentSettings: updatedConsent,
          isUpdating: false,
        }));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error updating consent settings:', error);
      setUserState(prev => ({
        ...prev,
        isUpdating: false,
        error: error.message || 'Failed to update consent settings',
      }));
      return false;
    }
  };

  const refreshPrivacySettings = async (): Promise<void> => {
    if (!authUser) return;

    try {
      const [privacySettings, consentSettings] = await Promise.all([
        privacyService.getPrivacySettings(authUser.id),
        privacyService.getConsentSettings(authUser.id),
      ]);

      setUserState(prev => ({
        ...prev,
        privacySettings,
        consentSettings,
      }));
    } catch (error: any) {
      console.error('Error refreshing privacy settings:', error);
      setUserState(prev => ({
        ...prev,
        error: error.message || 'Failed to refresh privacy settings',
      }));
    }
  };

  // User search
  const searchUsers = async (filters: UserSearchFilters): Promise<UserProfile[]> => {
    try {
      return await userService.searchUsers(filters);
    } catch (error: any) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  // Friends actions
  const sendFriendRequest = async (userId: string, message?: string): Promise<boolean> => {
    if (!authUser) return false;

    setFriendsState(prev => ({ ...prev, isUpdating: true, error: null }));

    try {
      const success = await friendService.sendFriendRequest(authUser.id, userId, message);
      if (success) {
        await refreshFriendRequests();
        setFriendsState(prev => ({ ...prev, isUpdating: false }));
      }
      return success;
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      setFriendsState(prev => ({
        ...prev,
        isUpdating: false,
        error: error.message || 'Failed to send friend request',
      }));
      return false;
    }
  };

  const acceptFriendRequest = async (requestId: string): Promise<boolean> => {
    if (!authUser) return false;

    setFriendsState(prev => ({ ...prev, isUpdating: true, error: null }));

    try {
      const success = await friendService.acceptFriendRequest(requestId);
      if (success) {
        await Promise.all([refreshFriends(), refreshFriendRequests()]);
        setFriendsState(prev => ({ ...prev, isUpdating: false }));
      }
      return success;
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      setFriendsState(prev => ({
        ...prev,
        isUpdating: false,
        error: error.message || 'Failed to accept friend request',
      }));
      return false;
    }
  };

  const declineFriendRequest = async (requestId: string): Promise<boolean> => {
    if (!authUser) return false;

    setFriendsState(prev => ({ ...prev, isUpdating: true, error: null }));

    try {
      const success = await friendService.declineFriendRequest(requestId);
      if (success) {
        await refreshFriendRequests();
        setFriendsState(prev => ({ ...prev, isUpdating: false }));
      }
      return success;
    } catch (error: any) {
      console.error('Error declining friend request:', error);
      setFriendsState(prev => ({
        ...prev,
        isUpdating: false,
        error: error.message || 'Failed to decline friend request',
      }));
      return false;
    }
  };

  const removeFriend = async (friendId: string): Promise<boolean> => {
    if (!authUser) return false;

    setFriendsState(prev => ({ ...prev, isUpdating: true, error: null }));

    try {
      const success = await friendService.removeFriend(authUser.id, friendId);
      if (success) {
        await refreshFriends();
        setFriendsState(prev => ({ ...prev, isUpdating: false }));
      }
      return success;
    } catch (error: any) {
      console.error('Error removing friend:', error);
      setFriendsState(prev => ({
        ...prev,
        isUpdating: false,
        error: error.message || 'Failed to remove friend',
      }));
      return false;
    }
  };

  const refreshFriends = async (): Promise<void> => {
    if (!authUser) return;

    try {
      const friends = await friendService.getFriends(authUser.id);
      setFriendsState(prev => ({ ...prev, friends }));
    } catch (error: any) {
      console.error('Error refreshing friends:', error);
      setFriendsState(prev => ({
        ...prev,
        error: error.message || 'Failed to refresh friends',
      }));
    }
  };

  const refreshFriendRequests = async (): Promise<void> => {
    if (!authUser) return;

    try {
      const [sentRequests, receivedRequests] = await Promise.all([
        friendService.getFriendRequests(authUser.id, 'sent'),
        friendService.getFriendRequests(authUser.id, 'received'),
      ]);

      setFriendsState(prev => ({
        ...prev,
        friendRequests: {
          sent: sentRequests,
          received: receivedRequests,
        },
      }));
    } catch (error: any) {
      console.error('Error refreshing friend requests:', error);
      setFriendsState(prev => ({
        ...prev,
        error: error.message || 'Failed to refresh friend requests',
      }));
    }
  };

  const refreshFriendSuggestions = async (): Promise<void> => {
    if (!authUser) return;

    try {
      const suggestions = await friendService.getFriendSuggestions(authUser.id);
      setFriendsState(prev => ({ ...prev, suggestions }));
    } catch (error: any) {
      console.error('Error refreshing friend suggestions:', error);
      setFriendsState(prev => ({
        ...prev,
        error: error.message || 'Failed to refresh friend suggestions',
      }));
    }
  };

  const searchFriends = async (filters: FriendSearchFilters): Promise<UserProfile[]> => {
    if (!authUser) return [];

    try {
      return await friendService.searchFriends(authUser.id, filters);
    } catch (error: any) {
      console.error('Error searching friends:', error);
      return [];
    }
  };

  // User statistics
  const refreshUserStats = async (): Promise<void> => {
    if (!authUser) return;

    try {
      const stats = await userService.getUserStats(authUser.id);
      setUserState(prev => ({ ...prev, stats }));
    } catch (error: any) {
      console.error('Error refreshing user stats:', error);
      setUserState(prev => ({
        ...prev,
        error: error.message || 'Failed to refresh user stats',
      }));
    }
  };

  // Data management
  const exportUserData = async (): Promise<any> => {
    if (!authUser) return null;

    try {
      return await privacyService.exportUserData(authUser.id);
    } catch (error: any) {
      console.error('Error exporting user data:', error);
      return null;
    }
  };

  const deleteUserData = async (): Promise<boolean> => {
    if (!authUser) return false;

    try {
      return await privacyService.deleteUserData(authUser.id);
    } catch (error: any) {
      console.error('Error deleting user data:', error);
      return false;
    }
  };

  // Utility functions
  const clearError = (): void => {
    setUserState(prev => ({ ...prev, error: null }));
    setFriendsState(prev => ({ ...prev, error: null }));
  };

  const refreshAll = async (): Promise<void> => {
    await Promise.all([
      loadUserData(),
      loadFriendsData(),
    ]);
  };

  // Context value
  const value: UserContextType = {
    // User state
    userState,
    friendsState,
    
    // User profile actions
    createUserProfile,
    updateUserProfile,
    refreshUserProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    
    // User preferences
    updateUserPreferences,
    refreshUserPreferences,
    
    // Privacy settings
    updatePrivacySettings,
    updateConsentSettings,
    refreshPrivacySettings,
    
    // User search
    searchUsers,
    
    // Friends actions
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    refreshFriends,
    refreshFriendRequests,
    refreshFriendSuggestions,
    searchFriends,
    
    // User statistics
    refreshUserStats,
    
    // Data management
    exportUserData,
    deleteUserData,
    
    // Utility functions
    clearError,
    refreshAll,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use user context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Export types for use in other components
export type { UserState, FriendsState, UserContextType };
