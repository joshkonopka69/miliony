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
import { BottomNavBar, SMLogo } from '../components';
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
import { userService, UserGameStats } from '../services/userService';
import { groupService, Group } from '../services/groupService';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

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
  const route = useRoute<RouteProp<RootStackParamList, 'Profile'>>();
  const { user: currentUser } = useAuth();
  const targetUserId = route.params?.userId || currentUser?.id;
  const isOwnProfile = !route.params?.userId || route.params?.userId === currentUser?.id;
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // User's game statistics (now loaded from backend for real-time achievements)
  const [gameStats, setGameStats] = useState<UserGameStats>({
    basketball: 0,
    football: 0,
    tennis: 0,
    volleyball: 0,
    running: 0,
    cycling: 0,
    swimming: 0,
    gym: 0,
  });

  // Define all possible badges
  // Badge images mapping for local assets
  const badgeImages = {
    basketball: require('../../assets/badges/basketball.png'),
    football: require('../../assets/badges/football.png'),
    tennis: require('../../assets/badges/tennis.png'),
    running: require('../../assets/badges/running.png'),
    volleyball: require('../../assets/badges/volleyball.png'),
    cycling: require('../../assets/badges/cycling.png'),
    gym: require('../../assets/badges/gym.png'),
    swimming: require('../../assets/badges/swimming.png'),
    allrounder: require('../../assets/badges/allrounder.png'),
    community_star: require('../../assets/badges/community_star.png'),
  };

  const allBadges = [
    // Basketball Badges
    { id: 'basketball_rookie', sport: 'basketball', name: `${t.allBadges.basketball} ${t.allBadges.tiers.rookie}`, icon: '🏀', image: badgeImages.basketball, description: `Play 1 ${t.allBadges.basketball.toLowerCase()} game`, required: 1, color: '#F97316' },
    { id: 'basketball_player', sport: 'basketball', name: `${t.allBadges.basketball} ${t.allBadges.tiers.player}`, icon: '🏀', image: badgeImages.basketball, description: `Play 5 ${t.allBadges.basketball.toLowerCase()} games`, required: 5, color: '#F97316' },
    { id: 'basketball_pro', sport: 'basketball', name: `${t.allBadges.basketball} ${t.allBadges.tiers.pro}`, icon: '🏀', image: badgeImages.basketball, description: `Play 10 ${t.allBadges.basketball.toLowerCase()} games`, required: 10, color: '#F97316' },
    { id: 'basketball_legend', sport: 'basketball', name: `${t.allBadges.basketball} ${t.allBadges.tiers.legend}`, icon: '🏆', image: badgeImages.basketball, description: `Play 20 ${t.allBadges.basketball.toLowerCase()} games`, required: 20, color: '#FFD700' },

    // Football Badges
    { id: 'football_rookie', sport: 'football', name: `${t.allBadges.football} ${t.allBadges.tiers.rookie}`, icon: '⚽', image: badgeImages.football, description: `Play 1 ${t.allBadges.football.toLowerCase()} game`, required: 1, color: '#10B981' },
    { id: 'football_player', sport: 'football', name: `${t.allBadges.football} ${t.allBadges.tiers.player}`, icon: '⚽', image: badgeImages.football, description: `Play 5 ${t.allBadges.football.toLowerCase()} games`, required: 5, color: '#10B981' },
    { id: 'football_pro', sport: 'football', name: `${t.allBadges.football} ${t.allBadges.tiers.pro}`, icon: '⚽', image: badgeImages.football, description: `Play 10 ${t.allBadges.football.toLowerCase()} games`, required: 10, color: '#10B981' },
    { id: 'football_legend', sport: 'football', name: `${t.allBadges.football} ${t.allBadges.tiers.legend}`, icon: '🏆', image: badgeImages.football, description: `Play 20 ${t.allBadges.football.toLowerCase()} games`, required: 20, color: '#FFD700' },

    // Tennis Badges
    { id: 'tennis_rookie', sport: 'tennis', name: `${t.allBadges.tennis} ${t.allBadges.tiers.rookie}`, icon: '🎾', image: badgeImages.tennis, description: `Play 1 ${t.allBadges.tennis.toLowerCase()} game`, required: 1, color: '#FFD700' },
    { id: 'tennis_player', sport: 'tennis', name: `${t.allBadges.tennis} ${t.allBadges.tiers.player}`, icon: '🎾', image: badgeImages.tennis, description: `Play 5 ${t.allBadges.tennis.toLowerCase()} games`, required: 5, color: '#FFD700' },
    { id: 'tennis_pro', sport: 'tennis', name: `${t.allBadges.tennis} ${t.allBadges.tiers.pro}`, icon: '🎾', image: badgeImages.tennis, description: `Play 10 ${t.allBadges.tennis.toLowerCase()} games`, required: 10, color: '#FFD700' },

    // Running Badges
    { id: 'running_rookie', sport: 'running', name: `${t.allBadges.running} ${t.allBadges.tiers.rookie}`, icon: '🏃‍♂️', image: badgeImages.running, description: `Complete 1 ${t.allBadges.running.toLowerCase()}`, required: 1, color: '#EF4444' },
    { id: 'running_player', sport: 'running', name: `${t.allBadges.running} ${t.allBadges.tiers.enthusiast}`, icon: '🏃‍♂️', image: badgeImages.running, description: `Complete 5 ${t.allBadges.running.toLowerCase()}s`, required: 5, color: '#EF4444' },
    { id: 'running_pro', sport: 'running', name: t.allBadges.tiers.marathoner, icon: '🏃‍♂️', image: badgeImages.running, description: `Complete 10 ${t.allBadges.running.toLowerCase()}s`, required: 10, color: '#EF4444' },
    { id: 'running_legend', sport: 'running', name: `${t.allBadges.running} ${t.allBadges.tiers.legend}`, icon: '🏆', image: badgeImages.running, description: `Complete 20 ${t.allBadges.running.toLowerCase()}s`, required: 20, color: '#FFD700' },


    // Volleyball Badges
    { id: 'volleyball_rookie', sport: 'volleyball', name: `${t.allBadges.volleyball} ${t.allBadges.tiers.rookie}`, icon: '🏐', image: badgeImages.volleyball, description: `Play 1 ${t.allBadges.volleyball.toLowerCase()} game`, required: 1, color: '#3B82F6' },
    { id: 'volleyball_player', sport: 'volleyball', name: `${t.allBadges.volleyball} ${t.allBadges.tiers.player}`, icon: '🏐', image: badgeImages.volleyball, description: `Play 5 ${t.allBadges.volleyball.toLowerCase()} games`, required: 5, color: '#3B82F6' },

    // Cycling Badges
    { id: 'cycling_rookie', sport: 'cycling', name: `${t.allBadges.cycling} ${t.allBadges.tiers.rookie}`, icon: '🚴‍♂️', image: badgeImages.cycling, description: `Complete 1 ${t.allBadges.cycling.toLowerCase()}`, required: 1, color: '#8B5CF6' },
    { id: 'cycling_player', sport: 'cycling', name: `${t.allBadges.cycling} ${t.allBadges.tiers.enthusiast}`, icon: '🚴‍♂️', image: badgeImages.cycling, description: `Complete 5 ${t.allBadges.cycling.toLowerCase()}s`, required: 5, color: '#8B5CF6' },
    { id: 'cycling_pro', sport: 'cycling', name: `${t.allBadges.cycling} ${t.allBadges.tiers.pro}`, icon: '🚴‍♂️', image: badgeImages.cycling, description: `Complete 10 ${t.allBadges.cycling.toLowerCase()}s`, required: 10, color: '#8B5CF6' },

    // Gym Badges
    { id: 'gym_rookie', sport: 'gym', name: `${t.allBadges.gym} ${t.allBadges.tiers.rookie}`, icon: '💪', image: badgeImages.gym, description: `Complete 1 ${t.allBadges.gym.toLowerCase()} session`, required: 1, color: '#6B7280' },
    { id: 'gym_player', sport: 'gym', name: `${t.allBadges.gym} ${t.allBadges.tiers.regular}`, icon: '💪', image: badgeImages.gym, description: `Complete 5 ${t.allBadges.gym.toLowerCase()} sessions`, required: 5, color: '#6B7280' },
    { id: 'gym_pro', sport: 'gym', name: `${t.allBadges.gym} ${t.allBadges.tiers.pro}`, icon: '💪', image: badgeImages.gym, description: `Complete 10 ${t.allBadges.gym.toLowerCase()} sessions`, required: 10, color: '#6B7280' },

    // Swimming Badges
    { id: 'swimming_rookie', sport: 'swimming', name: `${t.allBadges.swimming} ${t.allBadges.tiers.rookie}`, icon: '🏊‍♂️', image: badgeImages.swimming, description: `Complete 1 ${t.allBadges.swimming.toLowerCase()} swim`, required: 1, color: '#06B6D4' },
    { id: 'swimming_player', sport: 'swimming', name: `${t.allBadges.swimming} ${t.allBadges.tiers.enthusiast}`, icon: '🏊‍♂️', image: badgeImages.swimming, description: `Complete 5 ${t.allBadges.swimming.toLowerCase()} swims`, required: 5, color: '#06B6D4' },

    // Special Badges
    { id: 'all_rounder', sport: 'special', name: t.allBadges.specialBadges.allRounderName, icon: '⭐', image: badgeImages.allrounder, description: t.allBadges.specialBadges.allRounderRequirement, required: 3, color: '#FFD700' },
    { id: 'social_butterfly', sport: 'special', name: t.allBadges.specialBadges.socialButterflyName, icon: '🤝', image: badgeImages.community_star, description: t.allBadges.specialBadges.socialButterflyRequirement, required: 10, color: '#EC4899' },
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
    if (!targetUserId) {
      if (!currentUser?.id) {
        // Mock data for preview if no user at all
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
      return;
    }

    try {
      setLoading(true);

      console.log('📥 Fetching profile for user:', targetUserId);

      // Fetch user profile
      // Force fresh data by adding timestamp to bypass cache
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
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

      // Add cache-busting timestamp to avatar URL if it exists
      const profileWithFreshAvatar = {
        ...profileData,
        avatar_url: profileData.avatar_url
          ? `${profileData.avatar_url}?t=${Date.now()}`
          : profileData.avatar_url
      };

      setProfile(profileWithFreshAvatar);

      // Fetch user's game statistics from backend for real-time achievements
      try {
        const stats = await userService.getUserGameStats(targetUserId);
        setGameStats(stats);
        console.log('✅ Game stats loaded for achievements:', stats);
      } catch (statsError) {
        console.error('❌ Error fetching game stats for achievements:', statsError);
      }

      // Fetch friends for the profile
      try {
        const friendsList = await supabaseService.getFriends(targetUserId);
        setFriends(friendsList);
        console.log(`✅ Loaded ${friendsList.length} friends for profile`);
      } catch (friendsError) {
        console.error('❌ Error fetching friends for profile:', friendsError);
      }

      // Fetch groups for the profile
      try {
        const groupsList = await groupService.getUserGroups(targetUserId);
        setGroups(groupsList);
        console.log(`✅ Loaded ${groupsList.length} groups for profile`);
      } catch (groupsError) {
        console.error('❌ Error fetching groups for profile:', groupsError);
      }

    } catch (error: any) {
      console.error('❌ Error fetching profile:', error);
      Alert.alert(t.common.error, t.profile.errorLoading);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, currentUser]);

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
        <SMLogo />
        <Text style={styles.headerTitle}>{isOwnProfile ? t.profile.title : profile?.display_name}</Text>
        {isOwnProfile && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate(ROUTES.EDIT_PROFILE)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={24} color="#000000" />
          </TouchableOpacity>
        )}
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
              onPress={isOwnProfile ? handlePhotoPress : undefined}
              activeOpacity={0.7}
              disabled={isUploadingPhoto || !isOwnProfile}
            >
              <View style={styles.profilePhoto}>
                {isUploadingPhoto ? (
                  <View style={styles.uploadingContainer}>
                    <ActivityIndicator size="large" color="#FFD700" />
                    <Text style={styles.uploadingText}>{t.profile.uploading}</Text>

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
            {isOwnProfile && !isUploadingPhoto && (
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
          <Text style={styles.userName}>{profile?.display_name || t.profile.userDefault}</Text>
          <Text style={styles.userHandle}>{getUserHandle(profile?.display_name || t.profile.userDefault.toLowerCase())}</Text>

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
                  { backgroundColor: '#F9FAFB' }
                ]}>
                  {badge.image ? (
                    <Image source={badge.image} style={styles.carouselBadgeImage} />
                  ) : (
                    <Text style={styles.carouselBadgeEmoji}>{badge.icon}</Text>
                  )}

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
            {isOwnProfile && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddFriends}
                activeOpacity={0.7}
              >
                <Ionicons name="person-add" size={18} color="#FFD700" />
                <Text style={styles.addButtonText}>{t.profile.addFriends}</Text>
              </TouchableOpacity>
            )}

          </View>

          {friends.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.friendsCarousel}
              contentContainerStyle={styles.friendsCarouselContent}
            >
              {friends.map(friend => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendCard}
                  onPress={() => navigation.push('Profile', { userId: friend.id })}
                >
                  <View style={styles.friendAvatar}>
                    {friend.avatar_url ? (
                      <Image source={{ uri: friend.avatar_url }} style={styles.friendImage} />
                    ) : (
                      <Text style={styles.friendInitials}>{getInitials(friend.display_name)}</Text>
                    )}
                  </View>
                  <Text style={styles.friendName} numberOfLines={1}>{friend.display_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.friendsPlaceholder}>
              <Ionicons name="people-outline" size={48} color="#CCCCCC" />
              <Text style={styles.friendsPlaceholderText}>{t.profile.noFriends}</Text>
              <Text style={styles.friendsPlaceholderSubtext}>
                {isOwnProfile ? t.profile.noFriendsSubtext : t.profile.noFriendsOther.replace('{name}', profile?.display_name || t.profile.userDefault)}
              </Text>

            </View>
          )}
        </View>

        {/* Groups Section */}
        <View style={styles.groupsSection}>
          <View style={styles.groupsHeader}>
            <Text style={styles.groupsTitle}>{t.profile.groups}</Text>
            {isOwnProfile && (
              <TouchableOpacity
                style={styles.viewGroupsButton}
                onPress={() => navigation.navigate(ROUTES.MY_GROUPS)}
                activeOpacity={0.7}
              >
                <Text style={styles.viewGroupsText}>{t.profile.viewGroups}</Text>
                <Ionicons name="chevron-forward" size={16} color="#FFD700" />
              </TouchableOpacity>
            )}
          </View>


          {groups.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.groupsCarousel}
              contentContainerStyle={styles.groupsCarouselContent}
            >
              {groups.map(group => (
                <TouchableOpacity
                  key={group.id}
                  style={styles.groupCard}
                  onPress={() => navigation.navigate(ROUTES.GROUP_DETAILS, { id: group.id })}
                >
                  <View style={styles.groupAvatar}>
                    {group.avatar_url ? (
                      <Image source={{ uri: group.avatar_url }} style={styles.groupImage} />
                    ) : (
                      <Ionicons name="people" size={30} color="#CCCCCC" />
                    )}
                  </View>
                  <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.groupsPlaceholder}>
              <Ionicons name="people-circle-outline" size={48} color="#CCCCCC" />
              <Text style={styles.groupsPlaceholderText}>{t.profile.noGroups}</Text>
              <Text style={styles.groupsPlaceholderSubtext}>
                {isOwnProfile ? t.profile.noGroupsSubtext : t.profile.noGroupsOther.replace('{name}', profile?.display_name || t.profile.userDefault)}
              </Text>

            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab="MyProfile" />
    </SafeAreaView >
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
  carouselBadgeImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
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
  // Friends Carousel
  friendsCarousel: {
    marginBottom: 20,
  },
  friendsCarouselContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  friendCard: {
    width: 80,
    alignItems: 'center',
    marginRight: 12,
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  friendImage: {
    width: '100%',
    height: '100%',
  },
  friendInitials: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666666',
  },
  friendName: {
    fontSize: 12,
    color: '#333333',
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
  viewGroupsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewGroupsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  groupsCarousel: {
    marginBottom: 20,
  },
  groupsCarouselContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  groupCard: {
    width: 100,
    alignItems: 'center',
    marginRight: 12,
  },
  groupAvatar: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  groupImage: {
    width: '100%',
    height: '100%',
  },
  groupName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
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
