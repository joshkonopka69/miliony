import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ActionSheetIOS
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../navigation/hooks';
import { BottomNavBar } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { supabase } from '../config/supabase';
import { ROUTES } from '../navigation/types';
import {
  takePhoto,
  pickImage,
  uploadProfilePhoto,
  deleteOldProfilePhoto,
} from '../services/photoUploadService';
import { supabaseService } from '../services/supabase';

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  favorite_sports: string[];
  created_at: string;
}

export default function ProfileScreen() {
  const navigation = useAppNavigation();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // User's game statistics (mock data - would come from backend)
  const [gameStats] = useState({
    basketball: 15,
    football: 8,
    tennis: 5,
    volleyball: 3,
    running: 20,
    cycling: 7,
    swimming: 2,
    gym: 10,
  });

  // Define all possible badges
  const allBadges = [
    // Basketball Badges
    { id: 'basketball_rookie', sport: 'basketball', name: 'Basketball Rookie', icon: '🏀', description: 'Play 1 basketball game', required: 1, color: '#F97316' },
    { id: 'basketball_player', sport: 'basketball', name: 'Basketball Player', icon: '🏀', description: 'Play 5 basketball games', required: 5, color: '#F97316' },
    { id: 'basketball_pro', sport: 'basketball', name: 'Basketball Pro', icon: '🏀', description: 'Play 10 basketball games', required: 10, color: '#F97316' },
    { id: 'basketball_legend', sport: 'basketball', name: 'Basketball Legend', icon: '🏆', description: 'Play 20 basketball games', required: 20, color: '#FFD700' },
    
    // Football Badges
    { id: 'football_rookie', sport: 'football', name: 'Football Rookie', icon: '⚽', description: 'Play 1 football game', required: 1, color: '#10B981' },
    { id: 'football_player', sport: 'football', name: 'Football Player', icon: '⚽', description: 'Play 5 football games', required: 5, color: '#10B981' },
    { id: 'football_pro', sport: 'football', name: 'Football Pro', icon: '⚽', description: 'Play 10 football games', required: 10, color: '#10B981' },
    { id: 'football_legend', sport: 'football', name: 'Football Legend', icon: '🏆', description: 'Play 20 football games', required: 20, color: '#FFD700' },
    
    // Tennis Badges
    { id: 'tennis_rookie', sport: 'tennis', name: 'Tennis Rookie', icon: '🎾', description: 'Play 1 tennis game', required: 1, color: '#EAB308' },
    { id: 'tennis_player', sport: 'tennis', name: 'Tennis Player', icon: '🎾', description: 'Play 5 tennis games', required: 5, color: '#EAB308' },
    { id: 'tennis_pro', sport: 'tennis', name: 'Tennis Pro', icon: '🎾', description: 'Play 10 tennis games', required: 10, color: '#EAB308' },
    
    // Running Badges
    { id: 'running_rookie', sport: 'running', name: 'Running Rookie', icon: '🏃‍♂️', description: 'Complete 1 run', required: 1, color: '#EF4444' },
    { id: 'running_player', sport: 'running', name: 'Running Enthusiast', icon: '🏃‍♂️', description: 'Complete 5 runs', required: 5, color: '#EF4444' },
    { id: 'running_pro', sport: 'running', name: 'Marathon Runner', icon: '🏃‍♂️', description: 'Complete 10 runs', required: 10, color: '#EF4444' },
    { id: 'running_legend', sport: 'running', name: 'Running Legend', icon: '🏆', description: 'Complete 20 runs', required: 20, color: '#FFD700' },
    
    // Volleyball Badges
    { id: 'volleyball_rookie', sport: 'volleyball', name: 'Volleyball Rookie', icon: '🏐', description: 'Play 1 volleyball game', required: 1, color: '#3B82F6' },
    { id: 'volleyball_player', sport: 'volleyball', name: 'Volleyball Player', icon: '🏐', description: 'Play 5 volleyball games', required: 5, color: '#3B82F6' },
    
    // Cycling Badges
    { id: 'cycling_rookie', sport: 'cycling', name: 'Cycling Rookie', icon: '🚴‍♂️', description: 'Complete 1 ride', required: 1, color: '#8B5CF6' },
    { id: 'cycling_player', sport: 'cycling', name: 'Cycling Enthusiast', icon: '🚴‍♂️', description: 'Complete 5 rides', required: 5, color: '#8B5CF6' },
    { id: 'cycling_pro', sport: 'cycling', name: 'Cycling Pro', icon: '🚴‍♂️', description: 'Complete 10 rides', required: 10, color: '#8B5CF6' },
    
    // Gym Badges
    { id: 'gym_rookie', sport: 'gym', name: 'Gym Rookie', icon: '💪', description: 'Complete 1 gym session', required: 1, color: '#6B7280' },
    { id: 'gym_player', sport: 'gym', name: 'Gym Regular', icon: '💪', description: 'Complete 5 gym sessions', required: 5, color: '#6B7280' },
    { id: 'gym_pro', sport: 'gym', name: 'Gym Pro', icon: '💪', description: 'Complete 10 gym sessions', required: 10, color: '#6B7280' },
    
    // Swimming Badges
    { id: 'swimming_rookie', sport: 'swimming', name: 'Swimming Rookie', icon: '🏊‍♂️', description: 'Complete 1 swim', required: 1, color: '#06B6D4' },
    { id: 'swimming_player', sport: 'swimming', name: 'Swimming Enthusiast', icon: '🏊‍♂️', description: 'Complete 5 swims', required: 5, color: '#06B6D4' },
    
    // Special Badges
    { id: 'all_rounder', sport: 'special', name: 'All-Rounder', icon: '⭐', description: 'Play 3 different sports', required: 3, color: '#FFD700' },
    { id: 'social_butterfly', sport: 'special', name: 'Social Butterfly', icon: '🦋', description: 'Join 10 events total', required: 10, color: '#EC4899' },
  ];

  // Calculate earned badges based on game stats
  const earnedBadges = allBadges.filter(badge => {
    if (badge.sport === 'special') {
      if (badge.id === 'all_rounder') {
        const sportsPlayed = Object.values(gameStats).filter(count => count > 0).length;
        return sportsPlayed >= badge.required;
      }
      if (badge.id === 'social_butterfly') {
        const totalGames = Object.values(gameStats).reduce((sum, count) => sum + count, 0);
        return totalGames >= badge.required;
      }
      return false;
    }
    const sportKey = badge.sport as keyof typeof gameStats;
    return gameStats[sportKey] >= badge.required;
  });

  // Fetch profile data
  const fetchProfileData = useCallback(async () => {
    if (!user?.id) {
      // Mock data for preview
      setProfile({
        id: 'mock-user',
        email: 'josh@sportmap.com',
        display_name: 'josh',
        favorite_sports: ['Basketball', 'Football'],
        created_at: '2025-01-01T00:00:00.000Z',
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      console.log('📥 Fetching profile for user:', user.id);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        throw profileError;
      }

      console.log('✅ Profile loaded:', {
        id: profileData.id,
        display_name: profileData.display_name,
        avatar_url: profileData.avatar_url || '(none)',
        avatar_url_length: profileData.avatar_url?.length || 0,
      });

      setProfile(profileData);

      // TODO: Fetch user's game statistics from backend
      // This would update the gameStats state

    } catch (error: any) {
      console.error('❌ Error fetching profile:', error);
      Alert.alert(t.common.error, t.profile.errorLoading);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Refetch profile data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('👤 ProfileScreen: Screen focused, refetching profile...');
      fetchProfileData();
    }, [fetchProfileData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

  const handleAddFriends = () => {
    // Navigate to Add Friend screen or show modal
    navigation.navigate(ROUTES.ADD_FRIEND);
  };

  const handleGroups = () => {
    // Navigate to Groups screen
    navigation.navigate(ROUTES.MY_GROUPS);
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserHandle = (name: string): string => {
    return `@${name.toLowerCase().replace(/\s+/g, '')}`;
  };

  const getJoinYear = (dateString: string): number => {
    return new Date(dateString).getFullYear();
  };

  const handlePhotoPress = () => {
    if (Platform.OS === 'ios') {
      // iOS Action Sheet
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (buttonIndex === 2) {
            handlePickImage();
          }
        }
      );
    } else {
      // Android Alert
      Alert.alert(
        'Change Profile Photo',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: handleTakePhoto },
          { text: 'Choose from Library', onPress: handlePickImage },
        ]
      );
    }
  };

  const handleTakePhoto = async () => {
    try {
      const photo = await takePhoto();
      if (photo) {
        await uploadAndUpdatePhoto(photo.uri);
      }
    } catch (error: any) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', error.message || 'Failed to take photo');
    }
  };

  const handlePickImage = async () => {
    try {
      const image = await pickImage();
      if (image) {
        await uploadAndUpdatePhoto(image.uri);
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const uploadAndUpdatePhoto = async (imageUri: string) => {
    try {
      setIsUploadingPhoto(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Upload new photo
      const newPhotoUrl = await uploadProfilePhoto(user.id, imageUri);

      // Delete old photo (optional, don't block on this)
      if (profile?.avatar_url) {
        deleteOldProfilePhoto(profile.avatar_url).catch(console.warn);
      }

      // Update database
      await supabaseService.updateProfilePhoto(user.id, newPhotoUrl);

      // Update local state
      setProfile({
        ...profile!,
        avatar_url: newPhotoUrl,
      });

      Alert.alert('Success', 'Profile photo updated!');

    } catch (error: any) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', error.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };;


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>{t.profile.loadingProfile}</Text>
        </View>
      </SafeAreaView>
    );
  }

    return (
      <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>{t.profile.title}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate(ROUTES.EDIT_PROFILE)}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#FFD700"
          />
        }
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Profile Photo */}
          <View style={styles.profilePhotoContainer}>
            <TouchableOpacity
              onPress={handlePhotoPress}
              activeOpacity={0.7}
              disabled={isUploadingPhoto}
            >
              <View style={styles.profilePhoto}>
                {isUploadingPhoto ? (
                  <View style={styles.uploadingContainer}>
                    <ActivityIndicator size="large" color="#FFD700" />
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  </View>
                ) : profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.profileImage} />
                ) : (
                  <Text style={styles.profileInitials}>
                    {getInitials(profile?.display_name || 'User')}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            
            {/* Camera Button */}
            {!isUploadingPhoto && (
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={handlePhotoPress}
                activeOpacity={0.7}
              >
                <Ionicons name="camera" size={20} color="#000000" />
              </TouchableOpacity>
            )}
          </View>

          {/* User Info */}
          <Text style={styles.userName}>{profile?.display_name || 'User'}</Text>
          <Text style={styles.userHandle}>{getUserHandle(profile?.display_name || 'user')}</Text>
          <Text style={styles.joinDate}>
            {t.profile.joined} {getJoinYear(profile?.created_at || new Date().toISOString())}
              </Text>
            </View>

        {/* Badge Stats Summary */}
        <View style={styles.badgeStatsContainer}>
          <View style={styles.badgeStat}>
            <Text style={styles.badgeStatNumber}>{earnedBadges.length}</Text>
            <Text style={styles.badgeStatLabel}>{t.profile.earned}</Text>
          </View>
          <View style={styles.badgeStatDivider} />
          <View style={styles.badgeStat}>
            <Text style={styles.badgeStatNumber}>{allBadges.length - earnedBadges.length}</Text>
            <Text style={styles.badgeStatLabel}>{t.profile.toUnlock}</Text>
          </View>
          <View style={styles.badgeStatDivider} />
          <View style={styles.badgeStat}>
            <Text style={styles.badgeStatNumber}>
              {Math.round((earnedBadges.length / allBadges.length) * 100)}%
            </Text>
            <Text style={styles.badgeStatLabel}>{t.profile.progress}</Text>
          </View>
        </View>
          
        {/* Achievements Section Header */}
        <View style={styles.achievementsHeader}>
          <Text style={styles.achievementsTitle}>{t.profile.achievements}</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate(ROUTES.ALL_BADGES)}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>{t.profile.viewAll}</Text>
            <Ionicons name="chevron-forward" size={18} color="#FFD700" />
          </TouchableOpacity>
        </View>

        {/* Earned Badges Carousel */}
        {earnedBadges.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.badgesCarousel}
            contentContainerStyle={styles.badgesCarouselContent}
          >
            {earnedBadges.map(badge => (
              <View key={badge.id} style={styles.carouselBadgeCard}>
                <View style={[
                  styles.carouselBadgeIcon,
                  { backgroundColor: badge.color + '20' }
                ]}>
                  <Text style={styles.carouselBadgeEmoji}>{badge.icon}</Text>
                  <View style={styles.carouselEarnedBadge}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                  </View>
                </View>
                <Text style={styles.carouselBadgeName} numberOfLines={2}>
                  {badge.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyBadges}>
            <Ionicons name="trophy-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyBadgesText}>{t.profile.noBadges}</Text>
            <Text style={styles.emptyBadgesSubtext}>{t.profile.noBadgesSubtext}</Text>
        </View>
        )}

        {/* Friends Section */}
        <View style={styles.friendsSection}>
          <View style={styles.friendsHeader}>
            <Text style={styles.friendsTitle}>{t.profile.friends}</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddFriends}
              activeOpacity={0.7}
            >
              <Ionicons name="person-add" size={18} color="#FFD700" />
              <Text style={styles.addButtonText}>{t.profile.addFriends}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.friendsPlaceholder}>
            <Ionicons name="people-outline" size={48} color="#CCCCCC" />
            <Text style={styles.friendsPlaceholderText}>{t.profile.noFriends}</Text>
            <Text style={styles.friendsPlaceholderSubtext}>
              {t.profile.noFriendsSubtext}
            </Text>
          </View>
        </View>

        {/* Groups Section */}
        <View style={styles.groupsSection}>
          <View style={styles.groupsHeader}>
            <Text style={styles.groupsTitle}>{t.profile.groups}</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleGroups}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={18} color="#FFD700" />
              <Text style={styles.addButtonText}>{t.profile.viewGroups}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.groupsPlaceholder}>
            <Ionicons name="people-circle-outline" size={48} color="#CCCCCC" />
            <Text style={styles.groupsPlaceholderText}>{t.profile.noGroups}</Text>
            <Text style={styles.groupsPlaceholderSubtext}>
              {t.profile.noGroupsSubtext}
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab="MyProfile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  logo: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  profileSection: {
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  profilePhotoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePhoto: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileInitials: {
    fontSize: 48,
    fontWeight: '700',
    color: '#666666',
  },
  uploadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadingText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
    marginTop: 8,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 14,
    color: '#999999',
  },
  // Badge Stats
  badgeStatsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  badgeStat: {
    flex: 1,
    alignItems: 'center',
  },
  badgeStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  badgeStatLabel: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  badgeStatDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 12,
  },
  // Achievements Section
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  achievementsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  // Badges Carousel
  badgesCarousel: {
    backgroundColor: '#F5F5F5',
  },
  badgesCarouselContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  carouselBadgeCard: {
    width: 120,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  carouselBadgeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  carouselBadgeEmoji: {
    fontSize: 40,
  },
  carouselEarnedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  carouselBadgeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 16,
  },
  // Empty Badges
  emptyBadges: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
  },
  emptyBadgesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyBadgesSubtext: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  friendsSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  friendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  friendsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF9E6',
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  friendsPlaceholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  friendsPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 12,
    marginBottom: 4,
  },
  friendsPlaceholderSubtext: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
  },
  groupsSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  groupsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  groupsPlaceholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  groupsPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginTop: 12,
    marginBottom: 4,
  },
  groupsPlaceholderSubtext: {
    fontSize: 13,
    color: '#999999',
    textAlign: 'center',
  },
});
