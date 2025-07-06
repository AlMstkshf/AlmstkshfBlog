import { storage } from "../storage";

interface UserBehavior {
  sessionId: string;
  userId?: string;
  articleId: number;
  action: 'view' | 'scroll' | 'share' | 'like' | 'comment' | 'search' | 'click';
  timestamp: Date;
  metadata: {
    scrollDepth?: number;
    timeSpent?: number;
    referrer?: string;
    device?: string;
    language?: string;
    location?: string;
  };
}

interface ContentPerformance {
  articleId: number;
  views: number;
  uniqueViews: number;
  avgTimeSpent: number;
  bounceRate: number;
  shareCount: number;
  engagementScore: number;
  trending: boolean;
  lastUpdated: Date;
}

interface RecommendationRule {
  id: string;
  name: string;
  condition: string;
  weight: number;
  active: boolean;
}

class AnalyticsTracker {
  private behaviors: UserBehavior[] = [];
  private performance: Map<number, ContentPerformance> = new Map();
  private recommendationRules: RecommendationRule[] = [
    {
      id: 'same-category',
      name: 'Same Category Preference',
      condition: 'category_match',
      weight: 0.4,
      active: true
    },
    {
      id: 'reading-time',
      name: 'Reading Time Similarity',
      condition: 'reading_time_similar',
      weight: 0.3,
      active: true
    },
    {
      id: 'trending',
      name: 'Trending Content',
      condition: 'high_engagement',
      weight: 0.2,
      active: true
    },
    {
      id: 'recency',
      name: 'Recent Content',
      condition: 'published_recently',
      weight: 0.1,
      active: true
    }
  ];

  constructor() {
    this.startAnalyticsProcessor();
  }

  trackBehavior(behavior: UserBehavior): void {
    this.behaviors.push(behavior);
    this.updateContentPerformance(behavior);
  }

  private updateContentPerformance(behavior: UserBehavior): void {
    const { articleId, action, metadata } = behavior;
    let perf = this.performance.get(articleId);
    
    if (!perf) {
      perf = {
        articleId,
        views: 0,
        uniqueViews: 0,
        avgTimeSpent: 0,
        bounceRate: 0,
        shareCount: 0,
        engagementScore: 0,
        trending: false,
        lastUpdated: new Date()
      };
      this.performance.set(articleId, perf);
    }

    switch (action) {
      case 'view':
        perf.views++;
        perf.uniqueViews = this.calculateUniqueViews(articleId);
        break;
      case 'scroll':
        if (metadata.timeSpent) {
          perf.avgTimeSpent = this.calculateAverageTimeSpent(articleId, metadata.timeSpent);
        }
        break;
      case 'share':
        perf.shareCount++;
        break;
    }

    perf.engagementScore = this.calculateEngagementScore(perf);
    perf.trending = this.isTrending(perf);
    perf.lastUpdated = new Date();
  }

  private calculateUniqueViews(articleId: number): number {
    const uniqueSessions = new Set(
      this.behaviors
        .filter(b => b.articleId === articleId && b.action === 'view')
        .map(b => b.sessionId)
    );
    return uniqueSessions.size;
  }

  private calculateAverageTimeSpent(articleId: number, newTimeSpent: number): number {
    const timeSpentBehaviors = this.behaviors.filter(
      b => b.articleId === articleId && b.metadata.timeSpent
    );
    
    const totalTime = timeSpentBehaviors.reduce(
      (sum, b) => sum + (b.metadata.timeSpent || 0), 0
    ) + newTimeSpent;
    
    return totalTime / (timeSpentBehaviors.length + 1);
  }

  private calculateEngagementScore(perf: ContentPerformance): number {
    const viewWeight = 0.3;
    const timeWeight = 0.4;
    const shareWeight = 0.3;

    const normalizedViews = Math.min(perf.views / 100, 1);
    const normalizedTime = Math.min(perf.avgTimeSpent / 300, 1); // 5 minutes max
    const normalizedShares = Math.min(perf.shareCount / 10, 1);

    return (normalizedViews * viewWeight + 
            normalizedTime * timeWeight + 
            normalizedShares * shareWeight) * 100;
  }

  private isTrending(perf: ContentPerformance): boolean {
    const recentViews = this.behaviors.filter(
      b => b.articleId === perf.articleId && 
          b.action === 'view' && 
          (Date.now() - b.timestamp.getTime()) < 24 * 60 * 60 * 1000 // Last 24 hours
    ).length;

    return recentViews > 10 && perf.engagementScore > 70;
  }

