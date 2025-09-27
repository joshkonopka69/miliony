import { useCallback, useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  UserProfile, 
  FriendRequest, 
  FriendSuggestion,
  FriendSearchFilters
} from '../services/friendService';

// Hook for friends management
export const useFriends = () => {
  const {
    friendsState,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    refreshFriends,
    refreshFriendRequests,
    refreshFriendSuggestions,
    searchFriends,
    clearError,
  } = useUser();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize friends data on mount
  useEffect(() => {
    if (friendsState.friends.length > 0 && !isInitialized) {
      setIsInitialized(true);
    }
  }, [friendsState.friends, isInitialized]);

  // Friend request management
  const handleSendFriendRequest = useCallback(async (userId: string, message?: string) => {
    const success = await sendFriendRequest(userId, message);
    if (success) {
      await refreshFriendRequests();
    }
    return success;
  }, [sendFriendRequest, refreshFriendRequests]);

  const handleAcceptFriendRequest = useCallback(async (requestId: string) => {
    const success = await acceptFriendRequest(requestId);
    if (success) {
      await Promise.all([refreshFriends(), refreshFriendRequests()]);
    }
    return success;
  }, [acceptFriendRequest, refreshFriends, refreshFriendRequests]);

  const handleDeclineFriendRequest = useCallback(async (requestId: string) => {
    const success = await declineFriendRequest(requestId);
    if (success) {
      await refreshFriendRequests();
    }
    return success;
  }, [declineFriendRequest, refreshFriendRequests]);

  const handleRemoveFriend = useCallback(async (friendId: string) => {
    const success = await removeFriend(friendId);
    if (success) {
      await refreshFriends();
    }
    return success;
  }, [removeFriend, refreshFriends]);

  // Data refresh
  const handleRefreshFriends = useCallback(async () => {
    await refreshFriends();
  }, [refreshFriends]);

  const handleRefreshFriendRequests = useCallback(async () => {
    await refreshFriendRequests();
  }, [refreshFriendRequests]);

  const handleRefreshFriendSuggestions = useCallback(async () => {
    await refreshFriendSuggestions();
  }, [refreshFriendSuggestions]);

  // Friend search
  const handleSearchFriends = useCallback(async (filters: FriendSearchFilters) => {
    return await searchFriends(filters);
  }, [searchFriends]);

  // Computed values
  const getFriendsCount = useCallback(() => {
    return friendsState.friends.length;
  }, [friendsState.friends]);

  const getPendingRequestsCount = useCallback(() => {
    return friendsState.friendRequests.received.length;
  }, [friendsState.friendRequests.received]);

  const getSentRequestsCount = useCallback(() => {
    return friendsState.friendRequests.sent.length;
  }, [friendsState.friendRequests.sent]);

  const getSuggestionsCount = useCallback(() => {
    return friendsState.suggestions.length;
  }, [friendsState.suggestions]);

  const isFriend = useCallback((userId: string) => {
    return friendsState.friends.some(friend => friend.id === userId);
  }, [friendsState.friends]);

  const hasPendingRequest = useCallback((userId: string) => {
    return friendsState.friendRequests.sent.some(request => request.receiver_id === userId);
  }, [friendsState.friendRequests.sent]);

  const hasReceivedRequest = useCallback((userId: string) => {
    return friendsState.friendRequests.received.some(request => request.sender_id === userId);
  }, [friendsState.friendRequests.received]);

  const getFriendById = useCallback((friendId: string) => {
    return friendsState.friends.find(friend => friend.id === friendId);
  }, [friendsState.friends]);

  const getRequestById = useCallback((requestId: string) => {
    const sentRequest = friendsState.friendRequests.sent.find(request => request.id === requestId);
    const receivedRequest = friendsState.friendRequests.received.find(request => request.id === requestId);
    return sentRequest || receivedRequest;
  }, [friendsState.friendRequests]);

  const getSuggestionById = useCallback((userId: string) => {
    return friendsState.suggestions.find(suggestion => suggestion.user.id === userId);
  }, [friendsState.suggestions]);

  // Error handling
  const handleClearError = useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    // State
    friends: friendsState.friends,
    friendRequests: friendsState.friendRequests,
    suggestions: friendsState.suggestions,
    isLoading: friendsState.isLoading,
    isUpdating: friendsState.isUpdating,
    error: friendsState.error,
    isInitialized,
    
    // Actions
    sendFriendRequest: handleSendFriendRequest,
    acceptFriendRequest: handleAcceptFriendRequest,
    declineFriendRequest: handleDeclineFriendRequest,
    removeFriend: handleRemoveFriend,
    refreshFriends: handleRefreshFriends,
    refreshFriendRequests: handleRefreshFriendRequests,
    refreshFriendSuggestions: handleRefreshFriendSuggestions,
    searchFriends: handleSearchFriends,
    clearError: handleClearError,
    
    // Computed values
    friendsCount: getFriendsCount(),
    pendingRequestsCount: getPendingRequestsCount(),
    sentRequestsCount: getSentRequestsCount(),
    suggestionsCount: getSuggestionsCount(),
    isFriend,
    hasPendingRequest,
    hasReceivedRequest,
    getFriendById,
    getRequestById,
    getSuggestionById,
  };
};

