import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
  ActivityIndicator,
  Animated,
  TextInput,
  Modal,
} from 'react-native';
import { useAppNavigation } from '../navigation';
import { useNotificationManager } from '../hooks/useNotifications';
import { NotificationPreferences } from '../services/notificationService';

// Custom SM Logo Component
const SMLogo = ({ size = 30 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

export default function NotificationSettingsScreen() {
  const navigation = useAppNavigation();
  const {
    preferences,
    updatePreferencesWithValidation,
    resetPreferencesToDefault,
    testFCMConnection,
    getFCMStatus,
    isUpdating,
    error,
    clearError,
    requestPermissions,
    getNotificationStatistics,
  } = useNotificationManager();

  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeField, setSelectedTimeField] = useState<'start_time' | 'end_time' | null>(null);
  const [timeInput, setTimeInput] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

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

  const handleRequestPermissions = async () => {
    const success = await requestPermissions();
    if (success) {
      Alert.alert('Success', 'Notification permissions granted!');
    } else {
      Alert.alert('Error', 'Failed to request permissions. Please check your device settings.');
    }
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

  const handleShowStats = () => {
    setShowStats(true);
  };

  const fcmStatus = getFCMStatus();
  const stats = getNotificationStatistics();

  if (!localPreferences) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading notification settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <SMLogo size={30} />
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
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
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
            
            {!fcmStatus.permissionsGranted && (
              <TouchableOpacity 
                style={styles.permissionButton}
                onPress={handleRequestPermissions}
              >
                <Text style={styles.permissionButtonText}>Grant Permissions</Text>
              </TouchableOpacity>
            )}
            
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

          {/* Statistics */}
          {stats && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notification Statistics</Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalSent}</Text>
                  <Text style={styles.statLabel}>Total Sent</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalRead}</Text>
                  <Text style={styles.statLabel}>Total Read</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.readRate.toFixed(1)}%</Text>
                  <Text style={styles.statLabel}>Read Rate</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.unreadCount}</Text>
                  <Text style={styles.statLabel}>Unread</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.statsButton}
                onPress={handleShowStats}
              >
                <Text style={styles.statsButtonText}>View Detailed Statistics</Text>
              </TouchableOpacity>
            </View>
          )}

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
        </Animated.View>
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

      {/* Statistics Modal */}
      <Modal visible={showStats} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.statsModal}>
            <View style={styles.statsModalHeader}>
              <Text style={styles.statsModalTitle}>Notification Statistics</Text>
              <TouchableOpacity 
                style={styles.statsModalClose}
                onPress={() => setShowStats(false)}
              >
                <Text style={styles.statsModalCloseText}>×</Text>
              </TouchableOpacity>
            </View>
            
            {stats && (
              <ScrollView style={styles.statsModalContent}>
                <View style={styles.detailedStats}>
                  <Text style={styles.detailedStatsTitle}>By Type</Text>
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <View key={type} style={styles.statRow}>
                      <Text style={styles.statRowLabel}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                      <Text style={styles.statRowValue}>{count}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 1,
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
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
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
  permissionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  statsButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  statsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  actionButtons: {
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
  statsModal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  statsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statsModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statsModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsModalCloseText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: 'bold',
  },
  statsModalContent: {
    padding: 20,
  },
  detailedStats: {
    marginBottom: 20,
  },
  detailedStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  statRowLabel: {
    fontSize: 14,
    color: '#333333',
  },
  statRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
});
