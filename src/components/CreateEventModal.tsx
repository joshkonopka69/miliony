import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Location {
  name: string;
  latitude: number;
  longitude: number;
  placeId: string | null;
  address: string;
}

interface CreateEventModalProps {
  visible: boolean;
  location: Location | null;
  onClose: () => void;
  onEventCreated: (event: any) => void;
}

const SPORT_TYPES = [
  { value: 'basketball', label: 'Basketball', emoji: '🏀' },
  { value: 'football', label: 'Football', emoji: '⚽' },
  { value: 'running', label: 'Running', emoji: '🏃‍♂️' },
  { value: 'tennis', label: 'Tennis', emoji: '🎾' },
  { value: 'cycling', label: 'Cycling', emoji: '🚴‍♂️' },
  { value: 'swimming', label: 'Swimming', emoji: '🏊‍♂️' },
  { value: 'gym', label: 'Gym/Fitness', emoji: '💪' },
  { value: 'volleyball', label: 'Volleyball', emoji: '🏐' },
  { value: 'climbing', label: 'Climbing', emoji: '🧗‍♂️' },
  { value: 'boxing', label: 'Boxing', emoji: '🥊' },
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  visible,
  location,
  onClose,
  onEventCreated,
}) => {
  // Get authenticated user from Auth Context
  const { getUserId } = useAuth();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSport, setSelectedSport] = useState('basketball');
  const [dateTime, setDateTime] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Tomorrow
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [minParticipants, setMinParticipants] = useState(2);
  
  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter an event title');
      return;
    }

    if (dateTime <= new Date()) {
      Alert.alert('Invalid Date', 'Event must be scheduled for a future time');
      return;
    }

    if (minParticipants > maxParticipants) {
      Alert.alert('Invalid Participants', 'Minimum participants cannot exceed maximum');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location information is missing');
      return;
    }

    setIsCreating(true);

    try {
      // Get current user ID from Auth Context
      const userId = getUserId();
      
      console.log('🔍 Checking authentication...');
      console.log('   User ID from AuthContext:', userId || 'None');
      
      if (!userId) {
        console.error('❌ No authenticated user found');
        throw new Error('You must be logged in to create events. Please sign in and try again.');
      }

      console.log('✅ User authenticated:', userId);

      // Create event in database
      const { data: event, error: eventError} = await supabase
        .from('events')
        .insert({
          created_by: userId,
          name: title.trim(),
          description: description.trim() || null,
          activity: selectedSport,
          latitude: location.latitude,
          longitude: location.longitude,
          location_name: location.name,
          place_id: location.placeId || null,
          max_participants: maxParticipants,
          min_participants: minParticipants,
          scheduled_datetime: dateTime.toISOString(),
          participants_count: 1,
          status: 'live',
        })
        .select()
        .single();

      if (eventError) {
        console.error('❌ Error creating event:', eventError);
        throw new Error(eventError.message || 'Failed to create event');
      }

      console.log('✅ Event created:', event.id);

      // Add creator as first participant
      const { error: participantError } = await supabase
        .from('event_participants')
        .insert({
          event_id: event.id,
          user_id: userId,
          joined_at: new Date().toISOString(),
        });

      if (participantError) {
        console.warn('⚠️ Warning: Failed to add creator as participant:', participantError);
        // Don't throw - event is created, this is just a bonus
      } else {
        console.log('✅ Creator added as participant');
      }

      Alert.alert('Success! 🎉', 'Your event has been created');
      
      // Reset form
      resetForm();
      
      // Notify parent with the created event
      onEventCreated(event);
      
      // Close modal
      onClose();

    } catch (error: any) {
      console.error('❌ Error creating event:', error);
      Alert.alert('Error', error.message || 'Failed to create event. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedSport('basketball');
    setDateTime(new Date(Date.now() + 24 * 60 * 60 * 1000));
    setMaxParticipants(10);
    setMinParticipants(2);
  };

  const handleClose = () => {
    if (isCreating) return;
    resetForm();
    onClose();
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            disabled={isCreating}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Event</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Location Info */}
          <View style={styles.locationBanner}>
            <Text style={styles.locationEmoji}>📍</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{location?.name}</Text>
              <Text style={styles.locationAddress} numberOfLines={1}>
                {location?.address}
              </Text>
            </View>
          </View>

          {/* Event Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Event Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Friendly Basketball Game"
              value={title}
              onChangeText={setTitle}
              maxLength={50}
              editable={!isCreating}
            />
            <Text style={styles.charCount}>{title.length}/50</Text>
          </View>

          {/* Sport Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Sport Type <Text style={styles.required}>*</Text>
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sportChipsContainer}
            >
              {SPORT_TYPES.map((sport) => (
                <TouchableOpacity
                  key={sport.value}
                  style={[
                    styles.sportChip,
                    selectedSport === sport.value && styles.sportChipSelected,
                  ]}
                  onPress={() => setSelectedSport(sport.value)}
                  disabled={isCreating}
                >
                  <Text style={styles.sportEmoji}>{sport.emoji}</Text>
                  <Text
                    style={[
                      styles.sportLabel,
                      selectedSport === sport.value && styles.sportLabelSelected,
                    ]}
                  >
                    {sport.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Date & Time */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Date & Time <Text style={styles.required}>*</Text>
            </Text>
            
            <View style={styles.dateTimeRow}>
              {/* Date Picker */}
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
                disabled={isCreating}
              >
                <Text style={styles.dateTimeEmoji}>📅</Text>
                <Text style={styles.dateTimeText}>{formatDate(dateTime)}</Text>
              </TouchableOpacity>

              {/* Time Picker */}
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
                disabled={isCreating}
              >
                <Text style={styles.dateTimeEmoji}>🕐</Text>
                <Text style={styles.dateTimeText}>{formatTime(dateTime)}</Text>
              </TouchableOpacity>
            </View>

            {/* Date Picker Modal */}
            {showDatePicker && (
              <DateTimePicker
                value={dateTime}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setDateTime(selectedDate);
                  }
                }}
                minimumDate={new Date()}
              />
            )}

            {/* Time Picker Modal */}
            {showTimePicker && (
              <DateTimePicker
                value={dateTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowTimePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setDateTime(selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Participants */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Number of Players</Text>
            
            {/* Max Participants */}
            <View style={styles.participantRow}>
              <Text style={styles.participantLabel}>Maximum</Text>
              <View style={styles.participantControls}>
                <TouchableOpacity
                  style={styles.participantButton}
                  onPress={() => setMaxParticipants(Math.max(2, maxParticipants - 1))}
                  disabled={isCreating}
                >
                  <Text style={styles.participantButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.participantValue}>{maxParticipants}</Text>
                <TouchableOpacity
                  style={styles.participantButton}
                  onPress={() => setMaxParticipants(Math.min(50, maxParticipants + 1))}
                  disabled={isCreating}
                >
                  <Text style={styles.participantButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Min Participants */}
            <View style={styles.participantRow}>
              <Text style={styles.participantLabel}>Minimum</Text>
              <View style={styles.participantControls}>
                <TouchableOpacity
                  style={styles.participantButton}
                  onPress={() => setMinParticipants(Math.max(1, minParticipants - 1))}
                  disabled={isCreating}
                >
                  <Text style={styles.participantButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.participantValue}>{minParticipants}</Text>
                <TouchableOpacity
                  style={styles.participantButton}
                  onPress={() => setMinParticipants(Math.min(maxParticipants, minParticipants + 1))}
                  disabled={isCreating}
                >
                  <Text style={styles.participantButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add details about skill level, equipment needed, etc..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
              editable={!isCreating}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Create Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.createButton, isCreating && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Event</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  locationEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 13,
    color: '#3b82f6',
  },
  formGroup: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#111827',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  sportChipsContainer: {
    paddingVertical: 8,
    gap: 8,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  sportChipSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  sportEmoji: {
    fontSize: 20,
  },
  sportLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  sportLabelSelected: {
    color: '#fff',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  dateTimeEmoji: {
    fontSize: 20,
  },
  dateTimeText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  participantLabel: {
    fontSize: 15,
    color: '#374151',
  },
  participantControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  participantButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  participantValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    minWidth: 30,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  createButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
