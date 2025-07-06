import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { 
  Target, 
  TrendingUp, 
  Flag, 
  Building, 
  Users, 
  Search,
  FileText,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Calendar,
  BarChart3,
  Globe,
  Award,
  BookOpen
} from "lucide-react";

interface GovernmentStrategy {
  id: string;
  title: string;
  titleAr: string;
  agency: string;
  document: string;
  priority: "high" | "medium" | "low";
  alignmentScore: number;
  relevantKeywords: string[];
  targetAudience: "decision_makers" | "government_officials" | "analysts" | "executives";
  implementationDate: string;
  nextReview: string;
  officialUrl: string;
  contentAlignment: {
    articles: number;
    coverage: number;
    gaps: string[];
  };
}

interface TransactionalKeyword {
  id: string;
  keyword: string;
  keywordAr?: string;
  intent: "procurement" | "consultation" | "implementation" | "evaluation";
  searchVolume: number;
  competitionLevel: "low" | "medium" | "high";
  governmentRelevance: number;
  currentRanking?: number;
  targetRanking: number;
  relatedStrategies: string[];
  monetaryValue: "high" | "medium" | "low";
  decisionMakerReach: number;
}

interface ComplianceMetric {
  id: string;
  metric: string;
  currentValue: number;
  targetValue: number;
  trend: "increasing" | "stable" | "decreasing";
  lastUpdated: string;
  source: string;
}

