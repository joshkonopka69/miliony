import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  moderationService,
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
  reportingService,
  ReportCategory,
  ReportTemplate,
  ReportSubmission,
  ReportAnalytics,
  ReportFilters
} from '../services/reportingService';
import { 
  securityService,
  SecurityThreat,
  SecurityEvent,
  SecurityAlert,
  SecurityAnalytics,
  SecurityFilters
} from '../services/securityService';

interface ModerationContextType {
  // State
  moderationQueue: ModerationQueue[];
  contentReports: ContentReport[];
  moderationActions: ModerationAction[];
  userModerationStatus: UserModerationStatus | null;
  moderationAnalytics: ModerationAnalytics | null;
  
  // Report State
  reportCategories: ReportCategory[];
  reportTemplates: ReportTemplate[];
  reportSubmissions: ReportSubmission[];
  reportAnalytics: ReportAnalytics | null;
  
  // Security State
  securityThreats: SecurityThreat[];
  securityAlerts: SecurityAlert[];
  securityAnalytics: SecurityAnalytics | null;
  
  // Appeal State
  appealRequests: AppealRequest[];
  
  // Loading States
  isLoading: boolean;
  isModerating: boolean;
  isReporting: boolean;
  isSecurityProcessing: boolean;
  
  // Error States
  error: string | null;
  reportError: string | null;
  securityError: string | null;
  
  // Moderation Actions
  moderateContent: (content: any) => Promise<ContentModeration | null>;
  reportContent: (report: Omit<ContentReport, 'id' | 'created_at' | 'updated_at'>) => Promise<ContentReport | null>;
  takeModerationAction: (action: Omit<ModerationAction, 'id' | 'created_at'>) => Promise<ModerationAction | null>;
  getModerationQueue: (filters?: ModerationFilters) => Promise<ModerationQueue[]>;
  getUserModerationStatus: (userId: string) => Promise<UserModerationStatus | null>;
  blockUser: (userId: string, reason: string, duration?: number) => Promise<boolean>;
  unblockUser: (userId: string, reason: string) => Promise<boolean>;
  getModerationAnalytics: (filters?: ModerationFilters) => Promise<ModerationAnalytics | null>;
  
  // Report Actions
  getReportCategories: () => Promise<ReportCategory[]>;
  getReportTemplates: (categoryId?: string) => Promise<ReportTemplate[]>;
  submitReport: (report: Omit<ReportSubmission, 'id' | 'created_at' | 'updated_at'>) => Promise<ReportSubmission | null>;
  getReportSubmissions: (filters?: ReportFilters) => Promise<ReportSubmission[]>;
  updateReportStatus: (reportId: string, status: string, resolution?: string) => Promise<boolean>;
  getReportAnalytics: (filters?: ReportFilters) => Promise<ReportAnalytics | null>;
  
  // Security Actions
  detectThreat: (event: SecurityEvent) => Promise<SecurityThreat | null>;
  getSecurityAlerts: (filters?: SecurityFilters) => Promise<SecurityAlert[]>;
  updateAlertStatus: (alertId: string, status: string, resolution?: string) => Promise<boolean>;
  checkRateLimit: (identifier: string, action: string, limit: number, window: number) => Promise<boolean>;
  isIPBlocked: (ipAddress: string) => Promise<boolean>;
  blockIP: (ipAddress: string, reason: string, duration?: number) => Promise<boolean>;
  unblockIP: (ipAddress: string) => Promise<boolean>;
  getSecurityAnalytics: (filters?: SecurityFilters) => Promise<SecurityAnalytics | null>;
  
  // Appeal Actions
  createAppealRequest: (appeal: Omit<AppealRequest, 'id' | 'created_at' | 'updated_at'>) => Promise<AppealRequest | null>;
  getAppealRequests: (filters?: { status?: string; user_id?: string }) => Promise<AppealRequest[]>;
  reviewAppeal: (appealId: string, decision: 'approved' | 'denied', moderatorNotes?: string) => Promise<boolean>;
  
  // Utility Actions
  clearError: () => void;
  clearReportError: () => void;
  clearSecurityError: () => void;
  refreshModeration: (filters?: ModerationFilters) => Promise<void>;
  refreshReports: (filters?: ReportFilters) => Promise<void>;
  refreshSecurity: (filters?: SecurityFilters) => Promise<void>;
}

const ModerationContext = createContext<ModerationContextType | undefined>(undefined);

interface ModerationProviderProps {
  children: ReactNode;
}

