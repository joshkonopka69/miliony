import React, { useState } from 'react';
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

interface EventData {
  activity: string;
  description: string;
  maxParticipants: number;
  date: Date;
  time: Date;
}

interface EventCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateEvent: (eventData: EventData) => void;
  venueName: string;
  venueAddress: string;
  placeId?: string;
  coordinates?: { lat: number; lng: number };
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
}: EventCreationModalProps) {
  const [activity, setActivity] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

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