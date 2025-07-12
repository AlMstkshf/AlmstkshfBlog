import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { BarChart3, Users, Heart, MessageCircle, Share2, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function SocialAnalyticsPage() {
  const { language, isRTL } = useLanguage();

  const features = [
    {
      icon: BarChart3,
      title: language === "ar" ? "تحليل الأداء" : "Performance Analytics",
      description: language === "ar" 
        ? "تحليل شامل لأداء المحتوى والحملات عبر جميع المنصات الاجتماعية"
        : "Comprehensive analysis of content and campaign performance across all social platforms"
    },
    {
      icon: Users,
      title: language === "ar" ? "تحليل الجمهور" : "Audience Analysis",
      description: language === "ar"
        ? "فهم عميق لجمهوركم وسلوكياتهم وتفضيلاتهم"
        : "Deep understanding of your audience, their behaviors and preferences"
    },
    {
      icon: Heart,
      title: language === "ar" ? "تحليل المشاعر" : "Sentiment Analysis",
      description: language === "ar"
        ? "قياس مشاعر الجمهور تجاه علامتكم التجارية ومنتجاتكم"
        : "Measure audience sentiment towards your brand and products"
    },
    {
      icon: MessageCircle,
      title: language === "ar" ? "تحليل المحادثات" : "Conversation Analysis",
      description: language === "ar"
        ? "تتبع وتحليل المحادثات والنقاشات حول علامتكم التجارية"
        : "Track and analyze conversations and discussions about your brand"
    },
    {
      icon: Share2,
      title: language === "ar" ? "تحليل الانتشار" : "Viral Analysis",
      description: language === "ar"
        ? "فهم كيفية انتشار المحتوى وتحديد العوامل المؤثرة"
        : "Understand how content spreads and identify influential factors"
    },
    {
      icon: TrendingUp,
      title: language === "ar" ? "توقع الاتجاهات" : "Trend Prediction",
      description: language === "ar"
        ? "توقع الاتجاهات المستقبلية والموضوعات الرائجة"
        : "Predict future trends and trending topics"
    }
  ];

  const platforms = [
    { name: "Twitter", color: "bg-blue-500" },
    { name: "Facebook", color: "bg-blue-600" },
    { name: "Instagram", color: "bg-pink-500" },
    { name: "LinkedIn", color: "bg-blue-700" },
    { name: "TikTok", color: "bg-black" },
    { name: "YouTube", color: "bg-red-500" },
    { name: "Snapchat", color: "bg-yellow-400" },
    { name: "WhatsApp", color: "bg-green-500" }
  ];

  return (
    <div className="min-h-screen bg-slate-50" dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              {language === "ar" ? "تحليلات وسائل التواصل الاجتماعي" : "Social Media Analytics"}
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed mb-8">
              {language === "ar"
                ? "حلول تحليلية متقدمة لفهم أداء علامتكم التجارية عبر منصات التواصل الاجتماعي واتخاذ قرارات مدروسة لتحسين استراتيجيتكم الرقمية."
                : "Advanced analytics solutions to understand your brand's performance across social media platforms and make informed decisions to improve your digital strategy."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact?type=demo">
                <Button size="lg" variant="secondary" className="text-purple-600">
                  {language === "ar" ? "احصل على عرض توضيحي" : "Get a Demo"}
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                  {language === "ar" ? "تواصل معنا" : "Contact Us"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              {language === "ar" ? "المنصات المدعومة" : "Supported Platforms"}
            </h2>
            <p className="text-slate-600">
              {language === "ar"
                ? "نحلل بياناتكم عبر جميع منصات التواصل الاجتماعي الرئيسية"
                : "We analyze your data across all major social media platforms"
              }
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {platforms.map((platform, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 ${platform.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <span className="text-white font-bold text-sm">{platform.name[0]}</span>
                </div>
                <p className="text-sm text-slate-600">{platform.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-6">
              {language === "ar" ? "مميزات تحليلات وسائل التواصل" : "Social Analytics Features"}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {language === "ar"
                ? "أدوات متطورة لتحليل وفهم أداء علامتكم التجارية عبر منصات التواصل الاجتماعي"
                : "Advanced tools to analyze and understand your brand's performance across social media platforms"
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-6">
                {language === "ar" ? "المقاييس التي نتتبعها" : "Metrics We Track"}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">
                      {language === "ar" ? "معدل التفاعل" : "Engagement Rate"}
                    </h3>
                    <p className="text-slate-600">
                      {language === "ar"
                        ? "قياس مستوى تفاعل الجمهور مع محتواكم عبر جميع المنصات"
                        : "Measure audience engagement with your content across all platforms"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">
                      {language === "ar" ? "نمو المتابعين" : "Follower Growth"}
                    </h3>
                    <p className="text-slate-600">
                      {language === "ar"
                        ? "تتبع نمو قاعدة متابعيكم وتحليل العوامل المؤثرة"
                        : "Track your follower base growth and analyze influencing factors"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">
                      {language === "ar" ? "الوصول والانطباعات" : "Reach & Impressions"}
                    </h3>
                    <p className="text-slate-600">
                      {language === "ar"
                        ? "قياس مدى وصول محتواكم وعدد مرات ظهوره"
                        : "Measure your content's reach and number of impressions"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
                  <p className="text-slate-600 text-sm">
                    {language === "ar" ? "دقة التحليل" : "Analysis Accuracy"}
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">8+</div>
                  <p className="text-slate-600 text-sm">
                    {language === "ar" ? "منصات مدعومة" : "Supported Platforms"}
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                  <p className="text-slate-600 text-sm">
                    {language === "ar" ? "مراقبة مستمرة" : "Continuous Monitoring"}
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">100+</div>
                  <p className="text-slate-600 text-sm">
                    {language === "ar" ? "مقياس متتبع" : "Tracked Metrics"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            {language === "ar" ? "اكتشفوا قوة تحليلات وسائل التواصل" : "Discover the Power of Social Analytics"}
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            {language === "ar"
              ? "احصلوا على رؤى عميقة حول أداء علامتكم التجارية وحسنوا استراتيجيتكم الرقمية"
              : "Get deep insights into your brand's performance and improve your digital strategy"
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact?type=demo">
              <Button size="lg" variant="secondary" className="text-purple-600">
                {language === "ar" ? "احصل على عرض توضيحي مجاني" : "Get Free Demo"}
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                {language === "ar" ? "تحدث مع خبير" : "Talk to Expert"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}