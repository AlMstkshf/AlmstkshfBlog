import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/use-language";
import { 
  TrendingUp, 
  Search, 
  Target, 
  Brain, 
  Shield, 
  FileText,
  BarChart3,
  Users,
  Globe,
  CheckCircle,
  AlertTriangle,
  Lightbulb
} from "lucide-react";

interface ContentPillar {
  id: string;
  titleEn: string;
  titleAr: string;
  description: string;
  priority: "high" | "medium" | "low";
  aiResistance: number;
  searchVolume: string;
  competitionLevel: "low" | "medium" | "high";
  topics: string[];
  contentTypes: string[];
  kpiTargets: {
    organicTraffic: number;
    avgSessionDuration: number;
    bounceRate: number;
    conversionRate: number;
  };
}

interface SEOMetrics {
  zeroClickRate: number;
  organicTrafficGrowth: number;
  aiContentDetection: number;
  topicAuthority: number;
  backlinksGrowth: number;
}

export function ContentStrategyOptimizer() {
  const { language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("pillars");
  const [metrics, setMetrics] = useState<SEOMetrics>({
    zeroClickRate: 23.5,
    organicTrafficGrowth: 15.2,
    aiContentDetection: 8.1,
    topicAuthority: 78.9,
    backlinksGrowth: 12.4
  });

  const contentPillars: ContentPillar[] = [
    {
      id: "arabic-sentiment",
      titleEn: "Arabic Sentiment Analysis & Dialect Processing",
      titleAr: "تحليل المشاعر العربية ومعالجة اللهجات",
      description: "Advanced sentiment analysis for MSA and Gulf dialects with cultural context understanding",
      priority: "high",
      aiResistance: 95,
      searchVolume: "2.4K-5.8K",
      competitionLevel: "low",
      topics: [
        "MSA sentiment accuracy",
        "Gulf dialect detection",
        "Cultural context mapping",
        "Arabic NLP challenges",
        "Dialectal variation handling"
      ],
      contentTypes: ["Case Studies", "Technical Guides", "Performance Reports"],
      kpiTargets: {
        organicTraffic: 25000,
        avgSessionDuration: 240,
        bounceRate: 35,
        conversionRate: 4.2
      }
    },
    {
      id: "gem-integration",
      titleEn: "GEM 2.1 KPI Integration Framework",
      titleAr: "إطار تكامل مؤشرات الأداء الرئيسية GEM 2.1",
      description: "Comprehensive guide for integrating GEM 2.1 KPIs with media monitoring systems",
      priority: "high",
      aiResistance: 88,
      searchVolume: "1.2K-3.1K",
      competitionLevel: "low",
      topics: [
        "GEM 2.1 compliance metrics",
        "Media monitoring integration",
        "Performance dashboard design",
        "Automated reporting systems",
        "ROI measurement frameworks"
      ],
      contentTypes: ["White Papers", "Implementation Guides", "Best Practices"],
      kpiTargets: {
        organicTraffic: 18000,
        avgSessionDuration: 320,
        bounceRate: 28,
        conversionRate: 6.1
      }
    },
    {
      id: "crisis-response",
      titleEn: "Crisis Response Frameworks for Gulf Governments",
      titleAr: "أطر الاستجابة للأزمات للحكومات الخليجية",
      description: "Specialized crisis communication and response frameworks tailored for Gulf government entities",
      priority: "high",
      aiResistance: 92,
      searchVolume: "800-2.2K",
      competitionLevel: "low",
      topics: [
        "Government crisis protocols",
        "Media response strategies",
        "Stakeholder communication",
        "Regional compliance requirements",
        "Cultural sensitivity guidelines"
      ],
      contentTypes: ["Case Studies", "Strategic Frameworks", "Emergency Playbooks"],
      kpiTargets: {
        organicTraffic: 15000,
        avgSessionDuration: 280,
        bounceRate: 32,
        conversionRate: 5.8
      }
    },
    {
      id: "dark-web-intelligence",
      titleEn: "Early Reputation Risk Detection via Dark Web Intelligence",
      titleAr: "كشف مخاطر السمعة المبكر عبر استخبارات الويب المظلم",
      description: "Advanced techniques for monitoring and detecting reputation threats through dark web intelligence",
      priority: "medium",
      aiResistance: 97,
      searchVolume: "500-1.5K",
      competitionLevel: "low",
      topics: [
        "Dark web monitoring tools",
        "Threat intelligence gathering",
        "Early warning systems",
        "Risk assessment protocols",
        "Automated threat detection"
      ],
      contentTypes: ["Technical Reports", "Security Guides", "Threat Analysis"],
      kpiTargets: {
        organicTraffic: 12000,
        avgSessionDuration: 360,
        bounceRate: 25,
        conversionRate: 7.2
      }
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
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

  const getMetricTrend = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 90) return { status: "excellent", color: "text-green-600" };
    if (percentage >= 70) return { status: "good", color: "text-blue-600" };
    if (percentage >= 50) return { status: "fair", color: "text-yellow-600" };
    return { status: "needs improvement", color: "text-red-600" };
  };

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {language === "ar" ? "محسن استراتيجية المحتوى" : "Content Strategy Optimizer"}
        </h1>
        <p className="text-gray-600">
          {language === "ar" 
            ? "تحسين المحتوى للحفاظ على الرؤية في محركات البحث ومقاومة البحث بدون نقرات في عصر الذكاء الاصطناعي"
            : "Optimize content for search engine visibility and zero-click resistance in the AI era"
          }
        </p>
      </div>

      {/* SEO Metrics Dashboard */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {language === "ar" ? "مؤشرات الأداء الرئيسية" : "SEO Performance Metrics"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {language === "ar" ? "معدل البحث بدون نقرات" : "Zero-Click Rate"}
                </span>
                <span className="text-sm text-red-600">{metrics.zeroClickRate}%</span>
              </div>
              <Progress value={metrics.zeroClickRate} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {language === "ar" ? "نمو الزيارات العضوية" : "Organic Traffic Growth"}
                </span>
                <span className="text-sm text-green-600">+{metrics.organicTrafficGrowth}%</span>
              </div>
              <Progress value={metrics.organicTrafficGrowth} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {language === "ar" ? "كشف المحتوى المولد بالذكاء الاصطناعي" : "AI Content Detection"}
                </span>
                <span className="text-sm text-green-600">{metrics.aiContentDetection}%</span>
              </div>
              <Progress value={metrics.aiContentDetection} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {language === "ar" ? "سلطة الموضوع" : "Topic Authority"}
                </span>
                <span className="text-sm text-blue-600">{metrics.topicAuthority}%</span>
              </div>
              <Progress value={metrics.topicAuthority} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {language === "ar" ? "نمو الروابط الخلفية" : "Backlinks Growth"}
                </span>
                <span className="text-sm text-blue-600">+{metrics.backlinksGrowth}%</span>
              </div>
              <Progress value={metrics.backlinksGrowth} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pillars">
            {language === "ar" ? "ركائز المحتوى" : "Content Pillars"}
          </TabsTrigger>
          <TabsTrigger value="optimization">
            {language === "ar" ? "تحسين SEO" : "SEO Optimization"}
          </TabsTrigger>
          <TabsTrigger value="resistance">
            {language === "ar" ? "مقاومة الذكاء الاصطناعي" : "AI Resistance"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pillars" className="space-y-6">
          <div className="grid gap-6">
            {contentPillars.map((pillar) => (
              <Card key={pillar.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {language === "ar" ? pillar.titleAr : pillar.titleEn}
                      </CardTitle>
                      <p className="text-gray-600 text-sm mb-3">{pillar.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getPriorityColor(pillar.priority)}>
                          {language === "ar" ? "أولوية" : "Priority"}: {pillar.priority}
                        </Badge>
                        <Badge variant="outline">
                          {language === "ar" ? "مقاومة الذكاء الاصطناعي" : "AI Resistance"}: {pillar.aiResistance}%
                        </Badge>
                        <Badge variant="outline">
                          {language === "ar" ? "حجم البحث" : "Search Volume"}: {pillar.searchVolume}
                        </Badge>
                        <Badge variant="outline" className={getCompetitionColor(pillar.competitionLevel)}>
                          {language === "ar" ? "المنافسة" : "Competition"}: {pillar.competitionLevel}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">{pillar.aiResistance}%</div>
                      <div className="text-xs text-gray-500">
                        {language === "ar" ? "مقاومة الذكاء الاصطناعي" : "AI Resistance"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        {language === "ar" ? "المواضيع الأساسية" : "Key Topics"}
                      </h4>
                      <ul className="space-y-1">
                        {pillar.topics.map((topic, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {language === "ar" ? "أنواع المحتوى" : "Content Types"}
                      </h4>
                      <div className="space-y-2">
                        {pillar.contentTypes.map((type, index) => (
                          <Badge key={index} variant="secondary" className="mr-2">
                            {type}
                          </Badge>
                        ))}
                      </div>
                      
                      <h4 className="font-semibold mt-4 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        {language === "ar" ? "أهداف مؤشرات الأداء" : "KPI Targets"}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">
                            {language === "ar" ? "الزيارات العضوية" : "Organic Traffic"}:
                          </span>
                          <span className="font-medium ml-1">{pillar.kpiTargets.organicTraffic.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">
                            {language === "ar" ? "مدة الجلسة" : "Session Duration"}:
                          </span>
                          <span className="font-medium ml-1">{pillar.kpiTargets.avgSessionDuration}s</span>
                        </div>
                        <div>
                          <span className="text-gray-500">
                            {language === "ar" ? "معدل الارتداد" : "Bounce Rate"}:
                          </span>
                          <span className="font-medium ml-1">{pillar.kpiTargets.bounceRate}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">
                            {language === "ar" ? "معدل التحويل" : "Conversion Rate"}:
                          </span>
                          <span className="font-medium ml-1">{pillar.kpiTargets.conversionRate}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  {language === "ar" ? "تحسين البحث" : "Search Optimization"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">
                        {language === "ar" ? "البحث الصوتي محسن" : "Voice Search Optimized"}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">
                        {language === "ar" ? "المقتطفات المميزة" : "Featured Snippets"}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-green-600">Targeting</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium">
                        {language === "ar" ? "العنقدة الموضوعية" : "Topic Clustering"}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-yellow-600">In Progress</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {language === "ar" ? "التوطين والثقافة" : "Localization & Culture"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        {language === "ar" ? "المحتوى الثقافي المحلي" : "Cultural Context"}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-blue-600">High Priority</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        {language === "ar" ? "اللهجات العربية" : "Arabic Dialects"}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-blue-600">Specialized</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">
                        {language === "ar" ? "الامتثال الإقليمي" : "Regional Compliance"}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-green-600">Implemented</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resistance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                {language === "ar" ? "استراتيجيات مقاومة الذكاء الاصطناعي" : "AI Resistance Strategies"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {language === "ar" ? "المحتوى المقاوم للذكاء الاصطناعي" : "AI-Resistant Content Types"}
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {language === "ar" ? "دراسات الحالة الحصرية" : "Exclusive Case Studies"}
                        </span>
                        <Badge className="bg-green-100 text-green-800">98% Resistance</Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {language === "ar" 
                          ? "بيانات أولية وتجارب فريدة لا يمكن للذكاء الاصطناعي تكرارها"
                          : "Primary data and unique experiences AI cannot replicate"
                        }
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {language === "ar" ? "التحليل الثقافي العميق" : "Deep Cultural Analysis"}
                        </span>
                        <Badge className="bg-green-100 text-green-800">95% Resistance</Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {language === "ar" 
                          ? "فهم السياق الثقافي والاجتماعي المحلي"
                          : "Local cultural and social context understanding"
                        }
                      </p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {language === "ar" ? "البيانات الملكية" : "Proprietary Data"}
                        </span>
                        <Badge className="bg-green-100 text-green-800">92% Resistance</Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {language === "ar" 
                          ? "تحليلات وإحصائيات خاصة بالمنصة"
                          : "Platform-specific analytics and statistics"
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    {language === "ar" ? "تكتيكات المحتوى المتقدمة" : "Advanced Content Tactics"}
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">
                        {language === "ar" ? "المحتوى التفاعلي" : "Interactive Content"}
                      </h5>
                      <p className="text-xs text-gray-600">
                        {language === "ar" 
                          ? "أدوات تفاعلية وحاسبات مخصصة"
                          : "Custom tools and calculators"
                        }
                      </p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">
                        {language === "ar" ? "المحتوى المرئي الأصلي" : "Original Visual Content"}
                      </h5>
                      <p className="text-xs text-gray-600">
                        {language === "ar" 
                          ? "إنفوجرافيك وتصورات بيانات مخصصة"
                          : "Custom infographics and data visualizations"
                        }
                      </p>
                    </div>
                    
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <h5 className="font-medium text-sm mb-1">
                        {language === "ar" ? "التحديثات المستمرة" : "Live Updates"}
                      </h5>
                      <p className="text-xs text-gray-600">
                        {language === "ar" 
                          ? "محتوى يتطور بمرور الوقت"
                          : "Content that evolves over time"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}