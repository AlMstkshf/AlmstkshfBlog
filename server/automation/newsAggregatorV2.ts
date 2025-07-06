import OpenAI from 'openai';
import { storage } from '../storage';
import { InsertArticle } from '@shared/schema';
import { CircuitBreaker } from './circuitBreaker';
import { memoryManager } from './memoryManager';
import { rateLimiter } from './advancedRateLimiter';

interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: NewsItem[];
  nextPage?: string;
}

interface NewsItem {
  article_id: string;
  title: string;
  link: string;
  keywords: string[];
  creator: string[];
  video_url?: string;
  description: string;
  content: string;
  pubDate: string;
  image_url?: string;
  source_id: string;
  source_priority: number;
  country: string[];
  category: string[];
  language: string;
}

interface GeneratedArticle {
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  excerptEn: string;
  excerptAr: string;
  metaDescriptionEn: string;
  metaDescriptionAr: string;
  keywords: string[];
  readingTime: number;
}

class NewsAggregatorV2 {
  private apiKey: string;
  private openai: OpenAI;
  private baseUrl = 'https://newsdata.io/api/1/news';
  private scheduler: NodeJS.Timeout | null = null;
  private aiCircuitBreaker!: CircuitBreaker;

  // Target countries for Middle East media industry news
  private countries = ['ae', 'sa', 'eg', 'qa', 'bh']; // UAE, Saudi, Egypt, Qatar, Bahrain
  private mediaKeywords = [
    'media', 'television', 'broadcasting', 'journalism', 'news', 'digital media',
    'social media', 'streaming', 'content creation', 'media industry', 'entertainment',
    'advertising', 'marketing', 'communication', 'press', 'media technology'
  ];

