import { useQuery, useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

interface ParallelLoadingConfig {
  enableParallel: boolean;
  staleTime: number;
  cacheTime: number;
  refetchOnWindowFocus: boolean;
}

const defaultConfig: ParallelLoadingConfig = {
  enableParallel: true,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
};

/**
 * Enhanced parallel data loading hook for blog data
 * Optimizes performance by loading multiple data sources simultaneously
 */
export function useParallelBlogData(config: Partial<ParallelLoadingConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  const queries = useQueries({
    queries: [
      {
        queryKey: ['/api/articles', { featured: true, limit: 6 }],
        staleTime: finalConfig.staleTime,
        cacheTime: finalConfig.cacheTime,
        refetchOnWindowFocus: finalConfig.refetchOnWindowFocus,
        enabled: finalConfig.enableParallel,
      },
      {
        queryKey: ['/api/articles', { limit: 12 }],
        staleTime: finalConfig.staleTime,
        cacheTime: finalConfig.cacheTime,
        refetchOnWindowFocus: finalConfig.refetchOnWindowFocus,
        enabled: finalConfig.enableParallel,
      },
      {
        queryKey: ['/api/categories'],
        staleTime: finalConfig.staleTime * 2, // Categories change less frequently
        cacheTime: finalConfig.cacheTime * 2,
        refetchOnWindowFocus: false,
        enabled: finalConfig.enableParallel,
      },
    ],
  });

  const [featuredQuery, latestQuery, categoriesQuery] = queries;

  return useMemo(() => ({
    data: {
      featuredArticles: featuredQuery.data || [],
      latestArticles: latestQuery.data || [],
      categories: categoriesQuery.data || [],
    },
    isLoading: queries.some(q => q.isLoading),
    isError: queries.some(q => q.isError),
    errors: queries.map(q => q.error).filter(Boolean),
    refetch: () => queries.forEach(q => q.refetch()),
    // Performance metrics
    loadingProgress: {
      completed: queries.filter(q => !q.isLoading).length,
      total: queries.length,
      percentage: Math.round((queries.filter(q => !q.isLoading).length / queries.length) * 100)
    }
  }), [queries]);
}

/**
 * Intelligent prefetching hook for article data
 * Preloads related content based on user behavior
 */
export function useArticlePrefetch(articleId?: number, categoryId?: number) {
  const prefetchQueries = useQueries({
    queries: [
      // Prefetch related articles in the same category
      {
        queryKey: ['/api/articles', { categoryId, limit: 6 }],
        staleTime: 3 * 60 * 1000,
        cacheTime: 5 * 60 * 1000,
        enabled: !!categoryId,
        refetchOnWindowFocus: false,
      },
      // Prefetch category details
      {
        queryKey: ['/api/categories'],
        staleTime: 10 * 60 * 1000,
        cacheTime: 15 * 60 * 1000,
        enabled: !!categoryId,
        refetchOnWindowFocus: false,
      },
    ],
  });

  return {
    isPrefetching: prefetchQueries.some(q => q.isFetching),
    prefetchedData: {
      relatedArticles: prefetchQueries[0]?.data || [],
      categories: prefetchQueries[1]?.data || [],
    }
  };
}

/**
 * Smart caching strategy for frequently accessed data
 */
export function useCacheOptimization() {
  return {
    // Short-lived cache for real-time data
    realTimeConfig: {
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 2 * 60 * 1000, // 2 minutes
    },
    // Medium cache for semi-static content
    contentConfig: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 15 * 60 * 1000, // 15 minutes
    },
    // Long-lived cache for static data
    staticConfig: {
      staleTime: 30 * 60 * 1000, // 30 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
    },
  };
}

export type { ParallelLoadingConfig };