var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  apiKeys: () => apiKeys,
  articles: () => articles,
  articlesRelations: () => articlesRelations,
  automationSettings: () => automationSettings,
  categories: () => categories,
  categoriesRelations: () => categoriesRelations,
  contactSubmissions: () => contactSubmissions,
  downloads: () => downloads,
  insertApiKeySchema: () => insertApiKeySchema,
  insertArticleSchema: () => insertArticleSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertContactSubmissionSchema: () => insertContactSubmissionSchema,
  insertDownloadSchema: () => insertDownloadSchema,
  insertNewsletterSubscriberSchema: () => insertNewsletterSubscriberSchema,
  newsletterSubscribers: () => newsletterSubscribers,
  sessions: () => sessions,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var sessions, users, categories, articles, newsletterSubscribers, contactSubmissions, automationSettings, apiKeys, downloads, categoriesRelations, articlesRelations, insertCategorySchema, insertArticleSchema, insertNewsletterSubscriberSchema, insertContactSubmissionSchema, insertApiKeySchema, insertDownloadSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable("users", {
      id: varchar("id").primaryKey().notNull(),
      email: varchar("email").unique().notNull(),
      firstName: varchar("first_name", { length: 100 }).notNull(),
      lastName: varchar("last_name", { length: 100 }),
      profileImageUrl: varchar("profile_image_url", { length: 500 }),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    categories = pgTable("categories", {
      id: serial("id").primaryKey(),
      slug: varchar("slug", { length: 100 }).notNull().unique(),
      nameEn: varchar("name_en", { length: 200 }).notNull(),
      nameAr: varchar("name_ar", { length: 200 }).notNull(),
      descriptionEn: text("description_en"),
      descriptionAr: text("description_ar"),
      iconName: varchar("icon_name", { length: 50 }),
      createdAt: timestamp("created_at").defaultNow()
    });
    articles = pgTable("articles", {
      id: serial("id").primaryKey(),
      slug: varchar("slug", { length: 200 }).notNull().unique(),
      titleEn: varchar("title_en", { length: 300 }).notNull(),
      titleAr: varchar("title_ar", { length: 300 }),
      excerptEn: text("excerpt_en"),
      excerptAr: text("excerpt_ar"),
      contentEn: text("content_en").notNull(),
      contentAr: text("content_ar"),
      metaDescriptionEn: varchar("meta_description_en", { length: 160 }),
      metaDescriptionAr: varchar("meta_description_ar", { length: 160 }),
      featuredImage: varchar("featured_image", { length: 500 }),
      authorName: varchar("author_name", { length: 100 }).notNull(),
      authorImage: varchar("author_image", { length: 500 }),
      categoryId: integer("category_id").references(() => categories.id),
      published: boolean("published").default(false),
      featured: boolean("featured").default(false),
      readingTime: integer("reading_time"),
      // in minutes
      publishedAt: timestamp("published_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    }, (table) => [
      // Performance indexes for pagination and filtering
      index("idx_articles_published_at").on(table.publishedAt),
      index("idx_articles_category_id").on(table.categoryId),
      index("idx_articles_published").on(table.published),
      index("idx_articles_featured").on(table.featured),
      index("idx_articles_created_at").on(table.createdAt),
      // Composite indexes for common query patterns
      index("idx_articles_published_published_at").on(table.published, table.publishedAt),
      index("idx_articles_category_published").on(table.categoryId, table.published),
      index("idx_articles_featured_published").on(table.featured, table.published),
      // Full-text search support (for future implementation)
      index("idx_articles_title_en").on(table.titleEn),
      index("idx_articles_title_ar").on(table.titleAr)
    ]);
    newsletterSubscribers = pgTable("newsletter_subscribers", {
      id: serial("id").primaryKey(),
      email: varchar("email", { length: 255 }).notNull().unique(),
      language: varchar("language", { length: 2 }).notNull().default("en"),
      // 'en' or 'ar'
      subscribedAt: timestamp("subscribed_at").defaultNow(),
      active: boolean("active").default(true)
    });
    contactSubmissions = pgTable("contact_submissions", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 100 }).notNull(),
      email: varchar("email", { length: 255 }).notNull(),
      company: varchar("company", { length: 200 }),
      message: text("message").notNull(),
      type: varchar("type", { length: 50 }).notNull(),
      // 'demo', 'contact', 'support'
      language: varchar("language", { length: 2 }).notNull().default("en"),
      submittedAt: timestamp("submitted_at").defaultNow(),
      responded: boolean("responded").default(false)
    });
    automationSettings = pgTable("automation_settings", {
      id: serial("id").primaryKey(),
      settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
      settingValue: boolean("setting_value").notNull().default(true),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    apiKeys = pgTable("api_keys", {
      id: serial("id").primaryKey(),
      serviceName: varchar("service_name", { length: 100 }).notNull(),
      // 'openai', 'anthropic', etc.
      keyName: varchar("key_name", { length: 100 }).notNull(),
      keyValue: text("key_value").notNull(),
      description: text("description"),
      isActive: boolean("is_active").default(true),
      lastUsed: timestamp("last_used"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    downloads = pgTable("downloads", {
      id: serial("id").primaryKey(),
      title: varchar("title", { length: 255 }).notNull(),
      titleAr: varchar("title_ar", { length: 255 }),
      description: text("description").notNull(),
      descriptionAr: text("description_ar"),
      fileName: varchar("file_name", { length: 255 }).notNull(),
      originalFileName: varchar("original_file_name", { length: 255 }).notNull(),
      fileSize: varchar("file_size", { length: 50 }).notNull(),
      fileSizeBytes: integer("file_size_bytes").notNull(),
      fileType: varchar("file_type", { length: 20 }).notNull(),
      mimeType: varchar("mime_type", { length: 100 }).notNull(),
      category: varchar("category", { length: 100 }).notNull(),
      categoryAr: varchar("category_ar", { length: 100 }),
      downloadCount: integer("download_count").default(0),
      featured: boolean("featured").default(false),
      tags: text("tags").array(),
      previewUrl: varchar("preview_url", { length: 500 }),
      filePath: varchar("file_path", { length: 500 }).notNull(),
      uploadedAt: timestamp("uploaded_at").defaultNow(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    categoriesRelations = relations(categories, ({ many }) => ({
      articles: many(articles)
    }));
    articlesRelations = relations(articles, ({ one }) => ({
      category: one(categories, {
        fields: [articles.categoryId],
        references: [categories.id]
      })
    }));
    insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
    insertArticleSchema = createInsertSchema(articles).omit({ id: true, createdAt: true, updatedAt: true }).extend({
      publishNow: z.boolean().optional()
    });
    insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({ id: true, subscribedAt: true });
    insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ id: true, submittedAt: true, responded: true });
    insertApiKeySchema = createInsertSchema(apiKeys).omit({ id: true, createdAt: true, updatedAt: true, lastUsed: true });
    insertDownloadSchema = createInsertSchema(downloads).omit({ id: true, downloadCount: true, createdAt: true, updatedAt: true, uploadedAt: true });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db
});
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
var sql, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    dotenv.config();
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema: schema_exports });
  }
});

// netlify/functions/api.ts
import express from "express";
import serverless from "serverless-http";
import cookieParser from "cookie-parser";

