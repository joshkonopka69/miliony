import { performanceOptimizer } from '../utils/performanceOptimizer';

describe('PerformanceOptimizer', () => {
  beforeEach(() => {
    performanceOptimizer.clearCache();
  });

  describe('Caching', () => {
    it('should cache data with TTL', () => {
      const testData = { test: 'data' };
      const cacheKey = 'test-key';
      const ttl = 1000; // 1 second

      performanceOptimizer.setCache(cacheKey, testData, ttl);
      const cached = performanceOptimizer.getCache(cacheKey);

      expect(cached).toEqual(testData);
    });

    it('should return null for expired cache', async () => {
      const testData = { test: 'data' };
      const cacheKey = 'test-key';
      const ttl = 100; // 100ms

      performanceOptimizer.setCache(cacheKey, testData, ttl);
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const cached = performanceOptimizer.getCache(cacheKey);
      expect(cached).toBeNull();
    });

    it('should return null for non-existent cache key', () => {
      const cached = performanceOptimizer.getCache('non-existent-key');
      expect(cached).toBeNull();
    });

    it('should clear all cache', () => {
      performanceOptimizer.setCache('key1', 'data1');
      performanceOptimizer.setCache('key2', 'data2');
      
      expect(performanceOptimizer.getCache('key1')).toBe('data1');
      expect(performanceOptimizer.getCache('key2')).toBe('data2');
      
      performanceOptimizer.clearCache();
      
      expect(performanceOptimizer.getCache('key1')).toBeNull();
      expect(performanceOptimizer.getCache('key2')).toBeNull();
    });
  });

  describe('Debouncing', () => {
    it('should debounce function calls', async () => {
      const mockFunction = jest.fn();
      const debouncedFunction = performanceOptimizer.debounce('test-debounce', mockFunction, 100);

      // Call function multiple times quickly
      debouncedFunction();
      debouncedFunction();
      debouncedFunction();

      // Function should not be called yet
      expect(mockFunction).not.toHaveBeenCalled();

      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 150));

      // Function should be called only once
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls when new call is made', async () => {
      const mockFunction = jest.fn();
      const debouncedFunction = performanceOptimizer.debounce('test-debounce-2', mockFunction, 100);

      debouncedFunction();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      debouncedFunction(); // This should cancel the previous call
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(mockFunction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Throttling', () => {
    it('should throttle function calls', async () => {
      const mockFunction = jest.fn();
      const throttledFunction = performanceOptimizer.throttle(mockFunction, 100);

      // Call function multiple times
      throttledFunction();
      throttledFunction();
      throttledFunction();

      // Only first call should execute immediately
      expect(mockFunction).toHaveBeenCalledTimes(1);

      // Wait for throttle period
      await new Promise(resolve => setTimeout(resolve, 150));

      // Call again
      throttledFunction();
      expect(mockFunction).toHaveBeenCalledTimes(2);
    });
  });

  describe('Image Optimization', () => {
    it('should optimize Google Places API photo URLs', () => {
      const photoUrl = 'https://maps.googleapis.com/maps/api/place/photo?photo_reference=test-ref';
      const optimizedUrl = performanceOptimizer.optimizeImageUrl(photoUrl, 400, 300);

      expect(optimizedUrl).toContain('maxwidth=400');
      expect(optimizedUrl).toContain('maxheight=300');
      expect(optimizedUrl).toContain('photo_reference=test-ref');
    });

    it('should return original URL for non-Google Places URLs', () => {
      const originalUrl = 'https://example.com/image.jpg';
      const optimizedUrl = performanceOptimizer.optimizeImageUrl(originalUrl, 400, 300);

      expect(optimizedUrl).toBe(originalUrl);
    });
  });

  describe('Lazy Loading', () => {
    it('should create lazy loader with caching', async () => {
      const mockLoader = jest.fn().mockResolvedValue('loaded-data');
      const cacheKey = 'lazy-test-key';
      
      const lazyLoader = performanceOptimizer.createLazyLoader(mockLoader, cacheKey);

      // First call should execute loader
      const result1 = await lazyLoader();
      expect(result1).toBe('loaded-data');
      expect(mockLoader).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await lazyLoader();
      expect(result2).toBe('loaded-data');
      expect(mockLoader).toHaveBeenCalledTimes(1); // Should not call again
    });

    it('should create lazy loader without caching', async () => {
      const mockLoader = jest.fn().mockResolvedValue('loaded-data');
      
      const lazyLoader = performanceOptimizer.createLazyLoader(mockLoader);

      const result1 = await lazyLoader();
      const result2 = await lazyLoader();

      expect(result1).toBe('loaded-data');
      expect(result2).toBe('loaded-data');
      expect(mockLoader).toHaveBeenCalledTimes(2); // Should call each time
    });
  });

  describe('Batch Processing', () => {
    it('should process items in batches', async () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const processor = jest.fn().mockImplementation((item) => Promise.resolve(item * 2));
      const batchSize = 3;

      const results = await performanceOptimizer.batchProcess(items, processor, batchSize);

      expect(results).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
      expect(processor).toHaveBeenCalledTimes(10);
    });

    it('should handle empty items array', async () => {
      const processor = jest.fn();
      const results = await performanceOptimizer.batchProcess([], processor, 3);

      expect(results).toEqual([]);
      expect(processor).not.toHaveBeenCalled();
    });
  });

  describe('Map Marker Optimization', () => {
    it('should optimize markers by limiting count', () => {
      const markers = Array.from({ length: 150 }, (_, i) => ({
        id: i,
        rating: Math.random() * 5,
        distance: Math.random() * 1000,
      }));

      const optimized = performanceOptimizer.optimizeMapMarkers(markers, 50);

      expect(optimized.length).toBe(50);
    });

    it('should return all markers if under limit', () => {
      const markers = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        rating: Math.random() * 5,
        distance: Math.random() * 1000,
      }));

      const optimized = performanceOptimizer.optimizeMapMarkers(markers, 50);

      expect(optimized.length).toBe(30);
    });

    it('should prioritize markers by rating and distance', () => {
      const markers = [
        { id: 1, rating: 2, distance: 100 },
        { id: 2, rating: 5, distance: 200 },
        { id: 3, rating: 4, distance: 50 },
        { id: 4, rating: 3, distance: 300 },
      ];

      const optimized = performanceOptimizer.optimizeMapMarkers(markers, 2);

      // Should prioritize by score (rating * 0.7 + distance * 0.3)
      expect(optimized[0].id).toBe(2); // Highest rating
      expect(optimized[1].id).toBe(3); // Good rating, low distance
    });
  });

  describe('Data Compression', () => {
    it('should compress and decompress data', () => {
      const originalData = { test: 'data', number: 123, array: [1, 2, 3] };
      
      const compressed = performanceOptimizer.compressData(originalData);
      const decompressed = performanceOptimizer.decompressData(compressed);

      expect(decompressed).toEqual(originalData);
    });

    it('should handle null and undefined data', () => {
      expect(() => performanceOptimizer.compressData(null)).not.toThrow();
      expect(() => performanceOptimizer.compressData(undefined)).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup expired cache entries', () => {
      performanceOptimizer.setCache('expired', 'data', 100);
      performanceOptimizer.setCache('valid', 'data', 10000);

      // Manually trigger cleanup (in real app this would be automatic)
      performanceOptimizer.cleanup();

      expect(performanceOptimizer.getCache('expired')).toBeNull();
      expect(performanceOptimizer.getCache('valid')).toBe('data');
    });
  });
});


