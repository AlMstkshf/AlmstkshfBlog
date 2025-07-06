import { storage } from "../storage";
import { type InsertArticle } from "@shared/schema";

interface ScheduledPost {
  id: string;
  articleId?: number;
  title: string;
  titleAr?: string;
  content: string;
  contentAr?: string;
  excerpt: string;
  excerptAr?: string;
  categoryId: number;
  authorName: string;
  featuredImage?: string;
  scheduledFor: Date;
  status: 'scheduled' | 'published' | 'failed';
  autoPublish: boolean;
  seoOptimized: boolean;
  socialMediaPosts: {
    platform: string;
    content: string;
    scheduled: boolean;
  }[];
}

interface ContentOptimization {
  readabilityScore: number;
  seoScore: number;
  keywordDensity: Record<string, number>;
  suggestions: string[];
  autoApplied: string[];
}

class ContentScheduler {
  private scheduledPosts: Map<string, ScheduledPost> = new Map();
  private isRunning = false;

  constructor() {
    this.startScheduler();
  }

  async schedulePost(postData: Omit<ScheduledPost, 'id' | 'status'>): Promise<string> {
    const id = this.generateId();
    const scheduledPost: ScheduledPost = {
      ...postData,
      id,
      status: 'scheduled'
    };

    if (scheduledPost.seoOptimized) {
      await this.optimizeContent(scheduledPost);
    }

    this.scheduledPosts.set(id, scheduledPost);
    return id;
  }

  async optimizeContent(post: ScheduledPost): Promise<ContentOptimization> {
    const content = post.content;
    const title = post.title;

    const optimization: ContentOptimization = {
      readabilityScore: this.calculateReadability(content),
      seoScore: this.calculateSEOScore(title, content),
      keywordDensity: this.analyzeKeywords(content),
      suggestions: [],
      autoApplied: []
    };

    if (!post.excerpt && content.length > 200) {
      post.excerpt = this.generateExcerpt(content);
      optimization.autoApplied.push('Generated meta description');
    }

    if (!content.includes('##') && content.length > 500) {
      optimization.suggestions.push('Consider adding subheadings for better readability');
    }

    if (title.length > 60) {
      optimization.suggestions.push('Title is too long for SEO (>60 characters)');
    }

    return optimization;
  }

  private startScheduler() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    setInterval(async () => {
      await this.checkScheduledPosts();
    }, 60000);
  }

  private async checkScheduledPosts() {
    const now = new Date();
    
    for (const [id, post] of this.scheduledPosts) {
      if (post.status === 'scheduled' && post.scheduledFor <= now && post.autoPublish) {
        try {
          await this.publishPost(post);
          post.status = 'published';
          
          if (post.socialMediaPosts.length > 0) {
            await this.scheduleSocialMediaPosts(post);
          }
          
        } catch (error) {
          console.error(`Failed to publish scheduled post ${id}:`, error);
          post.status = 'failed';
        }
      }
    }
  }

  private async publishPost(post: ScheduledPost): Promise<void> {
    const articleData: InsertArticle = {
      titleEn: post.title,
      titleAr: post.titleAr,
      contentEn: post.content,
      contentAr: post.contentAr,
      excerptEn: post.excerpt,
      excerptAr: post.excerptAr,
      categoryId: post.categoryId,
      authorName: post.authorName,
      featuredImage: post.featuredImage,
      published: true,
      featured: false,
      slug: this.generateSlug(post.title),
      publishedAt: new Date().toISOString()
    };

    await storage.createArticle(articleData);
  }

  private async scheduleSocialMediaPosts(post: ScheduledPost): Promise<void> {
    for (const socialPost of post.socialMediaPosts) {
      if (socialPost.scheduled) {
        console.log(`Scheduling social media post for ${socialPost.platform}`);
      }
    }
  }

  private calculateReadability(content: string): number {
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    
    let score = 206.835 - (1.015 * avgWordsPerSentence);
    return Math.max(0, Math.min(100, score));
  }

  private calculateSEOScore(title: string, content: string): number {
    let score = 0;
    
    if (title.length >= 30 && title.length <= 60) score += 20;
    if (content.length >= 300) score += 20;
    if (content.includes('#')) score += 15;
    if (content.includes('![') || content.includes('<img')) score += 15;
    if (content.includes('[') && content.includes('](/')) score += 10;
    if (content.length >= 150) score += 20;
    
    return score;
  }

  private analyzeKeywords(content: string): Record<string, number> {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const frequency: Record<string, number> = {};
    const totalWords = words.length;
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    Object.keys(frequency).forEach(word => {
      frequency[word] = (frequency[word] / totalWords) * 100;
    });
    
    return frequency;
  }

  private generateExcerpt(content: string): string {
    return content.substring(0, 150).trim() + '...';
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  getScheduledPosts(): ScheduledPost[] {
    return Array.from(this.scheduledPosts.values());
  }

  updateScheduledPost(id: string, updates: Partial<ScheduledPost>): boolean {
    const post = this.scheduledPosts.get(id);
    if (post) {
      Object.assign(post, updates);
      return true;
    }
    return false;
  }

  cancelScheduledPost(id: string): boolean {
    return this.scheduledPosts.delete(id);
  }
}

export const contentScheduler = new ContentScheduler();