// server/storage.ts
init_db();
init_schema();
import { eq, desc, asc, and, or, ilike, sql as sql2 } from "drizzle-orm";
var categoryCache = /* @__PURE__ */ new Map();
var CACHE_TTL = 5 * 60 * 1e3;
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: userData
    }).returning();
    return user;
  }
  async getCategories() {
    const cacheKey = "all_categories";
    const cached = categoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    const data = await db.select().from(categories).orderBy(asc(categories.nameEn));
    categoryCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }
  async getCategoryBySlug(slug) {
    const cacheKey = `category_${slug}`;
    const cached = categoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data[0];
    }
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    if (category) {
      categoryCache.set(cacheKey, { data: [category], timestamp: Date.now() });
    }
    return category;
  }
  async createCategory(category) {
    const [newCategory] = await db.insert(categories).values(category).returning();
    categoryCache.clear();
    return newCategory;
  }
  async getArticles(options = {}) {
    const { categoryId, featured, published = true, limit = 50, offset = 0, language = "en" } = options;
    let query = db.select({
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
        createdAt: categories.createdAt
      }
    }).from(articles).leftJoin(categories, eq(articles.categoryId, categories.id));
    const conditions = [];
    if (published !== void 0) conditions.push(eq(articles.published, published));
    if (featured !== void 0) conditions.push(eq(articles.featured, featured));
    if (categoryId !== void 0) conditions.push(eq(articles.categoryId, categoryId));
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    const results = await query.orderBy(desc(articles.publishedAt)).limit(limit).offset(offset);
    return results.map((article) => ({
      ...article,
      title: language === "ar" ? article.titleAr || article.titleEn : article.titleEn,
      excerpt: language === "ar" ? article.excerptAr || article.excerptEn : article.excerptEn,
      // Content is excluded from listing for performance
      metaDescription: language === "ar" ? article.metaDescriptionAr || article.metaDescriptionEn : article.metaDescriptionEn
    }));
  }
  async getArticlesWithPagination(options = {}) {
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
    const conditions = [];
    if (published !== void 0) conditions.push(eq(articles.published, published));
    if (featured !== void 0) conditions.push(eq(articles.featured, featured));
    if (categoryId !== void 0) conditions.push(eq(articles.categoryId, categoryId));
    if (cursor) {
      try {
        const cursorData = JSON.parse(Buffer.from(cursor, "base64").toString());
        const { id, value } = cursorData;
        if (sortBy === "publishedAt") {
          if (sortOrder === "desc") {
            conditions.push(
              or(
                sql2`${articles.publishedAt} < ${new Date(value)}`,
                and(
                  sql2`${articles.publishedAt} = ${new Date(value)}`,
                  sql2`${articles.id} < ${id}`
                )
              )
            );
          } else {
            conditions.push(
              or(
                sql2`${articles.publishedAt} > ${new Date(value)}`,
                and(
                  sql2`${articles.publishedAt} = ${new Date(value)}`,
                  sql2`${articles.id} > ${id}`
                )
              )
            );
          }
        } else if (sortBy === "id") {
          if (sortOrder === "desc") {
            conditions.push(sql2`${articles.id} < ${id}`);
          } else {
            conditions.push(sql2`${articles.id} > ${id}`);
          }
        }
      } catch (error) {
        console.warn("Invalid cursor provided, ignoring:", error);
      }
    }
    let countQuery = db.select({ count: sql2`count(*)` }).from(articles);
    if (conditions.length > 0) {
      const countConditions = conditions.filter(
        (condition) => !condition.toString().includes("publishedAt") || !condition.toString().includes("id")
      );
      if (countConditions.length > 0) {
        countQuery = countQuery.where(and(...countConditions));
      }
    }
    const [{ count: total }] = await countQuery;
    let query = db.select({
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
        createdAt: categories.createdAt
      }
    }).from(articles).leftJoin(categories, eq(articles.categoryId, categories.id));
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    if (sortBy === "publishedAt") {
      query = query.orderBy(
        sortOrder === "desc" ? desc(articles.publishedAt) : asc(articles.publishedAt),
        sortOrder === "desc" ? desc(articles.id) : asc(articles.id)
        // Secondary sort for consistency
      );
    } else if (sortBy === "createdAt") {
      query = query.orderBy(
        sortOrder === "desc" ? desc(articles.createdAt) : asc(articles.createdAt),
        sortOrder === "desc" ? desc(articles.id) : asc(articles.id)
      );
    } else if (sortBy === "id") {
      query = query.orderBy(
        sortOrder === "desc" ? desc(articles.id) : asc(articles.id)
      );
    } else {
      query = query.orderBy(desc(articles.publishedAt), desc(articles.id));
    }
    const results = await query.limit(limit + 1).offset(cursor ? 0 : offset);
    const hasNext = results.length > limit;
    const articlesData = hasNext ? results.slice(0, limit) : results;
    let nextCursor;
    if (hasNext && articlesData.length > 0) {
      const lastArticle = articlesData[articlesData.length - 1];
      const cursorValue = sortBy === "publishedAt" ? lastArticle.publishedAt?.toISOString() : sortBy === "createdAt" ? lastArticle.createdAt?.toISOString() : lastArticle.id.toString();
      nextCursor = Buffer.from(JSON.stringify({
        id: lastArticle.id,
        value: cursorValue
      })).toString("base64");
    }
    const processedArticles = articlesData.map((article) => ({
      ...article,
      title: language === "ar" ? article.titleAr || article.titleEn : article.titleEn,
      excerpt: language === "ar" ? article.excerptAr || article.excerptEn : article.excerptEn,
      metaDescription: language === "ar" ? article.metaDescriptionAr || article.metaDescriptionEn : article.metaDescriptionEn
    }));
    return {
      articles: processedArticles,
      total,
      hasNext,
      nextCursor
    };
  }
  async getArticleBySlug(slug) {
    try {
      const [result] = await db.select({
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
          createdAt: categories.createdAt
        }
      }).from(articles).leftJoin(categories, eq(articles.categoryId, categories.id)).where(eq(articles.slug, slug));
      if (!result) return void 0;
      return {
        ...result,
        title: result.titleEn,
        excerpt: result.excerptEn,
        content: result.contentEn,
        metaDescription: result.metaDescriptionEn
      };
    } catch (error) {
      console.error(`Database error in getArticleBySlug(${slug}):`, error);
      throw error;
    }
  }
  async getArticleById(id) {
    const [result] = await db.select({
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
        createdAt: categories.createdAt
      }
    }).from(articles).leftJoin(categories, eq(articles.categoryId, categories.id)).where(eq(articles.id, id));
    if (!result) return void 0;
    return {
      ...result,
      title: result.titleEn,
      excerpt: result.excerptEn,
      content: result.contentEn,
      metaDescription: result.metaDescriptionEn
    };
  }
  async createArticle(article) {
    const articleData = { ...article };
    delete articleData.publishNow;
    if (article.publishNow) {
      articleData.published = true;
      articleData.publishedAt = /* @__PURE__ */ new Date();
    }
    const [newArticle] = await db.insert(articles).values(articleData).returning();
    return newArticle;
  }
  async updateArticle(id, article) {
    const updateData = { ...article, updatedAt: /* @__PURE__ */ new Date() };
    delete updateData.publishNow;
    if (article.publishNow) {
      updateData.published = true;
      updateData.publishedAt = /* @__PURE__ */ new Date();
    }
    try {
      const [updatedArticle] = await db.update(articles).set(updateData).where(eq(articles.id, id)).returning();
      if (!updatedArticle) {
        throw new Error(`Article with id ${id} not found`);
      }
      return updatedArticle;
    } catch (error) {
      console.error(`Error updating article ${id}:`, error);
      throw error;
    }
  }
  async deleteArticle(id) {
    const result = await db.delete(articles).where(eq(articles.id, id));
    if (result.rowCount === 0) {
      throw new Error(`Article with id ${id} not found`);
    }
  }
  async searchArticles(query, language = "en") {
    const searchTerm = `%${query}%`;
    const results = await db.select({
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
        createdAt: categories.createdAt
      }
    }).from(articles).leftJoin(categories, eq(articles.categoryId, categories.id)).where(
      and(
        eq(articles.published, true),
        or(
          ilike(articles.titleEn, searchTerm),
          ilike(articles.titleAr, searchTerm),
          ilike(articles.contentEn, searchTerm),
          ilike(articles.contentAr, searchTerm),
          ilike(categories.nameEn, searchTerm),
          ilike(categories.nameAr, searchTerm)
        )
      )
    ).orderBy(desc(articles.publishedAt)).limit(50);
    return results.map((article) => ({
      ...article,
      title: language === "ar" ? article.titleAr || article.titleEn : article.titleEn,
      excerpt: language === "ar" ? article.excerptAr || article.excerptEn : article.excerptEn,
      content: language === "ar" ? article.contentAr || article.contentEn : article.contentEn,
      metaDescription: language === "ar" ? article.metaDescriptionAr || article.metaDescriptionEn : article.metaDescriptionEn
    }));
  }
  async subscribeToNewsletter(subscriber) {
    const [newSubscriber] = await db.insert(newsletterSubscribers).values(subscriber).returning();
    return newSubscriber;
  }
  async getNewsletterSubscribers() {
    return await db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.subscribedAt));
  }
  async submitContactForm(submission) {
    const [newSubmission] = await db.insert(contactSubmissions).values(submission).returning();
    return newSubmission;
  }
  async getContactSubmissions() {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.submittedAt));
  }
  async getAutomationSetting(key) {
    const [setting] = await db.select().from(automationSettings).where(eq(automationSettings.settingKey, key));
    return setting?.settingValue ?? false;
  }
  async setAutomationSetting(key, value) {
    try {
      await db.insert(automationSettings).values({ settingKey: key, settingValue: value }).onConflictDoUpdate({
        target: automationSettings.settingKey,
        set: { settingValue: value, updatedAt: /* @__PURE__ */ new Date() }
      });
    } catch (error) {
      console.error(`Error setting automation setting ${key}:`, error);
      throw error;
    }
  }
  async getApiKeys() {
    return await db.select().from(apiKeys).orderBy(asc(apiKeys.serviceName));
  }
  async getApiKey(serviceName) {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.serviceName, serviceName));
    return apiKey;
  }
  async createApiKey(apiKey) {
    const [newApiKey] = await db.insert(apiKeys).values(apiKey).returning();
    return newApiKey;
  }
  async updateApiKey(id, apiKey) {
    const [updatedApiKey] = await db.update(apiKeys).set({ ...apiKey, updatedAt: /* @__PURE__ */ new Date() }).where(eq(apiKeys.id, id)).returning();
    return updatedApiKey;
  }
  async deleteApiKey(id) {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
  }
  async updateApiKeyLastUsed(serviceName) {
    await db.update(apiKeys).set({ lastUsed: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq(apiKeys.serviceName, serviceName));
  }
  async updateArticleText(id, oldText, newText) {
    const [currentArticle] = await db.select().from(articles).where(eq(articles.id, id));
    if (!currentArticle) {
      throw new Error(`Article with id ${id} not found`);
    }
    const updatedData = {
      titleAr: currentArticle.titleAr?.replace(new RegExp(oldText, "g"), newText),
      excerptAr: currentArticle.excerptAr?.replace(new RegExp(oldText, "g"), newText),
      contentAr: currentArticle.contentAr?.replace(new RegExp(oldText, "g"), newText),
      updatedAt: /* @__PURE__ */ new Date()
    };
    const [updatedArticle] = await db.update(articles).set(updatedData).where(eq(articles.id, id)).returning();
    return updatedArticle;
  }
  // Downloads operations
  async getDownloads(options = {}) {
    let query = db.select().from(downloads);
    const conditions = [];
    if (options.category) {
      conditions.push(eq(downloads.category, options.category));
    }
    if (options.fileType) {
      conditions.push(eq(downloads.fileType, options.fileType));
    }
    if (options.featured !== void 0) {
      conditions.push(eq(downloads.featured, options.featured));
    }
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    query = query.orderBy(desc(downloads.featured), desc(downloads.uploadedAt));
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.offset(options.offset);
    }
    return await query;
  }
  async getDownloadById(id) {
    const [download] = await db.select().from(downloads).where(eq(downloads.id, id)).limit(1);
    return download;
  }
  async createDownload(download) {
    const [created] = await db.insert(downloads).values(download).returning();
    return created;
  }
  async updateDownload(id, download) {
    const [updated] = await db.update(downloads).set({ ...download, updatedAt: /* @__PURE__ */ new Date() }).where(eq(downloads.id, id)).returning();
    return updated;
  }
  async deleteDownload(id) {
    await db.delete(downloads).where(eq(downloads.id, id));
  }
  async incrementDownloadCount(id) {
    await db.update(downloads).set({ downloadCount: sql2`${downloads.downloadCount} + 1` }).where(eq(downloads.id, id));
  }
};
var storage = new DatabaseStorage();

