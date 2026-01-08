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
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../styles/theme';
import { formatEventDate, formatEventTime } from '../utils/eventGrouping';
import { useTranslation } from '../contexts/TranslationContext';

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
  { value: 'basketball', label: 'Basketball', emoji: '🏀', icon: 'basketball-outline' },
  { value: 'football', label: 'Football', emoji: '⚽', icon: 'football-outline' },
  { value: 'running', label: 'Running', emoji: '🏃‍♂️', icon: 'walk-outline' },
  { value: 'tennis', label: 'Tennis', emoji: '🎾', icon: 'tennisball-outline' },
  { value: 'cycling', label: 'Cycling', emoji: '🚴‍♂️', icon: 'bicycle-outline' },
  { value: 'swimming', label: 'Swimming', emoji: '🏊‍♂️', icon: 'water-outline' },
  { value: 'gym', label: 'Gym/Fitness', emoji: '💪', icon: 'barbell-outline' },
  { value: 'volleyball', label: 'Volleyball', emoji: '🏐', icon: 'american-football-outline' },
  { value: 'climbing', label: 'Climbing', emoji: '🧗‍♂️', icon: 'bonfire-outline' },
  { value: 'boxing', label: 'Boxing', emoji: '🥊', icon: 'fitness-outline' },
];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  visible,
  location,
  onClose,
  onEventCreated,
}) => {
  const { t, language } = useTranslation();
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

  const mergeDatePreserveTime = (base: Date, picked: Date): Date => {
    const newDate = new Date(base);
    newDate.setFullYear(picked.getFullYear());
    newDate.setMonth(picked.getMonth());
    newDate.setDate(picked.getDate());
    return newDate;
  };

  const mergeTimePreserveDate = (base: Date, picked: Date): Date => {
    const newDate = new Date(base);
    newDate.setHours(picked.getHours());
    newDate.setMinutes(picked.getMinutes());
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    return newDate;
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert(t.common.error, t.createEvent?.missingTitle || 'Please enter an event title');
      return;
    }

    if (dateTime <= new Date()) {
      Alert.alert(t.common.error, t.createEvent?.invalidDate || 'Event must be scheduled for a future time');
      return;
    }

    if (minParticipants > maxParticipants) {
      Alert.alert(t.common.error, t.createEvent?.invalidParticipants || 'Minimum participants cannot exceed maximum');
      return;
    }

    if (!location) {
      Alert.alert(t.common.error, t.createEvent?.missingLocation || 'Location information is missing');
      return;
    }

    setIsCreating(true);

    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('You must be logged in to create events.');
      }

      const { data: event, error: eventError } = await supabase
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

      if (eventError) throw eventError;

      await supabase.from('event_participants').insert({
        event_id: event.id,
        user_id: userId,
        joined_at: new Date().toISOString(),
      });

      Alert.alert('Success! 🎉', 'Your event has been created');
      resetForm();
      onEventCreated(event);
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

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.backButton} disabled={isCreating}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.createEvent?.title || 'Create Event'}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Location Card */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color={theme.colors.accent} />
              <Text style={styles.sectionTitle}>{t.eventDetails?.location || 'Location'}</Text>
            </View>
            <Text style={styles.locationName}>{location?.name}</Text>
            <Text style={styles.locationAddress}>{location?.address}</Text>
          </View>

          {/* Title Input */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pencil" size={20} color={theme.colors.accent} />
              <Text style={styles.sectionTitle}>{t.createEvent?.eventTitle || 'Event Title'}</Text>
            </View>
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

          {/* Sport Selection */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy" size={20} color={theme.colors.accent} />
              <Text style={styles.sectionTitle}>{t.createEvent?.sportType || 'Sport Type'}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportScroll}>
              {SPORT_TYPES.map((sport) => (
                <TouchableOpacity
                  key={sport.value}
                  style={[styles.sportChip, selectedSport === sport.value && styles.sportChipActive]}
                  onPress={() => setSelectedSport(sport.value)}
                >
                  <Text style={styles.sportEmoji}>{sport.emoji}</Text>
                  <Text style={[styles.sportLabel, selectedSport === sport.value && styles.sportLabelActive]}>
                    {sport.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Date & Time */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={20} color={theme.colors.accent} />
              <Text style={styles.sectionTitle}>{t.createEvent?.dateTime || 'Date & Time'}</Text>
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={20} color={theme.colors.accent} />
                <Text style={styles.pickerText}>{formatEventDate(dateTime, language)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
                <Ionicons name="time-outline" size={20} color={theme.colors.accent} />
                <Text style={styles.pickerText}>{formatEventTime(dateTime, language)}</Text>
              </TouchableOpacity>
            </View>

            {/* Date Picker */}
            {showDatePicker && (
              <View style={styles.pickerContainer}>
                {Platform.OS === 'ios' && (
                  <View style={styles.pickerHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.doneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <DateTimePicker
                  value={dateTime}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    if (Platform.OS !== 'ios') {
                      setShowDatePicker(false);
                    }
                    if (date) {
                      setDateTime(prev => mergeDatePreserveTime(prev, date));
                    }
                  }}
                  minimumDate={new Date()} // Keep it for date, usually safe here
                  themeVariant="light"
                />
              </View>
            )}

            {/* Time Picker */}
            {showTimePicker && (
              <View style={styles.pickerContainer}>
                {Platform.OS === 'ios' && (
                  <View style={styles.pickerHeader}>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                      <Text style={styles.doneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <DateTimePicker
                  value={dateTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    if (Platform.OS !== 'ios') {
                      setShowTimePicker(false);
                    }
                    if (date) {
                      setDateTime(prev => mergeTimePreserveDate(prev, date));
                    }
                  }}
                  themeVariant="light"
                />
              </View>
            )}
          </View>

          {/* Participants */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={20} color={theme.colors.accent} />
              <Text style={styles.sectionTitle}>{t.eventDetails?.players || 'Players'}</Text>
            </View>
            <View style={styles.counterRow}>
              <Text style={styles.counterLabel}>Maximum</Text>
              <View style={styles.counter}>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setMaxParticipants(Math.max(2, maxParticipants - 1))}>
                  <Text style={styles.counterBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{maxParticipants}</Text>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setMaxParticipants(Math.min(50, maxParticipants + 1))}>
                  <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.counterRow}>
              <Text style={styles.counterLabel}>Minimum</Text>
              <View style={styles.counter}>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setMinParticipants(Math.max(1, minParticipants - 1))}>
                  <Text style={styles.counterBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{minParticipants}</Text>
                <TouchableOpacity style={styles.counterBtn} onPress={() => setMinParticipants(Math.min(maxParticipants, minParticipants + 1))}>
                  <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color={theme.colors.accent} />
              <Text style={styles.sectionTitle}>{t.eventDetails?.description || 'Description'}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Skill level, equipment needed..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.createBtn, isCreating && styles.createBtnDisabled]}
            onPress={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={22} color="#000" />
                <Text style={styles.createBtnText}>Create Event</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  locationName: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  locationAddress: { fontSize: 14, color: '#6B7280' },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  charCount: { fontSize: 12, color: '#9CA3AF', textAlign: 'right', marginTop: 4 },
  sportScroll: { paddingVertical: 4 },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sportChipActive: { backgroundColor: theme.colors.accent + '20', borderColor: theme.colors.accent },
  sportEmoji: { fontSize: 18, marginRight: 6 },
  sportLabel: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  sportLabelActive: { color: theme.colors.accentDark, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerText: { fontSize: 15, color: '#1F2937', fontWeight: '500' },
  pickerContainer: { marginTop: 12, backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F0F0' },
  pickerHeader: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', alignItems: 'flex-end' },
  doneText: { color: theme.colors.accent, fontWeight: '700', fontSize: 16 },
  counterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  counterLabel: { fontSize: 15, color: '#4B5563' },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: { color: '#000', fontSize: 20, fontWeight: '700' },
  counterValue: { fontSize: 18, fontWeight: '700', color: '#1F2937', minWidth: 24, textAlign: 'center' },
  footer: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingBottom: Platform.OS === 'ios' ? 34 : 16 },
  createBtn: {
    backgroundColor: theme.colors.accent,
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnDisabled: { opacity: 0.6 },
  createBtnText: { color: '#000', fontSize: 17, fontWeight: '700' },
});