export function ModerationProvider({ children }: ModerationProviderProps) {
  // State
  const [moderationQueue, setModerationQueue] = useState<ModerationQueue[]>([]);
  const [contentReports, setContentReports] = useState<ContentReport[]>([]);
  const [moderationActions, setModerationActions] = useState<ModerationAction[]>([]);
  const [userModerationStatus, setUserModerationStatus] = useState<UserModerationStatus | null>(null);
  const [moderationAnalytics, setModerationAnalytics] = useState<ModerationAnalytics | null>(null);
  
  // Report State
  const [reportCategories, setReportCategories] = useState<ReportCategory[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [reportSubmissions, setReportSubmissions] = useState<ReportSubmission[]>([]);
  const [reportAnalytics, setReportAnalytics] = useState<ReportAnalytics | null>(null);
  
  // Security State
  const [securityThreats, setSecurityThreats] = useState<SecurityThreat[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [securityAnalytics, setSecurityAnalytics] = useState<SecurityAnalytics | null>(null);
  
  // Appeal State
  const [appealRequests, setAppealRequests] = useState<AppealRequest[]>([]);
  
  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isModerating, setIsModerating] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isSecurityProcessing, setIsSecurityProcessing] = useState(false);
  
  // Error States
  const [error, setError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // Moderation Actions
  const moderateContent = async (content: any): Promise<ContentModeration | null> => {
    try {
      setIsModerating(true);
      setError(null);

      const result = await moderationService.moderateContent(content);
      return result;
    } catch (error) {
      console.error('Error moderating content:', error);
      setError('Failed to moderate content');
      return null;
    } finally {
      setIsModerating(false);
    }
  };

  const reportContent = async (report: Omit<ContentReport, 'id' | 'created_at' | 'updated_at'>): Promise<ContentReport | null> => {
    try {
      setIsReporting(true);
      setReportError(null);

      const result = await moderationService.reportContent(report);
      if (result) {
        setContentReports(prev => [result, ...prev]);
      }
      return result;
    } catch (error) {
      console.error('Error reporting content:', error);
      setReportError('Failed to report content');
      return null;
    } finally {
      setIsReporting(false);
    }
  };

  const takeModerationAction = async (action: Omit<ModerationAction, 'id' | 'created_at'>): Promise<ModerationAction | null> => {
    try {
      setIsModerating(true);
      setError(null);

      const result = await moderationService.takeModerationAction(action);
      if (result) {
        setModerationActions(prev => [result, ...prev]);
      }
      return result;
    } catch (error) {
      console.error('Error taking moderation action:', error);
      setError('Failed to take moderation action');
      return null;
    } finally {
      setIsModerating(false);
    }
  };

  const getModerationQueue = async (filters?: ModerationFilters): Promise<ModerationQueue[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await moderationService.getModerationQueue(filters);
      setModerationQueue(result);
      return result;
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
      setError('Failed to load moderation queue');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getUserModerationStatus = async (userId: string): Promise<UserModerationStatus | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await moderationService.getUserModerationStatus(userId);
      setUserModerationStatus(result);
      return result;
    } catch (error) {
      console.error('Error fetching user moderation status:', error);
      setError('Failed to load user moderation status');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const blockUser = async (userId: string, reason: string, duration?: number): Promise<boolean> => {
    try {
      setIsModerating(true);
      setError(null);

      const result = await moderationService.blockUser(userId, reason, duration);
      if (result) {
        // Refresh user moderation status
        await getUserModerationStatus(userId);
      }
      return result;
    } catch (error) {
      console.error('Error blocking user:', error);
      setError('Failed to block user');
      return false;
    } finally {
      setIsModerating(false);
    }
  };

  const unblockUser = async (userId: string, reason: string): Promise<boolean> => {
    try {
      setIsModerating(true);
      setError(null);

      const result = await moderationService.unblockUser(userId, reason);
      if (result) {
        // Refresh user moderation status
        await getUserModerationStatus(userId);
      }
      return result;
    } catch (error) {
      console.error('Error unblocking user:', error);
      setError('Failed to unblock user');
      return false;
    } finally {
      setIsModerating(false);
    }
  };

  const getModerationAnalytics = async (filters?: ModerationFilters): Promise<ModerationAnalytics | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await moderationService.getModerationAnalytics(filters);
      setModerationAnalytics(result);
      return result;
    } catch (error) {
      console.error('Error fetching moderation analytics:', error);
      setError('Failed to load moderation analytics');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Report Actions
  const getReportCategories = async (): Promise<ReportCategory[]> => {
    try {
      setIsLoading(true);
      setReportError(null);

      const result = await reportingService.getReportCategories();
      setReportCategories(result);
      return result;
    } catch (error) {
      console.error('Error fetching report categories:', error);
      setReportError('Failed to load report categories');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getReportTemplates = async (categoryId?: string): Promise<ReportTemplate[]> => {
    try {
      setIsLoading(true);
      setReportError(null);

      const result = await reportingService.getReportTemplates(categoryId);
      setReportTemplates(result);
      return result;
    } catch (error) {
      console.error('Error fetching report templates:', error);
      setReportError('Failed to load report templates');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const submitReport = async (report: Omit<ReportSubmission, 'id' | 'created_at' | 'updated_at'>): Promise<ReportSubmission | null> => {
    try {
      setIsReporting(true);
      setReportError(null);

      const result = await reportingService.submitReport(report);
      if (result) {
        setReportSubmissions(prev => [result, ...prev]);
      }
      return result;
    } catch (error) {
      console.error('Error submitting report:', error);
      setReportError('Failed to submit report');
      return null;
    } finally {
      setIsReporting(false);
    }
  };

  const getReportSubmissions = async (filters?: ReportFilters): Promise<ReportSubmission[]> => {
    try {
      setIsLoading(true);
      setReportError(null);

      const result = await reportingService.getReportSubmissions(filters);
      setReportSubmissions(result);
      return result;
    } catch (error) {
      console.error('Error fetching report submissions:', error);
      setReportError('Failed to load report submissions');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string, resolution?: string): Promise<boolean> => {
    try {
      setIsReporting(true);
      setReportError(null);

      const result = await reportingService.updateReportStatus(reportId, status, resolution);
      if (result) {
        // Refresh report submissions
        await getReportSubmissions();
      }
      return result;
    } catch (error) {
      console.error('Error updating report status:', error);
      setReportError('Failed to update report status');
      return false;
    } finally {
      setIsReporting(false);
    }
  };

  const getReportAnalytics = async (filters?: ReportFilters): Promise<ReportAnalytics | null> => {
    try {
      setIsLoading(true);
      setReportError(null);

      const result = await reportingService.getReportAnalytics(filters);
      setReportAnalytics(result);
      return result;
    } catch (error) {
      console.error('Error fetching report analytics:', error);
      setReportError('Failed to load report analytics');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Security Actions
  const detectThreat = async (event: SecurityEvent): Promise<SecurityThreat | null> => {
    try {
      setIsSecurityProcessing(true);
      setSecurityError(null);

      const result = await securityService.detectThreat(event);
      if (result) {
        setSecurityThreats(prev => [result, ...prev]);
      }
      return result;
    } catch (error) {
      console.error('Error detecting threat:', error);
      setSecurityError('Failed to detect threat');
      return null;
    } finally {
      setIsSecurityProcessing(false);
    }
  };

  const getSecurityAlerts = async (filters?: SecurityFilters): Promise<SecurityAlert[]> => {
    try {
      setIsLoading(true);
      setSecurityError(null);

      const result = await securityService.getSecurityAlerts(filters);
      setSecurityAlerts(result);
      return result;
    } catch (error) {
      console.error('Error fetching security alerts:', error);
      setSecurityError('Failed to load security alerts');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const updateAlertStatus = async (alertId: string, status: string, resolution?: string): Promise<boolean> => {
    try {
      setIsSecurityProcessing(true);
      setSecurityError(null);

      const result = await securityService.updateAlertStatus(alertId, status, resolution);
      if (result) {
        // Refresh security alerts
        await getSecurityAlerts();
      }
      return result;
    } catch (error) {
      console.error('Error updating alert status:', error);
      setSecurityError('Failed to update alert status');
      return false;
    } finally {
      setIsSecurityProcessing(false);
    }
  };

  const checkRateLimit = async (identifier: string, action: string, limit: number, window: number): Promise<boolean> => {
    try {
      return await securityService.checkRateLimit(identifier, action, limit, window);
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return true; // Allow if error
    }
  };

  const isIPBlocked = async (ipAddress: string): Promise<boolean> => {
    try {
      return await securityService.isIPBlocked(ipAddress);
    } catch (error) {
      console.error('Error checking IP block:', error);
      return false;
    }
  };

  const blockIP = async (ipAddress: string, reason: string, duration?: number): Promise<boolean> => {
    try {
      setIsSecurityProcessing(true);
      setSecurityError(null);

      const result = await securityService.blockIP(ipAddress, reason, duration);
      return result;
    } catch (error) {
      console.error('Error blocking IP:', error);
      setSecurityError('Failed to block IP');
      return false;
    } finally {
      setIsSecurityProcessing(false);
    }
  };

  const unblockIP = async (ipAddress: string): Promise<boolean> => {
    try {
      setIsSecurityProcessing(true);
      setSecurityError(null);

      const result = await securityService.unblockIP(ipAddress);
      return result;
    } catch (error) {
      console.error('Error unblocking IP:', error);
      setSecurityError('Failed to unblock IP');
      return false;
    } finally {
      setIsSecurityProcessing(false);
    }
  };

  const getSecurityAnalytics = async (filters?: SecurityFilters): Promise<SecurityAnalytics | null> => {
    try {
      setIsLoading(true);
      setSecurityError(null);

      const result = await securityService.getSecurityAnalytics(filters);
      setSecurityAnalytics(result);
      return result;
    } catch (error) {
      console.error('Error fetching security analytics:', error);
      setSecurityError('Failed to load security analytics');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Appeal Actions
  const createAppealRequest = async (appeal: Omit<AppealRequest, 'id' | 'created_at' | 'updated_at'>): Promise<AppealRequest | null> => {
    try {
      setIsModerating(true);
      setError(null);

      const result = await moderationService.createAppealRequest(appeal);
      if (result) {
        setAppealRequests(prev => [result, ...prev]);
      }
      return result;
    } catch (error) {
      console.error('Error creating appeal request:', error);
      setError('Failed to create appeal request');
      return null;
    } finally {
      setIsModerating(false);
    }
  };

  const getAppealRequests = async (filters?: { status?: string; user_id?: string }): Promise<AppealRequest[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await moderationService.getAppealRequests(filters);
      setAppealRequests(result);
      return result;
    } catch (error) {
      console.error('Error fetching appeal requests:', error);
      setError('Failed to load appeal requests');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const reviewAppeal = async (appealId: string, decision: 'approved' | 'denied', moderatorNotes?: string): Promise<boolean> => {
    try {
      setIsModerating(true);
      setError(null);

      const result = await moderationService.reviewAppeal(appealId, decision, moderatorNotes);
      if (result) {
        // Refresh appeal requests
        await getAppealRequests();
      }
      return result;
    } catch (error) {
      console.error('Error reviewing appeal:', error);
      setError('Failed to review appeal');
      return false;
    } finally {
      setIsModerating(false);
    }
  };

  // Utility Actions
  const clearError = (): void => {
    setError(null);
  };

  const clearReportError = (): void => {
    setReportError(null);
  };

  const clearSecurityError = (): void => {
    setSecurityError(null);
  };

  const refreshModeration = async (filters?: ModerationFilters): Promise<void> => {
    await Promise.all([
      getModerationQueue(filters),
      getModerationAnalytics(filters),
    ]);
  };

  const refreshReports = async (filters?: ReportFilters): Promise<void> => {
    await Promise.all([
      getReportCategories(),
      getReportTemplates(),
      getReportSubmissions(filters),
      getReportAnalytics(filters),
    ]);
  };

  const refreshSecurity = async (filters?: SecurityFilters): Promise<void> => {
    await Promise.all([
      getSecurityAlerts(filters),
      getSecurityAnalytics(filters),
    ]);
  };

  const contextValue: ModerationContextType = {
    // State
    moderationQueue,
    contentReports,
    moderationActions,
    userModerationStatus,
    moderationAnalytics,
    reportCategories,
    reportTemplates,
    reportSubmissions,
    reportAnalytics,
    securityThreats,
    securityAlerts,
    securityAnalytics,
    appealRequests,
    
    // Loading States
    isLoading,
    isModerating,
    isReporting,
    isSecurityProcessing,
    
    // Error States
    error,
    reportError,
    securityError,
    
    // Moderation Actions
    moderateContent,
    reportContent,
    takeModerationAction,
    getModerationQueue,
    getUserModerationStatus,
    blockUser,
    unblockUser,
    getModerationAnalytics,
    
    // Report Actions
    getReportCategories,
    getReportTemplates,
    submitReport,
    getReportSubmissions,
    updateReportStatus,
    getReportAnalytics,
    
    // Security Actions
    detectThreat,
    getSecurityAlerts,
    updateAlertStatus,
    checkRateLimit,
    isIPBlocked,
    blockIP,
    unblockIP,
    getSecurityAnalytics,
    
    // Appeal Actions
    createAppealRequest,
    getAppealRequests,
    reviewAppeal,
    
    // Utility Actions
    clearError,
    clearReportError,
    clearSecurityError,
    refreshModeration,
    refreshReports,
    refreshSecurity,
  };

  return (
    <ModerationContext.Provider value={contextValue}>
      {children}
    </ModerationContext.Provider>
  );
}

export function useModeration(): ModerationContextType {
  const context = useContext(ModerationContext);
  if (context === undefined) {
    throw new Error('useModeration must be used within a ModerationProvider');
  }
  return context;
}
