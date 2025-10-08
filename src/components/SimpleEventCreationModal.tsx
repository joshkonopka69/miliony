import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SimpleEventCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateEvent: (eventData: {
    sport: string;
    time: string;
    description: string;
    maxParticipants: number;
  }) => void;
  location: {
    latitude: number;
    longitude: number;
  } | null;
}

const SPORTS = [
  { emoji: '🏀', name: 'Basketball' },
  { emoji: '⚽', name: 'Football' },
  { emoji: '🎾', name: 'Tennis' },
  { emoji: '🏃', name: 'Running' },
  { emoji: '💪', name: 'Gym' },
  { emoji: '🏐', name: 'Volleyball' },
  { emoji: '🏸', name: 'Badminton' },
  { emoji: '🚴', name: 'Cycling' },
];

export default function SimpleEventCreationModal({
  visible,
  onClose,
  onCreateEvent,
  location,
}: SimpleEventCreationModalProps) {
  const [selectedSport, setSelectedSport] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [loading, setLoading] = useState(false);

  const handleCreateEvent = async () => {
    if (!selectedSport) {
      Alert.alert('Error', 'Please select a sport');
      return;
    }

    if (!time) {
      Alert.alert('Error', 'Please select a time');
      return;
    }

    // Validate time is in the future (today only)
    if (!validateTime(time)) {
      Alert.alert('Error', 'Please select a valid time in the future (today only)');
      return;
    }

    setLoading(true);
    try {
      await onCreateEvent({
        sport: selectedSport,
        time,
        description,
        maxParticipants,
      });
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getSuggestedTimes = () => {
    const now = new Date();
    const times = [];
    
    // Only suggest times for today (next 6 hours max)
    for (let i = 1; i <= 6; i++) {
      const time = new Date(now.getTime() + i * 60 * 60 * 1000); // Every hour for next 6 hours
      const hours = time.getHours();
      const minutes = time.getMinutes();
      times.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }
    
    return times;
  };

  const validateTime = (timeString: string): boolean => {
    if (!timeString || timeString.length !== 5) return false;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return false;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return false;
    
    // Check if time is in the future (today only)
    const now = new Date();
    const selectedTime = new Date();
    selectedTime.setHours(hours, minutes, 0, 0);
    
    return selectedTime > now;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Event</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Location Info */}
          {location && (
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={20} color="#FDB924" />
              <Text style={styles.locationText}>
                Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            </View>
          )}

          {/* Sport Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Sport</Text>
            <View style={styles.sportsGrid}>
              {SPORTS.map((sport) => (
                <TouchableOpacity
                  key={sport.name}
                  style={[
                    styles.sportButton,
                    selectedSport === sport.name && styles.selectedSportButton,
                  ]}
                  onPress={() => setSelectedSport(sport.name)}
                >
                  <Text style={styles.sportEmoji}>{sport.emoji}</Text>
                  <Text style={[
                    styles.sportName,
                    selectedSport === sport.name && styles.selectedSportName,
                  ]}>
                    {sport.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time (Today Only)</Text>
            <View style={styles.timeContainer}>
              <TextInput
                style={styles.timeInput}
                placeholder="HH:MM"
                value={time}
                onChangeText={setTime}
                keyboardType="numeric"
                maxLength={5}
              />
              <TouchableOpacity
                style={styles.nowButton}
                onPress={() => setTime(getCurrentTime())}
              >
                <Text style={styles.nowButtonText}>Now</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.suggestedTimesTitle}>Suggested times:</Text>
            <View style={styles.suggestedTimes}>
              {getSuggestedTimes().map((suggestedTime) => (
                <TouchableOpacity
                  key={suggestedTime}
                  style={styles.suggestedTimeButton}
                  onPress={() => setTime(suggestedTime)}
                >
                  <Text style={styles.suggestedTimeText}>{suggestedTime}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="What's this event about?"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>

          {/* Max Participants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Max Participants: {maxParticipants}</Text>
            <View style={styles.participantsContainer}>
              <TouchableOpacity
                style={styles.participantsButton}
                onPress={() => setMaxParticipants(Math.max(2, maxParticipants - 1))}
              >
                <Ionicons name="remove" size={20} color="#FDB924" />
              </TouchableOpacity>
              <Text style={styles.participantsText}>{maxParticipants}</Text>
              <TouchableOpacity
                style={styles.participantsButton}
                onPress={() => setMaxParticipants(Math.min(20, maxParticipants + 1))}
              >
                <Ionicons name="add" size={20} color="#FDB924" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreateEvent}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.createButtonText}>Create Event</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginVertical: 16,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sportButton: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  selectedSportButton: {
    backgroundColor: '#FDB924',
  },
  sportEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  sportName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
  selectedSportName: {
    color: '#000000',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  nowButton: {
    backgroundColor: '#FDB924',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  nowButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  suggestedTimesTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  suggestedTimes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestedTimeButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  suggestedTimeText: {
    fontSize: 14,
    color: '#000000',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  participantsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    minWidth: 40,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  createButton: {
    backgroundColor: '#FDB924',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
