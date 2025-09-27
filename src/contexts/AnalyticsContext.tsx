import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  analyticsService,
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
  reportingService,
  ReportConfig,
  ReportData,
  UserReport,
  EventReport,
  AppReport,
  SocialReport,
  LocationReport,
  CustomReport
} from '../services/reportingService';

interface AnalyticsContextType {
  // State
  userAnalytics: UserAnalytics | null;
  eventAnalytics: EventAnalytics | null;
  appAnalytics: AppAnalytics | null;
  socialAnalytics: SocialAnalytics | null;
  locationAnalytics: LocationAnalytics | null;
  dashboardAnalytics: AnalyticsDashboard | null;
  
  // Report State
  reportConfigs: ReportConfig[];
  reportHistory: ReportData[];
  currentReport: CustomReport | null;
  
  // Loading States
  isLoading: boolean;
  isGeneratingReport: boolean;
  isExportingReport: boolean;
  
  // Error States
  error: string | null;
  reportError: string | null;
  
  // Analytics Actions
  getUserAnalytics: (userId: string, filters?: AnalyticsFilters) => Promise<UserAnalytics | null>;
  getEventAnalytics: (eventId: string, filters?: AnalyticsFilters) => Promise<EventAnalytics | null>;
  getAppAnalytics: (filters?: AnalyticsFilters) => Promise<AppAnalytics | null>;
  getSocialAnalytics: (filters?: AnalyticsFilters) => Promise<SocialAnalytics | null>;
  getLocationAnalytics: (filters?: AnalyticsFilters) => Promise<LocationAnalytics | null>;
  getDashboardAnalytics: (filters?: AnalyticsFilters) => Promise<AnalyticsDashboard | null>;
  
  // Report Actions
  createReportConfig: (config: Omit<ReportConfig, 'id' | 'created_at' | 'updated_at'>) => Promise<ReportConfig | null>;
  getReportConfig: (configId: string) => Promise<ReportConfig | null>;
  updateReportConfig: (configId: string, updates: Partial<ReportConfig>) => Promise<boolean>;
  deleteReportConfig: (configId: string) => Promise<boolean>;
  
  // Report Generation
  generateUserReport: (userId: string, filters: AnalyticsFilters) => Promise<UserReport | null>;
  generateEventReport: (eventId: string, filters: AnalyticsFilters) => Promise<EventReport | null>;
  generateAppReport: (filters: AnalyticsFilters) => Promise<AppReport | null>;
  generateSocialReport: (filters: AnalyticsFilters) => Promise<SocialReport | null>;
  generateLocationReport: (filters: AnalyticsFilters) => Promise<LocationReport | null>;
  generateCustomReport: (config: ReportConfig) => Promise<CustomReport | null>;
  
  // Report Management
  exportReport: (report: CustomReport, format: 'pdf' | 'csv' | 'excel' | 'json') => Promise<string | null>;
  scheduleReport: (configId: string, schedule: ReportConfig['schedule']) => Promise<boolean>;
  getReportHistory: (configId: string, limit?: number, offset?: number) => Promise<ReportData[]>;
  
  // Utility Actions
  clearError: () => void;
  clearReportError: () => void;
  refreshAnalytics: (filters?: AnalyticsFilters) => Promise<void>;
  refreshReports: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // State
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics | null>(null);
  const [appAnalytics, setAppAnalytics] = useState<AppAnalytics | null>(null);
  const [socialAnalytics, setSocialAnalytics] = useState<SocialAnalytics | null>(null);
  const [locationAnalytics, setLocationAnalytics] = useState<LocationAnalytics | null>(null);
  const [dashboardAnalytics, setDashboardAnalytics] = useState<AnalyticsDashboard | null>(null);
  
