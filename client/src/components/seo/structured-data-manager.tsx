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
  Code2, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  FileText,
  Users,
  Building,
  Star,
  Quote,
  HelpCircle,
  Plus,
  Edit,
  Trash2
} from "lucide-react";

interface StructuredDataItem {
  id: string;
  type: "Article" | "Organization" | "FAQPage" | "GovernmentService" | "Person" | "Event";
  title: string;
  description: string;
  status: "active" | "draft" | "needs_review";
  lastUpdated: string;
  schema: object;
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

interface ExpertQuote {
  id: string;
  authorName: string;
  authorTitle: string;
  organization: string;
  quote: string;
  quoteAr?: string;
  context: string;
  credibility: "high" | "medium" | "low";
  relevantTopics: string[];
  dateAdded: string;
}

interface FAQ {
  id: string;
  question: string;
  questionAr?: string;
  answer: string;
  answerAr?: string;
  category: "government" | "executive" | "technical" | "strategic";
  targetAudience: "decision_makers" | "analysts" | "general";
  keywords: string[];
  officialSource?: string;
  lastUpdated: string;
}

export function StructuredDataManager() {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("structured-data");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock data for demonstration
  const structuredDataItems: StructuredDataItem[] = [
    {
      id: "1",
      type: "Article",
      title: "Arabic Sentiment Analysis Article Schema",
      description: "Schema.org markup for comprehensive Arabic sentiment analysis articles",
      status: "active",
      lastUpdated: "2024-12-15",
      schema: {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Complete Guide to Arabic Sentiment Analysis",
        "author": {
          "@type": "Organization",
          "name": "Al-Mustakshef"
        },
        "datePublished": "2024-12-15",
        "dateModified": "2024-12-15",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "https://almustakshef.com/arabic-sentiment-analysis"
        }
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: ["Consider adding more specific author information"]
      }
    },
    {
      id: "2",
      type: "Organization",
      title: "Al-Mustakshef Organization Schema",
      description: "Official organization markup for Al-Mustakshef platform",
      status: "active",
      lastUpdated: "2024-12-14",
      schema: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Al-Mustakshef",
        "url": "https://almustakshef.com",
        "logo": "https://almustakshef.com/logo.png",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+971-4-xxx-xxxx",
          "contactType": "customer service"
        }
      },
      validation: {
        isValid: true,
        errors: [],
        warnings: []
      }
    },
    {
      id: "3",
      type: "FAQPage",
      title: "Government Decision Makers FAQ Schema",
      description: "Structured data for high-level government FAQ content",
      status: "draft",
      lastUpdated: "2024-12-13",
      schema: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does GEM 2.1 KPI integration enhance government performance measurement?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "GEM 2.1 KPI integration provides comprehensive performance tracking..."
            }
          }
        ]
      },
      validation: {
        isValid: false,
        errors: ["Missing required mainEntity property completeness"],
        warnings: ["Consider adding more FAQ items for better coverage"]
      }
    }
  ];

  const expertQuotes: ExpertQuote[] = [
    {
      id: "1",
      authorName: "Dr. Ahmed Al-Mansoori",
      authorTitle: "Director of Digital Transformation",
      organization: "UAE Government Excellence Program",
      quote: "The integration of advanced sentiment analysis in Arabic dialects represents a significant breakthrough in understanding public opinion across the Gulf region.",
      quoteAr: "يمثل دمج تحليل المشاعر المتقدم في اللهجات العربية اختراقاً مهماً في فهم الرأي العام عبر منطقة الخليج.",
      context: "Speaking at the Dubai Government Innovation Summit 2024",
      credibility: "high",
      relevantTopics: ["Arabic Sentiment Analysis", "Government Innovation", "Digital Transformation"],
      dateAdded: "2024-12-15"
    },
    {
      id: "2",
      authorName: "Sarah Al-Zahra",
      authorTitle: "Chief Data Officer",
      organization: "Al-Mustakshef Platform",
      quote: "Our proprietary algorithms can distinguish between MSA and regional dialects with 94% accuracy, providing unprecedented insights into regional sentiment patterns.",
      context: "Al-Mustakshef Technical Report 2024",
      credibility: "high",
      relevantTopics: ["MSA Processing", "Dialect Detection", "Technical Innovation"],
      dateAdded: "2024-12-14"
    },
    {
      id: "3",
      authorName: "Mohammed Al-Rashid",
      authorTitle: "Senior Strategic Advisor",
      organization: "Dubai Future Foundation",
      quote: "The GEM 2.1 framework integration with media monitoring systems enables real-time performance tracking that aligns with national strategic objectives.",
      quoteAr: "يمكّن تكامل إطار عمل GEM 2.1 مع أنظمة مراقبة الإعلام من تتبع الأداء في الوقت الفعلي بما يتماشى مع الأهداف الاستراتيجية الوطنية.",
      context: "UAE Vision 2071 Implementation Conference",
      credibility: "high",
      relevantTopics: ["GEM 2.1", "Strategic Planning", "Performance Measurement"],
      dateAdded: "2024-12-13"
    }
  ];

  const faqs: FAQ[] = [
    {
      id: "1",
      question: "How does Al-Mustakshef's Arabic sentiment analysis align with UAE's National Strategy for Artificial Intelligence 2031?",
      questionAr: "كيف يتماشى تحليل المشاعر العربية في المستكشف مع الاستراتيجية الوطنية للذكاء الاصطناعي 2031؟",
      answer: "Our Arabic sentiment analysis directly supports the UAE AI Strategy 2031 by providing specialized capabilities for understanding Arabic language nuances, supporting government decision-making with culturally-aware AI solutions, and contributing to the nation's goal of becoming a global AI leader through innovative Arabic NLP technologies.",
      answerAr: "يدعم تحليل المشاعر العربية الخاص بنا استراتيجية الذكاء الاصطناعي الإماراتية 2031 مباشرة من خلال توفير قدرات متخصصة لفهم دقائق اللغة العربية، ودعم اتخاذ القرارات الحكومية بحلول ذكاء اصطناعي مدركة ثقافياً، والمساهمة في هدف الدولة لتصبح رائدة عالمياً في الذكاء الاصطناعي.",
      category: "strategic",
      targetAudience: "decision_makers",
      keywords: ["UAE AI Strategy 2031", "Arabic sentiment analysis", "government AI", "cultural AI"],
      officialSource: "UAE National Strategy for Artificial Intelligence 2031",
      lastUpdated: "2024-12-15"
    },
    {
      id: "2",
      question: "What specific GEM 2.1 KPIs can be tracked through Al-Mustakshef's media monitoring system?",
      questionAr: "ما هي مؤشرات الأداء الرئيسية GEM 2.1 المحددة التي يمكن تتبعها من خلال نظام مراقبة الإعلام في المستكشف؟",
      answer: "Al-Mustakshef tracks key GEM 2.1 KPIs including Customer Happiness Index, Digital Government Maturity, Innovation Index, Sustainability Metrics, and Government Efficiency Ratings. Our system provides real-time monitoring of media sentiment around these performance indicators, enabling proactive reputation management and strategic communication.",
      answerAr: "يتتبع المستكشف مؤشرات الأداء الرئيسية GEM 2.1 بما في ذلك مؤشر سعادة العملاء، ونضج الحكومة الرقمية، ومؤشر الابتكار، ومقاييس الاستدامة، وتقييمات الكفاءة الحكومية.",
      category: "government",
      targetAudience: "analysts",
      keywords: ["GEM 2.1 KPIs", "government performance", "media monitoring", "reputation management"],
      officialSource: "UAE Government Excellence Program GEM 2.1 Framework",
      lastUpdated: "2024-12-14"
    },
    {
      id: "3",
      question: "How does the platform support crisis response frameworks for Gulf government entities?",
      questionAr: "كيف تدعم المنصة أطر الاستجابة للأزمات للجهات الحكومية الخليجية؟",
      answer: "Our crisis response framework provides real-time media monitoring, automated alert systems for emerging issues, sentiment analysis during crisis periods, stakeholder communication templates aligned with Gulf cultural norms, and post-crisis reputation recovery strategies. The system integrates with existing government communication protocols.",
      answerAr: "يوفر إطار الاستجابة للأزمات الخاص بنا مراقبة إعلامية في الوقت الفعلي، وأنظمة تنبيه آلية للقضايا الناشئة، وتحليل المشاعر أثناء فترات الأزمات.",
      category: "government",
      targetAudience: "decision_makers",
      keywords: ["crisis response", "Gulf governments", "media monitoring", "reputation management"],
      officialSource: "Gulf Cooperation Council Crisis Management Guidelines",
      lastUpdated: "2024-12-13"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      case "needs_review": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCredibilityColor = (credibility: string) => {
    switch (credibility) {
      case "high": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "government": return <Building className="w-4 h-4" />;
      case "executive": return <Users className="w-4 h-4" />;
      case "technical": return <Code2 className="w-4 h-4" />;
      case "strategic": return <Star className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {language === "ar" ? "مدير البيانات المنظمة وتحسين محركات البحث" : "Structured Data & SEO Manager"}
        </h1>
        <p className="text-gray-600">
          {language === "ar" 
            ? "إدارة البيانات المنظمة والاقتباسات الخبيرة والأسئلة الشائعة لتحسين مقاومة الذكاء الاصطناعي"
            : "Manage structured data, expert quotes, and FAQs for enhanced AI resistance"
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="structured-data">
            {language === "ar" ? "البيانات المنظمة" : "Structured Data"}
          </TabsTrigger>
          <TabsTrigger value="expert-quotes">
            {language === "ar" ? "اقتباسات الخبراء" : "Expert Quotes"}
          </TabsTrigger>
          <TabsTrigger value="government-faqs">
            {language === "ar" ? "الأسئلة الحكومية" : "Government FAQs"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structured-data" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {language === "ar" ? "إدارة البيانات المنظمة" : "Schema.org Structured Data Management"}
            </h2>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {language === "ar" ? "إضافة مخطط جديد" : "Add New Schema"}
            </Button>
          </div>

          <div className="grid gap-6">
            {structuredDataItems.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Code2 className="w-5 h-5 text-blue-600" />
                        <Badge variant="outline">{item.type}</Badge>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.validation.isValid ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Code2 className="w-4 h-4" />
                        {language === "ar" ? "مخطط JSON-LD" : "JSON-LD Schema"}
                      </h4>
                      <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto">
                        {JSON.stringify(item.schema, null, 2)}
                      </pre>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        {language === "ar" ? "التحقق من الصحة" : "Validation Status"}
                      </h4>
                      
                      {item.validation.errors.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-red-600 mb-1">
                            {language === "ar" ? "الأخطاء" : "Errors"}:
                          </h5>
                          <ul className="text-xs text-red-600 space-y-1">
                            {item.validation.errors.map((error, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {item.validation.warnings.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-yellow-600 mb-1">
                            {language === "ar" ? "التحذيرات" : "Warnings"}:
                          </h5>
                          <ul className="text-xs text-yellow-600 space-y-1">
                            {item.validation.warnings.map((warning, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        {language === "ar" ? "آخر تحديث" : "Last updated"}: {item.lastUpdated}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Edit className="w-3 h-3" />
                      {language === "ar" ? "تحرير" : "Edit"}
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Search className="w-3 h-3" />
                      {language === "ar" ? "اختبار" : "Test"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expert-quotes" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {language === "ar" ? "اقتباسات الخبراء والقادة" : "Expert & Leadership Quotes"}
            </h2>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {language === "ar" ? "إضافة اقتباس" : "Add Quote"}
            </Button>
          </div>

          <div className="grid gap-6">
            {expertQuotes.map((quote) => (
              <Card key={quote.id} className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Quote className="w-5 h-5 text-green-600" />
                        <Badge className={getCredibilityColor(quote.credibility)}>
                          {quote.credibility} credibility
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mb-1">{quote.authorName}</CardTitle>
                      <p className="text-sm text-gray-600">{quote.authorTitle}, {quote.organization}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <blockquote className="border-l-4 border-green-200 pl-4 italic">
                      <p className="text-gray-800">{quote.quote}</p>
                      {quote.quoteAr && (
                        <p className="text-gray-600 mt-2 text-sm" dir="rtl">
                          "{quote.quoteAr}"
                        </p>
                      )}
                    </blockquote>
                    
                    <div className="text-sm text-gray-600">
                      <strong>{language === "ar" ? "السياق" : "Context"}:</strong> {quote.context}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">
                        {language === "ar" ? "المواضيع ذات الصلة" : "Relevant Topics"}:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {quote.relevantTopics.map((topic, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <span>
                        {language === "ar" ? "تم الإضافة" : "Added"}: {quote.dateAdded}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="government-faqs" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {language === "ar" ? "الأسئلة الشائعة الحكومية المتقدمة" : "Advanced Government FAQs"}
            </h2>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {language === "ar" ? "إضافة سؤال" : "Add FAQ"}
            </Button>
          </div>

          <div className="grid gap-6">
            {faqs.map((faq) => (
              <Card key={faq.id} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(faq.category)}
                        <Badge variant="outline">{faq.category}</Badge>
                        <Badge variant="secondary">{faq.targetAudience}</Badge>
                      </div>
                      <CardTitle className="text-lg mb-2">
                        {language === "ar" && faq.questionAr ? faq.questionAr : faq.question}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800">
                        {language === "ar" && faq.answerAr ? faq.answerAr : faq.answer}
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">
                          {language === "ar" ? "الكلمات المفتاحية المستهدفة" : "Target Keywords"}:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {faq.keywords.map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {faq.officialSource && (
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">
                            {language === "ar" ? "المصدر الرسمي" : "Official Source"}:
                          </h4>
                          <p className="text-xs text-gray-600">{faq.officialSource}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <span>
                        {language === "ar" ? "آخر تحديث" : "Last updated"}: {faq.lastUpdated}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
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