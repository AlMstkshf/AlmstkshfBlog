import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Globe, 
  RefreshCw, 
  Download, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Zap,
  Settings,
  Play,
  Pause,
  Calendar,
  ExternalLink
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  url: string;
  source: string;
  country: string;
  publishedAt: string;
  imageUrl?: string;
  category: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  keywords: string[];
  relevanceScore: number;
}

interface AggregationJob {
  id: string;
  name: string;
  countries: string[];
  keywords: string[];
  sources: string[];
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  frequency: 'hourly' | 'daily' | 'weekly';
  articlesFound: number;
  status: 'running' | 'idle' | 'error';
}

const MIDDLE_EAST_COUNTRIES = [
  { code: 'ae', name: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة' },
  { code: 'eg', name: 'Egypt', nameAr: 'مصر' },
  { code: 'sa', name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية' },
  { code: 'kw', name: 'Kuwait', nameAr: 'الكويت' },
  { code: 'qa', name: 'Qatar', nameAr: 'قطر' },
  { code: 'bh', name: 'Bahrain', nameAr: 'البحرين' },
  { code: 'om', name: 'Oman', nameAr: 'عمان' },
  { code: 'ly', name: 'Libya', nameAr: 'ليبيا' },
  { code: 'sy', name: 'Syria', nameAr: 'سوريا' },
  { code: 'sd', name: 'Sudan', nameAr: 'السودان' }
];

const NEWS_CATEGORIES = [
  'politics', 'business', 'technology', 'health', 'sports', 
  'entertainment', 'science', 'general', 'energy', 'finance'
];

export function NewsAggregator() {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['ae', 'sa', 'eg']);
  const [keywords, setKeywords] = useState<string>('');
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [newJobName, setNewJobName] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState<'hourly' | 'daily' | 'weekly'>('daily');

  // Fetch aggregation jobs
  const { data: jobs = [], isLoading: jobsLoading } = useQuery<AggregationJob[]>({
    queryKey: ["/api/admin/news-jobs"],
    queryFn: async () => {
      const response = await fetch("/api/admin/news-jobs");
      if (!response.ok) throw new Error("Failed to fetch news jobs");
      return response.json();
    },
  });

  // Fetch latest news
  const { data: latestNews = [], isLoading: newsLoading } = useQuery<NewsItem[]>({
    queryKey: ["/api/admin/news-items"],
    queryFn: async () => {
      const response = await fetch("/api/admin/news-items?limit=50");
      if (!response.ok) throw new Error("Failed to fetch news items");
      return response.json();
    },
  });

  // Create new aggregation job
  const createJobMutation = useMutation({
    mutationFn: async (jobData: Partial<AggregationJob>) => {
      return apiRequest("/api/admin/news-jobs", {
        method: "POST",
        body: JSON.stringify(jobData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news-jobs"] });
      setIsCreatingJob(false);
      setNewJobName('');
      toast({
        title: language === 'ar' ? 'تم إنشاء المهمة' : 'Job Created',
        description: language === 'ar' ? 'تم إنشاء مهمة جمع الأخبار بنجاح' : 'News aggregation job created successfully',
      });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في إنشاء المهمة' : 'Failed to create job',
        variant: "destructive",
      });
    },
  });

  // Run manual news fetch
  const manualFetchMutation = useMutation({
    mutationFn: async (countries: string[]) => {
      return apiRequest("/api/admin/news-fetch", {
        method: "POST",
        body: JSON.stringify({ countries, keywords: keywords.split(',').filter(k => k.trim()) }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news-items"] });
      toast({
        title: language === 'ar' ? 'تم جلب الأخبار' : 'News Fetched',
        description: language === 'ar' ? 'تم جلب آخر الأخبار بنجاح' : 'Latest news fetched successfully',
      });
    },
    onError: () => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في جلب الأخبار. تحقق من مفاتيح API' : 'Failed to fetch news. Please check API keys',
        variant: "destructive",
      });
    },
  });

  const handleCreateJob = () => {
    if (!newJobName.trim()) return;
    
    createJobMutation.mutate({
      name: newJobName,
      countries: selectedCountries,
      keywords: keywords.split(',').filter(k => k.trim()),
      sources: [], // Will be populated by backend
      isActive: true,
      frequency: selectedFrequency,
      articlesFound: 0,
      status: 'idle'
    });
  };

  const handleManualFetch = () => {
    if (selectedCountries.length === 0) {
      toast({
        title: language === 'ar' ? 'تحذير' : 'Warning',
        description: language === 'ar' ? 'يرجى اختيار دولة واحدة على الأقل' : 'Please select at least one country',
        variant: "destructive",
      });
      return;
    }
    manualFetchMutation.mutate(selectedCountries);
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'ae': '🇦🇪', 'eg': '🇪🇬', 'sa': '🇸🇦', 'kw': '🇰🇼',
      'qa': '🇶🇦', 'bh': '🇧🇭', 'om': '🇴🇲', 'ly': '🇱🇾',
      'sy': '🇸🇾', 'sd': '🇸🇩'
    };
    return flags[countryCode] || '🌍';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return language === 'ar' ? 'منذ دقائق' : 'Minutes ago';
    if (diffInHours < 24) return language === 'ar' ? `منذ ${diffInHours} ساعة` : `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return language === 'ar' ? `منذ ${diffInDays} يوم` : `${diffInDays}d ago`;
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'مجمع الأخبار الآلي' : 'Automated News Aggregator'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'مجمع الأخبار الآلي معطل - إدارة يدوية فقط'
              : 'AI news aggregation disabled - manual management only'
            }
          </p>
        </div>
        <div className={`flex ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
          <Button
            disabled
            title="AI news aggregation disabled - manual management only"
            className={`${isRTL ? 'space-x-reverse' : ''} space-x-2`}
          >
            <Download className="w-4 h-4" />
            <span>{language === 'ar' ? 'جلب الأخبار (معطل)' : 'Fetch News (Disabled)'}</span>
          </Button>
        </div>
      </div>

      {/* Quick Fetch Controls */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
            <Zap className="w-5 h-5" />
            <span>{language === 'ar' ? 'جلب سريع' : 'Quick Fetch'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="countries">{language === 'ar' ? 'اختر الدول' : 'Select Countries'}</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
              {MIDDLE_EAST_COUNTRIES.map((country) => (
                <div
                  key={country.code}
                  className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedCountries.includes(country.code)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedCountries(prev =>
                      prev.includes(country.code)
                        ? prev.filter(c => c !== country.code)
                        : [...prev, country.code]
                    );
                  }}
                >
                  <span className="text-lg">{getCountryFlag(country.code)}</span>
                  <span className="text-sm">
                    {language === 'ar' ? country.nameAr : country.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="keywords">{language === 'ar' ? 'كلمات مفتاحية (اختيارية)' : 'Keywords (optional)'}</Label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={language === 'ar' ? 'أدخل الكلمات مفصولة بفواصل' : 'Enter keywords separated by commas'}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Jobs */}
      <Card>
        <CardHeader>
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CardTitle className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
              <Settings className="w-5 h-5" />
              <span>{language === 'ar' ? 'المهام النشطة' : 'Active Jobs'}</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              disabled
              title="AI news aggregation disabled - manual management only"
            >
              {language === 'ar' ? 'مهمة جديدة (معطل)' : 'New Job (Disabled)'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{language === 'ar' ? 'لا توجد مهام نشطة' : 'No active jobs'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                      <h3 className="font-semibold">{job.name}</h3>
                      <Badge variant={job.status === 'running' ? 'default' : job.status === 'error' ? 'destructive' : 'secondary'}>
                        {job.status === 'running' ? (language === 'ar' ? 'يعمل' : 'Running') :
                         job.status === 'error' ? (language === 'ar' ? 'خطأ' : 'Error') :
                         (language === 'ar' ? 'معطل' : 'Idle')}
                      </Badge>
                    </div>
                    <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-4 mt-2 text-sm text-muted-foreground`}>
                      <span className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-1`}>
                        <MapPin className="w-3 h-3" />
                        <span>{job.countries.length} {language === 'ar' ? 'دول' : 'countries'}</span>
                      </span>
                      <span className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-1`}>
                        <TrendingUp className="w-3 h-3" />
                        <span>{job.articlesFound} {language === 'ar' ? 'مقال' : 'articles'}</span>
                      </span>
                      <span className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-1`}>
                        <Clock className="w-3 h-3" />
                        <span>{job.frequency === 'hourly' ? (language === 'ar' ? 'كل ساعة' : 'Hourly') :
                               job.frequency === 'daily' ? (language === 'ar' ? 'يومياً' : 'Daily') :
                               (language === 'ar' ? 'أسبوعياً' : 'Weekly')}</span>
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                    <Switch checked={job.isActive} />
                    <Button variant="ghost" size="sm">
                      {job.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Latest News */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
            <Globe className="w-5 h-5" />
            <span>{language === 'ar' ? 'آخر الأخبار' : 'Latest News'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {newsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : latestNews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{language === 'ar' ? 'لا توجد أخبار حالياً' : 'No news items yet'}</p>
              <p className="text-sm mt-1">
                {language === 'ar' ? 'قم بإنشاء مهمة أو جلب الأخبار يدوياً' : 'Create a job or fetch news manually'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {latestNews.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className="flex space-x-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={language === 'ar' && item.titleAr ? item.titleAr : item.title}
                      className="w-16 h-16 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <h4 className="font-medium text-sm line-clamp-2 flex-1">
                        {language === 'ar' && item.titleAr ? item.titleAr : item.title}
                      </h4>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {language === 'ar' && item.descriptionAr ? item.descriptionAr : item.description}
                    </p>
                    <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 mt-2`}>
                      <span className="text-xs text-muted-foreground">
                        {getCountryFlag(item.country)} {item.source}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(item.publishedAt)}
                      </span>
                      {item.relevanceScore && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(item.relevanceScore * 100)}% {language === 'ar' ? 'صلة' : 'relevance'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Job Modal */}
      {isCreatingJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'إنشاء مهمة جديدة' : 'Create New Job'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobName">{language === 'ar' ? 'اسم المهمة' : 'Job Name'}</Label>
                <Input
                  id="jobName"
                  value={newJobName}
                  onChange={(e) => setNewJobName(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل اسم المهمة' : 'Enter job name'}
                />
              </div>
              
              <div>
                <Label>{language === 'ar' ? 'التكرار' : 'Frequency'}</Label>
                <Select value={selectedFrequency} onValueChange={(value: any) => setSelectedFrequency(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">{language === 'ar' ? 'كل ساعة' : 'Hourly'}</SelectItem>
                    <SelectItem value="daily">{language === 'ar' ? 'يومياً' : 'Daily'}</SelectItem>
                    <SelectItem value="weekly">{language === 'ar' ? 'أسبوعياً' : 'Weekly'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={`flex ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                <Button
                  onClick={handleCreateJob}
                  disabled={createJobMutation.isPending || !newJobName.trim()}
                  className="flex-1"
                >
                  {createJobMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    language === 'ar' ? 'إنشاء' : 'Create'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingJob(false)}
                  className="flex-1"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}