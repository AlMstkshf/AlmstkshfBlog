import { MetaTags } from "@/components/seo/meta-tags";
import { StructuredData } from "@/components/seo/structured-data";
import { type ArticleSEOProps } from "@/types/article-components";

export function ArticleSEO({
  article,
  title,
  excerpt,
  categoryName,
  content,
  readingTime,
  language,
  canonicalUrl,
  absoluteImageUrl,
  publishedDate,
  hasCharts,
  chartTitles
}: ArticleSEOProps) {
  // SEO metadata preparation
  const metaTitle = title ? `${title} | ${language === "ar" ? "المستكشف - منصة الذكاء الإعلامي" : "Al-Mustakshef - Middle East Media Intelligence"}` : (language === "ar" ? "مقال غير متوفر | المستكشف" : "Article Not Available | Al-Mustakshef");
  const metaDescription = excerpt || (language === "ar" 
    ? "اقرأ أحدث المقالات والتحليلات في مجال الذكاء الإعلامي والتحول الرقمي من المستكشف" 
    : "Read the latest articles and insights on media intelligence and digital transformation from Almstkshf");

  return (
    <>
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
    </>
  );
}