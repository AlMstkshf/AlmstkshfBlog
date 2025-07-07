import { SocialShare } from "@/components/blog/social-share";
import { PersonalizedRecommendations } from "@/components/blog/personalized-recommendations";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { type ArticleEnhancementsProps } from "@/types/article-components";

export function ArticleEnhancements({
  article,
  title,
  excerpt,
  content,
  canonicalUrl,
  absoluteImageUrl,
  readingTime
}: ArticleEnhancementsProps) {
  return (
    <>
      {/* Enhanced Social Share Component */}
      {content && (
        <div className="mt-12">
          <SocialShare
            title={title ?? ""}
            excerpt={excerpt || ""}
            url={canonicalUrl}
            author={article?.authorName || "Anonymous"}
            featuredImage={absoluteImageUrl}
            readingTime={readingTime}
            tags={[]}
          />
        </div>
      )}

      {/* Personalized Recommendations */}
      <div className="mt-12">
        <PersonalizedRecommendations
          currentArticleId={article.id}
          currentCategoryId={article.categoryId || 0}
        />
      </div>

      {/* Reading Progress Analytics */}
      {content && (
        <div className="mt-8">
          <ReadingProgress content={content} variant="inline" />
        </div>
      )}

      {/* Reading Progress Bar (Floating) */}
      {content && <ReadingProgress content={content} variant="floating" />}
    </>
  );
}