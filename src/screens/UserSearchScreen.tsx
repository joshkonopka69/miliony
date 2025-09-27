import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  Image,
} from 'react-native';
import { useAppNavigation } from '../navigation';
import { useUser } from '../contexts/UserContext';
import { useFriends } from '../hooks/useFriends';
import { useTranslation } from '../contexts/TranslationContext';

// Custom SM Logo Component
const SMLogo = ({ size = 30 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

export default function UserSearchScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const { searchUsers } = useUser();
  const { sendFriendRequest, isFriend, hasPendingRequest } = useFriends();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sports: [] as string[],
    age_range: { min: 18, max: 65 },
    gender: [] as string[],
    online_only: false,
    has_events: false,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchUsers({
        query: searchQuery,
        sports: filters.sports.length > 0 ? filters.sports : undefined,
        age_range: filters.age_range,
        gender: filters.gender.length > 0 ? filters.gender : undefined,
        online_only: filters.online_only,
        has_events: filters.has_events,
        limit: 20,
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (userId: string, userName: string) => {
    const success = await sendFriendRequest(userId, `Hi ${userName}, I'd like to connect with you on SportMap!`);
    if (success) {
      Alert.alert('Success', `Friend request sent to ${userName}!`);
    } else {
      Alert.alert('Error', 'Failed to send friend request. Please try again.');
    }
  };

  const handleViewProfile = (userId: string) => {
    // TODO: Navigate to user's profile
    console.log('View profile for:', userId);
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleSportToggle = (sport: string) => {
    const currentSports = filters.sports;
    const newSports = currentSports.includes(sport)
      ? currentSports.filter(s => s !== sport)
      : [...currentSports, sport];
    
    handleFilterChange('sports', newSports);
  };

  const handleGenderToggle = (gender: string) => {
    const currentGenders = filters.gender;
    const newGenders = currentGenders.includes(gender)
      ? currentGenders.filter(g => g !== gender)
      : [...currentGenders, gender];
    
    handleFilterChange('gender', newGenders);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getLastActiveText = (lastActive?: string) => {
    if (!lastActive) return 'Never';
    
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffMs = now.getTime() - lastActiveDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return lastActiveDate.toLocaleDateString();
  };

  const isOnline = (lastActive?: string) => {
    if (!lastActive) return false;
    
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffMs = now.getTime() - lastActiveDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    return diffMinutes < 15; // Consider online if active within last 15 minutes
  };

  const renderUserItem = (user: any) => {
    const online = isOnline(user.last_active);
    const isUserFriend = isFriend(user.id);
    const hasPending = hasPendingRequest(user.id);

    return (
      <View key={user.id} style={styles.userItem}>
        <View style={styles.userHeader}>
          <View style={styles.userAvatarContainer}>
            {user.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.userAvatar} />
            ) : (
              <View style={styles.userAvatarPlaceholder}>
                <Text style={styles.userAvatarText}>{getInitials(user.display_name)}</Text>
              </View>
            )}
            {online && <View style={styles.onlineIndicator} />}
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.display_name}</Text>
            <Text style={styles.userLastActive}>
              {online ? 'Online' : `Last active ${getLastActiveText(user.last_active)}`}
            </Text>
            {user.bio && (
              <Text style={styles.userBio} numberOfLines={2}>
                {user.bio}
              </Text>
            )}
            {user.favorite_sports && user.favorite_sports.length > 0 && (
              <View style={styles.sportsContainer}>
                {user.favorite_sports.slice(0, 3).map((sport: string, index: number) => (
                  <View key={index} style={styles.sportChip}>
                    <Text style={styles.sportChipText}>{sport}</Text>
                  </View>
                ))}
                {user.favorite_sports.length > 3 && (
                  <Text style={styles.moreSportsText}>+{user.favorite_sports.length - 3} more</Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.userActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleViewProfile(user.id)}
            >
              <Text style={styles.actionButtonText}>👤</Text>
            </TouchableOpacity>
            
            {!isUserFriend && !hasPending && (
              <TouchableOpacity 
                style={styles.addFriendButton}
                onPress={() => handleSendFriendRequest(user.id, user.display_name)}
              >
                <Text style={styles.addFriendButtonText}>+</Text>
              </TouchableOpacity>
            )}
            
            {isUserFriend && (
              <View style={styles.friendBadge}>
                <Text style={styles.friendBadgeText}>✓</Text>
              </View>
            )}
            
            {hasPending && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>⏳</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderFilters = () => (
    <Animated.View 
      style={[
        styles.filtersContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.filtersTitle}>Filters</Text>
      
      {/* Sports Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Sports</Text>
        <View style={styles.sportsFilter}>
          {['Basketball', 'Football', 'Tennis', 'Soccer', 'Volleyball', 'Boxing', 'Gym', 'Running'].map((sport) => (
            <TouchableOpacity
              key={sport}
              style={[
                styles.filterChip,
                filters.sports.includes(sport) && styles.filterChipSelected
              ]}
              onPress={() => handleSportToggle(sport)}
            >
              <Text style={[
                styles.filterChipText,
                filters.sports.includes(sport) && styles.filterChipTextSelected
              ]}>
                {sport}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Gender Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Gender</Text>
        <View style={styles.genderFilter}>
          {['male', 'female', 'other'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.filterChip,
                filters.gender.includes(gender) && styles.filterChipSelected
              ]}
              onPress={() => handleGenderToggle(gender)}
            >
              <Text style={[
                styles.filterChipText,
                filters.gender.includes(gender) && styles.filterChipTextSelected
              ]}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Age Range Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Age Range</Text>
        <View style={styles.ageRangeContainer}>
          <Text style={styles.ageRangeText}>
            {filters.age_range.min} - {filters.age_range.max} years
          </Text>
        </View>
      </View>

      {/* Additional Filters */}
      <View style={styles.filterSection}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Online Only</Text>
          <TouchableOpacity
            style={[styles.toggleButton, filters.online_only && styles.toggleButtonActive]}
            onPress={() => handleFilterChange('online_only', !filters.online_only)}
          >
            <Text style={[styles.toggleButtonText, filters.online_only && styles.toggleButtonTextActive]}>
              {filters.online_only ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Has Events</Text>
          <TouchableOpacity
            style={[styles.toggleButton, filters.has_events && styles.toggleButtonActive]}
            onPress={() => handleFilterChange('has_events', !filters.has_events)}
          >
            <Text style={[styles.toggleButtonText, filters.has_events && styles.toggleButtonTextActive]}>
              {filters.has_events ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Friends</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search for friends..."
          placeholderTextColor="#8e8e93"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <ActivityIndicator color="#FFD700" size="small" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && renderFilters()}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Search Results */}
          {searchResults.length > 0 ? (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </Text>
              <View style={styles.usersList}>
                {searchResults.map(renderUserItem)}
              </View>
            </View>
          ) : searchQuery ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search terms or filters
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>Find New Friends</Text>
              <Text style={styles.emptySubtitle}>
                Search for friends by name, interests, or location
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 16,
    color: '#333333',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFD700',
    borderRadius: 12,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  sportsFilter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderFilter: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    backgroundColor: '#ffffff',
  },
  filterChipSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  filterChipTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  ageRangeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  ageRangeText: {
    fontSize: 14,
    color: '#333333',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e1e5e9',
  },
  toggleButtonActive: {
    backgroundColor: '#FFD700',
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  toggleButtonTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsContainer: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  usersList: {
    gap: 12,
  },
  userItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e1e5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  userLastActive: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  sportChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  sportChipText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#666666',
  },
  moreSportsText: {
    fontSize: 10,
    color: '#999999',
    alignSelf: 'center',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  actionButtonText: {
    fontSize: 16,
  },
  addFriendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFriendButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  friendBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  friendBadgeText: {
    fontSize: 16,
    color: '#2e7d32',
  },
  pendingBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  pendingBadgeText: {
    fontSize: 16,
    color: '#ef6c00',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});
