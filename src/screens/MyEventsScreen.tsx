import React, { useState, useEffect, useCallback } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { ROUTES } from '../navigation/types';
import { BottomNavBar } from '../components';
import { useTranslation } from '../contexts/TranslationContext';
import { EmptyState, SectionHeader, EventCard, EventCardSkeleton, NoJoinedEventsEmptyState, ErrorBoundary } from '../components';
import { MyEvent, SportActivity } from '../types/event';
import { groupEventsByTime } from '../utils/eventGrouping';

// Theme Constants
const ICON_SIZE = 24;
const ICON_COLOR = '#000000';

// Logo Component (matches MapScreen)
const SportMapLogo = () => (
  <View style={styles.logoContainer}>
    <View style={styles.logoCircle}>
      <Text style={styles.logoText}>SM</Text>
    </View>
    <Text style={styles.logoTitle}>SportMap</Text>
  </View>
);

export default function MyEventsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<SportActivity | 'all'>('all');

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Real-time event updates
  useEffect(() => {
    if (__DEV__) {
      console.log('🔔 MyEventsScreen: Setting up real-time subscriptions...');
    }

    const setupSubscriptions = async () => {
      const { supabase } = await import('../services/supabase');
      
      // Subscribe to event changes
      const eventChannel = supabase
        .channel('my-events-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'events',
          },
          (payload: any) => {
            if (__DEV__) {
              console.log('🔔 MyEventsScreen: Event change detected:', payload);
            }
            // Reload events when changes occur
            loadEvents();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'event_participants',
          },
          (payload: any) => {
            if (__DEV__) {
              console.log('🔔 MyEventsScreen: Participant change detected:', payload);
            }
            // Reload events when participant changes occur
            loadEvents();
          }
        )
        .subscribe();

      // Cleanup subscription on unmount
      return () => {
        if (__DEV__) {
          console.log('🔕 MyEventsScreen: Cleaning up real-time subscriptions...');
        }
        supabase.removeChannel(eventChannel);
      };
    };

    setupSubscriptions();
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (__DEV__) {
        console.log('🔄 MyEventsScreen: Starting to load events...');
      }
      
      // Get current user ID
      const currentUserId = 'd31adacf-886d-4198-859c-2c36695e644c';
      if (__DEV__) {
        console.log('👤 MyEventsScreen: Using user ID:', currentUserId);
      }
      
      // Import Supabase service
      const { supabaseService } = await import('../services/supabase');
      
      // Get today's date range for filtering
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      if (__DEV__) {
        console.log('📅 MyEventsScreen: Today range:', startOfDay.toISOString(), 'to', endOfDay.toISOString());
      }
      
      // Fetch BOTH created and joined events
      const [joinedEvents, createdEvents] = await Promise.all([
        supabaseService.getMyEvents(currentUserId), // Joined events
        supabaseService.getEvents({ status: 'active' }).then(events => 
          events.filter(event => event.creator_id === currentUserId)
        ) // Created events
      ]);
      
      if (__DEV__) {
        console.log('📋 MyEventsScreen: Fetched', joinedEvents.length, 'joined events');
        console.log('📋 MyEventsScreen: Fetched', createdEvents.length, 'created events');
      }
      
      // Combine and deduplicate events
      const allEvents = [...joinedEvents, ...createdEvents];
      const uniqueEvents = allEvents.filter((event, index, self) => 
        index === self.findIndex(e => e.id === event.id)
      );
      
      // Filter to only show today's events
      const todayEvents = uniqueEvents.filter(event => {
        const eventDate = new Date(event.scheduled_datetime);
        return eventDate >= startOfDay && eventDate < endOfDay;
      });
      
      if (__DEV__) {
        console.log('📅 MyEventsScreen: Filtered to', todayEvents.length, 'today events');
      }
      
      // Transform Supabase events to MyEvent format with proper role identification
      const transformedEvents: MyEvent[] = todayEvents.map(event => {
        const isCreator = event.creator_id === currentUserId;
        const isJoined = joinedEvents.some(joined => joined.id === event.id);
        
        return {
          id: event.id,
          name: event.title,
          activity: event.sport_type as SportActivity,
          startTime: new Date(event.scheduled_datetime),
          endTime: new Date(new Date(event.scheduled_datetime).getTime() + 2 * 60 * 60 * 1000),
          location: {
            name: (event as any).place_name || 'Unknown Location',
            address: (event as any).place_name || 'Unknown Address',
            distance: 0,
            lat: event.latitude,
            lng: event.longitude,
          },
          participants: {
            current: (event as any).participants_count || 0,
            max: event.max_participants,
          },
          status: event.status === 'active' ? 'upcoming' : 'completed',
          role: isCreator ? 'created' : (isJoined ? 'joined' : 'invited'),
          chatEnabled: true,
          createdBy: {
            id: event.creator_id,
            name: isCreator ? 'You' : 'Event Creator',
          },
        };
      });
      
      setEvents(transformedEvents);
      if (__DEV__) {
        console.log('✅ MyEventsScreen: Loaded', transformedEvents.length, 'events from Supabase');
        console.log('📊 MyEventsScreen: Events breakdown:', {
          created: transformedEvents.filter(e => e.role === 'created').length,
          joined: transformedEvents.filter(e => e.role === 'joined').length,
          invited: transformedEvents.filter(e => e.role === 'invited').length
        });
        
        if (transformedEvents.length === 0) {
          console.log('ℹ️ MyEventsScreen: No events found for user');
        }
      }
    } catch (error) {
      console.error('❌ MyEventsScreen: Error loading events:', error);
      console.error('❌ MyEventsScreen: Error details:', JSON.stringify(error, null, 2));
      const errorMessage = error instanceof Error ? error.message : 'Failed to load events';
      setError(errorMessage);
      Alert.alert('Error', 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

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
    navigation.navigate(ROUTES.EVENT_CHAT, { 
      event: {
        id: event.id,
        title: event.name,
        sport_type: event.activity
      }
    });
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
              const currentUserId = 'd31adacf-886d-4198-859c-2c36695e644c';
              const { supabaseService } = await import('../services/supabase');
              
              const success = await supabaseService.leaveEvent(event.id, currentUserId);
              if (success) {
            setEvents(prev => prev.filter(e => e.id !== event.id));
            Alert.alert('Success', 'You have left the event');
              } else {
                Alert.alert('Error', 'Failed to leave the event');
              }
            } catch (error) {
              console.error('Error leaving event:', error);
              Alert.alert('Error', 'Failed to leave the event');
            }
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
    if (loading && events.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </View>
      );
    }

    if (error && events.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Failed to Load Events</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={loadEvents}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (events.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <NoJoinedEventsEmptyState onBrowseEvents={handleBrowseEvents} />
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
    <ErrorBoundary>
    <View style={styles.container}>
      {/* Top Bar (matches MapScreen) */}
        <View style={styles.topBarSafeArea}>
          <SafeAreaView>
        <View style={styles.topBar}>
          {/* Logo on Left */}
          <SportMapLogo />

          {/* Action Buttons on Right */}
          <View style={styles.topBarActions}>
            <TouchableOpacity
              style={styles.topBarButton}
              onPress={handleFilterPress}
              activeOpacity={0.7}
                  accessibilityLabel="Filter events"
                  accessibilityRole="button"
            >
                  <Ionicons name="options-outline" size={ICON_SIZE} color={ICON_COLOR} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.topBarButton}
              onPress={handleMorePress}
              activeOpacity={0.7}
                  accessibilityLabel="More options"
                  accessibilityRole="button"
            >
                  <Ionicons name="ellipsis-horizontal" size={ICON_SIZE} color={ICON_COLOR} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
        </View>

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
    </ErrorBoundary>
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
  // Error Styles
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FDB924',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

