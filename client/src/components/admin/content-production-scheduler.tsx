import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar,
  FileText,
  Clock,
  Target,
  BarChart3,
  TrendingUp,
  Award,
  Globe,
  Building,
  Lightbulb,
  Users,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Zap,
  BookOpen,
  Search
} from "lucide-react";

interface ContentPlan {
  id: string;
  title: string;
  titleAr?: string;
  type: "case_study" | "gulf_analysis" | "ai_technology" | "competitive_benchmarking";
  status: "planned" | "in_progress" | "review" | "published" | "refresh_needed";
  scheduledDate: string;
  publishDate?: string;
  lastRefreshDate?: string;
  nextRefreshDate?: string;
  author: string;
  estimatedWordCount: number;
  actualWordCount?: number;
  readingTime?: number;
  governmentRelevance: number;
  competitiveAdvantage: number;
  seoOptimization: number;
  priority: "high" | "medium" | "low";
  tags: string[];
  targetAudience: string[];
  refreshCycle: number; // months
  performanceMetrics: {
    views: number;
    engagement: number;
    leads: number;
    shares: number;
  };
  contentRequirements: {
    originalResearch: boolean;
    expertQuotes: boolean;
    governmentData: boolean;
    competitorAnalysis: boolean;
    casStudyData: boolean;
  };
}

interface ContentAllocation {
  month: string;
  year: number;
  totalArticles: number;
  planned: number;
  published: number;
  allocation: {
    case_studies: { target: number; actual: number; percentage: number };
    gulf_analysis: { target: number; actual: number; percentage: number };
    ai_technology: { target: number; actual: number; percentage: number };
    competitive_benchmarking: { target: number; actual: number; percentage: number };
  };
  monthlyTarget: number;
  completionRate: number;
}

