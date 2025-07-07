import { Link } from "wouter";
import { type ArticleBreadcrumbProps } from "@/types/article-components";

export function ArticleBreadcrumb({
  article,
  title,
  categoryName,
  language,
  isRTL
}: ArticleBreadcrumbProps) {
  return (
    <nav 
      className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 text-sm text-slate-600 mb-8 animate-fade-in-up`} 
      dir={isRTL ? "rtl" : "ltr"}
      aria-label={language === "ar" ? "مسار التنقل" : "Breadcrumb navigation"}
    >
      <Link href={`/${language}/blog`}>
        <span className="hover:text-primary cursor-pointer transition-colors duration-200 font-medium">
          {language === "ar" ? "المدونة" : "Blog"}
        </span>
      </Link>
      <span className="text-slate-400">{isRTL ? "←" : "/"}</span>
      {article?.category && (
        <>
          <Link href={`/${language}/blog/${article.category.slug}`}>
            <span className="hover:text-primary cursor-pointer transition-colors duration-200 font-medium">
              {categoryName}
            </span>
          </Link>
          <span className="text-slate-400">{isRTL ? "←" : "/"}</span>
        </>
      )}
      <span className="text-slate-500 truncate">{title}</span>
    </nav>
  );
}