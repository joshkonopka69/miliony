import { supabase } from './supabase';
import { ContentReport, ModerationAction, AppealRequest } from './moderationService';

// Reporting types and interfaces
export interface ReportCategory {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  auto_action: 'none' | 'flag' | 'remove' | 'suspend';
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  category_id: string;
  description: string;
  required_fields: string[];
  optional_fields: string[];
  auto_assign: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface ReportSubmission {
  id: string;
  reporter_id: string;
  template_id: string;
  content_id: string;
  content_type: string;
  data: { [key: string]: any };
  status: 'draft' | 'submitted' | 'under_review' | 'resolved' | 'rejected';
  assigned_moderator_id?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportAnalytics {
  total_reports: number;
  reports_by_category: { category: string; count: number }[];
  reports_by_status: { status: string; count: number }[];
  average_resolution_time: number;
  false_positive_rate: number;
  user_satisfaction: number;
  top_reporters: { user_id: string; count: number }[];
}

// Additional report types for analytics
export interface ReportConfig {
  id: string;
  name: string;
  type: 'user' | 'event' | 'app' | 'social' | 'location' | 'custom';
  format: 'pdf' | 'csv' | 'excel' | 'json';
  filters: any;
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ReportData {
  id: string;
  config_id: string;
  name: string;
  type: string;
  format: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  file_url?: string;
  generated_at: string;
  expires_at?: string;
}

export interface UserReport {
  user_id: string;
  total_events: number;
  total_friends: number;
  engagement_score: number;
  activity_level: string;
  generated_at: string;
}

export interface EventReport {
  event_id: string;
  total_views: number;
  total_rsvps: number;
  attendance_rate: number;
  engagement_score: number;
  generated_at: string;
}

export interface AppReport {
  total_users: number;
  active_users: number;
  total_events: number;
  total_groups: number;
  performance_metrics: any;
  generated_at: string;
}

export interface SocialReport {
  total_friendships: number;
  total_groups: number;
  total_messages: number;
  engagement_metrics: any;
  generated_at: string;
}

export interface LocationReport {
  total_venues: number;
  total_check_ins: number;
  popular_venues: any[];
  generated_at: string;
}

export interface CustomReport {
  id: string;
  name: string;
  type: string;
  format: string;
  data: any;
  generated_at: string;
}

export interface ReportFilters {
  category?: string;
  status?: string;
  priority?: string;
  date_range?: {
    start_date: string;
    end_date: string;
  };
  reporter_id?: string;
  moderator_id?: string;
  content_type?: string;
}

export interface ReportNotification {
  id: string;
  user_id: string;
  type: 'report_submitted' | 'report_resolved' | 'report_rejected' | 'appeal_approved' | 'appeal_denied';
  title: string;
  message: string;
  data?: { [key: string]: any };
  read: boolean;
  created_at: string;
}

class ReportingService {
  // Report Categories
  async getReportCategories(): Promise<ReportCategory[]> {
    try {
      const { data, error } = await supabase
        .from('report_categories')
        .select('*')
        .eq('enabled', true)
        .order('severity', { ascending: false });

      if (error) {
        console.error('Error fetching report categories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching report categories:', error);
      return [];
    }
  }

  async createReportCategory(category: Omit<ReportCategory, 'id' | 'created_at' | 'updated_at'>): Promise<ReportCategory | null> {
    try {
      const { data, error } = await supabase
        .from('report_categories')
        .insert({
          ...category,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating report category:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating report category:', error);
      return null;
    }
  }

  // Report Templates
  async getReportTemplates(categoryId?: string): Promise<ReportTemplate[]> {
    try {
      let query = supabase
        .from('report_templates')
        .select('*')
        .order('priority', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching report templates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching report templates:', error);
      return [];
    }
  }

  async createReportTemplate(template: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ReportTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .insert({
          ...template,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating report template:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating report template:', error);
      return null;
    }
  }

  // Report Submissions
  async submitReport(report: Omit<ReportSubmission, 'id' | 'created_at' | 'updated_at'>): Promise<ReportSubmission | null> {
    try {
      const { data, error } = await supabase
        .from('report_submissions')
        .insert({
          ...report,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting report:', error);
        return null;
      }

      // Send notification to moderators
      await this.sendReportNotification(data);

      return data;
    } catch (error) {
      console.error('Error submitting report:', error);
      return null;
    }
  }

  async getReportSubmissions(filters?: ReportFilters): Promise<ReportSubmission[]> {
    try {
      let query = supabase
        .from('report_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('template_id', filters.category);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.date_range) {
        query = query
          .gte('created_at', filters.date_range.start_date)
          .lte('created_at', filters.date_range.end_date);
      }

      if (filters?.reporter_id) {
        query = query.eq('reporter_id', filters.reporter_id);
      }

      if (filters?.moderator_id) {
        query = query.eq('assigned_moderator_id', filters.moderator_id);
      }

      if (filters?.content_type) {
        query = query.eq('content_type', filters.content_type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching report submissions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching report submissions:', error);
      return [];
    }
  }

  async updateReportStatus(reportId: string, status: string, resolution?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('report_submissions')
        .update({
          status,
          resolution,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) {
        console.error('Error updating report status:', error);
        return false;
      }

      // Send notification to reporter
      await this.sendStatusUpdateNotification(reportId, status);

      return true;
    } catch (error) {
      console.error('Error updating report status:', error);
      return false;
    }
  }

  // Report Analytics
  async getReportAnalytics(filters?: ReportFilters): Promise<ReportAnalytics | null> {
    try {
      // Get total reports
      const { data: totalReports } = await supabase
        .from('report_submissions')
        .select('id');

      // Get reports by category
      const { data: reportsByCategory } = await supabase
        .from('report_submissions')
        .select('template_id');

      // Get reports by status
      const { data: reportsByStatus } = await supabase
        .from('report_submissions')
        .select('status');

      // Get top reporters
      const { data: topReporters } = await supabase
        .from('report_submissions')
        .select('reporter_id');

      const categoryCounts = this.calculateCategoryCounts(reportsByCategory || []);
      const statusCounts = this.calculateStatusCounts(reportsByStatus || []);
      const reporterCounts = this.calculateReporterCounts(topReporters || []);

      return {
        total_reports: totalReports?.length || 0,
        reports_by_category: categoryCounts,
        reports_by_status: statusCounts,
        average_resolution_time: 0, // Would need historical data
        false_positive_rate: 0, // Would need historical data
        user_satisfaction: 0, // Would need user feedback
        top_reporters: reporterCounts,
        resolution_efficiency: 0, // Would need historical data
      };
    } catch (error) {
      console.error('Error fetching report analytics:', error);
      return null;
    }
  }

  // Notifications
  async sendReportNotification(report: ReportSubmission): Promise<void> {
    try {
      // Get available moderators
      const { data: moderators } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'moderator');

      if (moderators) {
        for (const moderator of moderators) {
          await this.createNotification({
            user_id: moderator.id,
            type: 'report_submitted',
            title: 'New Report Submitted',
            message: `A new report has been submitted and requires review.`,
            data: { report_id: report.id },
            read: false,
            created_at: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error sending report notification:', error);
    }
  }

  async sendStatusUpdateNotification(reportId: string, status: string): Promise<void> {
    try {
      // Get report details
      const { data: report } = await supabase
        .from('report_submissions')
        .select('reporter_id')
        .eq('id', reportId)
        .single();

      if (report) {
        await this.createNotification({
          user_id: report.reporter_id,
          type: 'report_resolved',
          title: 'Report Status Update',
          message: `Your report has been ${status}.`,
          data: { report_id: reportId },
          read: false,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error sending status update notification:', error);
    }
  }

  async createNotification(notification: Omit<ReportNotification, 'id'>): Promise<ReportNotification | null> {
    try {
      const { data, error } = await supabase
        .from('report_notifications')
        .insert({
          id: `notif_${Date.now()}`,
          ...notification,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Appeal System
  async createAppealRequest(appeal: Omit<AppealRequest, 'id' | 'created_at' | 'updated_at'>): Promise<AppealRequest | null> {
    try {
      const { data, error } = await supabase
        .from('appeal_requests')
        .insert({
          ...appeal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating appeal request:', error);
        return null;
      }

      // Send notification to moderators
      await this.sendAppealNotification(data);

      return data;
    } catch (error) {
      console.error('Error creating appeal request:', error);
      return null;
    }
  }

  async getAppealRequests(filters?: { status?: string; user_id?: string }): Promise<AppealRequest[]> {
    try {
      let query = supabase
        .from('appeal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching appeal requests:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching appeal requests:', error);
      return [];
    }
  }

  async reviewAppeal(appealId: string, decision: 'approved' | 'denied', moderatorNotes?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('appeal_requests')
        .update({
          status: decision,
          moderator_notes: moderatorNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', appealId);

      if (error) {
        console.error('Error reviewing appeal:', error);
        return false;
      }

      // Send notification to user
      await this.sendAppealDecisionNotification(appealId, decision);

      return true;
    } catch (error) {
      console.error('Error reviewing appeal:', error);
      return false;
    }
  }

  async sendAppealNotification(appeal: AppealRequest): Promise<void> {
    try {
      // Get available moderators
      const { data: moderators } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'moderator');

      if (moderators) {
        for (const moderator of moderators) {
          await this.createNotification({
            user_id: moderator.id,
            type: 'appeal_approved',
            title: 'New Appeal Request',
            message: `A new appeal request has been submitted and requires review.`,
            data: { appeal_id: appeal.id },
            read: false,
            created_at: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error sending appeal notification:', error);
    }
  }

  async sendAppealDecisionNotification(appealId: string, decision: string): Promise<void> {
    try {
      // Get appeal details
      const { data: appeal } = await supabase
        .from('appeal_requests')
        .select('user_id')
        .eq('id', appealId)
        .single();

      if (appeal) {
        await this.createNotification({
          user_id: appeal.user_id,
          type: decision === 'approved' ? 'appeal_approved' : 'appeal_denied',
          title: 'Appeal Decision',
          message: `Your appeal has been ${decision}.`,
          data: { appeal_id: appealId },
          read: false,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error sending appeal decision notification:', error);
    }
  }

  // Helper methods
  private calculateCategoryCounts(reports: any[]): { category: string; count: number }[] {
    const counts: { [key: string]: number } = {};
    
    reports.forEach(report => {
      const category = report.template_id;
      counts[category] = (counts[category] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateStatusCounts(reports: any[]): { status: string; count: number }[] {
    const counts: { [key: string]: number } = {};
    
    reports.forEach(report => {
      const status = report.status;
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateReporterCounts(reporters: any[]): { user_id: string; count: number }[] {
    const counts: { [key: string]: number } = {};
    
    reporters.forEach(reporter => {
      const userId = reporter.reporter_id;
      counts[userId] = (counts[userId] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([user_id, count]) => ({ user_id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Report configuration methods
  async createReportConfig(config: Omit<ReportConfig, 'id' | 'created_at' | 'updated_at'>): Promise<ReportConfig | null> {
    try {
      const { data, error } = await supabase
        .from('report_configs')
        .insert({
          ...config,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating report config:', error);
      return null;
    }
  }

  async getReportConfig(configId: string): Promise<ReportConfig | null> {
    try {
      const { data, error } = await supabase
        .from('report_configs')
        .select('*')
        .eq('id', configId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting report config:', error);
      return null;
    }
  }

  async updateReportConfig(configId: string, updates: Partial<ReportConfig>): Promise<ReportConfig | null> {
    try {
      const { data, error } = await supabase
        .from('report_configs')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', configId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating report config:', error);
      return null;
    }
  }

  async deleteReportConfig(configId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('report_configs')
        .delete()
        .eq('id', configId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting report config:', error);
      return false;
    }
  }

  // Report generation methods
  async generateUserReport(userId: string, filters?: any): Promise<UserReport | null> {
    try {
      // Implementation would generate user-specific report
      return {
        user_id: userId,
        total_events: 0,
        total_friends: 0,
        engagement_score: 0,
        activity_level: 'medium',
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating user report:', error);
      return null;
    }
  }

  async generateEventReport(eventId: string, filters?: any): Promise<EventReport | null> {
    try {
      // Implementation would generate event-specific report
      return {
        event_id: eventId,
        total_views: 0,
        total_rsvps: 0,
        attendance_rate: 0,
        engagement_score: 0,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating event report:', error);
      return null;
    }
  }

  async generateAppReport(filters?: any): Promise<AppReport | null> {
    try {
      // Implementation would generate app-wide report
      return {
        total_users: 0,
        active_users: 0,
        total_events: 0,
        total_groups: 0,
        performance_metrics: {},
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating app report:', error);
      return null;
    }
  }

  async generateSocialReport(filters?: any): Promise<SocialReport | null> {
    try {
      // Implementation would generate social features report
      return {
        total_friendships: 0,
        total_groups: 0,
        total_messages: 0,
        engagement_metrics: {},
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating social report:', error);
      return null;
    }
  }

  async generateLocationReport(filters?: any): Promise<LocationReport | null> {
    try {
      // Implementation would generate location-based report
      return {
        total_venues: 0,
        total_check_ins: 0,
        popular_venues: [],
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating location report:', error);
      return null;
    }
  }

  async generateCustomReport(config: ReportConfig): Promise<CustomReport | null> {
    try {
      // Implementation would generate custom report based on config
      return {
        id: `custom_${Date.now()}`,
        name: config.name,
        type: config.type,
        format: config.format,
        data: {},
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating custom report:', error);
      return null;
    }
  }

  async exportReport(report: CustomReport, format: 'pdf' | 'csv' | 'excel' | 'json'): Promise<string | null> {
    try {
      // Implementation would export report in specified format
      return `exported_report_${report.id}.${format}`;
    } catch (error) {
      console.error('Error exporting report:', error);
      return null;
    }
  }

  async scheduleReport(configId: string, schedule: ReportConfig['schedule']): Promise<boolean> {
    try {
      // Implementation would schedule report generation
      return true;
    } catch (error) {
      console.error('Error scheduling report:', error);
      return false;
    }
  }

  async getReportHistory(limit: number = 50): Promise<ReportData[]> {
    try {
      const { data, error } = await supabase
        .from('report_history')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting report history:', error);
      return [];
    }
  }
}

// Create and export singleton instance
export const reportingService = new ReportingService();
export default reportingService;