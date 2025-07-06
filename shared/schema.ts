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
});

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
});

// Newsletter subscribers table
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  language: varchar("language", { length: 2 }).notNull().default("en"), // 'en' or 'ar'
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  active: boolean("active").default(true),
});

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
});

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
});

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
});

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
export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;
export type CategorySelect = typeof categories.$inferSelect;
export type CategoryInsert = z.infer<typeof insertCategorySchema>;
export type ArticleSelect = typeof articles.$inferSelect;
export type ArticleInsert = z.infer<typeof insertArticleSchema>;
export type NewsletterSubscriberSelect = typeof newsletterSubscribers.$inferSelect;
export type NewsletterSubscriberInsert = z.infer<typeof insertNewsletterSubscriberSchema>;
export type ContactSubmissionSelect = typeof contactSubmissions.$inferSelect;
export type ContactSubmissionInsert = z.infer<typeof insertContactSubmissionSchema>;
export type ApiKeySelect = typeof apiKeys.$inferSelect;
export type ApiKeyInsert = z.infer<typeof insertApiKeySchema>;
export type DownloadSelect = typeof downloads.$inferSelect;
export type DownloadInsert = z.infer<typeof insertDownloadSchema>;
