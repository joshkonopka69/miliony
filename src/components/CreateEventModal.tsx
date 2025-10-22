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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BackendService } from '../services/backendService';
import { useAuth } from '../contexts/AuthContext';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onEventCreated: (event: any) => void;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

const SPORTS = [
  'Basketball',
  'Football',
  'Soccer',
  'Tennis',
  'Volleyball',
  'Badminton',
  'Running',
  'Cycling',
  'Swimming',
  'Gym',
  'Yoga',
  'Climbing',
  'Hockey',
  'Baseball',
  'Golf',
];

export default function CreateEventModal({
  visible,
  onClose,
  onEventCreated,
  userLocation,
}: CreateEventModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    sport_type: 'Basketball',
    description: '',
    max_participants: 10,
    location_name: '',
    location_address: '',
    scheduled_datetime: '',
  });

  const handleCreateEvent = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to create an event');
      return;
    }

    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (!userLocation) {
      Alert.alert('Error', 'Location is required to create an event');
      return;
    }

    setLoading(true);

    try {
      const eventData = {
        title: formData.title.trim(),
        sport_type: formData.sport_type,
        description: formData.description.trim(),
        max_participants: formData.max_participants,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        location_name: formData.location_name.trim() || 'Current Location',
        location_address: formData.location_address.trim() || 'Current Location',
        scheduled_datetime: formData.scheduled_datetime || new Date().toISOString(),
      };

      const result = await BackendService.Events.createEvent(user.id, eventData);

      if (result.success && result.event) {
        Alert.alert('Success', 'Event created successfully!');
        onEventCreated(result.event);
        handleClose();
      } else {
        Alert.alert('Error', result.error || 'Failed to create event');
      }
    } catch (error: any) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      sport_type: 'Basketball',
      description: '',
      max_participants: 10,
      location_name: '',
      location_address: '',
      scheduled_datetime: '',
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Event</Text>
          <TouchableOpacity
            onPress={handleCreateEvent}
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            disabled={loading}
          >
            <Text style={styles.createText}>
              {loading ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            
            {/* Event Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Event Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="Enter event title"
                maxLength={100}
              />
            </View>

            {/* Sport Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sport Type *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.sport_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, sport_type: value }))}
                  style={styles.picker}
                >
                  {SPORTS.map((sport) => (
                    <Picker.Item key={sport} label={sport} value={sport} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Describe your event..."
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            {/* Max Participants */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Max Participants</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.max_participants}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, max_participants: value }))}
                  style={styles.picker}
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                    <Picker.Item key={num} label={num.toString()} value={num} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Location Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location Name</Text>
              <TextInput
                style={styles.input}
                value={formData.location_name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location_name: text }))}
                placeholder="e.g., Central Park, Stadium"
                maxLength={100}
              />
            </View>

            {/* Location Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location Address</Text>
              <TextInput
                style={styles.input}
                value={formData.location_address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, location_address: text }))}
                placeholder="e.g., 123 Main St, City"
                maxLength={200}
              />
            </View>

            {/* Current Location Info */}
            {userLocation && (
              <View style={styles.locationInfo}>
                <Text style={styles.locationInfoTitle}>📍 Event Location</Text>
                <Text style={styles.locationInfoText}>
                  Latitude: {userLocation.latitude.toFixed(6)}
                </Text>
                <Text style={styles.locationInfoText}>
                  Longitude: {userLocation.longitude.toFixed(6)}
                </Text>
              </View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cancelButton: {
    padding: 10,
  },
  cancelText: {
    fontSize: 16,
    color: '#666666',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  createText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
  },
  locationInfo: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  locationInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  locationInfoText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
});