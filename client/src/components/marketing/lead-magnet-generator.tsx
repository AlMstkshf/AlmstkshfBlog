import { useState, useEffect } from "react";
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
import { 
  FileText, 
  Download, 
  Users, 
  Calendar,
  Share2,
  Target,
  BarChart3,
  Globe,
  Building,
  Star,
  Plus,
  Edit,
  Eye,
  Copy,
  CheckCircle,
  TrendingUp,
  Award,
  Briefcase
} from "lucide-react";

interface LeadMagnet {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  category: "government_intelligence" | "ai_strategy" | "media_monitoring" | "crisis_management" | "performance_analysis";
  targetAudience: "decision_makers" | "government_officials" | "analysts" | "executives" | "consultants";
  reportType: "strategic_report" | "case_study" | "white_paper" | "implementation_guide" | "performance_benchmark";
  pageCount: number;
  downloadCount: number;
  conversionRate: number;
  lastUpdated: string;
  featured: boolean;
  governmentAlignment: string[];
  expertContributors: string[];
  preview: {
    coverImage: string;
    tableOfContents: string[];
    keyInsights: string[];
  };
  distribution: {
    channels: string[];
    partnerships: string[];
    webinarTieIn?: string;
  };
}

interface DemoRequest {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  category: "platform_demo" | "ai_capabilities" | "integration_demo" | "custom_solution";
  duration: number; // minutes
  targetAudience: string[];
  prerequisites: string[];
  outcomes: string[];
  requestCount: number;
  conversionRate: number;
  featured: boolean;
  governmentFocus: boolean;
}

interface Webinar {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  presenter: string;
  presenterTitle: string;
  organization: string;
  scheduledDate: string;
  duration: number;
  capacity: number;
  registrations: number;
  category: "government_ai" | "media_intelligence" | "strategic_planning" | "crisis_management";
  targetAudience: string[];
  learningObjectives: string[];
  governmentPartners: string[];
  leadMagnetTieIn?: string;
  recordingAvailable: boolean;
}

