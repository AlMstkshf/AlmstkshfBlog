import { db } from "./db";
import { 
  users, categories, articles, newsletterSubscribers, contactSubmissions, 
  automationSettings, apiKeys, downloads,
  type User, type UpsertUser, type Category, type InsertCategory, 
  type Article, type InsertArticle, type ArticleWithCategory,
  type NewsletterSubscriber, type InsertNewsletterSubscriber,
  type ContactSubmission, type InsertContactSubmission,
  type ApiKey, type InsertApiKey, type Download, type InsertDownload
} from "../shared/schema";
import { eq, desc, asc, and, or, ilike, sql } from "drizzle-orm";

// Simple in-memory cache for categories (they rarely change)
const categoryCache = new Map<string, { data: Category[], timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface IStorage {
  // User operations (for future auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Article operations
  getArticles(options?: {
    categoryId?: number;
    featured?: boolean;
    published?: boolean;
    limit?: number;
    offset?: number;
    language?: string;
  }): Promise<ArticleWithCategory[]>;
  getArticlesWithPagination(options?: {
    categoryId?: number;
    featured?: boolean;
    published?: boolean;
    limit?: number;
    offset?: number;
    cursor?: string;
    language?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    articles: ArticleWithCategory[];
    total: number;
    hasNext: boolean;
    nextCursor?: string;
  }>;
  getArticleBySlug(slug: string): Promise<ArticleWithCategory | undefined>;
  getArticleById(id: number): Promise<ArticleWithCategory | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article>;
  deleteArticle(id: number): Promise<void>;
  searchArticles(query: string, language?: string): Promise<ArticleWithCategory[]>;

  // Newsletter operations
  subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  getNewsletterSubscribers(): Promise<NewsletterSubscriber[]>;

  // Contact operations
  submitContactForm(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;

  // Automation settings operations
  getAutomationSetting(key: string): Promise<boolean>;
  setAutomationSetting(key: string, value: boolean): Promise<void>;

  // API key operations
  getApiKeys(): Promise<ApiKey[]>;
  getApiKey(serviceName: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: number, apiKey: Partial<InsertApiKey>): Promise<ApiKey>;
  deleteApiKey(id: number): Promise<void>;
  updateApiKeyLastUsed(serviceName: string): Promise<void>;

  // Text replacement operations
  updateArticleText(id: number, oldText: string, newText: string): Promise<Article>;

  // Downloads operations
  getDownloads(options?: {
    category?: string;
    fileType?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Download[]>;
  getDownloadById(id: number): Promise<Download | undefined>;
  createDownload(download: InsertDownload): Promise<Download>;
  updateDownload(id: number, download: Partial<InsertDownload>): Promise<Download>;
  deleteDownload(id: number): Promise<void>;
  incrementDownloadCount(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: userData,
      })
      .returning();
    return user;
  }

  async getCategories(): Promise<Category[]> {
    const cacheKey = 'all_categories';
    const cached = categoryCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    
    const data = await db.select().from(categories).orderBy(asc(categories.nameEn));
    categoryCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const cacheKey = `category_${slug}`;
    const cached = categoryCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data[0];
    }
    
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug));
    
    if (category) {
      categoryCache.set(cacheKey, { data: [category], timestamp: Date.now() });
    }
    
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    
    // Clear cache when category is created
    categoryCache.clear();
    
    return newCategory;
  }

  async getArticles(options: {
    categoryId?: number;
    featured?: boolean;
    published?: boolean;
    limit?: number;
    offset?: number;
    language?: string;
  } = {}): Promise<ArticleWithCategory[]> {
    const { categoryId, featured, published = true, limit = 50, offset = 0, language = "en" } = options;

    let query = db
      .select({
        id: articles.id,
        slug: articles.slug,
        titleEn: articles.titleEn,
        titleAr: articles.titleAr,
        excerptEn: articles.excerptEn,
        excerptAr: articles.excerptAr,
        // Content is excluded from listing for performance
        metaDescriptionEn: articles.metaDescriptionEn,
        metaDescriptionAr: articles.metaDescriptionAr,
        featuredImage: articles.featuredImage,
        authorName: articles.authorName,
        authorImage: articles.authorImage,
        categoryId: articles.categoryId,
        published: articles.published,
        featured: articles.featured,
        readingTime: articles.readingTime,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        category: {
          id: categories.id,
          slug: categories.slug,
          nameEn: categories.nameEn,
          nameAr: categories.nameAr,
          descriptionEn: categories.descriptionEn,
          descriptionAr: categories.descriptionAr,
          iconName: categories.iconName,
          createdAt: categories.createdAt,
        },
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id));

    const conditions = [];
    if (published !== undefined) conditions.push(eq(articles.published, published));
    if (featured !== undefined) conditions.push(eq(articles.featured, featured));
    if (categoryId !== undefined) conditions.push(eq(articles.categoryId, categoryId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);

    // Add computed language-specific fields for API compatibility
    return results.map(article => ({
      ...article,
      title: language === "ar" ? article.titleAr || article.titleEn : article.titleEn,
      excerpt: language === "ar" ? article.excerptAr || article.excerptEn : article.excerptEn,
      content: '', // Content is excluded from listing for performance
      contentEn: '', // Required for ArticleWithCategory compatibility
      contentAr: '', // Required for ArticleWithCategory compatibility
      metaDescription: language === "ar" ? article.metaDescriptionAr || article.metaDescriptionEn : article.metaDescriptionEn,
    })) as ArticleWithCategory[];
  }

  async getArticlesWithPagination(options: {
    categoryId?: number;
    featured?: boolean;
    published?: boolean;
    limit?: number;
    offset?: number;
    cursor?: string;
    language?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    articles: ArticleWithCategory[];
    total: number;
    hasNext: boolean;
    nextCursor?: string;
  }> {
    const { 
      categoryId, 
      featured, 
      published = true, 
      limit = 20, 
      offset = 0, 
      cursor,
      language = "en",
      sortBy = "publishedAt",
      sortOrder = "desc"
    } = options;

    // Build base conditions
    const conditions = [];
    if (published !== undefined) conditions.push(eq(articles.published, published));
    if (featured !== undefined) conditions.push(eq(articles.featured, featured));
    if (categoryId !== undefined) conditions.push(eq(articles.categoryId, categoryId));

    // Handle cursor-based pagination
    if (cursor) {
      try {
        const cursorData = JSON.parse(Buffer.from(cursor, 'base64').toString());
        const { id, value } = cursorData;
        
        if (sortBy === "publishedAt") {
          if (sortOrder === "desc") {
            conditions.push(
              or(
                sql`${articles.publishedAt} < ${new Date(value)}`,
                and(
                  sql`${articles.publishedAt} = ${new Date(value)}`,
                  sql`${articles.id} < ${id}`
                )
              )
            );
          } else {
            conditions.push(
              or(
                sql`${articles.publishedAt} > ${new Date(value)}`,
                and(
                  sql`${articles.publishedAt} = ${new Date(value)}`,
                  sql`${articles.id} > ${id}`
                )
              )
            );
          }
        } else if (sortBy === "id") {
          if (sortOrder === "desc") {
            conditions.push(sql`${articles.id} < ${id}`);
          } else {
            conditions.push(sql`${articles.id} > ${id}`);
          }
        }
      } catch (error) {
        console.warn("Invalid cursor provided, ignoring:", error);
      }
    }

    // Get total count for pagination metadata
    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(articles);

    if (conditions.length > 0) {
      const countConditions = conditions.filter(condition => 
        !condition.toString().includes('publishedAt') || 
        !condition.toString().includes('id')
      );
      if (countConditions.length > 0) {
        countQuery = countQuery.where(and(...countConditions));
      }
    }

    const [{ count: total }] = await countQuery;

    // Build main query
    let baseQuery = db
      .select({
        id: articles.id,
        slug: articles.slug,
        titleEn: articles.titleEn,
        titleAr: articles.titleAr,
        excerptEn: articles.excerptEn,
        excerptAr: articles.excerptAr,
        // Content is excluded from listing for performance
        metaDescriptionEn: articles.metaDescriptionEn,
        metaDescriptionAr: articles.metaDescriptionAr,
        featuredImage: articles.featuredImage,
        authorName: articles.authorName,
        authorImage: articles.authorImage,
        categoryId: articles.categoryId,
        published: articles.published,
        featured: articles.featured,
        readingTime: articles.readingTime,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        category: {
          id: categories.id,
          slug: categories.slug,
          nameEn: categories.nameEn,
          nameAr: categories.nameAr,
          descriptionEn: categories.descriptionEn,
          descriptionAr: categories.descriptionAr,
          iconName: categories.iconName,
          createdAt: categories.createdAt,
        },
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id));

    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }

    // Apply sorting and execute query
    let results;
    if (sortBy === "publishedAt") {
      results = await baseQuery
        .orderBy(
          sortOrder === "desc" ? desc(articles.publishedAt) : asc(articles.publishedAt),
          sortOrder === "desc" ? desc(articles.id) : asc(articles.id) // Secondary sort for consistency
        )
        .limit(limit + 1)
        .offset(cursor ? 0 : offset);
    } else if (sortBy === "createdAt") {
      results = await baseQuery
        .orderBy(
          sortOrder === "desc" ? desc(articles.createdAt) : asc(articles.createdAt),
          sortOrder === "desc" ? desc(articles.id) : asc(articles.id)
        )
        .limit(limit + 1)
        .offset(cursor ? 0 : offset);
    } else if (sortBy === "id") {
      results = await baseQuery
        .orderBy(
          sortOrder === "desc" ? desc(articles.id) : asc(articles.id)
        )
        .limit(limit + 1)
        .offset(cursor ? 0 : offset);
    } else {
      // Default to publishedAt
      results = await baseQuery
        .orderBy(desc(articles.publishedAt), desc(articles.id))
        .limit(limit + 1)
        .offset(cursor ? 0 : offset);
    }

    // Determine if there are more results
    const hasNext = results.length > limit;
    const articlesData = hasNext ? results.slice(0, limit) : results;

    // Generate next cursor
    let nextCursor: string | undefined;
    if (hasNext && articlesData.length > 0) {
      const lastArticle = articlesData[articlesData.length - 1];
      const cursorValue = sortBy === "publishedAt" 
        ? lastArticle.publishedAt?.toISOString()
        : sortBy === "createdAt"
        ? lastArticle.createdAt?.toISOString()
        : lastArticle.id.toString();
      
      nextCursor = Buffer.from(JSON.stringify({
        id: lastArticle.id,
        value: cursorValue
      })).toString('base64');
    }

    // Add computed language-specific fields for API compatibility
    const processedArticles = articlesData.map(article => ({
      ...article,
      title: language === "ar" ? article.titleAr || article.titleEn : article.titleEn,
      excerpt: language === "ar" ? article.excerptAr || article.excerptEn : article.excerptEn,
      content: '', // Empty content for list view performance
      contentEn: '', // Required for ArticleWithCategory compatibility
      contentAr: '', // Required for ArticleWithCategory compatibility
      metaDescription: language === "ar" ? article.metaDescriptionAr || article.metaDescriptionEn : article.metaDescriptionEn,
    })) as ArticleWithCategory[];

    return {
      articles: processedArticles,
      total,
      hasNext,
      nextCursor
    };
  }

  async getArticleBySlug(slug: string): Promise<ArticleWithCategory | undefined> {
    try {
      const [result] = await db
        .select({
          id: articles.id,
          slug: articles.slug,
          titleEn: articles.titleEn,
          titleAr: articles.titleAr,
          excerptEn: articles.excerptEn,
          excerptAr: articles.excerptAr,
          contentEn: articles.contentEn,
          contentAr: articles.contentAr,
          metaDescriptionEn: articles.metaDescriptionEn,
          metaDescriptionAr: articles.metaDescriptionAr,
          featuredImage: articles.featuredImage,
          authorName: articles.authorName,
          authorImage: articles.authorImage,
          categoryId: articles.categoryId,
          published: articles.published,
          featured: articles.featured,
          readingTime: articles.readingTime,
          publishedAt: articles.publishedAt,
          createdAt: articles.createdAt,
          updatedAt: articles.updatedAt,
          category: {
            id: categories.id,
            slug: categories.slug,
            nameEn: categories.nameEn,
            nameAr: categories.nameAr,
            descriptionEn: categories.descriptionEn,
            descriptionAr: categories.descriptionAr,
            iconName: categories.iconName,
            createdAt: categories.createdAt,
          },
        })
        .from(articles)
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .where(eq(articles.slug, slug));

      if (!result) return undefined;
      
      return {
        ...result,
        title: result.titleEn,
        excerpt: result.excerptEn,
        content: result.contentEn,
        metaDescription: result.metaDescriptionEn,
      } as ArticleWithCategory;
    } catch (error) {
      console.error(`Database error in getArticleBySlug(${slug}):`, error);
      throw error;
    }
  }

  async getArticleById(id: number): Promise<ArticleWithCategory | undefined> {
    const [result] = await db
      .select({
        id: articles.id,
        slug: articles.slug,
        titleEn: articles.titleEn,
        titleAr: articles.titleAr,
        excerptEn: articles.excerptEn,
        excerptAr: articles.excerptAr,
        contentEn: articles.contentEn,
        contentAr: articles.contentAr,
        metaDescriptionEn: articles.metaDescriptionEn,
        metaDescriptionAr: articles.metaDescriptionAr,
        featuredImage: articles.featuredImage,
        authorName: articles.authorName,
        authorImage: articles.authorImage,
        categoryId: articles.categoryId,
        published: articles.published,
        featured: articles.featured,
        readingTime: articles.readingTime,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        category: {
          id: categories.id,
          slug: categories.slug,
          nameEn: categories.nameEn,
          nameAr: categories.nameAr,
          descriptionEn: categories.descriptionEn,
          descriptionAr: categories.descriptionAr,
          iconName: categories.iconName,
          createdAt: categories.createdAt,
        },
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(eq(articles.id, id));

    if (!result) return undefined;
    
    // Add computed language-specific fields for API compatibility
    return {
      ...result,
      title: result.titleEn,
      excerpt: result.excerptEn,
      content: result.contentEn,
      metaDescription: result.metaDescriptionEn,
    } as ArticleWithCategory;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const articleData = { ...article };
    delete (articleData as any).publishNow;

    if ((article as any).publishNow) {
      articleData.published = true;
      articleData.publishedAt = new Date();
    }

    const [newArticle] = await db.insert(articles).values(articleData).returning();
    return newArticle;
  }

  async updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article> {
    const updateData = { ...article, updatedAt: new Date() };
    delete (updateData as any).publishNow;

    if ((article as any).publishNow) {
      updateData.published = true;
      updateData.publishedAt = new Date();
    }

    try {
      const [updatedArticle] = await db
        .update(articles)
        .set(updateData)
        .where(eq(articles.id, id))
        .returning();

      if (!updatedArticle) {
        throw new Error(`Article with id ${id} not found`);
      }

      return updatedArticle;
    } catch (error) {
      console.error(`Error updating article ${id}:`, error);
      throw error;
    }
  }

  async deleteArticle(id: number): Promise<void> {
    const result = await db.delete(articles).where(eq(articles.id, id));
    if (result.rowCount === 0) {
      throw new Error(`Article with id ${id} not found`);
    }
  }

  async searchArticles(query: string, language = "en"): Promise<ArticleWithCategory[]> {
    // Input validation and sanitization
    if (!query || typeof query !== 'string') {
      return [];
    }
    
    // Trim and limit query length to prevent abuse
    const sanitizedQuery = query.trim().slice(0, 100);
    if (sanitizedQuery.length === 0) {
      return [];
    }
    
    // Optimize search by prioritizing title matches and excluding content from initial search
    // This reduces the amount of data transferred and improves performance
    const results = await db
      .select({
        id: articles.id,
        slug: articles.slug,
        titleEn: articles.titleEn,
        titleAr: articles.titleAr,
        excerptEn: articles.excerptEn,
        excerptAr: articles.excerptAr,
        // Exclude content from search results for performance
        metaDescriptionEn: articles.metaDescriptionEn,
        metaDescriptionAr: articles.metaDescriptionAr,
        featuredImage: articles.featuredImage,
        authorName: articles.authorName,
        authorImage: articles.authorImage,
        categoryId: articles.categoryId,
        published: articles.published,
        featured: articles.featured,
        readingTime: articles.readingTime,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        category: {
          id: categories.id,
          slug: categories.slug,
          nameEn: categories.nameEn,
          nameAr: categories.nameAr,
          descriptionEn: categories.descriptionEn,
          descriptionAr: categories.descriptionAr,
          iconName: categories.iconName,
          createdAt: categories.createdAt,
        },
      })
      .from(articles)
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .where(
        and(
          eq(articles.published, true),
          or(
            // Prioritize title and excerpt matches for better performance
            ilike(articles.titleEn, `%${sanitizedQuery}%`),
            ilike(articles.titleAr, `%${sanitizedQuery}%`),
            ilike(articles.excerptEn, `%${sanitizedQuery}%`),
            ilike(articles.excerptAr, `%${sanitizedQuery}%`),
            ilike(categories.nameEn, `%${sanitizedQuery}%`),
            ilike(categories.nameAr, `%${sanitizedQuery}%`)
          )
        )
      )
      .orderBy(
        // Order by featured first, then by publish date for better relevance
        desc(articles.featured),
        desc(articles.publishedAt)
      )
      .limit(30); // Reduced limit for better performance

    return results.map(article => ({
      ...article,
      title: language === "ar" ? article.titleAr || article.titleEn : article.titleEn,
      excerpt: language === "ar" ? article.excerptAr || article.excerptEn : article.excerptEn,
      content: '', // Don't include content in search results for performance
      contentEn: '', // Required for ArticleWithCategory compatibility
      contentAr: '', // Required for ArticleWithCategory compatibility
      metaDescription: language === "ar" ? article.metaDescriptionAr || article.metaDescriptionEn : article.metaDescriptionEn,
    })) as ArticleWithCategory[];
  }

  async subscribeToNewsletter(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [newSubscriber] = await db
      .insert(newsletterSubscribers)
      .values(subscriber)
      .returning();
    return newSubscriber;
  }

  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return await db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.subscribedAt));
  }

  async submitContactForm(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [newSubmission] = await db
      .insert(contactSubmissions)
      .values(submission)
      .returning();
    return newSubmission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.submittedAt));
  }

  async getAutomationSetting(key: string): Promise<boolean> {
    const [setting] = await db
      .select()
      .from(automationSettings)
      .where(eq(automationSettings.settingKey, key));
    return setting?.settingValue ?? false;
  }

  async setAutomationSetting(key: string, value: boolean): Promise<void> {
    try {
      await db
        .insert(automationSettings)
        .values({ settingKey: key, settingValue: value })
        .onConflictDoUpdate({
          target: automationSettings.settingKey,
          set: { settingValue: value, updatedAt: new Date() },
        });
    } catch (error) {
      console.error(`Error setting automation setting ${key}:`, error);
      throw error;
    }
  }

  async getApiKeys(): Promise<ApiKey[]> {
    return await db.select().from(apiKeys).orderBy(asc(apiKeys.serviceName));
  }

  async getApiKey(serviceName: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.serviceName, serviceName));
    return apiKey;
  }

  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const [newApiKey] = await db.insert(apiKeys).values(apiKey).returning();
    return newApiKey;
  }

  async updateApiKey(id: number, apiKey: Partial<InsertApiKey>): Promise<ApiKey> {
    const [updatedApiKey] = await db
      .update(apiKeys)
      .set({ ...apiKey, updatedAt: new Date() })
      .where(eq(apiKeys.id, id))
      .returning();
    return updatedApiKey;
  }

  async deleteApiKey(id: number): Promise<void> {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
  }

  async updateApiKeyLastUsed(serviceName: string): Promise<void> {
    await db
      .update(apiKeys)
      .set({ lastUsed: new Date(), updatedAt: new Date() })
      .where(eq(apiKeys.serviceName, serviceName));
  }

  async updateArticleText(id: number, oldText: string, newText: string): Promise<Article> {
    // First get the current article
    const [currentArticle] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id));

    if (!currentArticle) {
      throw new Error(`Article with id ${id} not found`);
    }

    // Replace text in Arabic fields
    const updatedData = {
      titleAr: currentArticle.titleAr?.replace(new RegExp(oldText, 'g'), newText),
      excerptAr: currentArticle.excerptAr?.replace(new RegExp(oldText, 'g'), newText),
      contentAr: currentArticle.contentAr?.replace(new RegExp(oldText, 'g'), newText),
      updatedAt: new Date()
    };

    const [updatedArticle] = await db
      .update(articles)
      .set(updatedData)
      .where(eq(articles.id, id))
      .returning();

    return updatedArticle;
  }

  // Downloads operations
  async getDownloads(options: {
    category?: string;
    fileType?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<Download[]> {
    // Set default limit to prevent large data transfers
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    
    const conditions = [];
    if (options.category) {
      conditions.push(eq(downloads.category, options.category));
    }
    if (options.fileType) {
      conditions.push(eq(downloads.fileType, options.fileType));
    }
    if (options.featured !== undefined) {
      conditions.push(eq(downloads.featured, options.featured));
    }

    let query = db.select().from(downloads);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Optimize ordering for better index usage
    const results = await query
      .orderBy(
        desc(downloads.featured), 
        desc(downloads.uploadedAt),
        desc(downloads.downloadCount) // Add download count for popularity
      )
      .limit(limit)
      .offset(offset);

    return results;
  }

  async getDownloadById(id: number): Promise<Download | undefined> {
    const [download] = await db
      .select()
      .from(downloads)
      .where(eq(downloads.id, id))
      .limit(1);
    return download;
  }

  async createDownload(download: InsertDownload): Promise<Download> {
    const [created] = await db
      .insert(downloads)
      .values(download)
      .returning();
    return created;
  }

  async updateDownload(id: number, download: Partial<InsertDownload>): Promise<Download> {
    const [updated] = await db
      .update(downloads)
      .set({ ...download, updatedAt: new Date() })
      .where(eq(downloads.id, id))
      .returning();
    return updated;
  }

  async deleteDownload(id: number): Promise<void> {
    await db.delete(downloads).where(eq(downloads.id, id));
  }

  async incrementDownloadCount(id: number): Promise<void> {
    await db
      .update(downloads)
      .set({ downloadCount: sql`${downloads.downloadCount} + 1` })
      .where(eq(downloads.id, id));
  }
}

export const storage = new DatabaseStorage();