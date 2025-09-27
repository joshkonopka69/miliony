import { useCallback, useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  UserProfile, 
  UserPreferences, 
  UserStats,
  UpdateUserProfileData,
  UserSearchFilters
} from '../services/userService';
import { PrivacySettings, ConsentSettings } from '../services/privacyService';

// Hook for user profile management
export const useUserProfile = () => {
  const {
    userState,
    createUserProfile,
    updateUserProfile,
    refreshUserProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    updateUserPreferences,
    refreshUserPreferences,
    updatePrivacySettings,
    updateConsentSettings,
    refreshPrivacySettings,
    searchUsers,
    refreshUserStats,
    exportUserData,
    deleteUserData,
    clearError,
  } = useUser();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize user profile on mount
  useEffect(() => {
    if (userState.profile && !isInitialized) {
      setIsInitialized(true);
    }
  }, [userState.profile, isInitialized]);

  // Profile management
  const handleCreateProfile = useCallback(async (data: Parameters<typeof createUserProfile>[0]) => {
    const success = await createUserProfile(data);
    if (success) {
      setIsInitialized(true);
    }
    return success;
  }, [createUserProfile]);

  const handleUpdateProfile = useCallback(async (updates: UpdateUserProfileData) => {
    return await updateUserProfile(updates);
  }, [updateUserProfile]);

  const handleRefreshProfile = useCallback(async () => {
    await refreshUserProfile();
  }, [refreshUserProfile]);

  // Profile picture management
  const handleUploadProfilePicture = useCallback(async (file: File) => {
    return await uploadProfilePicture(file);
  }, [uploadProfilePicture]);

  const handleDeleteProfilePicture = useCallback(async () => {
    return await deleteProfilePicture();
  }, [deleteProfilePicture]);

  // Preferences management
  const handleUpdatePreferences = useCallback(async (preferences: Partial<UserPreferences>) => {
    return await updateUserPreferences(preferences);
  }, [updateUserPreferences]);

  const handleRefreshPreferences = useCallback(async () => {
    await refreshUserPreferences();
  }, [refreshUserPreferences]);

  // Privacy settings management
  const handleUpdatePrivacySettings = useCallback(async (settings: Partial<PrivacySettings>) => {
    return await updatePrivacySettings(settings);
  }, [updatePrivacySettings]);

  const handleUpdateConsentSettings = useCallback(async (consent: Partial<ConsentSettings>) => {
    return await updateConsentSettings(consent);
  }, [updateConsentSettings]);

  const handleRefreshPrivacySettings = useCallback(async () => {
    await refreshPrivacySettings();
  }, [refreshPrivacySettings]);

  // User search
  const handleSearchUsers = useCallback(async (filters: UserSearchFilters) => {
    return await searchUsers(filters);
  }, [searchUsers]);

  // Statistics
  const handleRefreshStats = useCallback(async () => {
    await refreshUserStats();
  }, [refreshUserStats]);

  // Data management
  const handleExportData = useCallback(async () => {
    return await exportUserData();
  }, [exportUserData]);

  const handleDeleteData = useCallback(async () => {
    return await deleteUserData();
  }, [deleteUserData]);

  // Error handling
  const handleClearError = useCallback(() => {
    clearError();
  }, [clearError]);

  // Computed values
  const isProfileComplete = useCallback(() => {
    if (!userState.profile) return false;
    
    const requiredFields = ['display_name', 'email', 'favorite_sports'];
    return requiredFields.every(field => {
      const value = userState.profile?.[field as keyof UserProfile];
      return value !== null && value !== undefined && value !== '';
    });
  }, [userState.profile]);

  const getProfileCompletionPercentage = useCallback(() => {
    if (!userState.profile) return 0;
    
    const fields = [
      'display_name',
      'email',
      'bio',
      'age',
      'gender',
      'phone',
      'avatar_url',
      'favorite_sports',
      'location_latitude',
      'location_longitude',
    ];
    
    const completedFields = fields.filter(field => {
      const value = userState.profile?.[field as keyof UserProfile];
      return value !== null && value !== undefined && value !== '';
    });
    
    return Math.round((completedFields.length / fields.length) * 100);
  }, [userState.profile]);

  const getProfileStrength = useCallback(() => {
    const percentage = getProfileCompletionPercentage();
    
    if (percentage >= 90) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'fair';
    return 'poor';
  }, [getProfileCompletionPercentage]);

  const isProfilePublic = useCallback(() => {
    return userState.profile?.is_public ?? false;
  }, [userState.profile]);

  const isProfileVerified = useCallback(() => {
    return userState.profile?.is_verified ?? false;
  }, [userState.profile]);

  const getLastActiveTime = useCallback(() => {
    if (!userState.profile?.last_active) return null;
    
    const lastActive = new Date(userState.profile.last_active);
    const now = new Date();
    const diffMs = now.getTime() - lastActive.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return lastActive.toLocaleDateString();
  }, [userState.profile]);

  const isOnline = useCallback(() => {
    if (!userState.profile?.last_active) return false;
    
    const lastActive = new Date(userState.profile.last_active);
    const now = new Date();
    const diffMs = now.getTime() - lastActive.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    return diffMinutes < 15; // Consider online if active within last 15 minutes
  }, [userState.profile]);

  // Return hook interface
  return {
    // State
    profile: userState.profile,
    preferences: userState.preferences,
    privacySettings: userState.privacySettings,
    consentSettings: userState.consentSettings,
    stats: userState.stats,
    isLoading: userState.isLoading,
    isUpdating: userState.isUpdating,
    error: userState.error,
    isInitialized,
    
    // Actions
    createProfile: handleCreateProfile,
    updateProfile: handleUpdateProfile,
    refreshProfile: handleRefreshProfile,
    uploadProfilePicture: handleUploadProfilePicture,
    deleteProfilePicture: handleDeleteProfilePicture,
    updatePreferences: handleUpdatePreferences,
    refreshPreferences: handleRefreshPreferences,
    updatePrivacySettings: handleUpdatePrivacySettings,
    updateConsentSettings: handleUpdateConsentSettings,
    refreshPrivacySettings: handleRefreshPrivacySettings,
    searchUsers: handleSearchUsers,
    refreshStats: handleRefreshStats,
    exportData: handleExportData,
    deleteData: handleDeleteData,
    clearError: handleClearError,
    
    // Computed values
    isProfileComplete: isProfileComplete(),
    profileCompletionPercentage: getProfileCompletionPercentage(),
    profileStrength: getProfileStrength(),
    isProfilePublic: isProfilePublic(),
    isProfileVerified: isProfileVerified(),
    lastActiveTime: getLastActiveTime(),
    isOnline: isOnline(),
  };
};

