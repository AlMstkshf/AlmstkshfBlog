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
// Lazy import cloud storage to avoid initialization issues in serverless
// import { cloudStorage } from "./cloud-storage";
import { 
  authenticateAdmin, 
  generateTokens, 
  verifyToken, 
  authRateLimit, 
  recordAuthAttempt,
  requireAuth,
  requireAdmin
} from "./auth";

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

  // Authentication routes
  app.post("/api/auth/login", authRateLimit, async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "Username/email and password are required" 
        });
      }

      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      
      try {
        const user = await authenticateAdmin(username, password);
        
        if (!user) {
          recordAuthAttempt(clientIP, false);
          return res.status(401).json({ 
            success: false, 
            message: "Invalid credentials" 
          });
        }

        const tokens = generateTokens(user);
        recordAuthAttempt(clientIP, true);

        // Set secure HTTP-only cookie for refresh token
        res.cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
          success: true,
          message: "Login successful",
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          },
          accessToken: tokens.accessToken,
          expiresIn: '24h'
        });
        
      } catch (error) {
        recordAuthAttempt(clientIP, false);
        throw error;
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Refresh token endpoint
  app.post("/api/auth/refresh", async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({ 
          success: false, 
          message: "Refresh token required" 
        });
      }

      const payload = verifyToken(refreshToken);
      
      if (!payload || payload.type !== 'refresh') {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid refresh token" 
        });
      }

      // Generate new access token
      const user = {
        id: payload.userId,
        username: payload.username,
        email: '', // We don't store email in JWT payload
        role: payload.role
      };

      const tokens = generateTokens(user);

      // Update refresh token cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        message: "Token refreshed",
        accessToken: tokens.accessToken,
        expiresIn: '24h'
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    try {
      // Clear refresh token cookie
      res.clearCookie('refreshToken');
      
      res.json({
        success: true,
        message: "Logged out successfully"
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
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

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const lang = req.query.lang as string || 'en';
      
      const category = await storage.getCategoryBySlug(slug);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      // Track analytics
      analyticsTracker.trackEvent('category_viewed', {
        slug,
        lang,
        userAgent: req.headers['user-agent'],
        ip: req.ip
      });
      
      res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ error: "Failed to fetch category" });
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

      // Lazy import to avoid initialization issues in serverless
      const { cloudStorage } = await import("./cloud-storage");
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
      
      // Lazy import to avoid initialization issues in serverless
      const { cloudStorage } = await import("./cloud-storage");
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
      
      // Lazy import to avoid initialization issues in serverless
      const { cloudStorage } = await import("./cloud-storage");
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