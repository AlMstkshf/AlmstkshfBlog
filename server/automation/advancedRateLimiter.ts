interface RateLimitRule {
  maxRequests: number;
  windowMs: number;
  priority: 'high' | 'medium' | 'low';
}

interface RequestInfo {
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
  source: string;
}

export class AdvancedRateLimiter {
  private requests: Map<string, RequestInfo[]> = new Map();
  private rules: Map<string, RateLimitRule> = new Map();
  
  constructor() {
    this.initializeRules();
    this.startCleanupTimer();
  }

  private initializeRules(): void {
    // NewsData.io API limits
    this.rules.set('newsdata', {
      maxRequests: 200,
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      priority: 'high'
    });

    // OpenAI API limits (conservative)
    this.rules.set('openai', {
      maxRequests: 50,
      windowMs: 60 * 60 * 1000, // 1 hour
      priority: 'high'
    });

    // Database operations
    this.rules.set('database', {
      maxRequests: 1000,
      windowMs: 60 * 1000, // 1 minute
      priority: 'medium'
    });

    // General API operations
    this.rules.set('general', {
      maxRequests: 100,
      windowMs: 60 * 1000, // 1 minute
      priority: 'low'
    });
  }

  async checkRateLimit(
    key: string, 
    source: string = 'general', 
    priority: 'high' | 'medium' | 'low' = 'low'
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    const rule = this.rules.get(source);
    if (!rule) {
      return { allowed: true };
    }

    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Clean old requests outside the window
    const validRequests = requests.filter(
      req => now - req.timestamp < rule.windowMs
    );

    // Check if limit exceeded
    if (validRequests.length >= rule.maxRequests) {
      const oldestRequest = validRequests[0];
      const retryAfter = rule.windowMs - (now - oldestRequest.timestamp);
      
      return { 
        allowed: false, 
        retryAfter: Math.ceil(retryAfter / 1000) // seconds
      };
    }

    // Add current request
    validRequests.push({
      timestamp: now,
      priority,
      source
    });

    this.requests.set(key, validRequests);
    return { allowed: true };
  }

  async waitForSlot(
    key: string, 
    source: string = 'general',
    priority: 'high' | 'medium' | 'low' = 'low'
  ): Promise<void> {
    const check = await this.checkRateLimit(key, source, priority);
    
    if (!check.allowed && check.retryAfter) {
      console.log(`Rate limit hit for ${source}. Waiting ${check.retryAfter}s...`);
      await this.delay(check.retryAfter * 1000);
      
      // Recursive check after waiting
      return this.waitForSlot(key, source, priority);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getRateLimitStatus(key: string): {
    source: string;
    requests: number;
    maxRequests: number;
    windowMs: number;
    resetTime: number;
  }[] {
    const requests = this.requests.get(key) || [];
    const now = Date.now();
    
    return Array.from(this.rules.entries()).map(([source, rule]) => {
      const sourceRequests = requests.filter(req => 
        req.source === source && 
        now - req.timestamp < rule.windowMs
      );
      
      const oldestRequest = sourceRequests[0];
      const resetTime = oldestRequest 
        ? oldestRequest.timestamp + rule.windowMs
        : now;

      return {
        source,
        requests: sourceRequests.length,
        maxRequests: rule.maxRequests,
        windowMs: rule.windowMs,
        resetTime
      };
    });
  }

  private startCleanupTimer(): void {
    // Clean expired requests every 5 minutes
    setInterval(() => {
      const now = Date.now();
      
      for (const [key, requests] of this.requests.entries()) {
        const validRequests = requests.filter(req => {
          // Keep requests that are still within any rule window
          return Array.from(this.rules.values()).some(rule => 
            now - req.timestamp < rule.windowMs
          );
        });
        
        if (validRequests.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, validRequests);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // For priority-based queuing
  async queueRequest<T>(
    operation: () => Promise<T>,
    key: string,
    source: string = 'general',
    priority: 'high' | 'medium' | 'low' = 'low'
  ): Promise<T> {
    await this.waitForSlot(key, source, priority);
    return operation();
  }
}

export const rateLimiter = new AdvancedRateLimiter();