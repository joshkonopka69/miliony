import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Switch,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useModeration } from '../../hooks/useModeration';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { SecurityConfig } from '../../services/securityService';

interface SecuritySettingsScreenProps {
  navigation: any;
}

export default function SecuritySettingsScreen({ navigation }: SecuritySettingsScreenProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    getSecurityConfig,
    updateSecurityConfig,
    getSecurityAnalytics,
    securityAnalytics,
    isLoading,
    securityError,
    clearSecurityError,
  } = useModeration();

  const [securityConfig, setSecurityConfig] = useState<SecurityConfig[]>([]);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSecurityConfig();
    loadSecurityAnalytics();
  }, []);

  const loadSecurityConfig = async () => {
    try {
      setIsLoadingConfig(true);
      const config = await getSecurityConfig();
      setSecurityConfig(config);
    } catch (error) {
      console.error('Error loading security config:', error);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const loadSecurityAnalytics = async () => {
    try {
      await getSecurityAnalytics();
    } catch (error) {
      console.error('Error loading security analytics:', error);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setSecurityConfig(prev => 
      prev.map(config => 
        config.key === key ? { ...config, value } : config
      )
    );
  };

  const handleSaveConfig = async (key: string, value: any) => {
    try {
      setIsSaving(true);
      const success = await updateSecurityConfig(key, value);
      
      if (success) {
        Alert.alert('Success', 'Security configuration updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update security configuration');
      }
    } catch (error) {
      console.error('Error saving security config:', error);
      Alert.alert('Error', 'Failed to update security configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const renderConfigItem = (config: SecurityConfig) => {
    const isBoolean = typeof config.value === 'boolean';
    const isNumber = typeof config.value === 'number';
    const isString = typeof config.value === 'string';

    return (
      <View key={config.key} style={styles.configItem}>
        <View style={styles.configHeader}>
          <Text style={styles.configKey}>{config.key}</Text>
          <Text style={styles.configDescription}>{config.description}</Text>
        </View>

        <View style={styles.configValue}>
          {isBoolean && (
            <Switch
              value={config.value}
              onValueChange={(value) => {
                handleConfigChange(config.key, value);
                handleSaveConfig(config.key, value);
              }}
              trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
              thumbColor={config.value ? '#ffffff' : '#ffffff'}
            />
          )}

          {isNumber && (
            <View style={styles.numberInputContainer}>
              <TextInput
                style={styles.numberInput}
                value={config.value.toString()}
                onChangeText={(text) => {
                  const numValue = parseInt(text) || 0;
                  handleConfigChange(config.key, numValue);
                }}
                onBlur={() => handleSaveConfig(config.key, config.value)}
                keyboardType="numeric"
                placeholder="Enter number"
              />
            </View>
          )}

          {isString && (
            <TextInput
              style={styles.stringInput}
              value={config.value}
              onChangeText={(text) => handleConfigChange(config.key, text)}
              onBlur={() => handleSaveConfig(config.key, config.value)}
              placeholder="Enter value"
            />
          )}
        </View>
      </View>
    );
  };

  const renderAnalyticsCard = () => {
    if (!securityAnalytics) return null;

    return (
      <View style={styles.analyticsCard}>
        <Text style={styles.analyticsTitle}>Security Analytics</Text>
        
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsLabel}>Total Threats:</Text>
          <Text style={styles.analyticsValue}>{securityAnalytics.total_threats}</Text>
        </View>

        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsLabel}>Blocked IPs:</Text>
          <Text style={styles.analyticsValue}>{securityAnalytics.blocked_ips}</Text>
        </View>

        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsLabel}>Rate Limited Requests:</Text>
          <Text style={styles.analyticsValue}>{securityAnalytics.rate_limited_requests}</Text>
        </View>

        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsLabel}>Security Score:</Text>
          <Text style={[
            styles.analyticsValue,
            { color: getSecurityScoreColor(securityAnalytics.security_score) }
          ]}>
            {securityAnalytics.security_score}/100
          </Text>
        </View>
      </View>
    );
  };

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return '#00BB00';
    if (score >= 60) return '#FFBB00';
    return '#FF4444';
  };

  const getCategoryConfigs = (category: string) => {
    return securityConfig.filter(config => config.category === category);
  };

  if (isLoading || isLoadingConfig) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading security settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Security Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderAnalyticsCard()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication Settings</Text>
          <Text style={styles.sectionDescription}>
            Configure authentication and login security
          </Text>
          
          {getCategoryConfigs('authentication').map(renderConfigItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate Limiting</Text>
          <Text style={styles.sectionDescription}>
            Configure rate limiting for API endpoints and user actions
          </Text>
          
          {getCategoryConfigs('rate_limiting').map(renderConfigItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Filtering</Text>
          <Text style={styles.sectionDescription}>
            Configure automated content filtering and moderation
          </Text>
          
          {getCategoryConfigs('content_filtering').map(renderConfigItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monitoring</Text>
          <Text style={styles.sectionDescription}>
            Configure security monitoring and alerting
          </Text>
          
          {getCategoryConfigs('monitoring').map(renderConfigItem)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Text style={styles.sectionDescription}>
            Configure security notification settings
          </Text>
          
          {getCategoryConfigs('notifications').map(renderConfigItem)}
        </View>

        {securityError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{securityError}</Text>
            <TouchableOpacity
              style={styles.clearErrorButton}
              onPress={clearSecurityError}
            >
              <Text style={styles.clearErrorText}>Clear Error</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Security settings are automatically saved when changed.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  analyticsCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  analyticsLabel: {
    fontSize: 14,
    color: '#666666',
  },
  analyticsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  configItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  configHeader: {
    marginBottom: 12,
  },
  configKey: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  configDescription: {
    fontSize: 14,
    color: '#666666',
  },
  configValue: {
    alignItems: 'flex-end',
  },
  numberInputContainer: {
    width: 100,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#000000',
    backgroundColor: '#ffffff',
    textAlign: 'center',
  },
  stringInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#000000',
    backgroundColor: '#ffffff',
    minWidth: 200,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 8,
  },
  clearErrorButton: {
    alignSelf: 'flex-start',
  },
  clearErrorText: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
});
