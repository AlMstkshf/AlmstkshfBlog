import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  Database, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Server,
  Cpu,
  HardDrive,
  Zap,
  Wifi,
  Users
} from 'lucide-react';

interface ApiMetrics {
  avgResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  slowestEndpoints: Array<{
    endpoint: string;
    avgTime: number;
    method: string;
    count: number;
  }>;
  totalRequests: number;
  successRate: number;
}

interface DbMetrics {
  queryTime: number;
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
  slowQueries: Array<{
    query: string;
    time: number;
    count: number;
    table: string;
  }>;
  totalQueries: number;
  avgQueryTime: number;
}

interface SystemMetrics {
  cpu: {
    usage: number;
    temperature: number;
    cores: number;
    speed: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    available: number;
    formatted: {
      used: string;
      total: string;
      available: string;
    };
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
    available: number;
    formatted: {
      used: string;
      total: string;
      available: string;
    };
  };
  network: {
    rx: number;
    tx: number;
    rxSec: number;
    txSec: number;
    formatted: {
      rx: string;
      tx: string;
      rxSec: string;
      txSec: string;
    };
  };
  system: {
    uptime: number;
    platform: string;
    arch: string;
    nodeVersion: string;
  };
  processes: {
    running: number;
    blocked: number;
    sleeping: number;
  };
}

interface PerformanceData {
  apiMetrics: ApiMetrics;
  dbMetrics: DbMetrics;
  systemMetrics: SystemMetrics;
  timestamp: string;
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    metric: string;
    value: number;
    threshold: number;
  }>;
}

