import fetch from 'node-fetch';

interface NewsSource {
  name: string;
  baseUrl: string;
  apiKey?: string;
  supportedCountries: string[];
  supportedLanguages: string[];
  rateLimit: number; // requests per hour
}

interface NewsItem {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  url: string;
  source: string;
  country: string;
  publishedAt: string;
  imageUrl?: string;
  category: string;
  keywords: string[];
  relevanceScore: number;
}

interface AggregationJob {
  id: string;
  name: string;
  countries: string[];
  keywords: string[];
  sources: string[];
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  frequency: 'hourly' | 'daily' | 'weekly';
  articlesFound: number;
  status: 'running' | 'idle' | 'error';
}

class NewsAggregator {
  private jobs: Map<string, AggregationJob> = new Map();
  private newsItems: NewsItem[] = [];
  private sources: NewsSource[] = [
    {
      name: 'NewsAPI',
      baseUrl: 'https://newsapi.org/v2',
      apiKey: process.env.NEWS_API_KEY,
      supportedCountries: ['ae', 'eg', 'sa'],
      supportedLanguages: ['en', 'ar'],
      rateLimit: 1000
    },
    {
      name: 'GNews',
      baseUrl: 'https://gnews.io/api/v4',
      apiKey: process.env.GNEWS_API_KEY,
      supportedCountries: ['ae', 'eg', 'sa', 'kw', 'qa', 'bh', 'om'],
      supportedLanguages: ['en', 'ar'],
      rateLimit: 100
    },
    {
      name: 'MediaStack',
      baseUrl: 'http://api.mediastack.com/v1',
      apiKey: process.env.MEDIASTACK_API_KEY,
      supportedCountries: ['ae', 'eg', 'sa', 'kw', 'qa', 'bh', 'om', 'ly', 'sy', 'sd'],
      supportedLanguages: ['en', 'ar'],
      rateLimit: 1000
    }
  ];

  constructor() {
    this.initializeScheduler();
  }

  private initializeScheduler() {
    // Run every hour to check for scheduled jobs
    setInterval(() => {
      this.checkScheduledJobs();
    }, 60 * 60 * 1000); // 1 hour
  }

  private async checkScheduledJobs() {
    const now = new Date();
    
    for (const [id, job] of this.jobs) {
      if (!job.isActive || job.status === 'running') continue;
      
      const shouldRun = this.shouldJobRun(job, now);
      if (shouldRun) {
        await this.runJob(job);
      }
    }
  }

  private shouldJobRun(job: AggregationJob, now: Date): boolean {
    if (!job.lastRun) return true;
    
    const lastRun = new Date(job.lastRun);
    const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60);
    
