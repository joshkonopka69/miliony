// Memory management utilities for optimal performance

export interface MemoryUsage {
  used: number;
  total: number;
  available: number;
  percentage: number;
}

export interface CacheEntry {
  key: string;
  data: any;
  size: number;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export class MemoryManager {
  private static instance: MemoryManager;
  private cache: Map<string, CacheEntry> = new Map();
  private maxCacheSize: number = 50 * 1024 * 1024; // 50MB
  private currentCacheSize: number = 0;
  private cleanupInterval: NodeJS.Timeout | null = null;

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  // Initialize memory management
  initialize(): void {
    this.startCleanupInterval();
    this.monitorMemoryUsage();
  }

  // Get current memory usage
  getMemoryUsage(): MemoryUsage {
    if (performance.memory) {
      const memory = performance.memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        available: memory.jsHeapSizeLimit - memory.usedJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }
    
    return {
      used: 0,
      total: 0,
      available: 0,
      percentage: 0,
    };
  }

  // Set cache entry with size tracking
  setCacheEntry(key: string, data: any, ttl: number = 300000): void {
    const size = this.calculateSize(data);
    const entry: CacheEntry = {
      key,
      data,
      size,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
    };

    // Remove old entry if exists
    if (this.cache.has(key)) {
      this.removeCacheEntry(key);
    }

    // Check if we need to free space
    if (this.currentCacheSize + size > this.maxCacheSize) {
      this.freeSpace(size);
    }

    this.cache.set(key, entry);
    this.currentCacheSize += size;
  }

  // Get cache entry with access tracking
  getCacheEntry(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.removeCacheEntry(key);
      return null;
    }

    // Update access tracking
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  // Remove cache entry
  removeCacheEntry(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentCacheSize -= entry.size;
      this.cache.delete(key);
    }
  }

  // Calculate data size in bytes
  private calculateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      return 0;
    }
  }

  // Free space by removing least recently used entries
  private freeSpace(requiredSize: number): void {
    const entries = Array.from(this.cache.values())
      .sort((a, b) => a.lastAccessed - b.lastAccessed);

    let freedSize = 0;
    for (const entry of entries) {
      this.removeCacheEntry(entry.key);
      freedSize += entry.size;
      
      if (freedSize >= requiredSize) {
        break;
      }
    }
  }

  // Start automatic cleanup interval
  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  // Cleanup expired entries and optimize cache
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    // Find expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    // Remove expired entries
    expiredKeys.forEach(key => this.removeCacheEntry(key));

    // If still over limit, remove least recently used
    if (this.currentCacheSize > this.maxCacheSize * 0.8) {
      this.optimizeCache();
    }

    console.log(`Memory cleanup: removed ${expiredKeys.length} expired entries`);
  }

  // Optimize cache by removing least valuable entries
  private optimizeCache(): void {
    const entries = Array.from(this.cache.values())
      .sort((a, b) => {
        // Sort by access count and recency
        const scoreA = a.accessCount / (Date.now() - a.lastAccessed);
        const scoreB = b.accessCount / (Date.now() - b.lastAccessed);
        return scoreA - scoreB;
      });

    const targetSize = this.maxCacheSize * 0.6; // Reduce to 60% of max
    let currentSize = this.currentCacheSize;

    for (const entry of entries) {
      if (currentSize <= targetSize) break;
      
      this.removeCacheEntry(entry.key);
      currentSize -= entry.size;
    }
  }

  // Monitor memory usage and trigger cleanup if needed
  private monitorMemoryUsage(): void {
    setInterval(() => {
      const memoryUsage = this.getMemoryUsage();
      
      if (memoryUsage.percentage > 80) {
        console.warn('High memory usage detected:', memoryUsage.percentage.toFixed(1) + '%');
        this.aggressiveCleanup();
      }
    }, 30000); // Check every 30 seconds
  }

  // Aggressive cleanup for high memory usage
  private aggressiveCleanup(): void {
    // Remove all entries older than 5 minutes
    const fiveMinutesAgo = Date.now() - 300000;
    const oldEntries = Array.from(this.cache.entries())
      .filter(([_, entry]) => entry.timestamp < fiveMinutesAgo);

    oldEntries.forEach(([key, _]) => this.removeCacheEntry(key));

    // If still high, remove least accessed entries
    if (this.getMemoryUsage().percentage > 80) {
      this.optimizeCache();
    }
  }

  // Get cache statistics
  getCacheStats(): {
    size: number;
    entries: number;
    hitRate: number;
    averageSize: number;
  } {
    const entries = Array.from(this.cache.values());
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const totalHits = entries.filter(entry => entry.accessCount > 0).length;
    
    return {
      size: this.currentCacheSize,
      entries: this.cache.size,
      hitRate: totalAccesses > 0 ? totalHits / totalAccesses : 0,
      averageSize: entries.length > 0 ? this.currentCacheSize / entries.length : 0,
    };
  }

  // Clear all cache
  clearAllCache(): void {
    this.cache.clear();
    this.currentCacheSize = 0;
  }

  // Set maximum cache size
  setMaxCacheSize(size: number): void {
    this.maxCacheSize = size;
    
    // If current size exceeds new limit, cleanup
    if (this.currentCacheSize > this.maxCacheSize) {
      this.cleanup();
    }
  }

  // Optimize images for memory usage
  optimizeImage(imageUrl: string, maxWidth: number = 400, maxHeight: number = 300): string {
    // Add image optimization parameters
    const url = new URL(imageUrl);
    url.searchParams.set('maxwidth', maxWidth.toString());
    url.searchParams.set('maxheight', maxHeight.toString());
    url.searchParams.set('format', 'webp'); // Use WebP for better compression
    
    return url.toString();
  }

  // Implement lazy loading for images
  createLazyImageLoader(): (src: string, callback: (url: string) => void) => void {
    const loadedImages = new Set<string>();
    
    return (src: string, callback: (url: string) => void) => {
      if (loadedImages.has(src)) {
        callback(src);
        return;
      }

      const img = new Image();
      img.onload = () => {
        loadedImages.add(src);
        callback(src);
      };
      img.onerror = () => {
        callback(''); // Return empty string on error
      };
      img.src = src;
    };
  }

  // Implement virtual scrolling for large lists
  createVirtualScroller(
    itemHeight: number,
    containerHeight: number,
    totalItems: number
  ): {
    visibleStart: number;
    visibleEnd: number;
    scrollTop: number;
    totalHeight: number;
  } {
    return {
      visibleStart: 0,
      visibleEnd: Math.min(totalItems, Math.ceil(containerHeight / itemHeight)),
      scrollTop: 0,
      totalHeight: totalItems * itemHeight,
    };
  }

  // Dispose of memory manager
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.clearAllCache();
  }
}

export const memoryManager = MemoryManager.getInstance();


