import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useModeration } from '../../hooks/useModeration';

interface ModerationStatsProps {
  onStatPress?: (stat: string, value: any) => void;
  showDetails?: boolean;
  refreshInterval?: number;
}

export default function ModerationStatsComponent({
  onStatPress,
  showDetails = true,
  refreshInterval,
}: ModerationStatsProps) {
  const {
    getModerationAnalytics,
    getReportAnalytics,
    getSecurityAnalytics,
    getModerationQueue,
    getAppealRequests,
    moderationAnalytics,
    reportAnalytics,
    securityAnalytics,
    moderationQueue,
    appealRequests,
    isLoading,
    error,
    clearError,
  } = useModeration();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'reports' | 'security' | 'queue'>('overview');

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(loadStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const loadStats = async () => {
    try {
      await Promise.all([
        getModerationAnalytics(),
        getReportAnalytics(),
        getSecurityAnalytics(),
        getModerationQueue(),
        getAppealRequests(),
      ]);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleStatPress = (stat: string, value: any) => {
    onStatPress?.(stat, value);
  };

  const renderOverviewStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.metricsGrid}>
        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => handleStatPress('total_reports', moderationAnalytics?.total_reports)}
        >
          <Text style={styles.metricValue}>
            {moderationAnalytics?.total_reports || 0}
          </Text>
          <Text style={styles.metricLabel}>Total Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => handleStatPress('resolved_reports', moderationAnalytics?.resolved_reports)}
        >
          <Text style={styles.metricValue}>
            {moderationAnalytics?.resolved_reports || 0}
          </Text>
          <Text style={styles.metricLabel}>Resolved Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => handleStatPress('pending_reports', moderationAnalytics?.pending_reports)}
        >
          <Text style={styles.metricValue}>
            {moderationAnalytics?.pending_reports || 0}
          </Text>
          <Text style={styles.metricLabel}>Pending Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.metricCard}
          onPress={() => handleStatPress('auto_moderation_rate', moderationAnalytics?.auto_moderation_rate)}
        >
          <Text style={styles.metricValue}>
            {moderationAnalytics?.auto_moderation_rate ? 
              `${(moderationAnalytics.auto_moderation_rate * 100).toFixed(0)}%` : '0%'}
          </Text>
          <Text style={styles.metricLabel}>Auto Moderation Rate</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.queueStats}>
        <Text style={styles.sectionTitle}>Moderation Queue</Text>
        <View style={styles.queueRow}>
          <View style={styles.queueStat}>
            <Text style={styles.queueStatValue}>
              {moderationQueue.filter(q => q.status === 'pending').length}
            </Text>
            <Text style={styles.queueStatLabel}>Pending</Text>
          </View>
          <View style={styles.queueStat}>
            <Text style={styles.queueStatValue}>
              {moderationQueue.filter(q => q.status === 'in_review').length}
            </Text>
            <Text style={styles.queueStatLabel}>In Review</Text>
          </View>
          <View style={styles.queueStat}>
            <Text style={styles.queueStatValue}>
              {moderationQueue.filter(q => q.status === 'resolved').length}
            </Text>
            <Text style={styles.queueStatLabel}>Resolved</Text>
          </View>
        </View>
      </View>

      <View style={styles.appealsStats}>
        <Text style={styles.sectionTitle}>Appeals</Text>
        <View style={styles.appealsRow}>
          <View style={styles.appealStat}>
            <Text style={styles.appealStatValue}>
              {appealRequests.filter(a => a.status === 'pending').length}
            </Text>
            <Text style={styles.appealStatLabel}>Pending</Text>
          </View>
          <View style={styles.appealStat}>
            <Text style={styles.appealStatValue}>
              {appealRequests.filter(a => a.status === 'approved').length}
            </Text>
            <Text style={styles.appealStatLabel}>Approved</Text>
          </View>
          <View style={styles.appealStat}>
            <Text style={styles.appealStatValue}>
              {appealRequests.filter(a => a.status === 'denied').length}
            </Text>
            <Text style={styles.appealStatLabel}>Denied</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderReportsStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.analyticsCard}>
        <Text style={styles.cardTitle}>Report Analytics</Text>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsLabel}>Total Reports:</Text>
          <Text style={styles.analyticsValue}>{reportAnalytics?.total_reports || 0}</Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsLabel}>Resolution Rate:</Text>
          <Text style={styles.analyticsValue}>{reportAnalytics?.resolution_efficiency || 0}%</Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsLabel}>User Satisfaction:</Text>
          <Text style={styles.analyticsValue}>{reportAnalytics?.user_satisfaction || 0}%</Text>
        </View>
      </View>

      {showDetails && (
        <>
          <View style={styles.categoryStats}>
            <Text style={styles.sectionTitle}>Reports by Category</Text>
            {reportAnalytics?.reports_by_category.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={styles.categoryItem}
                onPress={() => handleStatPress('category', category)}
              >
                <Text style={styles.categoryName}>{category.category}</Text>
                <Text style={styles.categoryCount}>{category.count}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.statusStats}>
            <Text style={styles.sectionTitle}>Reports by Status</Text>
            {reportAnalytics?.reports_by_status.map((status, index) => (
              <TouchableOpacity
                key={index}
                style={styles.statusItem}
                onPress={() => handleStatPress('status', status)}
              >
                <Text style={styles.statusName}>{status.status}</Text>
                <Text style={styles.statusCount}>{status.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );

  const renderSecurityStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.analyticsCard}>
        <Text style={styles.cardTitle}>Security Analytics</Text>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsLabel}>Total Threats:</Text>
          <Text style={styles.analyticsValue}>{securityAnalytics?.total_threats || 0}</Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsLabel}>Blocked IPs:</Text>
          <Text style={styles.analyticsValue}>{securityAnalytics?.blocked_ips || 0}</Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsLabel}>Rate Limited Requests:</Text>
          <Text style={styles.analyticsValue}>{securityAnalytics?.rate_limited_requests || 0}</Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsLabel}>Security Score:</Text>
          <Text style={[
            styles.analyticsValue,
            { color: getSecurityScoreColor(securityAnalytics?.security_score || 0) }
          ]}>
            {securityAnalytics?.security_score || 0}/100
          </Text>
        </View>
      </View>

      {showDetails && (
        <>
          <View style={styles.threatStats}>
            <Text style={styles.sectionTitle}>Threats by Type</Text>
            {securityAnalytics?.threats_by_type.map((threat, index) => (
              <TouchableOpacity
                key={index}
                style={styles.threatItem}
                onPress={() => handleStatPress('threat_type', threat)}
              >
                <Text style={styles.threatType}>{threat.type}</Text>
                <Text style={styles.threatCount}>{threat.count}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.severityStats}>
            <Text style={styles.sectionTitle}>Threats by Severity</Text>
            {securityAnalytics?.threats_by_severity.map((severity, index) => (
              <TouchableOpacity
                key={index}
                style={styles.severityItem}
                onPress={() => handleStatPress('severity', severity)}
              >
                <Text style={styles.severityLevel}>{severity.severity}</Text>
                <Text style={styles.severityCount}>{severity.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );

  const renderQueueStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.queueCard}>
        <Text style={styles.cardTitle}>Moderation Queue</Text>
        <View style={styles.queueDetails}>
          <Text style={styles.queueText}>
            Total Items: {moderationQueue.length}
          </Text>
          <Text style={styles.queueText}>
            Pending: {moderationQueue.filter(q => q.status === 'pending').length}
          </Text>
          <Text style={styles.queueText}>
            In Review: {moderationQueue.filter(q => q.status === 'in_review').length}
          </Text>
          <Text style={styles.queueText}>
            Resolved: {moderationQueue.filter(q => q.status === 'resolved').length}
          </Text>
        </View>
      </View>

      <View style={styles.priorityStats}>
        <Text style={styles.sectionTitle}>Queue by Priority</Text>
        <View style={styles.priorityRow}>
          <View style={styles.priorityStat}>
            <Text style={styles.priorityLabel}>Urgent</Text>
            <Text style={styles.priorityValue}>
              {moderationQueue.filter(q => q.priority === 'urgent').length}
            </Text>
          </View>
          <View style={styles.priorityStat}>
            <Text style={styles.priorityLabel}>High</Text>
            <Text style={styles.priorityValue}>
              {moderationQueue.filter(q => q.priority === 'high').length}
            </Text>
          </View>
          <View style={styles.priorityStat}>
            <Text style={styles.priorityLabel}>Medium</Text>
            <Text style={styles.priorityValue}>
              {moderationQueue.filter(q => q.priority === 'medium').length}
            </Text>
          </View>
          <View style={styles.priorityStat}>
            <Text style={styles.priorityLabel}>Low</Text>
            <Text style={styles.priorityValue}>
              {moderationQueue.filter(q => q.priority === 'low').length}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return '#00BB00';
    if (score >= 60) return '#FFBB00';
    return '#FF4444';
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverviewStats();
      case 'reports':
        return renderReportsStats();
      case 'security':
        return renderSecurityStats();
      case 'queue':
        return renderQueueStats();
      default:
        return renderOverviewStats();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading moderation stats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'reports', label: 'Reports' },
            { key: 'security', label: 'Security' },
            { key: 'queue', label: 'Queue' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                selectedTab === tab.key && styles.activeTabButton,
              ]}
              onPress={() => setSelectedTab(tab.key as any)}
            >
              <Text style={[
                styles.tabButtonText,
                selectedTab === tab.key && styles.activeTabButtonText,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.clearErrorButton}
            onPress={clearError}
          >
            <Text style={styles.clearErrorText}>Clear Error</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
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
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 12,
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  activeTabButtonText: {
    color: '#ffffff',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    margin: 16,
    borderRadius: 8,
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
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  queueStats: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  queueRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  queueStat: {
    alignItems: 'center',
  },
  queueStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  queueStatLabel: {
    fontSize: 12,
    color: '#666666',
  },
  appealsStats: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  appealsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  appealStat: {
    alignItems: 'center',
  },
  appealStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  appealStatLabel: {
    fontSize: 12,
    color: '#666666',
  },
  analyticsCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
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
  categoryStats: {
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  categoryName: {
    fontSize: 14,
    color: '#000000',
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  statusStats: {
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  statusName: {
    fontSize: 14,
    color: '#000000',
  },
  statusCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  threatStats: {
    marginBottom: 16,
  },
  threatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  threatType: {
    fontSize: 14,
    color: '#000000',
  },
  threatCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF4444',
  },
  severityStats: {
    marginBottom: 16,
  },
  severityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  severityLevel: {
    fontSize: 14,
    color: '#000000',
  },
  severityCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8800',
  },
  queueCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  queueDetails: {
    marginBottom: 12,
  },
  queueText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  priorityStats: {
    marginBottom: 16,
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  priorityStat: {
    alignItems: 'center',
  },
  priorityLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  priorityValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
});
