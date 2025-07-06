import { storage } from "../storage";

interface ContentFixResult {
  id: number;
  slug: string;
  status: 'needs-improvement' | 'acceptable';
  originalRatio: number;
}

class ContentFixer {
  async fixIncompleteArabicContent(): Promise<ContentFixResult[]> {
    console.log('AI content fixing disabled - analysis only...');
    
    const allArticles = await storage.getArticles({ limit: 1000 });
    const results: ContentFixResult[] = [];
    
    for (const articleSummary of allArticles) {
      const article = await storage.getArticleById(articleSummary.id);
      if (!article) continue;
      
      const contentEnLength = article.contentEn?.length || 0;
      const contentArLength = article.contentAr?.length || 0;
      const ratio = contentEnLength > 0 ? (contentArLength / contentEnLength) * 100 : 0;

      const status = ratio < 50 ? 'needs-improvement' : 'acceptable';
      
      results.push({
        id: article.id,
        slug: article.slug,
        status,
        originalRatio: ratio
      });
    }

    console.log(`Analysis completed. ${results.filter(r => r.status === 'needs-improvement').length} articles need manual review.`);
    return results;
  }
}

export const contentFixer = new ContentFixer();