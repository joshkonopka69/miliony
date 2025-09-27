import { supabase } from './supabase';

// Moderation types and interfaces
export interface ModerationRule {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'image' | 'behavior' | 'spam' | 'harassment' | 'inappropriate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  pattern: string;
  action: 'flag' | 'auto_remove' | 'require_review' | 'block_user';
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentReport {
  id: string;
  reporter_id: string;
  reported_user_id?: string;
  content_type: 'profile' | 'event' | 'message' | 'image' | 'comment' | 'review';
  content_id: string;
  reason: 'spam' | 'harassment' | 'inappropriate' | 'fake' | 'violence' | 'hate_speech' | 'other';
  description: string;
  evidence_urls?: string[];
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_moderator_id?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
}

export interface ModerationAction {
  id: string;
  moderator_id: string;
  content_id: string;
  content_type: string;
  action_type: 'remove' | 'warn' | 'suspend' | 'ban' | 'approve' | 'flag';
  reason: string;
  duration?: number; // in hours, for temporary actions
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

export interface UserModerationStatus {
  user_id: string;
  status: 'active' | 'warned' | 'suspended' | 'banned' | 'restricted';
  warnings: number;
  violations: number;
  last_violation?: string;
  restrictions: string[];
  appeal_status?: 'none' | 'pending' | 'approved' | 'denied';
  created_at: string;
  updated_at: string;
}

export interface ContentModeration {
  id: string;
  content_id: string;
  content_type: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  flagged_reasons: string[];
  auto_moderation_score: number;
  manual_review_required: boolean;
  moderator_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ModerationQueue {
  id: string;
  content_id: string;
  content_type: string;
  user_id: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_review' | 'resolved';
  auto_score: number;
  manual_review_required: boolean;
  assigned_moderator_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ModerationAnalytics {
  total_reports: number;
  resolved_reports: number;
  pending_reports: number;
  auto_moderation_rate: number;
  false_positive_rate: number;
  average_resolution_time: number;
  top_violation_types: { type: string; count: number }[];
  moderation_efficiency: number;
  user_satisfaction: number;
}

export interface AppealRequest {
  id: string;
  user_id: string;
  action_id: string;
  reason: string;
  evidence?: string[];
  status: 'pending' | 'under_review' | 'approved' | 'denied';
  moderator_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ModerationFilters {
  content_type?: string;
  status?: string;
  priority?: string;
  date_range?: {
    start_date: string;
    end_date: string;
  };
  moderator_id?: string;
  user_id?: string;
}

class ModerationService {
  // Content Moderation
  async moderateContent(content: {
    id: string;
    type: string;
    user_id: string;
    text?: string;
    images?: string[];
    metadata?: any;
  }): Promise<ContentModeration | null> {
    try {
      // Auto-moderation scoring
      const autoScore = await this.calculateAutoModerationScore(content);
      const flaggedReasons = await this.getFlaggedReasons(content);
      const manualReviewRequired = autoScore > 0.7 || flaggedReasons.length > 0;

      const moderation: ContentModeration = {
        id: `mod_${Date.now()}`,
        content_id: content.id,
        content_type: content.type,
        user_id: content.user_id,
        status: manualReviewRequired ? 'flagged' : 'approved',
        flagged_reasons: flaggedReasons,
        auto_moderation_score: autoScore,
        manual_review_required: manualReviewRequired,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save moderation record
      const { error } = await supabase
        .from('content_moderation')
        .insert(moderation);

      if (error) {
        console.error('Error saving moderation record:', error);
        return null;
      }

      // Add to moderation queue if manual review required
      if (manualReviewRequired) {
        await this.addToModerationQueue({
          content_id: content.id,
          content_type: content.type,
          user_id: content.user_id,
          priority: this.calculatePriority(autoScore, flaggedReasons),
          auto_score: autoScore,
          manual_review_required: true,
          status: 'pending',
        });
      }

      return moderation;
    } catch (error) {
      console.error('Error moderating content:', error);
      return null;
    }
  }

  // Report Content
  async reportContent(report: Omit<ContentReport, 'id' | 'created_at' | 'updated_at'>): Promise<ContentReport | null> {
    try {
      const contentReport: ContentReport = {
        id: `report_${Date.now()}`,
        ...report,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('content_reports')
        .insert(contentReport)
        .select()
        .single();

      if (error) {
        console.error('Error creating content report:', error);
        return null;
      }

      // Update content moderation status
      await this.updateContentModerationStatus(report.content_id, 'flagged');

      return data;
    } catch (error) {
      console.error('Error reporting content:', error);
      return null;
    }
  }

  // Get Moderation Queue
  async getModerationQueue(filters?: ModerationFilters): Promise<ModerationQueue[]> {
    try {
      let query = supabase
        .from('moderation_queue')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.content_type) {
        query = query.eq('content_type', filters.content_type);
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

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching moderation queue:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
      return [];
    }
  }

  // Take Moderation Action
  async takeModerationAction(action: Omit<ModerationAction, 'id' | 'created_at'>): Promise<ModerationAction | null> {
    try {
      const moderationAction: ModerationAction = {
        id: `action_${Date.now()}`,
        ...action,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('moderation_actions')
        .insert(moderationAction)
        .select()
        .single();

      if (error) {
        console.error('Error taking moderation action:', error);
        return null;
      }

      // Update user moderation status
      await this.updateUserModerationStatus(action.content_id, action.action_type, action.severity);

      // Update content moderation status
      await this.updateContentModerationStatus(action.content_id, action.action_type);

      return data;
    } catch (error) {
      console.error('Error taking moderation action:', error);
      return null;
    }
  }

  // Get User Moderation Status
  async getUserModerationStatus(userId: string): Promise<UserModerationStatus | null> {
    try {
      const { data, error } = await supabase
        .from('user_moderation_status')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user moderation status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user moderation status:', error);
      return null;
    }
  }

  // Block User
  async blockUser(userId: string, reason: string, duration?: number): Promise<boolean> {
    try {
      const action: Omit<ModerationAction, 'id' | 'created_at'> = {
        moderator_id: 'system', // or current moderator
        content_id: userId,
        content_type: 'user',
        action_type: 'ban',
        reason,
        duration,
        severity: 'high',
      };

      const result = await this.takeModerationAction(action);
      return result !== null;
    } catch (error) {
      console.error('Error blocking user:', error);
      return false;
    }
  }

  // Unblock User
  async unblockUser(userId: string, reason: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_moderation_status')
        .update({
          status: 'active',
          restrictions: [],
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error unblocking user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      return false;
    }
  }

  // Get Moderation Analytics
  async getModerationAnalytics(filters?: ModerationFilters): Promise<ModerationAnalytics | null> {
    try {
      // Get total reports
      const { data: totalReports } = await supabase
        .from('content_reports')
        .select('id');

      // Get resolved reports
      const { data: resolvedReports } = await supabase
        .from('content_reports')
        .select('id')
        .eq('status', 'resolved');

      // Get pending reports
      const { data: pendingReports } = await supabase
        .from('content_reports')
        .select('id')
        .eq('status', 'pending');

      // Get auto moderation rate
      const { data: autoModerated } = await supabase
        .from('content_moderation')
        .select('id')
        .eq('manual_review_required', false);

      // Get violation types
      const { data: violationTypes } = await supabase
        .from('content_reports')
        .select('reason');

      const topViolationTypes = this.calculateTopViolationTypes(violationTypes || []);

      return {
        total_reports: totalReports?.length || 0,
        resolved_reports: resolvedReports?.length || 0,
        pending_reports: pendingReports?.length || 0,
        auto_moderation_rate: totalReports?.length ? (autoModerated?.length || 0) / totalReports.length : 0,
        false_positive_rate: 0, // Would need historical data
        average_resolution_time: 0, // Would need historical data
        top_violation_types: topViolationTypes,
        moderation_efficiency: 0, // Would need historical data
        user_satisfaction: 0, // Would need user feedback
      };
    } catch (error) {
      console.error('Error fetching moderation analytics:', error);
      return null;
    }
  }

  // Create Appeal Request
  async createAppealRequest(appeal: Omit<AppealRequest, 'id' | 'created_at' | 'updated_at'>): Promise<AppealRequest | null> {
    try {
      const appealRequest: AppealRequest = {
        id: `appeal_${Date.now()}`,
        ...appeal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('appeal_requests')
        .insert(appealRequest)
        .select()
        .single();

      if (error) {
        console.error('Error creating appeal request:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating appeal request:', error);
      return null;
    }
  }

  // Review Appeal
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

      // If approved, unblock user
      if (decision === 'approved') {
        const { data: appeal } = await supabase
          .from('appeal_requests')
          .select('user_id')
          .eq('id', appealId)
          .single();

        if (appeal) {
          await this.unblockUser(appeal.user_id, 'Appeal approved');
        }
      }

      return true;
    } catch (error) {
      console.error('Error reviewing appeal:', error);
      return false;
    }
  }

  // Helper methods
  private async calculateAutoModerationScore(content: any): Promise<number> {
    let score = 0;

    // Text content analysis
    if (content.text) {
      score += await this.analyzeTextContent(content.text);
    }

    // Image content analysis
    if (content.images && content.images.length > 0) {
      score += await this.analyzeImageContent(content.images);
    }

    // User behavior analysis
    score += await this.analyzeUserBehavior(content.user_id);

    return Math.min(1, Math.max(0, score));
  }

  private async analyzeTextContent(text: string): Promise<number> {
    // Implementation would use AI/ML services for text analysis
    // For now, simple keyword matching
    const inappropriateKeywords = [
      'spam', 'scam', 'fake', 'hate', 'violence', 'harassment'
    ];

    const lowerText = text.toLowerCase();
    let score = 0;

    for (const keyword of inappropriateKeywords) {
      if (lowerText.includes(keyword)) {
        score += 0.2;
      }
    }

    return score;
  }

  private async analyzeImageContent(images: string[]): Promise<number> {
    // Implementation would use AI/ML services for image analysis
    // For now, return 0
    return 0;
  }

  private async analyzeUserBehavior(userId: string): Promise<number> {
    // Implementation would analyze user's past behavior
    // For now, return 0
    return 0;
  }

  private async getFlaggedReasons(content: any): Promise<string[]> {
    const reasons: string[] = [];

    if (content.text) {
      const textReasons = await this.getTextFlaggedReasons(content.text);
      reasons.push(...textReasons);
    }

    if (content.images && content.images.length > 0) {
      const imageReasons = await this.getImageFlaggedReasons(content.images);
      reasons.push(...imageReasons);
    }

    return reasons;
  }

  private async getTextFlaggedReasons(text: string): Promise<string[]> {
    const reasons: string[] = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('spam')) reasons.push('spam');
    if (lowerText.includes('hate')) reasons.push('hate_speech');
    if (lowerText.includes('harassment')) reasons.push('harassment');
    if (lowerText.includes('violence')) reasons.push('violence');

    return reasons;
  }

  private async getImageFlaggedReasons(images: string[]): Promise<string[]> {
    // Implementation would analyze images for inappropriate content
    return [];
  }

  private calculatePriority(autoScore: number, flaggedReasons: string[]): 'low' | 'medium' | 'high' | 'urgent' {
    if (autoScore > 0.8 || flaggedReasons.includes('violence') || flaggedReasons.includes('hate_speech')) {
      return 'urgent';
    } else if (autoScore > 0.6 || flaggedReasons.length > 2) {
      return 'high';
    } else if (autoScore > 0.4 || flaggedReasons.length > 0) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private async addToModerationQueue(queueItem: Omit<ModerationQueue, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('moderation_queue')
        .insert({
          id: `queue_${Date.now()}`,
          ...queueItem,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error adding to moderation queue:', error);
      }
    } catch (error) {
      console.error('Error adding to moderation queue:', error);
    }
  }

  private async updateContentModerationStatus(contentId: string, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_moderation')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('content_id', contentId);

      if (error) {
        console.error('Error updating content moderation status:', error);
      }
    } catch (error) {
      console.error('Error updating content moderation status:', error);
    }
  }

  private async updateUserModerationStatus(userId: string, actionType: string, severity: string): Promise<void> {
    try {
      // Get current status
      const { data: currentStatus } = await supabase
        .from('user_moderation_status')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (currentStatus) {
        // Update existing status
        const newStatus = this.calculateNewUserStatus(currentStatus, actionType, severity);
        await supabase
          .from('user_moderation_status')
          .update(newStatus)
          .eq('user_id', userId);
      } else {
        // Create new status
        const newStatus = this.createNewUserStatus(userId, actionType, severity);
        await supabase
          .from('user_moderation_status')
          .insert(newStatus);
      }
    } catch (error) {
      console.error('Error updating user moderation status:', error);
    }
  }

  private calculateNewUserStatus(currentStatus: UserModerationStatus, actionType: string, severity: string): Partial<UserModerationStatus> {
    const updates: Partial<UserModerationStatus> = {
      updated_at: new Date().toISOString(),
    };

    switch (actionType) {
      case 'warn':
        updates.warnings = (currentStatus.warnings || 0) + 1;
        updates.status = 'warned';
        break;
      case 'suspend':
        updates.status = 'suspended';
        updates.violations = (currentStatus.violations || 0) + 1;
        break;
      case 'ban':
        updates.status = 'banned';
        updates.violations = (currentStatus.violations || 0) + 1;
        break;
      case 'approve':
        updates.status = 'active';
        break;
    }

    return updates;
  }

  private createNewUserStatus(userId: string, actionType: string, severity: string): UserModerationStatus {
    return {
      user_id: userId,
      status: actionType === 'ban' ? 'banned' : actionType === 'suspend' ? 'suspended' : 'warned',
      warnings: actionType === 'warn' ? 1 : 0,
      violations: actionType === 'ban' || actionType === 'suspend' ? 1 : 0,
      restrictions: actionType === 'ban' ? ['all'] : actionType === 'suspend' ? ['posting'] : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  private calculateTopViolationTypes(violationTypes: any[]): { type: string; count: number }[] {
    const counts: { [key: string]: number } = {};
    
    violationTypes.forEach(violation => {
      const type = violation.reason;
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  // Get appeal requests
  async getAppealRequests(filters?: any): Promise<AppealRequest[]> {
    try {
      const { data, error } = await supabase
        .from('appeal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting appeal requests:', error);
      return [];
    }
  }
}

// Create and export singleton instance
export const moderationService = new ModerationService();
export default moderationService;
