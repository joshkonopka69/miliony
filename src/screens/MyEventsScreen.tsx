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
import { supabaseService } from '../services/supabase';

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

      const user = await supabaseService.getCurrentUserProfile();
      if (!user) {
        setEvents([]);
        return;
      }

      const fetchedEvents = await supabaseService.getUserEvents(user.id);

      const mappedEvents: MyEvent[] = fetchedEvents.map(event => ({
        id: event.id,
        name: event.name || 'Unnamed Event',
        activity: event.activity as SportActivity,
        startTime: event.scheduled_datetime ? new Date(event.scheduled_datetime) : new Date(),
        endTime: event.end_datetime ? new Date(event.end_datetime) : new Date(),
        location: {
          name: event.location_name || 'Generic Location',
          address: event.address || '',
          lat: event.lat || 0,
          lng: event.lng || 0,
        },
        participants: {
          current: event.currentParticipants || 1,
          max: event.max_participants || 10,
        },
        status: event.status || 'upcoming',
        role: event.role || 'joined',
        chatEnabled: event.chat_enabled ?? true,
        createdBy: {
          id: event.creator?.id || event.created_by,
          name: event.creator?.display_name || 'Organizatow',
          avatarUrl: event.creator?.avatar_url,
        },
        description: event.description || '',
      }));

      setEvents(mappedEvents);
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
          onPress: async () => {
            try {
              const user = await supabaseService.getCurrentUserProfile();
              if (!user) throw new Error('User not logged in');

              const success = await supabaseService.leaveEvent(event.id, user.id);
              if (success) {
                setEvents(prev => prev.filter(e => e.id !== event.id));
                Alert.alert(t.common.success, 'You have left the event');
              } else {
                Alert.alert('Error', 'Failed to leave event');
              }
            } catch (error) {
              console.error('Error leaving event:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            }
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
