import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertApiKeySchema } from "@shared/schema";
import { 
  asyncHandler, 
  successResponse, 
  ValidationError, 
  AuthenticationError 
} from "../errors";
import { cacheService, cacheInvalidation } from "../cache";
import { getPerformanceStats, resetPerformanceStats } from "../middleware/performance";

export function createAdminRoutes() {
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

  // Middleware to ensure admin authentication for all routes
  router.use(async (req: Request, res: Response, next) => {
    const { requireAuth, requireAdmin } = await getAuthUtils();
    
    return requireAuth(req, res, () => {
      return requireAdmin(req, res, next);
    });
  });

  // Admin Settings API
  router.get("/settings", asyncHandler(async (req, res) => {
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

  router.post("/settings", asyncHandler(async (req, res) => {
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

  // Content analysis endpoint (AI disabled)
  router.post("/fix-arabic-content", asyncHandler(async (req, res) => {
    const { contentFixer } = await import('../automation/contentFixer-disabled');
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
  router.get("/content-analysis", asyncHandler(async (req, res) => {
    const { contentFixer } = await import('../automation/contentFixer-disabled');
    const analysis = await contentFixer.fixIncompleteArabicContent();
    successResponse(res, analysis, "Content analysis retrieved successfully");
  }));

  // API Key management routes
  router.get("/api-keys", asyncHandler(async (req, res) => {
    const apiKeys = await storage.getApiKeys();
    // Don't expose actual key values in response, only metadata
    const safeApiKeys = apiKeys.map(key => ({
      ...key,
      keyValue: key.keyValue ? '••••••••••••' + key.keyValue.slice(-4) : null,
    }));
    successResponse(res, safeApiKeys, "API keys retrieved successfully");
  }));

  router.post("/api-keys", asyncHandler(async (req, res) => {
    const apiKeyData = insertApiKeySchema.parse(req.body);
    const newApiKey = await storage.createApiKey(apiKeyData);
    
    const safeApiKey = { 
      ...newApiKey,
      keyValue: newApiKey.keyValue ? '••••••••••••' + newApiKey.keyValue.slice(-4) : null,
    };
    successResponse(res, safeApiKey, "API key created successfully", 201);
  }));

  router.put("/api-keys/:id", asyncHandler(async (req, res) => {
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

  router.delete("/api-keys/:id", asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ValidationError("Invalid API key ID");
    }
    
    await storage.deleteApiKey(id);
    successResponse(res, null, "API key deleted successfully");
  }));

  // Admin password change endpoint
  router.post("/change-password", asyncHandler(async (req, res) => {
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

  // Cache monitoring endpoints
  router.get("/cache/stats", asyncHandler(async (req, res) => {
    const cacheStats = cacheService.getStats();
    const performanceStats = getPerformanceStats();
    
    const combinedStats = {
      cache: cacheStats,
      performance: performanceStats,
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100, // MB
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100, // MB
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100, // MB
        external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100, // MB
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
    
    successResponse(res, combinedStats, "Cache and performance statistics retrieved successfully");
  }));

  router.post("/cache/clear", asyncHandler(async (req, res) => {
    const { pattern } = req.body;
    
    let clearedCount = 0;
    
    if (pattern) {
      // Clear specific pattern
      if (pattern === 'articles') {
        cacheInvalidation.articles();
        clearedCount = 1; // Pattern-based clearing
      } else if (pattern === 'categories') {
        cacheInvalidation.categories();
        clearedCount = 1;
      } else if (pattern === 'downloads') {
        cacheInvalidation.downloads();
        clearedCount = 1;
      } else if (pattern === 'search') {
        cacheInvalidation.search();
        clearedCount = 1;
      } else {
        // Custom pattern
        clearedCount = cacheService.invalidatePattern(pattern);
      }
    } else {
      // Clear all cache
      cacheInvalidation.all();
      clearedCount = -1; // Indicates full clear
    }
    
    const result = {
      pattern: pattern || 'all',
      clearedCount,
      timestamp: new Date().toISOString()
    };
    
    successResponse(res, result, `Cache cleared successfully${pattern ? ` for pattern: ${pattern}` : ''}`);
  }));

  router.post("/performance/reset", asyncHandler(async (req, res) => {
    resetPerformanceStats();
    
    const result = {
      message: "Performance statistics reset successfully",
      timestamp: new Date().toISOString()
    };
    
    successResponse(res, result, "Performance statistics reset successfully");
  }));

  // System health endpoint
  router.get("/system/health", asyncHandler(async (req, res) => {
    const cacheStats = cacheService.getStats();
    const performanceStats = getPerformanceStats();
    const memoryUsage = process.memoryUsage();
    
    // Calculate health score based on various metrics
    let healthScore = 100;
    
    // Deduct points for high memory usage (>500MB)
    const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;
    if (memoryUsageMB > 500) {
      healthScore -= Math.min(30, (memoryUsageMB - 500) / 10);
    }
    
    // Deduct points for low cache hit rate (<50%)
    if (cacheStats.hitRate < 50) {
      healthScore -= (50 - cacheStats.hitRate) / 2;
    }
    
    // Deduct points for slow average response time (>500ms)
    if (performanceStats.averageTime > 500) {
      healthScore -= Math.min(20, (performanceStats.averageTime - 500) / 50);
    }
    
    // Deduct points for high percentage of slow requests (>10%)
    if (performanceStats.slowRequestPercentage > 10) {
      healthScore -= (performanceStats.slowRequestPercentage - 10) * 2;
    }
    
    healthScore = Math.max(0, Math.round(healthScore));
    
    const healthStatus = healthScore >= 80 ? 'excellent' : 
                        healthScore >= 60 ? 'good' : 
                        healthScore >= 40 ? 'fair' : 'poor';
    
    const systemHealth = {
      score: healthScore,
      status: healthStatus,
      uptime: process.uptime(),
      memory: {
        usage: Math.round(memoryUsageMB * 100) / 100,
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      },
      cache: {
        hitRate: cacheStats.hitRate,
        entries: cacheStats.entries,
        memoryUsage: Math.round(cacheStats.memoryUsage / 1024 * 100) / 100 // KB
      },
      performance: {
        averageResponseTime: Math.round(performanceStats.averageTime * 100) / 100,
        totalRequests: performanceStats.totalRequests,
        slowRequestPercentage: performanceStats.slowRequestPercentage
      },
      recommendations: []
    };
    
    // Add recommendations based on health metrics
    if (memoryUsageMB > 500) {
      systemHealth.recommendations.push("Consider restarting the server to free up memory");
    }
    if (cacheStats.hitRate < 50 && cacheStats.entries > 0) {
      systemHealth.recommendations.push("Cache hit rate is low, consider adjusting cache TTL settings");
    }
    if (performanceStats.averageTime > 1000) {
      systemHealth.recommendations.push("Average response time is high, consider optimizing database queries");
    }
    if (performanceStats.slowRequestPercentage > 20) {
      systemHealth.recommendations.push("High percentage of slow requests detected, investigate bottlenecks");
    }
    
    successResponse(res, systemHealth, "System health status retrieved successfully");
  }));

  return router;
}