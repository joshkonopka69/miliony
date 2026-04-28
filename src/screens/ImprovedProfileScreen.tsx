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
  Alert,
  Image
} from 'react-native';
import { useAppNavigation } from '../navigation/hooks';
import { BottomNavBar } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { useToast } from '../components/ToastProvider';
import { useConfirmation } from '../components/ConfirmationModal';

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  favorite_sports: string[];
  created_at: string;
}

interface MyEvent {
  id: string;
  title: string;
  sport_type: string;
  scheduled_datetime: string;
  latitude: number;
  longitude: number;
  place_name?: string;
  min_participants: number;
  max_participants: number;
  currentParticipants: number;
}

// Sport emoji mapping
const SPORT_EMOJI_MAP: Record<string, string> = {
  basketball: '🏀',
  football: '⚽',
  soccer: '⚽',
  tennis: '🎾',
  running: 'walk-outline‍♂️',
  cycling: 'bicycle-outline‍♂️',
  swimming: 'water-outline‍♂️',
  gym: '💪',
  volleyball: '🏐',
  default: '🏆',
};

const getSportEmoji = (sportType: string): string => {
  return SPORT_EMOJI_MAP[sportType?.toLowerCase()] || SPORT_EMOJI_MAP.default;
};

const formatEventDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  if (isToday) {
    return `Today, ${timeStr}`;
  } else if (isTomorrow) {
    return `Tomorrow, ${timeStr}`;
  } else {
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    return `${dateStr}, ${timeStr}`;
  }
};

