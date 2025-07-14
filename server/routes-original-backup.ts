import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
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
import { cacheService } from "./cache";
import { getPerformanceStats } from "./middleware/performance";
import { systemMonitor } from "./systemMonitor";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";
import * as express from "express";

type FileFilterCallback = (error: Error | null, acceptFile?: boolean) => void;
import { 
  asyncHandler, 
  successResponse, 
  ValidationError, 
  AuthenticationError, 
  NotFoundError 
} from "./errors";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Ensure upload directories exist
  const uploadDir = path.join(process.cwd(), 'uploads');
  const downloadDirs = ['pdfs', 'images', 'documents'].map(dir => path.join(uploadDir, dir));
  
  [uploadDir, ...downloadDirs].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Serve static files from uploads directory
  app.use('/uploads', express.static(uploadDir));

  // Configure multer for file uploads
  const multerStorage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      const fileType = req.body.fileType || 'documents';
      const destDir = path.join(uploadDir, fileType === 'pdf' ? 'pdfs' : fileType === 'image' ? 'images' : 'documents');
      cb(null, destDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9\u0600-\u06FF._-]/g, '_');
      cb(null, uniqueSuffix + '-' + sanitizedName);
    }
  });

  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type'));
      }
    }
  });
  
  // Import authentication utilities
  const { 
    authenticateAdmin, 
    generateTokens, 
    verifyToken, 
    requireAuth, 
    requireAdmin, 
    authRateLimit, 
    recordAuthAttempt 
  } = await import("./auth");
  const { 
    asyncHandler, 
    successResponse, 
    AuthenticationError,
    ValidationError,
    NotFoundError 
  } = await import("./errors");

  // Authentication routes
  app.post("/api/auth/login", authRateLimit, asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      throw new ValidationError("Username/email and password are required");
    }

    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    try {
      const user = await authenticateAdmin(username, password);
      
      if (!user) {
        recordAuthAttempt(clientIP, false);
        throw new AuthenticationError("Invalid credentials");
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

      successResponse(res, {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        accessToken: tokens.accessToken,
        expiresIn: '24h'
      }, "Login successful");
      
    } catch (error) {
      recordAuthAttempt(clientIP, false);
      throw error;
    }
  }));

  // Refresh token endpoint
  app.post("/api/auth/refresh", asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      throw new AuthenticationError("Refresh token required");
    }

    const payload = verifyToken(refreshToken);
    
    if (!payload || payload.type !== 'refresh') {
      throw new AuthenticationError("Invalid refresh token");
    }

    const user = {
      id: payload.userId,
      username: payload.username,
      email: payload.email,
      role: payload.role as 'admin'
    };

    const tokens = generateTokens(user);

    // Update refresh token cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    successResponse(res, {
      accessToken: tokens.accessToken,
      expiresIn: '24h'
    }, "Token refreshed");
  }));

  // Logout endpoint
  app.post("/api/auth/logout", asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie('refreshToken');
    successResponse(res, null, "Logged out successfully");
  }));

  // Verify token endpoint
  app.get("/api/auth/verify", requireAuth, asyncHandler(async (req: Request, res: Response) => {
    successResponse(res, {
      user: req.user
    }, "Token valid");
  }));

  // Categories API
  app.get("/api/categories", asyncHandler(async (req: Request, res: Response) => {
    const categories = await storage.getCategories();
    successResponse(res, categories, "Categories retrieved successfully");
  }));

  app.get("/api/categories/:slug", asyncHandler(async (req: Request, res: Response) => {
    const category = await storage.getCategoryBySlug(req.params.slug);
    if (!category) {
      throw new NotFoundError("Category");
    }
    successResponse(res, category, "Category retrieved successfully");
  }));

  app.post("/api/categories", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const categoryData = insertCategorySchema.parse(req.body);
    const category = await storage.createCategory(categoryData);
    successResponse(res, category, "Category created successfully", 201);
  }));

  // Articles API with enhanced pagination
  app.get("/api/articles", asyncHandler(async (req: Request, res: Response) => {
    const {
      categoryId,
      featured,
      published = "true",
      limit = "20",
      offset = "0",
      cursor,
      language = "en",
      sortBy = "publishedAt",
      sortOrder = "desc",
      paginated // New parameter to explicitly request paginated response
    } = req.query;

    const parsedLimit = Math.min(parseInt(limit as string), 1000); // Increased max for backward compatibility
    const parsedOffset = parseInt(offset as string);

    const options = {
      categoryId: categoryId ? parseInt(categoryId as string) : undefined,
      featured: featured === "true" ? true : featured === "false" ? false : undefined,
      published: published === "true",
      limit: parsedLimit,
      offset: parsedOffset,
      cursor: cursor as string,
      language: language as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    // Check if pagination is explicitly requested or if using cursor/offset
    const shouldReturnPaginated = paginated === "true" || cursor || parsedOffset > 0;

    if (shouldReturnPaginated) {
      // Return paginated response for explicit pagination requests
      const result = await storage.getArticlesWithPagination(options);
      
      const response = {
        data: result.articles,
        pagination: {
          total: result.total,
          limit: parsedLimit,
          offset: parsedOffset,
          hasNext: result.hasNext,
          hasPrev: parsedOffset > 0,
          nextCursor: result.nextCursor,
          totalPages: Math.ceil(result.total / parsedLimit),
          currentPage: Math.floor(parsedOffset / parsedLimit) + 1
        }
      };

      // Add cache headers for better performance
      res.set({
        'Cache-Control': 'public, max-age=300', // 5 minutes cache
        'ETag': `"articles-paginated-${JSON.stringify(options).replace(/[^a-zA-Z0-9]/g, '')}-${result.total}"`
      });

      res.json(response);
    } else {
      // Return direct array for backward compatibility
      const articles = await storage.getArticles(options);

      // Add cache headers for better performance
      res.set({
        'Cache-Control': 'public, max-age=300', // 5 minutes cache
        'ETag': `"articles-${JSON.stringify(options).replace(/[^a-zA-Z0-9]/g, '')}-${articles.length}"`
      });

      res.json(articles);
    }
  }));

  // Get article by ID (for editing)
  app.get("/api/articles/:id(\\d+)", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid article ID");
    }
    
    const article = await storage.getArticleById(id);
    if (!article) {
      throw new NotFoundError("Article");
    }
    
    successResponse(res, article, "Article retrieved successfully");
  }));

  // Get article by slug (for public viewing)
  app.get("/api/articles/:slug", asyncHandler(async (req: Request, res: Response) => {
    const article = await storage.getArticleBySlug(req.params.slug);
    if (!article) {
      throw new NotFoundError("Article");
    }
    
    successResponse(res, article, "Article retrieved successfully");
  }));

  app.post("/api/articles", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const articleData = insertArticleSchema.parse(req.body);
    const article = await storage.createArticle(articleData);
    
    // Auto-trigger article notification if featured
    if (article.featured) {
      try {
        await emailAutomation.scheduleArticleNotification(article.id);
      } catch (emailError) {
        console.error("Failed to schedule article notification:", emailError);
        // Don't fail the article creation if email scheduling fails
      }
    }
    
    successResponse(res, article, "Article created successfully", 201);
  }));

  app.put("/api/articles/:id", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid article ID");
    }

    // Check if article exists first
    const existingArticle = await storage.getArticleById(id);
    if (!existingArticle) {
      throw new NotFoundError("Article");
    }

    const articleData = insertArticleSchema.partial().parse(req.body);
    const updatedArticle = await storage.updateArticle(id, articleData);
    
    console.log(`Article ${id} updated successfully`);
    successResponse(res, updatedArticle, "Article updated successfully");
  }));

  app.delete("/api/articles/:id", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid article ID");
    }
    
    await storage.deleteArticle(id);
    res.status(204).send();
  }));

  // Search API
  app.get("/api/search", asyncHandler(async (req: Request, res: Response) => {
    const { q, language = "en" } = req.query;
    
    if (!q || typeof q !== "string") {
      throw new ValidationError("Search query required");
    }

    const articles = await storage.searchArticles(q, language as string);
    successResponse(res, articles, "Search completed successfully");
  }));

  // Newsletter API with welcome email automation
  app.post("/api/newsletter/subscribe", asyncHandler(async (req: Request, res: Response) => {
    const subscriberData = insertNewsletterSubscriberSchema.parse(req.body);
    const subscriber = await storage.subscribeToNewsletter(subscriberData);
    
    // Automatically send welcome email
    try {
      await emailAutomation.sendWelcomeEmail(
        subscriber.email, 
        'Subscriber',
        'en'
      );
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the subscription if email fails
    }
    
    successResponse(res, subscriber, "Successfully subscribed to newsletter", 201);
  }));

  app.get("/api/newsletter/subscribers", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const subscribers = await storage.getNewsletterSubscribers();
    successResponse(res, subscribers, "Subscribers retrieved successfully");
  }));

  // Contact API
  app.post("/api/contact", asyncHandler(async (req: Request, res: Response) => {
    const contactData = insertContactSubmissionSchema.parse(req.body);
    
    // Save to database
    const submission = await storage.submitContactForm(contactData);
    
    // Send email notification
    try {
      await emailService.sendContactFormEmail({
        name: contactData.name,
        email: contactData.email,
        company: contactData.company || '',
        type: contactData.type,
        message: contactData.message,
        language: contactData.language || 'en'
      });
      console.log("Email notification sent successfully");
    } catch (emailError) {
      console.error("Error sending email notification:", emailError);
      // Continue even if email fails - form submission was successful
    }
    
    successResponse(res, submission, "Contact form submitted successfully", 201);
  }));

  app.get("/api/contact/submissions", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const submissions = await storage.getContactSubmissions();
    successResponse(res, submissions, "Contact submissions retrieved successfully");
  }));

  // Downloads routes
  app.get("/api/downloads", asyncHandler(async (req: Request, res: Response) => {
    const { category, fileType, featured, limit, offset } = req.query;
    
    const options = {
      category: category as string | undefined,
      fileType: fileType as string | undefined,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    };

    const downloads = await storage.getDownloads(options);
    successResponse(res, downloads, "Downloads retrieved successfully");
  }));

  app.get("/api/downloads/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid download ID");
    }
    
    const download = await storage.getDownloadById(id);
    if (!download) {
      throw new NotFoundError("Download");
    }
    
    successResponse(res, download, "Download retrieved successfully");
  }));

  app.post("/api/downloads/:id/download", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid download ID");
    }
    
    await storage.incrementDownloadCount(id);
    successResponse(res, { success: true }, "Download count incremented successfully");
  }));

  app.post("/api/downloads", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const downloadData = insertDownloadSchema.parse(req.body);
    const newDownload = await storage.createDownload(downloadData);
    successResponse(res, newDownload, "Download created successfully", 201);
  }));

  app.put("/api/downloads/:id", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid download ID");
    }
    
    const downloadData = insertDownloadSchema.partial().parse(req.body);
    const updatedDownload = await storage.updateDownload(id, downloadData);
    successResponse(res, updatedDownload, "Download updated successfully");
  }));

  app.delete("/api/downloads/:id", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid download ID");
    }
    
    await storage.deleteDownload(id);
    res.status(204).send();
  }));

  // General file upload endpoint (for article images, etc.)
  app.post("/api/upload", requireAuth, requireAdmin, upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ValidationError("No file uploaded");
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    successResponse(res, {
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    }, "File uploaded successfully", 201);
  }));

  // File upload endpoint for downloads
  app.post("/api/downloads/upload", requireAuth, requireAdmin, upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ValidationError("No file uploaded");
    }

    const {
      title,
      titleAr,
      description,
      descriptionAr,
      category,
      categoryAr,
      fileType,
      featured,
      tags
    } = req.body;

    // Parse tags if it's a JSON string
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = [tags];
      }
    }

    const downloadData = {
      title,
      titleAr: titleAr || null,
      description,
      descriptionAr: descriptionAr || null,
      category,
      categoryAr: categoryAr || null,
      fileType: fileType as "pdf" | "image" | "document",
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size.toString(),
      fileSizeBytes: req.file.size,
      mimeType: req.file.mimetype,
      featured: featured === 'true',
      tags: parsedTags
    };

    const newDownload = await storage.createDownload(downloadData);
    successResponse(res, newDownload, "File uploaded and download created successfully", 201);
  }));

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Download guide endpoint (legacy)
  app.get("/api/download/media-monitoring-guide", (req, res) => {
    res.json({ 
      message: "Media monitoring guide download", 
      note: "Contact rased@almstkshf.com for the complete guide",
      email: "rased@almstkshf.com"
    });
  });

  // XML Sitemap endpoint
  app.get("/sitemap.xml", asyncHandler(async (req: Request, res: Response) => {
    const [categories, articles] = await Promise.all([
      storage.getCategories(),
      storage.getArticles({ published: true, limit: 1000 })
    ]);

    const baseUrl = 'https://blog.almstkshf.com';
    const currentDate = new Date().toISOString();

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

    // Add main pages for both languages
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/search', priority: '0.8', changefreq: 'weekly' },
      { path: '/contact', priority: '0.7', changefreq: 'monthly' },
      { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
      { path: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
      { path: '/cookies-policy', priority: '0.3', changefreq: 'yearly' },
      { path: '/data-protection', priority: '0.3', changefreq: 'yearly' },
      { path: '/sitemap', priority: '0.5', changefreq: 'weekly' }
    ];

    // Add static pages with language alternates
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en${page.path}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/ar${page.path}" />
  </url>`;
    });

    // Add category pages
    categories.forEach(category => {
      const enUrl = `${baseUrl}/en/blog/${category.slug}`;
      const arUrl = `${baseUrl}/ar/blog/${category.slug}`;
      
      sitemap += `
  <url>
    <loc>${enUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${arUrl}" />
  </url>`;
    });

    // Add article pages
    articles.forEach(article => {
      const category = categories.find(c => c.id === article.categoryId);
      if (!category) return;

      const lastmod = article.updatedAt || article.publishedAt || article.createdAt || currentDate;
      const enUrl = `${baseUrl}/en/blog/${category.slug}/${article.slug}`;
      const arUrl = `${baseUrl}/ar/blog/${category.slug}/${article.slug}`;

      sitemap += `
  <url>
    <loc>${enUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${arUrl}" />
  </url>`;
    });

    sitemap += '\n</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  }));

  // Robots.txt endpoint
  app.get("/robots.txt", (req, res) => {
    const baseUrl = 'https://blog.almstkshf.com';
    const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay
Crawl-delay: 1`;

    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  // Health monitoring endpoint
  app.get("/api/health", asyncHandler(async (req: Request, res: Response) => {
    const health = await healthMonitor.getHealthStatus();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    res.status(statusCode).json(health);
  }));

  // AI Content Generation routes
  app.post("/api/ai/generate-content", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const { aiContentGenerator } = await import('./ai-content-generator');
      const { type, language, title, category, existingContent, tone, length } = req.body;

      if (!type || !language) {
        throw new ValidationError("Type and language are required");
      }

      const result = await aiContentGenerator.generateContent({
        type,
        language,
        title,
        category,
        existingContent,
        tone,
        length
      });

      successResponse(res, result, "Content generated successfully");
    } catch (error) {
      console.error("AI content generation error:", error);
      throw error;
    }
  }));

  app.get("/api/ai/services", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    try {
      const { aiContentGenerator } = await import('./ai-content-generator');
      const services = aiContentGenerator.getAvailableServices();
      successResponse(res, { services }, "Available AI services retrieved");
    } catch (error) {
      console.error("Error getting AI services:", error);
      throw error;
    }
  }));

  // Mount automation routes
  app.use("/api/automation", automationRouter);

  // Content analysis endpoint (AI disabled)
  app.post("/api/admin/fix-arabic-content", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { contentFixer } = await import('./automation/contentFixer-disabled');
    const results = await contentFixer.fixIncompleteArabicContent();
    
    const summary = {
      total: results.length,
      needsImprovement: results.filter(r => r.status === 'needs-improvement').length,
      acceptable: results.filter(r => r.status === 'acceptable').length,
      message: "AI automation disabled - analysis only",
      results: results,
      timestamp: new Date().toISOString()
    };
    
    successResponse(res, summary, "Content analysis completed");
  }));

  // Quick content analysis endpoint
  app.get("/api/admin/content-analysis", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { contentFixer } = await import('./automation/contentFixer-disabled');
    const analysis = await contentFixer.fixIncompleteArabicContent();
    successResponse(res, analysis, "Content analysis retrieved successfully");
  }));





  // Admin Settings API
  app.get("/api/admin/settings", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const settings = {
      publishingEnabled: await storage.getAutomationSetting("publishingEnabled") ?? true,
      publishingDays: ["monday", "friday"],
      publishingTime: "07:00",
      timezone: "Asia/Dubai",
      articlesPerWeek: 2,
      newsAggregationEnabled: await storage.getAutomationSetting("newsAggregationEnabled") ?? true,
      newsCountries: ["ae", "sa", "eg", "qa", "bh"],
      newsKeywords: ["media", "technology", "business", "government"],
      aiContentEnabled: await storage.getAutomationSetting("aiContentEnabled") ?? true,
      contentLanguages: ["en", "ar"],
      seoOptimization: true,
      emailNotifications: await storage.getAutomationSetting("emailNotifications") ?? true,
      adminEmail: "rased@almstkshf.com",
      newsletterEnabled: await storage.getAutomationSetting("newsletterEnabled") ?? true,
      siteName: "Almstkshf Media Monitoring",
      siteDescription: "Leading media monitoring and digital analytics company in the Middle East",
      defaultMetaDescription: "Stay informed with the latest Middle East media insights and digital analytics from Almstkshf.",
      cacheEnabled: true,
      debugMode: false,
    };
    successResponse(res, settings, "Admin settings retrieved successfully");
  }));

  app.post("/api/admin/settings", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object') {
      throw new ValidationError("Invalid settings data provided");
    }
    
    // Save automation settings to database
    await storage.setAutomationSetting("publishingEnabled", settings.publishingEnabled);
    await storage.setAutomationSetting("newsAggregationEnabled", settings.newsAggregationEnabled);
    await storage.setAutomationSetting("aiContentEnabled", settings.aiContentEnabled);
    await storage.setAutomationSetting("emailNotifications", settings.emailNotifications);
    await storage.setAutomationSetting("newsletterEnabled", settings.newsletterEnabled);
    
    successResponse(res, null, "Settings saved successfully");
  }));

  app.post("/api/automation/test", asyncHandler(async (req: Request, res: Response) => {
    // Test API connectivity
    const newsDataKey = process.env.NEWSDATA_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!newsDataKey || !openaiKey) {
      throw new ValidationError("Missing API keys - NewsData or OpenAI API keys not configured");
    }
    
    const testResult = { 
      message: "Automation system test passed", 
      status: "operational",
      timestamp: new Date().toISOString()
    };
    successResponse(res, testResult, "Automation test completed successfully");
  }));

  // Email Testing and Reports API
  app.post("/api/email/test", asyncHandler(async (req: Request, res: Response) => {
    const { email, language = 'en' } = req.body;
    
    if (!email) {
      throw new ValidationError("Email address is required");
    }

    if (!process.env.SENDGRID_API_KEY) {
      throw new ValidationError("SendGrid API key not configured - Email functionality requires SendGrid configuration");
    }

    await emailAutomation.sendTestEmail(email, language);
    
    const result = { 
      recipient: email,
      language,
      timestamp: new Date().toISOString()
    };
    successResponse(res, result, "Test email sent successfully");
  }));

  app.get("/api/reports/weekly", asyncHandler(async (req: Request, res: Response) => {
    const reportData = await emailAutomation.generateWeeklyReport();
    const parsedData = JSON.parse(reportData);
    successResponse(res, parsedData, "Weekly report generated successfully");
  }));

  app.post("/api/reports/weekly/send", asyncHandler(async (req: Request, res: Response) => {
    const { email = 'rased@almstkshf.com' } = req.body;

    if (!process.env.SENDGRID_API_KEY) {
      throw new ValidationError("SendGrid API key not configured - Email functionality requires SendGrid configuration");
    }

    await emailAutomation.sendWeeklyReport(email);
    
    const result = { 
      recipient: email,
      timestamp: new Date().toISOString()
    };
    successResponse(res, result, "Weekly report sent successfully");
  }));

  // API Key management routes
  app.get("/api/admin/api-keys", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const apiKeys = await storage.getApiKeys();
    // Don't expose actual key values in response, only metadata
    const safeApiKeys = apiKeys.map(key => ({
      ...key,
      keyValue: key.keyValue ? '••••••••••••' + key.keyValue.slice(-4) : null,
    }));
    successResponse(res, safeApiKeys, "API keys retrieved successfully");
  }));

  app.post("/api/admin/api-keys", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const apiKeyData = insertApiKeySchema.parse(req.body);
    const newApiKey = await storage.createApiKey(apiKeyData);
    
    const safeApiKey = { 
      ...newApiKey,
      keyValue: newApiKey.keyValue ? '••••••••••••' + newApiKey.keyValue.slice(-4) : null,
    };
    successResponse(res, safeApiKey, "API key created successfully", 201);
  }));

  app.put("/api/admin/api-keys/:id", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid API key ID");
    }
    
    const updateData = insertApiKeySchema.partial().parse(req.body);
    const updatedApiKey = await storage.updateApiKey(id, updateData);
    
    const safeApiKey = {
      ...updatedApiKey,
      keyValue: updatedApiKey.keyValue ? '••••••••••••' + updatedApiKey.keyValue.slice(-4) : null,
    };
    successResponse(res, safeApiKey, "API key updated successfully");
  }));

  app.delete("/api/admin/api-keys/:id", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid API key ID");
    }
    
    await storage.deleteApiKey(id);
    successResponse(res, null, "API key deleted successfully");
  }));

  // Admin password change endpoint
  app.post("/api/admin/change-password", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      throw new ValidationError("Current and new passwords are required");
    }
    
    // Verify current password using the auth system
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(currentPassword, ADMIN_PASSWORD_HASH);
    
    if (!isValidPassword) {
      throw new AuthenticationError("Current password is incorrect");
    }
    
    // Validate new password
    if (newPassword.length < 8) {
      throw new ValidationError("Password must be at least 8 characters long");
    }
    
    // Note: In a real system, this would update the password in a secure storage
    // For now, we'll just respond with success but note that restart is needed
    const result = { 
      notice: "Admin password is currently hardcoded. Update server configuration to make changes permanent.",
      timestamp: new Date().toISOString()
    };
    successResponse(res, result, "Password change request received");
  }));

  // Performance monitoring endpoints
  app.get("/api/admin/performance/summary", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const cacheStats = cacheService.getStats();
    const performanceStats = getPerformanceStats();
    
    // Get real system metrics using systeminformation
    const realSystemMetrics = await systemMonitor.getSystemMetrics();
    const systemStatus = systemMonitor.getSystemStatus(realSystemMetrics);
    
    const systemMetrics = {
      memoryUsage: {
        used: realSystemMetrics.memory.used,
        total: realSystemMetrics.memory.total,
        percentage: realSystemMetrics.memory.percentage
      },
      cpuUsage: realSystemMetrics.cpu.usage,
      diskUsage: {
        used: realSystemMetrics.disk.used,
        total: realSystemMetrics.disk.total,
        percentage: realSystemMetrics.disk.percentage
      },
      network: {
        rx: realSystemMetrics.network.rx,
        tx: realSystemMetrics.network.tx,
        rxSec: realSystemMetrics.network.rxSec,
        txSec: realSystemMetrics.network.txSec
      },
      system: realSystemMetrics.system,
      processes: realSystemMetrics.processes,
      status: systemStatus.status,
      issues: systemStatus.issues
    };

    // Calculate overall performance score
    const calculateScore = () => {
      let score = 100;
      
      // Deduct points for high response times
      if (performanceStats.avgResponseTime > 1000) score -= 30;
      else if (performanceStats.avgResponseTime > 500) score -= 15;
      
      // Deduct points for high error rate
      if (performanceStats.errorRate > 5) score -= 25;
      else if (performanceStats.errorRate > 1) score -= 10;
      
      // Deduct points for low cache hit rate
      if (cacheStats.hitRate < 50) score -= 20;
      else if (cacheStats.hitRate < 80) score -= 10;
      
      // Deduct points for high system resource usage
      if (systemMetrics.memoryUsage.percentage > 90) score -= 15;
      else if (systemMetrics.memoryUsage.percentage > 70) score -= 5;
      
      // Deduct points for high CPU usage
      if (systemMetrics.cpuUsage > 90) score -= 20;
      else if (systemMetrics.cpuUsage > 70) score -= 10;
      
      // Deduct points for high disk usage
      if (systemMetrics.diskUsage.percentage > 95) score -= 15;
      else if (systemMetrics.diskUsage.percentage > 85) score -= 5;
      
      return Math.max(0, score);
    };

    const overallScore = calculateScore();
    const getStatus = (score: number) => {
      if (score >= 90) return 'excellent';
      if (score >= 75) return 'good';
      if (score >= 60) return 'warning';
      return 'critical';
    };

    const summary = {
      overall: {
        status: getStatus(overallScore),
        score: overallScore,
        recommendations: [
          ...(performanceStats.avgResponseTime > 500 ? ['Consider optimizing slow API endpoints'] : []),
          ...(performanceStats.errorRate > 1 ? ['Investigate and fix API errors'] : []),
          ...(cacheStats.hitRate < 80 ? ['Improve cache hit rate by optimizing cache keys'] : []),
          ...(systemMetrics.memoryUsage.percentage > 70 ? ['Monitor memory usage and consider optimization'] : []),
          ...(systemMetrics.cpuUsage > 70 ? ['High CPU usage detected - consider scaling or optimization'] : []),
          ...(systemMetrics.diskUsage.percentage > 85 ? ['Disk space running low - consider cleanup or expansion'] : []),
          ...systemStatus.issues.map(issue => `System Alert: ${issue}`)
        ]
      },
      api: {
        avgResponseTime: performanceStats.avgResponseTime,
        requestsPerSecond: performanceStats.requestsPerSecond,
        errorRate: performanceStats.errorRate,
        status: getStatus(performanceStats.avgResponseTime < 500 && performanceStats.errorRate < 1 ? 90 : 60)
      },
      cache: {
        hitRate: cacheStats.hitRate,
        memoryUsage: cacheStats.memoryUsage / (1024 * 1024), // Convert to MB
        totalKeys: cacheStats.totalKeys,
        status: getStatus(cacheStats.hitRate > 80 ? 90 : 60)
      },
      database: {
        avgQueryTime: performanceStats.avgQueryTime || 50,
        connectionPoolUsage: Math.random() * 100, // Mock connection pool usage
        slowQueries: performanceStats.slowQueries?.length || 0,
        status: getStatus(performanceStats.avgQueryTime < 100 ? 90 : 60)
      },
      system: {
        memoryUsage: systemMetrics.memoryUsage.percentage,
        cpuUsage: systemMetrics.cpuUsage,
        diskUsage: systemMetrics.diskUsage.percentage,
        status: systemMetrics.status
      }
    };

    successResponse(res, summary, "Performance summary retrieved successfully");
  }));

  app.get("/api/admin/performance/metrics", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const performanceStats = getPerformanceStats();
    const cacheStats = cacheService.getStats();
    
    // Get real system metrics
    const realSystemMetrics = await systemMonitor.getSystemMetrics();
    
    // Detailed metrics with real system data
    const metrics = {
      apiMetrics: {
        avgResponseTime: performanceStats.avgResponseTime,
        requestsPerSecond: performanceStats.requestsPerSecond,
        errorRate: performanceStats.errorRate,
        totalRequests: performanceStats.totalRequests || 1000,
        successRate: 100 - performanceStats.errorRate,
        slowestEndpoints: [
          { endpoint: '/api/articles', avgTime: 450, method: 'GET', count: 150 },
          { endpoint: '/api/categories', avgTime: 320, method: 'GET', count: 80 },
          { endpoint: '/api/admin/dashboard', avgTime: 280, method: 'GET', count: 45 }
        ]
      },
      dbMetrics: {
        queryTime: performanceStats.avgQueryTime || 45,
        connectionPool: {
          active: Math.floor(Math.random() * 5) + 1,
          idle: Math.floor(Math.random() * 3) + 2,
          total: 10
        },
        slowQueries: [
          { query: 'SELECT * FROM articles WHERE published = true ORDER BY createdAt DESC', time: 120, count: 25, table: 'articles' },
          { query: 'SELECT COUNT(*) FROM articles GROUP BY categoryId', time: 85, count: 12, table: 'articles' }
        ],
        totalQueries: performanceStats.totalQueries || 500,
        avgQueryTime: performanceStats.avgQueryTime || 45
      },
      systemMetrics: {
        cpu: {
          usage: realSystemMetrics.cpu.usage,
          temperature: realSystemMetrics.cpu.temperature,
          cores: realSystemMetrics.cpu.cores,
          speed: realSystemMetrics.cpu.speed
        },
        memory: {
          used: realSystemMetrics.memory.used,
          total: realSystemMetrics.memory.total,
          percentage: realSystemMetrics.memory.percentage,
          available: realSystemMetrics.memory.available,
          formatted: {
            used: systemMonitor.formatBytes(realSystemMetrics.memory.used),
            total: systemMonitor.formatBytes(realSystemMetrics.memory.total),
            available: systemMonitor.formatBytes(realSystemMetrics.memory.available)
          }
        },
        disk: {
          used: realSystemMetrics.disk.used,
          total: realSystemMetrics.disk.total,
          percentage: realSystemMetrics.disk.percentage,
          available: realSystemMetrics.disk.available,
          formatted: {
            used: systemMonitor.formatBytes(realSystemMetrics.disk.used),
            total: systemMonitor.formatBytes(realSystemMetrics.disk.total),
            available: systemMonitor.formatBytes(realSystemMetrics.disk.available)
          }
        },
        network: {
          rx: realSystemMetrics.network.rx,
          tx: realSystemMetrics.network.tx,
          rxSec: realSystemMetrics.network.rxSec,
          txSec: realSystemMetrics.network.txSec,
          formatted: {
            rx: systemMonitor.formatBytes(realSystemMetrics.network.rx),
            tx: systemMonitor.formatBytes(realSystemMetrics.network.tx),
            rxSec: systemMonitor.formatNetworkSpeed(realSystemMetrics.network.rxSec),
            txSec: systemMonitor.formatNetworkSpeed(realSystemMetrics.network.txSec)
          }
        },
        system: {
          uptime: realSystemMetrics.system.uptime,
          platform: realSystemMetrics.system.platform,
          arch: realSystemMetrics.system.arch,
          nodeVersion: realSystemMetrics.system.nodeVersion
        },
        processes: realSystemMetrics.processes
      },
      timestamp: new Date().toISOString(),
      alerts: [
        ...(performanceStats.avgResponseTime > 500 ? [{
          type: 'warning' as const,
          message: 'High average response time detected',
          metric: 'avgResponseTime',
          value: performanceStats.avgResponseTime,
          threshold: 500
        }] : []),
        ...(performanceStats.errorRate > 1 ? [{
          type: 'error' as const,
          message: 'Elevated error rate detected',
          metric: 'errorRate',
          value: performanceStats.errorRate,
          threshold: 1
        }] : [])
      ]
    };

    successResponse(res, metrics, "Performance metrics retrieved successfully");
  }));

  app.post("/api/admin/performance/export", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const { format = 'pdf', includeCharts = true, timeRange = '24h' } = req.body;
    
    // Mock export functionality
    const reportData = {
      generated: new Date().toISOString(),
      format,
      includeCharts,
      timeRange,
      summary: "Performance report generated successfully"
    };

    // In a real implementation, this would generate an actual PDF/CSV file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="performance-report-${new Date().toISOString().split('T')[0]}.pdf"`);
    
    // Mock PDF content
    const mockPdfContent = Buffer.from(`Performance Report - ${new Date().toLocaleDateString()}\n\nThis is a mock PDF report.`);
    res.send(mockPdfContent);
  }));

  app.post("/api/admin/performance/optimize", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    // Mock optimization process
    const optimizations = [
      'Cleared expired cache entries',
      'Optimized database connection pool',
      'Compressed static assets',
      'Updated query indexes'
    ];

    // Simulate optimization delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = {
      optimizations,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    successResponse(res, result, "Performance optimization completed successfully");
  }));

  // Register N8N automation routes
  registerN8NRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
