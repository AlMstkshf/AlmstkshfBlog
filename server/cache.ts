// In-memory cache service with TTL and memory management
// This provides efficient caching for frequently accessed data

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  memoryUsage: number;
  hitRate: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private stats = {
    hits: 0,
    misses: 0
  };
  
  // Cache configuration
  private readonly maxEntries = 1000;
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly cleanupInterval = 60 * 1000; // 1 minute
  
  constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  // Get item from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    
    return entry.data;
  }

  // Set item in cache
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // Check if we need to evict entries
    if (this.cache.size >= this.maxEntries) {
      this.evictLeastUsed();
    }
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    };
    
    this.cache.set(key, entry);
  }

  // Delete item from cache
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Get cache statistics
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    
    // Calculate approximate memory usage
    let memoryUsage = 0;
    for (const [key, entry] of this.cache.entries()) {
      memoryUsage += key.length * 2; // String characters are 2 bytes each
      memoryUsage += JSON.stringify(entry.data).length * 2;
      memoryUsage += 64; // Approximate overhead for entry metadata
    }
    
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      entries: this.cache.size,
      memoryUsage,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`Cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }

  // Evict least recently used entries when cache is full
  private evictLeastUsed(): void {
    if (this.cache.size === 0) return;
    
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`Cache eviction: removed least used entry ${oldestKey}`);
    }
  }

  // Generate cache key for articles
  generateArticleKey(options: any): string {
    const keyParts = [
      'articles',
      options.categoryId || 'all',
      options.featured !== undefined ? options.featured : 'all',
      options.published !== undefined ? options.published : 'true',
      options.language || 'en',
      options.limit || '20',
      options.offset || '0',
      options.sortBy || 'publishedAt',
      options.sortOrder || 'desc'
    ];
    return keyParts.join(':');
  }

  // Generate cache key for categories
  generateCategoryKey(language?: string): string {
    return `categories:${language || 'all'}`;
  }

  // Generate cache key for downloads
  generateDownloadKey(options: any): string {
    const keyParts = [
      'downloads',
      options.category || 'all',
      options.fileType || 'all',
      options.featured !== undefined ? options.featured : 'all',
      options.limit || '20',
      options.offset || '0'
    ];
    return keyParts.join(':');
  }

  // Generate cache key for single item
  generateItemKey(type: string, identifier: string | number): string {
    return `${type}:${identifier}`;
  }

  // Invalidate related cache entries
  invalidatePattern(pattern: string): number {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`Cache invalidation: removed ${keysToDelete.length} entries matching pattern "${pattern}"`);
    }
    
    return keysToDelete.length;
  }

  // Cache with automatic key generation for common operations
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Fetch data and cache it
    const data = await fetchFunction();
    this.set(key, data, ttl);
    return data;
  }
}

// Create singleton instance
export const cacheService = new CacheService();

// Cache TTL constants
export const CACHE_TTL = {
  ARTICLES_LIST: 5 * 60 * 1000,      // 5 minutes
  ARTICLE_DETAIL: 10 * 60 * 1000,    // 10 minutes
  CATEGORIES: 30 * 60 * 1000,        // 30 minutes
  DOWNLOADS: 15 * 60 * 1000,         // 15 minutes
  SITEMAP: 60 * 60 * 1000,           // 1 hour
  SEARCH_RESULTS: 2 * 60 * 1000,     // 2 minutes
  ADMIN_SETTINGS: 5 * 60 * 1000      // 5 minutes
} as const;

// Cache invalidation helpers
export const cacheInvalidation = {
  // Invalidate all article-related cache
  articles: () => {
    cacheService.invalidatePattern('articles');
    cacheService.invalidatePattern('sitemap');
  },
  
  // Invalidate all category-related cache
  categories: () => {
    cacheService.invalidatePattern('categories');
    cacheService.invalidatePattern('articles'); // Articles include category info
    cacheService.invalidatePattern('sitemap');
  },
  
  // Invalidate all download-related cache
  downloads: () => {
    cacheService.invalidatePattern('downloads');
  },
  
  // Invalidate search cache
  search: () => {
    cacheService.invalidatePattern('search');
  },
  
  // Invalidate everything (use sparingly)
  all: () => {
    cacheService.clear();
  }
};