import { Express, Request, Response } from 'express';
import { storage } from './storage';
import { type InsertArticle } from '@shared/schema';

interface N8NArticlePayload {
  titleEn: string;
  titleAr?: string;
  contentEn: string;
  contentAr?: string;
  excerptEn?: string;
  excerptAr?: string;
  categoryId: number;
  authorName: string;
  featuredImage?: string;
  published?: boolean;
  featured?: boolean;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalUrl?: string;
  tags?: string[];
}

interface N8NWebhookAuth {
  apiKey: string;
  source: string;
}

class N8NAutomationService {
  private validApiKeys: Set<string> = new Set();

  constructor() {
    // Initialize with default API keys from environment
    const defaultKey = process.env.N8N_WEBHOOK_API_KEY;
    if (defaultKey) {
      this.validApiKeys.add(defaultKey);
    }
  }

  async addApiKey(apiKey: string): Promise<void> {
    this.validApiKeys.add(apiKey);
    
    // Store in database for persistence
    try {
      await storage.createApiKey({
        serviceName: 'n8n_webhook',
        apiKey: apiKey,
        description: 'N8N Automation Webhook',
        isActive: true
      });
    } catch (error) {
      console.error('Failed to store N8N API key:', error);
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    if (this.validApiKeys.has(apiKey)) {
      return true;
    }

    // Check database for stored API keys
    try {
      const storedKey = await storage.getApiKey('n8n_webhook');
      if (storedKey && storedKey.apiKey === apiKey && storedKey.isActive) {
        this.validApiKeys.add(apiKey);
        return true;
      }
    } catch (error) {
      console.error('Failed to validate API key:', error);
    }

    return false;
  }

  async createArticleFromWebhook(payload: N8NArticlePayload): Promise<any> {
    // Generate slug if not provided
    const slug = payload.slug || this.generateSlug(payload.titleEn || payload.titleAr || '');
    
    // Generate canonical URL if not provided
    const canonicalUrl = payload.canonicalUrl || 
      `${process.env.SITE_URL || 'https://almstkshf.com'}/en/blog/${slug}`;

    const articleData: InsertArticle = {
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
      slug: slug,
      metaTitle: payload.metaTitle || payload.titleEn,
      metaDescription: payload.metaDescription || payload.excerptEn,
      keywords: payload.keywords || null,
      canonicalUrl: canonicalUrl
    };

    return await storage.createArticle(articleData);
  }

  async updateArticleFromWebhook(articleId: number, payload: Partial<N8NArticlePayload>): Promise<any> {
    const updateData: Partial<InsertArticle> = {};

    // Only update provided fields
    if (payload.titleEn !== undefined) updateData.titleEn = payload.titleEn;
    if (payload.titleAr !== undefined) updateData.titleAr = payload.titleAr;
    if (payload.contentEn !== undefined) updateData.contentEn = payload.contentEn;
    if (payload.contentAr !== undefined) updateData.contentAr = payload.contentAr;
    if (payload.excerptEn !== undefined) updateData.excerptEn = payload.excerptEn;
    if (payload.excerptAr !== undefined) updateData.excerptAr = payload.excerptAr;
    if (payload.categoryId !== undefined) updateData.categoryId = payload.categoryId;
    if (payload.authorName !== undefined) updateData.authorName = payload.authorName;
    if (payload.featuredImage !== undefined) updateData.featuredImage = payload.featuredImage;
    if (payload.published !== undefined) updateData.published = payload.published;
    if (payload.featured !== undefined) updateData.featured = payload.featured;
    if (payload.slug !== undefined) updateData.slug = payload.slug;
    if (payload.metaTitle !== undefined) updateData.metaTitle = payload.metaTitle;
    if (payload.metaDescription !== undefined) updateData.metaDescription = payload.metaDescription;
    if (payload.keywords !== undefined) updateData.keywords = payload.keywords;
    if (payload.canonicalUrl !== undefined) updateData.canonicalUrl = payload.canonicalUrl;

    return await storage.updateArticle(articleId, updateData);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async getAutomationSettings(): Promise<{ [key: string]: boolean }> {
    const settings = {
      autoPublish: await storage.getAutomationSetting('auto_publish'),
      autoSEO: await storage.getAutomationSetting('auto_seo'),
      autoSlug: await storage.getAutomationSetting('auto_slug'),
      autoTranslation: await storage.getAutomationSetting('auto_translation'),
      socialSharing: await storage.getAutomationSetting('social_sharing'),
      contentValidation: await storage.getAutomationSetting('content_validation')
    };

    return settings;
  }

  async updateAutomationSettings(settings: { [key: string]: boolean }): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await storage.setAutomationSetting(key, value);
    }
  }
}

