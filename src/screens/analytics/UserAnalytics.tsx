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
  TextInput,
} from 'react-native';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useTranslation } from '../../contexts/TranslationContext';
import { MetricsCard } from '../../components/analytics/MetricsCard';
import { AnalyticsChart } from '../../components/analytics/AnalyticsChart';
import { DateRangePicker } from '../../components/analytics/DateRangePicker';
import { ExportButton } from '../../components/analytics/ExportButton';
import { AnalyticsTable } from '../../components/analytics/AnalyticsTable';
import { AnalyticsFilters } from '../../services/analyticsService';

export default function UserAnalytics() {
  const { t } = useTranslation();
  const {
    userAnalytics,
    appAnalytics,
    isLoading,
    error,
    getUserAnalytics,
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
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (userId) {
      loadUserAnalytics();
    }
  }, [userId, selectedFilters]);

  const loadUserAnalytics = async () => {
    if (!userId) return;
    
    try {
      await getUserAnalytics(userId, selectedFilters);
    } catch (error) {
      console.error('Error loading user analytics:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (userId) {
        await getUserAnalytics(userId, selectedFilters);
      } else {
        await refreshAnalytics(selectedFilters);
      }
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

  const handleUserIdChange = (text: string) => {
    setUserId(text);
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'excel' | 'json') => {
    try {
      if (!userId) {
        Alert.alert('Error', 'Please enter a user ID');
        return;
      }
      // Implementation would export user analytics data
      Alert.alert('Export', `User analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to export user analytics');
    }
  };

  const renderUserInput = () => {
    return (
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>User ID</Text>
        <TextInput
          style={styles.textInput}
          value={userId}
          onChangeText={handleUserIdChange}
          placeholder="Enter user ID"
          placeholderTextColor="#999999"
        />
        <TouchableOpacity
          style={[styles.loadButton, !userId && styles.loadButtonDisabled]}
          onPress={loadUserAnalytics}
          disabled={!userId}
        >
          <Text style={styles.loadButtonText}>Load Analytics</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderUserMetrics = () => {
    if (!userAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Metrics</Text>
        <View style={styles.metricsGrid}>
          <MetricsCard
            title="Events Created"
            value={userAnalytics.total_events_created}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Events Attended"
            value={userAnalytics.total_events_attended}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Friends"
            value={userAnalytics.total_friends}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Groups"
            value={userAnalytics.total_groups}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Messages Sent"
            value={userAnalytics.total_messages_sent}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Check-ins"
            value={userAnalytics.total_check_ins}
            change={0}
            changeType="stable"
            trend="stable"
          />
        </View>
      </View>
    );
  };

  const renderEngagementMetrics = () => {
    if (!userAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Engagement Metrics</Text>
        <View style={styles.engagementGrid}>
          <MetricsCard
            title="Engagement Score"
            value={`${userAnalytics.engagement_score}%`}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Retention Rate"
            value={`${userAnalytics.retention_rate}%`}
            change={0}
            changeType="stable"
            trend="stable"
          />
        </View>
      </View>
    );
  };

  const renderActivityChart = () => {
    if (!userAnalytics) return null;

    const activityData = userAnalytics.activity_by_day.map(day => ({
      label: day.date,
      value: day.events + day.messages + day.check_ins,
    }));

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Over Time</Text>
        <AnalyticsChart
          type="line"
          title="Daily Activity"
          data={activityData}
          xAxis="Date"
          yAxis="Activity"
        />
      </View>
    );
  };

  const renderFavoriteSports = () => {
    if (!userAnalytics || !userAnalytics.favorite_sports.length) return null;

    const sportsData = userAnalytics.favorite_sports.map(sport => ({
      label: sport.sport,
      value: sport.count,
    }));

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favorite Sports</Text>
        <AnalyticsChart
          type="pie"
          title="Sports Participation"
          data={sportsData}
        />
      </View>
    );
  };

  const renderFavoriteVenues = () => {
    if (!userAnalytics || !userAnalytics.favorite_venues.length) return null;

    const venuesData = userAnalytics.favorite_venues.map(venue => ({
      label: venue.venue,
      value: venue.count,
    }));

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favorite Venues</Text>
        <AnalyticsChart
          type="bar"
          title="Venue Check-ins"
          data={venuesData}
        />
      </View>
    );
  };

  const renderSocialConnections = () => {
    if (!userAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Social Connections</Text>
        <View style={styles.socialGrid}>
          <MetricsCard
            title="Friends Added"
            value={userAnalytics.social_connections.friends_added}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Groups Joined"
            value={userAnalytics.social_connections.groups_joined}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Invitations Sent"
            value={userAnalytics.social_connections.invitations_sent}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Invitations Received"
            value={userAnalytics.social_connections.invitations_received}
            change={0}
            changeType="stable"
            trend="stable"
          />
        </View>
      </View>
    );
  };

  const renderAppUsage = () => {
    if (!userAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Usage</Text>
        <View style={styles.usageGrid}>
          <MetricsCard
            title="Total Sessions"
            value={userAnalytics.app_usage.total_sessions}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Avg Session Duration"
            value={`${userAnalytics.app_usage.average_session_duration}min`}
            change={0}
            changeType="stable"
            trend="stable"
          />
        </View>
      </View>
    );
  };

  const renderUserTable = () => {
    if (!userAnalytics) return null;

    const tableData = [
      { metric: 'Events Created', value: userAnalytics.total_events_created },
      { metric: 'Events Attended', value: userAnalytics.total_events_attended },
      { metric: 'Friends', value: userAnalytics.total_friends },
      { metric: 'Groups', value: userAnalytics.total_groups },
      { metric: 'Messages Sent', value: userAnalytics.total_messages_sent },
      { metric: 'Check-ins', value: userAnalytics.total_check_ins },
      { metric: 'Engagement Score', value: `${userAnalytics.engagement_score}%` },
      { metric: 'Retention Rate', value: `${userAnalytics.retention_rate}%` },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Analytics Summary</Text>
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

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error Loading User Analytics</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUserAnalytics}>
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
        <Text style={styles.title}>User Analytics</Text>
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
        {renderUserInput()}
        {renderUserMetrics()}
        {renderEngagementMetrics()}
        {renderActivityChart()}
        {renderFavoriteSports()}
        {renderFavoriteVenues()}
        {renderSocialConnections()}
        {renderAppUsage()}
        {renderUserTable()}
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
  inputSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  loadButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  loadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
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
  engagementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  usageGrid: {
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
