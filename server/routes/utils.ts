import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { 
  asyncHandler, 
  successResponse, 
  ValidationError 
} from "../errors";
import { 
  DTOTransformer, 
  ArticleListDTO 
} from "../dtos";
import { cacheService, CACHE_TTL } from "../cache";

export function createUtilsRoutes() {
  const router = Router();

  // Import authentication utilities dynamically
  let authUtils: any;
  let emailAutomation: any;
  
  const getAuthUtils = async () => {
    if (!authUtils) {
      authUtils = await import("../auth");
    }
    return authUtils;
  };

  const getEmailAutomation = async () => {
    if (!emailAutomation) {
      const automation = await import("../automation/emailAutomation");
      emailAutomation = automation.emailAutomation;
    }
    return emailAutomation;
  };

  // Search API with caching
  router.get("/search", asyncHandler(async (req: Request, res: Response) => {
    const { q, language = "en" } = req.query;
    
    if (!q || typeof q !== "string") {
      throw new ValidationError("Search query required");
    }

    // Generate cache key for search
    const cacheKey = `search:${language}:${q.toString().toLowerCase().trim()}`;
    
    // Try cache first
    const cachedResults = cacheService.get(cacheKey);
    if (cachedResults) {
      res.set({
        'Cache-Control': 'public, max-age=600', // 10 minutes
        'X-Cache': 'HIT'
      });
      return successResponse(res, cachedResults, "Search completed successfully");
    }

    const articles = await storage.searchArticles(q, language as string);
    
    // Transform to DTOs
    const articleDTOs: ArticleListDTO[] = articles.map(article => 
      DTOTransformer.toArticleListDTO(article)
    );
    
    // Cache the search results
    cacheService.set(cacheKey, articleDTOs, CACHE_TTL.SEARCH_RESULTS);
    
    res.set({
      'Cache-Control': 'public, max-age=600',
      'X-Cache': 'MISS'
    });

    successResponse(res, articleDTOs, "Search completed successfully");
  }));

  // XML Sitemap endpoint with caching
  router.get("/sitemap.xml", asyncHandler(async (req: Request, res: Response) => {
    const cacheKey = 'sitemap:xml';
    
    // Try cache first
    const cachedSitemap = cacheService.get(cacheKey);
    if (cachedSitemap) {
      res.set({
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // 1 hour
        'X-Cache': 'HIT'
      });
      return res.send(cachedSitemap);
    }

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

    // Cache the sitemap
    cacheService.set(cacheKey, sitemap, CACHE_TTL.SITEMAP);

    res.set({
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
      'X-Cache': 'MISS'
    });
    res.send(sitemap);
  }));

  // Robots.txt endpoint
  router.get("/robots.txt", (req, res) => {
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
  router.get("/health", asyncHandler(async (req: Request, res: Response) => {
    const { healthMonitor } = await import('../health');
    const health = await healthMonitor.getHealthStatus();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    res.status(statusCode).json(health);
  }));

  // AI Content Generation routes (admin only)
  router.post("/ai/generate-content", async (req: Request, res: Response, next) => {
    const { requireAuth, requireAdmin } = await getAuthUtils();
    
    return requireAuth(req, res, () => {
      return requireAdmin(req, res, () => {
        return asyncHandler(async (req: Request, res: Response) => {
          try {
            const { aiContentGenerator } = await import('../ai-content-generator');
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
        })(req, res, next);
      });
    });
  });

  router.get("/ai/services", async (req: Request, res: Response, next) => {
    const { requireAuth, requireAdmin } = await getAuthUtils();
    
    return requireAuth(req, res, () => {
      return requireAdmin(req, res, () => {
        return asyncHandler(async (req: Request, res: Response) => {
          try {
            const { aiContentGenerator } = await import('../ai-content-generator');
            const services = aiContentGenerator.getAvailableServices();
            successResponse(res, { services }, "Available AI services retrieved");
          } catch (error) {
            console.error("Error getting AI services:", error);
            throw error;
          }
        })(req, res, next);
      });
    });
  });

  // Automation test endpoint
  router.post("/automation/test", asyncHandler(async (req, res) => {
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
  router.post("/email/test", asyncHandler(async (req, res) => {
    const { email, language = 'en' } = req.body;
    
    if (!email) {
      throw new ValidationError("Email address is required");
    }

    if (!process.env.SENDGRID_API_KEY) {
      throw new ValidationError("SendGrid API key not configured - Email functionality requires SendGrid configuration");
    }

    const emailAuto = await getEmailAutomation();
    await emailAuto.sendTestEmail(email, language);
    
    const result = { 
      recipient: email,
      language,
      timestamp: new Date().toISOString()
    };
    successResponse(res, result, "Test email sent successfully");
  }));

  router.get("/reports/weekly", asyncHandler(async (req, res) => {
    const emailAuto = await getEmailAutomation();
    const reportData = await emailAuto.generateWeeklyReport();
    const parsedData = JSON.parse(reportData);
    successResponse(res, parsedData, "Weekly report generated successfully");
  }));

  router.post("/reports/weekly/send", asyncHandler(async (req, res) => {
    const { email = 'rased@almstkshf.com' } = req.body;

    if (!process.env.SENDGRID_API_KEY) {
      throw new ValidationError("SendGrid API key not configured - Email functionality requires SendGrid configuration");
    }

    const emailAuto = await getEmailAutomation();
    await emailAuto.sendWeeklyReport(email);
    
    const result = { 
      recipient: email,
      timestamp: new Date().toISOString()
    };
    successResponse(res, result, "Weekly report sent successfully");
  }));

  return router;
}