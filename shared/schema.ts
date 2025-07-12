import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for future auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table (for admin functionality)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  nameEn: varchar("name_en", { length: 200 }).notNull(),
  nameAr: varchar("name_ar", { length: 200 }).notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  iconName: varchar("icon_name", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  // Performance indexes for categories
  index("idx_categories_slug").on(table.slug),
  index("idx_categories_name_en").on(table.nameEn),
  index("idx_categories_name_ar").on(table.nameAr),
]);

// Articles table
export const articles = pgTable("articles", {
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
  readingTime: integer("reading_time"), // in minutes
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  index("idx_articles_title_ar").on(table.titleAr),
]);

// Newsletter subscribers table
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  language: varchar("language", { length: 2 }).notNull().default("en"), // 'en' or 'ar'
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  active: boolean("active").default(true),
}, (table) => [
  // Performance indexes for newsletter subscribers
  index("idx_newsletter_email").on(table.email),
  index("idx_newsletter_active").on(table.active),
  index("idx_newsletter_subscribed_at").on(table.subscribedAt),
  index("idx_newsletter_language").on(table.language),
]);

// Contact form submissions
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  company: varchar("company", { length: 200 }),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'demo', 'contact', 'support'
  language: varchar("language", { length: 2 }).notNull().default("en"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  responded: boolean("responded").default(false),
}, (table) => [
  // Performance indexes for contact submissions
  index("idx_contact_email").on(table.email),
  index("idx_contact_type").on(table.type),
  index("idx_contact_responded").on(table.responded),
  index("idx_contact_submitted_at").on(table.submittedAt),
  index("idx_contact_language").on(table.language),
]);

// Automation settings table for persistent configuration
export const automationSettings = pgTable("automation_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
  settingValue: boolean("setting_value").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API keys management table
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  serviceName: varchar("service_name", { length: 100 }).notNull(), // 'openai', 'anthropic', etc.
  keyName: varchar("key_name", { length: 100 }).notNull(),
  keyValue: text("key_value").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Performance indexes for API keys
  index("idx_api_keys_service_name").on(table.serviceName),
  index("idx_api_keys_is_active").on(table.isActive),
  index("idx_api_keys_last_used").on(table.lastUsed),
]);

// Downloads table for file management
export const downloads = pgTable("downloads", {
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
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Performance indexes for downloads
  index("idx_downloads_category").on(table.category),
  index("idx_downloads_file_type").on(table.fileType),
  index("idx_downloads_featured").on(table.featured),
  index("idx_downloads_uploaded_at").on(table.uploadedAt),
  index("idx_downloads_download_count").on(table.downloadCount),
  // Composite indexes for common query patterns
  index("idx_downloads_category_featured").on(table.category, table.featured),
  index("idx_downloads_file_type_featured").on(table.fileType, table.featured),
  index("idx_downloads_featured_uploaded_at").on(table.featured, table.uploadedAt),
]);

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
}));

// Zod schemas for inserts
export const insertCategorySchema = createInsertSchema(categories)
  .omit({ id: true, createdAt: true });

export const insertArticleSchema = createInsertSchema(articles)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    publishNow: z.boolean().optional(),
  });

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers)
  .omit({ id: true, subscribedAt: true });

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions)
  .omit({ id: true, submittedAt: true, responded: true });

export const insertApiKeySchema = createInsertSchema(apiKeys)
  .omit({ id: true, createdAt: true, updatedAt: true, lastUsed: true });

export const insertDownloadSchema = createInsertSchema(downloads)
  .omit({ id: true, downloadCount: true, createdAt: true, updatedAt: true, uploadedAt: true });

// Inferred TS types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type Download = typeof downloads.$inferSelect;
export type InsertDownload = z.infer<typeof insertDownloadSchema>;

// Legacy type aliases for backward compatibility
export type UserInsert = UpsertUser;
export type UserSelect = User;
export type CategorySelect = Category;
export type CategoryInsert = InsertCategory;
export type ArticleSelect = Article;
export type ArticleInsert = InsertArticle;
export type NewsletterSubscriberSelect = NewsletterSubscriber;
export type NewsletterSubscriberInsert = InsertNewsletterSubscriber;
export type ContactSubmissionSelect = ContactSubmission;
export type ContactSubmissionInsert = InsertContactSubmission;
export type ApiKeySelect = ApiKey;
export type ApiKeyInsert = InsertApiKey;
export type DownloadSelect = Download;
export type DownloadInsert = InsertDownload;

// Extended types with relations and computed fields
export type ArticleWithCategory = Article & {
  category?: Category;
  // Computed fields for language-specific content
  title?: string;
  excerpt?: string;
  content?: string;
  metaDescription?: string;
};
