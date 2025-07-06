import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

interface CacheConfig {
  defaultStaleTime: number;
  defaultGcTime: number;
  prefetchThreshold: number;
  maxCacheSize: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  defaultStaleTime: 5 * 60 * 1000, // 5 minutes
  defaultGcTime: 10 * 60 * 1000, // 10 minutes
  prefetchThreshold: 0.8, // Prefetch when 80% through current data
  maxCacheSize: 50 * 1024 * 1024, // 50MB
};

/**
 * Advanced caching hook with intelligent cache management
 */
export function useAdvancedCache(config: Partial<CacheConfig> = {}) {
  const queryClient = useQueryClient();
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Intelligent cache prefetching based on user behavior
  const prefetchRelatedContent = useCallback(async (
    currentPath: string,
    categoryId?: number
  ) => {
    // Prefetch related articles in the same category
    if (categoryId) {
      await queryClient.prefetchQuery({
        queryKey: ['/api/articles', { categoryId, limit: 6 }],
        staleTime: finalConfig.defaultStaleTime,
      });
    }

    // Prefetch categories if not already cached
    await queryClient.prefetchQuery({
      queryKey: ['/api/categories'],
      staleTime: finalConfig.defaultStaleTime * 2, // Categories change less frequently
    });

    // Prefetch featured articles for home page
    if (currentPath === '/' || currentPath.includes('/blog')) {
      await queryClient.prefetchQuery({
        queryKey: ['/api/articles', { featured: true, limit: 6 }],
        staleTime: finalConfig.defaultStaleTime,
      });
    }
  }, [queryClient, finalConfig]);

  // Cache optimization and cleanup
  const optimizeCache = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    // Remove stale entries beyond max cache size
    const totalSize = queries.reduce((size, query) => {
      const data = query.state.data;
      return size + (data ? JSON.stringify(data).length : 0);
    }, 0);

    if (totalSize > finalConfig.maxCacheSize) {
      // Remove oldest stale queries first
      const staleQueries = queries
        .filter(query => query.isStale())
        .sort((a, b) => (a.state.dataUpdatedAt || 0) - (b.state.dataUpdatedAt || 0));

      const queriesToRemove = staleQueries.slice(0, Math.ceil(staleQueries.length * 0.3));
      queriesToRemove.forEach(query => {
        queryClient.removeQueries({ queryKey: query.queryKey });
      });
    }
  }, [queryClient, finalConfig.maxCacheSize]);

  // Smart invalidation strategy
  const smartInvalidate = useCallback((
    type: 'articles' | 'categories' | 'all',
    specificId?: number
  ) => {
    switch (type) {
      case 'articles':
        if (specificId) {
          // Invalidate specific article and related queries
          queryClient.invalidateQueries({
            queryKey: ['/api/articles', specificId],
          });
          queryClient.invalidateQueries({
            queryKey: ['/api/articles'],
            refetchType: 'none', // Don't refetch automatically
          });
        } else {
          queryClient.invalidateQueries({
            queryKey: ['/api/articles'],
          });
        }
        break;
      case 'categories':
        queryClient.invalidateQueries({
          queryKey: ['/api/categories'],
        });
        // Also invalidate articles since category changes affect article listings
        queryClient.invalidateQueries({
          queryKey: ['/api/articles'],
          refetchType: 'none',
        });
        break;
      case 'all':
        queryClient.invalidateQueries();
        break;
    }
  }, [queryClient]);

  // Periodic cache maintenance
  useEffect(() => {
    const interval = setInterval(() => {
      optimizeCache();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [optimizeCache]);

  return {
    prefetchRelatedContent,
    optimizeCache,
    smartInvalidate,
    getCacheStats: () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      return {
        totalQueries: queries.length,
        staleQueries: queries.filter(q => q.isStale()).length,
        loadingQueries: queries.filter(q => q.state.isFetching).length,
        estimatedSize: queries.reduce((size, query) => {
          const data = query.state.data;
          return size + (data ? JSON.stringify(data).length : 0);
        }, 0),
      };
    },
  };
}

/**
 * Hook for managing cache warming strategies
 */
export function useCacheWarming() {
  const queryClient = useQueryClient();

  const warmEssentialData = useCallback(async () => {
    // Warm up critical data that's frequently accessed
    const warmupPromises = [
      // Categories (highest priority - used in navigation)
      queryClient.prefetchQuery({
        queryKey: ['/api/categories'],
        staleTime: 15 * 60 * 1000, // 15 minutes
      }),
      
      // Featured articles (home page)
      queryClient.prefetchQuery({
        queryKey: ['/api/articles', { featured: true, limit: 6 }],
        staleTime: 10 * 60 * 1000, // 10 minutes
      }),
      
      // Latest articles (blog listing)
      queryClient.prefetchQuery({
        queryKey: ['/api/articles', { limit: 12 }],
        staleTime: 5 * 60 * 1000, // 5 minutes
      }),
    ];

    await Promise.allSettled(warmupPromises);
  }, [queryClient]);

  return { warmEssentialData };
}