import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNotificationManager } from '../hooks/useNotifications';
import { NotificationPreferences } from '../services/notificationService';

interface NotificationSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationSettings({ visible, onClose }: NotificationSettingsProps) {
  const {
    preferences,
    updatePreferencesWithValidation,
    resetPreferencesToDefault,
    testFCMConnection,
    getFCMStatus,
    isUpdating,
    error,
    clearError,
  } = useNotificationManager();

  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeField, setSelectedTimeField] = useState<'start_time' | 'end_time' | null>(null);
  const [timeInput, setTimeInput] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handlePreferenceChange = (field: string, value: any) => {
    if (!localPreferences) return;

    const newPreferences = { ...localPreferences };
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'categories') {
        newPreferences.categories = { ...newPreferences.categories, [child]: value };
      } else if (parent === 'quiet_hours') {
        newPreferences.quiet_hours = { ...newPreferences.quiet_hours, [child]: value };
      } else if (parent === 'frequency') {
        newPreferences.frequency = { ...newPreferences.frequency, [child]: value };
      }
    } else {
      (newPreferences as any)[field] = value;
    }

    setLocalPreferences(newPreferences);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!localPreferences) return;

    try {
      const success = await updatePreferencesWithValidation(localPreferences);
      if (success) {
        setHasChanges(false);
        Alert.alert('Success', 'Notification preferences updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update preferences. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update preferences');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Preferences',
      'Are you sure you want to reset all notification preferences to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const success = await resetPreferencesToDefault();
            if (success) {
              setHasChanges(false);
              Alert.alert('Success', 'Preferences reset to default!');
            } else {
              Alert.alert('Error', 'Failed to reset preferences. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleTestNotification = async () => {
    Alert.alert(
      'Test Notification',
      'Send a test notification to verify your settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Test',
          onPress: async () => {
            const result = await testFCMConnection();
            if (result.success) {
              Alert.alert('Success', 'Test notification sent successfully!');
            } else {
              Alert.alert('Error', result.error || 'Failed to send test notification');
            }
          },
        },
      ]
    );
  };

  const handleTimeChange = (field: 'start_time' | 'end_time') => {
    setSelectedTimeField(field);
    setTimeInput(localPreferences?.quiet_hours[field] || '');
    setShowTimePicker(true);
  };

  const handleTimeSave = () => {
    if (!localPreferences || !selectedTimeField) return;

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(timeInput)) {
      Alert.alert('Invalid Time', 'Please enter time in HH:MM format (e.g., 22:00)');
      return;
    }

    handlePreferenceChange(`quiet_hours.${selectedTimeField}`, timeInput);
    setShowTimePicker(false);
    setSelectedTimeField(null);
    setTimeInput('');
  };

  const fcmStatus = getFCMStatus();

  if (!localPreferences) {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Loading notification settings...</Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Text style={styles.errorDismiss}>×</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* FCM Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Status</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>FCM Initialized</Text>
                <View style={[styles.statusIndicator, fcmStatus.isInitialized && styles.statusActive]} />
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Token Available</Text>
                <View style={[styles.statusIndicator, fcmStatus.hasToken && styles.statusActive]} />
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Permissions Granted</Text>
                <View style={[styles.statusIndicator, fcmStatus.permissionsGranted && styles.statusActive]} />
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.testButton}
              onPress={handleTestNotification}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <Text style={styles.testButtonText}>Send Test Notification</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* General Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General Settings</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive push notifications on your device
                </Text>
              </View>
              <Switch
                value={localPreferences.push_enabled}
                onValueChange={(value) => handlePreferenceChange('push_enabled', value)}
                trackColor={{ false: '#e1e5e9', true: '#FFD700' }}
                thumbColor={localPreferences.push_enabled ? '#000000' : '#ffffff'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive notifications via email
                </Text>
              </View>
              <Switch
                value={localPreferences.email_enabled}
                onValueChange={(value) => handlePreferenceChange('email_enabled', value)}
                trackColor={{ false: '#e1e5e9', true: '#FFD700' }}
                thumbColor={localPreferences.email_enabled ? '#000000' : '#ffffff'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>SMS Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive notifications via SMS
                </Text>
              </View>
              <Switch
                value={localPreferences.sms_enabled}
                onValueChange={(value) => handlePreferenceChange('sms_enabled', value)}
                trackColor={{ false: '#e1e5e9', true: '#FFD700' }}
                thumbColor={localPreferences.sms_enabled ? '#000000' : '#ffffff'}
              />
            </View>
          </View>

          {/* Category Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Categories</Text>
            
            {Object.entries(localPreferences.categories).map(([category, enabled]) => (
              <View key={category} style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                  <Text style={styles.settingDescription}>
                    {getCategoryDescription(category as keyof typeof localPreferences.categories)}
                  </Text>
                </View>
                <Switch
                  value={enabled}
                  onValueChange={(value) => handlePreferenceChange(`categories.${category}`, value)}
                  trackColor={{ false: '#e1e5e9', true: '#FFD700' }}
                  thumbColor={enabled ? '#000000' : '#ffffff'}
                />
              </View>
            ))}
          </View>

          {/* Quiet Hours */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quiet Hours</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Enable Quiet Hours</Text>
                <Text style={styles.settingDescription}>
                  Pause notifications during specified hours
                </Text>
              </View>
              <Switch
                value={localPreferences.quiet_hours.enabled}
                onValueChange={(value) => handlePreferenceChange('quiet_hours.enabled', value)}
                trackColor={{ false: '#e1e5e9', true: '#FFD700' }}
                thumbColor={localPreferences.quiet_hours.enabled ? '#000000' : '#ffffff'}
              />
            </View>

            {localPreferences.quiet_hours.enabled && (
              <>
                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Start Time</Text>
                    <Text style={styles.settingDescription}>
                      When to start quiet hours
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => handleTimeChange('start_time')}
                  >
                    <Text style={styles.timeButtonText}>
                      {localPreferences.quiet_hours.start_time}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>End Time</Text>
                    <Text style={styles.settingDescription}>
                      When to end quiet hours
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => handleTimeChange('end_time')}
                  >
                    <Text style={styles.timeButtonText}>
                      {localPreferences.quiet_hours.end_time}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Frequency Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Frequency</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Immediate Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive notifications as they happen
                </Text>
              </View>
              <Switch
                value={localPreferences.frequency.immediate}
                onValueChange={(value) => handlePreferenceChange('frequency.immediate', value)}
                trackColor={{ false: '#e1e5e9', true: '#FFD700' }}
                thumbColor={localPreferences.frequency.immediate ? '#000000' : '#ffffff'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Daily Digest</Text>
                <Text style={styles.settingDescription}>
                  Receive a daily summary of notifications
                </Text>
              </View>
              <Switch
                value={localPreferences.frequency.daily_digest}
                onValueChange={(value) => handlePreferenceChange('frequency.daily_digest', value)}
                trackColor={{ false: '#e1e5e9', true: '#FFD700' }}
                thumbColor={localPreferences.frequency.daily_digest ? '#000000' : '#ffffff'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Weekly Digest</Text>
                <Text style={styles.settingDescription}>
                  Receive a weekly summary of notifications
                </Text>
              </View>
              <Switch
                value={localPreferences.frequency.weekly_digest}
                onValueChange={(value) => handlePreferenceChange('frequency.weekly_digest', value)}
                trackColor={{ false: '#e1e5e9', true: '#FFD700' }}
                thumbColor={localPreferences.frequency.weekly_digest ? '#000000' : '#ffffff'}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Reset to Default</Text>
            </TouchableOpacity>

            {hasChanges && (
              <TouchableOpacity 
                style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#000000" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Time Picker Modal */}
        <Modal visible={showTimePicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.timePickerModal}>
              <Text style={styles.timePickerTitle}>
                Set {selectedTimeField === 'start_time' ? 'Start' : 'End'} Time
              </Text>
              <TextInput
                style={styles.timeInput}
                value={timeInput}
                onChangeText={setTimeInput}
                placeholder="HH:MM"
                placeholderTextColor="#8e8e93"
                keyboardType="numeric"
                maxLength={5}
              />
              <View style={styles.timePickerButtons}>
                <TouchableOpacity 
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.timePickerButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.timePickerButton, styles.timePickerButtonPrimary]}
                  onPress={handleTimeSave}
                >
                  <Text style={[styles.timePickerButtonText, styles.timePickerButtonTextPrimary]}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

const getCategoryDescription = (category: string): string => {
  const descriptions: { [key: string]: string } = {
    events: 'Notifications about sports events and activities',
    friends: 'Notifications about friends and social activities',
    messages: 'Chat messages and conversations',
    reminders: 'Event reminders and notifications',
    system: 'System announcements and updates',
    marketing: 'Promotional content and offers',
  };
  return descriptions[category] || '';
};

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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#c62828',
  },
  errorDismiss: {
    fontSize: 18,
    color: '#c62828',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#333333',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e1e5e9',
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  testButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  timeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  resetButton: {
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  saveButton: {
    paddingVertical: 12,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerModal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  timeInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
    marginBottom: 20,
    textAlign: 'center',
  },
  timePickerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  timePickerButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  timePickerButtonPrimary: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  timePickerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  timePickerButtonTextPrimary: {
    color: '#000000',
    fontWeight: '600',
  },
});
