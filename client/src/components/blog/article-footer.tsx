import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { type ArticleFooterProps } from "@/types/article-components";

export function ArticleFooter({ article, language, isRTL }: ArticleFooterProps) {
  return (
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
  );
}