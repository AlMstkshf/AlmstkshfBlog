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
  Building, 
  Globe, 
  Users, 
  Calendar,
  Share2,
  Target,
  BarChart3,
  FileText,
  Star,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  TrendingUp,
  Award,
  Link,
  Newspaper,
  BookOpen,
  Video,
  Mic
} from "lucide-react";

interface Partnership {
  id: string;
  name: string;
  nameAr?: string;
  organization: string;
  type: "government_portal" | "media_network" | "academic_institution" | "technology_partner" | "consulting_firm";
  region: "uae" | "saudi" | "qatar" | "kuwait" | "bahrain" | "oman" | "gcc_wide";
  status: "active" | "pending" | "negotiating" | "inactive";
  contentTypes: string[];
  audienceReach: number;
  partnershipLevel: "strategic" | "preferred" | "standard";
  startDate: string;
  renewalDate: string;
  keyContacts: Array<{
    name: string;
    title: string;
    email: string;
    phone?: string;
  }>;
  contentDistribution: {
    monthlyPosts: number;
    averageEngagement: number;
    leadGeneration: number;
  };
  benefits: string[];
  requirements: string[];
}

interface ThoughtLeadershipArticle {
  id: string;
  title: string;
  titleAr?: string;
  author: string;
  authorTitle: string;
  publication: string;
  category: "ai_innovation" | "government_technology" | "media_intelligence" | "security_analysis" | "strategic_planning";
  status: "draft" | "submitted" | "published" | "declined";
  submissionDate: string;
  publishDate?: string;
  audienceType: "technical" | "executive" | "academic" | "government";
  wordCount: number;
  keywords: string[];
  citationsPotential: number;
  socialMediaReach: number;
  governmentRelevance: number;
  partnerships: string[];
}

interface PublicationOutlet {
  id: string;
  name: string;
  type: "ai_journal" | "security_publication" | "government_magazine" | "business_quarterly" | "tech_blog";
  audience: string[];
  submissionGuidelines: string;
  averageResponseTime: number; // days
  acceptanceRate: number; // percentage
  authorityScore: number;
  circulation: number;
  digitalReach: number;
  governmentReadership: number;
  contactInfo: {
    editor: string;
    email: string;
    submissionPortal?: string;
  };
}

