import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface EventsScreenProps {
  navigation: any;
}

interface Event {
  id: string;
  title: string;
  sport: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  organizer: string;
  avatar: string;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Mecz piłki nożnej',
    sport: '⚽ Piłka nożna',
    date: 'Jutro',
    time: '18:00',
    location: 'Boisko miejskie, Warszawa',
    participants: 8,
    maxParticipants: 22,
    organizer: 'Jan Kowalski',
    avatar: '⚽',
  },
  {
    id: '2',
    title: 'Trening koszykówki',
    sport: '🏀 Koszykówka',
    date: 'Piątek',
    time: '19:30',
    location: 'Hala sportowa, Kraków',
    participants: 12,
    maxParticipants: 20,
    organizer: 'Anna Nowak',
    avatar: '🏀',
  },
  {
    id: '3',
    title: 'Bieg miejski',
    sport: '🏃‍♂️ Bieganie',
    date: 'Niedziela',
    time: '08:00',
    location: 'Park miejski, Gdańsk',
    participants: 25,
    maxParticipants: 50,
    organizer: 'Piotr Wiśniewski',
    avatar: '🏃‍♂️',
  },
  {
    id: '4',
    title: 'Trening tenisa',
    sport: '🎾 Tenis',
    date: 'Sobota',
    time: '10:00',
    location: 'Korty tenisowe, Wrocław',
    participants: 3,
    maxParticipants: 8,
    organizer: 'Maria Zielińska',
    avatar: '🎾',
  },
];

export default function EventsScreen({ navigation }: EventsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const insets = useSafeAreaInsets();

  const filters = [
    { key: 'all', label: 'Wszystkie' },
    { key: 'football', label: 'Piłka nożna' },
    { key: 'basketball', label: 'Koszykówka' },
    { key: 'running', label: 'Bieganie' },
    { key: 'tennis', label: 'Tenis' },
  ];

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity style={styles.eventItem}>
      <View style={styles.eventHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{item.avatar}</Text>
        </View>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventSport}>{item.sport}</Text>
        </View>
        <View style={styles.eventMeta}>
          <Text style={styles.eventDate}>{item.date}</Text>
          <Text style={styles.eventTime}>{item.time}</Text>
        </View>
      </View>
      
      <View style={styles.eventDetails}>
        <Text style={styles.eventLocation}>📍 {item.location}</Text>
        <Text style={styles.eventOrganizer}>👤 {item.organizer}</Text>
        <View style={styles.participantsInfo}>
          <Text style={styles.participantsText}>
            {item.participants}/{item.maxParticipants} uczestników
          </Text>
          <View style={styles.participantsBar}>
            <View 
              style={[
                styles.participantsFill, 
                { width: `${(item.participants / item.maxParticipants) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.joinButton}>
        <Text style={styles.joinButtonText}>Dołącz</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const filteredEvents = mockEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Wyszukaj wydarzenia..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              selectedFilter === filter.key && styles.selectedFilter
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter.key && styles.selectedFilterText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Create Event Button */}
      <TouchableOpacity style={styles.createEventButton}>
        <Text style={styles.createEventButtonText}>➕ Stwórz wydarzenie</Text>
      </TouchableOpacity>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.eventsList}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    fontSize: 16,
  },
  filtersContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filtersContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  selectedFilter: {
    backgroundColor: '#4CAF50',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
  },
  selectedFilterText: {
    color: 'white',
    fontWeight: '600',
  },
  createEventButton: {
    backgroundColor: '#4CAF50',
    margin: 15,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  createEventButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  eventsList: {
    flex: 1,
  },
  eventItem: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    borderRadius: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatar: {
    fontSize: 24,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  eventSport: {
    fontSize: 14,
    color: '#666',
  },
  eventMeta: {
    alignItems: 'flex-end',
  },
  eventDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
    color: '#999',
  },
  eventDetails: {
    marginBottom: 15,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  eventOrganizer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  participantsInfo: {
    marginBottom: 10,
  },
  participantsText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  participantsBar: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
  },
  participantsFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  joinButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

