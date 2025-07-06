import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { useLanguage } from "@/hooks/use-language";

export default function BlogHome() {
  const { language } = useLanguage();

  // Simple data fetching
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['/api/articles'],
    queryFn: async () => {
      const response = await fetch('/api/articles');
      if (!response.ok) return [];
      return response.json();
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) return [];
      return response.json();
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {language === "ar" ? "المستكشف" : "Al-Mustakshef"}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {language === "ar"
                ? "منصة الذكاء الإعلامي المتقدمة للشرق الأوسط"
                : "Advanced Media Intelligence Platform for the Middle East"
              }
            </p>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            {language === "ar" ? "أحدث المقالات" : "Latest Articles"}
          </h2>
          
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                {language === "ar" ? "جاري التحميل..." : "Loading..."}
              </p>
            </div>
          ) : articles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.slice(0, 6).map((article: any) => (
                <div key={article.id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-3">
                    {language === "ar" ? article.titleAr || article.titleEn : article.titleEn}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === "ar" ? article.excerptAr || article.excerptEn : article.excerptEn}
                  </p>
                  <a 
                    href={`/${language}/articles/${article.slug}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {language === "ar" ? "اقرأ المزيد" : "Read More"}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {language === "ar" ? "لا توجد مقالات متاحة حالياً" : "No articles available"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            {language === "ar" ? "التصنيفات" : "Categories"}
          </h2>
          
          {categories.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category: any) => (
                <div key={category.id} className="bg-white rounded-lg shadow-md p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    {language === "ar" ? category.nameAr || category.name : category.name}
                  </h3>
                  <a 
                    href={`/${language}/category/${category.slug}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {language === "ar" ? "عرض المقالات" : "View Articles"}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600">
                {language === "ar" ? "لا توجد تصنيفات متاحة" : "No categories available"}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}