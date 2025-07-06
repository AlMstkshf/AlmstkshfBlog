import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { ArticleCard } from "@/components/blog/article-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { type ArticleWithCategory } from "@shared/schema";
import { Search, AlertCircle } from "lucide-react";
import { SearchResultsSkeleton } from "@/components/ui/skeletons";

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  // Get search query from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, []);

  const { data: results, isLoading, error } = useQuery<ArticleWithCategory[]>({
    queryKey: ["/api/search", searchQuery, language],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&language=${language}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: !!searchQuery.trim(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const url = new URL(window.location.href);
      url.searchParams.set('q', searchQuery);
      window.history.pushState({}, '', url.toString());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary mb-6">
            {language === "ar" ? "البحث في المقالات" : "Search Articles"}
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={language === "ar" ? "ابحث في المقالات..." : "Search articles..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-20 py-3 text-lg"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                size="sm"
              >
                {language === "ar" ? "بحث" : "Search"}
              </Button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-secondary">
                {language === "ar" 
                  ? `نتائج البحث عن: "${searchQuery}"` 
                  : `Search results for: "${searchQuery}"`
                }
              </h2>
              {results && (
                <p className="text-slate-600 mt-1">
                  {language === "ar" 
                    ? `${results.length} نتيجة`
                    : `${results.length} results found`
                  }
                </p>
              )}
            </div>

            {isLoading && (
              <SearchResultsSkeleton />
            )}

            {error && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">
                  {language === "ar" ? "حدث خطأ في البحث" : "Search error occurred"}
                </p>
              </div>
            )}

            {results && results.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">
                  {language === "ar" 
                    ? "لم يتم العثور على نتائج لهذا البحث"
                    : "No results found for this search"
                  }
                </p>
                <p className="text-slate-500 mt-2">
                  {language === "ar" 
                    ? "جرب كلمات مفتاحية مختلفة"
                    : "Try different keywords"
                  }
                </p>
              </div>
            )}

            {results && results.length > 0 && (
              <div className="grid gap-8 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="default"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}