import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { useLanguage } from "@/hooks/use-language";
import { type ArticleWithCategory } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, User, ArrowLeft, Share2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ContentRecommendations } from "@/components/blog/content-recommendations";
import { ReadabilityAnalyzer } from "@/components/blog/readability-analyzer";
import { SocialShare } from "@/components/blog/social-share";
import { EngagementHeatmap } from "@/components/blog/engagement-heatmap";
import { PersonalizedRecommendations } from "@/components/blog/personalized-recommendations";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { AccessibilityPanel } from "@/components/blog/accessibility-panel";
import { ArticleHeaderSkeleton, ArticleContentSkeleton } from "@/components/ui/skeletons";
import { calculateReadingTime } from "@/utils/reading-time";
import { MetaTags } from "@/components/seo/meta-tags";
import { StructuredData } from "@/components/seo/structured-data";
import { Breadcrumb } from "@/components/seo/breadcrumb";
import { processArticleContent } from "@/utils/link-converter";
import { enhanceContentWithVisualizations } from "@/utils/content-enhancer";


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

  // Move all computed values and effects here to respect Rules of Hooks
  const title = article && language === "ar" && article.titleAr ? article.titleAr : article?.titleEn;
  const content = article && language === "ar" && article.contentAr ? article.contentAr : article?.contentEn;
  const excerpt = article && language === "ar" && article.excerptAr ? article.excerptAr : article?.excerptEn;
  const categoryName = article && language === "ar" && article.category?.nameAr 
    ? article.category.nameAr 
    : article?.category?.nameEn;

  // Calculate reading time
  const readingTimeResult = calculateReadingTime(content || "", language);
  const readingTime = readingTimeResult.minutes;
  
  // SEO metadata preparation
  const metaTitle = title ? `${title} | ${language === "ar" ? "المستكشف - منصة الذكاء الإعلامي" : "Al-Mustakshef - Middle East Media Intelligence"}` : (language === "ar" ? "مقال غير متوفر | المستكشف" : "Article Not Available | Al-Mustakshef");
  const metaDescription = excerpt || (language === "ar" 
    ? "اقرأ أحدث المقالات والتحليلات في مجال الذكاء الإعلامي والتحول الرقمي من المستكشف" 
    : "Read the latest articles and insights on media intelligence and digital transformation from Almstkshf");
  
  const canonicalUrl = article ? `${window.location.origin}/${language}/blog/${article.category?.slug}/${article.slug}` : '';
  const absoluteImageUrl = article?.featuredImage 
    ? (article.featuredImage.startsWith('http') ? article.featuredImage : `${window.location.origin}${article.featuredImage}`)
    : `${window.location.origin}/api/placeholder/800/400`;
  
  // Breadcrumb data
  const breadcrumbItems = article ? [
    { 
      name: language === "ar" ? "الرئيسية" : "Home",
      nameAr: "الرئيسية",
      url: `/${language}` 
    },
    { 
      name: language === "ar" ? "المدونة" : "Blog",
      nameAr: "المدونة", 
      url: `/${language}/blog` 
    },
    { 
      name: categoryName || "",
      nameAr: article.category?.nameAr || "",
      url: `/${language}/blog/${article.category?.slug}` 
    },
    { 
      name: title || "",
      nameAr: article.titleAr || "",
      url: canonicalUrl 
    }
  ] : [];

  // Structured data for article
  const publishedDate = article?.publishedAt 
    ? new Date(article.publishedAt) 
    : article?.createdAt 
    ? new Date(article.createdAt)
    : new Date();

  const structuredDataProps = article ? {
    title: metaTitle,
    description: metaDescription,
    image: absoluteImageUrl,
    publishedAt: publishedDate.toISOString(),
    updatedAt: article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
    author: article.authorName || 'Almstkshf Editorial Team',
    category: categoryName || '',
    keywords: [],
    wordCount: content?.length || 0,
    readingTime: readingTime,
    language: language,
    url: canonicalUrl
  } : null;

  const timeAgo = article ? formatDistanceToNow(publishedDate, { addSuffix: true }) : "";

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

  // Check for charts and data visualizations in content
  const hasCharts = content?.includes('__STRATEGIC_FRAMEWORK_CHART__') || content?.includes('__SPECIFIC_VIZ_') || false;
  const chartTitles = hasCharts ? [
    language === "ar" ? "مؤشرات فعالية الأطر الاستراتيجية للرصد الإعلامي" : "Strategic Framework Effectiveness Indicators for Media Monitoring"
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir={isRTL ? "rtl" : "ltr"}>
      <MetaTags
        title={metaTitle}
        description={metaDescription}
        ogTitle={title || metaTitle}
        ogDescription={excerpt || metaDescription}
        ogImage={absoluteImageUrl}
        ogUrl={canonicalUrl}
        canonical={canonicalUrl}
        language={language}
        articleData={{
          publishedTime: publishedDate.toISOString(),
          modifiedTime: article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
          author: article.authorName || 'Al-Mustakshef Editorial Team',
          section: categoryName || '',
          tags: [],
          readingTime: readingTime,
          wordCount: content?.length || 0,
          category: categoryName || ''
        }}
        chartData={{
          hasCharts: hasCharts,
          chartTitles: chartTitles,
          datasetName: hasCharts ? "Media Monitoring Effectiveness Data" : undefined
        }}
      />

      <StructuredData
        type="article"
        data={{
          headline: title,
          description: excerpt,
          image: absoluteImageUrl,
          author: article?.authorName,
          datePublished: publishedDate.toISOString(),
          dateModified: article?.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
          category: categoryName,
          keywords: [],
          wordCount: content?.length || 0,
          readingTime: readingTime,
          language: language,
          url: canonicalUrl
        }}
      />

      {hasCharts && (
        <>
          <StructuredData
            type="dataset"
            data={{
              name: "Media Monitoring Effectiveness Data",
              description: language === "ar" 
                ? "بيانات فعالية الرصد الإعلامي في المنطقة العربية" 
                : "Media monitoring effectiveness data in the Arab region",
              url: canonicalUrl,
              creator: "Al-Mustakshef Research Team",
              datePublished: publishedDate.toISOString(),
              keywords: ["media monitoring", "effectiveness", "strategic framework", "Arab region"],
              variables: [
                {
                  "@type": "PropertyValue",
                  name: "detection_infrastructure",
                  description: language === "ar" ? "بنية الكشف التحتية" : "Detection Infrastructure"
                },
                {
                  "@type": "PropertyValue", 
                  name: "response_protocols",
                  description: language === "ar" ? "بروتوكولات الاستجابة" : "Response Protocols"
                },
                {
                  "@type": "PropertyValue",
                  name: "verification_systems", 
                  description: language === "ar" ? "أنظمة التحقق" : "Verification Systems"
                },
                {
                  "@type": "PropertyValue",
                  name: "public_education",
                  description: language === "ar" ? "التعليم العام" : "Public Education"
                }
              ]
            }}
          />
          
          <StructuredData
            type="chart"
            data={{
              title: language === "ar" 
                ? "مؤشرات فعالية الأطر الاستراتيجية للرصد الإعلامي" 
                : "Strategic Framework Effectiveness Indicators for Media Monitoring",
              description: language === "ar"
                ? "قياس أداء المكونات الأساسية لنظام الرصد الإعلامي المتكامل في المنطقة العربية"
                : "Performance measurement of core components for integrated media monitoring system in the Arab region",
              width: 800,
              height: 400,
              topic: "Media Monitoring Effectiveness",
              topicDescription: language === "ar"
                ? "تحليل شامل لفعالية أنظمة الرصد الإعلامي"
                : "Comprehensive analysis of media monitoring system effectiveness"
            }}
          />
        </>
      )}
      <Header />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Breadcrumb */}
        <nav className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 text-sm text-slate-600 mb-8 animate-fade-in-up`} dir={isRTL ? "rtl" : "ltr"}>
          <Link href={`/${language}/blog`}>
            <span className="hover:text-primary cursor-pointer transition-colors duration-200 font-medium">{language === "ar" ? "المدونة" : "Blog"}</span>
          </Link>
          <span className="text-slate-400">{isRTL ? "←" : "/"}</span>
          {article?.category && (
            <>
              <Link href={`/${language}/blog/${article.category.slug}`}>
                <span className="hover:text-primary cursor-pointer transition-colors duration-200 font-medium">{categoryName}</span>
              </Link>
              <span className="text-slate-400">{isRTL ? "←" : "/"}</span>
            </>
          )}
          <span className="text-slate-500 truncate">{title}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-12 animate-fade-in-up">
          {article?.category && (
            <Badge className="mb-6 px-4 py-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors duration-300">
              {categoryName}
            </Badge>
          )}
          
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6 leading-tight">
            {title}
          </h1>

          <div className={`flex flex-wrap items-center gap-6 text-slate-600 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`} dir={isRTL ? "rtl" : "ltr"}>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
              <User className="w-4 h-4" />
              <span className="font-medium">{article.authorName}</span>
            </div>
            
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
              <Calendar className="w-4 h-4" />
              <span>{format(publishedDate, "MMM dd, yyyy")}</span>
            </div>
            
            {readingTime && (
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                <Clock className="w-4 h-4" />
                <span>
                  {readingTime} {language === "ar" ? "دقيقة قراءة" : "min read"}
                </span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 hover:bg-primary/10 hover:border-primary transition-all duration-300`}
            >
              <Share2 className="w-4 h-4" />
              <span>{language === "ar" ? "مشاركة" : "Share"}</span>
            </Button>
          </div>

          {article.featuredImage && (
            <div className="mb-8">
              <img
                src={article.featuredImage}
                alt={title}
                className="w-full h-64 lg:h-96 object-cover rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className={`article-container ${isRTL ? 'rtl-content' : 'ltr-content'}`} dir={isRTL ? "rtl" : "ltr"}>
          {content ? (
            <div 
              className={`article-content prose prose-lg max-w-none ${isRTL ? 'prose-rtl' : ''}`}
              role="main"
              aria-label={language === "ar" ? "محتوى المقال" : "Article content"}
            >
              {enhanceContentWithVisualizations(content, isRTL, article.slug || articleSlug || '')}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600">
                {language === "ar" 
                  ? "محتوى المقال غير متوفر بهذه اللغة."
                  : "Article content is not available in this language."
                }
              </p>
            </div>
          )}
        </div>

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t border-slate-200" dir={isRTL ? "rtl" : "ltr"}>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
              {article.authorImage && (
                <img
                  src={article.authorImage}
                  alt={article.authorName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <div className="font-semibold text-secondary">{article.authorName}</div>
                <div className="text-sm text-slate-600">
                  {language === "ar" ? "كاتب" : "Author"}
                </div>
              </div>
            </div>

            <Link href={`/${language}/blog/${article.category?.slug || ""}`}>
              <Button variant="outline" className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                {isRTL ? (
                  <>
                    <span>المزيد من المقالات</span>
                    <ArrowLeft className="w-4 h-4 transform rotate-180" />
                  </>
                ) : (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    <span>More Articles</span>
                  </>
                )}
              </Button>
            </Link>
          </div>
        </footer>

        {/* Enhanced Social Share Component */}
        {content && (
          <div className="mt-12">
            <SocialShare
              title={title ?? ""}
              excerpt={excerpt || ""}
              url={canonicalUrl}
              author={article?.authorName || "Anonymous"}
              featuredImage={absoluteImageUrl}
              readingTime={readingTime}
              tags={[]}
            />
          </div>
        )}

        {/* Personalized Recommendations */}
        <div className="mt-12">
          <PersonalizedRecommendations
            currentArticleId={article.id}
            currentCategoryId={article.categoryId || 0}

          />
        </div>

        {/* Reading Progress Analytics */}
        {content && (
          <div className="mt-8">
            <ReadingProgress content={content} variant="inline" />
          </div>
        )}
      </article>

      {/* Reading Progress Bar (Floating) */}
      {content && <ReadingProgress content={content} variant="floating" />}

      {/* Accessibility Panel */}
      <AccessibilityPanel
        isOpen={isAccessibilityPanelOpen}
        onToggle={() => setIsAccessibilityPanelOpen(!isAccessibilityPanelOpen)}
      />

      <Footer />
    </div>
  );
}
