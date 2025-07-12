// Performance middleware for compression, response time monitoring, and optimization
import { Request, Response, NextFunction } from 'express';
import compression from 'compression';

// Response time tracking interface
interface ResponseTimeStats {
  totalRequests: number;
  totalTime: number;
  averageTime: number;
  slowRequests: number; // requests > 1000ms
  fastRequests: number; // requests < 100ms
  endpoints: Map<string, {
    count: number;
    totalTime: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
  }>;
}

// Global stats tracking
const responseTimeStats: ResponseTimeStats = {
  totalRequests: 0,
  totalTime: 0,
  averageTime: 0,
  slowRequests: 0,
  fastRequests: 0,
  endpoints: new Map()
};

// Compression middleware with optimized settings
export const compressionMiddleware = compression({
  // Only compress responses that are larger than 1kb
  threshold: 1024,
  
  // Compression level (1-9, 6 is default, good balance of speed/compression)
  level: 6,
  
  // Only compress specific content types
  filter: (req: Request, res: Response) => {
    // Don't compress if the request includes a cache-control: no-transform directive
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    
    // Use compression filter function
    return compression.filter(req, res);
  },
  
  // Memory level (1-9, 8 is default)
  memLevel: 8,
  
  // Window bits (9-15, 15 is default)
  windowBits: 15
});

// Response time monitoring middleware
export const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const endpoint = `${req.method} ${req.path}`;
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Update global stats
    responseTimeStats.totalRequests++;
    responseTimeStats.totalTime += responseTime;
    responseTimeStats.averageTime = responseTimeStats.totalTime / responseTimeStats.totalRequests;
    
    // Track slow/fast requests
    if (responseTime > 1000) {
      responseTimeStats.slowRequests++;
    } else if (responseTime < 100) {
      responseTimeStats.fastRequests++;
    }
    
    // Update endpoint-specific stats
    const endpointStats = responseTimeStats.endpoints.get(endpoint) || {
      count: 0,
      totalTime: 0,
      averageTime: 0,
      minTime: Infinity,
      maxTime: 0
    };
    
    endpointStats.count++;
    endpointStats.totalTime += responseTime;
    endpointStats.averageTime = endpointStats.totalTime / endpointStats.count;
    endpointStats.minTime = Math.min(endpointStats.minTime, responseTime);
    endpointStats.maxTime = Math.max(endpointStats.maxTime, responseTime);
    
    responseTimeStats.endpoints.set(endpoint, endpointStats);
    
    // Log slow requests for debugging
    if (responseTime > 2000) {
      console.warn(`Slow request detected: ${endpoint} took ${responseTime}ms`);
    }
    
    // Add response time header for debugging
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Security headers middleware
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy (adjust as needed for your app)
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self';"
  );
  
  next();
};

// Cache control middleware for static assets
export const cacheControlMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Set cache headers based on request path
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    // Static assets - cache for 1 year
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (req.path.startsWith('/api/')) {
    // API responses - no cache by default (individual routes can override)
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  } else {
    // HTML pages - cache for 5 minutes
    res.setHeader('Cache-Control', 'public, max-age=300');
  }
  
  next();
};

// Request size limiting middleware
export const requestSizeLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Add request size header for monitoring
  const contentLength = req.headers['content-length'];
  if (contentLength) {
    const sizeInMB = parseInt(contentLength) / (1024 * 1024);
    if (sizeInMB > 10) {
      console.warn(`Large request detected: ${req.method} ${req.path} - ${sizeInMB.toFixed(2)}MB`);
    }
  }
  
  next();
};

// Get performance statistics
export const getPerformanceStats = () => {
  const stats = { ...responseTimeStats };
  
  // Convert Map to object for JSON serialization
  const endpointsObj: Record<string, any> = {};
  for (const [endpoint, data] of responseTimeStats.endpoints.entries()) {
    endpointsObj[endpoint] = {
      ...data,
      minTime: data.minTime === Infinity ? 0 : data.minTime
    };
  }
  
  return {
    ...stats,
    endpoints: endpointsObj,
    slowRequestPercentage: stats.totalRequests > 0 
      ? Math.round((stats.slowRequests / stats.totalRequests) * 100 * 100) / 100 
      : 0,
    fastRequestPercentage: stats.totalRequests > 0 
      ? Math.round((stats.fastRequests / stats.totalRequests) * 100 * 100) / 100 
      : 0
  };
};

// Reset performance statistics
export const resetPerformanceStats = () => {
  responseTimeStats.totalRequests = 0;
  responseTimeStats.totalTime = 0;
  responseTimeStats.averageTime = 0;
  responseTimeStats.slowRequests = 0;
  responseTimeStats.fastRequests = 0;
  responseTimeStats.endpoints.clear();
};

// Health check middleware
export const healthCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/health' || req.path === '/api/health') {
    const stats = getPerformanceStats();
    const memoryUsage = process.memoryUsage();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100, // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
        external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100, // MB
      },
      performance: {
        totalRequests: stats.totalRequests,
        averageResponseTime: Math.round(stats.averageTime * 100) / 100,
        slowRequests: stats.slowRequests,
        slowRequestPercentage: stats.slowRequestPercentage
      }
    });
    return;
  }
  
  next();
};

// Combined performance middleware setup
export const setupPerformanceMiddleware = (app: any) => {
  // Health check should be first
  app.use(healthCheckMiddleware);
  
  // Security headers
  app.use(securityHeadersMiddleware);
  
  // Cache control
  app.use(cacheControlMiddleware);
  
  // Request size monitoring
  app.use(requestSizeLimitMiddleware);
  
  // Response time monitoring
  app.use(responseTimeMiddleware);
  
  // Compression (should be last in the chain)
  app.use(compressionMiddleware);
};