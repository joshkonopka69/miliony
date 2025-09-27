import { useAnalytics as useAnalyticsContext } from '../contexts/AnalyticsContext';
import { 
  UserAnalytics, 
  EventAnalytics, 
  AppAnalytics, 
  SocialAnalytics, 
  LocationAnalytics, 
  AnalyticsFilters,
  AnalyticsDashboard,
  AnalyticsMetric,
  AnalyticsChart
} from '../services/analyticsService';
import { 
  ReportConfig, 
  ReportData, 
  UserReport, 
  EventReport, 
  AppReport, 
  SocialReport, 
  LocationReport, 
  CustomReport 
} from '../services/reportingService';

// Re-export the context hook for convenience
export { useAnalyticsContext as useAnalytics };

// Additional hook for analytics management
export function useAnalyticsManager() {
  const context = useAnalyticsContext();
  
  // Get analytics with validation
  const getUserAnalyticsWithValidation = async (userId: string, filters?: AnalyticsFilters): Promise<UserAnalytics | null> => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    return await context.getUserAnalytics(userId, filters);
  };

  const getEventAnalyticsWithValidation = async (eventId: string, filters?: AnalyticsFilters): Promise<EventAnalytics | null> => {
    if (!eventId) {
      throw new Error('Event ID is required');
    }
    
    return await context.getEventAnalytics(eventId, filters);
  };

  // Get analytics summary
  const getAnalyticsSummary = () => {
    const summary = {
      totalUsers: context.appAnalytics?.total_users || 0,
      activeUsers: context.appAnalytics?.active_users || 0,
      totalEvents: context.appAnalytics?.feature_usage.events_created || 0,
      totalGroups: context.socialAnalytics?.total_groups || 0,
      totalMessages: context.socialAnalytics?.total_messages || 0,
      totalVenues: context.locationAnalytics?.total_venues || 0,
    };

    return summary;
  };

  // Get user engagement score
  const getUserEngagementScore = (userId: string): number => {
    if (context.userAnalytics?.user_id === userId) {
      return context.userAnalytics.engagement_score;
    }
    return 0;
  };

  // Get event success rate
  const getEventSuccessRate = (eventId: string): number => {
    if (context.eventAnalytics?.event_id === eventId) {
      return context.eventAnalytics.success_rate;
    }
    return 0;
  };

  // Get app health score
  const getAppHealthScore = (): number => {
    if (!context.appAnalytics) return 0;
    
    const { user_retention, performance_metrics } = context.appAnalytics;
    
    const retentionScore = (user_retention.day_7 + user_retention.day_30) / 2;
    const performanceScore = 100 - (performance_metrics.crash_rate + performance_metrics.error_rate);
    
    return (retentionScore + performanceScore) / 2;
  };

  // Get social engagement score
  const getSocialEngagementScore = (): number => {
    if (!context.socialAnalytics) return 0;
    
    const { total_friendships, total_groups, total_messages } = context.socialAnalytics;
    
    // Calculate engagement based on social activity
    const engagementScore = Math.min(100, (total_friendships + total_groups + total_messages) / 100);
    
    return engagementScore;
  };

  // Get location popularity score
  const getLocationPopularityScore = (): number => {
    if (!context.locationAnalytics) return 0;
    
    const { total_venues, total_check_ins } = context.locationAnalytics;
    
    if (total_venues === 0) return 0;
    
    const checkInsPerVenue = total_check_ins / total_venues;
    return Math.min(100, checkInsPerVenue * 10);
  };

  // Get analytics trends
  const getAnalyticsTrends = () => {
    const trends = {
      userGrowth: 0, // Would need historical data
      engagementGrowth: 0,
      eventGrowth: 0,
      socialGrowth: 0,
    };

    return trends;
  };

  // Get top performing metrics
  const getTopPerformingMetrics = (): AnalyticsMetric[] => {
    if (!context.dashboardAnalytics) return [];
    
    return context.dashboardAnalytics.overview_metrics
      .filter(metric => metric.trend === 'up')
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  // Get underperforming metrics
  const getUnderperformingMetrics = (): AnalyticsMetric[] => {
    if (!context.dashboardAnalytics) return [];
    
    return context.dashboardAnalytics.overview_metrics
      .filter(metric => metric.trend === 'down')
      .sort((a, b) => a.value - b.value)
      .slice(0, 5);
  };

  // Get analytics insights
  const getAnalyticsInsights = (): string[] => {
    if (!context.dashboardAnalytics) return [];
    
    return context.dashboardAnalytics.insights;
  };

  // Get analytics recommendations
  const getAnalyticsRecommendations = (): string[] => {
    if (!context.dashboardAnalytics) return [];
    
    return context.dashboardAnalytics.recommendations;
  };

  // Get user activity breakdown
  const getUserActivityBreakdown = (userId: string) => {
    if (context.userAnalytics?.user_id !== userId) return null;
    
    return {
      eventsCreated: context.userAnalytics.total_events_created,
      eventsAttended: context.userAnalytics.total_events_attended,
      friends: context.userAnalytics.total_friends,
      groups: context.userAnalytics.total_groups,
      messages: context.userAnalytics.total_messages_sent,
      checkIns: context.userAnalytics.total_check_ins,
    };
  };

  // Get event performance breakdown
  const getEventPerformanceBreakdown = (eventId: string) => {
    if (context.eventAnalytics?.event_id !== eventId) return null;
    
    return {
      views: context.eventAnalytics.total_views,
      rsvps: context.eventAnalytics.total_rsvps,
      attendees: context.eventAnalytics.total_attendees,
      attendanceRate: context.eventAnalytics.attendance_rate,
      engagementScore: context.eventAnalytics.engagement_score,
      successRate: context.eventAnalytics.success_rate,
    };
  };

  // Get app performance breakdown
  const getAppPerformanceBreakdown = () => {
    if (!context.appAnalytics) return null;
    
    return {
      totalUsers: context.appAnalytics.total_users,
      activeUsers: context.appAnalytics.active_users,
      newUsers: context.appAnalytics.new_users,
      retention: context.appAnalytics.user_retention,
      sessions: context.appAnalytics.app_usage.total_sessions,
      sessionDuration: context.appAnalytics.app_usage.average_session_duration,
      featureUsage: context.appAnalytics.feature_usage,
      performance: context.appAnalytics.performance_metrics,
    };
  };

  // Get social performance breakdown
  const getSocialPerformanceBreakdown = () => {
    if (!context.socialAnalytics) return null;
    
    return {
      friendships: context.socialAnalytics.total_friendships,
      groups: context.socialAnalytics.total_groups,
      groupMembers: context.socialAnalytics.total_group_members,
      messages: context.socialAnalytics.total_messages,
      engagement: context.socialAnalytics.social_engagement,
      network: context.socialAnalytics.network_analysis,
      content: context.socialAnalytics.content_analytics,
    };
  };

  // Get location performance breakdown
  const getLocationPerformanceBreakdown = () => {
    if (!context.locationAnalytics) return null;
    
    return {
      venues: context.locationAnalytics.total_venues,
      checkIns: context.locationAnalytics.total_check_ins,
      popularVenues: context.locationAnalytics.popular_venues,
      geographicDistribution: context.locationAnalytics.geographic_distribution,
      venueCategories: context.locationAnalytics.venue_categories,
      sportsByLocation: context.locationAnalytics.sports_by_location,
    };
  };

  // Generate report with validation
  const generateReportWithValidation = async (config: ReportConfig): Promise<CustomReport | null> => {
    if (!config.name.trim()) {
      throw new Error('Report name is required');
    }
    
    if (!config.type) {
      throw new Error('Report type is required');
    }
    
    if (!config.format) {
      throw new Error('Report format is required');
    }
    
    return await context.generateCustomReport(config);
  };

  // Export report with validation
  const exportReportWithValidation = async (report: CustomReport, format: 'pdf' | 'csv' | 'excel' | 'json'): Promise<string | null> => {
    if (!report) {
      throw new Error('Report is required');
    }
    
    if (!format) {
      throw new Error('Export format is required');
    }
    
    return await context.exportReport(report, format);
  };

  // Get report statistics
  const getReportStatistics = () => {
    const totalConfigs = context.reportConfigs.length;
    const totalHistory = context.reportHistory.length;
    const scheduledReports = context.reportConfigs.filter(config => config.schedule?.enabled).length;
    
    return {
      totalConfigs,
      totalHistory,
      scheduledReports,
    };
  };

  // Get report by type
  const getReportsByType = (type: ReportConfig['type']): ReportConfig[] => {
    return context.reportConfigs.filter(config => config.type === type);
  };

  // Get report by format
  const getReportsByFormat = (format: ReportConfig['format']): ReportConfig[] => {
    return context.reportConfigs.filter(config => config.format === format);
  };

  // Get scheduled reports
  const getScheduledReports = (): ReportConfig[] => {
    return context.reportConfigs.filter(config => config.schedule?.enabled);
  };

  // Get recent reports
  const getRecentReports = (limit: number = 10): ReportData[] => {
    return context.reportHistory
      .sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime())
      .slice(0, limit);
  };

  // Get report status
  const getReportStatus = (reportId: string): ReportData['status'] | null => {
    const report = context.reportHistory.find(r => r.id === reportId);
    return report?.status || null;
  };

  // Get report file URL
  const getReportFileUrl = (reportId: string): string | null => {
    const report = context.reportHistory.find(r => r.id === reportId);
    return report?.file_url || null;
  };

  // Get analytics charts
  const getAnalyticsCharts = (): AnalyticsChart[] => {
    if (!context.dashboardAnalytics) return [];
    
    return context.dashboardAnalytics.charts;
  };

  // Get analytics metrics
  const getAnalyticsMetrics = (): AnalyticsMetric[] => {
    if (!context.dashboardAnalytics) return [];
    
    return context.dashboardAnalytics.overview_metrics;
  };

  // Get analytics last updated
  const getAnalyticsLastUpdated = (): string | null => {
    if (!context.dashboardAnalytics) return null;
    
    return context.dashboardAnalytics.last_updated;
  };

  // Check if analytics are available
  const isAnalyticsAvailable = (): boolean => {
    return !!(context.appAnalytics || context.socialAnalytics || context.locationAnalytics);
  };

  // Check if reports are available
  const isReportsAvailable = (): boolean => {
    return context.reportConfigs.length > 0 || context.reportHistory.length > 0;
  };

  // Get analytics health status
  const getAnalyticsHealthStatus = (): 'healthy' | 'warning' | 'critical' => {
    if (!context.appAnalytics) return 'critical';
    
    const { performance_metrics, user_retention } = context.appAnalytics;
    
    if (performance_metrics.crash_rate > 10 || performance_metrics.error_rate > 5) {
      return 'critical';
    }
    
    if (performance_metrics.crash_rate > 5 || performance_metrics.error_rate > 2 || user_retention.day_7 < 50) {
      return 'warning';
    }
    
    return 'healthy';
  };

  // Get report generation status
  const getReportGenerationStatus = (): 'idle' | 'generating' | 'exporting' => {
    if (context.isGeneratingReport) return 'generating';
    if (context.isExportingReport) return 'exporting';
    return 'idle';
  };

  // Get analytics error status
  const getAnalyticsErrorStatus = (): boolean => {
    return !!(context.error || context.reportError);
  };

  // Get analytics loading status
  const getAnalyticsLoadingStatus = (): boolean => {
    return context.isLoading || context.isGeneratingReport || context.isExportingReport;
  };

  return {
    // Context
    ...context,
    
    // Additional methods
    getUserAnalyticsWithValidation,
    getEventAnalyticsWithValidation,
    getAnalyticsSummary,
    getUserEngagementScore,
    getEventSuccessRate,
    getAppHealthScore,
    getSocialEngagementScore,
    getLocationPopularityScore,
    getAnalyticsTrends,
    getTopPerformingMetrics,
    getUnderperformingMetrics,
    getAnalyticsInsights,
    getAnalyticsRecommendations,
    getUserActivityBreakdown,
    getEventPerformanceBreakdown,
    getAppPerformanceBreakdown,
    getSocialPerformanceBreakdown,
    getLocationPerformanceBreakdown,
    generateReportWithValidation,
    exportReportWithValidation,
    getReportStatistics,
    getReportsByType,
    getReportsByFormat,
    getScheduledReports,
    getRecentReports,
    getReportStatus,
    getReportFileUrl,
    getAnalyticsCharts,
    getAnalyticsMetrics,
    getAnalyticsLastUpdated,
    isAnalyticsAvailable,
    isReportsAvailable,
    getAnalyticsHealthStatus,
    getReportGenerationStatus,
    getAnalyticsErrorStatus,
    getAnalyticsLoadingStatus,
  };
}
