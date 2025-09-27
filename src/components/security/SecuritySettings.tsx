import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useModeration } from '../../hooks/useModeration';
import { SecurityConfig } from '../../services/securityService';

interface SecuritySettingsProps {
  onConfigChange?: (key: string, value: any) => void;
  onSave?: (config: SecurityConfig[]) => void;
  showCategories?: boolean;
  editable?: boolean;
}

export default function SecuritySettingsComponent({
  onConfigChange,
  onSave,
  showCategories = true,
  editable = true,
}: SecuritySettingsProps) {
  const {
    getSecurityConfig,
    updateSecurityConfig,
    securityAnalytics,
    isLoading,
    securityError,
    clearSecurityError,
  } = useModeration();

  const [securityConfig, setSecurityConfig] = useState<SecurityConfig[]>([]);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadSecurityConfig();
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

  const handleConfigChange = (key: string, value: any) => {
    setSecurityConfig(prev => 
      prev.map(config => 
        config.key === key ? { ...config, value } : config
      )
    );
    onConfigChange?.(key, value);
  };

  const handleSaveConfig = async (key: string, value: any) => {
    if (!editable) return;

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

  const handleSaveAll = async () => {
    if (!editable) return;

    try {
      setIsSaving(true);
      // Save all configurations
      for (const config of securityConfig) {
        await updateSecurityConfig(config.key, config.value);
      }
      onSave?.(securityConfig);
      Alert.alert('Success', 'All security configurations saved successfully');
    } catch (error) {
      console.error('Error saving all configs:', error);
      Alert.alert('Error', 'Failed to save security configurations');
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryConfigs = (category: string) => {
    if (category === 'all') return securityConfig;
    return securityConfig.filter(config => config.category === category);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'authentication': return '#007AFF';
      case 'rate_limiting': return '#FF8800';
      case 'content_filtering': return '#FF4444';
      case 'monitoring': return '#00BB00';
      case 'notifications': return '#FFBB00';
      default: return '#666666';
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
                if (editable) {
                  handleSaveConfig(config.key, value);
                }
              }}
              disabled={!editable}
              trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
              thumbColor={config.value ? '#ffffff' : '#ffffff'}
            />
          )}

          {isNumber && (
            <View style={styles.numberInputContainer}>
              <TextInput
                style={[
                  styles.numberInput,
                  !editable && styles.disabledInput,
                ]}
                value={config.value.toString()}
                onChangeText={(text) => {
                  const numValue = parseInt(text) || 0;
                  handleConfigChange(config.key, numValue);
                }}
                onBlur={() => {
                  if (editable) {
                    handleSaveConfig(config.key, config.value);
                  }
                }}
                keyboardType="numeric"
                placeholder="Enter number"
                editable={editable}
              />
            </View>
          )}

          {isString && (
            <TextInput
              style={[
                styles.stringInput,
                !editable && styles.disabledInput,
              ]}
              value={config.value}
              onChangeText={(text) => handleConfigChange(config.key, text)}
              onBlur={() => {
                if (editable) {
                  handleSaveConfig(config.key, config.value);
                }
              }}
              placeholder="Enter value"
              editable={editable}
            />
          )}
        </View>
      </View>
    );
  };

  const renderCategorySection = (category: string) => {
    const configs = getCategoryConfigs(category);
    if (configs.length === 0) return null;

    return (
      <View key={category} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <View style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(category) },
          ]}>
            <Text style={styles.categoryBadgeText}>
              {category.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.categoryTitle}>
            {category.replace(/_/g, ' ').toUpperCase()}
          </Text>
        </View>
        
        {configs.map(renderConfigItem)}
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

  const renderCategoryFilter = () => {
    if (!showCategories) return null;

    const categories = ['all', 'authentication', 'rate_limiting', 'content_filtering', 'monitoring', 'notifications'];

    return (
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterButton,
                selectedCategory === category && styles.activeFilterButton,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedCategory === category && styles.activeFilterButtonText,
              ]}>
                {category.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (isLoading || isLoadingConfig) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading security settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderAnalyticsCard()}
      
      {renderCategoryFilter()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedCategory === 'all' ? (
          <>
            {renderCategorySection('authentication')}
            {renderCategorySection('rate_limiting')}
            {renderCategorySection('content_filtering')}
            {renderCategorySection('monitoring')}
            {renderCategorySection('notifications')}
          </>
        ) : (
          renderCategorySection(selectedCategory)
        )}

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

        {editable && (
          <View style={styles.saveContainer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                isSaving && styles.saveButtonDisabled,
              ]}
              onPress={handleSaveAll}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save All Settings</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
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
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  analyticsCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    margin: 16,
    borderRadius: 8,
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 12,
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  activeFilterButtonText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
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
  disabledInput: {
    backgroundColor: '#F5F5F5',
    color: '#999999',
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
  saveContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
