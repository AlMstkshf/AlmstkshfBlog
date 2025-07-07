import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Share2 } from "lucide-react";
import { format } from "date-fns";
import { type ArticleHeaderProps } from "@/types/article-components";

export function ArticleHeader({
  article,
  title,
  categoryName,
  readingTime,
  publishedDate,
  language,
  isRTL,
  onShare
}: ArticleHeaderProps) {
  return (
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
          onClick={onShare}
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
  );
}