export function ContentProductionScheduler() {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("production-schedule");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Content production schedule with Al-Mustakshef strategic focus
  const contentPlans: ContentPlan[] = [
    {
      id: "1",
      title: "UAE Government Excellence Program: AI Implementation Case Study",
      titleAr: "برنامج التميز الحكومي الإماراتي: دراسة حالة تطبيق الذكاء الاصطناعي",
      type: "case_study",
      status: "in_progress",
      scheduledDate: "2024-12-20",
      author: "Dr. Sarah Al-Zahra",
      estimatedWordCount: 3500,
      actualWordCount: 2800,
      readingTime: 14,
      governmentRelevance: 95,
      competitiveAdvantage: 88,
      seoOptimization: 92,
      priority: "high",
      tags: ["UAE Government", "Excellence Program", "AI Implementation", "Digital Transformation"],
      targetAudience: ["decision_makers", "government_officials"],
      refreshCycle: 6,
      performanceMetrics: {
        views: 12500,
        engagement: 18.3,
        leads: 45,
        shares: 67
      },
      contentRequirements: {
        originalResearch: true,
        expertQuotes: true,
        governmentData: true,
        competitorAnalysis: false,
        casStudyData: true
      }
    },
    {
      id: "2",
      title: "Gulf Media Landscape 2024: Sentiment Analysis Trends Across GCC Markets",
      titleAr: "المشهد الإعلامي الخليجي 2024: اتجاهات تحليل المشاعر عبر أسواق مجلس التعاون",
      type: "gulf_analysis",
      status: "planned",
      scheduledDate: "2024-12-25",
      author: "Ahmed Al-Mansoori",
      estimatedWordCount: 4200,
      governmentRelevance: 78,
      competitiveAdvantage: 85,
      seoOptimization: 89,
      priority: "high",
      tags: ["Gulf Media", "Sentiment Analysis", "GCC Markets", "Media Trends"],
      targetAudience: ["analysts", "media_professionals", "executives"],
      refreshCycle: 3,
      performanceMetrics: {
        views: 0,
        engagement: 0,
        leads: 0,
        shares: 0
      },
      contentRequirements: {
        originalResearch: true,
        expertQuotes: true,
        governmentData: false,
        competitorAnalysis: true,
        casStudyData: false
      }
    },
    {
      id: "3",
      title: "Advanced Arabic NLP: Al-Mustakshef's Proprietary Sentiment Analysis Engine",
      titleAr: "معالجة اللغة العربية المتقدمة: محرك تحليل المشاعر الخاص بالمستكشف",
      type: "ai_technology",
      status: "review",
      scheduledDate: "2025-01-05",
      publishDate: "2025-01-08",
      author: "Mohammed Al-Rashid",
      estimatedWordCount: 3800,
      actualWordCount: 3950,
      readingTime: 16,
      governmentRelevance: 72,
      competitiveAdvantage: 94,
      seoOptimization: 91,
      priority: "medium",
      tags: ["Arabic NLP", "Sentiment Analysis", "AI Technology", "Platform Features"],
      targetAudience: ["technical_experts", "analysts", "consultants"],
      refreshCycle: 4,
      performanceMetrics: {
        views: 8900,
        engagement: 22.1,
        leads: 32,
        shares: 89
      },
      contentRequirements: {
        originalResearch: true,
        expertQuotes: false,
        governmentData: false,
        competitorAnalysis: true,
        casStudyData: false
      }
    },
    {
      id: "4",
      title: "Global Media Intelligence Platforms: How Al-Mustakshef Leads in Arabic Processing",
      titleAr: "منصات الاستخبارات الإعلامية العالمية: كيف يقود المستكشف في معالجة العربية",
      type: "competitive_benchmarking",
      status: "planned",
      scheduledDate: "2025-01-15",
      author: "Fatima Al-Zahra",
      estimatedWordCount: 4500,
      governmentRelevance: 65,
      competitiveAdvantage: 96,
      seoOptimization: 87,
      priority: "high",
      tags: ["Competitive Analysis", "Global Benchmarking", "Arabic Processing", "Market Leadership"],
      targetAudience: ["decision_makers", "executives", "investors"],
      refreshCycle: 6,
      performanceMetrics: {
        views: 0,
        engagement: 0,
        leads: 0,
        shares: 0
      },
      contentRequirements: {
        originalResearch: true,
        expertQuotes: true,
        governmentData: false,
        competitorAnalysis: true,
        casStudyData: false
      }
    },
    {
      id: "5",
      title: "Crisis Communication Success: Dubai Government's Real-Time Media Response Framework",
      titleAr: "نجاح التواصل في الأزمات: إطار الاستجابة الإعلامية الفورية لحكومة دبي",
      type: "case_study",
      status: "refresh_needed",
      scheduledDate: "2024-06-15",
      publishDate: "2024-06-20",
      lastRefreshDate: "2024-06-20",
      nextRefreshDate: "2024-12-20",
      author: "Omar Al-Mansouri",
      estimatedWordCount: 3200,
      actualWordCount: 3150,
      readingTime: 13,
      governmentRelevance: 91,
      competitiveAdvantage: 83,
      seoOptimization: 88,
      priority: "medium",
      tags: ["Crisis Communication", "Dubai Government", "Real-Time Response", "Media Framework"],
      targetAudience: ["government_officials", "crisis_managers"],
      refreshCycle: 6,
      performanceMetrics: {
        views: 15600,
        engagement: 16.7,
        leads: 78,
        shares: 134
      },
      contentRequirements: {
        originalResearch: true,
        expertQuotes: true,
        governmentData: true,
        competitorAnalysis: false,
        casStudyData: true
      }
    }
  ];

  // Monthly content allocation tracking
  const contentAllocations: ContentAllocation[] = [
    {
      month: "December",
      year: 2024,
      totalArticles: 3,
      planned: 3,
      published: 1,
      monthlyTarget: 3,
      completionRate: 33,
      allocation: {
        case_studies: { target: 1, actual: 1, percentage: 33 },
        gulf_analysis: { target: 1, actual: 0, percentage: 0 },
        ai_technology: { target: 1, actual: 0, percentage: 0 },
        competitive_benchmarking: { target: 0, actual: 0, percentage: 0 }
      }
    },
    {
      month: "January",
      year: 2025,
      totalArticles: 3,
      planned: 3,
      published: 0,
      monthlyTarget: 3,
      completionRate: 0,
      allocation: {
        case_studies: { target: 1, actual: 0, percentage: 0 },
        gulf_analysis: { target: 1, actual: 0, percentage: 0 },
        ai_technology: { target: 1, actual: 0, percentage: 0 },
        competitive_benchmarking: { target: 1, actual: 0, percentage: 0 }
      }
    },
    {
      month: "February",
      year: 2025,
      totalArticles: 3,
      planned: 2,
      published: 0,
      monthlyTarget: 3,
      completionRate: 0,
      allocation: {
        case_studies: { target: 1, actual: 0, percentage: 0 },
        gulf_analysis: { target: 1, actual: 0, percentage: 0 },
        ai_technology: { target: 1, actual: 0, percentage: 0 },
        competitive_benchmarking: { target: 0, actual: 0, percentage: 0 }
      }
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "case_study": return <BookOpen className="w-4 h-4" />;
      case "gulf_analysis": return <Globe className="w-4 h-4" />;
      case "ai_technology": return <Zap className="w-4 h-4" />;
      case "competitive_benchmarking": return <BarChart3 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "review": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "planned": return "bg-gray-100 text-gray-800";
      case "refresh_needed": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "case_study": return "bg-blue-100 text-blue-800";
      case "gulf_analysis": return "bg-green-100 text-green-800";
      case "ai_technology": return "bg-purple-100 text-purple-800";
      case "competitive_benchmarking": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "ar" ? "ar-AE" : "en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const currentAllocation = contentAllocations.find(
    allocation => allocation.month === new Date().toLocaleDateString('en-US', { month: 'long' }) && 
                  allocation.year === new Date().getFullYear()
  ) || contentAllocations[0];

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {language === "ar" ? "جدولة إنتاج المحتوى المستمر" : "Ongoing Content Production Scheduler"}
        </h1>
        <p className="text-gray-600">
          {language === "ar" 
            ? "نشر وتحديث 2-3 مقالات شهرياً مع توزيع استراتيجي للمحتوى"
            : "Publish and refresh 2-3 articles monthly with strategic content allocation"
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="production-schedule">
            {language === "ar" ? "جدولة الإنتاج" : "Production Schedule"}
          </TabsTrigger>
          <TabsTrigger value="content-allocation">
            {language === "ar" ? "توزيع المحتوى" : "Content Allocation"}
          </TabsTrigger>
          <TabsTrigger value="refresh-tracker">
            {language === "ar" ? "متتبع التحديث" : "Refresh Tracker"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="production-schedule" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {language === "ar" ? "جدولة المحتوى الاستراتيجي" : "Strategic Content Schedule"}
            </h2>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {language === "ar" ? "إضافة مقال جديد" : "Add New Article"}
            </Button>
          </div>

          <div className="grid gap-6">
            {contentPlans.map((plan) => (
              <Card key={plan.id} className={`border-l-4 ${
                plan.priority === 'high' ? 'border-l-red-500' : 
                plan.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(plan.type)}
                        <Badge className={getTypeColor(plan.type)}>
                          {plan.type.replace('_', ' ')}
                        </Badge>
                        <Badge className={getStatusColor(plan.status)}>
                          {plan.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(plan.priority)}>
                          {plan.priority}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mb-2">
                        {language === "ar" && plan.titleAr ? plan.titleAr : plan.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {plan.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {plan.publishDate ? formatDate(plan.publishDate) : formatDate(plan.scheduledDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {plan.actualWordCount || plan.estimatedWordCount} words
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {plan.governmentRelevance}% gov relevance
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {plan.competitiveAdvantage}% competitive edge
                        </span>
                        <span className="flex items-center gap-1">
                          <Search className="w-4 h-4" />
                          {plan.seoOptimization}% SEO optimized
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-blue-600">
                        {plan.performanceMetrics.engagement || 0}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {language === "ar" ? "معدل التفاعل" : "Engagement Rate"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        {language === "ar" ? "الجمهور المستهدف" : "Target Audience"}
                      </h4>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {plan.targetAudience.map((audience, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {audience}
                          </Badge>
                        ))}
                      </div>
                      
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {language === "ar" ? "متطلبات المحتوى" : "Content Requirements"}
                      </h4>
                      <div className="space-y-1 text-sm">
                        {Object.entries(plan.contentRequirements).map(([key, required]) => (
                          <div key={key} className="flex items-center gap-2">
                            {required ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-gray-400" />
                            )}
                            <span className={required ? "text-gray-900" : "text-gray-500"}>
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        {language === "ar" ? "مقاييس الأداء" : "Performance Metrics"}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{language === "ar" ? "المشاهدات" : "Views"}:</span>
                          <span className="font-medium">{plan.performanceMetrics.views.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{language === "ar" ? "العملاء المحتملون" : "Leads"}:</span>
                          <span className="font-medium">{plan.performanceMetrics.leads}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{language === "ar" ? "المشاركات" : "Shares"}:</span>
                          <span className="font-medium">{plan.performanceMetrics.shares}</span>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold mt-4 mb-2 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        {language === "ar" ? "دورة التحديث" : "Refresh Cycle"}
                      </h4>
                      <div className="text-sm text-gray-600">
                        {plan.refreshCycle} {language === "ar" ? "أشهر" : "months"}
                        {plan.nextRefreshDate && (
                          <div className="mt-1">
                            {language === "ar" ? "التحديث التالي" : "Next refresh"}: {formatDate(plan.nextRefreshDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      {language === "ar" ? "آخر تحديث" : "Last updated"}: 
                      {plan.lastRefreshDate ? formatDate(plan.lastRefreshDate) : 
                       plan.publishDate ? formatDate(plan.publishDate) : "Not published"}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {language === "ar" ? "معاينة" : "Preview"}
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit className="w-3 h-3" />
                        {language === "ar" ? "تحرير" : "Edit"}
                      </Button>
                      {plan.status === "refresh_needed" && (
                        <Button size="sm" className="flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          {language === "ar" ? "تحديث" : "Refresh"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content-allocation" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {language === "ar" ? "توزيع المحتوى الشهري" : "Monthly Content Allocation"}
            </h2>
            <div className="text-sm text-gray-600">
              {language === "ar" ? "الهدف الشهري: 2-3 مقالات" : "Monthly Target: 2-3 Articles"}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {language === "ar" ? "التوزيع المستهدف" : "Target Allocation"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{language === "ar" ? "دراسات الحالة" : "Case Studies"}</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{language === "ar" ? "تحليل السوق الخليجي" : "Gulf Market Analysis"}</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{language === "ar" ? "تقنيات الذكاء الاصطناعي" : "AI Technology"}</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{language === "ar" ? "المقارنة التنافسية" : "Competitive Benchmarking"}</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {language === "ar" ? "الأداء الحالي" : "Current Performance"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{currentAllocation.completionRate}%</div>
                    <div className="text-sm text-gray-600">
                      {language === "ar" ? "معدل الإنجاز الشهري" : "Monthly Completion Rate"}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{currentAllocation.published}</div>
                      <div className="text-gray-600">
                        {language === "ar" ? "منشور" : "Published"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{currentAllocation.planned}</div>
                      <div className="text-gray-600">
                        {language === "ar" ? "مخطط" : "Planned"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {contentAllocations.map((allocation, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {allocation.month} {allocation.year}
                    </CardTitle>
                    <Badge className={allocation.completionRate >= 100 ? "bg-green-100 text-green-800" : 
                                   allocation.completionRate >= 50 ? "bg-yellow-100 text-yellow-800" : 
                                   "bg-red-100 text-red-800"}>
                      {allocation.completionRate}% Complete
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    {Object.entries(allocation.allocation).map(([type, data]) => (
                      <div key={type} className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {data.actual}/{data.target}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {type.replace('_', ' ')}
                        </div>
                        <Progress value={(data.actual / data.target) * 100} className="h-2 mt-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="refresh-tracker" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {language === "ar" ? "متتبع تحديث المحتوى" : "Content Refresh Tracker"}
            </h2>
            <Button className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {language === "ar" ? "فحص التحديثات المطلوبة" : "Check Refresh Requirements"}
            </Button>
          </div>

          <div className="grid gap-6">
            {contentPlans
              .filter(plan => plan.status === "published" || plan.status === "refresh_needed")
              .map((plan) => (
                <Card key={plan.id} className={`border-l-4 ${
                  plan.status === "refresh_needed" ? 'border-l-orange-500' : 'border-l-green-500'
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(plan.type)}
                          <Badge className={getTypeColor(plan.type)}>
                            {plan.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status === "refresh_needed" ? "Needs Refresh" : "Current"}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mb-2">
                          {language === "ar" && plan.titleAr ? plan.titleAr : plan.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {language === "ar" ? "نشر في" : "Published"}: {plan.publishDate && formatDate(plan.publishDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <RefreshCw className="w-4 h-4" />
                            {language === "ar" ? "دورة" : "Cycle"}: {plan.refreshCycle} months
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {plan.nextRefreshDate && (
                              <>
                                {language === "ar" ? "التحديث التالي" : "Next refresh"}: {formatDate(plan.nextRefreshDate)}
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-2xl font-bold text-green-600">
                          {plan.performanceMetrics.views.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {language === "ar" ? "إجمالي المشاهدات" : "Total Views"}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">
                          {language === "ar" ? "الأداء الحالي" : "Current Performance"}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>{language === "ar" ? "التفاعل" : "Engagement"}:</span>
                            <span className="font-medium">{plan.performanceMetrics.engagement}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{language === "ar" ? "العملاء المحتملون" : "Leads"}:</span>
                            <span className="font-medium">{plan.performanceMetrics.leads}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{language === "ar" ? "المشاركات" : "Shares"}:</span>
                            <span className="font-medium">{plan.performanceMetrics.shares}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">
                          {language === "ar" ? "مؤشرات الجودة" : "Quality Indicators"}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>{language === "ar" ? "الصلة الحكومية" : "Gov Relevance"}:</span>
                            <span className="font-medium">{plan.governmentRelevance}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{language === "ar" ? "الميزة التنافسية" : "Competitive Edge"}:</span>
                            <span className="font-medium">{plan.competitiveAdvantage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{language === "ar" ? "تحسين SEO" : "SEO Optimization"}:</span>
                            <span className="font-medium">{plan.seoOptimization}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">
                          {language === "ar" ? "إجراءات التحديث" : "Refresh Actions"}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {language === "ar" ? "تحديث الإحصائيات" : "Update statistics"}
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {language === "ar" ? "إضافة اقتباسات خبراء" : "Add expert quotes"}
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {language === "ar" ? "تحديث دراسات الحالة" : "Update case studies"}
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {language === "ar" ? "تحسين SEO" : "SEO optimization"}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        {plan.status === "refresh_needed" 
                          ? (language === "ar" ? "التحديث مطلوب الآن" : "Refresh required now")
                          : (language === "ar" ? "المحتوى محدث" : "Content is current")
                        }
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {language === "ar" ? "مراجعة المحتوى" : "Review Content"}
                        </Button>
                        {plan.status === "refresh_needed" ? (
                          <Button size="sm" className="flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            {language === "ar" ? "بدء التحديث" : "Start Refresh"}
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {language === "ar" ? "جدولة التحديث" : "Schedule Refresh"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}