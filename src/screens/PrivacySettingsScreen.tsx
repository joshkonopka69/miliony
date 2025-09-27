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
} from 'react-native';
import { useAppNavigation } from '../navigation';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from '../contexts/TranslationContext';

// Custom SM Logo Component
const SMLogo = ({ size = 30 }: { size?: number }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <View style={styles.logoBackground}>
      <Text style={[styles.logoText, { fontSize: size * 0.4 }]}>SM</Text>
    </View>
  </View>
);

export default function PrivacySettingsScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const {
    userState,
    updatePrivacySettings,
    updateConsentSettings,
    refreshPrivacySettings,
    exportUserData,
    deleteUserData,
    isUpdating,
    error,
    clearError,
  } = useUser();

  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: 'public',
    show_location: true,
    show_activity: true,
    show_friends: true,
    show_online_status: true,
    allow_friend_requests: true,
    allow_event_invites: true,
    allow_messages: true,
    show_birthday: false,
    show_phone: false,
    show_email: false,
  });

  const [consentSettings, setConsentSettings] = useState({
    analytics_consent: true,
    marketing_consent: false,
    location_consent: true,
    notification_consent: true,
    data_processing_consent: true,
    third_party_sharing_consent: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

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
    if (userState.privacySettings) {
      setPrivacySettings(prev => ({
        ...prev,
        ...userState.privacySettings,
      }));
    }
    if (userState.consentSettings) {
      setConsentSettings(prev => ({
        ...prev,
        ...userState.consentSettings,
      }));
    }
  }, [userState.privacySettings, userState.consentSettings]);

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

  const handlePrivacyChange = (key: string, value: any) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleConsentChange = (key: string, value: any) => {
    setConsentSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const privacySuccess = await updatePrivacySettings(privacySettings);
    const consentSuccess = await updateConsentSettings(consentSettings);

    if (privacySuccess && consentSuccess) {
      setHasChanges(false);
      Alert.alert('Success', 'Privacy settings updated successfully!');
    } else {
      Alert.alert('Error', 'Failed to update privacy settings. Please try again.');
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Your Data',
      'This will create a downloadable file containing all your data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            const data = await exportUserData();
            if (data) {
              Alert.alert('Success', 'Your data has been exported successfully!');
            } else {
              Alert.alert('Error', 'Failed to export data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your data and cannot be undone. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteUserData();
            if (success) {
              Alert.alert('Success', 'All your data has been deleted.');
              navigation.navigate('Auth');
            } else {
              Alert.alert('Error', 'Failed to delete data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderPrivacySection = (title: string, settings: any[], category: 'privacy' | 'consent') => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {settings.map((setting) => (
        <View key={setting.key} style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{setting.label}</Text>
            <Text style={styles.settingDescription}>{setting.description}</Text>
          </View>
          <Switch
            value={category === 'privacy' ? privacySettings[setting.key] : consentSettings[setting.key]}
            onValueChange={(value) => 
              category === 'privacy' 
                ? handlePrivacyChange(setting.key, value)
                : handleConsentChange(setting.key, value)
            }
            trackColor={{ false: '#e1e5e9', true: '#FFD700' }}
            thumbColor={category === 'privacy' ? privacySettings[setting.key] : consentSettings[setting.key] ? '#000000' : '#ffffff'}
          />
        </View>
      ))}
    </View>
  );

  const renderSelectSetting = (key: string, label: string, description: string, options: string[], currentValue: string) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <View style={styles.selectContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.selectOption,
              currentValue === option && styles.selectOptionSelected
            ]}
            onPress={() => handlePrivacyChange(key, option)}
          >
            <Text style={[
              styles.selectOptionText,
              currentValue === option && styles.selectOptionTextSelected
            ]}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Settings</Text>
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
          {/* Profile Visibility */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Visibility</Text>
            {renderSelectSetting(
              'profile_visibility',
              'Who can see your profile',
              'Control who can view your profile information',
              ['public', 'friends', 'private'],
              privacySettings.profile_visibility
            )}
          </View>

          {/* Privacy Settings */}
          {renderPrivacySection('Privacy Controls', [
            {
              key: 'show_location',
              label: 'Show Location',
              description: 'Allow others to see your location',
            },
            {
              key: 'show_activity',
              label: 'Show Activity',
              description: 'Allow others to see your activity status',
            },
            {
              key: 'show_friends',
              label: 'Show Friends',
              description: 'Allow others to see your friends list',
            },
            {
              key: 'show_online_status',
              label: 'Show Online Status',
              description: 'Show when you\'re online',
            },
            {
              key: 'allow_friend_requests',
              label: 'Allow Friend Requests',
              description: 'Let others send you friend requests',
            },
            {
              key: 'allow_event_invites',
              label: 'Allow Event Invites',
              description: 'Let others invite you to events',
            },
            {
              key: 'allow_messages',
              label: 'Allow Messages',
              description: 'Let others send you messages',
            },
          ], 'privacy')}

          {/* Personal Information */}
          {renderPrivacySection('Personal Information', [
            {
              key: 'show_birthday',
              label: 'Show Birthday',
              description: 'Display your birthday on your profile',
            },
            {
              key: 'show_phone',
              label: 'Show Phone Number',
              description: 'Display your phone number on your profile',
            },
            {
              key: 'show_email',
              label: 'Show Email',
              description: 'Display your email on your profile',
            },
          ], 'privacy')}

          {/* Consent Settings */}
          {renderPrivacySection('Data & Privacy Consent', [
            {
              key: 'analytics_consent',
              label: 'Analytics',
              description: 'Help us improve the app with anonymous usage data',
            },
            {
              key: 'marketing_consent',
              label: 'Marketing',
              description: 'Receive promotional emails and notifications',
            },
            {
              key: 'location_consent',
              label: 'Location Services',
              description: 'Allow the app to access your location for features',
            },
            {
              key: 'notification_consent',
              label: 'Notifications',
              description: 'Receive push notifications from the app',
            },
            {
              key: 'data_processing_consent',
              label: 'Data Processing',
              description: 'Allow processing of your data for app functionality',
            },
            {
              key: 'third_party_sharing_consent',
              label: 'Third-Party Sharing',
              description: 'Allow sharing data with trusted third parties',
            },
          ], 'consent')}

          {/* Data Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            
            <TouchableOpacity 
              style={styles.dataActionButton}
              onPress={handleExportData}
            >
              <Text style={styles.dataActionIcon}>📥</Text>
              <View style={styles.dataActionInfo}>
                <Text style={styles.dataActionTitle}>Export Your Data</Text>
                <Text style={styles.dataActionDescription}>
                  Download a copy of all your data
                </Text>
              </View>
              <Text style={styles.dataActionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.dataActionButton, styles.deleteDataButton]}
              onPress={handleDeleteData}
            >
              <Text style={styles.dataActionIcon}>🗑️</Text>
              <View style={styles.dataActionInfo}>
                <Text style={[styles.dataActionTitle, styles.deleteDataTitle]}>
                  Delete All Data
                </Text>
                <Text style={[styles.dataActionDescription, styles.deleteDataDescription]}>
                  Permanently delete all your data
                </Text>
              </View>
              <Text style={styles.dataActionArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          {hasChanges && (
            <TouchableOpacity 
              style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
              onPress={handleSave}
              activeOpacity={0.7}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
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
  selectContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    backgroundColor: '#ffffff',
  },
  selectOptionSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  selectOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  selectOptionTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  dataActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  deleteDataButton: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  dataActionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dataActionInfo: {
    flex: 1,
  },
  dataActionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  deleteDataTitle: {
    color: '#c62828',
  },
  dataActionDescription: {
    fontSize: 14,
    color: '#666666',
  },
  deleteDataDescription: {
    color: '#c62828',
  },
  dataActionArrow: {
    fontSize: 18,
    color: '#666666',
    fontWeight: 'bold',
  },
  saveButton: {
    height: 52,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});
