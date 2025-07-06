import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import { type ArticleWithCategory } from "@shared/schema";
import { Sparkles, TrendingUp, Clock } from "lucide-react";

interface PersonalizedRecommendationsProps {
  currentArticleId?: number;
  currentCategoryId?: number;
}

export function PersonalizedRecommendations({ 
  currentArticleId, 
  currentCategoryId
}: PersonalizedRecommendationsProps) {
  const { language, isRTL } = useLanguage();

  const { data: articles, isLoading } = useQuery<ArticleWithCategory[]>({
    queryKey: ["/api/articles"],
    queryFn: async () => {
      const response = await fetch("/api/articles?limit=50&published=true");
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
  });

  const recommendations = useMemo(() => {
    if (!articles || articles.length === 0) return [];

    return articles
      .filter(article => article.id !== currentArticleId && article.published)
      .map(article => {
        let score = 0;
        const reasons: string[] = [];

        // Category similarity
        if (article.categoryId === currentCategoryId) {
          score += 40;
          reasons.push(language === 'ar' ? 'نفس الفئة' : 'Same category');
        }

        // Featured articles boost
        if (article.featured) {
          score += 25;
          reasons.push(language === 'ar' ? 'مقال مميز' : 'Featured article');
        }

        // Recent articles
        const publishedDate = article.publishedAt 
          ? new Date(article.publishedAt) 
          : article.createdAt 
            ? new Date(article.createdAt) 
            : new Date();
        const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSincePublished <= 7) {
          score += 15;
          reasons.push(language === 'ar' ? 'حديث النشر' : 'Recently published');
        }

        return { article, score, reasons };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [articles, currentArticleId, currentCategoryId, language]);

  const getRecommendationTypeIcon = (reasons: string[]) => {
    if (reasons.some(r => r.includes('category') || r.includes('فئة'))) {
      return <TrendingUp className="w-4 h-4" />;
    }
    if (reasons.some(r => r.includes('time') || r.includes('وقت'))) {
      return <Clock className="w-4 h-4" />;
    }
    return <Sparkles className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-64"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="h-20 w-20 bg-slate-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations.length) {
    return null;
  }

  return (
    <Card className="w-full" dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <CardTitle className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
          <Sparkles className="w-5 h-5 text-primary" />
          <span>{language === 'ar' ? 'مقترح لك' : 'Recommended for You'}</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {language === 'ar' 
            ? 'مقالات مختارة بناءً على اهتماماتك وتفضيلاتك'
            : 'Articles curated based on your interests and preferences'
          }
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={rec.article.id} className="group relative">
              <div 
                className={`flex ${isRTL ? 'space-x-reverse' : ''} space-x-4 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer`}
                onClick={() => {
                  const url = `/${language}/blog/${rec.article.category?.slug}/${rec.article.slug}`;
                  window.location.href = url;
                }}
              >
                {/* Article thumbnail */}
                {rec.article.featuredImage && (
                  <img
                    src={rec.article.featuredImage}
                    alt={language === 'ar' && rec.article.titleAr ? rec.article.titleAr : rec.article.titleEn}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                
                {/* Article info */}
                <div className="flex-1 min-w-0">
                  <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''} mb-2`}>
                    <h3 className={`font-semibold text-sm leading-tight line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {language === 'ar' && rec.article.titleAr ? rec.article.titleAr : rec.article.titleEn}
                    </h3>
                    <Badge variant="outline" className="ml-2 text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                  
                  <p className={`text-xs text-muted-foreground line-clamp-2 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {language === 'ar' && rec.article.excerptAr ? rec.article.excerptAr : rec.article.excerptEn}
                  </p>
                  
                  {/* Recommendation reasons */}
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 mb-2`}>
                    {getRecommendationTypeIcon(rec.reasons)}
                    <div className={`flex flex-wrap gap-1 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                      {rec.reasons.slice(0, 2).map((reason: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Article metadata */}
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 text-xs text-muted-foreground`}>
                    <span>{rec.article.authorName || "Anonymous"}</span>
                    {rec.article.readingTime && (
                      <span>{rec.article.readingTime} {language === 'ar' ? 'دق' : 'min'}</span>
                    )}
                    {rec.article.category && (
                      <span>
                        {language === 'ar' && rec.article.category.nameAr 
                          ? rec.article.category.nameAr 
                          : rec.article.category.nameEn
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length > 0 && (
          <div className="mt-6 text-center">
            <div className="text-xs text-muted-foreground">
              {language === 'ar' ? 'عرض 6 من المقترحات' : 'Showing 6 recommendations'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}