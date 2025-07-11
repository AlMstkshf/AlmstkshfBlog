import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { ArticleCard } from "@/components/blog/article-card";
import { useLanguage } from "@/hooks/use-language";
import { type ArticleWithCategory, type Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryHeaderSkeleton, ArticleCardSkeleton } from "@/components/ui/skeletons";
import { MetaTags } from "@/components/seo/meta-tags";

export default function BlogCategory() {
  const { slug } = useParams();
  const { language, isRTL } = useLanguage();

  // List of valid category slugs to prevent conflicts with static pages
  const validCategories = [
    'media-monitoring', 
    'ai-intelligence', 
    'crisis-communication', 
    'digital-transformation', 
    'data-analytics', 
    'government-communication',
    // Legacy categories for backward compatibility
    'government', 
    'business-intelligence', 
    'technology-innovation', 
    'social-media-analysis',
    'artificial-intelligence',
    'technology'
  ];
  const isValidCategory = slug && validCategories.includes(slug);

  const { data: category, isLoading: categoryLoading, error } = useQuery<Category>({
    queryKey: ["/api/categories", slug],
    queryFn: async () => {
      const response = await fetch(`/api/categories/${slug}`);
      if (!response.ok) {
        throw new Error("Category not found");
      }
      return response.json();
    },
    enabled: !!isValidCategory,
    retry: false,
  });

  const { data: articles, isLoading: articlesLoading } = useQuery<ArticleWithCategory[]>({
    queryKey: ["/api/articles", { categoryId: category?.id }],
    queryFn: async () => {
      const response = await fetch(`/api/articles?categoryId=${category?.id}&limit=50`);
      if (!response.ok) throw new Error("Failed to fetch articles");
      return response.json();
    },
    enabled: !!category?.id,
  });

  // If not a valid category, don't render anything (let other routes handle it)
  if (!isValidCategory) {
    return null;
  }

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-slate-50" dir={isRTL ? "rtl" : "ltr"}>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <CategoryHeaderSkeleton />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-secondary mb-4">
            {language === "ar" ? "الفئة غير موجودة" : "Category Not Found"}
          </h1>
          <p className="text-slate-600">
            {language === "ar" 
              ? "عذراً، لم نتمكن من العثور على الفئة المطلوبة."
              : "Sorry, we couldn't find the requested category."
            }
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryName = language === "ar" && category.nameAr ? category.nameAr : category.nameEn;
  const categoryDescription = language === "ar" && category.descriptionAr 
    ? category.descriptionAr 
    : category.descriptionEn;

  // SEO metadata preparation
  const metaTitle = categoryName ? `${categoryName} | ${language === "ar" ? "المستكشف - منصة الذكاء الإعلامي" : "Al-Mustakshef - Middle East Media Intelligence"}` : (language === "ar" ? "تصنيف غير متوفر | المستكشف" : "Category Not Available | Al-Mustakshef");
  const metaDescription = categoryDescription || (language === "ar" 
    ? `تصفح أحدث المقالات والتحليلات في فئة ${categoryName} من منصة المستكشف للذكاء الإعلامي` 
    : `Browse the latest articles and insights in ${categoryName} from Al-Mustakshef Media Intelligence platform`);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir={isRTL ? "rtl" : "ltr"}>
      <MetaTags
        title={metaTitle}
        description={metaDescription}
        keywords={`${categoryName}, media intelligence, Middle East news, analysis, ${language === "ar" ? "أخبار الشرق الأوسط" : "business insights"}`}
        ogTitle={metaTitle}
        ogDescription={metaDescription}
        canonical={`${window.location.origin}/${language}/blog/${slug}`}
        language={language}
      />
      <Header />

      {/* Category Header */}
      <section className="relative bg-gradient-to-br from-primary via-blue-600 to-purple-700 text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full -translate-x-32 translate-y-32"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {language === "ar" ? "تصنيف متخصص" : "Specialized Category"}
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight">
              {categoryName}
            </h1>
            {categoryDescription && (
              <p className="text-xl text-blue-100 leading-relaxed opacity-90 max-w-3xl">
                {categoryDescription}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 to-blue-50/30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {articlesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <Skeleton className="h-80 rounded-xl" />
                </div>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-12 animate-fade-in-up">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent mb-2">
                    {language === "ar" ? "جميع المقالات" : "All Articles"}
                  </h2>
                  <p className="text-slate-600">
                    {language === "ar" ? "اكتشف مجموعة شاملة من المقالات المتخصصة" : "Discover our comprehensive collection of specialized articles"}
                  </p>
                </div>
                <div className="bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-primary font-semibold">
                    {articles.length} {language === "ar" ? "مقالة" : "articles"}
                  </span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article, index) => (
                  <div 
                    key={article.id} 
                    className="animate-fade-in-up" 
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 animate-fade-in-up">
              <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-br from-slate-100 to-blue-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
                  <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent mb-4">
                  {language === "ar" ? "لا توجد مقالات بعد" : "No Articles Yet"}
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  {language === "ar"
                    ? "لم يتم نشر أي مقالات في هذه الفئة بعد. نحن نعمل باستمرار على إضافة محتوى جديد ومتخصص."
                    : "No articles have been published in this category yet. We're constantly working on adding new, specialized content."
                  }
                </p>
                <div className="mt-8">
                  <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {language === "ar" ? "المحتوى قادم قريباً" : "Content Coming Soon"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
