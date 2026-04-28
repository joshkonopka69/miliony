import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Switch,
} from 'react-native';
import { useAppNavigation } from '../navigation';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import { privacySettingsService, PrivacySettings } from '../services/privacySettingsService';
import { useToast } from '../components/ToastProvider';

export default function PrivacySettingsScreen() {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showError } = useToast();
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadPrivacySettings();

    // Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadPrivacySettings = async () => {
    if (!user?.id) return;

    try {
      const privacySettings = await privacySettingsService.getOrCreatePrivacySettings(user.id);
      setSettings(privacySettings);
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      showError('Failed to load privacy settings', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof PrivacySettings, value: any) => {
    if (!user?.id || !settings) return;

    try {
      const success = await privacySettingsService.updatePrivacySetting(user.id, key, value);
      if (success) {
        setSettings(prev => prev ? { ...prev, [key]: value } : null);
      } else {
        showError('Failed to update setting', 'Error');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      showError('Failed to update setting', 'Error');
    }
  };

  const updateDataSharing = async (key: keyof PrivacySettings['data_sharing'], value: boolean) => {
    if (!user?.id || !settings) return;

    try {
      const success = await privacySettingsService.updateDataSharingSettings(user.id, {
        [key]: value,
      });
      if (success) {
        setSettings(prev => prev ? {
          ...prev,
          data_sharing: {
            ...prev.data_sharing,
            [key]: value,
          }
        } : null);
      } else {
        showError('Failed to update data sharing setting', 'Error');
      }
    } catch (error) {
      console.error('Error updating data sharing setting:', error);
      showError('Failed to update data sharing setting', 'Error');
    }
  };

  const updateSearchVisibility = async (key: keyof PrivacySettings['search_visibility'], value: boolean) => {
    if (!user?.id || !settings) return;

    try {
      const success = await privacySettingsService.updateSearchVisibilitySettings(user.id, {
        [key]: value,
      });
      if (success) {
        setSettings(prev => prev ? {
          ...prev,
          search_visibility: {
            ...prev.search_visibility,
            [key]: value,
          }
        } : null);
      } else {
        showError('Failed to update search visibility setting', 'Error');
      }
    } catch (error) {
      console.error('Error updating search visibility setting:', error);
      showError('Failed to update search visibility setting', 'Error');
    }
  };

  const updateActivityPrivacy = async (key: keyof PrivacySettings['activity_privacy'], value: boolean) => {
    if (!user?.id || !settings) return;

    try {
      const success = await privacySettingsService.updateActivityPrivacySettings(user.id, {
        [key]: value,
      });
      if (success) {
        setSettings(prev => prev ? {
          ...prev,
          activity_privacy: {
            ...prev.activity_privacy,
            [key]: value,
          }
        } : null);
      } else {
        showError('Failed to update activity privacy setting', 'Error');
      }
    } catch (error) {
      console.error('Error updating activity privacy setting:', error);
      showError('Failed to update activity privacy setting', 'Error');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderSwitchItem = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.switchItem}>
      <View style={styles.switchContent}>
        <Text style={styles.switchTitle}>{title}</Text>
        <Text style={styles.switchDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
        thumbColor={value ? '#FFFFFF' : '#F4F3F4'}
      />
    </View>
  );

  const renderProfileVisibilitySelector = () => (
    <View style={styles.selectorItem}>
      <Text style={styles.selectorTitle}>Profile Visibility</Text>
      <Text style={styles.selectorDescription}>Control who can see your profile</Text>
      <View style={styles.selectorButtons}>
        {(['public', 'friends', 'private'] as const).map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.selectorButton,
              settings?.profile_visibility === option && styles.selectorButtonActive
            ]}
            onPress={() => updateSetting('profile_visibility', option)}
          >
            <Text style={[
              styles.selectorButtonText,
              settings?.profile_visibility === option && styles.selectorButtonTextActive
            ]}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading privacy settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!settings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load privacy settings</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPrivacySettings}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
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
          <Text style={{fontSize: 20, color: '#181611'}}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View style={styles.content}>

          {/* Profile Visibility */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Visibility</Text>
            <View style={styles.sectionContainer}>
              {renderProfileVisibilitySelector()}
            </View>
          </View>

          {/* Basic Privacy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Privacy</Text>
            <View style={styles.sectionContainer}>
              {renderSwitchItem(
                'Show Location',
                'Allow others to see your current location',
                settings.show_location,
                (value) => updateSetting('show_location', value)
              )}
              {renderSwitchItem(
                'Show Activity',
                'Display your recent activity to others',
                settings.show_activity,
                (value) => updateSetting('show_activity', value)
              )}
              {renderSwitchItem(
                'Show Friends',
                'Let others see your friends list',
                settings.show_friends,
                (value) => updateSetting('show_friends', value)
              )}
              {renderSwitchItem(
                'Show Online Status',
                'Display when you are online',
                settings.show_online_status,
                (value) => updateSetting('show_online_status', value)
              )}
            </View>
          </View>

          {/* Interaction Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interaction Settings</Text>
            <View style={styles.sectionContainer}>
              {renderSwitchItem(
                'Allow Friend Requests',
                'Let others send you friend requests',
                settings.allow_friend_requests,
                (value) => updateSetting('allow_friend_requests', value)
              )}
              {renderSwitchItem(
                'Allow Event Invites',
                'Receive invitations to events',
                settings.allow_event_invites,
                (value) => updateSetting('allow_event_invites', value)
              )}
              {renderSwitchItem(
                'Allow Messages',
                'Let others send you direct messages',
                settings.allow_messages,
                (value) => updateSetting('allow_messages', value)
              )}
            </View>
          </View>

          {/* Personal Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.sectionContainer}>
              {renderSwitchItem(
                'Show Birthday',
                'Display your birthday on your profile',
                settings.show_birthday,
                (value) => updateSetting('show_birthday', value)
              )}
              {renderSwitchItem(
                'Show Phone Number',
                'Display your phone number on your profile',
                settings.show_phone,
                (value) => updateSetting('show_phone', value)
              )}
              {renderSwitchItem(
                'Show Email',
                'Display your email address on your profile',
                settings.show_email,
                (value) => updateSetting('show_email', value)
              )}
            </View>
          </View>

          {/* Data Sharing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Sharing</Text>
            <View style={styles.sectionContainer}>
              {renderSwitchItem(
                'Analytics',
                'Help improve the app by sharing usage data',
                settings.data_sharing.analytics,
                (value) => updateDataSharing('analytics', value)
              )}
              {renderSwitchItem(
                'Marketing',
                'Receive promotional content and offers',
                settings.data_sharing.marketing,
                (value) => updateDataSharing('marketing', value)
              )}
              {renderSwitchItem(
                'Third Party',
                'Share data with third-party partners',
                settings.data_sharing.third_party,
                (value) => updateDataSharing('third_party', value)
              )}
              {renderSwitchItem(
                'Location Tracking',
                'Allow the app to track your location for features',
                settings.data_sharing.location_tracking,
                (value) => updateDataSharing('location_tracking', value)
              )}
            </View>
          </View>

          {/* Search Visibility */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Visibility</Text>
            <View style={styles.sectionContainer}>
              {renderSwitchItem(
                'Searchable by Name',
                'Allow others to find you by your name',
                settings.search_visibility.searchable_by_name,
                (value) => updateSearchVisibility('searchable_by_name', value)
              )}
              {renderSwitchItem(
                'Searchable by Email',
                'Allow others to find you by your email',
                settings.search_visibility.searchable_by_email,
                (value) => updateSearchVisibility('searchable_by_email', value)
              )}
              {renderSwitchItem(
                'Searchable by Phone',
                'Allow others to find you by your phone number',
                settings.search_visibility.searchable_by_phone,
                (value) => updateSearchVisibility('searchable_by_phone', value)
              )}
              {renderSwitchItem(
                'Appear in Suggestions',
                'Show up in friend and event suggestions',
                settings.search_visibility.appear_in_suggestions,
                (value) => updateSearchVisibility('appear_in_suggestions', value)
              )}
            </View>
          </View>

          {/* Activity Privacy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Privacy</Text>
            <View style={styles.sectionContainer}>
              {renderSwitchItem(
                'Show Events Created',
                'Display events you have created',
                settings.activity_privacy.show_events_created,
                (value) => updateActivityPrivacy('show_events_created', value)
              )}
              {renderSwitchItem(
                'Show Events Joined',
                'Display events you have joined',
                settings.activity_privacy.show_events_joined,
                (value) => updateActivityPrivacy('show_events_joined', value)
              )}
              {renderSwitchItem(
                'Show Friend Activity',
                'Display your friends\' activity',
                settings.activity_privacy.show_friend_activity,
                (value) => updateActivityPrivacy('show_friend_activity', value)
              )}
              {renderSwitchItem(
                'Show Profile Views',
                'Display who viewed your profile',
                settings.activity_privacy.show_profile_views,
                (value) => updateActivityPrivacy('show_profile_views', value)
              )}
            </View>
          </View>

        </View>
      </Animated.ScrollView>
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    fontSize: 24,
    color: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 15,
  },
  sectionContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  switchContent: {
    flex: 1,
    marginRight: 15,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  selectorItem: {
    paddingVertical: 12,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  selectorDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
  },
  selectorButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
  },
  selectorButtonActive: {
    backgroundColor: '#4CAF50',
  },
  selectorButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  selectorButtonTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});