// server/routes-serverless.ts
init_schema();
import { z as z2 } from "zod";

// server/automation/automationRoutes.ts
import { Router } from "express";

// server/automation/contentScheduler.ts
var ContentScheduler = class {
  scheduledPosts = /* @__PURE__ */ new Map();
  isRunning = false;
  constructor() {
    this.startScheduler();
  }
  async schedulePost(postData) {
    const id = this.generateId();
    const scheduledPost = {
      ...postData,
      id,
      status: "scheduled"
    };
    if (scheduledPost.seoOptimized) {
      await this.optimizeContent(scheduledPost);
    }
    this.scheduledPosts.set(id, scheduledPost);
    return id;
  }
  async optimizeContent(post) {
    const content = post.content;
    const title = post.title;
    const optimization = {
      readabilityScore: this.calculateReadability(content),
      seoScore: this.calculateSEOScore(title, content),
      keywordDensity: this.analyzeKeywords(content),
      suggestions: [],
      autoApplied: []
    };
    if (!post.excerpt && content.length > 200) {
      post.excerpt = this.generateExcerpt(content);
      optimization.autoApplied.push("Generated meta description");
    }
    if (!content.includes("##") && content.length > 500) {
      optimization.suggestions.push("Consider adding subheadings for better readability");
    }
    if (title.length > 60) {
      optimization.suggestions.push("Title is too long for SEO (>60 characters)");
    }
    return optimization;
  }
  startScheduler() {
    if (this.isRunning) return;
    this.isRunning = true;
    setInterval(async () => {
      await this.checkScheduledPosts();
    }, 6e4);
  }
  async checkScheduledPosts() {
    const now = /* @__PURE__ */ new Date();
    for (const [id, post] of this.scheduledPosts) {
      if (post.status === "scheduled" && post.scheduledFor <= now && post.autoPublish) {
        try {
          await this.publishPost(post);
          post.status = "published";
          if (post.socialMediaPosts.length > 0) {
            await this.scheduleSocialMediaPosts(post);
          }
        } catch (error) {
          console.error(`Failed to publish scheduled post ${id}:`, error);
          post.status = "failed";
        }
      }
    }
  }
  async publishPost(post) {
    const articleData = {
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
      publishedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await storage.createArticle(articleData);
  }
  async scheduleSocialMediaPosts(post) {
    for (const socialPost of post.socialMediaPosts) {
      if (socialPost.scheduled) {
        console.log(`Scheduling social media post for ${socialPost.platform}`);
      }
    }
  }
  calculateReadability(content) {
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    let score = 206.835 - 1.015 * avgWordsPerSentence;
    return Math.max(0, Math.min(100, score));
  }
  calculateSEOScore(title, content) {
    let score = 0;
    if (title.length >= 30 && title.length <= 60) score += 20;
    if (content.length >= 300) score += 20;
    if (content.includes("#")) score += 15;
    if (content.includes("![") || content.includes("<img")) score += 15;
    if (content.includes("[") && content.includes("](/")) score += 10;
    if (content.length >= 150) score += 20;
    return score;
  }
  analyzeKeywords(content) {
    const words = content.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((word) => word.length > 3);
    const frequency = {};
    const totalWords = words.length;
    words.forEach((word) => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    Object.keys(frequency).forEach((word) => {
      frequency[word] = frequency[word] / totalWords * 100;
    });
    return frequency;
  }
  generateExcerpt(content) {
    return content.substring(0, 150).trim() + "...";
  }
  generateSlug(title) {
    return title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").trim();
  }
  generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  getScheduledPosts() {
    return Array.from(this.scheduledPosts.values());
  }
  updateScheduledPost(id, updates) {
    const post = this.scheduledPosts.get(id);
    if (post) {
      Object.assign(post, updates);
      return true;
    }
    return false;
  }
  cancelScheduledPost(id) {
    return this.scheduledPosts.delete(id);
  }
};
var contentScheduler = new ContentScheduler();

// server/automation/analyticsTracker.ts
var AnalyticsTracker = class {
  behaviors = [];
  performance = /* @__PURE__ */ new Map();
  recommendationRules = [
    {
      id: "same-category",
      name: "Same Category Preference",
      condition: "category_match",
      weight: 0.4,
      active: true
    },
    {
      id: "reading-time",
      name: "Reading Time Similarity",
      condition: "reading_time_similar",
      weight: 0.3,
      active: true
    },
    {
      id: "trending",
      name: "Trending Content",
      condition: "high_engagement",
      weight: 0.2,
      active: true
    },
    {
      id: "recency",
      name: "Recent Content",
      condition: "published_recently",
      weight: 0.1,
      active: true
    }
  ];
  constructor() {
    this.startAnalyticsProcessor();
  }
  trackBehavior(behavior) {
    this.behaviors.push(behavior);
    this.updateContentPerformance(behavior);
  }
  updateContentPerformance(behavior) {
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
        lastUpdated: /* @__PURE__ */ new Date()
      };
      this.performance.set(articleId, perf);
    }
    switch (action) {
      case "view":
        perf.views++;
        perf.uniqueViews = this.calculateUniqueViews(articleId);
        break;
      case "scroll":
        if (metadata.timeSpent) {
          perf.avgTimeSpent = this.calculateAverageTimeSpent(articleId, metadata.timeSpent);
        }
        break;
      case "share":
        perf.shareCount++;
        break;
    }
    perf.engagementScore = this.calculateEngagementScore(perf);
    perf.trending = this.isTrending(perf);
    perf.lastUpdated = /* @__PURE__ */ new Date();
  }
  calculateUniqueViews(articleId) {
    const uniqueSessions = new Set(
      this.behaviors.filter((b) => b.articleId === articleId && b.action === "view").map((b) => b.sessionId)
    );
    return uniqueSessions.size;
  }
  calculateAverageTimeSpent(articleId, newTimeSpent) {
    const timeSpentBehaviors = this.behaviors.filter(
      (b) => b.articleId === articleId && b.metadata.timeSpent
    );
    const totalTime = timeSpentBehaviors.reduce(
      (sum, b) => sum + (b.metadata.timeSpent || 0),
      0
    ) + newTimeSpent;
    return totalTime / (timeSpentBehaviors.length + 1);
  }
  calculateEngagementScore(perf) {
    const viewWeight = 0.3;
    const timeWeight = 0.4;
    const shareWeight = 0.3;
    const normalizedViews = Math.min(perf.views / 100, 1);
    const normalizedTime = Math.min(perf.avgTimeSpent / 300, 1);
    const normalizedShares = Math.min(perf.shareCount / 10, 1);
    return (normalizedViews * viewWeight + normalizedTime * timeWeight + normalizedShares * shareWeight) * 100;
  }
  isTrending(perf) {
    const recentViews = this.behaviors.filter(
      (b) => b.articleId === perf.articleId && b.action === "view" && Date.now() - b.timestamp.getTime() < 24 * 60 * 60 * 1e3
      // Last 24 hours
    ).length;
    return recentViews > 10 && perf.engagementScore > 70;
  }
  async generatePersonalizedRecommendations(sessionId, currentArticleId) {
    const userBehaviors = this.behaviors.filter((b) => b.sessionId === sessionId);
    const articles2 = await storage.getArticles({ limit: 100 });
    const scores = /* @__PURE__ */ new Map();
    for (const article of articles2) {
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
    return Array.from(scores.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([articleId]) => articleId);
  }
  calculateRuleScore(rule, article, userBehaviors, currentArticleId) {
    switch (rule.condition) {
      case "category_match":
        return this.calculateCategoryMatchScore(article, userBehaviors, currentArticleId);
      case "reading_time_similar":
        return this.calculateReadingTimeScore(article, userBehaviors);
      case "high_engagement":
        return this.calculateEngagementRuleScore(article.id);
      case "published_recently":
        return this.calculateRecencyScore(article);
      default:
        return 0;
    }
  }
  calculateCategoryMatchScore(article, userBehaviors, currentArticleId) {
    const viewedCategories = /* @__PURE__ */ new Map();
    userBehaviors.filter((b) => b.action === "view").forEach((b) => {
      const count = viewedCategories.get(b.articleId) || 0;
      viewedCategories.set(b.articleId, count + 1);
    });
    return Math.random() * 100;
  }
  calculateReadingTimeScore(article, userBehaviors) {
    const avgUserReadingTime = userBehaviors.filter((b) => b.metadata.timeSpent).reduce((sum, b) => sum + (b.metadata.timeSpent || 0), 0) / userBehaviors.filter((b) => b.metadata.timeSpent).length;
    const estimatedReadingTime = (article.titleEn || "").split(" ").length * 10;
    const timeDifference = Math.abs(avgUserReadingTime - estimatedReadingTime);
    return Math.max(0, 100 - timeDifference / 60 * 10);
  }
  calculateEngagementRuleScore(articleId) {
    const perf = this.performance.get(articleId);
    return perf ? perf.engagementScore : 0;
  }
  calculateRecencyScore(article) {
    const publishedDate = new Date(article.publishedAt || article.createdAt);
    const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1e3 * 60 * 60 * 24);
    return Math.max(0, 100 - daysSincePublished * 5);
  }
  startAnalyticsProcessor() {
    setInterval(() => {
      this.processAnalytics();
    }, 3e5);
  }
  processAnalytics() {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1e3;
    this.behaviors = this.behaviors.filter(
      (b) => b.timestamp.getTime() > thirtyDaysAgo
    );
    Array.from(this.performance.entries()).forEach(([articleId, perf]) => {
      perf.trending = this.isTrending(perf);
    });
  }
  getContentPerformance(articleId) {
    if (articleId) {
      const perf = this.performance.get(articleId);
      return perf ? [perf] : [];
    }
    return Array.from(this.performance.values());
  }
  getTrendingContent(limit = 10) {
    return Array.from(this.performance.values()).filter((p) => p.trending).sort((a, b) => b.engagementScore - a.engagementScore).slice(0, limit);
  }
  getUserInsights(sessionId) {
    const userBehaviors = this.behaviors.filter((b) => b.sessionId === sessionId);
    const topCategories = /* @__PURE__ */ new Map();
    const readingPattern = {
      avgTimeSpent: 0,
      preferredLength: "medium",
      mostActiveTime: "afternoon"
    };
    const totalReadingTime = userBehaviors.filter((b) => b.metadata.timeSpent).reduce((sum, b) => sum + (b.metadata.timeSpent || 0), 0);
    readingPattern.avgTimeSpent = totalReadingTime / userBehaviors.length;
    return {
      topCategories: Array.from(topCategories.entries()),
      readingPattern,
      totalArticlesRead: userBehaviors.filter((b) => b.action === "view").length,
      engagementLevel: this.calculateUserEngagement(userBehaviors)
    };
  }
  calculateUserEngagement(behaviors) {
    const engagementActions = behaviors.filter(
      (b) => ["share", "like", "comment"].includes(b.action)
    ).length;
    const totalActions = behaviors.length;
    const engagementRatio = engagementActions / totalActions;
    if (engagementRatio > 0.1) return "high";
    if (engagementRatio > 0.05) return "medium";
    return "low";
  }
};
var analyticsTracker = new AnalyticsTracker();