// Hook for friend requests management
export const useFriendRequests = () => {
  const {
    friendRequests,
    acceptFriendRequest,
    declineFriendRequest,
    isUpdating,
    error,
    clearError,
  } = useFriends();

  const [selectedRequest, setSelectedRequest] = useState<FriendRequest | null>(null);

  const handleSelectRequest = useCallback((request: FriendRequest) => {
    setSelectedRequest(request);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedRequest(null);
  }, []);

  const handleAcceptRequest = useCallback(async (requestId: string) => {
    const success = await acceptFriendRequest(requestId);
    if (success) {
      setSelectedRequest(null);
    }
    return success;
  }, [acceptFriendRequest]);

  const handleDeclineRequest = useCallback(async (requestId: string) => {
    const success = await declineFriendRequest(requestId);
    if (success) {
      setSelectedRequest(null);
    }
    return success;
  }, [declineFriendRequest]);

  const getRequestById = useCallback((requestId: string) => {
    const sentRequest = friendRequests.sent.find(request => request.id === requestId);
    const receivedRequest = friendRequests.received.find(request => request.id === requestId);
    return sentRequest || receivedRequest;
  }, [friendRequests]);

  const getRequestsByUser = useCallback((userId: string) => {
    return [
      ...friendRequests.sent.filter(request => request.receiver_id === userId),
      ...friendRequests.received.filter(request => request.sender_id === userId),
    ];
  }, [friendRequests]);

  return {
    friendRequests,
    selectedRequest,
    isUpdating,
    error,
    selectRequest: handleSelectRequest,
    clearSelection: handleClearSelection,
    acceptRequest: handleAcceptRequest,
    declineRequest: handleDeclineRequest,
    getRequestById,
    getRequestsByUser,
    clearError,
  };
};

