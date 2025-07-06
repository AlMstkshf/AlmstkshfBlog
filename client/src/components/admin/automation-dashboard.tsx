import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, Calendar, Mail, BarChart3, Settings, Zap, Clock, Users, TrendingUp, AlertCircle, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutomationSettings {
  weeklyArticles: boolean;
  emailDigests: boolean;
  contentOptimization: boolean;
  socialSharing: boolean;
  analyticsReports: boolean;
}

interface AutomationStatus {
  newsAggregator: string;
  emailSystem: string;
  contentScheduler: string;
  lastRun: string;
  nextRun: string;
  articlesGenerated: number;
}

export default function AutomationDashboard() {
  const [settings, setSettings] = useState<AutomationSettings>({
    weeklyArticles: true,
    emailDigests: true,
    contentOptimization: true,
    socialSharing: true,
    analyticsReports: true,
  });

  const [status, setStatus] = useState<AutomationStatus>({
    newsAggregator: 'loading',
    emailSystem: 'loading',
    contentScheduler: 'loading',
    lastRun: '',
    nextRun: 'Monday/Friday 7:00 AM Dubai time',
    articlesGenerated: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isFixingContent, setIsFixingContent] = useState(false);
  const { toast } = useToast();

  // Load automation settings and status on component mount
  useEffect(() => {
    loadAutomationData();
  }, []);

  const loadAutomationData = async () => {
    try {
      // Load settings from database
      const settingsResponse = await fetch('/api/automation/settings');
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);
      }

      // Load status information
      const statusResponse = await fetch('/api/automation/status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setStatus(statusData);
      }
    } catch (error) {
      console.error('Error loading automation data:', error);
      toast({
        title: "Error",
        description: "Failed to load automation data",
        variant: "destructive",
      });
    }
  };

  const updateSetting = async (key: keyof AutomationSettings, value: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/automation/settings/${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (response.ok) {
        setSettings(prev => ({ ...prev, [key]: value }));
        toast({
          title: "Settings Updated",
          description: `${key} has been ${value ? 'enabled' : 'disabled'}`,
        });
      } else {
        throw new Error('Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update automation setting",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerArticleGeneration = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/automation/news/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Article Generation Started",
          description: "AI is now generating a new article from Middle East media news",
        });
        // Refresh status after a delay
        setTimeout(loadAutomationData, 2000);
      } else {
        throw new Error('Failed to trigger article generation');
      }
    } catch (error) {
      console.error('Error triggering article generation:', error);
      toast({
        title: "Error",
        description: "Failed to start article generation",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendTestEmail = async () => {
    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'rased@almstkshf.com',
          language: 'en'
        }),
      });

      if (response.ok) {
        toast({
          title: "Test Email Sent",
          description: "Check your inbox for the test email confirmation",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Email Test Failed",
        description: error instanceof Error ? error.message : "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const generateAndSendReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await fetch('/api/reports/weekly/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'rased@almstkshf.com'
        }),
      });

      if (response.ok) {
        toast({
          title: "Weekly Report Sent",
          description: "Performance report has been emailed successfully",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Report Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate and send report",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automation Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and control automated content generation and publishing
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            disabled
            variant="outline"
            className="gap-2"
            title="AI automation disabled - manual management only"
          >
            <Mail className="h-4 w-4" />
            Test Email (Disabled)
          </Button>
          <Button 
            disabled
            variant="outline"
            className="gap-2"
            title="AI automation disabled - manual management only"
          >
            <BarChart3 className="h-4 w-4" />
            Send Report (Disabled)
          </Button>
          <Button 
            disabled
            className="gap-2"
            title="AI automation disabled - manual management only"
          >
            <Play className="h-4 w-4" />
            Generate Article (Disabled)
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">News Aggregator</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={getStatusBadgeVariant(status.newsAggregator)}>
                {status.newsAggregator}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time Middle East media monitoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles Generated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.articlesGenerated}</div>
            <p className="text-xs text-muted-foreground">
              Total automated articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email System</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={getStatusBadgeVariant(status.emailSystem)}>
                {status.emailSystem}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Automated newsletters and notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Run</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{status.nextRun}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled automation time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automation Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure which automation features are active
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Weekly Articles</label>
              <p className="text-sm text-muted-foreground">
                Automatically generate articles from Middle East media news twice weekly
              </p>
            </div>
            <Switch
              checked={false}
              disabled={true}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Email Digests</label>
              <p className="text-sm text-muted-foreground">
                Send automated weekly email summaries to subscribers
              </p>
            </div>
            <Switch
              checked={false}
              disabled={true}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Content Optimization</label>
              <p className="text-sm text-muted-foreground">
                AI-powered SEO optimization and readability improvements
              </p>
            </div>
            <Switch
              checked={false}
              disabled={true}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Social Sharing</label>
              <p className="text-sm text-muted-foreground">
                Automatically share new articles on social media platforms
              </p>
            </div>
            <Switch
              checked={false}
              disabled={true}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Analytics Reports</label>
              <p className="text-sm text-muted-foreground">
                Generate automated performance reports and insights
              </p>
            </div>
            <Switch
              checked={false}
              disabled={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manual controls for automation systems
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button 
              variant="outline" 
              disabled
              className="justify-start gap-2"
              title="AI automation disabled - manual management only"
            >
              <Bot className="h-4 w-4" />
              Generate Article (Disabled)
            </Button>
            
            <Button variant="outline" disabled className="justify-start gap-2" title="AI automation disabled - manual management only">
              <Mail className="h-4 w-4" />
              Send Test Email (Disabled)
            </Button>
            
            <Button variant="outline" disabled className="justify-start gap-2" title="AI automation disabled - manual management only">
              <BarChart3 className="h-4 w-4" />
              Generate Report (Disabled)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">News Sources:</span>
              <span>NewsData.io (Middle East focus)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">AI Model:</span>
              <span>GPT-4o (Content Generation)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Schedule:</span>
              <span>Monday & Friday, 7:00 AM Dubai Time</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target Regions:</span>
              <span>UAE, Saudi Arabia, Egypt, Qatar, Bahrain</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Status Check:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}