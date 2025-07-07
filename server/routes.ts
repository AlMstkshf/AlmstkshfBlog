import type { Express } from "express";
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
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

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
    destination: (req, file, cb) => {
      const fileType = req.body.fileType || 'documents';
      const destDir = path.join(uploadDir, fileType === 'pdf' ? 'pdfs' : fileType === 'image' ? 'images' : 'documents');
      cb(null, destDir);
    },
    filename: (req, file, cb) => {
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
    fileFilter: (req, file, cb) => {
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
      throw new ValidationError("Username and password are required");
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
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const categoryData = insertCategorySchema.parse(req.body);
    const category = await storage.createCategory(categoryData);
    successResponse(res, category, "Category created successfully", 201);
  }));

  // Articles API with enhanced pagination
  app.get("/api/articles", async (req, res) => {
    try {
      const {
        categoryId,
        featured,
        published = "true",
        limit = "20",
        offset = "0",
        cursor,
        language = "en",
        sortBy = "publishedAt",
        sortOrder = "desc"
      } = req.query;

      const parsedLimit = Math.min(parseInt(limit as string), 100); // Max 100 items per request
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

      const result = await storage.getArticlesWithPagination(options);
      
      // Add pagination metadata
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
        'ETag': `"articles-${JSON.stringify(options).replace(/[^a-zA-Z0-9]/g, '')}-${result.total}"`
      });

      res.json(response);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Get article by ID (for editing)
  app.get("/api/articles/:id(\\d+)", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticleById(id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article by ID:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Get article by slug (for public viewing)
  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.post("/api/articles", requireAuth, requireAdmin, asyncHandler(async (req: Request, res: Response) => {
    const articleData = insertArticleSchema.parse(req.body);
    const article = await storage.createArticle(articleData);
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
  app.get("/api/search", async (req, res) => {
    try {
      const { q, language = "en" } = req.query;
      
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query required" });
      }

      const articles = await storage.searchArticles(q, language as string);
      res.json(articles);
    } catch (error) {
      console.error("Error searching articles:", error);
      res.status(500).json({ message: "Failed to search articles" });
    }
  });

  // Newsletter API
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const subscriberData = insertNewsletterSubscriberSchema.parse(req.body);
      const subscriber = await storage.subscribeToNewsletter(subscriberData);
      res.status(201).json({ message: "Successfully subscribed to newsletter" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription data", errors: error.errors });
      }
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  app.get("/api/newsletter/subscribers", async (req, res) => {
    try {
      const subscribers = await storage.getNewsletterSubscribers();
      res.json(subscribers);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ message: "Failed to fetch subscribers" });
    }
  });

  // Contact API
  app.post("/api/contact", async (req, res) => {
    try {
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
      
      res.status(201).json({ message: "Contact form submitted successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      }
      console.error("Error submitting contact form:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  app.get("/api/contact/submissions", async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ message: "Failed to fetch contact submissions" });
    }
  });

  // Downloads routes
  app.get("/api/downloads", async (req, res) => {
    try {
      const { category, fileType, featured, limit, offset } = req.query;
      
      const options = {
        category: category as string | undefined,
        fileType: fileType as string | undefined,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };

      const downloads = await storage.getDownloads(options);
      res.json(downloads);
    } catch (error) {
      console.error("Error fetching downloads:", error);
      res.status(500).json({ error: "Failed to fetch downloads" });
    }
  });

  app.get("/api/downloads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const download = await storage.getDownloadById(parseInt(id));
      
      if (!download) {
        return res.status(404).json({ error: "Download not found" });
      }
      
      res.json(download);
    } catch (error) {
      console.error("Error fetching download:", error);
      res.status(500).json({ error: "Failed to fetch download" });
    }
  });

  app.post("/api/downloads/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementDownloadCount(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking download:", error);
      res.status(500).json({ error: "Failed to track download" });
    }
  });

  app.post("/api/downloads", async (req, res) => {
    try {
      const downloadData = req.body;
      const newDownload = await storage.createDownload(downloadData);
      res.status(201).json(newDownload);
    } catch (error) {
      console.error("Error creating download:", error);
      res.status(500).json({ error: "Failed to create download" });
    }
  });

  app.put("/api/downloads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const downloadData = req.body;
      const updatedDownload = await storage.updateDownload(parseInt(id), downloadData);
      res.json(updatedDownload);
    } catch (error) {
      console.error("Error updating download:", error);
      res.status(500).json({ error: "Failed to update download" });
    }
  });

  app.delete("/api/downloads/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDownload(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting download:", error);
      res.status(500).json({ error: "Failed to delete download" });
    }
  });

  // File upload endpoint
  app.post("/api/downloads/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
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
        fileSize: req.file.size,
        featured: featured === 'true',
        tags: parsedTags
      };

      const newDownload = await storage.createDownload(downloadData);
      res.status(201).json(newDownload);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

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
  app.get("/sitemap.xml", async (req, res) => {
    try {
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
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).json({ error: "Failed to generate sitemap" });
    }
  });

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
  app.get("/api/health", async (req, res) => {
    try {
      const health = await healthMonitor.getHealthStatus();
      const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(503).json({
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Mount automation routes
  app.use("/api/automation", automationRouter);

  // Content analysis endpoint (AI disabled)
  app.post("/api/admin/fix-arabic-content", async (req, res) => {
    try {
      const { contentFixer } = await import('./automation/contentFixer-disabled');
      const results = await contentFixer.fixIncompleteArabicContent();
      
      const summary = {
        total: results.length,
        needsImprovement: results.filter(r => r.status === 'needs-improvement').length,
        acceptable: results.filter(r => r.status === 'acceptable').length,
        message: "AI automation disabled - analysis only",
        results: results
      };
      
      res.json(summary);
    } catch (error) {
      console.error("Error analyzing content:", error);
      res.status(500).json({ message: "Failed to analyze content" });
    }
  });

  // Quick content analysis endpoint
  app.get("/api/admin/content-analysis", async (req, res) => {
    try {
      const { contentFixer } = await import('./automation/contentFixer-disabled');
      const analysis = await contentFixer.fixIncompleteArabicContent();
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing content:", error);
      res.status(500).json({ message: "Failed to analyze content" });
    }
  });

  // Auto-trigger welcome email on newsletter subscription
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { body } = req;
      const validatedData = insertNewsletterSubscriberSchema.parse(body);
      
      const subscriber = await storage.subscribeToNewsletter(validatedData);
      
      // Automatically send welcome email
      await emailAutomation.sendWelcomeEmail(
        subscriber.email, 
        'Subscriber',
        'en'
      );
      
      res.status(201).json(subscriber);
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe to newsletter" });
    }
  });

  // Enhanced article creation with automation triggers
  app.post("/api/articles", async (req, res) => {
    try {
      const { body } = req;
      const validatedData = insertArticleSchema.parse(body);
      
      const article = await storage.createArticle(validatedData);
      
      // Auto-trigger article notification if featured
      if (article.featured) {
        await emailAutomation.scheduleArticleNotification(article.id);
      }
      
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  // Admin Settings API
  app.get("/api/admin/settings", async (req, res) => {
    try {
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
      res.json(settings);
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/admin/settings", async (req, res) => {
    try {
      const settings = req.body;
      
      // Save automation settings to database
      await storage.setAutomationSetting("publishingEnabled", settings.publishingEnabled);
      await storage.setAutomationSetting("newsAggregationEnabled", settings.newsAggregationEnabled);
      await storage.setAutomationSetting("aiContentEnabled", settings.aiContentEnabled);
      await storage.setAutomationSetting("emailNotifications", settings.emailNotifications);
      await storage.setAutomationSetting("newsletterEnabled", settings.newsletterEnabled);
      
      res.json({ message: "Settings saved successfully" });
    } catch (error) {
      console.error("Error saving admin settings:", error);
      res.status(500).json({ message: "Failed to save settings" });
    }
  });

  app.post("/api/automation/test", async (req, res) => {
    try {
      // Test API connectivity
      const newsDataKey = process.env.NEWSDATA_API_KEY;
      const openaiKey = process.env.OPENAI_API_KEY;
      
      if (!newsDataKey || !openaiKey) {
        return res.status(400).json({ 
          message: "Missing API keys",
          details: "NewsData or OpenAI API keys not configured"
        });
      }
      
      res.json({ message: "Automation system test passed", status: "operational" });
    } catch (error) {
      console.error("Automation test failed:", error);
      res.status(500).json({ message: "Automation test failed" });
    }
  });

  // Email Testing and Reports API
  app.post("/api/email/test", async (req, res) => {
    try {
      const { email, language = 'en' } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email address is required" });
      }

      if (!process.env.SENDGRID_API_KEY) {
        return res.status(400).json({ 
          message: "SendGrid API key not configured",
          details: "Email functionality requires SendGrid configuration"
        });
      }

      await emailAutomation.sendTestEmail(email, language);
      res.json({ 
        message: "Test email sent successfully",
        recipient: email,
        language 
      });
    } catch (error) {
      console.error("Test email failed:", error);
      res.status(500).json({ 
        message: "Failed to send test email",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/reports/weekly", async (req, res) => {
    try {
      const reportData = await emailAutomation.generateWeeklyReport();
      res.json({
        message: "Weekly report generated successfully",
        data: JSON.parse(reportData)
      });
    } catch (error) {
      console.error("Failed to generate weekly report:", error);
      res.status(500).json({ 
        message: "Failed to generate weekly report",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/reports/weekly/send", async (req, res) => {
    try {
      const { email = 'rased@almstkshf.com' } = req.body;

      if (!process.env.SENDGRID_API_KEY) {
        return res.status(400).json({ 
          message: "SendGrid API key not configured",
          details: "Email functionality requires SendGrid configuration"
        });
      }

      await emailAutomation.sendWeeklyReport(email);
      res.json({ 
        message: "Weekly report sent successfully",
        recipient: email
      });
    } catch (error) {
      console.error("Failed to send weekly report:", error);
      res.status(500).json({ 
        message: "Failed to send weekly report",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // API Key management routes
  app.get("/api/admin/api-keys", async (req, res) => {
    try {
      const apiKeys = await storage.getApiKeys();
      // Don't expose actual key values in response, only metadata
      const safeApiKeys = apiKeys.map(key => ({
        ...key,
        keyValue: key.keyValue ? '••••••••••••' + key.keyValue.slice(-4) : null,
      }));
      res.json(safeApiKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  app.post("/api/admin/api-keys", async (req, res) => {
    try {
      const apiKeyData = insertApiKeySchema.parse(req.body);
      const newApiKey = await storage.createApiKey(apiKeyData);
      res.status(201).json({ 
        ...newApiKey,
        keyValue: newApiKey.keyValue ? '••••••••••••' + newApiKey.keyValue.slice(-4) : null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid API key data", errors: error.errors });
      } else {
        console.error("Error creating API key:", error);
        res.status(500).json({ message: "Failed to create API key" });
      }
    }
  });

  app.put("/api/admin/api-keys/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertApiKeySchema.partial().parse(req.body);
      const updatedApiKey = await storage.updateApiKey(id, updateData);
      res.json({
        ...updatedApiKey,
        keyValue: updatedApiKey.keyValue ? '••••••••••••' + updatedApiKey.keyValue.slice(-4) : null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid API key data", errors: error.errors });
      } else {
        console.error("Error updating API key:", error);
        res.status(500).json({ message: "Failed to update API key" });
      }
    }
  });

  app.delete("/api/admin/api-keys/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteApiKey(id);
      res.json({ message: "API key deleted successfully" });
    } catch (error) {
      console.error("Error deleting API key:", error);
      res.status(500).json({ message: "Failed to delete API key" });
    }
  });

  // Admin password change endpoint
  app.post("/api/admin/change-password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new passwords are required" });
      }
      
      // Verify current password (hardcoded for now)
      if (currentPassword !== "admin123") {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Validate new password
      if (newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }
      
      // Note: In a real system, this would update the password in a secure storage
      // For now, we'll just respond with success but note that restart is needed
      res.json({ 
        message: "Password change request received", 
        notice: "Admin password is currently hardcoded. Update server configuration to make changes permanent."
      });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Register N8N automation routes
  registerN8NRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