  // Report State
  const [reportConfigs, setReportConfigs] = useState<ReportConfig[]>([]);
  const [reportHistory, setReportHistory] = useState<ReportData[]>([]);
  const [currentReport, setCurrentReport] = useState<CustomReport | null>(null);
  
  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isExportingReport, setIsExportingReport] = useState(false);
  
  // Error States
  const [error, setError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  // Analytics Actions
  const getUserAnalytics = async (userId: string, filters?: AnalyticsFilters): Promise<UserAnalytics | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const analytics = await analyticsService.getUserAnalytics(userId, filters);
      setUserAnalytics(analytics);
      return analytics;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      setError('Failed to load user analytics');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getEventAnalytics = async (eventId: string, filters?: AnalyticsFilters): Promise<EventAnalytics | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const analytics = await analyticsService.getEventAnalytics(eventId, filters);
      setEventAnalytics(analytics);
      return analytics;
    } catch (error) {
      console.error('Error fetching event analytics:', error);
      setError('Failed to load event analytics');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getAppAnalytics = async (filters?: AnalyticsFilters): Promise<AppAnalytics | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const analytics = await analyticsService.getAppAnalytics(filters);
      setAppAnalytics(analytics);
      return analytics;
    } catch (error) {
      console.error('Error fetching app analytics:', error);
      setError('Failed to load app analytics');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getSocialAnalytics = async (filters?: AnalyticsFilters): Promise<SocialAnalytics | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const analytics = await analyticsService.getSocialAnalytics(filters);
      setSocialAnalytics(analytics);
      return analytics;
    } catch (error) {
      console.error('Error fetching social analytics:', error);
      setError('Failed to load social analytics');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationAnalytics = async (filters?: AnalyticsFilters): Promise<LocationAnalytics | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const analytics = await analyticsService.getLocationAnalytics(filters);
      setLocationAnalytics(analytics);
      return analytics;
    } catch (error) {
      console.error('Error fetching location analytics:', error);
      setError('Failed to load location analytics');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardAnalytics = async (filters?: AnalyticsFilters): Promise<AnalyticsDashboard | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const analytics = await analyticsService.getDashboardAnalytics(filters);
      setDashboardAnalytics(analytics);
      return analytics;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      setError('Failed to load dashboard analytics');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Report Actions
  const createReportConfig = async (config: Omit<ReportConfig, 'id' | 'created_at' | 'updated_at'>): Promise<ReportConfig | null> => {
    try {
      setIsLoading(true);
      setReportError(null);

      const reportConfig = await reportingService.createReportConfig(config);
      if (reportConfig) {
        setReportConfigs(prev => [reportConfig, ...prev]);
      }

      return reportConfig;
    } catch (error) {
      console.error('Error creating report config:', error);
      setReportError('Failed to create report configuration');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getReportConfig = async (configId: string): Promise<ReportConfig | null> => {
    try {
      setIsLoading(true);
      setReportError(null);

      const config = await reportingService.getReportConfig(configId);
      return config;
    } catch (error) {
      console.error('Error fetching report config:', error);
      setReportError('Failed to load report configuration');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateReportConfig = async (configId: string, updates: Partial<ReportConfig>): Promise<boolean> => {
    try {
      setIsLoading(true);
      setReportError(null);

      const success = await reportingService.updateReportConfig(configId, updates);
      if (success) {
        setReportConfigs(prev => 
          prev.map(config => config.id === configId ? { ...config, ...updates } : config)
        );
      }

      return success;
    } catch (error) {
      console.error('Error updating report config:', error);
      setReportError('Failed to update report configuration');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReportConfig = async (configId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setReportError(null);

      const success = await reportingService.deleteReportConfig(configId);
      if (success) {
        setReportConfigs(prev => prev.filter(config => config.id !== configId));
      }

      return success;
    } catch (error) {
      console.error('Error deleting report config:', error);
      setReportError('Failed to delete report configuration');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Report Generation
  const generateUserReport = async (userId: string, filters: AnalyticsFilters): Promise<UserReport | null> => {
    try {
      setIsGeneratingReport(true);
      setReportError(null);

      const report = await reportingService.generateUserReport(userId, filters);
      return report;
    } catch (error) {
      console.error('Error generating user report:', error);
      setReportError('Failed to generate user report');
      return null;
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generateEventReport = async (eventId: string, filters: AnalyticsFilters): Promise<EventReport | null> => {
    try {
      setIsGeneratingReport(true);
      setReportError(null);

      const report = await reportingService.generateEventReport(eventId, filters);
      return report;
    } catch (error) {
      console.error('Error generating event report:', error);
      setReportError('Failed to generate event report');
      return null;
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generateAppReport = async (filters: AnalyticsFilters): Promise<AppReport | null> => {
    try {
      setIsGeneratingReport(true);
      setReportError(null);

      const report = await reportingService.generateAppReport(filters);
      return report;
    } catch (error) {
      console.error('Error generating app report:', error);
      setReportError('Failed to generate app report');
      return null;
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generateSocialReport = async (filters: AnalyticsFilters): Promise<SocialReport | null> => {
    try {
      setIsGeneratingReport(true);
      setReportError(null);

      const report = await reportingService.generateSocialReport(filters);
      return report;
    } catch (error) {
      console.error('Error generating social report:', error);
      setReportError('Failed to generate social report');
      return null;
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generateLocationReport = async (filters: AnalyticsFilters): Promise<LocationReport | null> => {
    try {
      setIsGeneratingReport(true);
      setReportError(null);

      const report = await reportingService.generateLocationReport(filters);
      return report;
    } catch (error) {
      console.error('Error generating location report:', error);
      setReportError('Failed to generate location report');
      return null;
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const generateCustomReport = async (config: ReportConfig): Promise<CustomReport | null> => {
    try {
      setIsGeneratingReport(true);
      setReportError(null);

      const report = await reportingService.generateCustomReport(config);
      if (report) {
        setCurrentReport(report);
      }

      return report;
    } catch (error) {
      console.error('Error generating custom report:', error);
      setReportError('Failed to generate custom report');
      return null;
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Report Management
  const exportReport = async (report: CustomReport, format: 'pdf' | 'csv' | 'excel' | 'json'): Promise<string | null> => {
    try {
      setIsExportingReport(true);
      setReportError(null);

      const fileUrl = await reportingService.exportReport(report, format);
      return fileUrl;
    } catch (error) {
      console.error('Error exporting report:', error);
      setReportError('Failed to export report');
      return null;
    } finally {
      setIsExportingReport(false);
    }
  };

  const scheduleReport = async (configId: string, schedule: ReportConfig['schedule']): Promise<boolean> => {
    try {
      setIsLoading(true);
      setReportError(null);

      const success = await reportingService.scheduleReport(configId, schedule);
      if (success) {
        setReportConfigs(prev => 
          prev.map(config => config.id === configId ? { ...config, schedule } : config)
        );
      }

      return success;
    } catch (error) {
      console.error('Error scheduling report:', error);
      setReportError('Failed to schedule report');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getReportHistory = async (configId: string, limit: number = 20, offset: number = 0): Promise<ReportData[]> => {
    try {
      setIsLoading(true);
      setReportError(null);

      const history = await reportingService.getReportHistory(configId, limit, offset);
      setReportHistory(history);
      return history;
    } catch (error) {
      console.error('Error fetching report history:', error);
      setReportError('Failed to load report history');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Utility Actions
  const clearError = (): void => {
    setError(null);
  };

  const clearReportError = (): void => {
    setReportError(null);
  };

  const refreshAnalytics = async (filters?: AnalyticsFilters): Promise<void> => {
    await Promise.all([
      getAppAnalytics(filters),
      getSocialAnalytics(filters),
      getLocationAnalytics(filters),
      getDashboardAnalytics(filters),
    ]);
  };

  const refreshReports = async (): Promise<void> => {
    // This would load report configurations
    // Implementation depends on how report configs are stored
  };

  const contextValue: AnalyticsContextType = {
    // State
    userAnalytics,
    eventAnalytics,
    appAnalytics,
    socialAnalytics,
    locationAnalytics,
    dashboardAnalytics,
    reportConfigs,
    reportHistory,
    currentReport,
    
    // Loading States
    isLoading,
    isGeneratingReport,
    isExportingReport,
    
    // Error States
    error,
    reportError,
    
    // Analytics Actions
    getUserAnalytics,
    getEventAnalytics,
    getAppAnalytics,
    getSocialAnalytics,
    getLocationAnalytics,
    getDashboardAnalytics,
    
    // Report Actions
    createReportConfig,
    getReportConfig,
    updateReportConfig,
    deleteReportConfig,
    
    // Report Generation
    generateUserReport,
    generateEventReport,
    generateAppReport,
    generateSocialReport,
    generateLocationReport,
    generateCustomReport,
    
    // Report Management
    exportReport,
    scheduleReport,
    getReportHistory,
    
    // Utility Actions
    clearError,
    clearReportError,
    refreshAnalytics,
    refreshReports,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
