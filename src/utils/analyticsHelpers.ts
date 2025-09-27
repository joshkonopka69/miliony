import { 
  UserAnalytics, 
  EventAnalytics, 
  AppAnalytics, 
  SocialAnalytics, 
  LocationAnalytics,
  AnalyticsFilters,
  AnalyticsMetric,
  AnalyticsChart
} from '../services/analyticsService';

// Date and time utilities
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getDateRange = (days: number): { start_date: string; end_date: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  };
};

export const getDateRangeFromPeriod = (period: 'week' | 'month' | 'quarter' | 'year'): { start_date: string; end_date: string } => {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }
  
  return {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
  };
};

// Number formatting utilities
export const formatNumber = (num: number, decimals: number = 0): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPercentage = (num: number, decimals: number = 1): string => {
  return `${formatNumber(num, decimals)}%`;
};

export const formatCurrency = (num: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num);
};

export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Analytics calculation utilities
export const calculateEngagementScore = (metrics: {
  eventsCreated: number;
  eventsAttended: number;
  friends: number;
  groups: number;
  messages: number;
  checkIns: number;
}): number => {
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
};

export const calculateRetentionRate = (retained: number, total: number): number => {
  if (total === 0) return 0;
  return (retained / total) * 100;
};

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const calculateConversionRate = (conversions: number, total: number): number => {
  if (total === 0) return 0;
  return (conversions / total) * 100;
};

export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

export const calculateMedian = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  
  return sorted[middle];
};

export const calculateStandardDeviation = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  
  const mean = calculateAverage(numbers);
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
  const avgSquaredDiff = calculateAverage(squaredDiffs);
  
  return Math.sqrt(avgSquaredDiff);
};

// Chart data utilities
export const createLineChartData = (data: { date: string; value: number }[]): AnalyticsChart => {
  return {
    type: 'line',
    title: 'Trend Over Time',
    data: data.map(item => ({
      label: formatDate(item.date),
      value: item.value,
    })),
    x_axis: 'Date',
    y_axis: 'Value',
  };
};

export const createBarChartData = (data: { label: string; value: number; color?: string }[]): AnalyticsChart => {
  return {
    type: 'bar',
    title: 'Comparison',
    data,
  };
};

export const createPieChartData = (data: { label: string; value: number; color?: string }[]): AnalyticsChart => {
  return {
    type: 'pie',
    title: 'Distribution',
    data,
  };
};

export const createAreaChartData = (data: { date: string; value: number }[]): AnalyticsChart => {
  return {
    type: 'area',
    title: 'Area Trend',
    data: data.map(item => ({
      label: formatDate(item.date),
      value: item.value,
    })),
    x_axis: 'Date',
    y_axis: 'Value',
  };
};

// Analytics insights utilities
export const generateInsights = (analytics: {
  app?: AppAnalytics;
  social?: SocialAnalytics;
  location?: LocationAnalytics;
}): string[] => {
  const insights: string[] = [];
  
  if (analytics.app) {
    const { total_users, active_users, user_retention } = analytics.app;
    
    if (active_users > 0) {
      const activeRate = (active_users / total_users) * 100;
      insights.push(`Active user rate: ${formatPercentage(activeRate, 1)}`);
    }
    
    if (user_retention.day_7 < 50) {
      insights.push('7-day retention is below 50% - consider user onboarding improvements');
    }
    
    if (user_retention.day_30 > 70) {
      insights.push('Strong 30-day retention indicates good user engagement');
    }
  }
  
  if (analytics.social) {
    const { total_groups, total_group_members } = analytics.social;
    
    if (total_groups > 0) {
      const avgGroupSize = total_group_members / total_groups;
      insights.push(`Average group size: ${formatNumber(avgGroupSize, 1)} members`);
    }
  }
  
  if (analytics.location) {
    const { total_venues, total_check_ins } = analytics.location;
    
    if (total_venues > 0) {
      const checkInsPerVenue = total_check_ins / total_venues;
      insights.push(`Average check-ins per venue: ${formatNumber(checkInsPerVenue, 1)}`);
    }
  }
  
  return insights;
};

export const generateRecommendations = (analytics: {
  app?: AppAnalytics;
  social?: SocialAnalytics;
  location?: LocationAnalytics;
}): string[] => {
  const recommendations: string[] = [];
  
  if (analytics.app) {
    const { user_retention, performance_metrics } = analytics.app;
    
    if (user_retention.day_7 < 50) {
      recommendations.push('Implement user onboarding improvements to increase 7-day retention');
    }
    
    if (performance_metrics.crash_rate > 5) {
      recommendations.push('Address app stability issues to improve user experience');
    }
    
    if (performance_metrics.error_rate > 2) {
      recommendations.push('Investigate and fix API errors to improve reliability');
    }
  }
  
  if (analytics.social) {
    const { total_groups, network_analysis } = analytics.social;
    
    if (total_groups < 100) {
      recommendations.push('Encourage more group creation to increase community engagement');
    }
    
    if (network_analysis.average_friends_per_user < 5) {
      recommendations.push('Promote friend connections to increase social engagement');
    }
  }
  
  if (analytics.location) {
    const { total_venues, total_check_ins } = analytics.location;
    
    if (total_check_ins < 1000) {
      recommendations.push('Encourage more venue check-ins to improve location data');
    }
    
    if (total_venues < 50) {
      recommendations.push('Add more venues to increase location coverage');
    }
  }
  
  return recommendations;
};

// Data filtering utilities
export const filterAnalyticsByDateRange = <T extends { created_at: string }>(
  data: T[],
  startDate: string,
  endDate: string
): T[] => {
  return data.filter(item => {
    const itemDate = new Date(item.created_at);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return itemDate >= start && itemDate <= end;
  });
};

