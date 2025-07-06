import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Shield, 
  Globe,
  Users,
  Zap,
  Target,
  CheckCircle,
  AlertTriangle,
  Heart,
  MessageSquare,
  Search,
  Database,
  Eye
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { MetaTags } from "@/components/seo/meta-tags";

interface MetricCard {
  title: string;
  titleAr: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  description: string;
  descriptionAr: string;
}

export default function PlatformAnalysis() {
  const { language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");

  const mainMetrics: MetricCard[] = [
    {
      title: "Sentiment Analysis Accuracy",
      titleAr: "دقة تحليل المشاعر",
      value: 82,
      icon: <Heart className="w-6 h-6" />,
      color: "from-rose-500 to-pink-500",
      description: "High-precision sentiment detection across Arabic and English content",
      descriptionAr: "كشف عالي الدقة للمشاعر عبر المحتوى العربي والإنجليزي"
    },
    {
      title: "Proactive Monitoring",
      titleAr: "الرصد الاستباقي",
      value: 78,
      icon: <Eye className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
      description: "Real-time event detection and alert capabilities",
      descriptionAr: "قدرات الكشف والتنبيه للأحداث في الوقت الفعلي"
    },
    {
      title: "Data Source Coverage",
      titleAr: "تغطية مصادر البيانات",
      value: 85,
      icon: <Database className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
      description: "Comprehensive monitoring across multiple platforms",
      descriptionAr: "رصد شامل عبر منصات متعددة"
    },
    {
      title: "Processing Speed",
      titleAr: "سرعة المعالجة",
      value: 90,
      icon: <Zap className="w-6 h-6" />,
      color: "from-yellow-500 to-orange-500",
      description: "Fast analysis and response times",
      descriptionAr: "تحليل سريع وأوقات استجابة فورية"
    }
  ];

  const sentimentComponents = [
    { name: language === "ar" ? "النمذجة اللغوية" : "Language Modeling", weight: 30, ar: "النمذجة اللغوية" },
    { name: language === "ar" ? "السياق الثقافي" : "Cultural Context", weight: 25, ar: "السياق الثقافي" },
    { name: language === "ar" ? "تحليل المحتوى" : "Content Analysis", weight: 25, ar: "تحليل المحتوى" },
    { name: language === "ar" ? "التحقق من البيانات" : "Data Validation", weight: 20, ar: "التحقق من البيانات" }
  ];

  const monitoringSources = [
    { platform: "Twitter/X", coverage: 95, arabic: "تويتر/إكس" },
    { platform: "Facebook", coverage: 88, arabic: "فيسبوك" },
    { platform: "Instagram", coverage: 82, arabic: "إنستغرام" },
    { platform: "LinkedIn", coverage: 75, arabic: "لينكدإن" },
    { platform: "News Sites", coverage: 90, arabic: "المواقع الإخبارية" },
    { platform: "Forums", coverage: 70, arabic: "المنتديات" }
  ];

  const sectorApplications = [
    { sector: "Government", effectiveness: 85, arabic: "الحكومة" },
    { sector: "Business", effectiveness: 80, arabic: "الأعمال" },
    { sector: "Media", effectiveness: 88, arabic: "الإعلام" },
    { sector: "Healthcare", effectiveness: 75, arabic: "الرعاية الصحية" },
    { sector: "Education", effectiveness: 78, arabic: "التعليم" },
    { sector: "Finance", effectiveness: 82, arabic: "المالية" }
  ];

  const challengesEn = [
    "Processing Arabic language complexities",
    "Understanding cultural expressions",
    "Reducing algorithmic bias",
    "Improving noise filtering"
  ];

  const challengesAr = [
    "معالجة تعقيدات اللغة العربية",
    "فهم التعبيرات الثقافية",
    "تقليل التحيزات في الخوارزميات",
    "تحسين تصفية الضوضاء"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir={isRTL ? "rtl" : "ltr"}>
      <MetaTags
        title={language === "ar" ? "تحليل فعالية منصة المستكشف" : "Al-Mustakshef Platform Analysis"}
        description={language === "ar" ? "تحليل شامل لفعالية منصة المستكشف في تحليل المشاعر والرصد الاستباقي" : "Comprehensive analysis of Al-Mustakshef platform effectiveness in sentiment analysis and proactive monitoring"}
        keywords="platform analysis, sentiment analysis, monitoring, effectiveness, infographic"
        language={language}
      />
      <Header />
      
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-green-100 rounded-full text-blue-800 text-sm font-medium mb-4">
              <BarChart3 className="w-4 h-4 mr-2" />
              {language === "ar" ? "تحليل فعالية المنصة" : "Platform Effectiveness Analysis"}
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              {language === "ar" ? "منصة المستكشف للذكاء الإعلامي" : "Al-Mustakshef Media Intelligence Platform"}
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {language === "ar" 
                ? "تحليل شامل للأداء والقدرات التقنية لمنصة المستكشف في مجال تحليل المشاعر والرصد الإعلامي"
                : "Comprehensive performance and technical capability analysis of Al-Mustakshef platform in sentiment analysis and media monitoring"
              }
            </p>
          </div>

          {/* Main Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainMetrics.map((metric, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color} text-white`}>
                      {metric.icon}
                    </div>
                    <span className="text-3xl font-bold text-slate-700">{metric.value}%</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-slate-800 mb-2">
                    {language === "ar" ? metric.titleAr : metric.title}
                  </h3>
                  <Progress value={metric.value} className="mb-2" />
                  <p className="text-sm text-slate-600">
                    {language === "ar" ? metric.descriptionAr : metric.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Analysis Tabs */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                {language === "ar" ? "التحليل التفصيلي" : "Detailed Analysis"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">
                    {language === "ar" ? "نظرة عامة" : "Overview"}
                  </TabsTrigger>
                  <TabsTrigger value="sentiment">
                    {language === "ar" ? "تحليل المشاعر" : "Sentiment"}
                  </TabsTrigger>
                  <TabsTrigger value="monitoring">
                    {language === "ar" ? "الرصد" : "Monitoring"}
                  </TabsTrigger>
                  <TabsTrigger value="sectors">
                    {language === "ar" ? "القطاعات" : "Sectors"}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          {language === "ar" ? "نقاط القوة الرئيسية" : "Key Strengths"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>{language === "ar" ? "دقة عالية في تحليل المشاعر (82%)" : "High sentiment analysis accuracy (82%)"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>{language === "ar" ? "رصد استباقي فعال (78%)" : "Effective proactive monitoring (78%)"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>{language === "ar" ? "تغطية شاملة لمصادر البيانات" : "Comprehensive data source coverage"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>{language === "ar" ? "معالجة سريعة للبيانات" : "Fast data processing"}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          {language === "ar" ? "التحديات والتحسينات" : "Challenges & Improvements"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {(language === "ar" ? challengesAr : challengesEn).map((challenge, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                            <span className="text-sm">{challenge}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="sentiment" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{language === "ar" ? "مكونات تحليل المشاعر" : "Sentiment Analysis Components"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {sentimentComponents.map((component, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{component.name}</span>
                            <span className="text-sm font-bold">{component.weight}%</span>
                          </div>
                          <Progress value={component.weight} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="monitoring" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{language === "ar" ? "تغطية مصادر البيانات" : "Data Source Coverage"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {monitoringSources.map((source, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {language === "ar" ? source.arabic : source.platform}
                            </span>
                            <span className="text-sm font-bold">{source.coverage}%</span>
                          </div>
                          <Progress value={source.coverage} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sectors" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{language === "ar" ? "فعالية التطبيقات القطاعية" : "Sector Application Effectiveness"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {sectorApplications.map((sector, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {language === "ar" ? sector.arabic : sector.sector}
                            </span>
                            <span className="text-sm font-bold">{sector.effectiveness}%</span>
                          </div>
                          <Progress value={sector.effectiveness} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Executive Summary */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {language === "ar" ? "الملخص التنفيذي" : "Executive Summary"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    {language === "ar" ? "تحليل المشاعر (82%)" : "Sentiment Analysis (82%)"}
                  </h4>
                  <p className="text-sm text-slate-700">
                    {language === "ar" 
                      ? "توفر منصة المستكشف تحليلاً واقعياً لمشاعر الرأي العام بدرجة عالية، مدعومة بشمولية مصادر البيانات وتقنيات الذكاء الاصطناعي المتقدمة."
                      : "Al-Mustakshef provides highly realistic public opinion sentiment analysis, supported by comprehensive data sources and advanced AI technologies."
                    }
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {language === "ar" ? "الرصد الاستباقي (78%)" : "Proactive Monitoring (78%)"}
                  </h4>
                  <p className="text-sm text-slate-700">
                    {language === "ar" 
                      ? "تقدم المنصة قدرات قوية للرصد الاستباقي من خلال المراقبة في الوقت الفعلي ونظام تنبيهات متطور."
                      : "The platform offers strong proactive monitoring capabilities through real-time surveillance and advanced alert systems."
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}