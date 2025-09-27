import { useModeration as useModerationContext } from '../contexts/ModerationContext';
import { 
  ContentReport, 
  ModerationAction, 
  UserModerationStatus, 
  ContentModeration, 
  ModerationQueue, 
  ModerationAnalytics, 
  AppealRequest,
  ModerationFilters
} from '../services/moderationService';
import { 
  ReportCategory, 
  ReportTemplate, 
  ReportSubmission, 
  ReportAnalytics, 
  ReportFilters
} from '../services/reportingService';
import { 
  SecurityThreat, 
  SecurityEvent, 
  SecurityAlert, 
  SecurityAnalytics, 
  SecurityFilters
} from '../services/securityService';

// Re-export the context hook for convenience
export { useModerationContext as useModeration };

// Additional hook for moderation management
export function useModerationManager() {
  const context = useModerationContext();
  
  // Get moderation statistics
  const getModerationStats = () => {
    const stats = {
      totalQueue: context.moderationQueue.length,
      pendingReports: context.contentReports.filter(r => r.status === 'pending').length,
      resolvedReports: context.contentReports.filter(r => r.status === 'resolved').length,
      totalActions: context.moderationActions.length,
      activeThreats: context.securityThreats.filter(t => t.status === 'active').length,
      securityAlerts: context.securityAlerts.filter(a => a.status === 'active').length,
      pendingAppeals: context.appealRequests.filter(a => a.status === 'pending').length,
    };

    return stats;
  };

  // Get user moderation summary
  const getUserModerationSummary = (userId: string) => {
    if (context.userModerationStatus?.user_id !== userId) return null;
    
    const status = context.userModerationStatus;
    return {
      status: status.status,
      warnings: status.warnings,
      violations: status.violations,
      restrictions: status.restrictions,
      appealStatus: status.appeal_status,
      lastViolation: status.last_violation,
    };
  };

  // Get content moderation summary
  const getContentModerationSummary = (contentId: string) => {
    const reports = context.contentReports.filter(r => r.content_id === contentId);
    const actions = context.moderationActions.filter(a => a.content_id === contentId);
    
    return {
      totalReports: reports.length,
      pendingReports: reports.filter(r => r.status === 'pending').length,
      resolvedReports: reports.filter(r => r.status === 'resolved').length,
      totalActions: actions.length,
      lastAction: actions[0]?.created_at,
    };
  };

  // Get moderation efficiency
  const getModerationEfficiency = () => {
    if (!context.moderationAnalytics) return 0;
    
    const { total_reports, resolved_reports, average_resolution_time } = context.moderationAnalytics;
    
    if (total_reports === 0) return 100;
    
    const resolutionRate = (resolved_reports / total_reports) * 100;
    const timeScore = average_resolution_time > 0 ? Math.max(0, 100 - (average_resolution_time / 24)) : 100;
    
    return Math.round((resolutionRate + timeScore) / 2);
  };

  // Get security health score
  const getSecurityHealthScore = () => {
    if (!context.securityAnalytics) return 100;
    
    const { total_threats, blocked_ips, security_score } = context.securityAnalytics;
    
    // Calculate health score based on threats and blocks
    const threatScore = Math.max(0, 100 - (total_threats * 2));
    const blockScore = Math.min(100, blocked_ips * 5);
    
    return Math.round((threatScore + blockScore + security_score) / 3);
  };

  // Get report submission rate
  const getReportSubmissionRate = () => {
    if (!context.reportAnalytics) return 0;
    
    const { total_reports, reports_by_status } = context.reportAnalytics;
    
    if (total_reports === 0) return 0;
    
    const resolvedReports = reports_by_status.find(r => r.status === 'resolved')?.count || 0;
    return Math.round((resolvedReports / total_reports) * 100);
  };

  // Get top violation types
  const getTopViolationTypes = () => {
    if (!context.moderationAnalytics) return [];
    
    return context.moderationAnalytics.top_violation_types;
  };

  // Get moderation trends
  const getModerationTrends = () => {
    const trends = {
      queueGrowth: 0, // Would need historical data
      reportGrowth: 0,
      actionGrowth: 0,
      securityImprovement: 0,
    };

    return trends;
  };

  // Get moderation insights
  const getModerationInsights = () => {
    const insights = [];
    
    if (context.moderationAnalytics) {
      const { auto_moderation_rate, false_positive_rate } = context.moderationAnalytics;
      
      if (auto_moderation_rate > 80) {
        insights.push('High auto-moderation rate indicates effective automated filtering');
      } else if (auto_moderation_rate < 50) {
        insights.push('Low auto-moderation rate - consider improving automated filters');
      }
      
      if (false_positive_rate > 20) {
        insights.push('High false positive rate - consider adjusting moderation rules');
      }
    }
    
    if (context.securityAnalytics) {
      const { total_threats, blocked_ips } = context.securityAnalytics;
      
      if (total_threats > 100) {
        insights.push('High threat count - consider strengthening security measures');
      }
      
      if (blocked_ips > 50) {
        insights.push('Many blocked IPs - consider reviewing blocking criteria');
      }
    }
    
    if (insights.length === 0) {
      insights.push('No specific insights available');
    }
    
    return insights;
  };

  // Get moderation recommendations
  const getModerationRecommendations = () => {
    const recommendations = [];
    
    if (context.moderationAnalytics) {
      const { auto_moderation_rate, false_positive_rate, average_resolution_time } = context.moderationAnalytics;
      
      if (auto_moderation_rate < 70) {
        recommendations.push('Improve automated moderation by updating content filters');
      }
      
      if (false_positive_rate > 15) {
        recommendations.push('Reduce false positives by refining moderation rules');
      }
      
      if (average_resolution_time > 24) {
        recommendations.push('Improve response time by increasing moderator capacity');
      }
    }
    
    if (context.securityAnalytics) {
      const { security_score } = context.securityAnalytics;
      
      if (security_score < 70) {
        recommendations.push('Enhance security measures to improve overall security score');
      }
    }
    
    if (context.moderationQueue.length > 50) {
      recommendations.push('High moderation queue - consider increasing moderator capacity');
    }
    
    if (context.appealRequests.filter(a => a.status === 'pending').length > 20) {
      recommendations.push('Many pending appeals - consider faster appeal processing');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Moderation system is performing well');
    }
    
    return recommendations;
  };

  // Get moderation health status
  const getModerationHealthStatus = (): 'healthy' | 'warning' | 'critical' => {
    const stats = getModerationStats();
    const efficiency = getModerationEfficiency();
    const securityScore = getSecurityHealthScore();
    
    if (stats.totalQueue > 100 || efficiency < 50 || securityScore < 50) {
      return 'critical';
    }
    
    if (stats.totalQueue > 50 || efficiency < 70 || securityScore < 70) {
      return 'warning';
    }
    
    return 'healthy';
  };

  // Get moderation performance metrics
  const getModerationPerformanceMetrics = () => {
    return {
      efficiency: getModerationEfficiency(),
      securityScore: getSecurityHealthScore(),
      reportRate: getReportSubmissionRate(),
      healthStatus: getModerationHealthStatus(),
      queueSize: context.moderationQueue.length,
      activeThreats: context.securityThreats.filter(t => t.status === 'active').length,
      pendingAppeals: context.appealRequests.filter(a => a.status === 'pending').length,
    };
  };

  // Get moderation dashboard data
  const getModerationDashboardData = () => {
    return {
      stats: getModerationStats(),
      performance: getModerationPerformanceMetrics(),
      insights: getModerationInsights(),
      recommendations: getModerationRecommendations(),
      trends: getModerationTrends(),
      topViolations: getTopViolationTypes(),
    };
  };

  // Get user moderation actions
  const getUserModerationActions = (userId: string) => {
    return context.moderationActions.filter(action => action.content_id === userId);
  };

  // Get content moderation history
  const getContentModerationHistory = (contentId: string) => {
    const reports = context.contentReports.filter(r => r.content_id === contentId);
    const actions = context.moderationActions.filter(a => a.content_id === contentId);
    
    return {
      reports,
      actions,
      totalReports: reports.length,
      totalActions: actions.length,
      lastReport: reports[0]?.created_at,
      lastAction: actions[0]?.created_at,
    };
  };

  // Get moderation queue summary
  const getModerationQueueSummary = () => {
    const queue = context.moderationQueue;
    
    return {
      total: queue.length,
      pending: queue.filter(q => q.status === 'pending').length,
      inReview: queue.filter(q => q.status === 'in_review').length,
      resolved: queue.filter(q => q.status === 'resolved').length,
      urgent: queue.filter(q => q.priority === 'urgent').length,
      high: queue.filter(q => q.priority === 'high').length,
      medium: queue.filter(q => q.priority === 'medium').length,
      low: queue.filter(q => q.priority === 'low').length,
    };
  };

  // Get security threat summary
  const getSecurityThreatSummary = () => {
    const threats = context.securityThreats;
    
    return {
      total: threats.length,
      active: threats.filter(t => t.status === 'active').length,
      investigating: threats.filter(t => t.status === 'investigating').length,
      resolved: threats.filter(t => t.status === 'resolved').length,
      critical: threats.filter(t => t.severity === 'critical').length,
      high: threats.filter(t => t.severity === 'high').length,
      medium: threats.filter(t => t.severity === 'medium').length,
      low: threats.filter(t => t.severity === 'low').length,
    };
  };

  // Get appeal request summary
  const getAppealRequestSummary = () => {
    const appeals = context.appealRequests;
    
    return {
      total: appeals.length,
      pending: appeals.filter(a => a.status === 'pending').length,
      underReview: appeals.filter(a => a.status === 'under_review').length,
      approved: appeals.filter(a => a.status === 'approved').length,
      denied: appeals.filter(a => a.status === 'denied').length,
    };
  };

  // Get moderation workload
  const getModerationWorkload = () => {
    const queue = context.moderationQueue;
    const reports = context.contentReports;
    const appeals = context.appealRequests;
    
    return {
      queueItems: queue.length,
      pendingReports: reports.filter(r => r.status === 'pending').length,
      pendingAppeals: appeals.filter(a => a.status === 'pending').length,
      totalWorkload: queue.length + reports.filter(r => r.status === 'pending').length + appeals.filter(a => a.status === 'pending').length,
    };
  };

  // Get moderation alerts
  const getModerationAlerts = () => {
    const alerts = [];
    
    if (context.moderationQueue.length > 100) {
      alerts.push({
        type: 'warning',
        message: 'High moderation queue - consider increasing capacity',
        priority: 'high',
      });
    }
    
    if (context.securityThreats.filter(t => t.status === 'active').length > 20) {
      alerts.push({
        type: 'critical',
        message: 'High number of active security threats',
        priority: 'critical',
      });
    }
    
    if (context.appealRequests.filter(a => a.status === 'pending').length > 50) {
      alerts.push({
        type: 'warning',
        message: 'Many pending appeals - consider faster processing',
        priority: 'medium',
      });
    }
    
    return alerts;
  };

  // Get moderation metrics for charts
  const getModerationChartData = () => {
    return {
      queueByPriority: {
        urgent: context.moderationQueue.filter(q => q.priority === 'urgent').length,
        high: context.moderationQueue.filter(q => q.priority === 'high').length,
        medium: context.moderationQueue.filter(q => q.priority === 'medium').length,
        low: context.moderationQueue.filter(q => q.priority === 'low').length,
      },
      reportsByStatus: {
        pending: context.contentReports.filter(r => r.status === 'pending').length,
        reviewing: context.contentReports.filter(r => r.status === 'reviewing').length,
        resolved: context.contentReports.filter(r => r.status === 'resolved').length,
        dismissed: context.contentReports.filter(r => r.status === 'dismissed').length,
      },
      threatsBySeverity: {
        critical: context.securityThreats.filter(t => t.severity === 'critical').length,
        high: context.securityThreats.filter(t => t.severity === 'high').length,
        medium: context.securityThreats.filter(t => t.severity === 'medium').length,
        low: context.securityThreats.filter(t => t.severity === 'low').length,
      },
      appealsByStatus: {
        pending: context.appealRequests.filter(a => a.status === 'pending').length,
        underReview: context.appealRequests.filter(a => a.status === 'under_review').length,
        approved: context.appealRequests.filter(a => a.status === 'approved').length,
        denied: context.appealRequests.filter(a => a.status === 'denied').length,
      },
    };
  };

  return {
    // Context
    ...context,
    
    // Additional methods
    getModerationStats,
    getUserModerationSummary,
    getContentModerationSummary,
    getModerationEfficiency,
    getSecurityHealthScore,
    getReportSubmissionRate,
    getTopViolationTypes,
    getModerationTrends,
    getModerationInsights,
    getModerationRecommendations,
    getModerationHealthStatus,
    getModerationPerformanceMetrics,
    getModerationDashboardData,
    getUserModerationActions,
    getContentModerationHistory,
    getModerationQueueSummary,
    getSecurityThreatSummary,
    getAppealRequestSummary,
    getModerationWorkload,
    getModerationAlerts,
    getModerationChartData,
  };
}
