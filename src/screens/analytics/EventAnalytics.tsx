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

export default function EventAnalytics() {
  const { t } = useTranslation();
  const {
    eventAnalytics,
    appAnalytics,
    isLoading,
    error,
    getEventAnalytics,
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
  const [eventId, setEventId] = useState('');

  useEffect(() => {
    if (eventId) {
      loadEventAnalytics();
    }
  }, [eventId, selectedFilters]);

  const loadEventAnalytics = async () => {
    if (!eventId) return;
    
    try {
      await getEventAnalytics(eventId, selectedFilters);
    } catch (error) {
      console.error('Error loading event analytics:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (eventId) {
        await getEventAnalytics(eventId, selectedFilters);
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

  const handleEventIdChange = (text: string) => {
    setEventId(text);
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'excel' | 'json') => {
    try {
      if (!eventId) {
        Alert.alert('Error', 'Please enter an event ID');
        return;
      }
      // Implementation would export event analytics data
      Alert.alert('Export', `Event analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to export event analytics');
    }
  };

  const renderEventInput = () => {
    return (
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Event ID</Text>
        <TextInput
          style={styles.textInput}
          value={eventId}
          onChangeText={handleEventIdChange}
          placeholder="Enter event ID"
          placeholderTextColor="#999999"
        />
        <TouchableOpacity
          style={[styles.loadButton, !eventId && styles.loadButtonDisabled]}
          onPress={loadEventAnalytics}
          disabled={!eventId}
        >
          <Text style={styles.loadButtonText}>Load Analytics</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEventMetrics = () => {
    if (!eventAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event Metrics</Text>
        <View style={styles.metricsGrid}>
          <MetricsCard
            title="Total Views"
            value={eventAnalytics.total_views}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Total RSVPs"
            value={eventAnalytics.total_rsvps}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Total Attendees"
            value={eventAnalytics.total_attendees}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Attendance Rate"
            value={`${eventAnalytics.attendance_rate}%`}
            change={0}
            changeType="stable"
            trend="stable"
          />
        </View>
      </View>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!eventAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.performanceGrid}>
          <MetricsCard
            title="Engagement Score"
            value={`${eventAnalytics.engagement_score}%`}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Popularity Score"
            value={`${eventAnalytics.popularity_score}%`}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Success Rate"
            value={`${eventAnalytics.success_rate}%`}
            change={0}
            changeType="stable"
            trend="stable"
          />
        </View>
      </View>
    );
  };

  const renderDemographics = () => {
    if (!eventAnalytics || !eventAnalytics.demographics) return null;

    const { demographics } = eventAnalytics;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demographics</Text>
        
        {demographics.age_groups && demographics.age_groups.length > 0 && (
          <View style={styles.demographicSection}>
            <Text style={styles.demographicTitle}>Age Groups</Text>
            <AnalyticsChart
              type="pie"
              title="Age Distribution"
              data={demographics.age_groups.map(group => ({
                label: group.range,
                value: group.count,
              }))}
            />
          </View>
        )}

        {demographics.gender_distribution && demographics.gender_distribution.length > 0 && (
          <View style={styles.demographicSection}>
            <Text style={styles.demographicTitle}>Gender Distribution</Text>
            <AnalyticsChart
              type="pie"
              title="Gender Distribution"
              data={demographics.gender_distribution.map(gender => ({
                label: gender.gender,
                value: gender.count,
              }))}
            />
          </View>
        )}

        {demographics.skill_levels && demographics.skill_levels.length > 0 && (
          <View style={styles.demographicSection}>
            <Text style={styles.demographicTitle}>Skill Levels</Text>
            <AnalyticsChart
              type="bar"
              title="Skill Level Distribution"
              data={demographics.skill_levels.map(skill => ({
                label: skill.level,
                value: skill.count,
              }))}
            />
          </View>
        )}
      </View>
    );
  };

  const renderGeographicDistribution = () => {
    if (!eventAnalytics || !eventAnalytics.geographic_distribution.length) return null;

    const geoData = eventAnalytics.geographic_distribution.map(location => ({
      label: location.city,
      value: location.count,
    }));

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Geographic Distribution</Text>
        <AnalyticsChart
          type="bar"
          title="Participants by City"
          data={geoData}
        />
      </View>
    );
  };

  const renderTimeAnalysis = () => {
    if (!eventAnalytics || !eventAnalytics.time_analysis.length) return null;

    const timeData = eventAnalytics.time_analysis.map(time => ({
      label: `${time.hour}:00`,
      value: time.count,
    }));

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time Analysis</Text>
        <AnalyticsChart
          type="line"
          title="Activity by Hour"
          data={timeData}
          xAxis="Hour"
          yAxis="Participants"
        />
      </View>
    );
  };

  const renderFeedbackScores = () => {
    if (!eventAnalytics || !eventAnalytics.feedback_scores) return null;

    const { feedback_scores } = eventAnalytics;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feedback Scores</Text>
        <View style={styles.feedbackGrid}>
          <MetricsCard
            title="Overall Rating"
            value={`${feedback_scores.overall}/5`}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Venue Rating"
            value={`${feedback_scores.venue}/5`}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Organization Rating"
            value={`${feedback_scores.organization}/5`}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Value Rating"
            value={`${feedback_scores.value}/5`}
            change={0}
            changeType="stable"
            trend="stable"
          />
        </View>
      </View>
    );
  };

  const renderEventTable = () => {
    if (!eventAnalytics) return null;

    const tableData = [
      { metric: 'Total Views', value: eventAnalytics.total_views },
      { metric: 'Total RSVPs', value: eventAnalytics.total_rsvps },
      { metric: 'Total Attendees', value: eventAnalytics.total_attendees },
      { metric: 'Attendance Rate', value: `${eventAnalytics.attendance_rate}%` },
      { metric: 'Engagement Score', value: `${eventAnalytics.engagement_score}%` },
      { metric: 'Popularity Score', value: `${eventAnalytics.popularity_score}%` },
      { metric: 'Success Rate', value: `${eventAnalytics.success_rate}%` },
      { metric: 'Overall Rating', value: `${eventAnalytics.feedback_scores.overall}/5` },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event Analytics Summary</Text>
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

  const renderEventInsights = () => {
    if (!eventAnalytics) return null;

    const insights = [];
    
    if (eventAnalytics.attendance_rate > 80) {
      insights.push('High attendance rate indicates good event promotion');
    } else if (eventAnalytics.attendance_rate < 50) {
      insights.push('Low attendance rate - consider improving event promotion');
    }
    
    if (eventAnalytics.feedback_scores.overall > 4) {
      insights.push('High satisfaction rating from participants');
    } else if (eventAnalytics.feedback_scores.overall < 3) {
      insights.push('Low satisfaction rating - consider improving event quality');
    }
    
    if (eventAnalytics.engagement_score > 70) {
      insights.push('High engagement indicates good event content');
    }

    if (insights.length === 0) {
      insights.push('No specific insights available');
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event Insights</Text>
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
          <Text style={styles.errorTitle}>Error Loading Event Analytics</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadEventAnalytics}>
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
        <Text style={styles.title}>Event Analytics</Text>
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
        {renderEventInput()}
        {renderEventMetrics()}
        {renderPerformanceMetrics()}
        {renderDemographics()}
        {renderGeographicDistribution()}
        {renderTimeAnalysis()}
        {renderFeedbackScores()}
        {renderEventInsights()}
        {renderEventTable()}
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
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  feedbackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  demographicSection: {
    marginBottom: 20,
  },
  demographicTitle: {
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
