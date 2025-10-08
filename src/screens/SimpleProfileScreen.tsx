import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../navigation/hooks';
import { ROUTES } from '../navigation/types';
import { BottomNavBar } from '../components';
import { useTranslation } from '../contexts/TranslationContext';

// Simple Logo Component
const SportMapLogo = () => (
  <View style={styles.logoContainer}>
    <View style={styles.logoCircle}>
      <Text style={styles.logoText}>SM</Text>
    </View>
    <Text style={styles.logoTitle}>SportMap</Text>
  </View>
);

interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  favorite_sports: string[];
  email: string;
}

interface MyEvent {
  id: string;
  name: string;
  activity: string;
  startTime: Date;
  location: string;
  participants: number;
  maxParticipants: number;
}

export default function SimpleProfileScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myEvents, setMyEvents] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    loadMyEvents();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const userProfile = await supabaseService.getCurrentUser();
      
      // Mock profile data
      const mockProfile: UserProfile = {
        id: 'user123',
        display_name: 'John Doe',
        avatar_url: undefined,
        favorite_sports: ['Basketball', 'Football', 'Tennis'],
        email: 'john@example.com',
      };
      
      setProfile(mockProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyEvents = async () => {
    try {
      // TODO: Replace with actual API call
      // const events = await supabaseService.getMyEvents('user123');
      
      // Mock events data
      const mockEvents: MyEvent[] = [
        {
          id: '1',
          name: 'Basketball Game',
          activity: 'Basketball',
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
          location: 'Central Park',
          participants: 5,
          maxParticipants: 10,
        },
        {
          id: '2',
          name: 'Football Match',
          activity: 'Football',
          startTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
          location: 'Sports Complex',
          participants: 8,
          maxParticipants: 12,
        },
      ];
      
      setMyEvents(mockEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleEditProfile = () => {
    navigation.navigate(ROUTES.EDIT_PROFILE);
  };

  const handleSettings = () => {
    navigation.navigate(ROUTES.SETTINGS);
  };

  const handleEventPress = (event: MyEvent) => {
    // Navigate to event details
    console.log('Event pressed:', event.id);
  };

  const getSportEmoji = (sport: string): string => {
    const emojiMap: { [key: string]: string } = {
      'Basketball': '🏀',
      'Football': '⚽',
      'Tennis': '🎾',
      'Running': '🏃',
      'Gym': '💪',
      'Volleyball': '🏐',
      'Badminton': '🏸',
    };
    return emojiMap[sport] || '🏃';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FDB924" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <SportMapLogo />
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={handleSettings}
          >
            <Ionicons name="settings-outline" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Text style={styles.avatarText}>
                    {profile?.display_name?.charAt(0) || 'U'}
                  </Text>
                </View>
              )}
            </View>
            
            <Text style={styles.name}>{profile?.display_name || 'User'}</Text>
            <Text style={styles.email}>{profile?.email || 'user@example.com'}</Text>
            
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Favorite Sports */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorite Sports</Text>
            <View style={styles.sportsContainer}>
              {profile?.favorite_sports?.map((sport, index) => (
                <View key={index} style={styles.sportItem}>
                  <Text style={styles.sportEmoji}>{getSportEmoji(sport)}</Text>
                  <Text style={styles.sportName}>{sport}</Text>
                </View>
              )) || (
                <Text style={styles.noSportsText}>No favorite sports selected</Text>
              )}
            </View>
          </View>

          {/* My Events Today */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Events Today</Text>
            {myEvents.length > 0 ? (
              <View style={styles.eventsContainer}>
                {myEvents.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.eventCard}
                    onPress={() => handleEventPress(event)}
                  >
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventEmoji}>{getSportEmoji(event.activity)}</Text>
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventName}>{event.name}</Text>
                        <Text style={styles.eventLocation}>{event.location}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.eventDetails}>
                      <Text style={styles.eventTime}>
                        {event.startTime.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                      <Text style={styles.eventParticipants}>
                        {event.participants}/{event.maxParticipants} people
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.noEventsContainer}>
                <Text style={styles.noEventsText}>No events today</Text>
                <Text style={styles.noEventsSubtext}>
                  Join an event on the map or create your own!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomNavBar 
        activeTab="Profile"
        onProfilePress={() => {}} // Already on profile
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDB924',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FDB924',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  editButton: {
    backgroundColor: '#FDB924',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  sportEmoji: {
    fontSize: 16,
  },
  sportName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  noSportsText: {
    fontSize: 16,
    color: '#666666',
    fontStyle: 'italic',
  },
  eventsContainer: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  eventEmoji: {
    fontSize: 24,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666666',
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FDB924',
  },
  eventParticipants: {
    fontSize: 14,
    color: '#666666',
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  noEventsSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});
