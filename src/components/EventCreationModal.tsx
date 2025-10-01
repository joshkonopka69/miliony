import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { PlaceDetails } from '../services/placesApi';

interface EventData {
  activity: string;
  description: string;
  maxParticipants: number;
  date: Date;
  time: Date;
  venueName: string;
  venueAddress: string;
  placeId?: string;
  coordinates?: { lat: number; lng: number };
  placeDetails?: PlaceDetails;
}

interface EventCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateEvent: (eventData: EventData) => void;
  venueName: string;
  venueAddress: string;
  placeId?: string;
  coordinates?: { lat: number; lng: number };
  placeDetails?: PlaceDetails;
}

const ACTIVITIES = [
  'Football', 'Basketball', 'Tennis', 'Swimming', 'Gym Workout',
  'Yoga', 'Running', 'Cycling', 'Volleyball', 'Badminton',
  'Squash', 'Boxing', 'Martial Arts', 'Dancing', 'Hiking',
  'Rock Climbing', 'Bouldering', 'Skateboarding', 'Other'
];

const MAX_PARTICIPANTS_OPTIONS = [2, 4, 6, 8, 10, 12, 16, 20, 30, 50];

export default function EventCreationModal({
  visible,
  onClose,
  onCreateEvent,
  venueName,
  venueAddress,
  placeId,
  coordinates,
  placeDetails,
}: EventCreationModalProps) {
  const [activity, setActivity] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Pre-fill form with place details
  useEffect(() => {
    if (placeDetails) {
      const suggestedActivity = getSuggestedActivity(placeDetails.types);
      if (suggestedActivity) {
        setActivity(suggestedActivity);
      }
      
      // Pre-fill description with place context
      const placeContext = `Meetup at ${placeDetails.name}`;
      if (placeDetails.rating) {
        setDescription(`${placeContext} (⭐ ${placeDetails.rating}/5 rating)`);
      } else {
        setDescription(placeContext);
      }
    }
  }, [placeDetails]);

  const getSuggestedActivity = (types: string[]): string | null => {
    if (!types || types.length === 0) return null;
    
    const typeActivityMap: { [key: string]: string } = {
      'gym': 'Gym Workout',
      'park': 'Running',
      'stadium': 'Football',
      'swimming_pool': 'Swimming',
      'sports_complex': 'Basketball',
      'tennis_court': 'Tennis',
      'basketball_court': 'Basketball',
      'bowling_alley': 'Other',
      'golf_course': 'Other',
      'ice_rink': 'Other',
      'health': 'Yoga',
      'tourist_attraction': 'Hiking',
    };

    for (const type of types) {
      if (typeActivityMap[type]) {
        return typeActivityMap[type];
      }
    }
    
    return null;
  };

  const getPlaceBasedSuggestions = (placeDetails?: PlaceDetails) => {
    if (!placeDetails) return null;

    const suggestions = {
      activities: [] as string[],
      description: '',
      maxParticipants: 8,
    };

    // Activity suggestions based on place type
    if (placeDetails.types.includes('gym')) {
      suggestions.activities = ['Gym Workout', 'Weight Training', 'Cardio', 'Yoga', 'Pilates'];
    } else if (placeDetails.types.includes('park')) {
      suggestions.activities = ['Running', 'Walking', 'Cycling', 'Yoga', 'Hiking'];
    } else if (placeDetails.types.includes('stadium')) {
      suggestions.activities = ['Football', 'Soccer', 'Rugby', 'Track & Field'];
    } else if (placeDetails.types.includes('swimming_pool')) {
      suggestions.activities = ['Swimming', 'Water Polo', 'Aqua Aerobics'];
    } else if (placeDetails.types.includes('sports_complex')) {
      suggestions.activities = ['Basketball', 'Volleyball', 'Tennis', 'Badminton'];
    }

    // Description template based on place
    const placeName = placeDetails.name;
    const rating = placeDetails.rating ? ` (⭐ ${placeDetails.rating}/5)` : '';
    suggestions.description = `Join us for a fun activity at ${placeName}${rating}!`;

    // Max participants based on place capacity
    if (placeDetails.types.includes('stadium')) {
      suggestions.maxParticipants = 50;
    } else if (placeDetails.types.includes('sports_complex')) {
      suggestions.maxParticipants = 20;
    } else if (placeDetails.types.includes('gym')) {
      suggestions.maxParticipants = 12;
    }

    return suggestions;
  };

  const getPlaceCapacityInfo = (placeDetails?: PlaceDetails): string => {
    if (!placeDetails) return '';

    if (placeDetails.types.includes('stadium')) {
      return '🏟️ Large venue - perfect for big groups';
    } else if (placeDetails.types.includes('sports_complex')) {
      return '🏃 Sports complex - great for team activities';
    } else if (placeDetails.types.includes('gym')) {
      return '💪 Gym facility - ideal for fitness activities';
    } else if (placeDetails.types.includes('park')) {
      return '🌳 Outdoor space - perfect for outdoor activities';
    }
    
    return '';
  };

  const handleCreate = () => {
    if (!activity.trim()) {
      Alert.alert('Error', 'Please select an activity');
      return;
    }

    if (description.trim().length < 10) {
      Alert.alert('Error', 'Please provide a description (at least 10 characters)');
      return;
    }

    if (!date.trim() || !time.trim()) {
      Alert.alert('Error', 'Please enter both date and time');
      return;
    }

    const eventData: EventData = {
      activity: activity.trim(),
      description: description.trim(),
      maxParticipants,
      date: new Date(`${date} ${time}`),
      time: new Date(`${date} ${time}`),
      venueName,
      venueAddress,
      placeId,
      coordinates,
      placeDetails,
    };

    onCreateEvent(eventData);
    onClose();
  };


  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Event</Text>
          <TouchableOpacity onPress={handleCreate} style={styles.createButton}>
            <Text style={styles.createText}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Venue Info */}
          <View style={styles.venueSection}>
            <Text style={styles.venueName}>{venueName}</Text>
            <Text style={styles.venueAddress}>{venueAddress}</Text>
            {placeDetails && (
              <View style={styles.placeInfoContainer}>
                <Text style={styles.placeInfoText}>
                  {getPlaceCapacityInfo(placeDetails)}
                </Text>
                {placeDetails.rating && (
                  <Text style={styles.placeRating}>
                    ⭐ {placeDetails.rating}/5 rating
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Activity Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity *</Text>
            <View style={styles.activitiesGrid}>
              {ACTIVITIES.map((act) => (
                <TouchableOpacity
                  key={act}
                  style={[
                    styles.activityChip,
                    activity === act && styles.activityChipSelected
                  ]}
                  onPress={() => setActivity(act)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.activityLabel,
                    activity === act && styles.activityLabelSelected
                  ]}>
                    {act}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description *</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your event, what to bring, skill level, etc."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={500}
            />
            <Text style={styles.characterCount}>{description.length}/500</Text>
          </View>

          {/* Date and Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date & Time *</Text>
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeInputContainer}>
                <Text style={styles.dateTimeLabel}>Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.dateTimeInput}
                  value={date}
                  onChangeText={setDate}
                  placeholder="2024-01-15"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              
              <View style={styles.dateTimeInputContainer}>
                <Text style={styles.dateTimeLabel}>Time (HH:MM)</Text>
                <TextInput
                  style={styles.dateTimeInput}
                  value={time}
                  onChangeText={setTime}
                  placeholder="14:30"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>

          {/* Max Participants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Max Participants</Text>
            <View style={styles.participantsContainer}>
              {MAX_PARTICIPANTS_OPTIONS.map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.participantChip,
                    maxParticipants === count && styles.participantChipSelected
                  ]}
                  onPress={() => setMaxParticipants(count)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.participantLabel,
                    maxParticipants === count && styles.participantLabelSelected
                  ]}>
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  createText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  venueSection: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 8,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 14,
    color: '#6b7280',
  },
  placeInfoContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  placeInfoText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  placeRating: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  activityChipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  activityLabelSelected: {
    color: '#ffffff',
  },
  descriptionInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeInputContainer: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  dateTimeInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  participantChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    minWidth: 50,
    alignItems: 'center',
  },
  participantChipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  participantLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  participantLabelSelected: {
    color: '#ffffff',
  },
});