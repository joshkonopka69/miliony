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
  const navigation = useAppNavigation();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<SportActivity | 'all'>('all');

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const fetchedEvents = await eventService.getMyEvents();
      
      // Mock data for demonstration
      const mockEvents: MyEvent[] = [
        {
          id: '1',
          name: 'Pickup Basketball Game',
          activity: 'Basketball',
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
          location: {
            name: 'Central Park Courts',
            address: '123 Park Ave',
            distance: 2.3,
            lat: 40.7829,
            lng: -73.9654,
          },
          participants: {
            current: 5,
            max: 10,
          },
          status: 'upcoming',
          role: 'joined',
          chatEnabled: true,
          createdBy: {
            id: 'user1',
            name: 'John Doe',
          },
        },
        {
          id: '2',
          name: 'Evening Football Match',
          activity: 'Football',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          endTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
          location: {
            name: 'Sports Complex Field',
            address: '456 Sports Dr',
            distance: 5.7,
            lat: 40.7580,
            lng: -73.9855,
          },
          participants: {
            current: 18,
            max: 22,
          },
          status: 'upcoming',
          role: 'created',
          chatEnabled: true,
          createdBy: {
            id: 'currentUser',
            name: 'You',
          },
        },
        {
          id: '3',
          name: 'Tennis Practice Session',
          activity: 'Tennis',
          startTime: new Date(Date.now() + 72 * 60 * 60 * 1000), // 3 days
          endTime: new Date(Date.now() + 74 * 60 * 60 * 1000),
          location: {
            name: 'City Tennis Club',
            address: '789 Tennis Rd',
            distance: 1.2,
            lat: 40.7489,
            lng: -73.9680,
          },
          participants: {
            current: 3,
            max: 4,
          },
          status: 'upcoming',
          role: 'joined',
          chatEnabled: true,
          createdBy: {
            id: 'user3',
            name: 'Sarah Smith',
          },
        },
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
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
    if (loading && events.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading your events...</Text>
        </View>
      );
    }

    if (events.length === 0) {
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

