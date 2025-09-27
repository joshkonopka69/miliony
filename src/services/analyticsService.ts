import { supabase } from './supabase';

// Analytics types and interfaces
export interface UserAnalytics {
  user_id: string;
  total_events_created: number;
  total_events_attended: number;
  total_friends: number;
  total_groups: number;
  total_messages_sent: number;
  total_check_ins: number;
  engagement_score: number;
  retention_rate: number;
  activity_by_day: { date: string; events: number; messages: number; check_ins: number }[];
  favorite_sports: { sport: string; count: number }[];
  favorite_venues: { venue: string; count: number }[];
  social_connections: {
    friends_added: number;
    groups_joined: number;
    invitations_sent: number;
    invitations_received: number;
  };
  app_usage: {
    total_sessions: number;
    average_session_duration: number;
    most_active_hours: number[];
    most_active_days: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface EventAnalytics {
  event_id: string;
  total_views: number;
  total_rsvps: number;
  total_attendees: number;
  attendance_rate: number;
  engagement_score: number;
  popularity_score: number;
  success_rate: number;
  demographics: {
    age_groups: { range: string; count: number }[];
    gender_distribution: { gender: string; count: number }[];
    skill_levels: { level: string; count: number }[];
  };
  geographic_distribution: {
    city: string;
    count: number;
  }[];
  time_analysis: {
    hour: number;
    count: number;
  }[];
  feedback_scores: {
    overall: number;
    venue: number;
    organization: number;
    value: number;
  };
  created_at: string;
  updated_at: string;
}

export interface AppAnalytics {
  total_users: number;
  active_users: number;
  new_users: number;
  user_retention: {
    day_1: number;
    day_7: number;
    day_30: number;
  };
  app_usage: {
    total_sessions: number;
    average_session_duration: number;
    sessions_per_user: number;
  };
  feature_usage: {
    events_created: number;
    events_attended: number;
    friends_added: number;
    groups_created: number;
    messages_sent: number;
    check_ins: number;
  };
  performance_metrics: {
    average_load_time: number;
    crash_rate: number;
    error_rate: number;
    api_response_time: number;
  };
  device_analytics: {
    platform: { platform: string; count: number }[];
    os_version: { version: string; count: number }[];
    app_version: { version: string; count: number }[];
  };
  geographic_distribution: {
    country: string;
    count: number;
  }[];
  created_at: string;
  updated_at: string;
}

export interface SocialAnalytics {
  total_friendships: number;
  total_groups: number;
  total_group_members: number;
  total_messages: number;
  social_engagement: {
    friend_requests_sent: number;
    friend_requests_accepted: number;
    group_invitations_sent: number;
    group_invitations_accepted: number;
    messages_sent: number;
    messages_received: number;
  };
  network_analysis: {
    average_friends_per_user: number;
    average_groups_per_user: number;
    most_connected_users: { user_id: string; connection_count: number }[];
    most_active_groups: { group_id: string; activity_score: number }[];
  };
  content_analytics: {
    most_shared_events: { event_id: string; share_count: number }[];
    most_active_chats: { group_id: string; message_count: number }[];
    popular_sports: { sport: string; participation_count: number }[];
  };
  created_at: string;
  updated_at: string;
}

export interface LocationAnalytics {
  total_venues: number;
  total_check_ins: number;
  popular_venues: {
    venue_id: string;
    name: string;
    check_ins: number;
    rating: number;
    sports: string[];
  }[];
  geographic_distribution: {
    city: string;
    state: string;
    country: string;
    event_count: number;
    user_count: number;
  }[];
  venue_categories: {
    category: string;
    count: number;
    average_rating: number;
  }[];
  sports_by_location: {
    location: string;
    sports: { sport: string; count: number }[];
  }[];
  created_at: string;
  updated_at: string;
}

export interface AnalyticsFilters {
  date_range?: {
    start_date: string;
    end_date: string;
  };
  user_ids?: string[];
  event_ids?: string[];
  group_ids?: string[];
  sports?: string[];
  locations?: string[];
  age_groups?: string[];
  skill_levels?: string[];
}

export interface AnalyticsTimeframe {
  type: 'hour' | 'day' | 'week' | 'month' | 'year';
  value: number;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  change: number;
  change_type: 'increase' | 'decrease' | 'stable';
  trend: 'up' | 'down' | 'stable';
}

export interface AnalyticsChart {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: { label: string; value: number; color?: string }[];
  x_axis?: string;
  y_axis?: string;
}

export interface AnalyticsDashboard {
  overview_metrics: AnalyticsMetric[];
  charts: AnalyticsChart[];
  insights: string[];
  recommendations: string[];
  last_updated: string;
}

class AnalyticsService {
  // User Analytics
  async getUserAnalytics(userId: string, filters?: AnalyticsFilters): Promise<UserAnalytics | null> {
    try {
      // Get user events
      const { data: userEvents } = await supabase
        .from('events')
        .select('id, created_at, status')
        .eq('created_by', userId);

      const { data: attendedEvents } = await supabase
        .from('event_participants')
        .select('event_id, created_at')
        .eq('user_id', userId);

      // Get user friends
      const { data: friends } = await supabase
        .from('friendships')
        .select('id')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');

      // Get user groups
      const { data: userGroups } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId)
        .eq('status', 'active');

      // Get user messages
      const { data: messages } = await supabase
        .from('group_messages')
        .select('id, created_at')
        .eq('sender_id', userId);

      // Get user check-ins
      const { data: checkIns } = await supabase
        .from('check_ins')
        .select('id, created_at')
        .eq('user_id', userId);

      // Calculate engagement score
      const engagementScore = this.calculateEngagementScore({
        eventsCreated: userEvents?.length || 0,
        eventsAttended: attendedEvents?.length || 0,
        friends: friends?.length || 0,
        groups: userGroups?.length || 0,
        messages: messages?.length || 0,
        checkIns: checkIns?.length || 0,
      });

      // Get activity by day
      const activityByDay = await this.getUserActivityByDay(userId, filters?.date_range);

      // Get favorite sports
      const favoriteSports = await this.getUserFavoriteSports(userId, filters?.date_range);

      // Get favorite venues
      const favoriteVenues = await this.getUserFavoriteVenues(userId, filters?.date_range);

      // Get social connections
      const socialConnections = await this.getUserSocialConnections(userId, filters?.date_range);

      // Get app usage
      const appUsage = await this.getUserAppUsage(userId, filters?.date_range);

      return {
        user_id: userId,
        total_events_created: userEvents?.length || 0,
        total_events_attended: attendedEvents?.length || 0,
        total_friends: friends?.length || 0,
        total_groups: userGroups?.length || 0,
        total_messages_sent: messages?.length || 0,
        total_check_ins: checkIns?.length || 0,
        engagement_score: engagementScore,
        retention_rate: 0, // Would need historical data
        activity_by_day: activityByDay,
        favorite_sports: favoriteSports,
        favorite_venues: favoriteVenues,
        social_connections: socialConnections,
        app_usage: appUsage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return null;
    }
  }

  // Event Analytics
  async getEventAnalytics(eventId: string, filters?: AnalyticsFilters): Promise<EventAnalytics | null> {
    try {
      // Get event details
      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (!event) return null;

      // Get event views
      const { data: views } = await supabase
        .from('event_views')
        .select('id')
        .eq('event_id', eventId);

      // Get event RSVPs
      const { data: rsvps } = await supabase
        .from('event_participants')
        .select('id, status')
        .eq('event_id', eventId);

      // Get event attendees
      const attendees = rsvps?.filter(r => r.status === 'attended') || [];
      const attendanceRate = rsvps?.length ? (attendees.length / rsvps.length) * 100 : 0;

      // Get demographics
      const demographics = await this.getEventDemographics(eventId, filters);

      // Get geographic distribution
      const geographicDistribution = await this.getEventGeographicDistribution(eventId, filters);

      // Get time analysis
      const timeAnalysis = await this.getEventTimeAnalysis(eventId, filters);

      // Get feedback scores
      const feedbackScores = await this.getEventFeedbackScores(eventId);

      // Calculate scores
      const engagementScore = this.calculateEventEngagementScore({
        views: views?.length || 0,
        rsvps: rsvps?.length || 0,
        attendees: attendees.length,
      });

      const popularityScore = this.calculateEventPopularityScore({
        views: views?.length || 0,
        rsvps: rsvps?.length || 0,
        shares: 0, // Would need shares data
      });

      const successRate = this.calculateEventSuccessRate({
        rsvps: rsvps?.length || 0,
        attendees: attendees.length,
        feedback: feedbackScores.overall,
      });

      return {
        event_id: eventId,
        total_views: views?.length || 0,
        total_rsvps: rsvps?.length || 0,
        total_attendees: attendees.length,
        attendance_rate: attendanceRate,
        engagement_score: engagementScore,
        popularity_score: popularityScore,
        success_rate: successRate,
        demographics,
        geographic_distribution: geographicDistribution,
        time_analysis: timeAnalysis,
        feedback_scores: feedbackScores,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching event analytics:', error);
      return null;
    }
  }

  // App Analytics
  async getAppAnalytics(filters?: AnalyticsFilters): Promise<AppAnalytics | null> {
    try {
      // Get total users
      const { data: totalUsers } = await supabase
        .from('users')
        .select('id, created_at');

      // Get active users (users who have been active in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: activeUsers } = await supabase
        .from('users')
        .select('id')
        .gte('last_active', thirtyDaysAgo.toISOString());

      // Get new users
      const { data: newUsers } = await supabase
        .from('users')
        .select('id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Get user retention
      const userRetention = await this.getUserRetention(filters?.date_range);

      // Get app usage
      const appUsage = await this.getAppUsageMetrics(filters?.date_range);

      // Get feature usage
      const featureUsage = await this.getFeatureUsageMetrics(filters?.date_range);

      // Get performance metrics
      const performanceMetrics = await this.getPerformanceMetrics(filters?.date_range);

      // Get device analytics
      const deviceAnalytics = await this.getDeviceAnalytics(filters?.date_range);

      // Get geographic distribution
      const geographicDistribution = await this.getAppGeographicDistribution(filters?.date_range);

      return {
        total_users: totalUsers?.length || 0,
        active_users: activeUsers?.length || 0,
        new_users: newUsers?.length || 0,
        user_retention: userRetention,
        app_usage: appUsage,
        feature_usage: featureUsage,
        performance_metrics: performanceMetrics,
        device_analytics: deviceAnalytics,
        geographic_distribution: geographicDistribution,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching app analytics:', error);
      return null;
    }
  }

  // Social Analytics
  async getSocialAnalytics(filters?: AnalyticsFilters): Promise<SocialAnalytics | null> {
    try {
      // Get total friendships
      const { data: friendships } = await supabase
        .from('friendships')
        .select('id')
        .eq('status', 'accepted');

      // Get total groups
      const { data: groups } = await supabase
        .from('groups')
        .select('id');

      // Get total group members
      const { data: groupMembers } = await supabase
        .from('group_members')
        .select('id')
        .eq('status', 'active');

      // Get total messages
      const { data: messages } = await supabase
        .from('group_messages')
        .select('id');

      // Get social engagement
      const socialEngagement = await this.getSocialEngagementMetrics(filters?.date_range);

      // Get network analysis
      const networkAnalysis = await this.getNetworkAnalysis(filters?.date_range);

      // Get content analytics
      const contentAnalytics = await this.getContentAnalytics(filters?.date_range);

      return {
        total_friendships: friendships?.length || 0,
        total_groups: groups?.length || 0,
        total_group_members: groupMembers?.length || 0,
        total_messages: messages?.length || 0,
        social_engagement: socialEngagement,
        network_analysis: networkAnalysis,
        content_analytics: contentAnalytics,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching social analytics:', error);
      return null;
    }
  }

  // Location Analytics
  async getLocationAnalytics(filters?: AnalyticsFilters): Promise<LocationAnalytics | null> {
    try {
      // Get total venues
      const { data: venues } = await supabase
        .from('venues')
        .select('id');

      // Get total check-ins
      const { data: checkIns } = await supabase
        .from('check_ins')
        .select('id');

      // Get popular venues
      const popularVenues = await this.getPopularVenues(filters?.date_range);

      // Get geographic distribution
      const geographicDistribution = await this.getLocationGeographicDistribution(filters?.date_range);

      // Get venue categories
      const venueCategories = await this.getVenueCategories(filters?.date_range);

      // Get sports by location
      const sportsByLocation = await this.getSportsByLocation(filters?.date_range);

      return {
        total_venues: venues?.length || 0,
        total_check_ins: checkIns?.length || 0,
        popular_venues: popularVenues,
        geographic_distribution: geographicDistribution,
        venue_categories: venueCategories,
        sports_by_location: sportsByLocation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching location analytics:', error);
      return null;
    }
  }

  // Dashboard Analytics
  async getDashboardAnalytics(filters?: AnalyticsFilters): Promise<AnalyticsDashboard | null> {
    try {
      const [appAnalytics, socialAnalytics, locationAnalytics] = await Promise.all([
        this.getAppAnalytics(filters),
        this.getSocialAnalytics(filters),
        this.getLocationAnalytics(filters),
      ]);

      if (!appAnalytics || !socialAnalytics || !locationAnalytics) {
        return null;
      }

      // Create overview metrics
      const overviewMetrics: AnalyticsMetric[] = [
        {
          name: 'Total Users',
          value: appAnalytics.total_users,
          change: 0, // Would need historical data
          change_type: 'stable',
          trend: 'stable',
        },
        {
          name: 'Active Users',
          value: appAnalytics.active_users,
          change: 0,
          change_type: 'stable',
          trend: 'stable',
        },
        {
          name: 'Total Events',
          value: appAnalytics.feature_usage.events_created,
          change: 0,
          change_type: 'stable',
          trend: 'stable',
        },
        {
          name: 'Total Groups',
          value: socialAnalytics.total_groups,
          change: 0,
          change_type: 'stable',
          trend: 'stable',
        },
      ];

      // Create charts
      const charts: AnalyticsChart[] = [
        {
          type: 'line',
          title: 'User Growth',
          data: [], // Would need historical data
          x_axis: 'Date',
          y_axis: 'Users',
        },
        {
          type: 'bar',
          title: 'Feature Usage',
          data: [
            { label: 'Events', value: appAnalytics.feature_usage.events_created },
            { label: 'Messages', value: appAnalytics.feature_usage.messages_sent },
            { label: 'Check-ins', value: appAnalytics.feature_usage.check_ins },
          ],
        },
      ];

      // Generate insights
      const insights = this.generateInsights(appAnalytics, socialAnalytics, locationAnalytics);

      // Generate recommendations
      const recommendations = this.generateRecommendations(appAnalytics, socialAnalytics, locationAnalytics);

      return {
        overview_metrics: overviewMetrics,
        charts,
        insights,
        recommendations,
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      return null;
    }
  }

  // Helper methods
  private calculateEngagementScore(metrics: {
    eventsCreated: number;
    eventsAttended: number;
    friends: number;
    groups: number;
    messages: number;
    checkIns: number;
  }): number {
    const weights = {
      eventsCreated: 0.2,
      eventsAttended: 0.2,
      friends: 0.15,
      groups: 0.15,
      messages: 0.15,
      checkIns: 0.15,
    };

    const score = 
      metrics.eventsCreated * weights.eventsCreated +
      metrics.eventsAttended * weights.eventsAttended +
      metrics.friends * weights.friends +
      metrics.groups * weights.groups +
      metrics.messages * weights.messages +
      metrics.checkIns * weights.checkIns;

    return Math.min(100, Math.max(0, score));
  }

  private calculateEventEngagementScore(metrics: {
    views: number;
    rsvps: number;
    attendees: number;
  }): number {
    const weights = { views: 0.3, rsvps: 0.4, attendees: 0.3 };
    const score = 
      metrics.views * weights.views +
      metrics.rsvps * weights.rsvps +
      metrics.attendees * weights.attendees;
    
    return Math.min(100, Math.max(0, score));
  }

  private calculateEventPopularityScore(metrics: {
    views: number;
    rsvps: number;
    shares: number;
  }): number {
    const weights = { views: 0.4, rsvps: 0.4, shares: 0.2 };
    const score = 
      metrics.views * weights.views +
      metrics.rsvps * weights.rsvps +
      metrics.shares * weights.shares;
    
    return Math.min(100, Math.max(0, score));
  }

  private calculateEventSuccessRate(metrics: {
    rsvps: number;
    attendees: number;
    feedback: number;
  }): number {
    const attendanceRate = metrics.rsvps ? (metrics.attendees / metrics.rsvps) * 100 : 0;
    const feedbackScore = metrics.feedback || 0;
    
    return (attendanceRate + feedbackScore) / 2;
  }

  private async getUserActivityByDay(userId: string, dateRange?: { start_date: string; end_date: string }) {
    // Implementation would query user activity by day
    return [];
  }

  private async getUserFavoriteSports(userId: string, dateRange?: { start_date: string; end_date: string }) {
    // Implementation would query user's favorite sports
    return [];
  }

  private async getUserFavoriteVenues(userId: string, dateRange?: { start_date: string; end_date: string }) {
    // Implementation would query user's favorite venues
    return [];
  }

  private async getUserSocialConnections(userId: string, dateRange?: { start_date: string; end_date: string }) {
    // Implementation would query user's social connections
    return {
      friends_added: 0,
      groups_joined: 0,
      invitations_sent: 0,
      invitations_received: 0,
    };
  }

  private async getUserAppUsage(userId: string, dateRange?: { start_date: string; end_date: string }) {
    // Implementation would query user's app usage
    return {
      total_sessions: 0,
      average_session_duration: 0,
      most_active_hours: [],
      most_active_days: [],
    };
  }

  private async getEventDemographics(eventId: string, filters?: AnalyticsFilters) {
    // Implementation would query event demographics
    return {
      age_groups: [],
      gender_distribution: [],
      skill_levels: [],
    };
  }

  private async getEventGeographicDistribution(eventId: string, filters?: AnalyticsFilters) {
    // Implementation would query event geographic distribution
    return [];
  }

  private async getEventTimeAnalysis(eventId: string, filters?: AnalyticsFilters) {
    // Implementation would query event time analysis
    return [];
  }

  private async getEventFeedbackScores(eventId: string) {
    // Implementation would query event feedback scores
    return {
      overall: 0,
      venue: 0,
      organization: 0,
      value: 0,
    };
  }

  private async getUserRetention(dateRange?: { start_date: string; end_date: string }) {
    // Implementation would calculate user retention
    return {
      day_1: 0,
      day_7: 0,
      day_30: 0,
    };
  }

  private async getAppUsageMetrics(dateRange?: { start_date: string; end_date: string }) {
    // Implementation would query app usage metrics
    return {
      total_sessions: 0,
      average_session_duration: 0,
      sessions_per_user: 0,
    };
  }

  private async getFeatureUsageMetrics(dateRange?: { start_date: string; end_date: string }) {
    // Implementation would query feature usage metrics
    return {
      events_created: 0,
      events_attended: 0,
      friends_added: 0,
      groups_created: 0,
      messages_sent: 0,
      check_ins: 0,
    };
  }

  private async getPerformanceMetrics(dateRange?: { start_date: string; end_date: string }) {
    // Implementation would query performance metrics
    return {
      average_load_time: 0,
      crash_rate: 0,
      error_rate: 0,
      api_response_time: 0,
    };
  }

  private async getDeviceAnalytics(dateRange?: { start_date: string; end_date: string }) {
    // Implementation would query device analytics
    return {
      platform: [],
      os_version: [],
      app_version: [],
    };
  }

  private async getAppGeographicDistribution(dateRange?: { start_date: string; end_date: string }) {
    // Implementation would query app geographic distribution
    return [];
  }

  private async getSocialEngagementMetrics(dateRange?: { start_date: string; end_date: string }) {
    // Implementation would query social engagement metrics
    return {
      friend_requests_sent: 0,
      friend_requests_accepted: 0,
      group_invitations_sent: 0,
      group_invitations_accepted: 0,
      messages_sent: 0,
      messages_received: 0,
    };
  }

  private async getNetworkAnalysis(dateRange?: { start_date: string; end_date: string }) {
    // Implementation would query network analysis
    return {
      average_friends_per_user: 0,
      average_groups_per_user: 0,
      most_connected_users: [],
      most_active_groups: [],
    };
  }

  private async getContentAnalytics(dateRange?: { start_date: string; end_date: string }) {
    // Implementation would query content analytics
    return {
      most_shared_events: [],
      most_active_chats: [],
      popular_sports: [],
    };
  }

  private async getPopularVenues(dateRange?: { start_date: string; end_date: string }) {
    // Implementation would query popular venues
    return [];
  }

  private async getLocationGeographicDistribution(dateRange?: { start_date: string; end_date: string }) {
    // Implementation would query location geographic distribution
    return [];
  }

  private async getVenueCategories(dateRange?: { start_date: string; end_date: string }) {
    // Implementation would query venue categories
    return [];
  }

  private async getSportsByLocation(dateRange?: { start_date: string; end_date: string }) {
    // Implementation would query sports by location
    return [];
  }

  private generateInsights(appAnalytics: AppAnalytics, socialAnalytics: SocialAnalytics, locationAnalytics: LocationAnalytics): string[] {
    const insights: string[] = [];
    
    if (appAnalytics.active_users > 0) {
      insights.push(`Active user rate: ${((appAnalytics.active_users / appAnalytics.total_users) * 100).toFixed(1)}%`);
    }
    
    if (socialAnalytics.total_groups > 0) {
      insights.push(`Average group size: ${(socialAnalytics.total_group_members / socialAnalytics.total_groups).toFixed(1)} members`);
    }
    
    return insights;
  }

  private generateRecommendations(appAnalytics: AppAnalytics, socialAnalytics: SocialAnalytics, locationAnalytics: LocationAnalytics): string[] {
    const recommendations: string[] = [];
    
    if (appAnalytics.user_retention.day_7 < 50) {
      recommendations.push('Consider implementing user onboarding improvements to increase 7-day retention');
    }
    
    if (socialAnalytics.total_groups < appAnalytics.total_users * 0.1) {
      recommendations.push('Encourage more group creation to increase social engagement');
    }
    
    return recommendations;
  }
}

// Create and export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