const n8nService = new N8NAutomationService();

export function registerN8NRoutes(app: Express): void {
  // Middleware to validate N8N webhook requests
  const validateN8NAuth = async (req: Request, res: Response, next: any) => {
    const apiKey = req.headers['x-api-key'] as string || req.body.apiKey;
    
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API key required',
        message: 'Please provide an API key in the x-api-key header or request body'
      });
    }

    const isValid = await n8nService.validateApiKey(apiKey);
    if (!isValid) {
      return res.status(403).json({ 
        error: 'Invalid API key',
        message: 'The provided API key is not valid or has been revoked'
      });
    }

    next();
  };

  // Create article via N8N webhook
  app.post('/api/n8n/articles', validateN8NAuth, async (req: Request, res: Response) => {
    try {
      const payload = req.body as N8NArticlePayload;
      
      // Validate required fields
      if (!payload.titleEn && !payload.titleAr) {
        return res.status(400).json({ 
          error: 'Validation error',
          message: 'Article must have at least one title (English or Arabic)'
        });
      }

      if (!payload.contentEn && !payload.contentAr) {
        return res.status(400).json({ 
          error: 'Validation error',
          message: 'Article must have content in at least one language'
        });
      }

      if (!payload.categoryId) {
        return res.status(400).json({ 
          error: 'Validation error',
          message: 'Category ID is required'
        });
      }

      const article = await n8nService.createArticleFromWebhook(payload);
      
      // Update API key last used
      await storage.updateApiKeyLastUsed('n8n_webhook');
      
      res.status(201).json({
        success: true,
        article: article,
        message: 'Article created successfully via N8N automation'
      });

    } catch (error) {
      console.error('N8N article creation error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to create article via N8N webhook'
      });
    }
  });

  // Update article via N8N webhook
  app.put('/api/n8n/articles/:id', validateN8NAuth, async (req: Request, res: Response) => {
    try {
      const articleId = parseInt(req.params.id);
      const payload = req.body as Partial<N8NArticlePayload>;

      if (isNaN(articleId)) {
        return res.status(400).json({ 
          error: 'Invalid article ID',
          message: 'Article ID must be a valid number'
        });
      }

      const article = await n8nService.updateArticleFromWebhook(articleId, payload);
      
      // Update API key last used
      await storage.updateApiKeyLastUsed('n8n_webhook');
      
      res.json({
        success: true,
        article: article,
        message: 'Article updated successfully via N8N automation'
      });

    } catch (error) {
      console.error('N8N article update error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to update article via N8N webhook'
      });
    }
  });

  // Get automation settings
  app.get('/api/n8n/settings', validateN8NAuth, async (req: Request, res: Response) => {
    try {
      const settings = await n8nService.getAutomationSettings();
      res.json({
        success: true,
        settings: settings
      });
    } catch (error) {
      console.error('N8N settings fetch error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch automation settings'
      });
    }
  });

  // Update automation settings
  app.post('/api/n8n/settings', validateN8NAuth, async (req: Request, res: Response) => {
    try {
      const settings = req.body.settings as { [key: string]: boolean };
      await n8nService.updateAutomationSettings(settings);
      
      res.json({
        success: true,
        message: 'Automation settings updated successfully'
      });
    } catch (error) {
      console.error('N8N settings update error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to update automation settings'
      });
    }
  });

  // Add new API key (admin only)
  app.post('/api/n8n/api-keys', async (req: Request, res: Response) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ 
          error: 'API key required',
          message: 'Please provide an API key'
        });
      }

      await n8nService.addApiKey(apiKey);
      
      res.json({
        success: true,
        message: 'API key added successfully'
      });
    } catch (error) {
      console.error('N8N API key creation error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to add API key'
      });
    }
  });

  // Health check for N8N integration
  app.get('/api/n8n/health', (req: Request, res: Response) => {
    res.json({
      success: true,
      service: 'N8N Automation Service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      endpoints: {
        createArticle: '/api/n8n/articles',
        updateArticle: '/api/n8n/articles/:id',
        getSettings: '/api/n8n/settings',
        updateSettings: '/api/n8n/settings',
        addApiKey: '/api/n8n/api-keys'
      }
    });
  });
}

export { n8nService };