export const PerformanceMetrics: React.FC = () => {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/performance/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics');
      }

      const metricsData = await response.json();
      setData(metricsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch performance metrics",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (value: number, thresholds: { warning: number; error: number }): string => {
    if (value >= thresholds.error) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusBadge = (value: number, thresholds: { warning: number; error: number }) => {
    if (value >= thresholds.error) return <Badge variant="destructive">Critical</Badge>;
    if (value >= thresholds.warning) return <Badge variant="secondary">Warning</Badge>;
    return <Badge variant="default">Good</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading performance metrics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <AlertTriangle className="h-8 w-8 text-yellow-600" />
        <span className="ml-2">Failed to load performance metrics</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Metrics</h2>
          <p className="text-muted-foreground">
            Last updated: {new Date(data.timestamp).toLocaleString()}
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
          <Button variant="outline" size="sm" onClick={fetchMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    alert.type === 'error' ? 'border-red-200 bg-red-50' :
                    alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{alert.message}</span>
                    <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>
                      {alert.metric}: {alert.value} (threshold: {alert.threshold})
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.apiMetrics.avgResponseTime.toFixed(0)}ms
            </div>
            <div className="flex items-center mt-2">
              {getStatusBadge(data.apiMetrics.avgResponseTime, { warning: 500, error: 1000 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests/Second</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.apiMetrics.requestsPerSecond.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.apiMetrics.totalRequests} total requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.apiMetrics.errorRate.toFixed(2)}%
            </div>
            <div className="flex items-center mt-2">
              {getStatusBadge(data.apiMetrics.errorRate, { warning: 1, error: 5 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.apiMetrics.successRate.toFixed(1)}%
            </div>
            <Progress value={data.apiMetrics.successRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Tabs */}
      <Tabs defaultValue="api" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="system">System Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Slowest Endpoints</CardTitle>
              <CardDescription>
                Endpoints with highest average response times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.apiMetrics.slowestEndpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <code className="text-sm">{endpoint.endpoint}</code>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {endpoint.count} requests
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${getStatusColor(endpoint.avgTime, { warning: 500, error: 1000 })}`}>
                        {endpoint.avgTime.toFixed(0)}ms
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Connection Pool
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Active Connections:</span>
                    <span className="font-semibold">{data.dbMetrics.connectionPool.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Idle Connections:</span>
                    <span className="font-semibold">{data.dbMetrics.connectionPool.idle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Pool Size:</span>
                    <span className="font-semibold">{data.dbMetrics.connectionPool.total}</span>
                  </div>
                  <Progress 
                    value={(data.dbMetrics.connectionPool.active / data.dbMetrics.connectionPool.total) * 100} 
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Query Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Avg Query Time:</span>
                    <span className="font-semibold">{data.dbMetrics.avgQueryTime.toFixed(2)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Queries:</span>
                    <span className="font-semibold">{data.dbMetrics.totalQueries}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    {getStatusBadge(data.dbMetrics.avgQueryTime, { warning: 100, error: 500 })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Slow Queries</CardTitle>
              <CardDescription>
                Queries taking longer than expected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.dbMetrics.slowQueries.map((query, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{query.table}</Badge>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {query.count} executions
                        </span>
                        <span className={`font-semibold ${getStatusColor(query.time, { warning: 100, error: 500 })}`}>
                          {query.time.toFixed(2)}ms
                        </span>
                      </div>
                    </div>
                    <code className="text-sm bg-muted p-2 rounded block">
                      {query.query}
                    </code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold">
                    {data.systemMetrics.memory.percentage.toFixed(1)}%
                  </div>
                  <Progress value={data.systemMetrics.memory.percentage} />
                  <p className="text-sm text-muted-foreground">
                    {data.systemMetrics.memory.formatted?.used || formatBytes(data.systemMetrics.memory.used)} / {data.systemMetrics.memory.formatted?.total || formatBytes(data.systemMetrics.memory.total)}
                  </p>
                  <div className="flex items-center mt-2">
                    {getStatusBadge(data.systemMetrics.memory.percentage, { warning: 70, error: 90 })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="h-5 w-5 mr-2" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold">
                    {data.systemMetrics.cpu.usage.toFixed(1)}%
                  </div>
                  <Progress value={data.systemMetrics.cpu.usage} />
                  <p className="text-sm text-muted-foreground">
                    {data.systemMetrics.cpu.cores} cores • {data.systemMetrics.cpu.speed.toFixed(1)} GHz
                    {data.systemMetrics.cpu.temperature > 0 && ` • ${data.systemMetrics.cpu.temperature}°C`}
                  </p>
                  <div className="flex items-center mt-2">
                    {getStatusBadge(data.systemMetrics.cpu.usage, { warning: 70, error: 90 })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HardDrive className="h-5 w-5 mr-2" />
                  Disk Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold">
                    {data.systemMetrics.disk.percentage.toFixed(1)}%
                  </div>
                  <Progress value={data.systemMetrics.disk.percentage} />
                  <p className="text-sm text-muted-foreground">
                    {data.systemMetrics.disk.formatted?.used || formatBytes(data.systemMetrics.disk.used)} / {data.systemMetrics.disk.formatted?.total || formatBytes(data.systemMetrics.disk.total)}
                  </p>
                  <div className="flex items-center mt-2">
                    {getStatusBadge(data.systemMetrics.disk.percentage, { warning: 80, error: 95 })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Network and Process Monitoring */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wifi className="h-5 w-5 mr-2" />
                  Network Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Download:</span>
                    <span className="font-semibold">
                      {data.systemMetrics.network.formatted?.rxSec || `${(data.systemMetrics.network.rxSec / 1024 / 1024).toFixed(2)} MB/s`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Upload:</span>
                    <span className="font-semibold">
                      {data.systemMetrics.network.formatted?.txSec || `${(data.systemMetrics.network.txSec / 1024 / 1024).toFixed(2)} MB/s`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total RX:</span>
                    <span className="font-semibold">
                      {data.systemMetrics.network.formatted?.rx || formatBytes(data.systemMetrics.network.rx)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total TX:</span>
                    <span className="font-semibold">
                      {data.systemMetrics.network.formatted?.tx || formatBytes(data.systemMetrics.network.tx)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Process Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Running:</span>
                    <span className="font-semibold text-green-600">{data.systemMetrics.processes.running}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sleeping:</span>
                    <span className="font-semibold text-blue-600">{data.systemMetrics.processes.sleeping}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Blocked:</span>
                    <span className="font-semibold text-yellow-600">{data.systemMetrics.processes.blocked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-semibold">
                      {data.systemMetrics.processes.running + data.systemMetrics.processes.sleeping + data.systemMetrics.processes.blocked}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="font-semibold">{formatUptime(data.systemMetrics.system.uptime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Node.js Version:</span>
                  <span className="font-semibold">{data.systemMetrics.system.nodeVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform:</span>
                  <span className="font-semibold">{data.systemMetrics.system.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span>Architecture:</span>
                  <span className="font-semibold">{data.systemMetrics.system.arch}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};