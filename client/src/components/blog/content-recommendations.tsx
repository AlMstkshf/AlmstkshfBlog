import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { type ArticleWithCategory } from "@shared/schema";
import { Clock, TrendingUp, BookOpen } from "lucide-react";

interface ContentRecommendationsProps {
  currentArticleId?: number;
  currentCategoryId?: number;
  currentTags?: string[];
}

export function ContentRecommendations({ 
  currentArticleId, 
  currentCategoryId, 
  currentTags = [] 
}: ContentRecommendationsProps) {
  const { language, isRTL } = useLanguage();
  const [recommendations, setRecommendations] = useState<ArticleWithCategory[]>([]);

  const { data: allArticles } = useQuery<ArticleWithCategory[]>({
    queryKey: ["/api/articles", { limit: 100 }],
  });

  const { data: relatedArticles } = useQuery<ArticleWithCategory[]>({
    queryKey: ["/api/articles", { categoryId: currentCategoryId, limit: 10 }],
    enabled: !!currentCategoryId,
  });

  useEffect(() => {
    if (!allArticles) return;

    // AI-powered recommendation algorithm
    const generateRecommendations = () => {
      const scored = allArticles
        .filter(article => article.id !== currentArticleId)
        .map(article => {
          let score = 0;
          
          // Category relevance (30% weight)
          if (article.categoryId === currentCategoryId) {
            score += 30;
          }
          
          // Tag similarity (25% weight)
          const articleTags = article.tags || [];
          const commonTags = currentTags.filter(tag => 
            articleTags.some(articleTag => 
              articleTag.toLowerCase().includes(tag.toLowerCase()) ||
              tag.toLowerCase().includes(articleTag.toLowerCase())
            )
          );
          score += (commonTags.length / Math.max(currentTags.length, 1)) * 25;
          
          // Content similarity based on title keywords (20% weight)
          const currentTitle = language === "ar" ? article.titleAr : article.titleEn;
          const titleWords = currentTitle.toLowerCase().split(/\s+/);
          const relevantWords = titleWords.filter(word => 
            word.length > 3 && 
            !['the', 'and', 'for', 'with', 'this', 'that', 'في', 'على', 'من', 'إلى'].includes(word)
          );
          score += Math.min(relevantWords.length * 2, 20);
          
          // Recency bonus (15% weight)
          const articleDate = new Date(article.createdAt || article.publishedAt || Date.now());
          const daysSincePublished = (Date.now() - articleDate.getTime()) / (1000 * 60 * 60 * 24);
          score += Math.max(15 - daysSincePublished * 0.5, 0);
          
          // Featured content bonus (10% weight)
          if (article.featured) {
            score += 10;
          }
          
          return { ...article, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      setRecommendations(scored);
    };

    generateRecommendations();
  }, [allArticles, currentArticleId, currentCategoryId, currentTags, language]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          {language === "ar" ? "مقالات موصى بها" : "Recommended Articles"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((article) => (
            <Link key={article.id} href={`/${language}/blog/${article.category?.slug}/${article.slug}`}>
              <div className="group cursor-pointer p-4 rounded-lg border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {language === "ar" ? article.category?.nameAr : article.category?.name}
                  </Badge>
                  {article.featured && (
                    <TrendingUp className="w-4 h-4 text-primary" />
                  )}
                </div>
                
                <h4 className="font-semibold text-sm text-secondary group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {language === "ar" ? article.titleAr : article.titleEn}
                </h4>
                
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  {language === "ar" ? article.excerptAr : article.excerptEn}
                </p>
                
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{article.readingTime} {language === "ar" ? "دقيقة" : "min"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{article.authorName}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}