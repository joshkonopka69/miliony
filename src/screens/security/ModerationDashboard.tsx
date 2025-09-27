import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useModeration } from '../../hooks/useModeration';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';

interface ModerationDashboardProps {
  navigation: any;
}

export default function ModerationDashboard({ navigation }: ModerationDashboardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
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
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        getModerationAnalytics(),
        getReportAnalytics(),
        getSecurityAnalytics(),
        getModerationQueue(),
        getAppealRequests(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {moderationAnalytics?.total_reports || 0}
          </Text>
          <Text style={styles.metricLabel}>Total Reports</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {moderationAnalytics?.resolved_reports || 0}
          </Text>
          <Text style={styles.metricLabel}>Resolved Reports</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {moderationAnalytics?.pending_reports || 0}
          </Text>
          <Text style={styles.metricLabel}>Pending Reports</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>
            {moderationAnalytics?.auto_moderation_rate ? 
              `${(moderationAnalytics.auto_moderation_rate * 100).toFixed(0)}%` : '0%'}
          </Text>
          <Text style={styles.metricLabel}>Auto Moderation Rate</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Moderation Queue</Text>
        <View style={styles.queueStats}>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appeals</Text>
        <View style={styles.appealsStats}>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Status</Text>
        <View style={styles.securityCard}>
          <Text style={styles.securityScore}>
            Security Score: {securityAnalytics?.security_score || 0}/100
          </Text>
          <Text style={styles.securityThreats}>
            Active Threats: {securityAnalytics?.total_threats || 0}
          </Text>
          <Text style={styles.securityBlocked}>
            Blocked IPs: {securityAnalytics?.blocked_ips || 0}
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderReportsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Report Analytics</Text>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsText}>
            Total Reports: {reportAnalytics?.total_reports || 0}
          </Text>
          <Text style={styles.analyticsText}>
            Resolution Rate: {reportAnalytics?.resolution_efficiency || 0}%
          </Text>
          <Text style={styles.analyticsText}>
            User Satisfaction: {reportAnalytics?.user_satisfaction || 0}%
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reports by Category</Text>
        {reportAnalytics?.reports_by_category.map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <Text style={styles.categoryName}>{category.category}</Text>
            <Text style={styles.categoryCount}>{category.count}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reports by Status</Text>
        {reportAnalytics?.reports_by_status.map((status, index) => (
          <View key={index} style={styles.statusItem}>
            <Text style={styles.statusName}>{status.status}</Text>
            <Text style={styles.statusCount}>{status.count}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderSecurityTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Analytics</Text>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsText}>
            Total Threats: {securityAnalytics?.total_threats || 0}
          </Text>
          <Text style={styles.analyticsText}>
            Blocked IPs: {securityAnalytics?.blocked_ips || 0}
          </Text>
          <Text style={styles.analyticsText}>
            Rate Limited Requests: {securityAnalytics?.rate_limited_requests || 0}
          </Text>
          <Text style={styles.analyticsText}>
            Security Score: {securityAnalytics?.security_score || 0}/100
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Threats by Type</Text>
        {securityAnalytics?.threats_by_type.map((threat, index) => (
          <View key={index} style={styles.threatItem}>
            <Text style={styles.threatType}>{threat.type}</Text>
            <Text style={styles.threatCount}>{threat.count}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Threats by Severity</Text>
        {securityAnalytics?.threats_by_severity.map((severity, index) => (
          <View key={index} style={styles.severityItem}>
            <Text style={styles.severityLevel}>{severity.severity}</Text>
            <Text style={styles.severityCount}>{severity.count}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderQueueTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Moderation Queue</Text>
        <View style={styles.queueCard}>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Queue by Priority</Text>
        <View style={styles.priorityStats}>
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
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverviewTab();
      case 'reports':
        return renderReportsTab();
      case 'security':
        return renderSecurityTab();
      case 'queue':
        return renderQueueTab();
      default:
        return renderOverviewTab();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
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
        <Text style={styles.title}>Moderation Dashboard</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshButtonText}>↻</Text>
        </TouchableOpacity>
      </View>

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
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    margin: 20,
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
  },
  tabContent: {
    flex: 1,
    padding: 20,
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  queueStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
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
  securityCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  securityScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  securityThreats: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  securityBlocked: {
    fontSize: 14,
    color: '#666666',
  },
  analyticsCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  analyticsText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
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
  },
  queueText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  priorityStats: {
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
