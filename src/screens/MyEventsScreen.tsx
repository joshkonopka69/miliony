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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../navigation/hooks';
import { useTranslation } from '../contexts/TranslationContext';
import { ROUTES } from '../navigation/types';
import { BottomNavBar } from '../components';
import { EmptyState, SectionHeader, EventCard } from '../components';
import { MyEvent, SportActivity } from '../types/event';

export default function MyEventsScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
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
          description: 'Casual pickup basketball game for all skill levels. Bring your own water and we\'ll have a great time! Looking for players who can commit to the full 2 hours.',
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
          description: 'Competitive 11v11 football match. We need skilled players for a full team game. Cleats recommended but not required. Game will go on rain or shine!',
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
          description: 'Doubles tennis practice for intermediate players. We\'ll work on serves, volleys, and strategy. Bring your own racket and balls. Court fees are $10 per person.',
        },
        {
          id: '4',
          name: 'Morning Running Group',
          activity: 'Running',
          startTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days
          endTime: new Date(Date.now() + 49 * 60 * 60 * 1000),
          location: {
            name: 'Riverside Park',
            address: '321 River Rd',
            distance: 3.5,
            lat: 40.7829,
            lng: -73.9754,
          },
          participants: {
            current: 8,
            max: 15,
          },
          status: 'upcoming',
          role: 'created',
          chatEnabled: true,
          createdBy: {
            id: 'currentUser',
            name: 'You',
          },
          description: 'Easy-paced 5K run along the riverside trail. Perfect for beginners and those getting back into running. We\'ll maintain a conversational pace and take a water break halfway.',
        },
        {
          id: '5',
          name: 'Volleyball Practice',
          activity: 'Volleyball',
          startTime: new Date(Date.now() + 96 * 60 * 60 * 1000), // 4 days
          endTime: new Date(Date.now() + 98 * 60 * 60 * 1000),
          location: {
            name: 'Beach Volleyball Courts',
            address: '555 Beach Ave',
            distance: 4.2,
            lat: 40.7689,
            lng: -73.9580,
          },
          participants: {
            current: 6,
            max: 12,
          },
          status: 'upcoming',
          role: 'joined',
          chatEnabled: true,
          createdBy: {
            id: 'user5',
            name: 'Mike Johnson',
          },
          description: 'Beach volleyball on the sand! All skill levels welcome. We\'ll play 6v6 games and rotate teams. Bring sunscreen and plenty of water. Nets and balls provided.',
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
      t.eventDetails.leaveGame,
      `Are you sure you want to leave "${event.name}"?`,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.eventDetails.leaveGame,
          style: 'destructive',
          onPress: () => {
            // TODO: Call API to leave event
            setEvents(prev => prev.filter(e => e.id !== event.id));
            Alert.alert(t.common.success, 'You have left the event');
          },
        },
      ]
    );
  };

  const handleBrowseEvents = () => {
    navigation.navigate(ROUTES.MAP);
  };

  // Filter events
  const filteredEvents = selectedFilter === 'all' 
    ? events 
    : events.filter(e => e.activity === selectedFilter);

  // Group events by role (Joined vs Created)
  const joinedEvents = filteredEvents.filter(e => e.role === 'joined');
  const createdEvents = filteredEvents.filter(e => e.role === 'created');
  
  const groupedEvents = [
    ...(joinedEvents.length > 0 ? [{ group: t.myEvents.joined, events: joinedEvents }] : []),
    ...(createdEvents.length > 0 ? [{ group: t.myEvents.created, events: createdEvents }] : []),
  ];

  // Render content based on state
  const renderContent = () => {
    if (loading && events.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>{t.common.loading}</Text>
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
            actionLabel={t.bottomNav.events}
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
      {/* Top Bar */}
      <SafeAreaView style={styles.topBarSafeArea}>
        <View style={styles.topBar}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>{t.myEvents.title}</Text>
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
  logo: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
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
