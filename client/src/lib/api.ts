import { useQuery } from "@tanstack/react-query";

// Hook to fetch all blog data in parallel
export const useBlogData = () => {
  return useQuery({
    queryKey: ['blog-data'],
    queryFn: async () => {
      try {
        const [featuredRes, latestRes, categoriesRes] = await Promise.all([
          fetch('/api/articles?featured=true&limit=6'),
          fetch('/api/articles?limit=12'),
          fetch('/api/categories')
        ]);

        const [featuredArticles, latestArticles, categories] = await Promise.all([
          featuredRes.ok ? featuredRes.json() : [],
          latestRes.ok ? latestRes.json() : [],
          categoriesRes.ok ? categoriesRes.json() : []
        ]);

        return {
          featuredArticles: Array.isArray(featuredArticles) ? featuredArticles : [],
          latestArticles: Array.isArray(latestArticles) ? latestArticles : [],
          categories: Array.isArray(categories) ? categories : []
        };
      } catch (error) {
        console.error('Error fetching blog data:', error);
        return {
          featuredArticles: [],
          latestArticles: [],
          categories: []
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3
  });
};