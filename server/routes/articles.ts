import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertArticleSchema } from "@shared/schema";
import { 
  asyncHandler, 
  successResponse, 
  ValidationError, 
  NotFoundError 
} from "../errors";
import { 
  DTOTransformer, 
  ArticleListDTO, 
  ArticleDetailDTO, 
  ArticleAdminDTO 
} from "../dtos";
import { cacheService, CACHE_TTL, cacheInvalidation } from "../cache";

export function createArticlesRoutes() {
  const router = Router();

  // Import authentication utilities and email automation
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

  // Get articles with enhanced pagination and caching
  router.get("/", asyncHandler(async (req: Request, res: Response) => {
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

    // Generate cache key
    const cacheKey = cacheService.generateArticleKey(options);
    const shouldReturnPaginated = paginated === "true" || cursor || parsedOffset > 0;

    // Try to get from cache first
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      // Add cache headers
      res.set({
        'Cache-Control': 'public, max-age=300',
        'X-Cache': 'HIT',
        'ETag': `"${cacheKey}-cached"`
      });
      
      return res.json(cachedResult);
    }

    if (shouldReturnPaginated) {
      // Return paginated response for explicit pagination requests
      const result = await storage.getArticlesWithPagination(options);
      
      // Transform to DTOs
      const articleDTOs: ArticleListDTO[] = result.articles.map(article => 
        DTOTransformer.toArticleListDTO(article)
      );
      
      const response = DTOTransformer.createPaginatedResponse(
        articleDTOs,
        result.total,
        parsedLimit,
        parsedOffset,
        result.nextCursor
      );

      // Cache the result
      cacheService.set(cacheKey, response, CACHE_TTL.ARTICLES_LIST);

      // Add cache headers
      res.set({
        'Cache-Control': 'public, max-age=300',
        'X-Cache': 'MISS',
        'ETag': `"${cacheKey}-${result.total}"`
      });

      res.json(response);
    } else {
      // Return direct array for backward compatibility
      const articles = await storage.getArticles(options);
      
      // Transform to DTOs
      const articleDTOs: ArticleListDTO[] = articles.map(article => 
        DTOTransformer.toArticleListDTO(article)
      );

      // Cache the result
      cacheService.set(cacheKey, articleDTOs, CACHE_TTL.ARTICLES_LIST);

      // Add cache headers
      res.set({
        'Cache-Control': 'public, max-age=300',
        'X-Cache': 'MISS',
        'ETag': `"${cacheKey}-${articles.length}"`
      });

      res.json(articleDTOs);
    }
  }));

  // Get article by ID (for editing)
  router.get("/:id(\\d+)", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid article ID");
    }
    
    const cacheKey = cacheService.generateItemKey('article', id);
    
    // Try cache first
    const cachedArticle = cacheService.get(cacheKey);
    if (cachedArticle) {
      res.set({
        'Cache-Control': 'public, max-age=600',
        'X-Cache': 'HIT'
      });
      return successResponse(res, cachedArticle, "Article retrieved successfully");
    }
    
    const article = await storage.getArticleById(id);
    if (!article) {
      throw new NotFoundError("Article");
    }
    
    // Transform to DTO (admin view includes all fields)
    const articleDTO: ArticleAdminDTO = DTOTransformer.toArticleAdminDTO(article);
    
    // Cache the result
    cacheService.set(cacheKey, articleDTO, CACHE_TTL.ARTICLE_DETAIL);
    
    res.set({
      'Cache-Control': 'public, max-age=600',
      'X-Cache': 'MISS'
    });
    
    successResponse(res, articleDTO, "Article retrieved successfully");
  }));

  // Get article by slug (for public viewing)
  router.get("/:slug", asyncHandler(async (req: Request, res: Response) => {
    const cacheKey = cacheService.generateItemKey('article-slug', req.params.slug);
    
    // Try cache first
    const cachedArticle = cacheService.get(cacheKey);
    if (cachedArticle) {
      res.set({
        'Cache-Control': 'public, max-age=600',
        'X-Cache': 'HIT'
      });
      return successResponse(res, cachedArticle, "Article retrieved successfully");
    }
    
    const article = await storage.getArticleBySlug(req.params.slug);
    if (!article) {
      throw new NotFoundError("Article");
    }
    
    // Transform to DTO (public view)
    const articleDTO: ArticleDetailDTO = DTOTransformer.toArticleDetailDTO(article);
    
    // Cache the result
    cacheService.set(cacheKey, articleDTO, CACHE_TTL.ARTICLE_DETAIL);
    
    res.set({
      'Cache-Control': 'public, max-age=600',
      'X-Cache': 'MISS'
    });
    
    successResponse(res, articleDTO, "Article retrieved successfully");
  }));

  // Create article (admin only)
  router.post("/", async (req: Request, res: Response, next) => {
    const { requireAuth, requireAdmin } = await getAuthUtils();
    
    return requireAuth(req, res, () => {
      return requireAdmin(req, res, () => {
        return asyncHandler(async (req: Request, res: Response) => {
          const articleData = insertArticleSchema.parse(req.body);
          const article = await storage.createArticle(articleData);
          
          // Invalidate article caches after creation
          cacheInvalidation.articles();
          
          // Auto-trigger article notification if featured
          if (article.featured) {
            try {
              const emailAuto = await getEmailAutomation();
              await emailAuto.scheduleArticleNotification(article.id);
            } catch (emailError) {
              console.error("Failed to schedule article notification:", emailError);
              // Don't fail the article creation if email scheduling fails
            }
          }
          
          // Transform to DTO for response
          const articleDTO: ArticleAdminDTO = DTOTransformer.toArticleAdminDTO(article);
          
          successResponse(res, articleDTO, "Article created successfully", 201);
        })(req, res, next);
      });
    });
  });

  // Update article (admin only)
  router.put("/:id", async (req: Request, res: Response, next) => {
    const { requireAuth, requireAdmin } = await getAuthUtils();
    
    return requireAuth(req, res, () => {
      return requireAdmin(req, res, () => {
        return asyncHandler(async (req: Request, res: Response) => {
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
          
          // Invalidate article caches after update
          cacheInvalidation.articles();
          
          // Transform to DTO for response
          const articleDTO: ArticleAdminDTO = DTOTransformer.toArticleAdminDTO(updatedArticle);
          
          console.log(`Article ${id} updated successfully`);
          successResponse(res, articleDTO, "Article updated successfully");
        })(req, res, next);
      });
    });
  });

  // Delete article (admin only)
  router.delete("/:id", async (req: Request, res: Response, next) => {
    const { requireAuth, requireAdmin } = await getAuthUtils();
    
    return requireAuth(req, res, () => {
      return requireAdmin(req, res, () => {
        return asyncHandler(async (req: Request, res: Response) => {
          const id = parseInt(req.params.id);
          if (isNaN(id)) {
            throw new ValidationError("Invalid article ID");
          }
          
          await storage.deleteArticle(id);
          
          // Invalidate article caches after deletion
          cacheInvalidation.articles();
          
          res.status(204).send();
        })(req, res, next);
      });
    });
  });

  return router;
}