export function LeadMagnetGenerator() {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("lead-magnets");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Lead magnets based on actual Al-Mustakshef capabilities
  const leadMagnets: LeadMagnet[] = [
    {
      id: "1",
      title: "UAE AI Strategy 2031: Implementation Roadmap for Government Entities",
      titleAr: "استراتيجية الذكاء الاصطناعي الإماراتية 2031: خارطة طريق التنفيذ للجهات الحكومية",
      description: "Comprehensive strategic guide for implementing AI initiatives aligned with UAE's national strategy, featuring case studies from successful government implementations.",
      descriptionAr: "دليل استراتيجي شامل لتنفيذ مبادرات الذكاء الاصطناعي المتماشية مع الاستراتيجية الوطنية الإماراتية",
      category: "ai_strategy",
      targetAudience: "decision_makers",
      reportType: "strategic_report",
      pageCount: 45,
      downloadCount: 1247,
      conversionRate: 8.3,
      lastUpdated: "2024-12-10",
      featured: true,
      governmentAlignment: ["UAE AI Strategy 2031", "Digital Government"],
      expertContributors: ["Dr. Ahmed Al-Mansoori", "Sarah Al-Zahra"],
      preview: {
        coverImage: "/reports/uae-ai-strategy-cover.png",
        tableOfContents: [
          "Executive Summary",
          "UAE AI Strategy Overview",
          "Implementation Framework",
          "Government Use Cases",
          "ROI Analysis",
          "Risk Management",
          "Future Roadmap"
        ],
        keyInsights: [
          "94% alignment with national AI objectives",
          "3.2x ROI improvement in pilot programs",
          "15 successful government implementations"
        ]
      },
      distribution: {
        channels: ["Website", "LinkedIn", "Government Portals"],
        partnerships: ["UAE Government Excellence Program", "Dubai Future Foundation"],
        webinarTieIn: "AI Implementation Masterclass"
      }
    },
    {
      id: "2",
      title: "GEM 2.1 Performance Measurement: Advanced KPI Framework",
      titleAr: "قياس الأداء GEM 2.1: إطار مؤشرات الأداء المتقدم",
      description: "Strategic framework for implementing GEM 2.1 KPIs with media monitoring integration, featuring real-time dashboard templates and performance benchmarks.",
      category: "performance_analysis",
      targetAudience: "government_officials",
      reportType: "implementation_guide",
      pageCount: 32,
      downloadCount: 892,
      conversionRate: 12.1,
      lastUpdated: "2024-12-08",
      featured: true,
      governmentAlignment: ["GEM 2.1", "Performance Excellence"],
      expertContributors: ["Mohammed Al-Rashid"],
      preview: {
        coverImage: "/reports/gem-framework-cover.png",
        tableOfContents: [
          "GEM 2.1 Overview",
          "KPI Framework Design",
          "Media Integration",
          "Dashboard Templates",
          "Benchmarking Analysis",
          "Implementation Roadmap"
        ],
        keyInsights: [
          "91% framework adoption rate",
          "40% improvement in performance tracking",
          "Real-time monitoring capabilities"
        ]
      },
      distribution: {
        channels: ["Government Networks", "Professional Associations"],
        partnerships: ["UAE Government Excellence Program"]
      }
    },
    {
      id: "3",
      title: "Crisis Communication in the Digital Age: Gulf Government Playbook",
      titleAr: "الاتصال في الأزمات في العصر الرقمي: دليل الحكومات الخليجية",
      description: "Comprehensive crisis management framework tailored for Gulf government entities, including social media monitoring, reputation management, and stakeholder communication strategies.",
      category: "crisis_management",
      targetAudience: "executives",
      reportType: "white_paper",
      pageCount: 38,
      downloadCount: 756,
      conversionRate: 15.7,
      lastUpdated: "2024-12-05",
      featured: false,
      governmentAlignment: ["Crisis Management", "Digital Government"],
      expertContributors: ["Fatima Al-Zahra", "Omar Al-Mansouri"],
      preview: {
        coverImage: "/reports/crisis-communication-cover.png",
        tableOfContents: [
          "Crisis Communication Fundamentals",
          "Digital Age Challenges",
          "Gulf-Specific Considerations",
          "Monitoring and Detection",
          "Response Frameworks",
          "Case Studies",
          "Recovery Strategies"
        ],
        keyInsights: [
          "67% faster crisis response time",
          "85% reputation recovery rate",
          "Multi-channel communication effectiveness"
        ]
      },
      distribution: {
        channels: ["Government Channels", "Security Networks"],
        partnerships: ["GCC Security Council", "Regional Government Networks"]
      }
    }
  ];

  const demoRequests: DemoRequest[] = [
    {
      id: "1",
      title: "Al-Mustakshef Platform Comprehensive Demo",
      titleAr: "عرض توضيحي شامل لمنصة المستكشف",
      description: "Full platform demonstration showcasing Arabic sentiment analysis, government KPI tracking, crisis monitoring, and strategic intelligence capabilities.",
      category: "platform_demo",
      duration: 45,
      targetAudience: ["decision_makers", "government_officials", "executives"],
      prerequisites: ["Basic understanding of media monitoring", "Government leadership role"],
      outcomes: [
        "Understanding of platform capabilities",
        "ROI projection for your organization",
        "Implementation timeline discussion",
        "Custom solution recommendations"
      ],
      requestCount: 156,
      conversionRate: 34.6,
      featured: true,
      governmentFocus: true
    },
    {
      id: "2",
      title: "AI-Powered Arabic Sentiment Analysis Demo",
      titleAr: "عرض توضيحي لتحليل المشاعر العربية بالذكاء الاصطناعي",
      description: "Specialized demonstration of our proprietary Arabic sentiment analysis technology, including dialect detection and cultural context understanding.",
      category: "ai_capabilities",
      duration: 30,
      targetAudience: ["analysts", "consultants"],
      prerequisites: ["Technical background in NLP", "Arabic language familiarity"],
      outcomes: [
        "Technical architecture overview",
        "Accuracy benchmarks review",
        "Integration possibilities",
        "Custom model development options"
      ],
      requestCount: 89,
      conversionRate: 28.1,
      featured: true,
      governmentFocus: false
    },
    {
      id: "3",
      title: "GEM 2.1 Integration Demo",
      titleAr: "عرض توضيحي لتكامل GEM 2.1",
      description: "Demonstration of seamless integration with GEM 2.1 framework, including automated KPI tracking, performance dashboards, and compliance reporting.",
      category: "integration_demo",
      duration: 35,
      targetAudience: ["government_officials"],
      prerequisites: ["Familiarity with GEM framework", "Government sector experience"],
      outcomes: [
        "GEM integration roadmap",
        "Compliance validation process",
        "Performance improvement projections",
        "Implementation support plan"
      ],
      requestCount: 67,
      conversionRate: 41.8,
      featured: false,
      governmentFocus: true
    }
  ];

  const webinars: Webinar[] = [
    {
      id: "1",
      title: "AI Implementation Masterclass for Gulf Governments",
      titleAr: "دورة إتقان تطبيق الذكاء الاصطناعي للحكومات الخليجية",
      description: "Comprehensive masterclass on implementing AI solutions in government settings, featuring case studies from successful UAE and Saudi Arabia implementations.",
      presenter: "Dr. Ahmed Al-Mansoori",
      presenterTitle: "Director of Digital Transformation",
      organization: "UAE Government Excellence Program",
      scheduledDate: "2024-12-20T14:00:00Z",
      duration: 90,
      capacity: 500,
      registrations: 347,
      category: "government_ai",
      targetAudience: ["decision_makers", "government_officials"],
      learningObjectives: [
        "Understand AI implementation frameworks",
        "Learn from successful government case studies",
        "Develop strategic AI roadmaps",
        "Navigate regulatory and compliance requirements"
      ],
      governmentPartners: ["UAE Government", "Saudi Digital Government Authority"],
      leadMagnetTieIn: "UAE AI Strategy 2031: Implementation Roadmap",
      recordingAvailable: true
    },
    {
      id: "2",
      title: "Advanced Media Monitoring for Crisis Management",
      titleAr: "مراقبة الإعلام المتقدمة لإدارة الأزمات",
      description: "Strategic webinar on leveraging advanced media monitoring for proactive crisis management, featuring real-time case studies and response frameworks.",
      presenter: "Sarah Al-Zahra",
      presenterTitle: "Chief Data Officer",
      organization: "Al-Mustakshef Platform",
      scheduledDate: "2024-12-25T15:30:00Z",
      duration: 60,
      capacity: 300,
      registrations: 198,
      category: "crisis_management",
      targetAudience: ["executives", "consultants"],
      learningObjectives: [
        "Master crisis detection techniques",
        "Implement real-time monitoring systems",
        "Develop response protocols",
        "Measure crisis impact and recovery"
      ],
      governmentPartners: ["Dubai Media Office", "Abu Dhabi Government"],
      leadMagnetTieIn: "Crisis Communication in the Digital Age",
      recordingAvailable: true
    },
    {
      id: "3",
      title: "Strategic Intelligence for Executive Decision Making",
      titleAr: "الاستخبارات الاستراتيجية لاتخاذ القرارات التنفيذية",
      description: "Executive-level webinar on leveraging strategic intelligence for informed decision making, featuring insights from government and private sector leaders.",
      presenter: "Mohammed Al-Rashid",
      presenterTitle: "Senior Strategic Advisor",
      organization: "Dubai Future Foundation",
      scheduledDate: "2025-01-05T16:00:00Z",
      duration: 75,
      capacity: 200,
      registrations: 156,
      category: "strategic_planning",
      targetAudience: ["decision_makers", "executives"],
      learningObjectives: [
        "Transform data into actionable intelligence",
        "Develop strategic foresight capabilities",
        "Build intelligence-driven decision frameworks",
        "Implement competitive advantage strategies"
      ],
      governmentPartners: ["Dubai Future Foundation", "Abu Dhabi Investment Authority"],
      recordingAvailable: false
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "government_intelligence": return <Building className="w-4 h-4" />;
      case "ai_strategy": return <Target className="w-4 h-4" />;
      case "media_monitoring": return <Eye className="w-4 h-4" />;
      case "crisis_management": return <Star className="w-4 h-4" />;
      case "performance_analysis": return <BarChart3 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case "decision_makers": return "bg-red-100 text-red-800";
      case "government_officials": return "bg-blue-100 text-blue-800";
      case "executives": return "bg-purple-100 text-purple-800";
      case "analysts": return "bg-green-100 text-green-800";
      case "consultants": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "ar" ? "ar-AE" : "en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {language === "ar" ? "مولد المحتوى التسويقي الذكي" : "Smart Content Distribution System"}
        </h1>
        <p className="text-gray-600">
          {language === "ar" 
            ? "إدارة التقارير القابلة للتحميل وطلبات العروض التوضيحية والندوات الإلكترونية"
            : "Manage downloadable reports, demo requests, and webinar distribution"
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lead-magnets">
            {language === "ar" ? "التقارير القابلة للتحميل" : "Lead Magnets"}
          </TabsTrigger>
          <TabsTrigger value="demos">
            {language === "ar" ? "طلبات العروض التوضيحية" : "Demo Requests"}
          </TabsTrigger>
          <TabsTrigger value="webinars">
            {language === "ar" ? "الندوات الإلكترونية" : "Webinars"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lead-magnets" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {language === "ar" ? "التقارير الاستراتيجية القابلة للتحميل" : "Strategic Downloadable Reports"}
            </h2>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {language === "ar" ? "إنشاء تقرير جديد" : "Create New Report"}
            </Button>
          </div>

          <div className="grid gap-6">
            {leadMagnets.map((magnet) => (
              <Card key={magnet.id} className={`border-l-4 ${magnet.featured ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(magnet.category)}
                        <Badge variant="outline">{magnet.reportType}</Badge>
                        <Badge className={getAudienceColor(magnet.targetAudience)}>
                          {magnet.targetAudience}
                        </Badge>
                        {magnet.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {language === "ar" ? "مميز" : "Featured"}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mb-2">
                        {language === "ar" && magnet.titleAr ? magnet.titleAr : magnet.title}
                      </CardTitle>
                      <p className="text-gray-600 text-sm mb-3">
                        {language === "ar" && magnet.descriptionAr ? magnet.descriptionAr : magnet.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {magnet.pageCount} pages
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {magnet.downloadCount.toLocaleString()} downloads
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {magnet.conversionRate}% conversion
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-blue-600">{magnet.conversionRate}%</div>
                      <div className="text-xs text-gray-500">
                        {language === "ar" ? "معدل التحويل" : "Conversion Rate"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {language === "ar" ? "محتويات التقرير" : "Table of Contents"}
                      </h4>
                      <ul className="text-sm space-y-1">
                        {magnet.preview.tableOfContents.map((item, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        {language === "ar" ? "الرؤى الرئيسية" : "Key Insights"}
                      </h4>
                      <div className="space-y-2">
                        {magnet.preview.keyInsights.map((insight, index) => (
                          <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                            {insight}
                          </div>
                        ))}
                      </div>
                      
                      <h4 className="font-semibold mt-4 mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {language === "ar" ? "الخبراء المساهمون" : "Expert Contributors"}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {magnet.expertContributors.map((expert, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {expert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      {language === "ar" ? "آخر تحديث" : "Last updated"}: {magnet.lastUpdated}
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
                        <Download className="w-3 h-3" />
                        {language === "ar" ? "تحميل" : "Download"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="demos" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {language === "ar" ? "طلبات العروض التوضيحية" : "Demo Request Management"}
            </h2>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {language === "ar" ? "إضافة عرض توضيحي" : "Add Demo Type"}
            </Button>
          </div>

          <div className="grid gap-6">
            {demoRequests.map((demo) => (
              <Card key={demo.id} className={`border-l-4 ${demo.featured ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-5 h-5 text-green-600" />
                        <Badge variant="outline">{demo.category}</Badge>
                        <Badge variant="secondary">{demo.duration} min</Badge>
                        {demo.governmentFocus && (
                          <Badge className="bg-blue-100 text-blue-800">
                            {language === "ar" ? "حكومي" : "Government Focus"}
                          </Badge>
                        )}
                        {demo.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {language === "ar" ? "مميز" : "Featured"}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mb-2">
                        {language === "ar" && demo.titleAr ? demo.titleAr : demo.title}
                      </CardTitle>
                      <p className="text-gray-600 text-sm mb-3">{demo.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {demo.requestCount} requests
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {demo.conversionRate}% conversion
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {demo.duration} minutes
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-green-600">{demo.conversionRate}%</div>
                      <div className="text-xs text-gray-500">
                        {language === "ar" ? "معدل التحويل" : "Conversion Rate"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">
                        {language === "ar" ? "الجمهور المستهدف" : "Target Audience"}:
                      </h4>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {demo.targetAudience.map((audience, index) => (
                          <Badge key={index} className={getAudienceColor(audience)} variant="secondary">
                            {audience}
                          </Badge>
                        ))}
                      </div>
                      
                      <h4 className="font-semibold mb-2">
                        {language === "ar" ? "المتطلبات المسبقة" : "Prerequisites"}:
                      </h4>
                      <ul className="text-sm space-y-1">
                        {demo.prerequisites.map((req, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-blue-500" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">
                        {language === "ar" ? "النتائج المتوقعة" : "Expected Outcomes"}:
                      </h4>
                      <ul className="text-sm space-y-1">
                        {demo.outcomes.map((outcome, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Target className="w-3 h-3 text-green-500" />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      {demo.requestCount} {language === "ar" ? "طلب مجدول" : "requests scheduled"}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        {language === "ar" ? "جدولة عرض توضيحي" : "Schedule Demo"}
                      </Button>
                      <Button variant="outline" size="sm">
                        {language === "ar" ? "تحرير" : "Edit"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webinars" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {language === "ar" ? "الندوات الإلكترونية المجدولة" : "Scheduled Webinars"}
            </h2>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {language === "ar" ? "جدولة ندوة جديدة" : "Schedule New Webinar"}
            </Button>
          </div>

          <div className="grid gap-6">
            {webinars.map((webinar) => (
              <Card key={webinar.id} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <Badge variant="outline">{webinar.category}</Badge>
                        <Badge variant="secondary">{webinar.duration} min</Badge>
                        {webinar.recordingAvailable && (
                          <Badge className="bg-green-100 text-green-800">
                            {language === "ar" ? "التسجيل متاح" : "Recording Available"}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mb-2">
                        {language === "ar" && webinar.titleAr ? webinar.titleAr : webinar.title}
                      </CardTitle>
                      <p className="text-gray-600 text-sm mb-3">{webinar.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {webinar.presenter}
                        </span>
                        <span>{webinar.presenterTitle}</span>
                        <span>{webinar.organization}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(webinar.scheduledDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {webinar.registrations}/{webinar.capacity} registered
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round((webinar.registrations / webinar.capacity) * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {language === "ar" ? "معدل التسجيل" : "Registration Rate"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">
                        {language === "ar" ? "أهداف التعلم" : "Learning Objectives"}:
                      </h4>
                      <ul className="text-sm space-y-1 mb-4">
                        {webinar.learningObjectives.map((objective, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Target className="w-3 h-3 text-purple-500" />
                            {objective}
                          </li>
                        ))}
                      </ul>
                      
                      <h4 className="font-semibold mb-2">
                        {language === "ar" ? "الجمهور المستهدف" : "Target Audience"}:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {webinar.targetAudience.map((audience, index) => (
                          <Badge key={index} className={getAudienceColor(audience)} variant="secondary">
                            {audience}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">
                        {language === "ar" ? "الشركاء الحكوميون" : "Government Partners"}:
                      </h4>
                      <div className="space-y-1 mb-4">
                        {webinar.governmentPartners.map((partner, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Building className="w-3 h-3 text-blue-500" />
                            {partner}
                          </div>
                        ))}
                      </div>
                      
                      {webinar.leadMagnetTieIn && (
                        <div>
                          <h4 className="font-semibold mb-2">
                            {language === "ar" ? "التقرير المرتبط" : "Related Report"}:
                          </h4>
                          <div className="p-2 bg-purple-50 rounded text-sm">
                            {webinar.leadMagnetTieIn}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      {webinar.registrations} {language === "ar" ? "مسجل" : "registrations"} • 
                      {webinar.capacity - webinar.registrations} {language === "ar" ? "مقعد متاح" : "seats available"}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        {language === "ar" ? "التسجيل" : "Register"}
                      </Button>
                      <Button variant="outline" size="sm">
                        {language === "ar" ? "مشاركة" : "Share"}
                      </Button>
                      <Button variant="outline" size="sm">
                        {language === "ar" ? "تحرير" : "Edit"}
                      </Button>
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