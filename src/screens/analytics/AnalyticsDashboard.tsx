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
import { FilterPanel } from '../../components/analytics/FilterPanel';
import { AnalyticsTable } from '../../components/analytics/AnalyticsTable';
import { AnalyticsFilters } from '../../services/analyticsService';

export default function AnalyticsDashboard() {
  const { t } = useTranslation();
  const {
    dashboardAnalytics,
    appAnalytics,
    socialAnalytics,
    locationAnalytics,
    isLoading,
    error,
    getDashboardAnalytics,
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
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [selectedFilters]);

  const loadAnalytics = async () => {
    try {
      await getDashboardAnalytics(selectedFilters);
    } catch (error) {
      console.error('Error loading analytics:', error);
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

  const handleFilterChange = (filters: AnalyticsFilters) => {
    setSelectedFilters(filters);
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'excel' | 'json') => {
    try {
      // Implementation would export dashboard data
      Alert.alert('Export', `Dashboard data exported as ${format.toUpperCase()}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to export dashboard data');
    }
  };

  const renderOverviewMetrics = () => {
    if (!dashboardAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview Metrics</Text>
        <View style={styles.metricsGrid}>
          {dashboardAnalytics.overview_metrics.map((metric, index) => (
            <MetricsCard
              key={index}
              title={metric.name}
              value={metric.value}
              change={metric.change}
              changeType={metric.change_type}
              trend={metric.trend}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderCharts = () => {
    if (!dashboardAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analytics Charts</Text>
        {dashboardAnalytics.charts.map((chart, index) => (
          <View key={index} style={styles.chartContainer}>
            <AnalyticsChart
              type={chart.type}
              title={chart.title}
              data={chart.data}
              xAxis={chart.x_axis}
              yAxis={chart.y_axis}
            />
          </View>
        ))}
      </View>
    );
  };

  const renderInsights = () => {
    if (!dashboardAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights & Recommendations</Text>
        <View style={styles.insightsContainer}>
          <View style={styles.insightsSection}>
            <Text style={styles.insightsTitle}>Key Insights</Text>
            {dashboardAnalytics.insights.map((insight, index) => (
              <Text key={index} style={styles.insightText}>
                • {insight}
              </Text>
            ))}
          </View>
          <View style={styles.insightsSection}>
            <Text style={styles.insightsTitle}>Recommendations</Text>
            {dashboardAnalytics.recommendations.map((recommendation, index) => (
              <Text key={index} style={styles.recommendationText}>
                • {recommendation}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderQuickStats = () => {
    if (!appAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.quickStatsGrid}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{appAnalytics.total_users}</Text>
            <Text style={styles.quickStatLabel}>Total Users</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{appAnalytics.active_users}</Text>
            <Text style={styles.quickStatLabel}>Active Users</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{appAnalytics.new_users}</Text>
            <Text style={styles.quickStatLabel}>New Users</Text>
          </View>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              {appAnalytics.feature_usage.events_created}
            </Text>
            <Text style={styles.quickStatLabel}>Events Created</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!appAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.performanceGrid}>
          <MetricsCard
            title="Average Load Time"
            value={`${appAnalytics.performance_metrics.average_load_time}ms`}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Crash Rate"
            value={`${appAnalytics.performance_metrics.crash_rate}%`}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Error Rate"
            value={`${appAnalytics.performance_metrics.error_rate}%`}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="API Response Time"
            value={`${appAnalytics.performance_metrics.api_response_time}ms`}
            change={0}
            changeType="stable"
            trend="stable"
          />
        </View>
      </View>
    );
  };

  const renderSocialMetrics = () => {
    if (!socialAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Social Metrics</Text>
        <View style={styles.socialGrid}>
          <MetricsCard
            title="Total Friendships"
            value={socialAnalytics.total_friendships}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Total Groups"
            value={socialAnalytics.total_groups}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Group Members"
            value={socialAnalytics.total_group_members}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Total Messages"
            value={socialAnalytics.total_messages}
            change={0}
            changeType="stable"
            trend="stable"
          />
        </View>
      </View>
    );
  };

  const renderLocationMetrics = () => {
    if (!locationAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Metrics</Text>
        <View style={styles.locationGrid}>
          <MetricsCard
            title="Total Venues"
            value={locationAnalytics.total_venues}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Total Check-ins"
            value={locationAnalytics.total_check_ins}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Popular Venues"
            value={locationAnalytics.popular_venues.length}
            change={0}
            changeType="stable"
            trend="stable"
          />
        </View>
      </View>
    );
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error Loading Analytics</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAnalytics}>
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
        <Text style={styles.title}>Analytics Dashboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
          <ExportButton onExport={handleExport} />
        </View>
      </View>

      {showFilters && (
        <FilterPanel
          filters={selectedFilters}
          onFiltersChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

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
        {renderQuickStats()}
        {renderOverviewMetrics()}
        {renderCharts()}
        {renderPerformanceMetrics()}
        {renderSocialMetrics()}
        {renderLocationMetrics()}
        {renderInsights()}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
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
  chartContainer: {
    marginBottom: 20,
  },
  insightsContainer: {
    gap: 16,
  },
  insightsSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 4,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickStatItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  locationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