  constructor() {
    this.apiKey = process.env.NEWSDATA_API_KEY || 'pub_39e3c32bc7d54dc6939ab3602aed0de3';
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for content generation');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize Circuit Breaker for AI operations
    this.aiCircuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      timeout: 30000, // 30 seconds
      resetTimeout: 60000 // 1 minute
    });

    // Register memory cleanup for news data cache
    memoryManager.registerCleanupCallback(() => {
      console.log('Cleaning up news aggregator cache...');
      // Clear any cached news data if needed
    });

    this.startScheduler();
  }

  private startScheduler() {
    // AI automation disabled - scheduler inactive
    console.log('News automation scheduler disabled - manual content management only');
  }

  private checkScheduledTime() {
    const now = new Date();
    const dubaiTime = new Date(now.getTime() + (4 * 60 * 60 * 1000)); // UTC+4
    const dayOfWeek = dubaiTime.getDay(); // 0 = Sunday, 1 = Monday, 5 = Friday
    const hour = dubaiTime.getHours();

    // Trigger on Monday (1) and Friday (5) at 7 AM
    if ((dayOfWeek === 1 || dayOfWeek === 5) && hour === 7) {
      console.log(`Triggering automated news article generation - ${dubaiTime.toISOString()}`);
      this.generateWeeklyArticle().catch(console.error);
    }
  }

  async generateWeeklyArticle(): Promise<void> {
    try {
      console.log('Starting weekly article generation process...');
      
      // Step 1: Fetch latest news from Middle East with batching
      const newsItems = await this.fetchMiddleEastMediaNewsBatched();
      console.log(`Fetched ${newsItems.length} news items`);

      if (newsItems.length === 0) {
        console.log('No relevant news found, skipping article generation');
        return;
      }

      // Step 2: Analyze trends and select most relevant stories with rate limiting
      const selectedNews = await this.selectTrendingStoriesWithDelay(newsItems);
      console.log(`Selected ${selectedNews.length} trending stories`);

      // Step 3: Generate comprehensive article using AI with quality validation
      const article = await this.generateArticleContentWithValidation(selectedNews);
      console.log('Article content generated successfully');

      // Step 4: Save to database and publish with error recovery
      await this.publishArticleWithRetry(article);
      console.log('Article published successfully');

    } catch (error) {
      console.error('Error in weekly article generation:', error);
      await this.handleGenerationError(error);
    }
  }

  private async fetchMiddleEastMediaNewsBatched(): Promise<NewsItem[]> {
    const batchSize = 2;
    const allNews: NewsItem[] = [];
    
    for (let i = 0; i < this.countries.length; i += batchSize) {
      const batch = this.countries.slice(i, i + batchSize);
      
      const batchPromises = batch.map(country => 
        this.fetchNewsForCountryWithRetry(country)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allNews.push(...result.value);
        } else {
          console.error(`Failed to fetch news for ${batch[index]}:`, result.reason);
        }
      });
      
      // Rate limiting: 5 second delay between batches
      if (i + batchSize < this.countries.length) {
        await this.delay(5000);
      }
    }

    return this.filterMediaRelatedNews(allNews);
  }

  private async fetchNewsForCountryWithRetry(country: string, maxRetries = 3): Promise<NewsItem[]> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.delay(2000); // 2 second delay before each API call
        return await this.fetchNewsForCountry(country);
      } catch (error) {
        console.error(`Attempt ${attempt} failed for ${country}:`, error);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }
    return [];
  }

  private async fetchMiddleEastMediaNews(): Promise<NewsItem[]> {
    const allNews: NewsItem[] = [];
    
    // Fetch news for each target country
    for (const country of this.countries) {
      try {
        const countryNews = await this.fetchNewsForCountry(country);
        allNews.push(...countryNews);
      } catch (error) {
        console.error(`Error fetching news for ${country}:`, error);
      }
    }

    return this.filterMediaRelatedNews(allNews);
  }

  private async fetchNewsForCountry(country: string): Promise<NewsItem[]> {
    // Apply advanced rate limiting for NewsData.io API
    await rateLimiter.waitForSlot('newsdata-api', 'newsdata', 'high');

    const keywords = this.mediaKeywords.slice(0, 3).join(','); // Use first 3 keywords to save API credits
    const url = `${this.baseUrl}?apikey=${this.apiKey}&country=${country}&q=${keywords}&language=en&size=5`;

    const response = await fetch(url);
    const data: NewsDataResponse = await response.json();

    if (data.status !== 'success') {
      throw new Error(`NewsData API error: ${data.status}`);
    }

    return data.results || [];
  }

  private filterMediaRelatedNews(newsItems: NewsItem[]): NewsItem[] {
    return newsItems.filter(item => {
      const searchText = `${item.title} ${item.description} ${item.content}`.toLowerCase();
      return this.mediaKeywords.some(keyword => 
        searchText.includes(keyword.toLowerCase())
      );
    }).slice(0, 10); // Limit to top 10 most relevant
  }

  private async selectTrendingStoriesWithDelay(newsItems: NewsItem[]): Promise<NewsItem[]> {
    await this.delay(2000); // Rate limiting before AI call
    return this.selectTrendingStories(newsItems);
  }

  private async selectTrendingStories(newsItems: NewsItem[]): Promise<NewsItem[]> {
    // Use AI to analyze and select the most newsworthy stories
    const prompt = `Analyze these Middle East media industry news stories and select the 3 most significant ones for a comprehensive weekly article:

${newsItems.map((item, index) => `
${index + 1}. ${item.title}
Country: ${item.country.join(', ')}
Description: ${item.description}
Keywords: ${item.keywords?.join(', ') || 'N/A'}
`).join('\n')}

Select the 3 most important stories based on:
- Regional impact and significance
- Media industry relevance
- Newsworthiness and timeliness
- Potential for comprehensive analysis

Respond with just the numbers (e.g., "1,3,7") of the selected stories.`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
    });

    const selectedIndices = response.choices[0].message.content
      ?.split(',')
      .map(n => parseInt(n.trim()) - 1)
      .filter(i => i >= 0 && i < newsItems.length) || [0, 1, 2];

    return selectedIndices.map(i => newsItems[i]).filter(Boolean);
  }

  private async generateArticleContent(newsItems: NewsItem[]): Promise<GeneratedArticle> {
    // Use circuit breaker for AI operations and rate limiting
    return await this.aiCircuitBreaker.execute(async () => {
      await rateLimiter.waitForSlot('openai-api', 'openai', 'high');
      
      return await this.performAIGeneration(newsItems);
    });
  }

  private async performAIGeneration(newsItems: NewsItem[]): Promise<GeneratedArticle> {
    const newsContext = newsItems.map(item => `
Title: ${item.title}
Country: ${item.country.join(', ')}
Description: ${item.description}
Content: ${item.content?.substring(0, 500)}...
Source: ${item.source_id}
`).join('\n---\n');

    const prompt = `As an expert journalist specializing in Middle East media industry, create a comprehensive, SEO-optimized bilingual article based on these recent news stories:

${newsContext}

Create an authoritative weekly analysis article that:
1. Synthesizes these stories into coherent industry insights
2. Provides expert commentary on regional media trends
3. Includes relevant data and statistics
4. Follows journalistic standards with proper attribution
5. Is optimized for SEO with targeted keywords
6. Appeals to media professionals and industry stakeholders

CRITICAL REQUIREMENTS:
- Both English and Arabic content must be COMPLETE and SUBSTANTIAL (minimum 1200 words each)
- Arabic content must be a full, professional translation/adaptation, not a summary
- Both versions should have equivalent depth and detail
- Use proper Arabic journalistic style and terminology

Please provide the response in JSON format with the following structure:
{
  "titleEn": "Engaging English title (60-70 characters)",
  "titleAr": "عنوان شامل ومفصل باللغة العربية",
  "contentEn": "Full English article content (minimum 1200 words with detailed analysis)",
  "contentAr": "محتوى المقال الكامل باللغة العربية (1200 كلمة على الأقل مع تحليل مفصل)",
  "excerptEn": "Compelling English excerpt (150-160 characters)",
  "excerptAr": "مقطع شامل وجذاب باللغة العربية (150-160 حرف)",
  "metaDescriptionEn": "SEO meta description in English (150-160 characters)",
  "metaDescriptionAr": "وصف ميتا محسن لمحركات البحث باللغة العربية (150-160 حرف)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "readingTime": 6
}

Ensure both language versions are factual, well-researched, professionally written, and provide equivalent value to readers.`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 8000, // Increased to accommodate full bilingual content
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Failed to generate article content');
    }

    return JSON.parse(content);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async generateArticleContentWithValidation(selectedNews: NewsItem[]): Promise<GeneratedArticle> {
    const article = await this.generateArticleContent(selectedNews);
    
    // Quality validation
    const validator = new (await import('./qualityValidator')).ContentQualityValidator();
    const quality = validator.validateContent(article.titleEn, article.contentEn, article.titleAr, article.contentAr);
    
    if (!quality.passed) {
      console.warn('Article quality issues:', quality.issues);
      // Could implement retry logic here if needed
    }
    
    return article;
  }

  private async publishArticleWithRetry(article: GeneratedArticle, maxRetries = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.publishArticle(article);
        return;
      } catch (error) {
        console.error(`Publish attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }
  }

  private async handleGenerationError(error: any): Promise<void> {
    console.error('Generation error handled:', error);
    // Could implement notification system or fallback mechanisms here
  }

  private async publishArticle(article: GeneratedArticle): Promise<void> {
    // Determine appropriate category (Business Intelligence for media industry analysis)
    const category = await storage.getCategoryBySlug('business-intelligence');
    const categoryId = category?.id || 2;

    // Generate proper slug from English title
    const slug = await this.generateUniqueSlug(article.titleEn);

    const articleData: InsertArticle = {
      slug: slug,
      titleEn: article.titleEn,
      titleAr: article.titleAr,
      excerptEn: article.excerptEn,
      excerptAr: article.excerptAr,
      contentEn: article.contentEn || '',
      contentAr: article.contentAr || '',
      metaDescriptionEn: article.metaDescriptionEn,
      metaDescriptionAr: article.metaDescriptionAr,
      featuredImage: '/api/placeholder/800/400', // Placeholder image
      authorName: 'Almstkshf Editorial Team',
      authorImage: '/api/placeholder/100/100',
      categoryId: categoryId,
      published: true,
      featured: true, // Make it featured as it's a key weekly article
      readingTime: article.readingTime,
      publishedAt: new Date(),
    };

    await storage.createArticle(articleData);
    console.log(`Published article: ${article.titleEn}`);
  }

  // Manual trigger disabled
  async triggerManualGeneration(): Promise<void> {
    console.log('Manual article generation disabled - AI automation inactive');
    return;
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50); // Limit length

    let slug = baseSlug;
    let counter = 1;

    // Check for existing slugs and append counter if needed
    while (true) {
      const existing = await storage.getArticleBySlug(slug);
      if (!existing) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  stopScheduler(): void {
    if (this.scheduler) {
      clearInterval(this.scheduler);
      this.scheduler = null;
      console.log('News automation scheduler stopped');
    }
  }
}

export const newsAggregatorV2 = new NewsAggregatorV2();