export default function ImprovedProfileScreen() {
  const navigation = useAppNavigation();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { showConfirmation } = useConfirmation();

  const [activeTab, setActiveTab] = useState<'Created' | 'Joined'>('Created');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [createdEvents, setCreatedEvents] = useState<MyEvent[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<MyEvent[]>([]);

  // Fetch profile data
  const fetchProfileData = useCallback(async () => {
    if (!user?.id) {
      // Mock data for preview
      setProfile({
        id: 'mock-user',
        email: 'josh@SportsMap.com',
        display_name: 'josh',
        favorite_sports: ['Basketball', 'Football'],
        created_at: '2025-01-01T00:00:00.000Z',
      });

      setCreatedEvents([
        {
          id: '1',
          title: 'Basketball Game',
          sport_type: 'basketball',
          scheduled_datetime: new Date(Date.now() + 3600000).toISOString(),
          latitude: 40.7829,
          longitude: -73.9654,
          place_name: 'Central Park',
          min_participants: 2,
          max_participants: 10,
          currentParticipants: 5,
        },
        {
          id: '2',
          title: 'Soccer Match',
          sport_type: 'football',
          scheduled_datetime: new Date(Date.now() + 86400000).toISOString(),
          latitude: 40.6602,
          longitude: -73.9690,
          place_name: 'Prospect Park',
          min_participants: 4,
          max_participants: 12,
          currentParticipants: 8,
        },
      ]);

      setJoinedEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - 24);

      // Fetch created events
      const { data: created, error: createdError } = await supabase
        .from('events')
        .select(`
          *,
          event_participants(id, user_id, status)
        `)
        .eq('creator_id', user.id)
        .in('status', ['live', 'active', 'upcoming'])
        .gte('scheduled_datetime', cutoff.toISOString())
        .order('scheduled_datetime', { ascending: true });

      if (createdError) throw createdError;

      const createdWithCounts = (created || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        sport_type: event.sport_type,
        scheduled_datetime: event.scheduled_datetime,
        latitude: event.latitude,
        longitude: event.longitude,
        place_name: event.place_name,
        min_participants: event.min_participants,
        max_participants: event.max_participants,
        currentParticipants: event.event_participants.filter((p: any) => p.status === 'joined').length,
      }));

      setCreatedEvents(createdWithCounts);

      // Fetch joined events
      const { data: participations, error: joinedError } = await supabase
        .from('event_participants')
        .select(`
          event_id,
          events!inner (
            *,
            event_participants(id, user_id, status)
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'joined')
        .gte('events.scheduled_datetime', cutoff.toISOString());

      if (joinedError) throw joinedError;

      const joinedWithCounts = (participations || [])
        .filter((p: any) => p.events && p.events.creator_id !== user.id)
        .map((p: any) => ({
          id: p.events.id,
          title: p.events.title,
          sport_type: p.events.sport_type,
          scheduled_datetime: p.events.scheduled_datetime,
          latitude: p.events.latitude,
          longitude: p.events.longitude,
          place_name: p.events.place_name,
          min_participants: p.events.min_participants,
          max_participants: p.events.max_participants,
          currentParticipants: p.events.event_participants.filter((ep: any) => ep.status === 'joined').length,
        }));

      setJoinedEvents(joinedWithCounts);

    } catch (error: any) {
      console.error('Error fetching profile:', error);
      showError('Failed to load profile data', 'Error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

  const handleBack = () => {
    navigation.goBack();
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

  const renderEventCard = (event: MyEvent) => (
    <TouchableOpacity key={event.id} style={styles.eventCard} activeOpacity={0.7}>
      {/* Sport Icon */}
      <View style={styles.eventIconContainer}>
        <Text style={{fontSize: 16, color: '#FFD700'}}>{getSportEmoji(event.sport_type)}</Text>
      </View>

      {/* Event Info */}
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDetails}>
          {event.place_name || 'Location'} • {formatEventDateTime(event.scheduled_datetime)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEvents = () => {
    const events = activeTab === 'Created' ? createdEvents : joinedEvents;

    if (events.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyTitle}>No events yet</Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'Created'
              ? 'Create your first event to get started!'
              : 'Join events to see them here'
            }
          </Text>
        </View>
      );
    }

    return events.map(renderEventCard);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={{fontSize: 22, color: '#000000'}}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Profile Photo */}
          <View style={styles.profilePhotoContainer}>
            <View style={styles.profilePhoto}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.profileImage} />
              ) : (
                <Text style={styles.profileInitials}>
                  {getInitials(profile?.display_name || 'User')}
                </Text>
              )}
            </View>

            {/* Camera Button */}
            <TouchableOpacity style={styles.cameraButton}>
              <Text style={{fontSize: 18, color: '#000000'}}>📷</Text>
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <Text style={styles.userName}>{profile?.display_name || 'User'}</Text>
          <Text style={styles.userHandle}>{getUserHandle(profile?.display_name || 'user')}</Text>
          <Text style={styles.joinDate}>
            Joined SportsMap in {getJoinYear(profile?.created_at || new Date().toISOString())}
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Created' && styles.tabActive]}
            onPress={() => setActiveTab('Created')}
          >
            <Text style={[styles.tabText, activeTab === 'Created' && styles.tabTextActive]}>
              Created
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'Joined' && styles.tabActive]}
            onPress={() => setActiveTab('Joined')}
          >
            <Text style={[styles.tabText, activeTab === 'Joined' && styles.tabTextActive]}>
              Joined
            </Text>
          </TouchableOpacity>
        </View>

        {/* Events List */}
        <View style={styles.eventsContainer}>
          {renderEvents()}
        </View>

        {/* Friends Section */}
        <View style={styles.friendsSection}>
          <Text style={styles.friendsTitle}>Friends</Text>
          <View style={styles.friendsPlaceholder}>
            <Text style={styles.friendsPlaceholderText}>No friends yet</Text>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  headerPlaceholder: {
    width: 40,
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  tabActive: {
    backgroundColor: '#FFD700',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  tabTextActive: {
    color: '#000000',
  },
  eventsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  eventIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventIcon: {
    fontSize: 28,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  eventDetails: {
    fontSize: 14,
    color: '#999999',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
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
    paddingHorizontal: 32,
  },
  friendsSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  friendsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
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
    fontSize: 14,
    color: '#999999',
  },
});