export function PartnershipManager() {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("partnerships");
  const [selectedPartnership, setSelectedPartnership] = useState<string>("all");

  const partnerships: Partnership[] = [
    {
      id: "1",
      name: "UAE Government Digital Platform",
      nameAr: "منصة الحكومة الرقمية الإماراتية",
      organization: "UAE Digital Government",
      type: "government_portal",
      region: "uae",
      status: "active",
      contentTypes: ["Strategic Reports", "Policy Briefs", "Case Studies"],
      audienceReach: 250000,
      partnershipLevel: "strategic",
      startDate: "2024-01-15",
      renewalDate: "2025-01-15",
      keyContacts: [
        {
          name: "Ahmed Al-Mansoori",
          title: "Director of Digital Innovation",
          email: "ahmed.almansoori@government.ae",
          phone: "+971-4-xxx-xxxx"
        }
      ],
      contentDistribution: {
        monthlyPosts: 8,
        averageEngagement: 12.5,
        leadGeneration: 45
      },
      benefits: [
        "Direct access to government decision makers",
        "Credibility through official endorsement",
        "Priority placement in government communications",
        "Access to exclusive government data"
      ],
      requirements: [
        "Government compliance review required",
        "Bilingual content (Arabic/English)",
        "Minimum 2 week approval lead time",
        "Adherence to UAE government branding guidelines"
      ]
    },
    {
      id: "2",
      name: "Gulf Media Network",
      nameAr: "شبكة الإعلام الخليجي",
      organization: "Gulf Broadcasting Corporation",
      type: "media_network",
      region: "gcc_wide",
      status: "active",
      contentTypes: ["Expert Commentary", "Analysis Reports", "Video Content"],
      audienceReach: 1200000,
      partnershipLevel: "preferred",
      startDate: "2024-03-01",
      renewalDate: "2025-03-01",
      keyContacts: [
        {
          name: "Sarah Al-Zahra",
          title: "Head of Digital Content",
          email: "sarah.alzahra@gulfmedia.com"
        }
      ],
      contentDistribution: {
        monthlyPosts: 12,
        averageEngagement: 8.7,
        leadGeneration: 78
      },
      benefits: [
        "Wide regional reach across GCC",
        "Multi-channel distribution (TV, Digital, Radio)",
        "Expert positioning opportunities",
        "Cross-promotional content syndication"
      ],
      requirements: [
        "Content must be region-appropriate",
        "Video content preferred for key topics",
        "48-hour response time for breaking news",
        "Exclusive commentary for major events"
      ]
    },
    {
      id: "3",
      name: "Dubai Future Foundation Research Platform",
      nameAr: "منصة أبحاث مؤسسة دبي للمستقبل",
      organization: "Dubai Future Foundation",
      type: "academic_institution",
      region: "uae",
      status: "negotiating",
      contentTypes: ["Research Papers", "Future Insights", "Innovation Reports"],
      audienceReach: 85000,
      partnershipLevel: "strategic",
      startDate: "2025-01-01",
      renewalDate: "2026-01-01",
      keyContacts: [
        {
          name: "Dr. Mohammed Al-Rashid",
          title: "Research Director",
          email: "mohammed.alrashid@dubaifuture.ae"
        }
      ],
      contentDistribution: {
        monthlyPosts: 4,
        averageEngagement: 18.3,
        leadGeneration: 32
      },
      benefits: [
        "Academic credibility and research validation",
        "Access to future-focused government initiatives",
        "Collaboration on cutting-edge AI research",
        "Co-authorship opportunities with renowned experts"
      ],
      requirements: [
        "Peer-review process for research content",
        "Original research and data required",
        "Minimum 6-month research timeline",
        "Joint intellectual property agreements"
      ]
    }
  ];

  const thoughtLeadershipArticles: ThoughtLeadershipArticle[] = [
    {
      id: "1",
      title: "The Future of Arabic AI: Navigating Cultural Nuances in Government Technology",
      titleAr: "مستقبل الذكاء الاصطناعي العربي: التنقل في الفروق الثقافية في التكنولوجيا الحكومية",
      author: "Dr. Sarah Al-Zahra",
      authorTitle: "Chief Data Officer, Al-Mustakshef",
      publication: "AI & Government Quarterly",
      category: "ai_innovation",
      status: "published",
      submissionDate: "2024-11-15",
      publishDate: "2024-12-01",
      audienceType: "government",
      wordCount: 3500,
      keywords: ["Arabic AI", "Cultural Computing", "Government Technology", "Digital Transformation"],
      citationsPotential: 85,
      socialMediaReach: 15000,
      governmentRelevance: 95,
      partnerships: ["UAE Government Digital Platform"]
    },
    {
      id: "2",
      title: "Media Intelligence Revolution: How GCC Governments Are Transforming Public Communication",
      author: "Ahmed Al-Mansoori",
      authorTitle: "Strategic Intelligence Director",
      publication: "Middle East Technology Review",
      category: "government_technology",
      status: "submitted",
      submissionDate: "2024-12-05",
      audienceType: "executive",
      wordCount: 2800,
      keywords: ["Media Intelligence", "GCC Governments", "Public Communication", "Digital Strategy"],
      citationsPotential: 72,
      socialMediaReach: 12000,
      governmentRelevance: 88,
      partnerships: ["Gulf Media Network"]
    },
    {
      id: "3",
      title: "Crisis Management in the Age of Social Media: Lessons from Gulf Government Responses",
      titleAr: "إدارة الأزمات في عصر وسائل التواصل الاجتماعي: دروس من استجابات الحكومات الخليجية",
      author: "Mohammed Al-Rashid",
      authorTitle: "Crisis Management Specialist",
      publication: "Security & Government Affairs Journal",
      category: "security_analysis",
      status: "draft",
      submissionDate: "2024-12-20",
      audienceType: "government",
      wordCount: 4200,
      keywords: ["Crisis Management", "Social Media", "Government Response", "Gulf Security"],
      citationsPotential: 91,
      socialMediaReach: 8500,
      governmentRelevance: 92,
      partnerships: ["Dubai Future Foundation Research Platform"]
    }
  ];

  const publicationOutlets: PublicationOutlet[] = [
    {
      id: "1",
      name: "AI & Government Quarterly",
      type: "ai_journal",
      audience: ["government_officials", "ai_researchers", "policy_makers"],
      submissionGuidelines: "3000-5000 words, peer-reviewed, government focus required",
      averageResponseTime: 45,
      acceptanceRate: 35,
      authorityScore: 92,
      circulation: 15000,
      digitalReach: 85000,
      governmentReadership: 78,
      contactInfo: {
        editor: "Dr. James Patterson",
        email: "submissions@aigovquarterly.com",
        submissionPortal: "https://aigovquarterly.com/submit"
      }
    },
    {
      id: "2",
      name: "Middle East Technology Review",
      type: "business_quarterly",
      audience: ["executives", "technology_leaders", "investors"],
      submissionGuidelines: "2500-4000 words, business impact focus, regional relevance",
      averageResponseTime: 30,
      acceptanceRate: 28,
      authorityScore: 87,
      circulation: 25000,
      digitalReach: 120000,
      governmentReadership: 45,
      contactInfo: {
        editor: "Sarah Mitchell",
        email: "editor@metechreview.com"
      }
    },
    {
      id: "3",
      name: "Security & Government Affairs Journal",
      type: "security_publication",
      audience: ["security_professionals", "government_officials", "defense_analysts"],
      submissionGuidelines: "3500-6000 words, security focus, classified information restrictions",
      averageResponseTime: 60,
      acceptanceRate: 42,
      authorityScore: 94,
      circulation: 12000,
      digitalReach: 45000,
      governmentReadership: 89,
      contactInfo: {
        editor: "Colonel David Walsh (Ret.)",
        email: "submissions@secgovaffairs.org"
      }
    }
  ];

  const getPartnershipTypeColor = (type: string) => {
    switch (type) {
      case "government_portal": return "bg-blue-100 text-blue-800";
      case "media_network": return "bg-green-100 text-green-800";
      case "academic_institution": return "bg-purple-100 text-purple-800";
      case "technology_partner": return "bg-orange-100 text-orange-800";
      case "consulting_firm": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "negotiating": return "bg-blue-100 text-blue-800";
      case "inactive": return "bg-red-100 text-red-800";
      case "published": return "bg-green-100 text-green-800";
      case "submitted": return "bg-blue-100 text-blue-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "declined": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPartnershipLevelIcon = (level: string) => {
    switch (level) {
      case "strategic": return <Star className="w-4 h-4 text-yellow-500" />;
      case "preferred": return <Award className="w-4 h-4 text-blue-500" />;
      case "standard": return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Building className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "ar" ? "ar-AE" : "en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {language === "ar" ? "إدارة الشراكات والقيادة الفكرية" : "Partnership & Thought Leadership Manager"}
        </h1>
        <p className="text-gray-600">
          {language === "ar" 
            ? "إدارة الشراكات الحكومية وشبكات الإعلام وفرص النشر الفكري"
            : "Manage government partnerships, media networks, and thought leadership publications"
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="partnerships">
            {language === "ar" ? "الشراكات" : "Partnerships"}
          </TabsTrigger>
          <TabsTrigger value="thought-leadership">
            {language === "ar" ? "القيادة الفكرية" : "Thought Leadership"}
          </TabsTrigger>
          <TabsTrigger value="publications">
            {language === "ar" ? "منافذ النشر" : "Publication Outlets"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="partnerships" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {language === "ar" ? "الشراكات الاستراتيجية" : "Strategic Partnerships"}
            </h2>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {language === "ar" ? "إضافة شراكة جديدة" : "Add New Partnership"}
            </Button>
          </div>

          <div className="grid gap-6">
            {partnerships.map((partnership) => (
              <Card key={partnership.id} className={`border-l-4 ${
                partnership.partnershipLevel === 'strategic' ? 'border-l-yellow-500' : 
                partnership.partnershipLevel === 'preferred' ? 'border-l-blue-500' : 'border-l-green-500'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getPartnershipLevelIcon(partnership.partnershipLevel)}
                        <Badge className={getPartnershipTypeColor(partnership.type)}>
                          {partnership.type}
                        </Badge>
                        <Badge className={getStatusColor(partnership.status)}>
                          {partnership.status}
                        </Badge>
                        <Badge variant="outline">{partnership.region.toUpperCase()}</Badge>
                      </div>
                      <CardTitle className="text-lg mb-2">
                        {language === "ar" && partnership.nameAr ? partnership.nameAr : partnership.name}
                      </CardTitle>
                      <p className="text-gray-600 text-sm mb-3">{partnership.organization}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {partnership.audienceReach.toLocaleString()} reach
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Renewal: {formatDate(partnership.renewalDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          {partnership.contentDistribution.monthlyPosts} posts/month
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-blue-600">
                        {partnership.contentDistribution.averageEngagement}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {language === "ar" ? "متوسط التفاعل" : "Avg Engagement"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {language === "ar" ? "المزايا" : "Benefits"}
                      </h4>
                      <ul className="text-sm space-y-1">
                        {partnership.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Award className="w-3 h-3 text-green-500" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      
                      <h4 className="font-semibold mt-4 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {language === "ar" ? "أنواع المحتوى" : "Content Types"}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {partnership.contentTypes.map((type, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        {language === "ar" ? "المتطلبات" : "Requirements"}
                      </h4>
                      <ul className="text-sm space-y-1 mb-4">
                        {partnership.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-blue-500" />
                            {requirement}
                          </li>
                        ))}
                      </ul>
                      
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {language === "ar" ? "جهات الاتصال الرئيسية" : "Key Contacts"}
                      </h4>
                      <div className="space-y-2">
                        {partnership.keyContacts.map((contact, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-gray-600">{contact.title}</div>
                            <div className="text-blue-600">{contact.email}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      {partnership.contentDistribution.leadGeneration} {language === "ar" ? "عميل محتمل شهرياً" : "leads/month"}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit className="w-3 h-3" />
                        {language === "ar" ? "تحرير" : "Edit"}
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Link className="w-3 h-3" />
                        {language === "ar" ? "اتصال" : "Contact"}
                      </Button>
                      <Button size="sm" className="flex items-center gap-1">
                        <Share2 className="w-3 h-3" />
                        {language === "ar" ? "توزيع المحتوى" : "Distribute Content"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="thought-leadership" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {language === "ar" ? "مقالات القيادة الفكرية" : "Thought Leadership Articles"}
            </h2>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {language === "ar" ? "إنشاء مقال جديد" : "Create New Article"}
            </Button>
          </div>

          <div className="grid gap-6">
            {thoughtLeadershipArticles.map((article) => (
              <Card key={article.id} className={`border-l-4 ${
                article.status === 'published' ? 'border-l-green-500' : 
                article.status === 'submitted' ? 'border-l-blue-500' : 
                article.status === 'draft' ? 'border-l-gray-500' : 'border-l-red-500'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Newspaper className="w-5 h-5 text-blue-600" />
                        <Badge variant="outline">{article.category}</Badge>
                        <Badge className={getStatusColor(article.status)}>
                          {article.status}
                        </Badge>
                        <Badge variant="secondary">{article.audienceType}</Badge>
                      </div>
                      <CardTitle className="text-lg mb-2">
                        {language === "ar" && article.titleAr ? article.titleAr : article.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {article.author}
                        </span>
                        <span>{article.authorTitle}</span>
                        <span className="font-medium">{article.publication}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {article.wordCount} words
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {article.publishDate ? formatDate(article.publishDate) : `Submitted: ${formatDate(article.submissionDate)}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {article.governmentRelevance}% gov relevance
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-purple-600">{article.citationsPotential}</div>
                      <div className="text-xs text-gray-500">
                        {language === "ar" ? "إمكانية الاستشهاد" : "Citation Potential"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        {language === "ar" ? "الكلمات المفتاحية" : "Keywords"}
                      </h4>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {article.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        {language === "ar" ? "الوصول المتوقع" : "Expected Reach"}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{language === "ar" ? "وسائل التواصل الاجتماعي" : "Social Media"}:</span>
                          <span className="font-medium">{article.socialMediaReach.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{language === "ar" ? "الاستشهادات المحتملة" : "Potential Citations"}:</span>
                          <span className="font-medium">{article.citationsPotential}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {language === "ar" ? "الشراكات المرتبطة" : "Related Partnerships"}
                      </h4>
                      <div className="space-y-2">
                        {article.partnerships.map((partnershipName, index) => (
                          <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                            {partnershipName}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      {language === "ar" ? "الصلة الحكومية" : "Government Relevance"}: {article.governmentRelevance}%
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
                        <Share2 className="w-3 h-3" />
                        {language === "ar" ? "إرسال للنشر" : "Submit for Publication"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="publications" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {language === "ar" ? "منافذ النشر المتخصصة" : "Specialized Publication Outlets"}
            </h2>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {language === "ar" ? "إضافة منفذ نشر" : "Add Publication Outlet"}
            </Button>
          </div>

          <div className="grid gap-6">
            {publicationOutlets.map((outlet) => (
              <Card key={outlet.id} className="border-l-4 border-l-indigo-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        <Badge variant="outline">{outlet.type}</Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {outlet.acceptanceRate}% acceptance
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mb-2">{outlet.name}</CardTitle>
                      <p className="text-gray-600 text-sm mb-3">{outlet.submissionGuidelines}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {outlet.circulation.toLocaleString()} circulation
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {outlet.digitalReach.toLocaleString()} digital reach
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {outlet.averageResponseTime} days response
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-indigo-600">{outlet.authorityScore}</div>
                      <div className="text-xs text-gray-500">
                        {language === "ar" ? "نقاط السلطة" : "Authority Score"}
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
                        {outlet.audience.map((aud, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {aud}
                          </Badge>
                        ))}
                      </div>
                      
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        {language === "ar" ? "إحصائيات النشر" : "Publication Stats"}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{language === "ar" ? "معدل القبول" : "Acceptance Rate"}:</span>
                          <span className="font-medium">{outlet.acceptanceRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{language === "ar" ? "القراء الحكوميون" : "Government Readership"}:</span>
                          <span className="font-medium">{outlet.governmentReadership}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {language === "ar" ? "معلومات الاتصال" : "Contact Information"}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">{language === "ar" ? "المحرر" : "Editor"}:</span>
                          <div className="text-gray-600">{outlet.contactInfo.editor}</div>
                        </div>
                        <div>
                          <span className="font-medium">{language === "ar" ? "البريد الإلكتروني" : "Email"}:</span>
                          <div className="text-blue-600">{outlet.contactInfo.email}</div>
                        </div>
                        {outlet.contactInfo.submissionPortal && (
                          <div>
                            <span className="font-medium">{language === "ar" ? "بوابة الإرسال" : "Submission Portal"}:</span>
                            <div className="text-blue-600 text-xs">{outlet.contactInfo.submissionPortal}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      {language === "ar" ? "وقت الاستجابة المتوقع" : "Expected response time"}: {outlet.averageResponseTime} days
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {language === "ar" ? "عرض التفاصيل" : "View Details"}
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit className="w-3 h-3" />
                        {language === "ar" ? "تحرير" : "Edit"}
                      </Button>
                      <Button size="sm" className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {language === "ar" ? "إرسال مقال" : "Submit Article"}
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