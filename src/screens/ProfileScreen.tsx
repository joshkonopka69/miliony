import React, { useState, useEffect, useCallback } from 'react';
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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppNavigation } from '../navigation/hooks';
import { 
  BottomNavBar, 
  StatisticsCard, 
  FavoriteSports, 
  EventCard,
  EmptyState,
  ErrorState 
} from '../components';
import ProfileEditModal from '../components/ProfileEditModal';
import { theme } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import type { MyEvent, SportActivity } from '../types/event';
import { groupEventsByTime, formatEventTime } from '../utils/eventGrouping';

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  favorite_sports: SportActivity[];
  created_at: string;
  bio?: string;
  phone?: string;
  location?: string;
}

interface ProfileStats {
  eventsCreated: number;
  eventsJoined: number;
  friendsCount: number;
}

// SportMap Logo Component
const SportMapLogo = ({ size = 30 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={[styles.logoBackground, { borderRadius: size * 0.2 }]}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

export default function ProfileScreen() {
  const navigation = useAppNavigation();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'Created' | 'Joined'>('Joined');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    eventsCreated: 0,
    eventsJoined: 0,
    friendsCount: 0,
  });
  const [createdEvents, setCreatedEvents] = useState<MyEvent[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<MyEvent[]>([]);

  // Fetch profile data
  const fetchProfileData = useCallback(async () => {
    // If no user, use MOCK DATA for preview
    if (!user?.id) {
      console.log('🎨 NO USER - Using MOCK DATA for preview');
      
      // Set mock profile
      setProfile({
        id: 'mock-user-123',
        email: 'demo@sportmap.com',
        display_name: 'Ethan Carter',
        avatar_url: undefined,
        favorite_sports: ['Football', 'Basketball', 'Tennis'],
        created_at: new Date().toISOString(),
        bio: 'Sports enthusiast who loves playing basketball and meeting new people! Always up for a game!',
        phone: '+1 234 567 8900',
        location: 'New York, USA',
      });

      // Set mock stats
      setStats({
        eventsCreated: 5,
        eventsJoined: 12,
        friendsCount: 23,
      });

      // Set mock created events
      const mockCreated: MyEvent[] = [
        {
          id: 'event-1',
          name: 'Basketball Game',
          activity: 'Basketball',
          description: 'Friendly pickup game at the park',
          startTime: new Date(Date.now() + 3600000), // 1 hour from now
          endTime: new Date(Date.now() + 7200000), // 2 hours from now
          location: {
            name: 'Central Park Basketball Court',
            address: '123 Park Ave',
            distance: 2.3,
            lat: 40.7829,
            lng: -73.9654,
          },
          participants: { current: 7, max: 10 },
          status: 'upcoming',
          role: 'created',
          chatEnabled: true,
          createdBy: {
            id: 'mock-user-123',
            name: 'Ethan Carter',
          },
        },
        {
          id: 'event-2',
          name: 'Soccer Match',
          activity: 'Football',
          description: '5v5 soccer game',
          startTime: new Date(Date.now() + 86400000), // Tomorrow
          endTime: new Date(Date.now() + 90000000),
          location: {
            name: 'Prospect Park Soccer Field',
            address: '456 Park Blvd',
            distance: 3.1,
            lat: 40.6602,
            lng: -73.9690,
          },
          participants: { current: 4, max: 10 },
          status: 'upcoming',
          role: 'created',
          chatEnabled: true,
          createdBy: {
            id: 'mock-user-123',
            name: 'Ethan Carter',
          },
        },
      ];

      // Set mock joined events
      const mockJoined: MyEvent[] = [
        {
          id: 'event-3',
          name: 'Tennis Practice',
          activity: 'Tennis',
          description: 'Doubles practice session',
          startTime: new Date(Date.now() + 7200000), // 2 hours from now
          endTime: new Date(Date.now() + 10800000),
          location: {
            name: 'City Tennis Club',
            address: '789 Tennis Rd',
            distance: 1.5,
            lat: 40.7580,
            lng: -73.9855,
          },
          participants: { current: 3, max: 4 },
          status: 'upcoming',
          role: 'joined',
          chatEnabled: true,
          createdBy: {
            id: 'other-user-456',
            name: 'John Smith',
          },
        },
        {
          id: 'event-4',
          name: 'Morning Run',
          activity: 'Running',
          description: '5K run through the park',
          startTime: new Date(Date.now() + 172800000), // 2 days from now
          endTime: new Date(Date.now() + 176400000),
          location: {
            name: 'Riverside Park',
            address: '321 River St',
            distance: 4.2,
            lat: 40.7956,
            lng: -73.9720,
          },
          participants: { current: 15, max: 20 },
          status: 'upcoming',
          role: 'joined',
          chatEnabled: true,
          createdBy: {
            id: 'other-user-789',
            name: 'Sarah Johnson',
          },
        },
      ];

      setCreatedEvents(mockCreated);
      setJoinedEvents(mockJoined);
      setLoading(false);
      return;
    }

    try {
      setError(null);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // Handle case where profile doesn't exist yet
      if (profileError && profileError.code === 'PGRST116') {
        console.log('User profile not found, creating placeholder...');
        // Set a placeholder profile
        setProfile({
          id: user.id,
          email: user.email || 'No email',
          display_name: user.email?.split('@')[0] || 'User',
          avatar_url: undefined,
          favorite_sports: [],
          created_at: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      if (profileError) throw profileError;
      
      setProfile(profileData as UserProfile);

      // Fetch created events
      const { data: created, error: createdError } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user.id)
        .order('start_time', { ascending: true });

      if (createdError) throw createdError;

      // Fetch joined events
      const { data: joined, error: joinedError } = await supabase
        .from('event_participants')
        .select(`
          event_id,
          events (*)
        `)
        .eq('user_id', user.id);

      if (joinedError) throw joinedError;

      // Transform data to MyEvent format
      const createdEventsFormatted: MyEvent[] = (created || []).map((event: any) => ({
        id: event.id,
        name: event.name,
        activity: event.activity as SportActivity,
        description: event.description,
        startTime: new Date(event.start_time),
        endTime: new Date(event.end_time || event.start_time),
        location: {
          name: event.location_name || 'Unknown',
          address: event.location_address || '',
          distance: 0,
          lat: event.latitude || 0,
          lng: event.longitude || 0,
        },
        participants: {
          current: event.participants_count || 0,
          max: event.max_participants || 10,
        },
        status: event.status || 'upcoming',
        role: 'created',
        chatEnabled: true,
        createdBy: {
          id: user.id,
          name: profileData?.display_name || 'You',
          avatarUrl: profileData?.avatar_url,
        },
      }));

      const joinedEventsFormatted: MyEvent[] = (joined || [])
        .filter((item: any) => item.events)
        .map((item: any) => {
          const event = item.events;
          return {
            id: event.id,
            name: event.name,
            activity: event.activity as SportActivity,
            description: event.description,
            startTime: new Date(event.start_time),
            endTime: new Date(event.end_time || event.start_time),
            location: {
              name: event.location_name || 'Unknown',
              address: event.location_address || '',
              distance: 0,
              lat: event.latitude || 0,
              lng: event.longitude || 0,
            },
            participants: {
              current: event.participants_count || 0,
              max: event.max_participants || 10,
            },
            status: event.status || 'upcoming',
            role: 'joined',
            chatEnabled: true,
            createdBy: {
              id: event.created_by,
              name: 'Event Creator',
            },
          };
        });

      setCreatedEvents(createdEventsFormatted);
      setJoinedEvents(joinedEventsFormatted);

      // Calculate stats
      const friendsCount = profileData?.friends?.length || 0;
      setStats({
        eventsCreated: createdEventsFormatted.length,
        eventsJoined: joinedEventsFormatted.length,
        friendsCount,
      });

    } catch (err: any) {
      console.error('Error fetching profile data:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfileData();
  }, [fetchProfileData]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEditProfile = () => {
    if (!profile) return;
    
    // If using mock data, show alert
    if (!user?.id) {
      Alert.alert(
        '🎨 Preview Mode',
        'This is mock data for preview only. Log in to edit your real profile!',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setEditModalVisible(true);
  };

  const handleProfileSaved = () => {
    fetchProfileData(); // Refresh profile data
  };

  const handleEventPress = (event: MyEvent) => {
    // Navigate to event details
    console.log('Event pressed:', event.id);
    // navigation.navigate('EventDetails', { eventId: event.id });
  };

  const handleChatPress = (event: MyEvent) => {
    console.log('Chat pressed:', event.id);
    // navigation.navigate('GameChat', { eventId: event.id });
  };

  const handleLeaveEvent = async (event: MyEvent) => {
    Alert.alert(
      'Leave Event',
      `Are you sure you want to leave "${event.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('event_participants')
                .delete()
                .eq('event_id', event.id)
                .eq('user_id', user?.id);

              if (error) throw error;

              Alert.alert('Success', 'You left the event');
              fetchProfileData(); // Refresh
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderEvents = () => {
    const events = activeTab === 'Created' ? createdEvents : joinedEvents;

    if (events.length === 0) {
      return (
        <EmptyState
          icon={activeTab === 'Created' ? 'add-circle-outline' : 'calendar-outline'}
          title={`No Events ${activeTab}`}
          message={
            activeTab === 'Created'
              ? 'Create your first event and invite others to join!'
              : 'Join events from the map to see them here.'
          }
          actionLabel={activeTab === 'Created' ? 'Create Event' : 'Browse Events'}
          onAction={() => navigation.navigate('Map')}
        />
      );
    }

    return events.map((event) => (
      <EventCard
        key={event.id}
        event={event}
        onPress={() => handleEventPress(event)}
        onChatPress={() => handleChatPress(event)}
        onLeavePress={() => handleLeaveEvent(event)}
      />
    ));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
        <ErrorState
          message={error}
          onRetry={fetchProfileData}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <SportMapLogo size={30} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Preview Mode Banner */}
        {!user?.id && (
          <View style={styles.previewBanner}>
            <Ionicons name="eye-outline" size={24} color={theme.colors.primary} />
            <View style={styles.previewBannerContent}>
              <Text style={styles.previewBannerTitle}>🎨 Preview Mode</Text>
              <Text style={styles.previewBannerText}>
                You're viewing mock data. Log in to see your real profile!
              </Text>
            </View>
          </View>
        )}

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {/* Gradient Border */}
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.accent, theme.colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBorder}
            >
              <View style={styles.profileImage}>
                <Text style={styles.profileImageText}>
                  {getInitials(profile?.display_name || 'User')}
                </Text>
              </View>
            </LinearGradient>
            
            {/* Camera Button */}
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera-outline" size={20} color={theme.colors.textOnPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.display_name || 'User'}</Text>
            <Text style={styles.profileEmail}>{profile?.email}</Text>
            
            {profile?.bio && (
              <View style={styles.bioContainer}>
                <Text style={styles.bioText}>{profile.bio}</Text>
              </View>
            )}
            
            {profile?.location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.locationText}>{profile.location}</Text>
              </View>
            )}
            
            <Text style={styles.profileJoinDate}>
              Joined {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <StatisticsCard
            icon="create-outline"
            label="Created"
            value={stats.eventsCreated}
            color={theme.colors.primary}
          />
          <StatisticsCard
            icon="calendar-outline"
            label="Joined"
            value={stats.eventsJoined}
            color={theme.colors.success}
          />
          <StatisticsCard
            icon="people-outline"
            label="Friends"
            value={stats.friendsCount}
            color={theme.colors.accent}
          />
        </View>

        {/* Profile Incomplete Warning */}
        {profile && (!profile.favorite_sports || profile.favorite_sports.length === 0) && (
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={24} color={theme.colors.accent} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Complete Your Profile</Text>
              <Text style={styles.infoText}>
                Add your favorite sports and other details to get better event recommendations!
              </Text>
            </View>
          </View>
        )}

        {/* Favorite Sports */}
        {profile?.favorite_sports && profile.favorite_sports.length > 0 && (
          <FavoriteSports sports={profile.favorite_sports} />
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Created' && styles.activeTab]}
            onPress={() => setActiveTab('Created')}
          >
            <Text style={[styles.tabText, activeTab === 'Created' && styles.activeTabText]}>
              Created
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Joined' && styles.activeTab]}
            onPress={() => setActiveTab('Joined')}
          >
            <Text style={[styles.tabText, activeTab === 'Joined' && styles.activeTabText]}>
              Joined
            </Text>
          </TouchableOpacity>
        </View>

        {/* Events List */}
        <View style={styles.eventsSection}>
          {renderEvents()}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab="MyProfile" />

      {/* Edit Profile Modal */}
      {profile && (
        <ProfileEditModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          profile={profile}
          onSave={handleProfileSaved}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  logoText: {
    fontWeight: theme.typography.fontWeight.extrabold,
    color: '#000000',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  profileSection: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  gradientBorder: {
    width: 136,
    height: 136,
    borderRadius: 68,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 48,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
    borderWidth: 3,
    borderColor: theme.colors.surface,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  profileJoinDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  bioContainer: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    maxWidth: '90%',
  },
  bioText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  locationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.textOnPrimary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  eventsSection: {
    paddingVertical: theme.spacing.sm,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.accent + '15',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.accent,
    marginBottom: theme.spacing.xs,
  },
  infoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  previewBanner: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary + '15',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  previewBannerContent: {
    flex: 1,
  },
  previewBannerTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  previewBannerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});