    switch (job.frequency) {
      case 'hourly':
        return hoursSinceLastRun >= 1;
      case 'daily':
        return hoursSinceLastRun >= 24;
      case 'weekly':
        return hoursSinceLastRun >= 168; // 24 * 7
      default:
        return false;
    }
  }

  async createJob(jobData: Partial<AggregationJob>): Promise<AggregationJob> {
    const job: AggregationJob = {
      id: this.generateId(),
      name: jobData.name || 'Untitled Job',
      countries: jobData.countries || [],
      keywords: jobData.keywords || [],
      sources: jobData.sources || this.getAvailableSourcesForCountries(jobData.countries || []),
      isActive: jobData.isActive ?? true,
      frequency: jobData.frequency || 'daily',
      articlesFound: 0,
      status: 'idle'
    };

    this.jobs.set(job.id, job);
    return job;
  }

  async runJob(job: AggregationJob): Promise<void> {
    try {
      job.status = 'running';
      job.lastRun = new Date().toISOString();
      
      const articles = await this.fetchNews(job.countries, job.keywords);
      
      // Filter articles for relevance
      const relevantArticles = this.filterRelevantArticles(articles, job.keywords);
      
      // Add to news items collection
      this.newsItems.push(...relevantArticles);
      
      // Keep only latest 1000 items to manage memory
      this.newsItems = this.newsItems
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 1000);
      
      job.articlesFound += relevantArticles.length;
      job.status = 'idle';
      
      // Set next run time
      const nextRun = new Date();
      switch (job.frequency) {
        case 'hourly':
          nextRun.setHours(nextRun.getHours() + 1);
          break;
        case 'daily':
          nextRun.setDate(nextRun.getDate() + 1);
          break;
        case 'weekly':
          nextRun.setDate(nextRun.getDate() + 7);
          break;
      }
      job.nextRun = nextRun.toISOString();
      
    } catch (error) {
      console.error(`Error running job ${job.id}:`, error);
      job.status = 'error';
    }
  }

  async fetchNews(countries: string[], keywords: string[] = []): Promise<NewsItem[]> {
    const allArticles: NewsItem[] = [];
    
    for (const source of this.sources) {
      if (!source.apiKey) {
        console.warn(`No API key found for ${source.name}`);
        continue;
      }
      
      const supportedCountries = countries.filter(c => source.supportedCountries.includes(c));
      if (supportedCountries.length === 0) continue;
      
      try {
        const articles = await this.fetchFromSource(source, supportedCountries, keywords);
        allArticles.push(...articles);
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error);
      }
    }
    
    return this.deduplicateArticles(allArticles);
  }

  private async fetchFromSource(
    source: NewsSource, 
    countries: string[], 
    keywords: string[]
  ): Promise<NewsItem[]> {
    const articles: NewsItem[] = [];
    
    switch (source.name) {
      case 'NewsAPI':
        return this.fetchFromNewsAPI(source, countries, keywords);
      case 'GNews':
        return this.fetchFromGNews(source, countries, keywords);
      case 'MediaStack':
        return this.fetchFromMediaStack(source, countries, keywords);
      default:
        return [];
    }
  }

  private async fetchFromNewsAPI(
    source: NewsSource, 
    countries: string[], 
    keywords: string[]
  ): Promise<NewsItem[]> {
    const articles: NewsItem[] = [];
    
    for (const country of countries) {
      try {
        const query = keywords.length > 0 ? keywords.join(' OR ') : '';
        const url = `${source.baseUrl}/top-headlines?country=${country}&q=${encodeURIComponent(query)}&apiKey=${source.apiKey}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`NewsAPI error: ${response.statusText}`);
        }
        
        const data = await response.json() as any;
        
        if (data.articles) {
          for (const article of data.articles) {
            if (!article.title || !article.url) continue;
            
            articles.push({
              id: this.generateId(),
              title: article.title,
              description: article.description || '',
              url: article.url,
              source: article.source?.name || 'NewsAPI',
              country,
              publishedAt: article.publishedAt || new Date().toISOString(),
              imageUrl: article.urlToImage,
              category: 'general',
              keywords: this.extractKeywords(article.title + ' ' + (article.description || '')),
              relevanceScore: this.calculateRelevanceScore(article, keywords)
            });
          }
        }
        
        // Rate limiting
        await this.delay(1000);
        
      } catch (error) {
        console.error(`Error fetching NewsAPI for ${country}:`, error);
      }
    }
    
    return articles;
  }

  private async fetchFromGNews(
    source: NewsSource, 
    countries: string[], 
    keywords: string[]
  ): Promise<NewsItem[]> {
    const articles: NewsItem[] = [];
    
    for (const country of countries) {
      try {
        const query = keywords.length > 0 ? keywords.join(' ') : 'news';
        const url = `${source.baseUrl}/search?q=${encodeURIComponent(query)}&country=${country}&lang=en&max=10&apikey=${source.apiKey}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`GNews error: ${response.statusText}`);
        }
        
        const data = await response.json() as any;
        
        if (data.articles) {
          for (const article of data.articles) {
            if (!article.title || !article.url) continue;
            
            articles.push({
              id: this.generateId(),
              title: article.title,
              description: article.description || '',
              url: article.url,
              source: article.source?.name || 'GNews',
              country,
              publishedAt: article.publishedAt || new Date().toISOString(),
              imageUrl: article.image,
              category: 'general',
              keywords: this.extractKeywords(article.title + ' ' + (article.description || '')),
              relevanceScore: this.calculateRelevanceScore(article, keywords)
            });
          }
        }
        
        // Rate limiting
        await this.delay(2000);
        
      } catch (error) {
        console.error(`Error fetching GNews for ${country}:`, error);
      }
    }
    
    return articles;
  }

  private async fetchFromMediaStack(
    source: NewsSource, 
    countries: string[], 
    keywords: string[]
  ): Promise<NewsItem[]> {
    const articles: NewsItem[] = [];
    
    try {
      const countriesParam = countries.join(',');
      const keywordsParam = keywords.length > 0 ? keywords.join(',') : '';
      const url = `${source.baseUrl}/news?access_key=${source.apiKey}&countries=${countriesParam}&keywords=${encodeURIComponent(keywordsParam)}&limit=25`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`MediaStack error: ${response.statusText}`);
      }
      
      const data = await response.json() as any;
      
      if (data.data) {
        for (const article of data.data) {
          if (!article.title || !article.url) continue;
          
          articles.push({
            id: this.generateId(),
            title: article.title,
            description: article.description || '',
            url: article.url,
            source: article.source || 'MediaStack',
            country: article.country || 'unknown',
            publishedAt: article.published_at || new Date().toISOString(),
            imageUrl: article.image,
            category: article.category || 'general',
            keywords: this.extractKeywords(article.title + ' ' + (article.description || '')),
            relevanceScore: this.calculateRelevanceScore(article, keywords)
          });
        }
      }
      
    } catch (error) {
      console.error('Error fetching MediaStack:', error);
    }
    
    return articles;
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - can be enhanced with NLP
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    return [...new Set(words)].slice(0, 10);
  }

  private calculateRelevanceScore(article: any, keywords: string[]): number {
    if (keywords.length === 0) return 0.5;
    
    const text = (article.title + ' ' + (article.description || '')).toLowerCase();
    const matchedKeywords = keywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );
    
    return matchedKeywords.length / keywords.length;
  }

  private filterRelevantArticles(articles: NewsItem[], keywords: string[]): NewsItem[] {
    if (keywords.length === 0) return articles;
    
    return articles.filter(article => article.relevanceScore > 0.2);
  }

  private deduplicateArticles(articles: NewsItem[]): NewsItem[] {
    const seen = new Set<string>();
    return articles.filter(article => {
      const key = article.title.toLowerCase().substring(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private getAvailableSourcesForCountries(countries: string[]): string[] {
    const availableSources = this.sources
      .filter(source => 
        source.apiKey && 
        countries.some(country => source.supportedCountries.includes(country))
      )
      .map(source => source.name);
    
    return availableSources;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API methods
  getJobs(): AggregationJob[] {
    return Array.from(this.jobs.values());
  }

  getJob(id: string): AggregationJob | undefined {
    return this.jobs.get(id);
  }

  async updateJob(id: string, updates: Partial<AggregationJob>): Promise<AggregationJob | null> {
    const job = this.jobs.get(id);
    if (!job) return null;
    
    Object.assign(job, updates);
    return job;
  }

  async deleteJob(id: string): Promise<boolean> {
    return this.jobs.delete(id);
  }

  getNewsItems(limit: number = 50, offset: number = 0): NewsItem[] {
    return this.newsItems
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(offset, offset + limit);
  }

  async manualFetch(countries: string[], keywords: string[] = []): Promise<NewsItem[]> {
    return this.fetchNews(countries, keywords);
  }
}

export const newsAggregator = new NewsAggregator();