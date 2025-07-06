import { useQuery } from "@tanstack/react-query";
import { useBlogData } from "@/lib/api";
import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { ArticleCard } from "@/components/blog/article-card";
import { CategoryGrid } from "@/components/blog/category-grid";
import { Testimonials } from "@/components/blog/testimonials";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { type ArticleWithCategory } from "@shared/schema";
import { Link } from "wouter";
import { 
  HeroSkeleton, 
  FeaturedArticleSkeleton, 
  ArticleCardSkeleton, 
  NewsletterSkeleton 
} from "@/components/ui/skeletons";
import { MetaTags } from "@/components/seo/meta-tags";

import promoImage from "@assets/Tamer_Younes_Create_a_dynamic,_futuristic_promotional_photos_sh_7b8843e7-7704-40b7-b623-4fa0dd4da563.png";

export default function BlogHome() {
  const { language, isRTL } = useLanguage();

  // Fetch blog data using the unified hook
  const { data: blogData, isLoading } = useBlogData();

  const featuredArticles = blogData?.featuredArticles || [];
  const latestArticles = blogData?.latestArticles || [];
  const categories = blogData?.categories || [];

  // SEO metadata
  const metaTitle = language === "ar" 
    ? "المستكشف - منصة الذكاء الإعلامي للشرق الأوسط | تحليلات وأخبار متقدمة"
    : "Al-Mustakshef - Middle East Media Intelligence Platform | Advanced Analytics & News";
  const metaDescription = language === "ar"
    ? "منصة المستكشف الرائدة للذكاء الإعلامي في الشرق الأوسط. تحليلات متقدمة، رصد إعلامي، وتقارير حكومية وتجارية شاملة من الإمارات والسعودية ومصر وقطر والبحرين."
    : "Al-Mustakshef: Leading Middle East media intelligence platform. Advanced analytics, media monitoring, and comprehensive government and business insights from UAE, Saudi Arabia, Egypt, Qatar, and Bahrain.";

  return (
    <div className="min-h-screen bg-slate-50" dir={isRTL ? "rtl" : "ltr"}>
      <MetaTags
        title={metaTitle}
        description={metaDescription}
        keywords={language === "ar" ? "الذكاء الإعلامي, رصد الإعلام, الشرق الأوسط, تحليلات, أخبار الإمارات, أخبار السعودية, التحول الرقمي" : "media intelligence, Middle East news, analytics, UAE news, Saudi news, digital transformation, government insights, business analysis"}
        ogTitle={metaTitle}
        ogDescription={metaDescription}
        ogImage={promoImage}
        canonical={`${window.location.origin}/${language}/blog`}
        language={language}
      />
      <Header />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-blue-600 to-purple-700 text-white py-16 lg:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full translate-x-32 translate-y-32 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-purple-300 rounded-full -translate-x-16 -translate-y-16 animate-pulse delay-500"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-blue-200 rounded-full animate-bounce delay-300"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-purple-200 rounded-full animate-bounce delay-700"></div>
          <div className="absolute bottom-32 left-20 w-2 h-2 bg-white rounded-full animate-bounce delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in-up">
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                {language === "ar" ? "منصة ذكية للتحليل الإعلامي" : "Intelligent Media Analysis Platform"}
              </div>
              
              <h1 className="lg:text-5xl font-bold mb-6 text-[45px] leading-tight">
                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {language === "ar" ? "رؤى الذكاء الإعلامي" : "Media Intelligence Insights for"}
                </span>
                <span className="text-blue-200 block mt-2 animate-pulse">
                  {language === "ar" ? "للحكومات والمؤسسات" : "Government & Enterprise"}
                </span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed opacity-90">
                {language === "ar"
                  ? "تحليلات الخبراء ودراسات الحالة والرؤى الصناعية حول مراقبة الإعلام وذكاء وسائل التواصل الاجتماعي واتخاذ القرارات المبنية على البيانات في الشرق الأوسط."
                  : "Expert analysis, case studies, and industry insights on media monitoring, social media intelligence, and data-driven decision making in the Middle East."
                }
              </p>

            </div>
            <div className="hidden lg:block">
              <img
                src={promoImage}
                alt={language === "ar" ? "لوحة تحليلات البيانات" : "Data analytics dashboard"}
                className="rounded-xl shadow-2xl w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Featured Articles */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full text-primary text-sm font-medium mb-4">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {language === "ar" ? "مقالات مختارة بعناية" : "Carefully Selected Articles"}
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-6">
              {language === "ar" ? "رؤى مميزة" : "Featured Insights"}
            </h2>
            <p className="text-slate-600 text-lg max-w-3xl mx-auto leading-relaxed">
              {language === "ar"
                ? "أحدث التحليلات ووجهات نظر الخبراء حول استخبارات الإعلام والاستراتيجيات المبنية على البيانات في منطقة الشرق الأوسط"
                : "Latest analysis and expert perspectives on media intelligence and data-driven strategies shaping the Middle East landscape"
              }
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <FeaturedArticleSkeleton />
                </div>
              ))}
            </div>
          ) : featuredArticles && featuredArticles.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredArticles.map((article: any, index: number) => (
                <div 
                  key={article.id} 
                  className="animate-fade-in-up" 
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <ArticleCard article={article} variant="featured" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-600 text-lg">
                {language === "ar" ? "لا توجد مقالات مميزة متاحة حالياً" : "No featured articles available at the moment"}
              </p>
            </div>
          )}
        </div>
      </section>
      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-slate-100 via-slate-50 to-white relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100/80 backdrop-blur-sm rounded-full text-blue-700 text-sm font-medium mb-4">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {language === "ar" ? "تصنيفات متخصصة" : "Specialized Categories"}
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent mb-6">
              {language === "ar" ? "استكشف حسب الفئة" : "Explore by Category"}
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              {language === "ar" 
                ? "محتوى متخصص ومُصمم خصيصاً لقطاعات وحالات استخدام مختلفة في الشرق الأوسط"
                : "Specialized content tailored for different sectors and use cases across the Middle East region"
              }
            </p>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CategoryGrid />
          </div>
        </div>
      </section>
      {/* Latest Articles */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 to-blue-50/30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-end mb-16 animate-fade-in-up">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-slate-100/80 backdrop-blur-sm rounded-full text-slate-700 text-sm font-medium mb-4">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {language === "ar" ? "محدث باستمرار" : "Continuously Updated"}
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent mb-4">
                {language === "ar" ? "أحدث المقالات" : "Latest Articles"}
              </h2>
              <p className="text-slate-600 text-lg max-w-xl leading-relaxed">
                {language === "ar" 
                  ? "ابق على اطلاع دائم بأحدث الرؤى والتحليلات في عالم الذكاء الإعلامي"
                  : "Stay continuously updated with the newest insights and analysis in media intelligence"
                }
              </p>
            </div>
            <Link href={`/${language}/blog/all`}>
              <Button variant="outline" className="hidden sm:flex group border-2 hover:border-primary transition-all duration-300">
                {language === "ar" ? "عرض جميع المقالات" : "View All Articles"}
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <ArticleCardSkeleton />
                </div>
              ))}
            </div>
          ) : latestArticles && latestArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestArticles.map((article: any, index: number) => (
                <div 
                  key={article.id} 
                  className="animate-fade-in-up" 
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in-up">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                {language === "ar" ? "قريباً مقالات جديدة" : "New Articles Coming Soon"}
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                {language === "ar" ? "نعمل على إعداد محتوى جديد ومفيد لك" : "We're working on preparing new and valuable content for you"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="py-20 bg-gradient-to-br from-slate-100 via-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              {language === "ar" ? "استكشف الفئات" : "Explore Categories"}
            </h2>
          </div>
          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />
      <Footer />
    </div>
  );
}
