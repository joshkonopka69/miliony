import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../navigation/hooks';
import { ROUTES } from '../navigation/types';
import { BottomNavBar } from '../components';
import { EmptyState, SectionHeader, EventCard } from '../components';
import { MyEvent, SportActivity } from '../types/event';
import { groupEventsByTime } from '../utils/eventGrouping';
import { supabase, supabaseService } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

// Logo Component (matches MapScreen)
const SportMapLogo = () => (
  <View style={styles.logoContainer}>
    <View style={styles.logoCircle}>
      <Text style={styles.logoText}>SM</Text>
    </View>
    <Text style={styles.logoTitle}>SportMap</Text>
  </View>
);

export default function MyGroupsScreen() {
  const navigation = useAppNavigation();
  const { getUserId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<SportActivity | 'all'>('all');

  // Load events on mount and set up real-time subscription
  useEffect(() => {
    console.log('🚀 MyGamesScreen: Component mounted, loading events...');
    loadEvents();

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

    // Cleanup subscription on unmount
    return () => {
      eventsSubscription.unsubscribe();
    };
  }, []);

  const loadEvents = async () => {
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
        activity: capitalizeFirstLetter(event.activity),
        startTime: new Date(event.scheduled_datetime),
        endTime: new Date(new Date(event.scheduled_datetime).getTime() + 2 * 60 * 60 * 1000), // +2 hours default
        location: {
          name: event.location_name,
          address: event.location_name, // Use location name as address for now
          distance: 0, // TODO: Calculate distance if user location available
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
          name: event.creator?.display_name || 'Unknown',
        },
      }));

      console.log('📊 Transformed events:', transformedEvents);
      setEvents(transformedEvents);

    } catch (error) {
      console.error('❌ Error loading events:', error);
      Alert.alert('Error', 'Failed to load events');
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
    Alert.alert(
      'Leave Event',
      `Are you sure you want to leave "${event.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            // TODO: Call API to leave event
            setEvents(prev => prev.filter(e => e.id !== event.id));
            Alert.alert('Success', 'You have left the event');
          },
        },
      ]
    );
  };

  const handleFilterPress = () => {
    // TODO: Show filter modal
    Alert.alert('Filters', 'Filter modal coming soon');
  };

  const handleMorePress = () => {
    // TODO: Show more options (Sort, Past Events, etc.)
    Alert.alert('More Options', 'Sort, Past Events, Settings');
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

  // Render content based on state
  const renderContent = () => {
    console.log('🎨 Rendering content, state:', { loading, eventsCount: events.length, filteredCount: filteredEvents.length });
    
    if (loading && events.length === 0) {
      console.log('   → Showing loading state');
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading your events...</Text>
        </View>
      );
    }

    if (events.length === 0) {
      console.log('   → Showing empty state (no events)');
      return (
        <View style={styles.centerContainer}>
          <EmptyState
            icon="calendar-outline"
            title="No Events Joined Yet"
            message="Find exciting events on the map and join to see them here"
            actionLabel="Browse Events"
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
            title="No Events Found"
            message={`No ${selectedFilter} events in your list`}
            actionLabel="Clear Filter"
            onAction={() => setSelectedFilter('all')}
          />
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FDB924"
          />
        }
      >
        {groupedEvents.map(({ group, events: groupEvents }) => (
          <View key={group}>
            <SectionHeader title={group} count={groupEvents.length} />
            {groupEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event)}
                onChatPress={() => handleChatPress(event)}
                onLeavePress={() => handleLeaveEvent(event)}
              />
            ))}
          </View>
        ))}
        
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar (matches MapScreen) */}
      <SafeAreaView style={styles.topBarSafeArea}>
        <View style={styles.topBar}>
          {/* Logo on Left */}
          <SportMapLogo />

          {/* Action Buttons on Right */}
          <View style={styles.topBarActions}>
            <TouchableOpacity
              style={styles.topBarButton}
              onPress={handleFilterPress}
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={24} color="#000000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.topBarButton}
              onPress={handleMorePress}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
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
    height: 70,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FDB924',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FDB924',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.3,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
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
