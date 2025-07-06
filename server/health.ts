import { db } from "./db";
import { articles, categories } from "../shared/schema";
import { sql } from "drizzle-orm";

export interface HealthMetrics {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: {
    connected: boolean;
    responseTime: number;
    connectionCount: number;
  };
  performance: {
    avgResponseTime: number;
    slowQueries: number;
  };
  content: {
    totalArticles: number;
    publishedArticles: number;
    categoriesCount: number;
  };
  timestamp: string;
}

class HealthMonitor {
  private metrics: HealthMetrics[] = [];
  private readonly maxMetrics = 100;

  async getHealthStatus(): Promise<HealthMetrics> {
    const startTime = Date.now();
    
    try {
      // Test database connectivity and get basic stats
      const dbTest = await db.execute(sql`SELECT 1 as test`);
      const dbResponseTime = Date.now() - startTime;

      // Get connection count
      const connectionResult = await db.execute(
        sql`SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'`
      );
      
      // Get content statistics
      const articleStats = await db.execute(
        sql`SELECT 
          COUNT(*) as total_articles,
          COUNT(CASE WHEN published = true THEN 1 END) as published_articles
        FROM articles`
      );
      
      const categoryStats = await db.execute(
        sql`SELECT COUNT(*) as categories_count FROM categories`
      );

      const metrics: HealthMetrics = {
        status: dbResponseTime < 100 ? 'healthy' : dbResponseTime < 500 ? 'degraded' : 'unhealthy',
        database: {
          connected: !!dbTest.rows[0],
          responseTime: dbResponseTime,
          connectionCount: Number((connectionResult.rows[0] as any)?.count) || 0,
        },
        performance: {
          avgResponseTime: this.calculateAverageResponseTime(),
          slowQueries: this.countSlowQueries(),
        },
        content: {
          totalArticles: Number((articleStats.rows[0] as any)?.total_articles) || 0,
          publishedArticles: Number((articleStats.rows[0] as any)?.published_articles) || 0,
          categoriesCount: Number((categoryStats.rows[0] as any)?.categories_count) || 0,
        },
        timestamp: new Date().toISOString(),
      };

      // Store metrics for trend analysis
      this.addMetric(metrics);
      
      return metrics;
    } catch (error) {
      console.error('Health check failed:', error);
      
      return {
        status: 'unhealthy',
        database: {
          connected: false,
          responseTime: Date.now() - startTime,
          connectionCount: 0,
        },
        performance: {
          avgResponseTime: 0,
          slowQueries: 0,
        },
        content: {
          totalArticles: 0,
          publishedArticles: 0,
          categoriesCount: 0,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  private addMetric(metric: HealthMetrics): void {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  private calculateAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0;
    const sum = this.metrics.reduce((acc, m) => acc + m.database.responseTime, 0);
    return Math.round(sum / this.metrics.length);
  }

  private countSlowQueries(): number {
    return this.metrics.filter(m => m.database.responseTime > 500).length;
  }

  getMetricsHistory(): HealthMetrics[] {
    return [...this.metrics];
  }
}

export const healthMonitor = new HealthMonitor();