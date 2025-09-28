import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  FlatList,
  StatusBar,
  Image
} from 'react-native';
import { useAppNavigation, useAppRoute } from '../navigation';
import { ROUTES } from '../navigation/types';
import { BottomNavBar } from '../components';

// Custom SM Logo Component
const SMLogo = ({ size = 30 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

interface Event {
  id: string;
  activity: string;
  description?: string;
  placeName: string;
  address: string;
  time: string;
  maxParticipants: number;
  currentParticipants: number;
  coordinates: { lat: number; lng: number };
  creatorId: string;
  creatorName?: string;
}

export default function EventSearchResultsScreen() {
  const navigation = useAppNavigation();
  const route = useAppRoute<'EventSearchResults'>();
  const searchQuery = route.params?.searchQuery || '';
  const events = route.params?.events || [];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEventPress = (event: Event) => {
    console.log('Opening event details for:', event.activity);
    navigation.navigate(ROUTES.EVENT_DETAILS, { event });
  };

  const handleJoinEvent = (eventId: string) => {
    console.log('Joining event:', eventId);
    // Add join event logic here
  };

  const getEventIcon = (activity: string) => {
    const activityLower = activity.toLowerCase();
    if (activityLower.includes('basketball')) return '🏀';
    if (activityLower.includes('soccer') || activityLower.includes('football')) return '⚽';
    if (activityLower.includes('tennis')) return '🎾';
    if (activityLower.includes('volleyball')) return '🏐';
    if (activityLower.includes('swimming')) return '🏊';
    if (activityLower.includes('running')) return '🏃';
    if (activityLower.includes('cycling')) return '🚴';
    if (activityLower.includes('gym') || activityLower.includes('fitness')) return '💪';
    return '🏟️';
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.eventHeader}>
        <View style={styles.eventIconContainer}>
          <Text style={styles.eventIcon}>{getEventIcon(item.activity)}</Text>
        </View>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{item.activity}</Text>
          <Text style={styles.eventLocation}>📍 {item.placeName}</Text>
          <Text style={styles.eventAddress}>{item.address}</Text>
        </View>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => handleJoinEvent(item.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
      </View>
      
      {item.description && (
        <Text style={styles.eventDescription}>{item.description}</Text>
      )}
      
      <View style={styles.eventFooter}>
        <Text style={styles.eventTime}>🕒 {item.time}</Text>
        <Text style={styles.eventParticipants}>
          👥 {item.currentParticipants}/{item.maxParticipants} participants
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🔍</Text>
      <Text style={styles.emptyStateTitle}>No events found</Text>
      <Text style={styles.emptyStateText}>
        No events match your search for "{searchQuery}"
      </Text>
      <TouchableOpacity
        style={styles.backToMapButton}
        onPress={handleBack}
      >
        <Text style={styles.backToMapButtonText}>Back to Map</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Results</Text>
        <SMLogo size={30} />
      </View>

      {/* Search Query Display */}
      <View style={styles.searchQueryContainer}>
        <Text style={styles.searchQueryLabel}>Searching for:</Text>
        <Text style={styles.searchQueryText}>"{searchQuery}"</Text>
        <Text style={styles.resultsCount}>
          {events.length} event{events.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Events List */}
      {events.length > 0 ? (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          style={styles.eventsList}
          contentContainerStyle={styles.eventsListContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}

      {/* Bottom Navigation */}
      <BottomNavBar 
        activeTab="Home"
        onProfilePress={() => navigation.navigate('Profile')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // bg-gray-50
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // border-gray-100
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#374151', // text-gray-700
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    textAlign: 'center',
    flex: 1,
    marginRight: 40, // pr-10 equivalent
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fbbf24',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1,
  },
  searchQueryContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  searchQueryLabel: {
    fontSize: 14,
    color: '#6b7280', // text-gray-500
    marginBottom: 4,
  },
  searchQueryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827', // text-gray-900
    marginBottom: 4,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6b7280', // text-gray-500
  },
  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    padding: 16,
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventIcon: {
    fontSize: 24,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#6b7280', // text-gray-500
    marginBottom: 2,
  },
  eventAddress: {
    fontSize: 12,
    color: '#9ca3af', // text-gray-400
  },
  joinButton: {
    backgroundColor: '#f9bc06',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  eventDescription: {
    fontSize: 14,
    color: '#374151', // text-gray-700
    lineHeight: 20,
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTime: {
    fontSize: 12,
    color: '#6b7280', // text-gray-500
  },
  eventParticipants: {
    fontSize: 12,
    color: '#6b7280', // text-gray-500
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827', // text-gray-900
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280', // text-gray-500
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  backToMapButton: {
    backgroundColor: '#f9bc06',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToMapButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});



