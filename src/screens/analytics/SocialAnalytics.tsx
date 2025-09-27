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

export default function SocialAnalytics() {
  const { t } = useTranslation();
  const {
    socialAnalytics,
    isLoading,
    error,
    getSocialAnalytics,
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
    loadSocialAnalytics();
  }, [selectedFilters]);

  const loadSocialAnalytics = async () => {
    try {
      await getSocialAnalytics(selectedFilters);
    } catch (error) {
      console.error('Error loading social analytics:', error);
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
      // Implementation would export social analytics data
      Alert.alert('Export', `Social analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to export social analytics');
    }
  };

  const renderNetworkMetrics = () => {
    if (!socialAnalytics) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network Metrics</Text>
        <View style={styles.metricsGrid}>
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

  const renderEngagementMetrics = () => {
    if (!socialAnalytics) return null;

    const { social_engagement } = socialAnalytics;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Social Engagement</Text>
        <View style={styles.engagementGrid}>
          <MetricsCard
            title="Friend Requests Sent"
            value={social_engagement.friend_requests_sent}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Friend Requests Accepted"
            value={social_engagement.friend_requests_accepted}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Group Invitations Sent"
            value={social_engagement.group_invitations_sent}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Group Invitations Accepted"
            value={social_engagement.group_invitations_accepted}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Messages Sent"
            value={social_engagement.messages_sent}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Messages Received"
            value={social_engagement.messages_received}
            change={0}
            changeType="stable"
            trend="stable"
          />
        </View>
      </View>
    );
  };

  const renderNetworkAnalysis = () => {
    if (!socialAnalytics) return null;

    const { network_analysis } = socialAnalytics;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network Analysis</Text>
        <View style={styles.networkGrid}>
          <MetricsCard
            title="Avg Friends per User"
            value={network_analysis.average_friends_per_user.toFixed(1)}
            change={0}
            changeType="stable"
            trend="stable"
          />
          <MetricsCard
            title="Avg Groups per User"
            value={network_analysis.average_groups_per_user.toFixed(1)}
            change={0}
            changeType="stable"
            trend="stable"
          />
        </View>
      </View>
    );
  };

  const renderMostConnectedUsers = () => {
    if (!socialAnalytics || !socialAnalytics.network_analysis.most_connected_users.length) return null;

    const usersData = socialAnalytics.network_analysis.most_connected_users.map(user => ({
      label: user.user_id.substring(0, 8) + '...',
      value: user.connection_count,
    }));

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Most Connected Users</Text>
        <AnalyticsChart
          type="bar"
          title="Connection Count"
          data={usersData}
        />
      </View>
    );
  };

  const renderMostActiveGroups = () => {
    if (!socialAnalytics || !socialAnalytics.network_analysis.most_active_groups.length) return null;

    const groupsData = socialAnalytics.network_analysis.most_active_groups.map(group => ({
      label: group.group_id.substring(0, 8) + '...',
      value: group.activity_score,
    }));

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Most Active Groups</Text>
        <AnalyticsChart
          type="bar"
          title="Activity Score"
          data={groupsData}
        />
      </View>
    );
  };

  const renderContentAnalytics = () => {
    if (!socialAnalytics) return null;

    const { content_analytics } = socialAnalytics;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Content Analytics</Text>
        
        {content_analytics.most_shared_events && content_analytics.most_shared_events.length > 0 && (
          <View style={styles.contentSection}>
            <Text style={styles.contentTitle}>Most Shared Events</Text>
            <AnalyticsChart
              type="bar"
              title="Share Count"
              data={content_analytics.most_shared_events.map(event => ({
                label: event.event_id.substring(0, 8) + '...',
                value: event.share_count,
              }))}
            />
          </View>
        )}

        {content_analytics.most_active_chats && content_analytics.most_active_chats.length > 0 && (
          <View style={styles.contentSection}>
            <Text style={styles.contentTitle}>Most Active Chats</Text>
            <AnalyticsChart
              type="bar"
              title="Message Count"
              data={content_analytics.most_active_chats.map(chat => ({
                label: chat.group_id.substring(0, 8) + '...',
                value: chat.message_count,
              }))}
            />
          </View>
        )}

        {content_analytics.popular_sports && content_analytics.popular_sports.length > 0 && (
          <View style={styles.contentSection}>
            <Text style={styles.contentTitle}>Popular Sports</Text>
            <AnalyticsChart
              type="pie"
              title="Sports Participation"
              data={content_analytics.popular_sports.map(sport => ({
                label: sport.sport,
                value: sport.participation_count,
              }))}
            />
          </View>
        )}
      </View>
    );
  };

  const renderEngagementChart = () => {
    if (!socialAnalytics) return null;

    const { social_engagement } = socialAnalytics;

    const engagementData = [
      { label: 'Friend Requests', value: social_engagement.friend_requests_sent },
      { label: 'Group Invitations', value: social_engagement.group_invitations_sent },
      { label: 'Messages Sent', value: social_engagement.messages_sent },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Engagement Overview</Text>
        <AnalyticsChart
          type="pie"
          title="Social Engagement"
          data={engagementData}
        />
      </View>
    );
  };

  const renderSocialTable = () => {
    if (!socialAnalytics) return null;

    const tableData = [
      { metric: 'Total Friendships', value: socialAnalytics.total_friendships },
      { metric: 'Total Groups', value: socialAnalytics.total_groups },
      { metric: 'Group Members', value: socialAnalytics.total_group_members },
      { metric: 'Total Messages', value: socialAnalytics.total_messages },
      { metric: 'Friend Requests Sent', value: socialAnalytics.social_engagement.friend_requests_sent },
      { metric: 'Friend Requests Accepted', value: socialAnalytics.social_engagement.friend_requests_accepted },
      { metric: 'Group Invitations Sent', value: socialAnalytics.social_engagement.group_invitations_sent },
      { metric: 'Group Invitations Accepted', value: socialAnalytics.social_engagement.group_invitations_accepted },
      { metric: 'Messages Sent', value: socialAnalytics.social_engagement.messages_sent },
      { metric: 'Messages Received', value: socialAnalytics.social_engagement.messages_received },
      { metric: 'Avg Friends per User', value: socialAnalytics.network_analysis.average_friends_per_user.toFixed(1) },
      { metric: 'Avg Groups per User', value: socialAnalytics.network_analysis.average_groups_per_user.toFixed(1) },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Social Analytics Summary</Text>
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

  const renderSocialInsights = () => {
    if (!socialAnalytics) return null;

    const insights = [];
    
    const acceptanceRate = socialAnalytics.social_engagement.friend_requests_sent > 0 
      ? (socialAnalytics.social_engagement.friend_requests_accepted / socialAnalytics.social_engagement.friend_requests_sent) * 100
      : 0;
    
    if (acceptanceRate > 70) {
      insights.push('High friend request acceptance rate indicates good social connections');
    } else if (acceptanceRate < 30) {
      insights.push('Low friend request acceptance rate - consider improving user matching');
    }
    
    const groupAcceptanceRate = socialAnalytics.social_engagement.group_invitations_sent > 0
      ? (socialAnalytics.social_engagement.group_invitations_accepted / socialAnalytics.social_engagement.group_invitations_sent) * 100
      : 0;
    
    if (groupAcceptanceRate > 60) {
      insights.push('High group invitation acceptance rate shows good group engagement');
    } else if (groupAcceptanceRate < 20) {
      insights.push('Low group invitation acceptance rate - consider improving group relevance');
    }
    
    if (socialAnalytics.network_analysis.average_friends_per_user > 10) {
      insights.push('High average friends per user indicates strong social connections');
    } else if (socialAnalytics.network_analysis.average_friends_per_user < 3) {
      insights.push('Low average friends per user - consider encouraging more social connections');
    }
    
    if (socialAnalytics.total_messages > 1000) {
      insights.push('High message volume indicates active social engagement');
    }

    if (insights.length === 0) {
      insights.push('No specific insights available');
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Social Insights</Text>
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
          <Text style={styles.errorTitle}>Error Loading Social Analytics</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSocialAnalytics}>
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
        <Text style={styles.title}>Social Analytics</Text>
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
        {renderNetworkMetrics()}
        {renderEngagementMetrics()}
        {renderNetworkAnalysis()}
        {renderMostConnectedUsers()}
        {renderMostActiveGroups()}
        {renderContentAnalytics()}
        {renderEngagementChart()}
        {renderSocialInsights()}
        {renderSocialTable()}
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
  engagementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  networkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contentSection: {
    marginBottom: 20,
  },
  contentTitle: {
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
