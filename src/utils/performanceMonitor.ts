// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  apiResponseTime: number;
  mapRenderTime: number;
  componentMountTime: number;
  bundleSize: number;
  cacheHitRate: number;
  errorRate: number;
}

export interface PerformanceThresholds {
  maxRenderTime: number;
  maxMemoryUsage: number;
  maxApiResponseTime: number;
  minCacheHitRate: number;
  maxErrorRate: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private thresholds: PerformanceThresholds = {
    maxRenderTime: 100, // ms
    maxMemoryUsage: 100, // MB
    maxApiResponseTime: 2000, // ms
    minCacheHitRate: 0.8, // 80%
    maxErrorRate: 0.05, // 5%
  };

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Monitor render performance
  startRenderTimer(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      this.recordMetric('renderTime', renderTime);
      
      if (renderTime > this.thresholds.maxRenderTime) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`);
      }
    };
  }

  // Monitor memory usage
  monitorMemoryUsage(): void {
    if (performance.memory) {
      const memoryInfo = performance.memory;
      const memoryUsage = memoryInfo.usedJSHeapSize / (1024 * 1024); // MB
      
      this.recordMetric('memoryUsage', memoryUsage);
      
      if (memoryUsage > this.thresholds.maxMemoryUsage) {
        console.warn(`High memory usage detected: ${memoryUsage}MB`);
        this.triggerMemoryCleanup();
      }
    }
  }

  // Monitor API performance
  async monitorApiCall<T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const responseTime = performance.now() - startTime;
      
      this.recordMetric('apiResponseTime', responseTime);
      
      if (responseTime > this.thresholds.maxApiResponseTime) {
        console.warn(`Slow API call detected for ${endpoint}: ${responseTime}ms`);
      }
      
      return result;
    } catch (error) {
      this.recordMetric('errorRate', 1);
      throw error;
    }
  }

  // Monitor map rendering performance
  monitorMapRender(mapRef: any): void {
    if (!mapRef?.current) return;
    
    const startTime = performance.now();
    
    // Monitor map region changes
    const originalOnRegionChangeComplete = mapRef.current.props.onRegionChangeComplete;
    mapRef.current.props.onRegionChangeComplete = (region: any) => {
      const endTime = performance.now();
      const mapRenderTime = endTime - startTime;
      
      this.recordMetric('mapRenderTime', mapRenderTime);
      
      if (originalOnRegionChangeComplete) {
        originalOnRegionChangeComplete(region);
      }
    };
  }

  // Monitor component mount time
  monitorComponentMount(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const mountTime = endTime - startTime;
      
      this.recordMetric('componentMountTime', mountTime);
      
      if (mountTime > 50) { // 50ms threshold for component mounting
        console.warn(`Slow component mount detected for ${componentName}: ${mountTime}ms`);
      }
    };
  }

  // Record performance metrics
  private recordMetric(metricName: keyof PerformanceMetrics, value: number): void {
    const metric: Partial<PerformanceMetrics> = {};
    metric[metricName] = value;
    
    this.metrics.push(metric as PerformanceMetrics);
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  // Get performance statistics
  getPerformanceStats(): {
    average: PerformanceMetrics;
    current: PerformanceMetrics;
    alerts: string[];
  } {
    if (this.metrics.length === 0) {
      return {
        average: this.getEmptyMetrics(),
        current: this.getEmptyMetrics(),
        alerts: [],
      };
    }

    const latest = this.metrics[this.metrics.length - 1];
    const averages = this.calculateAverages();
    const alerts = this.generateAlerts(averages);

    return {
      average: averages,
      current: latest,
      alerts,
    };
  }

  private getEmptyMetrics(): PerformanceMetrics {
    return {
      renderTime: 0,
      memoryUsage: 0,
      apiResponseTime: 0,
      mapRenderTime: 0,
      componentMountTime: 0,
      bundleSize: 0,
      cacheHitRate: 0,
      errorRate: 0,
    };
  }

  private calculateAverages(): PerformanceMetrics {
    const sums = this.getEmptyMetrics();
    const counts = this.getEmptyMetrics();

    this.metrics.forEach(metric => {
      Object.keys(metric).forEach(key => {
        const value = metric[key as keyof PerformanceMetrics];
        if (value !== undefined && value !== 0) {
          sums[key as keyof PerformanceMetrics] += value;
          counts[key as keyof PerformanceMetrics] += 1;
        }
      });
    });

    const averages = this.getEmptyMetrics();
    Object.keys(averages).forEach(key => {
      const count = counts[key as keyof PerformanceMetrics];
      if (count > 0) {
        averages[key as keyof PerformanceMetrics] = sums[key as keyof PerformanceMetrics] / count;
      }
    });

    return averages;
  }

  private generateAlerts(metrics: PerformanceMetrics): string[] {
    const alerts: string[] = [];

    if (metrics.renderTime > this.thresholds.maxRenderTime) {
      alerts.push(`Render time is ${metrics.renderTime.toFixed(2)}ms (threshold: ${this.thresholds.maxRenderTime}ms)`);
    }

    if (metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      alerts.push(`Memory usage is ${metrics.memoryUsage.toFixed(2)}MB (threshold: ${this.thresholds.maxMemoryUsage}MB)`);
    }

    if (metrics.apiResponseTime > this.thresholds.maxApiResponseTime) {
      alerts.push(`API response time is ${metrics.apiResponseTime.toFixed(2)}ms (threshold: ${this.thresholds.maxApiResponseTime}ms)`);
    }

    if (metrics.cacheHitRate < this.thresholds.minCacheHitRate) {
      alerts.push(`Cache hit rate is ${(metrics.cacheHitRate * 100).toFixed(1)}% (threshold: ${this.thresholds.minCacheHitRate * 100}%)`);
    }

    if (metrics.errorRate > this.thresholds.maxErrorRate) {
      alerts.push(`Error rate is ${(metrics.errorRate * 100).toFixed(1)}% (threshold: ${this.thresholds.maxErrorRate * 100}%)`);
    }

    return alerts;
  }

  // Trigger memory cleanup
  private triggerMemoryCleanup(): void {
    // Clear old metrics
    this.metrics = this.metrics.slice(-50);
    
    // Trigger garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    console.log('Memory cleanup triggered');
  }

  // Optimize map rendering
  optimizeMapRendering(mapRef: any, maxMarkers: number = 100): void {
    if (!mapRef?.current) return;

    // Implement marker clustering for large datasets
    const originalProps = mapRef.current.props;
    
    // Add marker optimization
    const optimizedProps = {
      ...originalProps,
      maxZoom: 15, // Limit zoom to prevent performance issues
      minZoom: 3,
      clustering: true,
      maxMarkers,
    };

    mapRef.current.props = optimizedProps;
  }

  // Optimize API calls
  optimizeApiCalls(): void {
    // Implement request batching
    const pendingRequests = new Map<string, Promise<any>>();
    
    const batchedRequest = async (key: string, request: () => Promise<any>) => {
      if (pendingRequests.has(key)) {
        return pendingRequests.get(key);
      }
      
      const promise = request();
      pendingRequests.set(key, promise);
      
      try {
        const result = await promise;
        pendingRequests.delete(key);
        return result;
      } catch (error) {
        pendingRequests.delete(key);
        throw error;
      }
    };
    
    return batchedRequest;
  }

  // Monitor bundle size
  monitorBundleSize(): void {
    // This would typically be done at build time
    const bundleSize = this.estimateBundleSize();
    this.recordMetric('bundleSize', bundleSize);
    
    if (bundleSize > 1000) { // 1MB threshold
      console.warn(`Large bundle size detected: ${bundleSize}KB`);
    }
  }

  private estimateBundleSize(): number {
    // Simulate bundle size estimation
    return Math.random() * 500 + 200; // KB
  }

  // Set performance thresholds
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  // Get performance report
  getPerformanceReport(): {
    summary: {
      overallScore: number;
      recommendations: string[];
    };
    metrics: PerformanceMetrics;
    thresholds: PerformanceThresholds;
    timestamp: string;
  } {
    const stats = this.getPerformanceStats();
    const overallScore = this.calculateOverallScore(stats.average);
    const recommendations = this.generateRecommendations(stats.average);

    return {
      summary: {
        overallScore,
        recommendations,
      },
      metrics: stats.average,
      thresholds: this.thresholds,
      timestamp: new Date().toISOString(),
    };
  }

  private calculateOverallScore(metrics: PerformanceMetrics): number {
    let score = 100;
    
    if (metrics.renderTime > this.thresholds.maxRenderTime) score -= 20;
    if (metrics.memoryUsage > this.thresholds.maxMemoryUsage) score -= 15;
    if (metrics.apiResponseTime > this.thresholds.maxApiResponseTime) score -= 25;
    if (metrics.cacheHitRate < this.thresholds.minCacheHitRate) score -= 10;
    if (metrics.errorRate > this.thresholds.maxErrorRate) score -= 30;
    
    return Math.max(0, score);
  }

  private generateRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.renderTime > this.thresholds.maxRenderTime) {
      recommendations.push('Consider using React.memo() for expensive components');
      recommendations.push('Implement virtual scrolling for large lists');
    }
    
    if (metrics.memoryUsage > this.thresholds.maxMemoryUsage) {
      recommendations.push('Implement image lazy loading');
      recommendations.push('Clear unused cache entries regularly');
    }
    
    if (metrics.apiResponseTime > this.thresholds.maxApiResponseTime) {
      recommendations.push('Implement API response caching');
      recommendations.push('Use request batching for multiple API calls');
    }
    
    if (metrics.cacheHitRate < this.thresholds.minCacheHitRate) {
      recommendations.push('Increase cache TTL for frequently accessed data');
      recommendations.push('Implement smarter cache invalidation');
    }
    
    if (metrics.errorRate > this.thresholds.maxErrorRate) {
      recommendations.push('Improve error handling and retry logic');
      recommendations.push('Add more comprehensive input validation');
    }
    
    return recommendations;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();


