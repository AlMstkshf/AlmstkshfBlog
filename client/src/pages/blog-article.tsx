import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { useLanguage } from "@/hooks/use-language";
import { type ArticleWithCategory } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AccessibilityPanel } from "@/components/blog/accessibility-panel";
import { ArticleHeaderSkeleton, ArticleContentSkeleton } from "@/components/ui/skeletons";
import { calculateReadingTime } from "@/utils/reading-time";

// Import new modular components
import { ArticleHeader } from "@/components/blog/article-header";
import { ArticleContent } from "@/components/blog/article-content";
import { ArticleFooter } from "@/components/blog/article-footer";
import { ArticleSEO } from "@/components/blog/article-seo";
import { ArticleEnhancements } from "@/components/blog/article-enhancements";
import { ArticleBreadcrumb } from "@/components/blog/article-breadcrumb";


// Memoized components for performance
const MemoizedArticleHeader = React.memo(ArticleHeader);
const MemoizedArticleContent = React.memo(ArticleContent);
const MemoizedArticleFooter = React.memo(ArticleFooter);
const MemoizedArticleSEO = React.memo(ArticleSEO);
const MemoizedArticleEnhancements = React.memo(ArticleEnhancements);
const MemoizedArticleBreadcrumb = React.memo(ArticleBreadcrumb);

export default function BlogArticle() {
  const { categorySlug, articleSlug } = useParams();
  const { language, isRTL } = useLanguage();
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);
  const { toast } = useToast();

  const handleShare = () => {
    if (navigator.share && article) {
      const shareData = {
        title: title || article.titleEn,
        text: excerpt || article.excerptEn || "",
        url: window.location.href
      };
      
      navigator.share(shareData).catch(() => {
        // Fallback to copying URL
        copyUrlToClipboard();
      });
    } else {
      // Fallback to copying URL
      copyUrlToClipboard();
    }
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({
        title: language === "ar" ? "تم نسخ الرابط" : "Link copied",
        description: language === "ar" ? "تم نسخ رابط المقال إلى الحافظة" : "Article link copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: language === "ar" ? "فشل في النسخ" : "Copy failed",
        description: language === "ar" ? "لا يمكن نسخ الرابط" : "Cannot copy link",
        variant: "destructive",
      });
    });
  };

  const { data: article, isLoading } = useQuery<ArticleWithCategory>({
    queryKey: ["/api/articles", articleSlug],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${articleSlug}`);
      if (!response.ok) throw new Error("Failed to fetch article");
      return response.json();
    },
    enabled: !!articleSlug,
  });

  // Computed values for article data
  const title = article && language === "ar" && article.titleAr ? article.titleAr : article?.titleEn;
  const content = article && language === "ar" && article.contentAr ? article.contentAr : article?.contentEn;
  const excerpt = article && language === "ar" && article.excerptAr ? article.excerptAr : article?.excerptEn;
  const categoryName = article && language === "ar" && article.category?.nameAr 
    ? article.category.nameAr 
    : article?.category?.nameEn;

  // Calculate reading time
  const readingTimeResult = calculateReadingTime(content || "", language);
  const readingTime = readingTimeResult.minutes;
  
  // URLs and metadata
  const canonicalUrl = article ? `${window.location.origin}/${language}/blog/${article.category?.slug}/${article.slug}` : '';
  const absoluteImageUrl = article?.featuredImage 
    ? (article.featuredImage.startsWith('http') ? article.featuredImage : `${window.location.origin}${article.featuredImage}`)
    : `${window.location.origin}/api/placeholder/800/400`;
  
  // Published date
  const publishedDate = article?.publishedAt 
    ? new Date(article.publishedAt) 
    : article?.createdAt 
    ? new Date(article.createdAt)
    : new Date();

  // Check for charts and data visualizations in content
  const hasCharts = content?.includes('__STRATEGIC_FRAMEWORK_CHART__') || content?.includes('__SPECIFIC_VIZ_') || false;
  const chartTitles = hasCharts ? [
    language === "ar" ? "مؤشرات فعالية الأطر الاستراتيجية للرصد الإعلامي" : "Strategic Framework Effectiveness Indicators for Media Monitoring"
  ] : [];

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white" dir={isRTL ? "rtl" : "ltr"}>
        <Header />
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <ArticleHeaderSkeleton />
          <ArticleContentSkeleton />
        </article>
        <Footer />
      </div>
    );
  }

  // Handle not found state
  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-secondary mb-4">
            {language === "ar" ? "المقال غير موجود" : "Article Not Found"}
          </h1>
          <p className="text-slate-600 mb-8">
            {language === "ar" 
              ? "عذراً، لم نتمكن من العثور على المقال المطلوب."
              : "Sorry, we couldn't find the requested article."
            }
          </p>
          <Link href={`/${language}/blog`}>
            <Button>
              {language === "ar" ? "العودة إلى المدونة" : "Back to Blog"}
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir={isRTL ? "rtl" : "ltr"}>
      {/* SEO Components */}
      {article && (
        <MemoizedArticleSEO
          article={article}
          title={title || ""}
          excerpt={excerpt || ""}
          categoryName={categoryName || ""}
          content={content || ""}
          readingTime={readingTime}
          language={language}
          canonicalUrl={canonicalUrl}
          absoluteImageUrl={absoluteImageUrl}
          publishedDate={publishedDate}
          hasCharts={hasCharts}
          chartTitles={chartTitles}
        />
      )}

      <Header />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Breadcrumb Navigation */}
        {article && (
          <MemoizedArticleBreadcrumb
            article={article}
            title={title || ""}
            categoryName={categoryName || ""}
            language={language}
            isRTL={isRTL}
          />
        )}

        {/* Article Header */}
        {article && (
          <MemoizedArticleHeader
            article={article}
            title={title || ""}
            categoryName={categoryName || ""}
            readingTime={readingTime}
            publishedDate={publishedDate}
            language={language}
            isRTL={isRTL}
            onShare={handleShare}
          />
        )}

        {/* Article Content */}
        <MemoizedArticleContent
          content={content}
          isRTL={isRTL}
          language={language}
          articleSlug={articleSlug || ""}
        />

        {/* Article Footer */}
        {article && (
          <MemoizedArticleFooter
            article={article}
            language={language}
            isRTL={isRTL}
          />
        )}

        {/* Article Enhancements */}
        {article && content && (
          <MemoizedArticleEnhancements
            article={article}
            title={title || ""}
            excerpt={excerpt || ""}
            content={content}
            canonicalUrl={canonicalUrl}
            absoluteImageUrl={absoluteImageUrl}
            readingTime={readingTime}
          />
        )}
      </article>

      {/* Accessibility Panel */}
      <AccessibilityPanel
        isOpen={isAccessibilityPanelOpen}
        onToggle={() => setIsAccessibilityPanelOpen(!isAccessibilityPanelOpen)}
      />

      <Footer />
    </div>
  );
}
