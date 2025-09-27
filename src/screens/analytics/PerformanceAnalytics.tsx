import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useTranslation } from '../../contexts/TranslationContext';
import { MetricsCard } from '../../components/analytics/MetricsCard';
import { AnalyticsChart } from '../../components/analytics/AnalyticsChart';
import { DateRangePicker } from '../../components/analytics/DateRangePicker';
import { ExportButton } from '../../components/analytics/ExportButton';
import { AnalyticsTable } from '../../components/analytics/AnalyticsTable';
import { AnalyticsFilters } from '../../services/analyticsService';

export default function PerformanceAnalytics() {
  const { t } = useTranslation();
  const {
    appAnalytics,
    isLoading,
    error,
    getAppAnalytics,
    refreshAnalytics,
    clearError,
  } = useAnalytics();

  const [selectedDateRange, setSelectedDateRange] = useState<{
    start_date: string;
    end_date: string;
  }>({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date().toISOString(),
  });

  const [selectedFilters, setSelectedFilters] = useState<AnalyticsFilters>({
    date_range: selectedDateRange,
  });

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPerformanceAnalytics();
  }, [selectedFilters]);

  const loadPerformanceAnalytics = async () => {
    try {
      await getAppAnalytics(selectedFilters);
    } catch (error) {
      console.error('Error loading performance analytics:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAnalytics(selectedFilters);
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDateRangeChange = (dateRange: { start_date: string; end_date: string }) => {
    setSelectedDateRange(dateRange);
    setSelectedFilters(prev => ({
      ...prev,
      date_range: dateRange,
    }));
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'excel' | 'json') => {
    try {
      // Implementation would export performance analytics data
      Alert.alert('Export', `Performance analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to export performance analytics');
    }
  };

  const renderUserMetrics = () => {
    if (!appAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Metrics</Text>
        <View style={styles.metricsGrid}>
          <MetricsCard
            title="Total Users"
            value={appAnalytics.total_users}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Active Users"
            value={appAnalytics.active_users}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="New Users"
            value={appAnalytics.new_users}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Active Rate"
            value={`${((appAnalytics.active_users / appAnalytics.total_users) * 100).toFixed(1)}%`}
            change={0}
            changeType="stable"
            trend="stable"
          />
        </View>
      </View>
    );
  };

  const renderRetentionMetrics = () => {
    if (!appAnalytics) return null;

    const { user_retention } = appAnalytics;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Retention</Text>
        <View style={styles.retentionGrid}>
          <MetricsCard
            title="Day 1 Retention"
            value={`${user_retention.day_1}%`}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Day 7 Retention"
            value={`${user_retention.day_7}%`}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Day 30 Retention"
            value={`${user_retention.day_30}%`}
            change={0}
            changeType="stable"
            trend="stable"
          />
        </View>
      </View>
    );
  };

  const renderAppUsageMetrics = () => {
    if (!appAnalytics) return null;

    const { app_usage } = appAnalytics;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Usage</Text>
        <View style={styles.usageGrid}>
          <MetricsCard
            title="Total Sessions"
            value={app_usage.total_sessions}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Avg Session Duration"
            value={`${app_usage.average_session_duration}min`}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Sessions per User"
            value={app_usage.sessions_per_user.toFixed(1)}
            change={0}
            changeType="stable"
            trend="stable"
          />
        </View>
      </View>
    );
  };

  const renderFeatureUsage = () => {
    if (!appAnalytics) return null;

    const { feature_usage } = appAnalytics;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feature Usage</Text>
        <View style={styles.featureGrid}>
          <MetricsCard
            title="Events Created"
            value={feature_usage.events_created}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Events Attended"
            value={feature_usage.events_attended}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Friends Added"
            value={feature_usage.friends_added}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Groups Created"
            value={feature_usage.groups_created}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Messages Sent"
            value={feature_usage.messages_sent}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Check-ins"
            value={feature_usage.check_ins}
            change={0}
            changeType="stable"
            trend="stable"
          />
        </View>
      </View>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!appAnalytics) return null;

    const { performance_metrics } = appAnalytics;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.performanceGrid}>
          <MetricsCard
            title="Avg Load Time"
            value={`${performance_metrics.average_load_time}ms`}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Crash Rate"
            value={`${performance_metrics.crash_rate}%`}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Error Rate"
            value={`${performance_metrics.error_rate}%`}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="API Response Time"
            value={`${performance_metrics.api_response_time}ms`}
            change={0}
            changeType="stable"
            trend="stable"
          />
        </View>
      </View>
    );
  };

  const renderDeviceAnalytics = () => {
    if (!appAnalytics) return null;

    const { device_analytics } = appAnalytics;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Analytics</Text>
        
        {device_analytics.platform && device_analytics.platform.length > 0 && (
          <View style={styles.deviceSection}>
            <Text style={styles.deviceTitle}>Platform Distribution</Text>
            <AnalyticsChart
              type="pie"
              title="Platform Usage"
              data={device_analytics.platform.map(platform => ({
                label: platform.platform,
                value: platform.count,
              }))}
            />
          </View>
        )}

        {device_analytics.os_version && device_analytics.os_version.length > 0 && (
          <View style={styles.deviceSection}>
            <Text style={styles.deviceTitle}>OS Version Distribution</Text>
            <AnalyticsChart
              type="bar"
              title="OS Version Usage"
              data={device_analytics.os_version.map(os => ({
                label: os.version,
                value: os.count,
              }))}
            />
          </View>
        )}

        {device_analytics.app_version && device_analytics.app_version.length > 0 && (
          <View style={styles.deviceSection}>
            <Text style={styles.deviceTitle}>App Version Distribution</Text>
            <AnalyticsChart
              type="bar"
              title="App Version Usage"
              data={device_analytics.app_version.map(version => ({
                label: version.version,
                value: version.count,
              }))}
            />
          </View>
        )}
      </View>
    );
  };

  const renderGeographicDistribution = () => {
    if (!appAnalytics || !appAnalytics.geographic_distribution.length) return null;

    const geoData = appAnalytics.geographic_distribution.map(country => ({
      label: country.country,
      value: country.count,
    }));

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Geographic Distribution</Text>
        <AnalyticsChart
          type="pie"
          title="Users by Country"
          data={geoData}
        />
      </View>
    );
  };

  const renderPerformanceChart = () => {
    if (!appAnalytics) return null;

    const { performance_metrics } = appAnalytics;

    const performanceData = [
      { label: 'Load Time', value: performance_metrics.average_load_time },
      { label: 'Crash Rate', value: performance_metrics.crash_rate },
      { label: 'Error Rate', value: performance_metrics.error_rate },
      { label: 'API Response', value: performance_metrics.api_response_time },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        <AnalyticsChart
          type="bar"
          title="Performance Metrics"
          data={performanceData}
        />
      </View>
    );
  };

  const renderFeatureUsageChart = () => {
    if (!appAnalytics) return null;

    const { feature_usage } = appAnalytics;

    const featureData = [
      { label: 'Events Created', value: feature_usage.events_created },
      { label: 'Events Attended', value: feature_usage.events_attended },
      { label: 'Friends Added', value: feature_usage.friends_added },
      { label: 'Groups Created', value: feature_usage.groups_created },
      { label: 'Messages Sent', value: feature_usage.messages_sent },
      { label: 'Check-ins', value: feature_usage.check_ins },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feature Usage Overview</Text>
        <AnalyticsChart
          type="bar"
          title="Feature Usage"
          data={featureData}
        />
      </View>
    );
  };

  const renderPerformanceTable = () => {
    if (!appAnalytics) return null;

    const tableData = [
      { metric: 'Total Users', value: appAnalytics.total_users },
      { metric: 'Active Users', value: appAnalytics.active_users },
      { metric: 'New Users', value: appAnalytics.new_users },
      { metric: 'Day 1 Retention', value: `${appAnalytics.user_retention.day_1}%` },
      { metric: 'Day 7 Retention', value: `${appAnalytics.user_retention.day_7}%` },
      { metric: 'Day 30 Retention', value: `${appAnalytics.user_retention.day_30}%` },
      { metric: 'Total Sessions', value: appAnalytics.app_usage.total_sessions },
      { metric: 'Avg Session Duration', value: `${appAnalytics.app_usage.average_session_duration}min` },
      { metric: 'Sessions per User', value: appAnalytics.app_usage.sessions_per_user.toFixed(1) },
      { metric: 'Events Created', value: appAnalytics.feature_usage.events_created },
      { metric: 'Events Attended', value: appAnalytics.feature_usage.events_attended },
      { metric: 'Friends Added', value: appAnalytics.feature_usage.friends_added },
      { metric: 'Groups Created', value: appAnalytics.feature_usage.groups_created },
      { metric: 'Messages Sent', value: appAnalytics.feature_usage.messages_sent },
      { metric: 'Check-ins', value: appAnalytics.feature_usage.check_ins },
      { metric: 'Avg Load Time', value: `${appAnalytics.performance_metrics.average_load_time}ms` },
      { metric: 'Crash Rate', value: `${appAnalytics.performance_metrics.crash_rate}%` },
      { metric: 'Error Rate', value: `${appAnalytics.performance_metrics.error_rate}%` },
      { metric: 'API Response Time', value: `${appAnalytics.performance_metrics.api_response_time}ms` },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Analytics Summary</Text>
        <AnalyticsTable
          data={tableData}
          columns={[
            { key: 'metric', title: 'Metric' },
            { key: 'value', title: 'Value' },
          ]}
        />
      </View>
    );
  };

  const renderPerformanceInsights = () => {
    if (!appAnalytics) return null;

    const insights = [];
    
    if (appAnalytics.user_retention.day_7 > 50) {
      insights.push('Good 7-day retention rate indicates strong user engagement');
    } else if (appAnalytics.user_retention.day_7 < 30) {
      insights.push('Low 7-day retention rate - consider improving onboarding');
    }
    
    if (appAnalytics.performance_metrics.crash_rate < 2) {
      insights.push('Low crash rate indicates good app stability');
    } else if (appAnalytics.performance_metrics.crash_rate > 5) {
      insights.push('High crash rate - consider addressing stability issues');
    }
    
    if (appAnalytics.performance_metrics.error_rate < 1) {
      insights.push('Low error rate indicates good API reliability');
    } else if (appAnalytics.performance_metrics.error_rate > 3) {
      insights.push('High error rate - consider improving API reliability');
    }
    
    if (appAnalytics.performance_metrics.average_load_time < 1000) {
      insights.push('Fast load times indicate good performance');
    } else if (appAnalytics.performance_metrics.average_load_time > 3000) {
      insights.push('Slow load times - consider performance optimization');
    }
    
    if (appAnalytics.app_usage.average_session_duration > 10) {
      insights.push('Long session duration indicates good user engagement');
    } else if (appAnalytics.app_usage.average_session_duration < 3) {
      insights.push('Short session duration - consider improving user experience');
    }

    if (insights.length === 0) {
      insights.push('No specific insights available');
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Insights</Text>
        <View style={styles.insightsContainer}>
          {insights.map((insight, index) => (
            <Text key={index} style={styles.insightText}>
              • {insight}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error Loading Performance Analytics</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPerformanceAnalytics}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Performance Analytics</Text>
        <ExportButton onExport={handleExport} />
      </View>

      <DateRangePicker
        dateRange={selectedDateRange}
        onDateRangeChange={handleDateRangeChange}
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderUserMetrics()}
        {renderRetentionMetrics()}
        {renderAppUsageMetrics()}
        {renderFeatureUsage()}
        {renderPerformanceMetrics()}
        {renderDeviceAnalytics()}
        {renderGeographicDistribution()}
        {renderPerformanceChart()}
        {renderFeatureUsageChart()}
        {renderPerformanceInsights()}
        {renderPerformanceTable()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  retentionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  usageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  deviceSection: {
    marginBottom: 20,
  },
  deviceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 12,
  },
  insightsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
});