export function GovernmentAlignmentTracker() {
  const { language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("strategies");
  const [selectedStrategy, setSelectedStrategy] = useState<string>("all");

  const governmentStrategies: GovernmentStrategy[] = [
    {
      id: "uae-ai-2031",
      title: "UAE National Strategy for Artificial Intelligence 2031",
      titleAr: "الاستراتيجية الوطنية الإماراتية للذكاء الاصطناعي 2031",
      agency: "UAE Government",
      document: "UAE AI Strategy 2031",
      priority: "high",
      alignmentScore: 94,
      relevantKeywords: [
        "UAE AI strategy implementation",
        "Arabic NLP government solutions", 
        "AI governance framework UAE",
        "government AI procurement",
        "intelligent media monitoring"
      ],
      targetAudience: "decision_makers",
      implementationDate: "2021-10-01",
      nextReview: "2025-01-15",
      officialUrl: "https://u.ae/en/about-the-uae/strategies-initiatives-and-awards/federal-governments-strategies-and-plans/uae-strategy-for-artificial-intelligence-2031",
      contentAlignment: {
        articles: 8,
        coverage: 89,
        gaps: ["AI Ethics Implementation", "Cross-Border AI Collaboration"]
      }
    },
    {
      id: "gem-2-1",
      title: "Government Excellence Model (GEM) 2.1",
      titleAr: "نموذج التميز الحكومي 2.1",
      agency: "UAE Government Excellence Program",
      document: "GEM 2.1 Framework",
      priority: "high",
      alignmentScore: 91,
      relevantKeywords: [
        "GEM 2.1 implementation services",
        "government performance measurement",
        "excellence framework consultation",
        "KPI dashboard development",
        "government efficiency evaluation"
      ],
      targetAudience: "government_officials",
      implementationDate: "2023-01-01",
      nextReview: "2024-12-31",
      officialUrl: "https://government.ae/en/about-the-uae/government-excellence",
      contentAlignment: {
        articles: 5,
        coverage: 76,
        gaps: ["Digital Excellence Metrics", "Sustainability KPIs"]
      }
    },
    {
      id: "dubai-2040",
      title: "Dubai Urban Plan 2040",
      titleAr: "المخطط الحضري لدبي 2040",
      agency: "Dubai Municipality",
      document: "Dubai 2040 Urban Master Plan",
      priority: "medium",
      alignmentScore: 73,
      relevantKeywords: [
        "smart city consulting Dubai",
        "urban planning technology",
        "sustainable development monitoring",
        "smart governance solutions",
        "city intelligence platforms"
      ],
      targetAudience: "analysts",
      implementationDate: "2021-03-01",
      nextReview: "2025-03-01",
      officialUrl: "https://www.dubai.ae/en/about-dubai/dubai-2040-urban-master-plan",
      contentAlignment: {
        articles: 3,
        coverage: 65,
        gaps: ["Environmental Monitoring", "Transportation Analytics"]
      }
    },
    {
      id: "abu-dhabi-2030",
      title: "Abu Dhabi Economic Vision 2030",
      titleAr: "رؤية أبوظبي الاقتصادية 2030",
      agency: "Abu Dhabi Government",
      document: "Abu Dhabi Economic Vision 2030",
      priority: "high",
      alignmentScore: 87,
      relevantKeywords: [
        "economic diversification consulting",
        "business intelligence Abu Dhabi",
        "investment monitoring solutions",
        "economic performance tracking",
        "strategic planning services"
      ],
      targetAudience: "executives",
      implementationDate: "2008-01-01",
      nextReview: "2025-06-01",
      officialUrl: "https://www.adced.ae/en/Government/Economic%20Vision%202030",
      contentAlignment: {
        articles: 4,
        coverage: 81,
        gaps: ["Green Economy Indicators", "Innovation Metrics"]
      }
    }
  ];

  const transactionalKeywords: TransactionalKeyword[] = [
    {
      id: "1",
      keyword: "AI governance consulting UAE",
      keywordAr: "استشارات حوكمة الذكاء الاصطناعي الإمارات",
      intent: "consultation",
      searchVolume: 1200,
      competitionLevel: "low",
      governmentRelevance: 98,
      currentRanking: 12,
      targetRanking: 3,
      relatedStrategies: ["uae-ai-2031"],
      monetaryValue: "high",
      decisionMakerReach: 95
    },
    {
      id: "2",
      keyword: "GEM 2.1 implementation services",
      keywordAr: "خدمات تطبيق نموذج التميز الحكومي 2.1",
      intent: "implementation",
      searchVolume: 800,
      competitionLevel: "low",
      governmentRelevance: 96,
      currentRanking: 8,
      targetRanking: 1,
      relatedStrategies: ["gem-2-1"],
      monetaryValue: "high",
      decisionMakerReach: 92
    },
    {
      id: "3",
      keyword: "government media monitoring procurement",
      keywordAr: "مشتريات مراقبة الإعلام الحكومي",
      intent: "procurement",
      searchVolume: 650,
      competitionLevel: "medium",
      governmentRelevance: 94,
      currentRanking: 15,
      targetRanking: 5,
      relatedStrategies: ["uae-ai-2031", "gem-2-1"],
      monetaryValue: "high",
      decisionMakerReach: 88
    },
    {
      id: "4",
      keyword: "Arabic sentiment analysis evaluation",
      keywordAr: "تقييم تحليل المشاعر العربية",
      intent: "evaluation",
      searchVolume: 420,
      competitionLevel: "low",
      governmentRelevance: 91,
      targetRanking: 2,
      relatedStrategies: ["uae-ai-2031"],
      monetaryValue: "medium",
      decisionMakerReach: 85
    },
    {
      id: "5",
      keyword: "smart city dashboard development Dubai",
      keywordAr: "تطوير لوحة مدينة ذكية دبي",
      intent: "implementation",
      searchVolume: 950,
      competitionLevel: "medium",
      governmentRelevance: 89,
      currentRanking: 22,
      targetRanking: 8,
      relatedStrategies: ["dubai-2040"],
      monetaryValue: "high",
      decisionMakerReach: 78
    }
  ];

  const complianceMetrics: ComplianceMetric[] = [
    {
      id: "1",
      metric: "UAE AI Strategy Keyword Coverage",
      currentValue: 89,
      targetValue: 95,
      trend: "increasing",
      lastUpdated: "2024-12-15",
      source: "Internal SEO Analysis"
    },
    {
      id: "2", 
      metric: "Government Intent Keyword Rankings",
      currentValue: 67,
      targetValue: 85,
      trend: "increasing",
      lastUpdated: "2024-12-14",
      source: "Search Console Data"
    },
    {
      id: "3",
      metric: "Official Document Alignment Score",
      currentValue: 82,
      targetValue: 90,
      trend: "stable",
      lastUpdated: "2024-12-13",
      source: "Content Audit Report"
    },
    {
      id: "4",
      metric: "Decision Maker Traffic Share",
      currentValue: 34,
      targetValue: 55,
      trend: "increasing",
      lastUpdated: "2024-12-12",
      source: "Analytics Demographics"
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

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case "procurement": return <Building className="w-4 h-4" />;
      case "consultation": return <Users className="w-4 h-4" />;
      case "implementation": return <Target className="w-4 h-4" />;
      case "evaluation": return <BarChart3 className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "stable": return <Target className="w-4 h-4 text-blue-600" />;
      case "decreasing": return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default: return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredStrategies = selectedStrategy === "all" 
    ? governmentStrategies 
    : governmentStrategies.filter(strategy => strategy.id === selectedStrategy);

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {language === "ar" ? "متتبع الامتثال للاستراتيجيات الحكومية" : "Government Strategy Alignment Tracker"}
        </h1>
        <p className="text-gray-600">
          {language === "ar" 
            ? "مراقبة الامتثال للاستراتيجيات الرسمية وتحسين الكلمات المفتاحية الحكومية"
            : "Monitor compliance with official strategies and optimize government-intent keywords"
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="strategies">
            {language === "ar" ? "الاستراتيجيات" : "Strategies"}
          </TabsTrigger>
          <TabsTrigger value="keywords">
            {language === "ar" ? "الكلمات المفتاحية" : "Keywords"}
          </TabsTrigger>
          <TabsTrigger value="compliance">
            {language === "ar" ? "الامتثال" : "Compliance"}
          </TabsTrigger>
          <TabsTrigger value="insights">
            {language === "ar" ? "الرؤى" : "Insights"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {language === "ar" ? "الاستراتيجيات الحكومية الرسمية" : "Official Government Strategies"}
            </h2>
            <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === "ar" ? "جميع الاستراتيجيات" : "All Strategies"}
                </SelectItem>
                {governmentStrategies.map((strategy) => (
                  <SelectItem key={strategy.id} value={strategy.id}>
                    {language === "ar" ? strategy.titleAr : strategy.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6">
            {filteredStrategies.map((strategy) => (
              <Card key={strategy.id} className="border-l-4 border-l-blue-600">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Flag className="w-5 h-5 text-blue-600" />
                        <Badge className={getPriorityColor(strategy.priority)}>
                          {strategy.priority} priority
                        </Badge>
                        <Badge variant="outline">{strategy.agency}</Badge>
                      </div>
                      <CardTitle className="text-lg mb-2">
                        {language === "ar" ? strategy.titleAr : strategy.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mb-3">{strategy.document}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Implementation: {strategy.implementationDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Next Review: {strategy.nextReview}
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-3xl font-bold text-blue-600">{strategy.alignmentScore}%</div>
                      <div className="text-xs text-gray-500">
                        {language === "ar" ? "نسبة الامتثال" : "Alignment Score"}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={strategy.officialUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        {language === "ar" ? "الكلمات المفتاحية ذات الصلة" : "Relevant Keywords"}
                      </h4>
                      <div className="space-y-2">
                        {strategy.relevantKeywords.map((keyword, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                            <span>{keyword}</span>
                            <Badge variant="outline" className="text-xs">
                              Tracked
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {language === "ar" ? "محاذاة المحتوى" : "Content Alignment"}
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {language === "ar" ? "المقالات المرتبطة" : "Related Articles"}
                          </span>
                          <span className="font-medium">{strategy.contentAlignment.articles}</span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{language === "ar" ? "تغطية المحتوى" : "Content Coverage"}</span>
                            <span>{strategy.contentAlignment.coverage}%</span>
                          </div>
                          <Progress value={strategy.contentAlignment.coverage} className="h-2" />
                        </div>
                        
                        {strategy.contentAlignment.gaps.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-orange-600 mb-1">
                              {language === "ar" ? "الفجوات في المحتوى" : "Content Gaps"}:
                            </h5>
                            <ul className="text-xs text-orange-600 space-y-1">
                              {strategy.contentAlignment.gaps.map((gap, index) => (
                                <li key={index} className="flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  {gap}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {language === "ar" ? "الكلمات المفتاحية الحكومية عالية القيمة" : "High-Value Government Keywords"}
            </h2>
          </div>

          <div className="grid gap-6">
            {transactionalKeywords.map((keyword) => (
              <Card key={keyword.id} className="border-l-4 border-l-green-600">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getIntentIcon(keyword.intent)}
                        <Badge variant="outline">{keyword.intent}</Badge>
                        <Badge className={keyword.monetaryValue === "high" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {keyword.monetaryValue} value
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mb-1">
                        {language === "ar" && keyword.keywordAr ? keyword.keywordAr : keyword.keyword}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Volume: {keyword.searchVolume.toLocaleString()}</span>
                        <span className={getCompetitionColor(keyword.competitionLevel)}>
                          {keyword.competitionLevel} competition
                        </span>
                        <span>Gov Relevance: {keyword.governmentRelevance}%</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-2xl font-bold text-green-600">
                        {keyword.currentRanking ? `#${keyword.currentRanking}` : "Unranked"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Target: #{keyword.targetRanking}
                      </div>
                      <div className="text-xs text-blue-600">
                        {keyword.decisionMakerReach}% exec reach
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">
                        {language === "ar" ? "الاستراتيجيات ذات الصلة" : "Related Strategies"}:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {keyword.relatedStrategies.map((strategyId, index) => {
                          const strategy = governmentStrategies.find(s => s.id === strategyId);
                          return (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {strategy ? (language === "ar" ? strategy.titleAr : strategy.title).substring(0, 30) + "..." : strategyId}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-gray-500">
                          {language === "ar" ? "مستوى المنافسة" : "Competition Level"}:
                        </span>
                        <Progress 
                          value={keyword.competitionLevel === "low" ? 25 : keyword.competitionLevel === "medium" ? 60 : 90} 
                          className="h-2" 
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-gray-500">
                          {language === "ar" ? "وصول صناع القرار" : "Decision Maker Reach"}:
                        </span>
                        <Progress value={keyword.decisionMakerReach} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {language === "ar" ? "مقاييس الامتثال الحكومي" : "Government Compliance Metrics"}
            </h2>
          </div>

          <div className="grid gap-6">
            {complianceMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{metric.metric}</h3>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(metric.trend)}
                      <span className="text-sm text-gray-600">{metric.trend}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress to Target</span>
                      <span>{metric.currentValue}/{metric.targetValue}</span>
                    </div>
                    
                    <Progress 
                      value={(metric.currentValue / metric.targetValue) * 100} 
                      className="h-3"
                    />
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Source: {metric.source}</span>
                      <span>Updated: {metric.lastUpdated}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  {language === "ar" ? "أهم الإنجازات" : "Key Achievements"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      {language === "ar" ? "94% امتثال لاستراتيجية الذكاء الاصطناعي" : "94% UAE AI Strategy Alignment"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      {language === "ar" ? "5 كلمات مفتاحية في أعلى 10 نتائج" : "5 Keywords in Top 10 Rankings"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">
                      {language === "ar" ? "89% تغطية للوثائق الرسمية" : "89% Official Document Coverage"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {language === "ar" ? "أولويات التحسين" : "Optimization Priorities"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm">
                      {language === "ar" ? "تحسين كلمات المشتريات الحكومية" : "Improve Government Procurement Keywords"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm">
                      {language === "ar" ? "زيادة تغطية دبي 2040" : "Expand Dubai 2040 Coverage"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm">
                      {language === "ar" ? "إضافة محتوى الاستدامة" : "Add Sustainability Content"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}