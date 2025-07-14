import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Trash2, 
  Activity, 
  Database, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CacheStats {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  cacheSize: number;
  memoryUsage: number;
  avgResponseTime: number;
  lastUpdated: string;
}

interface CacheEntry {
  key: string;
  size: number;
  ttl: number;
  hitCount: number;
  lastAccessed: string;
  createdAt: string;
}

interface CacheMetrics {
  stats: CacheStats;
  entries: CacheEntry[];
  performance: {
    slowQueries: Array<{
      query: string;
      avgTime: number;
      count: number;
    }>;
    popularKeys: Array<{
      key: string;
      hits: number;
      percentage: number;
    }>;
  };
}

export function CacheMonitor() {
  const [metrics, setMetrics] = useState<CacheMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/cache/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cache metrics');
      }
      
      const data = await response.json();
      setMetrics(data.data);
    } catch (error) {
      console.error('Error fetching cache metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cache metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const clearCache = async (key?: string) => {
    try {
      const url = key ? `/api/admin/cache/clear/${encodeURIComponent(key)}` : '/api/admin/cache/clear';
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear cache');
      }
      
      toast({
        title: "Success",
        description: key ? `Cache key "${key}" cleared` : "All cache cleared",
        variant: "default"
      });
      
      fetchMetrics();
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: "Error",
        description: "Failed to clear cache",
        variant: "destructive"
      });
    }
  };

  const refreshMetrics = () => {
    setRefreshing(true);
    fetchMetrics();
  };

  useEffect(() => {
    fetchMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getHealthStatus = (hitRate: number) => {
    if (hitRate >= 80) return { status: 'excellent', color: 'text-green-600', icon: CheckCircle };
    if (hitRate >= 60) return { status: 'good', color: 'text-blue-600', icon: Activity };
    if (hitRate >= 40) return { status: 'fair', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'poor', color: 'text-red-600', icon: AlertTriangle };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cache Monitor</CardTitle>
          <CardDescription>Loading cache metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cache Monitor</CardTitle>
          <CardDescription>Failed to load cache metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchMetrics}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  const health = getHealthStatus(metrics.stats.hitRate);
  const HealthIcon = health.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cache Monitor</h2>
          <p className="text-muted-foreground">
            Real-time cache performance and management
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => clearCache()}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
            <HealthIcon className={`h-4 w-4 ${health.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.stats.hitRate.toFixed(1)}%</div>
            <Progress value={metrics.stats.hitRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.stats.totalRequests} total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(metrics.stats.memoryUsage)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.entries.length} cached entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.stats.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(metrics.stats.lastUpdated).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(metrics.stats.cacheSize)}</div>
            <p className="text-xs text-muted-foreground">
              Miss rate: {metrics.stats.missRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entries">Cache Entries</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="popular">Popular Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Entries</CardTitle>
              <CardDescription>
                Current cached data with TTL and access information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.entries.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No cache entries found</p>
                ) : (
                  metrics.entries.map((entry) => (
                    <div
                      key={entry.key}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium truncate">{entry.key}</div>
                        <div className="text-sm text-muted-foreground">
                          Size: {formatBytes(entry.size)} • 
                          Hits: {entry.hitCount} • 
                          TTL: {formatDuration(entry.ttl)} • 
                          Last accessed: {new Date(entry.lastAccessed).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => clearCache(entry.key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Slow Queries</CardTitle>
              <CardDescription>
                Queries with highest average response times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.performance.slowQueries.map((query, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium truncate">{query.query}</div>
                      <div className="text-sm text-muted-foreground">
                        Executed {query.count} times
                      </div>
                    </div>
                    <Badge variant={query.avgTime > 1000 ? "destructive" : query.avgTime > 500 ? "secondary" : "default"}>
                      {query.avgTime}ms
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Cache Keys</CardTitle>
              <CardDescription>
                Most frequently accessed cache entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.performance.popularKeys.map((key, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium truncate">{key.key}</div>
                      <div className="text-sm text-muted-foreground">
                        {key.hits} hits ({key.percentage.toFixed(1)}% of total)
                      </div>
                    </div>
                    <Progress value={key.percentage} className="w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}