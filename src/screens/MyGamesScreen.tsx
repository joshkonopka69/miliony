import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAppNavigation } from '../navigation/hooks';
import { ROUTES } from '../navigation/types';
import { BottomNavBar } from '../components';
import { EmptyState, SectionHeader, EventCard, SMLogo } from '../components';
import { MyEvent, SportActivity, EventGroup } from '../types/event';
import { groupEventsByTime } from '../utils/eventGrouping';
import { supabase, supabaseService } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { useToast } from '../components/ToastProvider';
import { useConfirmation } from '../components/ConfirmationModal';

// Header Logo Component
const HeaderLogo = () => (
  <View style={styles.logoContainer}>
    <SMLogo />
    <Image
      source={require('../../assets/logo/sportsmap-text-logo.png')}
      style={styles.logoText}
      resizeMode="contain"
    />
  </View>
);

export default function MyGamesScreen() {
  const navigation = useAppNavigation();
  const { getUserId } = useAuth();
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const { showConfirmation } = useConfirmation();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<SportActivity | 'all'>('all');
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  // Load events on mount and set up real-time subscription
  useEffect(() => {
    console.log('🚀 MyGamesScreen: Component mounted, loading events...');
    requestLocationAndLoad();

    // Subscribe to real-time changes for events and participants
    const eventsSubscription = supabase
      .channel('my-events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        (payload) => {
          console.log('📡 Event change detected:', payload);
          loadEvents(); // Reload events when any event changes
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_participants',
        },
        (payload) => {
          console.log('📡 Participant change detected:', payload);
          loadEvents(); // Reload events when participants change
        }
      )
      .subscribe();

    return () => {
      eventsSubscription.unsubscribe();
    };
  }, []);

  const requestLocationAndLoad = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        await loadEvents(location);
      } else {
        await loadEvents(null);
      }
    } catch (error) {
      console.warn('Error getting location:', error);
      await loadEvents(null);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const loadEvents = async (location: Location.LocationObject | null = userLocation) => {
    try {
      setLoading(true);

      // Get current user ID
      const userId = getUserId();
      if (!userId) {
        console.log('⚠️ No user logged in');
        setEvents([]);
        return;
      }

      console.log('\n📱 Loading events for MyGamesScreen...');

      // Fetch user's events from Supabase
      const userEvents = await supabaseService.getUserEvents(userId);

      console.log(`✅ Loaded ${userEvents.length} events`);

      // Transform Supabase events to MyEvent format
      const transformedEvents: MyEvent[] = userEvents.map((event: any) => ({
        id: event.id,
        name: event.name,
        activity: capitalizeFirstLetter(event.activity) as SportActivity,
        startTime: new Date(event.scheduled_datetime),
        endTime: new Date(new Date(event.scheduled_datetime).getTime() + 2 * 60 * 60 * 1000), // +2 hours default
        location: {
          name: event.location_name,
          address: event.location_name,
          distance: location ? calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            event.latitude,
            event.longitude
          ) : 0,
          lat: event.latitude,
          lng: event.longitude,
        },
        participants: {
          current: event.participants_count || event.currentParticipants || 0,
          max: event.max_participants,
        },
        status: 'upcoming',
        role: event.isCreator ? 'created' : 'joined',
        chatEnabled: true,
        createdBy: {
          id: event.creator?.id || event.created_by,
          name: event.creator?.display_name || (event as any).creator_name || 'Organizer',
          avatar_url: event.creator?.avatar_url || (event as any).creator_avatar,
        },
        description: event.description,
        requiresApproval: !!event.requires_approval,
        placeId: event.place_id || null,
      }));

      console.log('📊 Transformed events:', transformedEvents);
      setEvents(transformedEvents);

    } catch (error) {
      console.error('❌ Error loading events:', error);
      showError(t.myEvents.errorLoading, t.common.error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const handleEventPress = (event: MyEvent) => {
    // Navigate to event details
    navigation.navigate(ROUTES.EVENT_DETAILS, { game: event });
  };

  const handleChatPress = (event: MyEvent) => {
    // Navigate to event chat
    navigation.navigate(ROUTES.GAME_CHAT, { game: event });
  };

  const handleLeaveEvent = (event: MyEvent) => {
    showConfirmation({
      title: t.myEvents.leaveEventTitle,
      message: t.myEvents.leaveEventMessage.replace('{name}', event.name),
      icon: '🏃‍♂️',
      buttons: [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.myEvents.leaveEventConfirm || 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = getUserId();
              if (!userId) return;

              const success = await supabaseService.leaveEvent(event.id, userId);
              if (success) {
                setEvents(prev => prev.filter(e => e.id !== event.id));
                showSuccess(t.myEvents.leaveEventSuccess, t.common.success);
              } else {
                showError("Failed to leave event", t.common.error);
              }
            } catch (error) {
              console.error('Error leaving event:', error);
              showError("An unexpected error occurred", t.common.error);
            }
          },
        },
      ]
    });
  };

  const handleFilterPress = () => {
    // TODO: Implement filter modal
    console.log('Filter pressed');
  };

  const handleMorePress = () => {
    // TODO: Implement more options
    console.log('More options pressed');
  };

  const handleBrowseEvents = () => {
    navigation.navigate(ROUTES.MAP);
  };

  // Filter events
  const filteredEvents = selectedFilter === 'all'
    ? events
    : events.filter(e => e.activity === selectedFilter);

  // Group events by time
  const groupedEvents = groupEventsByTime(filteredEvents);
  const groupLabels: Record<EventGroup, string> = {
    TODAY: t.myEvents.groupLabels.TODAY,
    TOMORROW: t.myEvents.groupLabels.TOMORROW,
    THIS_WEEK: t.myEvents.groupLabels.THIS_WEEK,
    NEXT_WEEK: t.myEvents.groupLabels.NEXT_WEEK,
    LATER: t.myEvents.groupLabels.LATER,
  };

  // Render content based on state
  const renderContent = () => {
    console.log('🎨 Rendering content, state:', { loading, eventsCount: events.length, filteredCount: filteredEvents.length });

    if (loading && events.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Loading your games...</Text>
        </View>
      );
    }

    if (events.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <EmptyState
            icon="calendar-outline"
            title={t.myEvents.noEvents}
            message={t.myEvents.noEventsSubtext}
            actionLabel={t.myEvents.createEvent}
            onAction={handleBrowseEvents}
          />
        </View>
      );
    }

    if (filteredEvents.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <EmptyState
            icon="search-outline"
            title={t.myEvents.noEvents}
            message={t.myEvents.noEventsSubtext}
            actionLabel={t.common.confirm}
            onAction={() => setSelectedFilter('all')}
          />
        </View>
      );
    }

    // Group events by time
    const groupedEvents = groupEventsByTime(filteredEvents);

    // Map keys to translations
    const getGroupTitle = (group: EventGroup): string => {
      // Use type assertion or optional chaining to avoid strict typing issues with specific keys vs dynamic access
      const labels = t.myEvents.groupLabels as any;
      return labels?.[group] || group;
    };

    const hasEvents = groupedEvents.some(g => g.events.length > 0);

    if (!hasEvents) {
      return (
        <View style={styles.centerContainer}>
          <EmptyState
            icon="calendar-outline"
            title={t.myEvents.noEvents}
            message={t.myEvents.noEventsSubtext}
            actionLabel={t.myEvents.createEvent}
            onAction={handleBrowseEvents}
          />
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FFD700" />
        }
      >
        {groupedEvents.map((groupData) => (
          groupData.events.length > 0 && (
            <View key={groupData.group}>
              <SectionHeader
                title={getGroupTitle(groupData.group)}
                count={groupData.events.length}
              />
              {groupData.events.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={() => handleEventPress(event)}
                  onChatPress={() => handleChatPress(event)}
                  onLeavePress={() => handleLeaveEvent(event)}
                />
              ))}
            </View>
          )
        ))}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Shadow */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView edges={['top']} style={styles.topBarSafeArea}>
        <View style={styles.topBar}>
          <HeaderLogo />
          <View style={styles.placeholder} />
        </View>
      </SafeAreaView>

      {/* Main Content */}
      {renderContent()}

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <BottomNavBar
          activeTab="MyGames"
          onProfilePress={() => navigation.navigate(ROUTES.PROFILE)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  // Top Bar Styles (match MapScreen)
  topBarSafeArea: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 5,
  },
  topBar: {
    height: 100, // Matched MapScreen height
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2, // Minimal padding to maximize width
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 0,
    marginRight: 0,
  },
  logoIcon: {
    width: 70, // Slightly bigger icon matching MapScreen
    height: 70,
    zIndex: 10,
  },
  logoText: {
    width: 320, // Matching MapScreen
    height: 100, // Matching MapScreen
    transform: [{ translateX: -85 }], // Massive left shift matching MapScreen
    zIndex: 1,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  // Content Styles
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  bottomSpacing: {
    height: 100, // Space for bottom nav
  },
  // Bottom Nav Container
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