// server/automation/emailAutomation.ts
import { MailService } from "@sendgrid/mail";
var EmailAutomation = class {
  templates = /* @__PURE__ */ new Map();
  emailQueue = [];
  isProcessing = false;
  mailService;
  constructor() {
    this.mailService = new MailService();
    if (process.env.SENDGRID_API_KEY) {
      this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
    }
    this.initializeTemplates();
    this.startEmailProcessor();
  }
  initializeTemplates() {
    const templates = [
      {
        id: "welcome",
        name: "Welcome Email",
        subject: "Welcome to ALMSTKSHF - Your Media Intelligence Hub",
        subjectAr: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0627\u0644\u0645\u0633\u062A\u0643\u0634\u0641 - \u0645\u0631\u0643\u0632 \u0630\u0643\u0627\u0621 \u0627\u0644\u0625\u0639\u0644\u0627\u0645",
        bodyEn: `
          <h1>Welcome to ALMSTKSHF, {{name}}!</h1>
          <p>Thank you for subscribing to our newsletter. You'll receive the latest insights on media intelligence, digital transformation, and regional analysis.</p>
          <h2>What to expect:</h2>
          <ul>
            <li>Weekly digest of trending articles</li>
            <li>Breaking news in media and technology</li>
            <li>Exclusive insights from industry experts</li>
          </ul>
          <p>Best regards,<br>The ALMSTKSHF Team</p>
        `,
        bodyAr: `
          <h1>\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0627\u0644\u0645\u0633\u062A\u0643\u0634\u0641\u060C {{name}}!</h1>
          <p>\u0634\u0643\u0631\u0627\u064B \u0644\u0643 \u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0643 \u0641\u064A \u0646\u0634\u0631\u062A\u0646\u0627 \u0627\u0644\u0625\u062E\u0628\u0627\u0631\u064A\u0629. \u0633\u062A\u062A\u0644\u0642\u0649 \u0623\u062D\u062F\u062B \u0627\u0644\u0623\u0641\u0643\u0627\u0631 \u062D\u0648\u0644 \u0630\u0643\u0627\u0621 \u0627\u0644\u0625\u0639\u0644\u0627\u0645 \u0648\u0627\u0644\u062A\u062D\u0648\u0644 \u0627\u0644\u0631\u0642\u0645\u064A \u0648\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A.</p>
          <h2>\u0645\u0627 \u064A\u0645\u0643\u0646 \u062A\u0648\u0642\u0639\u0647:</h2>
          <ul>
            <li>\u0645\u0644\u062E\u0635 \u0623\u0633\u0628\u0648\u0639\u064A \u0644\u0644\u0645\u0642\u0627\u0644\u0627\u062A \u0627\u0644\u0631\u0627\u0626\u062C\u0629</li>
            <li>\u0623\u062E\u0628\u0627\u0631 \u0639\u0627\u062C\u0644\u0629 \u0641\u064A \u0627\u0644\u0625\u0639\u0644\u0627\u0645 \u0648\u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627</li>
            <li>\u0631\u0624\u0649 \u062D\u0635\u0631\u064A\u0629 \u0645\u0646 \u062E\u0628\u0631\u0627\u0621 \u0627\u0644\u0635\u0646\u0627\u0639\u0629</li>
          </ul>
          <p>\u0645\u0639 \u0623\u0637\u064A\u0628 \u0627\u0644\u062A\u062D\u064A\u0627\u062A\u060C<br>\u0641\u0631\u064A\u0642 \u0627\u0644\u0645\u0633\u062A\u0643\u0634\u0641</p>
        `,
        type: "welcome",
        variables: ["name"]
      },
      {
        id: "weekly-digest",
        name: "Weekly Newsletter",
        subject: "Weekly Digest - {{weekOf}}",
        subjectAr: "\u0627\u0644\u0645\u0644\u062E\u0635 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A - {{weekOf}}",
        bodyEn: `
          <h1>Your Weekly Media Intelligence Digest</h1>
          <p>Here are this week's most important stories and insights:</p>
          
          <h2>Trending Articles</h2>
          {{trendingArticles}}
          
          <h2>New Publications</h2>
          {{newArticles}}
          
          <h2>Category Highlights</h2>
          {{categoryHighlights}}
          
          <p>Stay informed,<br>The ALMSTKSHF Team</p>
        `,
        bodyAr: `
          <h1>\u0645\u0644\u062E\u0635\u0643 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A \u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0625\u0639\u0644\u0627\u0645</h1>
          <p>\u0625\u0644\u064A\u0643 \u0623\u0647\u0645 \u0627\u0644\u0642\u0635\u0635 \u0648\u0627\u0644\u0631\u0624\u0649 \u0644\u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639:</p>
          
          <h2>\u0627\u0644\u0645\u0642\u0627\u0644\u0627\u062A \u0627\u0644\u0631\u0627\u0626\u062C\u0629</h2>
          {{trendingArticles}}
          
          <h2>\u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0627\u062A \u0627\u0644\u062C\u062F\u064A\u062F\u0629</h2>
          {{newArticles}}
          
          <h2>\u0623\u0628\u0631\u0632 \u0627\u0644\u0641\u0626\u0627\u062A</h2>
          {{categoryHighlights}}
          
          <p>\u0627\u0628\u0642 \u0639\u0644\u0649 \u0627\u0637\u0644\u0627\u0639\u060C<br>\u0641\u0631\u064A\u0642 \u0627\u0644\u0645\u0633\u062A\u0643\u0634\u0641</p>
        `,
        type: "newsletter",
        variables: ["weekOf", "trendingArticles", "newArticles", "categoryHighlights"]
      }
    ];
    templates.forEach((template) => {
      this.templates.set(template.id, template);
    });
  }
  async sendWelcomeEmail(email, name, language = "en") {
    const jobId = this.generateId();
    const emailJob = {
      id: jobId,
      templateId: "welcome",
      recipients: [email],
      scheduledFor: /* @__PURE__ */ new Date(),
      status: "pending",
      variables: { name },
      language
    };
    this.emailQueue.push(emailJob);
    return jobId;
  }
  async scheduleWeeklyDigest() {
    const subscribers = await storage.getNewsletterSubscribers();
    const articles2 = await storage.getArticles({ limit: 10, published: true });
    const oneWeekAgo = /* @__PURE__ */ new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const trendingArticles = articles2.filter((article) => new Date(article.createdAt) > oneWeekAgo).slice(0, 5);
    const newArticles = articles2.filter((article) => new Date(article.createdAt) > oneWeekAgo).slice(0, 3);
    const contentEn = this.generateDigestContent(trendingArticles, newArticles, "en");
    const contentAr = this.generateDigestContent(trendingArticles, newArticles, "ar");
    const subscribersByLang = {
      en: subscribers.filter((s) => !s.email.includes(".ar") && !s.email.includes("arabic")),
      ar: subscribers.filter((s) => s.email.includes(".ar") || s.email.includes("arabic"))
    };
    for (const [lang, subs] of Object.entries(subscribersByLang)) {
      if (subs.length === 0) continue;
      const jobId = this.generateId();
      const emailJob = {
        id: jobId,
        templateId: "weekly-digest",
        recipients: subs.map((s) => s.email),
        scheduledFor: /* @__PURE__ */ new Date(),
        status: "pending",
        variables: {
          weekOf: this.formatWeekOf(/* @__PURE__ */ new Date()),
          trendingArticles: lang === "ar" ? contentAr.trending : contentEn.trending,
          newArticles: lang === "ar" ? contentAr.new : contentEn.new,
          categoryHighlights: lang === "ar" ? contentAr.highlights : contentEn.highlights
        },
        language: lang
      };
      this.emailQueue.push(emailJob);
    }
  }
  generateDigestContent(trending, newArticles, language) {
    const content = {
      trending: "",
      new: "",
      highlights: ""
    };
    content.trending = trending.map((article) => {
      const title = language === "ar" && article.titleAr ? article.titleAr : article.titleEn;
      const excerpt = language === "ar" && article.excerptAr ? article.excerptAr : article.excerptEn;
      return `
        <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
          <h3><a href="${process.env.BASE_URL}/${language}/blog/${article.category?.slug}/${article.slug}">${title}</a></h3>
          <p>${excerpt}</p>
          <small style="color: #666;">${language === "ar" ? "\u0628\u0648\u0627\u0633\u0637\u0629" : "By"} ${article.authorName}</small>
        </div>
      `;
    }).join("");
    content.new = newArticles.map((article) => {
      const title = language === "ar" && article.titleAr ? article.titleAr : article.titleEn;
      return `
        <div style="margin-bottom: 10px;">
          <a href="${process.env.BASE_URL}/${language}/blog/${article.category?.slug}/${article.slug}">${title}</a>
        </div>
      `;
    }).join("");
    const categories2 = Array.from(new Set(newArticles.map((a) => a.category?.nameEn || a.category?.nameAr).filter(Boolean)));
    content.highlights = categories2.map((cat) => `<li>${cat}</li>`).join("");
    return content;
  }
  async startEmailProcessor() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    setInterval(async () => {
      await this.processEmailQueue();
    }, 3e4);
  }
  async processEmailQueue() {
    const pendingJobs = this.emailQueue.filter((job) => job.status === "pending");
    for (const job of pendingJobs) {
      try {
        await this.sendEmail(job);
        job.status = "sent";
      } catch (error) {
        console.error(`Failed to send email job ${job.id}:`, error);
        job.status = "failed";
      }
    }
  }
  async sendEmail(job) {
    const template = this.templates.get(job.templateId);
    if (!template) {
      throw new Error(`Template ${job.templateId} not found`);
    }
    const subject = job.language === "ar" && template.subjectAr ? template.subjectAr : template.subject;
    const body = job.language === "ar" && template.bodyAr ? template.bodyAr : template.bodyEn;
    let processedSubject = subject;
    let processedBody = body;
    Object.entries(job.variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedSubject = processedSubject.replace(new RegExp(placeholder, "g"), value);
      processedBody = processedBody.replace(new RegExp(placeholder, "g"), value);
    });
    try {
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error("SendGrid API key not configured");
      }
      const msg = {
        to: job.recipients,
        from: {
          email: "rased@almstkshf.com",
          name: "Almstkshf Media Monitoring"
        },
        subject: processedSubject,
        html: processedBody
      };
      await this.mailService.send(msg);
      console.log(`Email sent successfully to ${job.recipients.length} recipients`);
    } catch (error) {
      console.error("SendGrid email error:", error);
      throw error;
    }
  }
  async scheduleArticleNotification(articleId) {
    const article = await storage.getArticles({ limit: 1 });
    if (!article.length) return;
    const subscribers = await storage.getNewsletterSubscribers();
    if (article[0].featured) {
      const jobId = this.generateId();
      const emailJob = {
        id: jobId,
        templateId: "notification",
        recipients: subscribers.map((s) => s.email),
        scheduledFor: /* @__PURE__ */ new Date(),
        status: "pending",
        variables: {
          articleTitle: article[0].titleEn || "",
          articleUrl: `${process.env.BASE_URL}/en/blog/${article[0].slug}`
        },
        language: "en"
      };
      this.emailQueue.push(emailJob);
    }
  }
  formatWeekOf(date) {
    const options = {
      month: "long",
      day: "numeric",
      year: "numeric"
    };
    return date.toLocaleDateString("en-US", options);
  }
  generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  // Management methods
  getEmailQueue() {
    return this.emailQueue;
  }
  getTemplates() {
    return Array.from(this.templates.values());
  }
  updateTemplate(id, updates) {
    const template = this.templates.get(id);
    if (template) {
      Object.assign(template, updates);
      return true;
    }
    return false;
  }
  async sendTestEmail(recipientEmail, language = "en") {
    const testEmailJob = {
      id: this.generateId(),
      templateId: "test",
      recipients: [recipientEmail],
      scheduledFor: /* @__PURE__ */ new Date(),
      status: "pending",
      variables: {
        name: "Admin",
        testDate: (/* @__PURE__ */ new Date()).toLocaleString(),
        systemStatus: "All systems operational"
      },
      language
    };
    if (!this.templates.has("test")) {
      this.templates.set("test", {
        id: "test",
        name: "Test Email",
        subject: "Test Email from Almstkshf Media Monitoring",
        subjectAr: "\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u062A\u062C\u0631\u064A\u0628\u064A \u0645\u0646 \u0627\u0644\u0645\u0633\u062A\u0643\u0634\u0641 \u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0645",
        bodyEn: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1e40af;">Test Email Successful!</h1>
            <p>Hello {{name}},</p>
            <p>This is a test email from your Almstkshf Media Monitoring system to verify that email functionality is working correctly.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>System Status</h3>
              <p><strong>Status:</strong> {{systemStatus}}</p>
              <p><strong>Test Date:</strong> {{testDate}}</p>
              <p><strong>Email Service:</strong> SendGrid Integration Active</p>
            </div>
            <p>If you received this email, your automation system is ready to send newsletters, notifications, and reports.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              Almstkshf Media Monitoring Team<br>
              <a href="mailto:rased@almstkshf.com">rased@almstkshf.com</a>
            </p>
          </div>
        `,
        bodyAr: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <h1 style="color: #1e40af;">\u0646\u062C\u062D \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A!</h1>
            <p>\u0645\u0631\u062D\u0628\u0627\u064B {{name}}\u060C</p>
            <p>\u0647\u0630\u0627 \u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u062A\u062C\u0631\u064A\u0628\u064A \u0645\u0646 \u0646\u0638\u0627\u0645 \u0627\u0644\u0645\u0633\u062A\u0643\u0634\u0641 \u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0645 \u0644\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0623\u0646 \u0648\u0638\u064A\u0641\u0629 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u062A\u0639\u0645\u0644 \u0628\u0634\u0643\u0644 \u0635\u062D\u064A\u062D.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>\u062D\u0627\u0644\u0629 \u0627\u0644\u0646\u0638\u0627\u0645</h3>
              <p><strong>\u0627\u0644\u062D\u0627\u0644\u0629:</strong> {{systemStatus}}</p>
              <p><strong>\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631:</strong> {{testDate}}</p>
              <p><strong>\u062E\u062F\u0645\u0629 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A:</strong> \u062A\u0643\u0627\u0645\u0644 SendGrid \u0646\u0634\u0637</p>
            </div>
            <p>\u0625\u0630\u0627 \u062A\u0644\u0642\u064A\u062A \u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u060C \u0641\u0625\u0646 \u0646\u0638\u0627\u0645 \u0627\u0644\u0623\u062A\u0645\u062A\u0629 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u062C\u0627\u0647\u0632 \u0644\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0646\u0634\u0631\u0627\u062A \u0627\u0644\u0625\u062E\u0628\u0627\u0631\u064A\u0629 \u0648\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              \u0645\u0639 \u0623\u0637\u064A\u0628 \u0627\u0644\u062A\u062D\u064A\u0627\u062A\u060C<br>
              \u0641\u0631\u064A\u0642 \u0627\u0644\u0645\u0633\u062A\u0643\u0634\u0641 \u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0645<br>
              <a href="mailto:rased@almstkshf.com">rased@almstkshf.com</a>
            </p>
          </div>
        `,
        type: "notification",
        variables: ["name", "testDate", "systemStatus"]
      });
    }
    await this.sendEmail(testEmailJob);
  }
  async generateWeeklyReport() {
    const articles2 = await storage.getArticles({ limit: 50 });
    const subscribers = await storage.getNewsletterSubscribers();
    const categories2 = await storage.getCategories();
    const thisWeek = /* @__PURE__ */ new Date();
    const weekStart = new Date(thisWeek);
    weekStart.setDate(thisWeek.getDate() - 7);
    const weeklyArticles = articles2.filter(
      (article) => article.createdAt && new Date(article.createdAt) >= weekStart
    );
    const publishedThisWeek = weeklyArticles.filter((a) => a.published);
    const categoriesWithCounts = categories2.map((cat) => ({
      ...cat,
      articleCount: weeklyArticles.filter((a) => a.categoryId === cat.id).length
    }));
    const report = {
      weekOf: this.formatWeekOf(weekStart),
      totalArticles: weeklyArticles.length,
      publishedArticles: publishedThisWeek.length,
      draftArticles: weeklyArticles.length - publishedThisWeek.length,
      totalSubscribers: subscribers.length,
      activeSubscribers: subscribers.filter((s) => s.active).length,
      categoriesData: categoriesWithCounts,
      topPerformingArticles: publishedThisWeek.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0, 5).map((article) => ({
        title: article.titleEn,
        titleAr: article.titleAr,
        category: article.category?.nameEn || "Uncategorized",
        published: article.createdAt,
        featured: article.featured
      }))
    };
    return JSON.stringify(report, null, 2);
  }
  async sendWeeklyReport(adminEmail) {
    const reportData = await this.generateWeeklyReport();
    const parsedReport = JSON.parse(reportData);
    const reportEmailJob = {
      id: this.generateId(),
      templateId: "weekly-report",
      recipients: [adminEmail],
      scheduledFor: /* @__PURE__ */ new Date(),
      status: "pending",
      variables: {
        weekOf: parsedReport.weekOf,
        totalArticles: parsedReport.totalArticles.toString(),
        publishedArticles: parsedReport.publishedArticles.toString(),
        draftArticles: parsedReport.draftArticles.toString(),
        totalSubscribers: parsedReport.totalSubscribers.toString(),
        activeSubscribers: parsedReport.activeSubscribers.toString(),
        topArticles: parsedReport.topPerformingArticles.map(
          (article) => `<li><strong>${article.title}</strong> (${article.category})</li>`
        ).join("")
      },
      language: "en"
    };
    if (!this.templates.has("weekly-report")) {
      this.templates.set("weekly-report", {
        id: "weekly-report",
        name: "Weekly Report",
        subject: "Weekly Report - Almstkshf Media Monitoring ({{weekOf}})",
        bodyEn: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1e40af;">Weekly Report - {{weekOf}}</h1>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #374151;">Content Summary</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <p><strong>Total Articles:</strong> {{totalArticles}}</p>
                  <p><strong>Published:</strong> {{publishedArticles}}</p>
                  <p><strong>Drafts:</strong> {{draftArticles}}</p>
                </div>
                <div>
                  <p><strong>Total Subscribers:</strong> {{totalSubscribers}}</p>
                  <p><strong>Active Subscribers:</strong> {{activeSubscribers}}</p>
                </div>
              </div>
            </div>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Top Performing Articles</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                {{topArticles}}
              </ul>
            </div>

            <p style="color: #6b7280;">
              This automated report is generated weekly to track your blog's performance and engagement metrics.
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Almstkshf Media Monitoring<br>
              <a href="mailto:rased@almstkshf.com">rased@almstkshf.com</a>
            </p>
          </div>
        `,
        type: "digest",
        variables: ["weekOf", "totalArticles", "publishedArticles", "draftArticles", "totalSubscribers", "activeSubscribers", "topArticles"]
      });
    }
    await this.sendEmail(reportEmailJob);
  }
};
var emailAutomation = new EmailAutomation();

// server/automation/automationRoutes.ts
var automationRouter = Router();
automationRouter.post("/schedule", async (req, res) => {
  res.status(503).json({
    success: false,
    error: "AI content scheduling disabled - use manual publishing"
  });
});
automationRouter.get("/scheduled", (req, res) => {
  const scheduledPosts = contentScheduler.getScheduledPosts();
  res.json(scheduledPosts);
});
automationRouter.put("/scheduled/:id", (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const success = contentScheduler.updateScheduledPost(id, updates);
  res.json({ success });
});
automationRouter.delete("/scheduled/:id", (req, res) => {
  const { id } = req.params;
  const success = contentScheduler.cancelScheduledPost(id);
  res.json({ success });
});
automationRouter.post("/analytics/track", (req, res) => {
  try {
    const behavior = {
      ...req.body,
      timestamp: /* @__PURE__ */ new Date()
    };
    analyticsTracker.trackBehavior(behavior);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to track behavior" });
  }
});
automationRouter.get("/analytics/performance/:articleId?", (req, res) => {
  const { articleId } = req.params;
  const performance = analyticsTracker.getContentPerformance(
    articleId ? parseInt(articleId) : void 0
  );
  res.json(performance);
});
automationRouter.get("/analytics/trending", (req, res) => {
  const { limit = 10 } = req.query;
  const trending = analyticsTracker.getTrendingContent(Number(limit));
  res.json(trending);
});
automationRouter.get("/analytics/recommendations/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { currentArticleId } = req.query;
    const recommendations = await analyticsTracker.generatePersonalizedRecommendations(
      sessionId,
      currentArticleId ? parseInt(currentArticleId) : void 0
    );
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});
automationRouter.get("/analytics/insights/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const insights = analyticsTracker.getUserInsights(sessionId);
  res.json(insights);
});
automationRouter.post("/email/welcome", async (req, res) => {
  try {
    const { email, name, language = "en" } = req.body;
    const jobId = await emailAutomation.sendWelcomeEmail(email, name, language);
    res.json({ success: true, jobId });
  } catch (error) {
    res.status(500).json({ error: "Failed to send welcome email" });
  }
});
automationRouter.post("/email/weekly-digest", async (req, res) => {
  try {
    await emailAutomation.scheduleWeeklyDigest();
    res.json({ success: true, message: "Weekly digest scheduled" });
  } catch (error) {
    res.status(500).json({ error: "Failed to schedule weekly digest" });
  }
});
automationRouter.post("/email/article-notification/:articleId", async (req, res) => {
  try {
    const { articleId } = req.params;
    await emailAutomation.scheduleArticleNotification(parseInt(articleId));
    res.json({ success: true, message: "Article notification scheduled" });
  } catch (error) {
    res.status(500).json({ error: "Failed to schedule article notification" });
  }
});
automationRouter.get("/email/queue", (req, res) => {
  const queue = emailAutomation.getEmailQueue();
  res.json(queue);
});
automationRouter.get("/email/templates", (req, res) => {
  const templates = emailAutomation.getTemplates();
  res.json(templates);
});
automationRouter.put("/email/templates/:id", (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const success = emailAutomation.updateTemplate(id, updates);
  res.json({ success });
});
automationRouter.put("/settings/seo", (req, res) => {
  const { enabled } = req.body;
  res.json({ success: true, enabled });
});
automationRouter.put("/settings/publishing", (req, res) => {
  const { enabled } = req.body;
  res.json({ success: true, enabled });
});
automationRouter.put("/settings/welcome-emails", (req, res) => {
  const { enabled } = req.body;
  res.json({ success: true, enabled });
});
automationRouter.put("/settings/weekly-digest", (req, res) => {
  const { enabled } = req.body;
  res.json({ success: true, enabled });
});
automationRouter.put("/settings/behavior-tracking", (req, res) => {
  const { enabled } = req.body;
  res.json({ success: true, enabled });
});
automationRouter.put("/settings/recommendations", (req, res) => {
  const { enabled } = req.body;
  res.json({ success: true, enabled });
});
automationRouter.post("/news/generate", async (req, res) => {
  res.status(503).json({
    success: false,
    message: "AI automation disabled - manual content management only",
    error: "Service unavailable"
  });
});
automationRouter.get("/status", async (req, res) => {
  try {
    const articles2 = await storage.getArticles({ limit: 1e3 });
    const status = {
      newsAggregator: "disabled",
      emailSystem: "disabled",
      contentScheduler: "disabled",
      lastRun: "N/A - AI automation disabled",
      nextRun: "N/A - manual content management only",
      articlesGenerated: articles2.length
    };
    res.json(status);
  } catch (error) {
    console.error("Error fetching automation status:", error);
    res.status(500).json({ error: "Failed to fetch automation status" });
  }
});
automationRouter.get("/settings", async (req, res) => {
  try {
    const settings = {
      weeklyArticles: await storage.getAutomationSetting("weeklyArticles"),
      emailDigests: await storage.getAutomationSetting("emailDigests"),
      contentOptimization: await storage.getAutomationSetting("contentOptimization"),
      socialSharing: await storage.getAutomationSetting("socialSharing"),
      analyticsReports: await storage.getAutomationSetting("analyticsReports")
    };
    res.json(settings);
  } catch (error) {
    console.error("Error fetching automation settings:", error);
    res.status(500).json({ error: "Failed to fetch automation settings" });
  }
});
automationRouter.post("/settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    await storage.setAutomationSetting(key, value);
    res.json({ success: true, key, value });
  } catch (error) {
    console.error("Error updating automation setting:", error);
    res.status(500).json({ error: "Failed to update automation setting" });
  }
});

// server/health.ts
init_db();
import { sql as sql3 } from "drizzle-orm";
var HealthMonitor = class {
  metrics = [];
  maxMetrics = 100;
  async getHealthStatus() {
    const startTime = Date.now();
    try {
      const dbTest = await db.execute(sql3`SELECT 1 as test`);
      const dbResponseTime = Date.now() - startTime;
      const connectionResult = await db.execute(
        sql3`SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'`
      );
      const articleStats = await db.execute(
        sql3`SELECT 
          COUNT(*) as total_articles,
          COUNT(CASE WHEN published = true THEN 1 END) as published_articles
        FROM articles`
      );
      const categoryStats = await db.execute(
        sql3`SELECT COUNT(*) as categories_count FROM categories`
      );
      const metrics = {
        status: dbResponseTime < 100 ? "healthy" : dbResponseTime < 500 ? "degraded" : "unhealthy",
        database: {
          connected: !!dbTest.rows[0],
          responseTime: dbResponseTime,
          connectionCount: Number(connectionResult.rows[0]?.count) || 0
        },
        performance: {
          avgResponseTime: this.calculateAverageResponseTime(),
          slowQueries: this.countSlowQueries()
        },
        content: {
          totalArticles: Number(articleStats.rows[0]?.total_articles) || 0,
          publishedArticles: Number(articleStats.rows[0]?.published_articles) || 0,
          categoriesCount: Number(categoryStats.rows[0]?.categories_count) || 0
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.addMetric(metrics);
      return metrics;
    } catch (error) {
      console.error("Health check failed:", error);
      return {
        status: "unhealthy",
        database: {
          connected: false,
          responseTime: Date.now() - startTime,
          connectionCount: 0
        },
        performance: {
          avgResponseTime: 0,
          slowQueries: 0
        },
        content: {
          totalArticles: 0,
          publishedArticles: 0,
          categoriesCount: 0
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  addMetric(metric) {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }
  calculateAverageResponseTime() {
    if (this.metrics.length === 0) return 0;
    const sum = this.metrics.reduce((acc, m) => acc + m.database.responseTime, 0);
    return Math.round(sum / this.metrics.length);
  }
  countSlowQueries() {
    return this.metrics.filter((m) => m.database.responseTime > 500).length;
  }
  getMetricsHistory() {
    return [...this.metrics];
  }
};
var healthMonitor = new HealthMonitor();

// server/email.ts
import nodemailer from "nodemailer";
var EmailService = class {
  transporter = null;
  constructor() {
    this.initializeTransporter();
  }
  initializeTransporter() {
    const config = {
      host: "smtp.zoho.com",
      port: 587,
      secure: false,
      // true for 465, false for other ports
      auth: {
        user: process.env.ZOHO_EMAIL_USER || "rased@almstkshf.com",
        pass: process.env.ZOHO_EMAIL_PASS || "almstkshf@2025"
      }
    };
    if (!config.auth.user || !config.auth.pass) {
      console.warn("Email credentials not configured. Email functionality disabled.");
      return;
    }
    this.transporter = nodemailer.createTransport(config);
  }
  async sendContactFormEmail(contactData) {
    if (!this.transporter) {
      throw new Error("Email service not configured");
    }
    const isArabic = contactData.language === "ar";
    const subject = isArabic ? `\u0631\u0633\u0627\u0644\u0629 \u062C\u062F\u064A\u062F\u0629 \u0645\u0646 \u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0633\u062A\u0643\u0634\u0641 - ${contactData.type}` : `New Contact Form Submission - ${contactData.type}`;
    const htmlContent = isArabic ? this.getArabicEmailTemplate(contactData) : this.getEnglishEmailTemplate(contactData);
    const mailOptions = {
      from: process.env.ZOHO_EMAIL_USER,
      to: process.env.CONTACT_EMAIL || process.env.ZOHO_EMAIL_USER,
      subject,
      html: htmlContent,
      replyTo: contactData.email
    };
    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
  getEnglishEmailTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #1e40af; }
          .value { margin-top: 5px; }
          .message-box { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #1e40af; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
            <p>Al-Mstkshf Media Monitoring Platform</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${data.name}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${data.email}</div>
            </div>
            ${data.company ? `
            <div class="field">
              <div class="label">Company/Organization:</div>
              <div class="value">${data.company}</div>
            </div>
            ` : ""}
            <div class="field">
              <div class="label">Inquiry Type:</div>
              <div class="value">${data.type}</div>
            </div>
            <div class="field">
              <div class="label">Message:</div>
              <div class="message-box">${data.message.replace(/\n/g, "<br>")}</div>
            </div>
            <div class="field">
              <div class="label">Submission Time:</div>
              <div class="value">${(/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Dubai" })} (Dubai Time)</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  getArabicEmailTemplate(data) {
    return `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #1e40af; }
          .value { margin-top: 5px; }
          .message-box { background: white; padding: 15px; border-radius: 4px; border-right: 4px solid #1e40af; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>\u0631\u0633\u0627\u0644\u0629 \u062C\u062F\u064A\u062F\u0629 \u0645\u0646 \u0646\u0645\u0648\u0630\u062C \u0627\u0644\u062A\u0648\u0627\u0635\u0644</h1>
            <p>\u0645\u0646\u0635\u0629 \u0627\u0644\u0645\u0633\u062A\u0643\u0634\u0641 \u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0645</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">\u0627\u0644\u0627\u0633\u0645:</div>
              <div class="value">${data.name}</div>
            </div>
            <div class="field">
              <div class="label">\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A:</div>
              <div class="value">${data.email}</div>
            </div>
            ${data.company ? `
            <div class="field">
              <div class="label">\u0627\u0644\u0634\u0631\u0643\u0629/\u0627\u0644\u0645\u0624\u0633\u0633\u0629:</div>
              <div class="value">${data.company}</div>
            </div>
            ` : ""}
            <div class="field">
              <div class="label">\u0646\u0648\u0639 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631:</div>
              <div class="value">${data.type}</div>
            </div>
            <div class="field">
              <div class="label">\u0627\u0644\u0631\u0633\u0627\u0644\u0629:</div>
              <div class="message-box">${data.message.replace(/\n/g, "<br>")}</div>
            </div>
            <div class="field">
              <div class="label">\u0648\u0642\u062A \u0627\u0644\u0625\u0631\u0633\u0627\u0644:</div>
              <div class="value">${(/* @__PURE__ */ new Date()).toLocaleString("ar-AE", { timeZone: "Asia/Dubai" })} (\u062A\u0648\u0642\u064A\u062A \u062F\u0628\u064A)</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  async testConnection() {
    if (!this.transporter) {
      return false;
    }
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("Email connection test failed:", error);
      return false;
    }
  }
};
var emailService = new EmailService();

// server/n8n-automation.ts
var N8NAutomationService = class {
  validApiKeys = /* @__PURE__ */ new Set();
  constructor() {
    const defaultKey = process.env.N8N_WEBHOOK_API_KEY;
    if (defaultKey) {
      this.validApiKeys.add(defaultKey);
    }
  }
  async addApiKey(apiKey) {
    this.validApiKeys.add(apiKey);
    try {
      await storage.createApiKey({
        serviceName: "n8n_webhook",
        apiKey,
        description: "N8N Automation Webhook",
        isActive: true
      });
    } catch (error) {
      console.error("Failed to store N8N API key:", error);
    }
  }
  async validateApiKey(apiKey) {
    if (this.validApiKeys.has(apiKey)) {
      return true;
    }
    try {
      const storedKey = await storage.getApiKey("n8n_webhook");
      if (storedKey && storedKey.apiKey === apiKey && storedKey.isActive) {
        this.validApiKeys.add(apiKey);
        return true;
      }
    } catch (error) {
      console.error("Failed to validate API key:", error);
    }
    return false;
  }
  async createArticleFromWebhook(payload) {
    const slug = payload.slug || this.generateSlug(payload.titleEn || payload.titleAr || "");
    const canonicalUrl = payload.canonicalUrl || `${process.env.SITE_URL || "https://almstkshf.com"}/en/blog/${slug}`;
    const articleData = {
      titleEn: payload.titleEn,
      titleAr: payload.titleAr || null,
      contentEn: payload.contentEn,
      contentAr: payload.contentAr || null,
      excerptEn: payload.excerptEn || null,
      excerptAr: payload.excerptAr || null,
      categoryId: payload.categoryId,
      authorName: payload.authorName,
      featuredImage: payload.featuredImage || null,
      published: payload.published || false,
      featured: payload.featured || false,
      slug,
      metaTitle: payload.metaTitle || payload.titleEn,
      metaDescription: payload.metaDescription || payload.excerptEn,
      keywords: payload.keywords || null,
      canonicalUrl
    };
    return await storage.createArticle(articleData);
  }
  async updateArticleFromWebhook(articleId, payload) {
    const updateData = {};
    if (payload.titleEn !== void 0) updateData.titleEn = payload.titleEn;
    if (payload.titleAr !== void 0) updateData.titleAr = payload.titleAr;
    if (payload.contentEn !== void 0) updateData.contentEn = payload.contentEn;
    if (payload.contentAr !== void 0) updateData.contentAr = payload.contentAr;
    if (payload.excerptEn !== void 0) updateData.excerptEn = payload.excerptEn;
    if (payload.excerptAr !== void 0) updateData.excerptAr = payload.excerptAr;
    if (payload.categoryId !== void 0) updateData.categoryId = payload.categoryId;
    if (payload.authorName !== void 0) updateData.authorName = payload.authorName;
    if (payload.featuredImage !== void 0) updateData.featuredImage = payload.featuredImage;
    if (payload.published !== void 0) updateData.published = payload.published;
    if (payload.featured !== void 0) updateData.featured = payload.featured;
    if (payload.slug !== void 0) updateData.slug = payload.slug;
    if (payload.metaTitle !== void 0) updateData.metaTitle = payload.metaTitle;
    if (payload.metaDescription !== void 0) updateData.metaDescription = payload.metaDescription;
    if (payload.keywords !== void 0) updateData.keywords = payload.keywords;
    if (payload.canonicalUrl !== void 0) updateData.canonicalUrl = payload.canonicalUrl;
    return await storage.updateArticle(articleId, updateData);
  }
  generateSlug(title) {
    return title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
  }
  async getAutomationSettings() {
    const settings = {
      autoPublish: await storage.getAutomationSetting("auto_publish"),
      autoSEO: await storage.getAutomationSetting("auto_seo"),
      autoSlug: await storage.getAutomationSetting("auto_slug"),
      autoTranslation: await storage.getAutomationSetting("auto_translation"),
      socialSharing: await storage.getAutomationSetting("social_sharing"),
      contentValidation: await storage.getAutomationSetting("content_validation")
    };
    return settings;
  }
  async updateAutomationSettings(settings) {
    for (const [key, value] of Object.entries(settings)) {
      await storage.setAutomationSetting(key, value);
    }
  }
};
var n8nService = new N8NAutomationService();
function registerN8NRoutes(app2) {
  const validateN8NAuth = async (req, res, next) => {
    const apiKey = req.headers["x-api-key"] || req.body.apiKey;
    if (!apiKey) {
      return res.status(401).json({
        error: "API key required",
        message: "Please provide an API key in the x-api-key header or request body"
      });
    }
    const isValid = await n8nService.validateApiKey(apiKey);
    if (!isValid) {
      return res.status(403).json({
        error: "Invalid API key",
        message: "The provided API key is not valid or has been revoked"
      });
    }
    next();
  };
  app2.post("/api/n8n/articles", validateN8NAuth, async (req, res) => {
    try {
      const payload = req.body;
      if (!payload.titleEn && !payload.titleAr) {
        return res.status(400).json({
          error: "Validation error",
          message: "Article must have at least one title (English or Arabic)"
        });
      }
      if (!payload.contentEn && !payload.contentAr) {
        return res.status(400).json({
          error: "Validation error",
          message: "Article must have content in at least one language"
        });
      }
      if (!payload.categoryId) {
        return res.status(400).json({
          error: "Validation error",
          message: "Category ID is required"
        });
      }
      const article = await n8nService.createArticleFromWebhook(payload);
      await storage.updateApiKeyLastUsed("n8n_webhook");
      res.status(201).json({
        success: true,
        article,
        message: "Article created successfully via N8N automation"
      });
    } catch (error) {
      console.error("N8N article creation error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to create article via N8N webhook"
      });
    }
  });
  app2.put("/api/n8n/articles/:id", validateN8NAuth, async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      const payload = req.body;
      if (isNaN(articleId)) {
        return res.status(400).json({
          error: "Invalid article ID",
          message: "Article ID must be a valid number"
        });
      }
      const article = await n8nService.updateArticleFromWebhook(articleId, payload);
      await storage.updateApiKeyLastUsed("n8n_webhook");
      res.json({
        success: true,
        article,
        message: "Article updated successfully via N8N automation"
      });
    } catch (error) {
      console.error("N8N article update error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to update article via N8N webhook"
      });
    }
  });
  app2.get("/api/n8n/settings", validateN8NAuth, async (req, res) => {
    try {
      const settings = await n8nService.getAutomationSettings();
      res.json({
        success: true,
        settings
      });
    } catch (error) {
      console.error("N8N settings fetch error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to fetch automation settings"
      });
    }
  });
  app2.post("/api/n8n/settings", validateN8NAuth, async (req, res) => {
    try {
      const settings = req.body.settings;
      await n8nService.updateAutomationSettings(settings);
      res.json({
        success: true,
        message: "Automation settings updated successfully"
      });
    } catch (error) {
      console.error("N8N settings update error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to update automation settings"
      });
    }
  });
  app2.post("/api/n8n/api-keys", async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey) {
        return res.status(400).json({
          error: "API key required",
          message: "Please provide an API key"
        });
      }
      await n8nService.addApiKey(apiKey);
      res.json({
        success: true,
        message: "API key added successfully"
      });
    } catch (error) {
      console.error("N8N API key creation error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to add API key"
      });
    }
  });
  app2.get("/api/n8n/health", (req, res) => {
    res.json({
      success: true,
      service: "N8N Automation Service",
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      endpoints: {
        createArticle: "/api/n8n/articles",
        updateArticle: "/api/n8n/articles/:id",
        getSettings: "/api/n8n/settings",
        updateSettings: "/api/n8n/settings",
        addApiKey: "/api/n8n/api-keys"
      }
    });
  });
}

// server/routes-serverless.ts
import multer from "multer";

// server/cloud-storage.ts
import { getStore } from "@netlify/blobs";
import crypto from "crypto";
import path from "path";
var CloudStorageService = class {
  store;
  constructor() {
    this.store = getStore("uploads");
  }
  /**
   * Upload a file to Netlify Blobs
   */
  async uploadFile(buffer, originalName, mimetype) {
    try {
      const ext = path.extname(originalName);
      const name = path.basename(originalName, ext);
      const timestamp2 = Date.now();
      const hash = crypto.randomBytes(8).toString("hex");
      const filename = `${name}-${timestamp2}-${hash}${ext}`;
      let folder = "files";
      if (mimetype.startsWith("image/")) {
        folder = "images";
      } else if (mimetype === "application/pdf") {
        folder = "pdfs";
      } else if (mimetype.includes("document") || mimetype.includes("text")) {
        folder = "documents";
      }
      const key = `${folder}/${filename}`;
      await this.store.set(key, buffer, {
        metadata: {
          originalName,
          mimetype,
          size: buffer.length.toString(),
          uploadedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      const url = await this.store.getURL(key);
      return {
        filename,
        originalName,
        size: buffer.length,
        mimetype,
        url: url || `/api/files/${key}`,
        key
      };
    } catch (error) {
      console.error("Error uploading file to cloud storage:", error);
      throw new Error("Failed to upload file");
    }
  }
  /**
   * Get file from Netlify Blobs
   */
  async getFile(key) {
    try {
      const blob = await this.store.get(key, { type: "arrayBuffer" });
      if (!blob) return null;
      const metadata = await this.store.getMetadata(key);
      return {
        buffer: Buffer.from(blob),
        metadata
      };
    } catch (error) {
      console.error("Error getting file from cloud storage:", error);
      return null;
    }
  }
  /**
   * Delete file from Netlify Blobs
   */
  async deleteFile(key) {
    try {
      await this.store.delete(key);
      return true;
    } catch (error) {
      console.error("Error deleting file from cloud storage:", error);
      return false;
    }
  }
  /**
   * List files in a folder
   */
  async listFiles(folder) {
    try {
      const { blobs } = await this.store.list({
        prefix: folder ? `${folder}/` : void 0
      });
      return blobs.map((blob) => blob.key);
    } catch (error) {
      console.error("Error listing files from cloud storage:", error);
      return [];
    }
  }
  /**
   * Get file URL for serving
   */
  async getFileUrl(key) {
    try {
      return await this.store.getURL(key);
    } catch (error) {
      console.error("Error getting file URL:", error);
      return null;
    }
  }
};
var cloudStorage = new CloudStorageService();

// server/routes-serverless.ts
async function registerServerlessRoutes(app2) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
    // 10MB limit
  });
  app2.get("/api/health", async (req, res) => {
    try {
      const health = await healthMonitor.getHealthStatus();
      res.json(health);
    } catch (error) {
      res.status(500).json({ error: "Health check failed" });
    }
  });
  app2.get("/api/articles", async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const category = req.query.category;
      const featured = req.query.featured === "true";
      const lang = req.query.lang || "en";
      const articles2 = await storage.getArticles({ page, limit, category, featured, lang });
      analyticsTracker.trackEvent("articles_viewed", {
        page,
        limit,
        category,
        featured,
        lang,
        userAgent: req.headers["user-agent"],
        ip: req.ip
      });
      res.json(articles2);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });
  app2.get("/api/articles/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const lang = req.query.lang || "en";
      const article = await storage.getArticleBySlug(slug, lang);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      analyticsTracker.trackEvent("article_viewed", {
        slug,
        lang,
        userAgent: req.headers["user-agent"],
        ip: req.ip
      });
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const lang = req.query.lang || "en";
      const categories2 = await storage.getCategories(lang);
      res.json(categories2);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
  app2.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q;
      const lang = req.query.lang || "en";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const results = await storage.searchArticles(query, { page, limit, lang });
      analyticsTracker.trackEvent("search_performed", {
        query,
        lang,
        page,
        limit,
        resultsCount: results.articles.length,
        userAgent: req.headers["user-agent"],
        ip: req.ip
      });
      res.json(results);
    } catch (error) {
      console.error("Error performing search:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });
  app2.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const validatedData = insertNewsletterSubscriberSchema.parse(req.body);
      const subscriber = await storage.subscribeToNewsletter(validatedData);
      try {
        await emailAutomation.sendWelcomeEmail(validatedData.email, validatedData.preferredLanguage);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
      analyticsTracker.trackEvent("newsletter_subscription", {
        email: validatedData.email,
        language: validatedData.preferredLanguage,
        userAgent: req.headers["user-agent"],
        ip: req.ip
      });
      res.json({ success: true, subscriber });
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid subscription data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to subscribe to newsletter" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.submitContactForm(validatedData);
      try {
        await emailService.sendContactNotification(validatedData);
      } catch (emailError) {
        console.error("Failed to send contact notification:", emailError);
      }
      analyticsTracker.trackEvent("contact_form_submitted", {
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        userAgent: req.headers["user-agent"],
        ip: req.ip
      });
      res.json({ success: true, submission });
    } catch (error) {
      console.error("Contact form error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid form data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });
  app2.get("/api/sitemap.xml", async (req, res) => {
    try {
      const sitemap = await storage.generateSitemap();
      res.set("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).json({ error: "Failed to generate sitemap" });
    }
  });
  app2.get("/api/rss.xml", async (req, res) => {
    try {
      const lang = req.query.lang || "en";
      const rss = await storage.generateRSSFeed(lang);
      res.set("Content-Type", "application/rss+xml");
      res.send(rss);
    } catch (error) {
      console.error("Error generating RSS feed:", error);
      res.status(500).json({ error: "Failed to generate RSS feed" });
    }
  });
  app2.use("/api/automation", automationRouter);
  registerN8NRoutes(app2);
  app2.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await analyticsTracker.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  app2.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const uploadedFile = await cloudStorage.uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      analyticsTracker.trackEvent("file_uploaded", {
        filename: uploadedFile.filename,
        size: uploadedFile.size,
        mimetype: uploadedFile.mimetype,
        userAgent: req.headers["user-agent"],
        ip: req.ip
      });
      res.json({
        success: true,
        file: uploadedFile
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });
  app2.get("/api/files/:folder/:filename", async (req, res) => {
    try {
      const { folder, filename } = req.params;
      const key = `${folder}/${filename}`;
      const fileData = await cloudStorage.getFile(key);
      if (!fileData) {
        return res.status(404).json({ error: "File not found" });
      }
      const mimetype = fileData.metadata?.mimetype || "application/octet-stream";
      const originalName = fileData.metadata?.originalName || filename;
      res.set({
        "Content-Type": mimetype,
        "Content-Disposition": `inline; filename="${originalName}"`,
        "Cache-Control": "public, max-age=31536000"
      });
      analyticsTracker.trackEvent("file_downloaded", {
        key,
        filename: originalName,
        mimetype,
        userAgent: req.headers["user-agent"],
        ip: req.ip
      });
      res.send(fileData.buffer);
    } catch (error) {
      console.error("File download error:", error);
      res.status(500).json({ error: "Failed to download file" });
    }
  });
  app2.delete("/api/files/:folder/:filename", async (req, res) => {
    try {
      const { folder, filename } = req.params;
      const key = `${folder}/${filename}`;
      const deleted = await cloudStorage.deleteFile(key);
      if (!deleted) {
        return res.status(404).json({ error: "File not found or failed to delete" });
      }
      res.json({ success: true, message: "File deleted successfully" });
    } catch (error) {
      console.error("File deletion error:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });
}

// server/errors.ts
import { ZodError } from "zod";
var AppError = class extends Error {
  statusCode;
  code;
  isOperational;
  constructor(message, statusCode, code = "GENERIC_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};
var NotFoundError = class extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
};
function getErrorDetails(error, isDevelopment) {
  const details = {};
  if (error instanceof ZodError) {
    details.validationErrors = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
      code: err.code
    }));
  }
  if (isDevelopment) {
    details.stack = error.stack;
  }
  return Object.keys(details).length > 0 ? details : void 0;
}
function errorHandler(error, req, res, next) {
  const isDevelopment = process.env.NODE_ENV === "development";
  console.error("Error occurred:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  let statusCode = 500;
  let message = "Internal server error";
  let code = "INTERNAL_ERROR";
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    code = "VALIDATION_ERROR";
  } else if (error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    code = "INVALID_TOKEN";
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    code = "TOKEN_EXPIRED";
  } else if (error.message?.includes("duplicate key")) {
    statusCode = 409;
    message = "Resource already exists";
    code = "DUPLICATE_RESOURCE";
  } else if (error.message?.includes("foreign key")) {
    statusCode = 400;
    message = "Invalid reference";
    code = "INVALID_REFERENCE";
  }
  const errorResponse = {
    success: false,
    message,
    code,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    path: req.path,
    details: getErrorDetails(error, isDevelopment)
  };
  if (isDevelopment && !(error instanceof AppError)) {
    errorResponse.stack = error.stack;
  }
  res.status(statusCode).json(errorResponse);
}
function notFoundHandler(req, res) {
  const error = new NotFoundError("Endpoint");
  res.status(404).json({
    success: false,
    message: error.message,
    code: error.code,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    path: req.path
  });
}

// netlify/functions/api.ts
var app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
var routesInitialized = false;
var initializeRoutes = async () => {
  if (!routesInitialized) {
    try {
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      await db2.execute("SELECT 1");
      console.log("Database connection successful");
      await registerServerlessRoutes(app);
      app.use(notFoundHandler);
      app.use(errorHandler);
      routesInitialized = true;
    } catch (error) {
      console.error("Failed to initialize routes:", error);
      await registerServerlessRoutes(app);
      app.use(notFoundHandler);
      app.use(errorHandler);
      routesInitialized = true;
    }
  }
};
var handler = async (event, context) => {
  await initializeRoutes();
  const serverlessHandler = serverless(app);
  return serverlessHandler(event, context);
};
export {
  handler
};