// Hook for user profile editing
export const useUserProfileEditor = () => {
  const {
    profile,
    updateProfile,
    isUpdating,
    error,
    clearError,
  } = useUserProfile();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<any>(null);

  const startEditing = useCallback((field: string, currentValue: any) => {
    setEditingField(field);
    setTempValue(currentValue);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingField(null);
    setTempValue(null);
    clearError();
  }, [clearError]);

  const saveEdit = useCallback(async (field: string, value: any) => {
    const success = await updateProfile({ [field]: value });
    if (success) {
      setEditingField(null);
      setTempValue(null);
    }
    return success;
  }, [updateProfile]);

  const isEditing = useCallback((field: string) => {
    return editingField === field;
  }, [editingField]);

  const getEditingValue = useCallback((field: string, defaultValue: any) => {
    return isEditing(field) ? tempValue : (profile?.[field as keyof UserProfile] ?? defaultValue);
  }, [isEditing, tempValue, profile]);

  return {
    profile,
    isUpdating,
    error,
    editingField,
    tempValue,
    startEditing,
    cancelEditing,
    saveEdit,
    isEditing,
    getEditingValue,
    clearError,
  };
};

// Hook for user profile display
export const useUserProfileDisplay = (userId?: string) => {
  const { profile, stats, isLoading, error } = useUserProfile();
  const [displayProfile, setDisplayProfile] = useState<UserProfile | null>(null);
  const [displayStats, setDisplayStats] = useState<UserStats | null>(null);

  // If userId is provided, fetch that user's profile
  // Otherwise, use current user's profile
  useEffect(() => {
    if (userId && userId !== profile?.id) {
      // TODO: Implement fetching other user's profile
      // For now, use current user's profile
      setDisplayProfile(profile);
      setDisplayStats(stats);
    } else {
      setDisplayProfile(profile);
      setDisplayStats(stats);
    }
  }, [userId, profile, stats]);

  const getDisplayName = useCallback(() => {
    return displayProfile?.display_name ?? 'Unknown User';
  }, [displayProfile]);

  const getAvatarUrl = useCallback(() => {
    return displayProfile?.avatar_url ?? null;
  }, [displayProfile]);

  const getBio = useCallback(() => {
    return displayProfile?.bio ?? '';
  }, [displayProfile]);

  const getFavoriteSports = useCallback(() => {
    return displayProfile?.favorite_sports ?? [];
  }, [displayProfile]);

  const getLocation = useCallback(() => {
    if (!displayProfile?.location_latitude || !displayProfile?.location_longitude) {
      return null;
    }
    
    return {
      latitude: displayProfile.location_latitude,
      longitude: displayProfile.location_longitude,
    };
  }, [displayProfile]);

  const getAge = useCallback(() => {
    if (!displayProfile?.age) return null;
    return displayProfile.age;
  }, [displayProfile]);

  const getGender = useCallback(() => {
    return displayProfile?.gender ?? null;
  }, [displayProfile]);

  const getJoinDate = useCallback(() => {
    if (!displayProfile?.created_at) return null;
    return new Date(displayProfile.created_at);
  }, [displayProfile]);

  const getLastActive = useCallback(() => {
    if (!displayProfile?.last_active) return null;
    return new Date(displayProfile.last_active);
  }, [displayProfile]);

  const isPublic = useCallback(() => {
    return displayProfile?.is_public ?? false;
  }, [displayProfile]);

  const isVerified = useCallback(() => {
    return displayProfile?.is_verified ?? false;
  }, [displayProfile]);

  const getRating = useCallback(() => {
    return displayProfile?.rating ?? 0;
  }, [displayProfile]);

  const getBadges = useCallback(() => {
    return displayProfile?.badges ?? [];
  }, [displayProfile]);

  const getTotalEvents = useCallback(() => {
    return displayStats?.total_events_created ?? 0;
  }, [displayStats]);

  const getTotalFriends = useCallback(() => {
    return displayStats?.total_friends ?? 0;
  }, [displayStats]);

  const getAverageRating = useCallback(() => {
    return displayStats?.average_rating ?? 0;
  }, [displayStats]);

  return {
    profile: displayProfile,
    stats: displayStats,
    isLoading,
    error,
    getDisplayName,
    getAvatarUrl,
    getBio,
    getFavoriteSports,
    getLocation,
    getAge,
    getGender,
    getJoinDate,
    getLastActive,
    isPublic,
    isVerified,
    getRating,
    getBadges,
    getTotalEvents,
    getTotalFriends,
    getAverageRating,
  };
};

export default useUserProfile;
