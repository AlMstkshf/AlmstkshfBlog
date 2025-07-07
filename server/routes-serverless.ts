import type { Express } from "express";
import { storage } from "./storage";
import { 
  insertArticleSchema, 
  insertCategorySchema, 
  insertNewsletterSubscriberSchema,
  insertContactSubmissionSchema,
  insertApiKeySchema,
  insertDownloadSchema
} from "@shared/schema";
import { z } from "zod";
import { automationRouter } from "./automation/automationRoutes";
import { analyticsTracker } from "./automation/analyticsTracker";
import { emailAutomation } from "./automation/emailAutomation";
import { healthMonitor } from "./health";
import { emailService } from "./email";
import { registerN8NRoutes } from "./n8n-automation";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { cloudStorage } from "./cloud-storage";

export async function registerServerlessRoutes(app: Express): Promise<void> {
  
  // For serverless, we'll use memory storage for uploads
  // In production, you'd want to use cloud storage like Cloudinary or AWS S3
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      const health = await healthMonitor.getHealthStatus();
      res.json(health);
    } catch (error) {
      res.status(500).json({ error: "Health check failed" });
    }
  });

  // Articles endpoints
  app.get("/api/articles", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string;
      const featured = req.query.featured === 'true';
      const lang = req.query.lang as string || 'en';
      
      const articles = await storage.getArticles({ page, limit, category, featured, lang });
      
      // Track analytics
      analyticsTracker.trackEvent('articles_viewed', {
        page,
        limit,
        category,
        featured,
        lang,
        userAgent: req.headers['user-agent'],
        ip: req.ip
      });
      
      res.json(articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const lang = req.query.lang as string || 'en';
      
      const article = await storage.getArticleBySlug(slug, lang);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      
      // Track analytics
      analyticsTracker.trackEvent('article_viewed', {
        slug,
        lang,
        userAgent: req.headers['user-agent'],
        ip: req.ip
      });
      
      res.json(article);
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  // Categories endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const lang = req.query.lang as string || 'en';
      const categories = await storage.getCategories(lang);
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Search endpoint
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const lang = req.query.lang as string || 'en';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const results = await storage.searchArticles(query, { page, limit, lang });
      
      // Track analytics
      analyticsTracker.trackEvent('search_performed', {
        query,
        lang,
        page,
        limit,
        resultsCount: results.articles.length,
        userAgent: req.headers['user-agent'],
        ip: req.ip
      });
      
      res.json(results);
    } catch (error) {
      console.error('Error performing search:', error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const validatedData = insertNewsletterSubscriberSchema.parse(req.body);
      
      const subscriber = await storage.subscribeToNewsletter(validatedData);
      
      // Send welcome email
      try {
        await emailAutomation.sendWelcomeEmail(validatedData.email, validatedData.preferredLanguage);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the subscription if email fails
      }
      
      // Track analytics
      analyticsTracker.trackEvent('newsletter_subscription', {
        email: validatedData.email,
        language: validatedData.preferredLanguage,
        userAgent: req.headers['user-agent'],
        ip: req.ip
      });
      
      res.json({ success: true, subscriber });
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid subscription data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to subscribe to newsletter" });
    }
  });

  // Contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      
      const submission = await storage.submitContactForm(validatedData);
      
      // Send notification email
      try {
        await emailService.sendContactNotification(validatedData);
      } catch (emailError) {
        console.error('Failed to send contact notification:', emailError);
      }
      
      // Track analytics
      analyticsTracker.trackEvent('contact_form_submitted', {
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        userAgent: req.headers['user-agent'],
        ip: req.ip
      });
      
      res.json({ success: true, submission });
    } catch (error) {
      console.error('Contact form error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid form data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to submit contact form" });
    }
  });

  // Sitemap
  app.get("/api/sitemap.xml", async (req, res) => {
    try {
      const sitemap = await storage.generateSitemap();
      res.set('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).json({ error: "Failed to generate sitemap" });
    }
  });

  // RSS Feed
  app.get("/api/rss.xml", async (req, res) => {
    try {
      const lang = req.query.lang as string || 'en';
      const rss = await storage.generateRSSFeed(lang);
      res.set('Content-Type', 'application/rss+xml');
      res.send(rss);
    } catch (error) {
      console.error('Error generating RSS feed:', error);
      res.status(500).json({ error: "Failed to generate RSS feed" });
    }
  });

  // Mount automation routes
  app.use("/api/automation", automationRouter);

  // Mount N8N automation routes
  registerN8NRoutes(app);

  // Analytics endpoint
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await analyticsTracker.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // File upload endpoint
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const uploadedFile = await cloudStorage.uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      // Track analytics
      analyticsTracker.trackEvent('file_uploaded', {
        filename: uploadedFile.filename,
        size: uploadedFile.size,
        mimetype: uploadedFile.mimetype,
        userAgent: req.headers['user-agent'],
        ip: req.ip
      });

      res.json({
        success: true,
        file: uploadedFile
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // File download/serve endpoint
  app.get("/api/files/:folder/:filename", async (req, res) => {
    try {
      const { folder, filename } = req.params;
      const key = `${folder}/${filename}`;
      
      const fileData = await cloudStorage.getFile(key);
      if (!fileData) {
        return res.status(404).json({ error: "File not found" });
      }

      // Set appropriate headers
      const mimetype = fileData.metadata?.mimetype || 'application/octet-stream';
      const originalName = fileData.metadata?.originalName || filename;
      
      res.set({
        'Content-Type': mimetype,
        'Content-Disposition': `inline; filename="${originalName}"`,
        'Cache-Control': 'public, max-age=31536000'
      });

      // Track analytics
      analyticsTracker.trackEvent('file_downloaded', {
        key,
        filename: originalName,
        mimetype,
        userAgent: req.headers['user-agent'],
        ip: req.ip
      });

      res.send(fileData.buffer);
    } catch (error) {
      console.error('File download error:', error);
      res.status(500).json({ error: "Failed to download file" });
    }
  });

  // File deletion endpoint (admin only)
  app.delete("/api/files/:folder/:filename", async (req, res) => {
    try {
      // TODO: Add authentication check here
      const { folder, filename } = req.params;
      const key = `${folder}/${filename}`;
      
      const deleted = await cloudStorage.deleteFile(key);
      if (!deleted) {
        return res.status(404).json({ error: "File not found or failed to delete" });
      }

      res.json({ success: true, message: "File deleted successfully" });
    } catch (error) {
      console.error('File deletion error:', error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });
}