// Hook for friend suggestions
export const useFriendSuggestions = () => {
  const {
    suggestions,
    sendFriendRequest,
    refreshFriendSuggestions,
    isLoading,
    error,
    clearError,
  } = useFriends();

  const [selectedSuggestion, setSelectedSuggestion] = useState<FriendSuggestion | null>(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState<FriendSuggestion[]>([]);

  const handleSelectSuggestion = useCallback((suggestion: FriendSuggestion) => {
    setSelectedSuggestion(suggestion);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedSuggestion(null);
  }, []);

  const handleSendRequestToSuggestion = useCallback(async (suggestion: FriendSuggestion, message?: string) => {
    const success = await sendFriendRequest(suggestion.user.id, message);
    if (success) {
      setSelectedSuggestion(null);
      await refreshFriendSuggestions();
    }
    return success;
  }, [sendFriendRequest, refreshFriendSuggestions]);

  const handleRefreshSuggestions = useCallback(async () => {
    await refreshFriendSuggestions();
  }, [refreshFriendSuggestions]);

  const filterSuggestions = useCallback((filters: {
    mutualFriends?: number;
    commonSports?: number;
    reason?: string;
  }) => {
    let filtered = [...suggestions];

    if (filters.mutualFriends !== undefined) {
      filtered = filtered.filter(s => s.mutual_friends >= filters.mutualFriends!);
    }

    if (filters.commonSports !== undefined) {
      filtered = filtered.filter(s => s.common_sports.length >= filters.commonSports!);
    }

    if (filters.reason) {
      filtered = filtered.filter(s => s.reason.toLowerCase().includes(filters.reason!.toLowerCase()));
    }

    setFilteredSuggestions(filtered);
  }, [suggestions]);

  const clearFilters = useCallback(() => {
    setFilteredSuggestions(suggestions);
  }, [suggestions]);

  const getSuggestionById = useCallback((userId: string) => {
    return suggestions.find(suggestion => suggestion.user.id === userId);
  }, [suggestions]);

  const getSuggestionsByReason = useCallback((reason: string) => {
    return suggestions.filter(suggestion => suggestion.reason.toLowerCase().includes(reason.toLowerCase()));
  }, [suggestions]);

  const getTopSuggestions = useCallback((limit: number = 5) => {
    return suggestions
      .sort((a, b) => {
        if (a.mutual_friends !== b.mutual_friends) {
          return b.mutual_friends - a.mutual_friends;
        }
        return b.common_sports.length - a.common_sports.length;
      })
      .slice(0, limit);
  }, [suggestions]);

  return {
    suggestions: filteredSuggestions.length > 0 ? filteredSuggestions : suggestions,
    selectedSuggestion,
    isLoading,
    error,
    selectSuggestion: handleSelectSuggestion,
    clearSelection: handleClearSelection,
    sendRequestToSuggestion: handleSendRequestToSuggestion,
    refreshSuggestions: handleRefreshSuggestions,
    filterSuggestions,
    clearFilters,
    getSuggestionById,
    getSuggestionsByReason,
    getTopSuggestions,
    clearError,
  };
};

// Hook for friend search
export const useFriendSearch = () => {
  const {
    searchFriends,
    friends,
    isLoading,
    error,
    clearError,
  } = useFriends();

  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFilters, setSearchFilters] = useState<FriendSearchFilters>({});
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async (query: string, filters: FriendSearchFilters = {}) => {
    setIsSearching(true);
    setSearchQuery(query);
    setSearchFilters(filters);

    try {
      const results = await searchFriends({
        query,
        ...filters,
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching friends:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchFriends]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchFilters({});
  }, []);

  const handleUpdateFilters = useCallback((newFilters: Partial<FriendSearchFilters>) => {
    setSearchFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const getSearchResultsCount = useCallback(() => {
    return searchResults.length;
  }, [searchResults]);

  const getSearchResultsBySport = useCallback((sport: string) => {
    return searchResults.filter(friend => 
      friend.favorite_sports?.includes(sport)
    );
  }, [searchResults]);

  const getSearchResultsByLocation = useCallback((latitude: number, longitude: number, radius: number) => {
    // This would require more complex location filtering
    // For now, return all results
    return searchResults;
  }, [searchResults]);

  const getSearchResultsByActivity = useCallback((isActive: boolean) => {
    if (!isActive) return searchResults;
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    return searchResults.filter(friend => 
      friend.last_active && friend.last_active >= oneHourAgo
    );
  }, [searchResults]);

  return {
    searchResults,
    searchQuery,
    searchFilters,
    isSearching,
    isLoading,
    error,
    search: handleSearch,
    clearSearch: handleClearSearch,
    updateFilters: handleUpdateFilters,
    getSearchResultsCount,
    getSearchResultsBySport,
    getSearchResultsByLocation,
    getSearchResultsByActivity,
    clearError,
  };
};

// Hook for friend statistics
export const useFriendStats = () => {
  const {
    friends,
    friendRequests,
    suggestions,
    isLoading,
    error,
  } = useFriends();

  const [stats, setStats] = useState<{
    totalFriends: number;
    pendingRequests: number;
    sentRequests: number;
    suggestions: number;
    mutualFriends: { [friendId: string]: number };
    commonSports: { [sport: string]: number };
    activityLevel: 'high' | 'medium' | 'low';
  } | null>(null);

  const calculateStats = useCallback(() => {
    const totalFriends = friends.length;
    const pendingRequests = friendRequests.received.length;
    const sentRequests = friendRequests.sent.length;
    const suggestionsCount = suggestions.length;

    // Calculate mutual friends (simplified)
    const mutualFriends: { [friendId: string]: number } = {};
    friends.forEach(friend => {
      mutualFriends[friend.id] = Math.floor(Math.random() * 10); // Placeholder
    });

    // Calculate common sports
    const commonSports: { [sport: string]: number } = {};
    friends.forEach(friend => {
      friend.favorite_sports?.forEach(sport => {
        commonSports[sport] = (commonSports[sport] || 0) + 1;
      });
    });

    // Calculate activity level
    const activeFriends = friends.filter(friend => {
      if (!friend.last_active) return false;
      const lastActive = new Date(friend.last_active);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastActive >= oneWeekAgo;
    }).length;

    const activityLevel = activeFriends > friends.length * 0.7 ? 'high' :
                         activeFriends > friends.length * 0.3 ? 'medium' : 'low';

    return {
      totalFriends,
      pendingRequests,
      sentRequests,
      suggestions: suggestionsCount,
      mutualFriends,
      commonSports,
      activityLevel,
    };
  }, [friends, friendRequests, suggestions]);

  useEffect(() => {
    const calculatedStats = calculateStats();
    setStats(calculatedStats);
  }, [calculateStats]);

  const getTopCommonSports = useCallback((limit: number = 5) => {
    if (!stats) return [];
    
    return Object.entries(stats.commonSports)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([sport, count]) => ({ sport, count }));
  }, [stats]);

  const getMostActiveFriends = useCallback((limit: number = 5) => {
    return friends
      .filter(friend => friend.last_active)
      .sort((a, b) => {
        const aTime = new Date(a.last_active!).getTime();
        const bTime = new Date(b.last_active!).getTime();
        return bTime - aTime;
      })
      .slice(0, limit);
  }, [friends]);

  const getFriendsBySport = useCallback((sport: string) => {
    return friends.filter(friend => 
      friend.favorite_sports?.includes(sport)
    );
  }, [friends]);

  return {
    stats,
    isLoading,
    error,
    getTopCommonSports,
    getMostActiveFriends,
    getFriendsBySport,
  };
};

export default useFriends;
