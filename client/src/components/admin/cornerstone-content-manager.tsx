import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Crown, 
  Star, 
  TrendingUp, 
  Search, 
  Target, 
  Shield,
  Edit,
  Plus,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  LinkIcon
} from "lucide-react";

interface CornerstoneContent {
  id: number;
  titleEn: string;
  titleAr?: string;
  contentPillar: string;
  authorityScore: number;
  searchVolume: number;
  competitionLevel: "low" | "medium" | "high";
  aiResistanceScore: number;
  status: "published" | "draft" | "review" | "optimizing";
  lastUpdated: string;
  performanceMetrics: {
    organicTraffic: number;
    avgPosition: number;
    backlinks: number;
    socialShares: number;
    conversionRate: number;
  };
  topics: string[];
  contentType: string;
  targetKeywords: string[];
  internalLinks: number;
  externalReferences: number;
}

interface ContentPillar {
  id: string;
  name: string;
  priority: "high" | "medium" | "low";
  aiResistance: number;
  articleCount: number;
}

export function CornerstoneContentManager() {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPillar, setSelectedPillar] = useState<string>("all");
  const [editingContent, setEditingContent] = useState<CornerstoneContent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock data for demonstration - in production, this would come from API
  const cornerstoneContent: CornerstoneContent[] = [
    {
      id: 1,
      titleEn: "Complete Guide to Arabic Sentiment Analysis: MSA vs Gulf Dialects",
      titleAr: "الدليل الشامل لتحليل المشاعر العربية: العربية الفصحى مقابل اللهجات الخليجية",
      contentPillar: "arabic-sentiment",
      authorityScore: 94,
      searchVolume: 3200,
      competitionLevel: "low",
      aiResistanceScore: 96,
      status: "published",
      lastUpdated: "2024-12-15",
      performanceMetrics: {
        organicTraffic: 15420,
        avgPosition: 2.3,
        backlinks: 47,
        socialShares: 234,
        conversionRate: 4.8
      },
      topics: ["MSA Processing", "Dialect Detection", "Cultural Context", "NLP Challenges"],
      contentType: "Comprehensive Guide",
      targetKeywords: ["arabic sentiment analysis", "msa dialect processing", "gulf arabic nlp"],
      internalLinks: 12,
      externalReferences: 23
    },
    {
      id: 2,
      titleEn: "GEM 2.1 KPI Integration: Implementation Framework for Media Monitoring",
      titleAr: "تكامل مؤشرات الأداء GEM 2.1: إطار التنفيذ لمراقبة الإعلام",
      contentPillar: "gem-integration",
      authorityScore: 89,
      searchVolume: 1800,
      competitionLevel: "low",
      aiResistanceScore: 92,
      status: "published",
      lastUpdated: "2024-12-10",
      performanceMetrics: {
        organicTraffic: 9340,
        avgPosition: 1.8,
        backlinks: 31,
        socialShares: 156,
        conversionRate: 6.2
      },
      topics: ["GEM Compliance", "KPI Framework", "Media Integration", "Performance Metrics"],
      contentType: "Technical Framework",
      targetKeywords: ["gem 2.1 kpi", "media monitoring integration", "government excellence"],
      internalLinks: 18,
      externalReferences: 15
    },
    {
      id: 3,
      titleEn: "Crisis Response Protocol for Gulf Government Entities: A Strategic Framework",
      titleAr: "بروتوكول الاستجابة للأزمات للجهات الحكومية الخليجية: إطار استراتيجي",
      contentPillar: "crisis-response",
      authorityScore: 91,
      searchVolume: 1200,
      competitionLevel: "low",
      aiResistanceScore: 94,
      status: "review",
      lastUpdated: "2024-12-12",
      performanceMetrics: {
        organicTraffic: 7820,
        avgPosition: 1.5,
        backlinks: 28,
        socialShares: 189,
        conversionRate: 5.4
      },
      topics: ["Crisis Management", "Government Protocols", "Regional Compliance", "Stakeholder Communication"],
      contentType: "Strategic Guide",
      targetKeywords: ["gulf government crisis", "crisis response protocol", "government communication"],
      internalLinks: 15,
      externalReferences: 19
    }
  ];

  const contentPillars: ContentPillar[] = [
    { id: "arabic-sentiment", name: "Arabic Sentiment Analysis", priority: "high", aiResistance: 95, articleCount: 8 },
    { id: "gem-integration", name: "GEM 2.1 Integration", priority: "high", aiResistance: 88, articleCount: 5 },
    { id: "crisis-response", name: "Crisis Response", priority: "high", aiResistance: 92, articleCount: 6 },
    { id: "dark-web-intelligence", name: "Dark Web Intelligence", priority: "medium", aiResistance: 97, articleCount: 3 }
  ];

  const filteredContent = selectedPillar === "all" 
    ? cornerstoneContent 
    : cornerstoneContent.filter(content => content.contentPillar === selectedPillar);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "review": return "bg-yellow-100 text-yellow-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "optimizing": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case "low": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "high": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <Crown className="w-4 h-4 text-yellow-500" />;
      case "medium": return <Star className="w-4 h-4 text-blue-500" />;
      case "low": return <Target className="w-4 h-4 text-gray-500" />;
      default: return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === "ar" ? "إدارة المحتوى الأساسي" : "Cornerstone Content Manager"}
            </h1>
            <p className="text-gray-600">
              {language === "ar" 
                ? "إدارة المحتوى الأساسي عالي السلطة لمقاومة البحث بدون نقرات"
                : "Manage high-authority cornerstone content for zero-click resistance"
              }
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {language === "ar" ? "إنشاء محتوى أساسي" : "Create Cornerstone Content"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {language === "ar" ? "إنشاء محتوى أساسي جديد" : "Create New Cornerstone Content"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"}
                  </label>
                  <Input placeholder="Enter title in English" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}
                  </label>
                  <Input placeholder="أدخل العنوان بالعربية" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === "ar" ? "ركيزة المحتوى" : "Content Pillar"}
                  </label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content pillar" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentPillars.map((pillar) => (
                        <SelectItem key={pillar.id} value={pillar.id}>
                          {pillar.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-4">
                  <Button className="flex-1">
                    {language === "ar" ? "إنشاء" : "Create"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Content Pillars Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {contentPillars.map((pillar) => (
            <Card 
              key={pillar.id} 
              className={`cursor-pointer transition-all duration-200 ${
                selectedPillar === pillar.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedPillar(pillar.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  {getPriorityIcon(pillar.priority)}
                  <Badge variant="outline" className="text-xs">
                    {pillar.aiResistance}% AI Resistant
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm mb-1">{pillar.name}</h3>
                <p className="text-xs text-gray-600">
                  {pillar.articleCount} {language === "ar" ? "مقالات" : "articles"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={selectedPillar} onValueChange={setSelectedPillar}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === "ar" ? "جميع الركائز" : "All Pillars"}
              </SelectItem>
              {contentPillars.map((pillar) => (
                <SelectItem key={pillar.id} value={pillar.id}>
                  {pillar.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6">
        {filteredContent.map((content) => (
          <Card key={content.id} className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <Badge className={getStatusColor(content.status)}>
                      {content.status}
                    </Badge>
                    <Badge variant="outline" className={getCompetitionColor(content.competitionLevel)}>
                      {content.competitionLevel} competition
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mb-2">
                    {language === "ar" && content.titleAr ? content.titleAr : content.titleEn}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {content.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{language === "ar" ? "نوع المحتوى" : "Content Type"}:</span> {content.contentType}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="text-3xl font-bold text-primary">{content.aiResistanceScore}%</div>
                  <div className="text-xs text-gray-500">
                    {language === "ar" ? "مقاومة الذكاء الاصطناعي" : "AI Resistance"}
                  </div>
                  <div className="text-lg font-semibold text-green-600">{content.authorityScore}</div>
                  <div className="text-xs text-gray-500">
                    {language === "ar" ? "نقاط السلطة" : "Authority Score"}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="performance" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="performance">
                    {language === "ar" ? "الأداء" : "Performance"}
                  </TabsTrigger>
                  <TabsTrigger value="seo">
                    {language === "ar" ? "SEO" : "SEO"}
                  </TabsTrigger>
                  <TabsTrigger value="optimization">
                    {language === "ar" ? "التحسين" : "Optimization"}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="performance" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {content.performanceMetrics.organicTraffic.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">
                        {language === "ar" ? "زيارات عضوية" : "Organic Traffic"}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {content.performanceMetrics.avgPosition}
                      </div>
                      <div className="text-xs text-gray-600">
                        {language === "ar" ? "متوسط الترتيب" : "Avg Position"}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {content.performanceMetrics.backlinks}
                      </div>
                      <div className="text-xs text-gray-600">
                        {language === "ar" ? "روابط خلفية" : "Backlinks"}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {content.performanceMetrics.socialShares}
                      </div>
                      <div className="text-xs text-gray-600">
                        {language === "ar" ? "مشاركات اجتماعية" : "Social Shares"}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {content.performanceMetrics.conversionRate}%
                      </div>
                      <div className="text-xs text-gray-600">
                        {language === "ar" ? "معدل التحويل" : "Conversion Rate"}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        {language === "ar" ? "الكلمات المفتاحية المستهدفة" : "Target Keywords"}
                      </h4>
                      <div className="space-y-2">
                        {content.targetKeywords.map((keyword, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{keyword}</span>
                            <Badge variant="outline" className="text-xs">
                              Pos {Math.floor(Math.random() * 10) + 1}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        {language === "ar" ? "بنية الروابط" : "Link Structure"}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="text-sm">
                            {language === "ar" ? "روابط داخلية" : "Internal Links"}
                          </span>
                          <span className="font-medium">{content.internalLinks}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="text-sm">
                            {language === "ar" ? "مراجع خارجية" : "External References"}
                          </span>
                          <span className="font-medium">{content.externalReferences}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                          <span className="text-sm">
                            {language === "ar" ? "حجم البحث" : "Search Volume"}
                          </span>
                          <span className="font-medium">{content.searchVolume.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="optimization" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        {language === "ar" ? "نقاط القوة" : "Strengths"}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">
                            {language === "ar" ? "محتوى خاص وحصري" : "Unique proprietary content"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">
                            {language === "ar" ? "بيانات أولية" : "Primary research data"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">
                            {language === "ar" ? "خبرة متخصصة" : "Expert domain knowledge"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {language === "ar" ? "فرص التحسين" : "Optimization Opportunities"}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm">
                            {language === "ar" ? "تحديث الإحصائيات" : "Update statistics"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">
                            {language === "ar" ? "إضافة دراسات حالة" : "Add more case studies"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span className="text-sm">
                            {language === "ar" ? "تحسين المشاركة" : "Improve engagement"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-500">
                  {language === "ar" ? "آخر تحديث" : "Last updated"}: {content.lastUpdated}
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
                  <Button size="sm" className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {language === "ar" ? "تحسين" : "Optimize"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}