  async generatePersonalizedRecommendations(
    sessionId: string, 
    currentArticleId?: number
  ): Promise<number[]> {
    const userBehaviors = this.behaviors.filter(b => b.sessionId === sessionId);
    const articles = await storage.getArticles({ limit: 100 });
    
    const scores = new Map<number, number>();

    for (const article of articles) {
      if (article.id === currentArticleId) continue;

      let totalScore = 0;

      for (const rule of this.recommendationRules) {
        if (!rule.active) continue;

        const ruleScore = this.calculateRuleScore(
          rule, 
          article, 
          userBehaviors, 
          currentArticleId
        );
        totalScore += ruleScore * rule.weight;
      }

      scores.set(article.id, totalScore);
    }

    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([articleId]) => articleId);
  }

  private calculateRuleScore(
    rule: RecommendationRule,
    article: any,
    userBehaviors: UserBehavior[],
    currentArticleId?: number
  ): number {
    switch (rule.condition) {
      case 'category_match':
        return this.calculateCategoryMatchScore(article, userBehaviors, currentArticleId);
      case 'reading_time_similar':
        return this.calculateReadingTimeScore(article, userBehaviors);
      case 'high_engagement':
        return this.calculateEngagementRuleScore(article.id);
      case 'published_recently':
        return this.calculateRecencyScore(article);
      default:
        return 0;
    }
  }

  private calculateCategoryMatchScore(
    article: any, 
    userBehaviors: UserBehavior[], 
    currentArticleId?: number
  ): number {
    const viewedCategories = new Map<number, number>();
    
    userBehaviors
      .filter(b => b.action === 'view')
      .forEach(b => {
        // This would need to be enhanced to get category from article ID
        const count = viewedCategories.get(b.articleId) || 0;
        viewedCategories.set(b.articleId, count + 1);
      });

    // Simplified - would need actual category matching logic
    return Math.random() * 100; // Placeholder for demonstration
  }

  private calculateReadingTimeScore(article: any, userBehaviors: UserBehavior[]): number {
    const avgUserReadingTime = userBehaviors
      .filter(b => b.metadata.timeSpent)
      .reduce((sum, b) => sum + (b.metadata.timeSpent || 0), 0) / 
      userBehaviors.filter(b => b.metadata.timeSpent).length;

    // Calculate article's estimated reading time using available data
    const estimatedReadingTime = (article.titleEn || '').split(' ').length * 10; // seconds estimate

    const timeDifference = Math.abs(avgUserReadingTime - estimatedReadingTime);
    return Math.max(0, 100 - (timeDifference / 60) * 10); // Score decreases with time difference
  }

  private calculateEngagementRuleScore(articleId: number): number {
    const perf = this.performance.get(articleId);
    return perf ? perf.engagementScore : 0;
  }

  private calculateRecencyScore(article: any): number {
    const publishedDate = new Date(article.publishedAt || article.createdAt);
    const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return Math.max(0, 100 - daysSincePublished * 5); // Score decreases over time
  }

  private startAnalyticsProcessor(): void {
    setInterval(() => {
      this.processAnalytics();
    }, 300000); // Process every 5 minutes
  }

  private processAnalytics(): void {
    // Clean old behaviors (keep last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.behaviors = this.behaviors.filter(
      b => b.timestamp.getTime() > thirtyDaysAgo
    );

    // Update trending status
    Array.from(this.performance.entries()).forEach(([articleId, perf]) => {
      perf.trending = this.isTrending(perf);
    });
  }

  getContentPerformance(articleId?: number): ContentPerformance[] {
    if (articleId) {
      const perf = this.performance.get(articleId);
      return perf ? [perf] : [];
    }
    return Array.from(this.performance.values());
  }

  getTrendingContent(limit: number = 10): ContentPerformance[] {
    return Array.from(this.performance.values())
      .filter(p => p.trending)
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, limit);
  }

  getUserInsights(sessionId: string): any {
    const userBehaviors = this.behaviors.filter(b => b.sessionId === sessionId);
    
    const topCategories = new Map<string, number>();
    const readingPattern = {
      avgTimeSpent: 0,
      preferredLength: 'medium',
      mostActiveTime: 'afternoon'
    };

    // Calculate insights
    const totalReadingTime = userBehaviors
      .filter(b => b.metadata.timeSpent)
      .reduce((sum, b) => sum + (b.metadata.timeSpent || 0), 0);

    readingPattern.avgTimeSpent = totalReadingTime / userBehaviors.length;

    return {
      topCategories: Array.from(topCategories.entries()),
      readingPattern,
      totalArticlesRead: userBehaviors.filter(b => b.action === 'view').length,
      engagementLevel: this.calculateUserEngagement(userBehaviors)
    };
  }

  private calculateUserEngagement(behaviors: UserBehavior[]): 'low' | 'medium' | 'high' {
    const engagementActions = behaviors.filter(
      b => ['share', 'like', 'comment'].includes(b.action)
    ).length;
    
    const totalActions = behaviors.length;
    const engagementRatio = engagementActions / totalActions;

    if (engagementRatio > 0.1) return 'high';
    if (engagementRatio > 0.05) return 'medium';
    return 'low';
  }
}

export const analyticsTracker = new AnalyticsTracker();