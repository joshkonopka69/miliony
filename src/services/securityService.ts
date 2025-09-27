import { supabase } from './supabase';

// Security types and interfaces
export interface SecurityThreat {
  id: string;
  type: 'spam' | 'bot' | 'malware' | 'phishing' | 'ddos' | 'brute_force' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  description: string;
  detected_at: string;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  mitigation?: string;
  created_at: string;
  updated_at: string;
}

export interface SecurityEvent {
  id: string;
  user_id?: string;
  ip_address: string;
  user_agent: string;
  event_type: 'login' | 'logout' | 'failed_login' | 'suspicious_activity' | 'data_access' | 'content_creation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: { [key: string]: any };
  location?: {
    country: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  created_at: string;
}

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  type: 'rate_limit' | 'ip_block' | 'content_filter' | 'behavior_analysis' | 'geo_restriction';
  conditions: { [key: string]: any };
  action: 'block' | 'flag' | 'rate_limit' | 'notify' | 'log';
  enabled: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface SecurityAlert {
  id: string;
  rule_id: string;
  user_id?: string;
  ip_address: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  assigned_to?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
}

export interface SecurityAnalytics {
  total_threats: number;
  threats_by_type: { type: string; count: number }[];
  threats_by_severity: { severity: string; count: number }[];
  blocked_ips: number;
  rate_limited_requests: number;
  false_positive_rate: number;
  average_response_time: number;
  security_score: number;
}

export interface SecurityFilters {
  type?: string;
  severity?: string;
  status?: string;
  date_range?: {
    start_date: string;
    end_date: string;
  };
  ip_address?: string;
  user_id?: string;
}

export interface SecurityConfig {
  id: string;
  key: string;
  value: any;
  description: string;
  category: 'authentication' | 'rate_limiting' | 'content_filtering' | 'monitoring' | 'notifications';
  updated_at: string;
}

class SecurityService {
  // Threat Detection
  async detectThreat(event: SecurityEvent): Promise<SecurityThreat | null> {
    try {
      // Analyze event for threats
      const threatAnalysis = await this.analyzeEvent(event);
      
      if (threatAnalysis.isThreat) {
        const threat: SecurityThreat = {
          id: `threat_${Date.now()}`,
          type: threatAnalysis.type,
          severity: threatAnalysis.severity,
          source: event.ip_address,
          target: event.user_id || 'system',
          description: threatAnalysis.description,
          detected_at: new Date().toISOString(),
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Save threat
        const { data, error } = await supabase
          .from('security_threats')
          .insert(threat)
          .select()
          .single();

        if (error) {
          console.error('Error saving security threat:', error);
          return null;
        }

        // Create alert
        await this.createSecurityAlert(threat);

        // Take mitigation action
        await this.mitigateThreat(threat);

        return data;
      }

      return null;
    } catch (error) {
      console.error('Error detecting threat:', error);
      return null;
    }
  }

  // Security Rules
  async getSecurityRules(): Promise<SecurityRule[]> {
    try {
      const { data, error } = await supabase
        .from('security_rules')
        .select('*')
        .eq('enabled', true)
        .order('priority', { ascending: false });

      if (error) {
        console.error('Error fetching security rules:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching security rules:', error);
      return [];
    }
  }

  async createSecurityRule(rule: Omit<SecurityRule, 'id' | 'created_at' | 'updated_at'>): Promise<SecurityRule | null> {
    try {
      const { data, error } = await supabase
        .from('security_rules')
        .insert({
          ...rule,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating security rule:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating security rule:', error);
      return null;
    }
  }

  // Security Alerts
  async getSecurityAlerts(filters?: SecurityFilters): Promise<SecurityAlert[]> {
    try {
      let query = supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.date_range) {
        query = query
          .gte('created_at', filters.date_range.start_date)
          .lte('created_at', filters.date_range.end_date);
      }

      if (filters?.ip_address) {
        query = query.eq('ip_address', filters.ip_address);
      }

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching security alerts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      return [];
    }
  }

  async createSecurityAlert(threat: SecurityThreat): Promise<SecurityAlert | null> {
    try {
      const alert: SecurityAlert = {
        id: `alert_${Date.now()}`,
        rule_id: 'auto_detection',
        user_id: threat.target !== 'system' ? threat.target : undefined,
        ip_address: threat.source,
        severity: threat.severity,
        title: `Security Threat Detected: ${threat.type}`,
        description: threat.description,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('security_alerts')
        .insert(alert)
        .select()
        .single();

      if (error) {
        console.error('Error creating security alert:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating security alert:', error);
      return null;
    }
  }

  async updateAlertStatus(alertId: string, status: string, resolution?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .update({
          status,
          resolution,
          updated_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) {
        console.error('Error updating alert status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating alert status:', error);
      return false;
    }
  }

  // Rate Limiting
  async checkRateLimit(identifier: string, action: string, limit: number, window: number): Promise<boolean> {
    try {
      const windowStart = new Date(Date.now() - window * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('rate_limits')
        .select('count')
        .eq('identifier', identifier)
        .eq('action', action)
        .gte('created_at', windowStart);

      if (error) {
        console.error('Error checking rate limit:', error);
        return true; // Allow if error
      }

      const currentCount = data?.reduce((sum, record) => sum + record.count, 0) || 0;
      
      if (currentCount >= limit) {
        return false; // Rate limit exceeded
      }

      // Record this request
      await supabase
        .from('rate_limits')
        .insert({
          identifier,
          action,
          count: 1,
          created_at: new Date().toISOString(),
        });

      return true;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return true; // Allow if error
    }
  }

  // IP Blocking
  async isIPBlocked(ipAddress: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('blocked_ips')
        .select('id')
        .eq('ip_address', ipAddress)
        .eq('active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking IP block:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking IP block:', error);
      return false;
    }
  }

  async blockIP(ipAddress: string, reason: string, duration?: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('blocked_ips')
        .insert({
          ip_address: ipAddress,
          reason,
          duration,
          active: true,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error blocking IP:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error blocking IP:', error);
      return false;
    }
  }

  async unblockIP(ipAddress: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('blocked_ips')
        .update({
          active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('ip_address', ipAddress);

      if (error) {
        console.error('Error unblocking IP:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error unblocking IP:', error);
      return false;
    }
  }

  // Security Analytics
  async getSecurityAnalytics(filters?: SecurityFilters): Promise<SecurityAnalytics | null> {
    try {
      // Get total threats
      const { data: totalThreats } = await supabase
        .from('security_threats')
        .select('id');

      // Get threats by type
      const { data: threatsByType } = await supabase
        .from('security_threats')
        .select('type');

      // Get threats by severity
      const { data: threatsBySeverity } = await supabase
        .from('security_threats')
        .select('severity');

      // Get blocked IPs
      const { data: blockedIPs } = await supabase
        .from('blocked_ips')
        .select('id')
        .eq('active', true);

      // Get rate limited requests
      const { data: rateLimitedRequests } = await supabase
        .from('rate_limits')
        .select('count');

      const typeCounts = this.calculateTypeCounts(threatsByType || []);
      const severityCounts = this.calculateSeverityCounts(threatsBySeverity || []);
      const totalRateLimited = rateLimitedRequests?.reduce((sum, record) => sum + record.count, 0) || 0;

      return {
        total_threats: totalThreats?.length || 0,
        threats_by_type: typeCounts,
        threats_by_severity: severityCounts,
        blocked_ips: blockedIPs?.length || 0,
        rate_limited_requests: totalRateLimited,
        false_positive_rate: 0, // Would need historical data
        average_response_time: 0, // Would need historical data
        security_score: this.calculateSecurityScore(totalThreats?.length || 0, blockedIPs?.length || 0),
      };
    } catch (error) {
      console.error('Error fetching security analytics:', error);
      return null;
    }
  }

  // Security Configuration
  async getSecurityConfig(category?: string): Promise<SecurityConfig[]> {
    try {
      let query = supabase
        .from('security_config')
        .select('*')
        .order('category', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching security config:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching security config:', error);
      return [];
    }
  }

  async updateSecurityConfig(key: string, value: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('security_config')
        .update({
          value,
          updated_at: new Date().toISOString(),
        })
        .eq('key', key);

      if (error) {
        console.error('Error updating security config:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating security config:', error);
      return false;
    }
  }

  // Helper methods
  private async analyzeEvent(event: SecurityEvent): Promise<{
    isThreat: boolean;
    type: SecurityThreat['type'];
    severity: SecurityThreat['severity'];
    description: string;
  }> {
    // Implement threat detection logic
    const analysis = {
      isThreat: false,
      type: 'suspicious_activity' as SecurityThreat['type'],
      severity: 'low' as SecurityThreat['severity'],
      description: '',
    };

    // Check for brute force attacks
    if (event.event_type === 'failed_login') {
      const failedAttempts = await this.getFailedLoginAttempts(event.ip_address, 15); // 15 minutes
      if (failedAttempts > 5) {
        analysis.isThreat = true;
        analysis.type = 'brute_force';
        analysis.severity = 'high';
        analysis.description = `Brute force attack detected from ${event.ip_address}`;
      }
    }

    // Check for suspicious activity
    if (event.event_type === 'suspicious_activity') {
      analysis.isThreat = true;
      analysis.type = 'suspicious_activity';
      analysis.severity = 'medium';
      analysis.description = `Suspicious activity detected from ${event.ip_address}`;
    }

    // Check for bot activity
    if (this.isBotUserAgent(event.user_agent)) {
      analysis.isThreat = true;
      analysis.type = 'bot';
      analysis.severity = 'medium';
      analysis.description = `Bot activity detected from ${event.ip_address}`;
    }

    return analysis;
  }

  private async getFailedLoginAttempts(ipAddress: string, minutes: number): Promise<number> {
    try {
      const windowStart = new Date(Date.now() - minutes * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('security_events')
        .select('id')
        .eq('ip_address', ipAddress)
        .eq('event_type', 'failed_login')
        .gte('created_at', windowStart);

      if (error) {
        console.error('Error getting failed login attempts:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error getting failed login attempts:', error);
      return 0;
    }
  }

  private isBotUserAgent(userAgent: string): boolean {
    const botPatterns = [
      'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python', 'java'
    ];
    
    const lowerUA = userAgent.toLowerCase();
    return botPatterns.some(pattern => lowerUA.includes(pattern));
  }

  private async mitigateThreat(threat: SecurityThreat): Promise<void> {
    try {
      switch (threat.type) {
        case 'brute_force':
          await this.blockIP(threat.source, 'Brute force attack detected');
          break;
        case 'bot':
          await this.blockIP(threat.source, 'Bot activity detected');
          break;
        case 'spam':
          // Implement spam mitigation
          break;
        case 'ddos':
          // Implement DDoS mitigation
          break;
        default:
          // Log threat for manual review
          break;
      }
    } catch (error) {
      console.error('Error mitigating threat:', error);
    }
  }

  private calculateTypeCounts(threats: any[]): { type: string; count: number }[] {
    const counts: { [key: string]: number } = {};
    
    threats.forEach(threat => {
      const type = threat.type;
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateSeverityCounts(threats: any[]): { severity: string; count: number }[] {
    const counts: { [key: string]: number } = {};
    
    threats.forEach(threat => {
      const severity = threat.severity;
      counts[severity] = (counts[severity] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([severity, count]) => ({ severity, count }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateSecurityScore(totalThreats: number, blockedIPs: number): number {
    // Simple security score calculation
    const threatScore = Math.max(0, 100 - (totalThreats * 2));
    const blockScore = Math.min(100, blockedIPs * 5);
    
    return Math.round((threatScore + blockScore) / 2);
  }
}

// Create and export singleton instance
export const securityService = new SecurityService();
export default securityService;