export const filterAnalyticsByUser = <T extends { user_id: string }>(
  data: T[],
  userId: string
): T[] => {
  return data.filter(item => item.user_id === userId);
};

export const filterAnalyticsByEvent = <T extends { event_id: string }>(
  data: T[],
  eventId: string
): T[] => {
  return data.filter(item => item.event_id === eventId);
};

export const filterAnalyticsByGroup = <T extends { group_id: string }>(
  data: T[],
  groupId: string
): T[] => {
  return data.filter(item => item.group_id === groupId);
};

// Data aggregation utilities
export const aggregateByDate = <T extends { created_at: string }>(
  data: T[],
  groupBy: 'day' | 'week' | 'month' = 'day'
): { date: string; count: number }[] => {
  const groups: { [key: string]: number } = {};
  
  data.forEach(item => {
    const date = new Date(item.created_at);
    let key: string;
    
    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }
    
    groups[key] = (groups[key] || 0) + 1;
  });
  
  return Object.entries(groups)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const aggregateByCategory = <T extends { [key: string]: any }>(
  data: T[],
  categoryField: string
): { category: string; count: number }[] => {
  const groups: { [key: string]: number } = {};
  
  data.forEach(item => {
    const category = item[categoryField];
    if (category) {
      groups[category] = (groups[category] || 0) + 1;
    }
  });
  
  return Object.entries(groups)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
};

// Export utilities
export const exportToCSV = (data: any[], filename: string = 'analytics.csv'): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  return csvContent;
};

export const exportToJSON = (data: any[], filename: string = 'analytics.json'): string => {
  return JSON.stringify(data, null, 2);
};

// Validation utilities
export const validateAnalyticsFilters = (filters: AnalyticsFilters): string[] => {
  const errors: string[] = [];
  
  if (filters.date_range) {
    const { start_date, end_date } = filters.date_range;
    
    if (!start_date || !end_date) {
      errors.push('Both start_date and end_date are required for date range');
    } else {
      const start = new Date(start_date);
      const end = new Date(end_date);
      
      if (start >= end) {
        errors.push('Start date must be before end date');
      }
      
      if (end > new Date()) {
        errors.push('End date cannot be in the future');
      }
    }
  }
  
  if (filters.user_ids && filters.user_ids.length === 0) {
    errors.push('User IDs array cannot be empty');
  }
  
  if (filters.event_ids && filters.event_ids.length === 0) {
    errors.push('Event IDs array cannot be empty');
  }
  
  if (filters.group_ids && filters.group_ids.length === 0) {
    errors.push('Group IDs array cannot be empty');
  }
  
  return errors;
};

export const validateReportConfig = (config: any): string[] => {
  const errors: string[] = [];
  
  if (!config.name || config.name.trim().length === 0) {
    errors.push('Report name is required');
  }
  
  if (!config.type || !['user', 'event', 'app', 'social', 'location', 'custom'].includes(config.type)) {
    errors.push('Valid report type is required');
  }
  
  if (!config.format || !['pdf', 'csv', 'excel', 'json'].includes(config.format)) {
    errors.push('Valid report format is required');
  }
  
  if (!config.filters) {
    errors.push('Report filters are required');
  }
  
  return errors;
};

// Performance utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Color utilities for charts
export const getChartColors = (count: number): string[] => {
  const colors = [
    '#FFD700', '#2196F3', '#4CAF50', '#FF9800', '#F44336',
    '#9C27B0', '#00BCD4', '#8BC34A', '#FF5722', '#607D8B'
  ];
  
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

export const getGradientColors = (baseColor: string, count: number): string[] => {
  // Simple gradient generation - in a real app, you'd use a proper color library
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const opacity = 1 - (i / count) * 0.5;
    colors.push(`${baseColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`);
  }
  return colors;
};

// Data transformation utilities
export const transformToChartData = (data: any[], xField: string, yField: string): AnalyticsChart => {
  return {
    type: 'line',
    title: 'Data Visualization',
    data: data.map(item => ({
      label: item[xField],
      value: item[yField],
    })),
    x_axis: xField,
    y_axis: yField,
  };
};

export const transformToMetrics = (data: any[], valueField: string, labelField: string): AnalyticsMetric[] => {
  return data.map(item => ({
    name: item[labelField],
    value: item[valueField],
    change: 0, // Would need historical data
    change_type: 'stable' as const,
    trend: 'stable' as const,
  }));
};

// Cache utilities
export const createCacheKey = (prefix: string, params: any): string => {
  const paramString = JSON.stringify(params);
  return `${prefix}_${btoa(paramString)}`;
};

export const isCacheValid = (timestamp: number, ttl: number = 300000): boolean => {
  return Date.now() - timestamp < ttl;
};

// Error handling utilities
export const handleAnalyticsError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

export const isAnalyticsError = (error: any): boolean => {
  return error && (error.message || typeof error === 'string');
};

// Type guards
export const isUserAnalytics = (data: any): data is UserAnalytics => {
  return data && typeof data.user_id === 'string' && typeof data.engagement_score === 'number';
};

export const isEventAnalytics = (data: any): data is EventAnalytics => {
  return data && typeof data.event_id === 'string' && typeof data.attendance_rate === 'number';
};

export const isAppAnalytics = (data: any): data is AppAnalytics => {
  return data && typeof data.total_users === 'number' && typeof data.active_users === 'number';
};

export const isSocialAnalytics = (data: any): data is SocialAnalytics => {
  return data && typeof data.total_friendships === 'number' && typeof data.total_groups === 'number';
};

export const isLocationAnalytics = (data: any): data is LocationAnalytics => {
  return data && typeof data.total_venues === 'number' && typeof data.total_check_ins === 'number';
};
