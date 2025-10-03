import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import EventService, { CreateEventData } from '../services/eventService';

interface EventCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onEventCreated: (event: any) => void;
  venueName?: string;
  venueAddress?: string;
  placeId?: string;
  coordinates?: { latitude: number; longitude: number };
  placeDetails?: any;
}

const SPORTS_OPTIONS = [
  'Football', 'Basketball', 'Tennis', 'Swimming', 'Gym Workout',
  'Yoga', 'Running', 'Cycling', 'Volleyball', 'Badminton',
  'Soccer', 'Baseball', 'Hockey', 'Golf', 'Boxing', 'Martial Arts'
];

export default function EventCreationModal({
  visible,
  onClose,
  onEventCreated,
  venueName = '',
  venueAddress = '',
  placeId,
  coordinates,
  placeDetails,
}: EventCreationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    activity: '',
    maxParticipants: '10',
    startTime: '',
    endTime: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateEvent = async () => {
    if (!formData.name.trim() || !formData.activity.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const eventData: CreateEventData = {
        name: formData.name,
        description: formData.description,
        activity: formData.activity,
        max_participants: parseInt(formData.maxParticipants),
        location_name: venueName || 'Selected Location',
        latitude: coordinates?.latitude || 0,
        longitude: coordinates?.longitude || 0,
        place_id: placeId,
        start_time: formData.startTime || undefined,
        end_time: formData.endTime || undefined,
      };

      const event = await EventService.createEvent('current-user-id', eventData);
      
      if (event) {
        Alert.alert('Success', 'Event created successfully!');
        onEventCreated(event);
        onClose();
        resetForm();
      } else {
        Alert.alert('Error', 'Failed to create event. Please try again.');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      activity: '',
      maxParticipants: '10',
      startTime: '',
      endTime: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Event</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Venue Info */}
          {venueName && (
            <Card style={styles.venueCard}>
              <View style={styles.venueHeader}>
                <Ionicons name="location" size={20} color={theme.colors.primary} />
                <Text style={styles.venueTitle}>Event Location</Text>
              </View>
              <Text style={styles.venueName}>{venueName}</Text>
              <Text style={styles.venueAddress}>{venueAddress}</Text>
            </Card>
          )}

          {/* Event Form */}
          <Card style={styles.formCard}>
            <Input
              label="Event Name *"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter event name"
              leftIcon={<Ionicons name="calendar" size={20} color={theme.colors.textSecondary} />}
            />

            <Input
              label="Description"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Describe your event"
              multiline
              numberOfLines={3}
              leftIcon={<Ionicons name="document-text" size={20} color={theme.colors.textSecondary} />}
            />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activity *</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.sportsContainer}
              >
                {SPORTS_OPTIONS.map((sport) => (
                  <TouchableOpacity
                    key={sport}
                    style={[
                      styles.sportChip,
                      formData.activity === sport && styles.sportChipSelected,
                    ]}
                    onPress={() => handleInputChange('activity', sport)}
                  >
                    <Text
                      style={[
                        styles.sportChipText,
                        formData.activity === sport && styles.sportChipTextSelected,
                      ]}
                    >
                      {sport}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Input
              label="Max Participants"
              value={formData.maxParticipants}
              onChangeText={(value) => handleInputChange('maxParticipants', value)}
              placeholder="10"
              keyboardType="numeric"
              leftIcon={<Ionicons name="people" size={20} color={theme.colors.textSecondary} />}
            />

            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Input
                  label="Start Time"
                  value={formData.startTime}
                  onChangeText={(value) => handleInputChange('startTime', value)}
                  placeholder="HH:MM"
                  leftIcon={<Ionicons name="time" size={20} color={theme.colors.textSecondary} />}
                />
              </View>
              <View style={styles.timeInput}>
                <Input
                  label="End Time"
                  value={formData.endTime}
                  onChangeText={(value) => handleInputChange('endTime', value)}
                  placeholder="HH:MM"
                  leftIcon={<Ionicons name="time" size={20} color={theme.colors.textSecondary} />}
                />
              </View>
            </View>
          </Card>

          {/* Create Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={loading ? "Creating Event..." : "Create Event"}
              onPress={handleCreateEvent}
              variant="accent"
              size="lg"
              loading={loading}
              disabled={loading}
              icon={<Ionicons name="add-circle" size={24} color={theme.colors.textPrimary} />}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  venueCard: {
    marginBottom: theme.spacing.lg,
  },
  venueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  venueTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  venueName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  venueAddress: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  formCard: {
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  sportsContainer: {
    flexDirection: 'row',
  },
  sportChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sportChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sportChipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  sportChipTextSelected: {
    color: theme.colors.textOnPrimary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  timeRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  timeInput: {
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: theme.spacing.xl,
  },
});