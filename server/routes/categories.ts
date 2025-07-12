import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertCategorySchema } from "@shared/schema";
import { 
  asyncHandler, 
  successResponse, 
  NotFoundError 
} from "../errors";
import { 
  DTOTransformer, 
  CategoryListDTO, 
  CategoryDetailDTO 
} from "../dtos";
import { cacheService, CACHE_TTL, cacheInvalidation } from "../cache";

export function createCategoriesRoutes() {
  const router = Router();

  // Import authentication utilities dynamically
  let authUtils: any;
  
  const getAuthUtils = async () => {
    if (!authUtils) {
      authUtils = await import("../auth");
    }
    return authUtils;
  };

  // Get all categories with caching
  router.get("/", asyncHandler(async (req: Request, res: Response) => {
    const cacheKey = 'categories:all';
    
    // Try cache first
    const cachedCategories = cacheService.get(cacheKey);
    if (cachedCategories) {
      res.set({
        'Cache-Control': 'public, max-age=1800', // 30 minutes
        'X-Cache': 'HIT'
      });
      return successResponse(res, cachedCategories, "Categories retrieved successfully");
    }
    
    const categories = await storage.getCategories();
    
    // Transform to DTOs
    const categoryDTOs: CategoryListDTO[] = categories.map(category => 
      DTOTransformer.toCategoryListDTO(category)
    );
    
    // Cache the result
    cacheService.set(cacheKey, categoryDTOs, CACHE_TTL.CATEGORIES_LIST);
    
    res.set({
      'Cache-Control': 'public, max-age=1800',
      'X-Cache': 'MISS'
    });
    
    successResponse(res, categoryDTOs, "Categories retrieved successfully");
  }));

  // Get category by slug with caching
  router.get("/:slug", asyncHandler(async (req: Request, res: Response) => {
    const cacheKey = cacheService.generateItemKey('category-slug', req.params.slug);
    
    // Try cache first
    const cachedCategory = cacheService.get(cacheKey);
    if (cachedCategory) {
      res.set({
        'Cache-Control': 'public, max-age=1800',
        'X-Cache': 'HIT'
      });
      return successResponse(res, cachedCategory, "Category retrieved successfully");
    }
    
    const category = await storage.getCategoryBySlug(req.params.slug);
    if (!category) {
      throw new NotFoundError("Category");
    }
    
    // Transform to DTO
    const categoryDTO: CategoryDetailDTO = DTOTransformer.toCategoryDetailDTO(category);
    
    // Cache the result
    cacheService.set(cacheKey, categoryDTO, CACHE_TTL.CATEGORY_DETAIL);
    
    res.set({
      'Cache-Control': 'public, max-age=1800',
      'X-Cache': 'MISS'
    });
    
    successResponse(res, categoryDTO, "Category retrieved successfully");
  }));

  // Create category (admin only)
  router.post("/", async (req: Request, res: Response, next) => {
    const { requireAuth, requireAdmin } = await getAuthUtils();
    
    return requireAuth(req, res, () => {
      return requireAdmin(req, res, () => {
        return asyncHandler(async (req: Request, res: Response) => {
          const categoryData = insertCategorySchema.parse(req.body);
          const category = await storage.createCategory(categoryData);
          
          // Invalidate category caches after creation
          cacheInvalidation.categories();
          
          // Transform to DTO for response
          const categoryDTO: CategoryDetailDTO = DTOTransformer.toCategoryDetailDTO(category);
          
          successResponse(res, categoryDTO, "Category created successfully", 201);
        })(req, res, next);
      });
    });
  });

  return router;
}