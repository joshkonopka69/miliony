import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';

interface EventCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateEvent: (eventData: any) => void;
}

const SPORTS = [
  { id: 'football', name: 'Football', icon: '⚽' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐' },
  { id: 'badminton', name: 'Badminton', icon: '🏸' },
  { id: 'swimming', name: 'Swimming', icon: '🏊' },
  { id: 'running', name: 'Running', icon: '🏃' },
  { id: 'cycling', name: 'Cycling', icon: '🚴' },
  { id: 'gym', name: 'Gym', icon: '🏋️' },
  { id: 'yoga', name: 'Yoga', icon: '🧘' },
];

export default function EventCreationModal({ visible, onClose, onCreateEvent }: EventCreationModalProps) {
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [minPlayers, setMinPlayers] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [isOpenEvent, setIsOpenEvent] = useState(false);

  const handleCreateEvent = () => {
    // Validation
    if (!selectedSport) {
      Alert.alert('Error', 'Please select a sport');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (!isOpenEvent) {
      if (!minPlayers || !maxPlayers) {
        Alert.alert('Error', 'Please enter minimum and maximum number of players');
        return;
      }
      if (parseInt(minPlayers) > parseInt(maxPlayers)) {
        Alert.alert('Error', 'Minimum players cannot be greater than maximum players');
        return;
      }
    }

    const eventData = {
      sport: selectedSport,
      description: description.trim(),
      photo: photoUri,
      minPlayers: isOpenEvent ? null : parseInt(minPlayers),
      maxPlayers: isOpenEvent ? null : parseInt(maxPlayers),
      isOpen: isOpenEvent,
      createdAt: new Date().toISOString(),
    };

    onCreateEvent(eventData);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setSelectedSport('');
    setDescription('');
    setPhotoUri(null);
    setMinPlayers('');
    setMaxPlayers('');
    setIsOpenEvent(false);
    onClose();
  };

  const handlePhotoSelect = () => {
    // For now, we'll just simulate photo selection
    // In a real app, you would use react-native-image-picker or similar
    Alert.alert(
      'Photo Selection',
      'Photo selection functionality would be implemented here using react-native-image-picker',
      [{ text: 'OK' }]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Sport Event</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Sport Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Sport</Text>
            <View style={styles.sportsGrid}>
              {SPORTS.map((sport) => (
                <TouchableOpacity
                  key={sport.id}
                  style={[
                    styles.sportButton,
                    selectedSport === sport.id && styles.selectedSportButton,
                  ]}
                  onPress={() => setSelectedSport(sport.id)}
                >
                  <Text style={styles.sportIcon}>{sport.icon}</Text>
                  <Text style={[
                    styles.sportName,
                    selectedSport === sport.id && styles.selectedSportName,
                  ]}>
                    {sport.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Describe your sport event..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Photo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photo (Optional)</Text>
            <TouchableOpacity style={styles.photoButton} onPress={handlePhotoSelect}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoIcon}>📷</Text>
                  <Text style={styles.photoText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Player Limits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Number of Players</Text>
            
            {/* Open Event Toggle */}
            <TouchableOpacity
              style={styles.openEventToggle}
              onPress={() => setIsOpenEvent(!isOpenEvent)}
            >
              <View style={[styles.toggle, isOpenEvent && styles.toggleActive]}>
                <View style={[styles.toggleThumb, isOpenEvent && styles.toggleThumbActive]} />
              </View>
              <Text style={styles.toggleLabel}>Open event (no player limit)</Text>
            </TouchableOpacity>

            {!isOpenEvent && (
              <View style={styles.playerInputs}>
                <View style={styles.playerInputContainer}>
                  <Text style={styles.playerInputLabel}>Min Players</Text>
                  <TextInput
                    style={styles.playerInput}
                    placeholder="2"
                    value={minPlayers}
                    onChangeText={setMinPlayers}
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.playerInputContainer}>
                  <Text style={styles.playerInputLabel}>Max Players</Text>
                  <TextInput
                    style={styles.playerInput}
                    placeholder="10"
                    value={maxPlayers}
                    onChangeText={setMaxPlayers}
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
            <Text style={styles.createButtonText}>Create Event</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sportButton: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSportButton: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  sportIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  sportName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  selectedSportName: {
    color: '#92400E',
    fontWeight: '600',
  },
  descriptionInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 100,
  },
  photoButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  photoText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  openEventToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    paddingHorizontal: 2,
    marginRight: 12,
  },
  toggleActive: {
    backgroundColor: '#10B981',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  toggleLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  playerInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  playerInputContainer: {
    flex: 1,
  },
  playerInputLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  playerInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  createButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});


