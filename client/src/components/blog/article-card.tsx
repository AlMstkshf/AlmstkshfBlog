import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import { type ArticleWithCategory } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ArticleCardProps {
  article: ArticleWithCategory;
  variant?: "default" | "featured" | "compact";
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const { language, isRTL } = useLanguage();

  const title = language === "ar" && article.titleAr ? article.titleAr : article.titleEn;
  const excerpt = language === "ar" && article.excerptAr ? article.excerptAr : article.excerptEn;
  const categoryName = language === "ar" && article.category?.nameAr 
    ? article.category.nameAr 
    : article.category?.nameEn;

  const articleUrl = `/${language}/blog/${article.category?.slug}/${article.slug}`;

  const timeAgo = article.publishedAt 
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : article.createdAt 
    ? formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })
    : formatDistanceToNow(new Date(), { addSuffix: true });

  const getCategoryColor = (categorySlug: string | undefined) => {
    switch (categorySlug) {
      case 'government':
        return 'bg-emerald-500 text-white hover:bg-emerald-600';
      case 'business-intelligence':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      case 'technology-innovation':
        return 'bg-purple-500 text-white hover:bg-purple-600';
      case 'social-media-analysis':
        return 'bg-orange-500 text-white hover:bg-orange-600';
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  if (variant === "compact") {
    return (
      <Link href={articleUrl}>
        <div className="group cursor-pointer" dir={isRTL ? "rtl" : "ltr"}>
          <div className="flex items-center mb-2">
            {article.category && (
              <Badge className={`text-xs ${getCategoryColor(article.category.slug)}`}>
                {categoryName}
              </Badge>
            )}
            <span className="text-slate-500 text-sm ml-3">{timeAgo}</span>
          </div>
          <h3 className="text-lg font-semibold text-secondary mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          {excerpt && (
            <p className="text-slate-600 text-sm mb-3 line-clamp-2">{excerpt}</p>
          )}
          <span className="text-primary font-medium text-sm hover:text-blue-700">
            {language === "ar" ? "اقرأ المزيد ←" : "Read More →"}
          </span>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={articleUrl}>
        <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border-0 bg-gradient-to-br from-white to-slate-50/80 backdrop-blur-sm">
          <div className="relative overflow-hidden">
            {article.featuredImage && (
              <div className="aspect-[16/9] overflow-hidden relative">
                <img
                  src={article.featuredImage}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            )}
            <div className="absolute top-4 left-4">
              {article.category && (
                <Badge className={`${getCategoryColor(article.category.slug)} shadow-lg backdrop-blur-sm bg-opacity-90 transform group-hover:scale-105 transition-transform duration-300`}>
                  {categoryName}
                </Badge>
              )}
            </div>
            {article.featured && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-amber-500 text-white shadow-lg backdrop-blur-sm bg-opacity-90 animate-pulse">
                  ⭐ {language === "ar" ? "مميز" : "Featured"}
                </Badge>
              </div>
            )}
          </div>
          <CardContent className="p-6 relative" dir={isRTL ? "rtl" : "ltr"}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="flex items-center mb-3 gap-3">
              <span className="text-slate-500 text-sm flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {timeAgo}
              </span>
              {article.readingTime && (
                <span className="text-slate-500 text-sm">
                  {article.readingTime}m {language === "ar" ? "قراءة" : "read"}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
              {title}
            </h3>
            {excerpt && (
              <p className="text-slate-600 mb-4 line-clamp-3 leading-relaxed">{excerpt}</p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {article.authorImage ? (
                  <img
                    src={article.authorImage}
                    alt={article.authorName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {article.authorName?.charAt(0) || 'A'}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-700">{article.authorName}</span>
              </div>
              <span className="text-primary font-semibold hover:text-blue-700 text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                {language === "ar" ? "اقرأ المزيد" : "Read More"}
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={articleUrl}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-400 hover:-translate-y-1 cursor-pointer border border-slate-200/50 bg-white/90 backdrop-blur-sm hover:border-primary/30">
        <div className="relative overflow-hidden">
          {article.featuredImage && (
            <div className="aspect-[16/10] overflow-hidden relative">
              <img
                src={article.featuredImage}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            {article.category && (
              <Badge className={`${getCategoryColor(article.category.slug)} text-xs shadow-md backdrop-blur-sm bg-opacity-95 transform group-hover:scale-105 transition-transform duration-300`}>
                {categoryName}
              </Badge>
            )}
          </div>
          {article.featured && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs shadow-md backdrop-blur-sm animate-pulse">
                ⭐ {language === "ar" ? "مميز" : "Featured"}
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-5" dir={isRTL ? "rtl" : "ltr"}>
          <div className="flex items-center mb-3 gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {timeAgo}
            </span>
            {article.readingTime && (
              <>
                <span>•</span>
                <span>{article.readingTime}m {language === "ar" ? "قراءة" : "read"}</span>
              </>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-snug">
            {title}
          </h3>
          {excerpt && (
            <p className="text-slate-600 mb-4 line-clamp-3 leading-relaxed text-sm">{excerpt}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {article.authorImage ? (
                <img
                  src={article.authorImage}
                  alt={article.authorName}
                  className="w-6 h-6 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {article.authorName?.charAt(0) || 'A'}
                </div>
              )}
              <span className="text-sm font-medium text-slate-700">{article.authorName}</span>
            </div>
            <span className="text-primary font-semibold hover:text-blue-700 text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
              {language === "ar" ? "اقرأ المزيد" : "Read More"}
              <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
