// Performance optimization utilities

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Caching utilities
  setCache(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Debouncing utilities
  debounce<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    delay: number = 300
  ): T {
    return ((...args: any[]) => {
      const existingTimer = this.debounceTimers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        func(...args);
        this.debounceTimers.delete(key);
      }, delay);

      this.debounceTimers.set(key, timer);
    }) as T;
  }

  // Throttling utilities
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number = 100
  ): T {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    }) as T;
  }

  // Memory management
  cleanup(): void {
    // Clear expired cache entries
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }

    // Clear debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }

  // Image optimization
  optimizeImageUrl(url: string, width?: number, height?: number): string {
    if (!url) return url;

    // Add Google Places API photo optimization parameters
    if (url.includes('maps.googleapis.com')) {
      const params = new URLSearchParams();
      if (width) params.set('maxwidth', width.toString());
      if (height) params.set('maxheight', height.toString());
      params.set('photo_reference', url.split('photo_reference=')[1] || '');
      
      return `https://maps.googleapis.com/maps/api/place/photo?${params.toString()}`;
    }

    return url;
  }

  // Lazy loading utilities
  createLazyLoader<T>(
    loader: () => Promise<T>,
    cacheKey?: string
  ): () => Promise<T> {
    return async () => {
      if (cacheKey) {
        const cached = this.getCache(cacheKey);
        if (cached) return cached;
      }

      const result = await loader();
      
      if (cacheKey) {
        this.setCache(cacheKey, result);
      }

      return result;
    };
  }

  // Batch processing
  batchProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10
  ): Promise<R[]> {
    const results: R[] = [];
    
    const processBatch = async (batch: T[]): Promise<R[]> => {
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      );
      return batchResults;
    };

    const processAllBatches = async (): Promise<R[]> => {
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await processBatch(batch);
        results.push(...batchResults);
      }
      return results;
    };

    return processAllBatches();
  }

  // Map optimization
  optimizeMapMarkers(markers: any[], maxMarkers: number = 100): any[] {
    if (markers.length <= maxMarkers) return markers;

    // Sort by importance/priority and take top markers
    return markers
      .sort((a, b) => {
        // Prioritize by rating, then by distance
        const aScore = (a.rating || 0) * 0.7 + (a.distance || 0) * 0.3;
        const bScore = (b.rating || 0) * 0.7 + (b.distance || 0) * 0.3;
        return bScore - aScore;
      })
      .slice(0, maxMarkers);
  }

  // Data compression
  compressData(data: any): string {
    // Simple compression for small data objects
    return JSON.stringify(data);
  }

  decompressData(compressed: string): any {
    return JSON.parse(compressed);
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance();


