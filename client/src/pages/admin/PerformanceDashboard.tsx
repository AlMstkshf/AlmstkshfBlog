import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CacheMonitor } from '@/components/admin/CacheMonitor';
import { PerformanceMetrics } from '@/components/admin/PerformanceMetrics';
import { 
  Activity, 
  Download, 
  RefreshCw, 
  Settings, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap,
  Database,
  Server
} from 'lucide-react';

interface PerformanceSummary {
  overall: {
    status: 'excellent' | 'good' | 'warning' | 'critical';
    score: number;
    recommendations: string[];
  };
  api: {
    avgResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
  };
  cache: {
    hitRate: number;
    memoryUsage: number;
    totalKeys: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
  };
  database: {
    avgQueryTime: number;
    connectionPoolUsage: number;
    slowQueries: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
  };
  system: {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
  };
}

export const PerformanceDashboard: React.FC = () => {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { toast } = useToast();

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/performance/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch performance summary');
      }

      const summaryData = await response.json();
      setSummary(summaryData);
      setLastRefresh(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching performance summary:', error);
      toast({
        title: "Error",
        description: "Failed to fetch performance summary",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/performance/export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: 'pdf',
          includeCharts: true,
          timeRange: '24h'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to export performance report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `performance-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Performance report exported successfully",
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: "Error",
        description: "Failed to export performance report",
        variant: "destructive"
      });
    }
  };

  const optimizePerformance = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/performance/optimize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to run performance optimization');
      }

      const result = await response.json();
      
      toast({
        title: "Optimization Complete",
        description: `Applied ${result.optimizations.length} optimizations`,
      });

      // Refresh data after optimization
      setTimeout(fetchSummary, 2000);
    } catch (error) {
      console.error('Error running optimization:', error);
      toast({
        title: "Error",
        description: "Failed to run performance optimization",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchSummary();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'good':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading performance dashboard...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and optimize your application's performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="default" size="sm" onClick={optimizePerformance}>
            <Settings className="h-4 w-4 mr-2" />
            Optimize
          </Button>
        </div>
      </div>

      {/* Performance Summary Cards */}
      {summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Overall Performance */}
            <Card className={`border-2 ${getStatusColor(summary.overall.status)}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                {getStatusIcon(summary.overall.status)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.overall.score}/100
                </div>
                <Badge variant={summary.overall.status === 'excellent' ? 'default' : 'secondary'}>
                  {summary.overall.status.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>

            {/* API Performance */}
            <Card className={`border ${getStatusColor(summary.api.status)}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Performance</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.api.avgResponseTime.toFixed(0)}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.api.requestsPerSecond.toFixed(1)} req/s • {summary.api.errorRate.toFixed(2)}% errors
                </p>
              </CardContent>
            </Card>

            {/* Cache Performance */}
            <Card className={`border ${getStatusColor(summary.cache.status)}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Performance</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.cache.hitRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.cache.totalKeys} keys • {summary.cache.memoryUsage.toFixed(1)}MB
                </p>
              </CardContent>
            </Card>

            {/* Database Performance */}
            <Card className={`border ${getStatusColor(summary.database.status)}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.database.avgQueryTime.toFixed(0)}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.database.connectionPoolUsage.toFixed(0)}% pool • {summary.database.slowQueries} slow
                </p>
              </CardContent>
            </Card>

            {/* System Resources */}
            <Card className={`border ${getStatusColor(summary.system.status)}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Resources</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.system.memoryUsage.toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  CPU: {summary.system.cpuUsage.toFixed(0)}% • Disk: {summary.system.diskUsage.toFixed(0)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {summary.overall.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Performance Recommendations
                </CardTitle>
                <CardDescription>
                  Suggested optimizations to improve performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {summary.overall.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                      <span className="text-sm">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Last Refresh Info */}
      <div className="text-center text-sm text-muted-foreground">
        Last refreshed: {lastRefresh.toLocaleString()}
        {autoRefresh && " • Auto-refreshing every 30 seconds"}
      </div>

      {/* Detailed Metrics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="cache">Cache Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceMetrics />
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <CacheMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};