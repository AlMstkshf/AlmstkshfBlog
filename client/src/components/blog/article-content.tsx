import { enhanceContentWithVisualizations } from "@/utils/content-enhancer";
import { type ArticleContentProps } from "@/types/article-components";

export function ArticleContent({ content, isRTL, language, articleSlug }: ArticleContentProps) {
  return (
    <div className={`article-container ${isRTL ? 'rtl-content' : 'ltr-content'}`} dir={isRTL ? "rtl" : "ltr"}>
      {content ? (
        <div 
          className={`article-content prose prose-lg max-w-none ${isRTL ? 'prose-rtl' : ''}`}
          role="main"
          aria-label={language === "ar" ? "محتوى المقال" : "Article content"}
        >
          {enhanceContentWithVisualizations(content, isRTL, articleSlug)}
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
  );
}