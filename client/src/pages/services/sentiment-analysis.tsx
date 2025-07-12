import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { Brain, Heart, Frown, Smile, Meh, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function SentimentAnalysisPage() {
  const { language, isRTL } = useLanguage();

  const features = [
    {
      icon: Brain,
      title: language === "ar" ? "ذكاء اصطناعي متقدم" : "Advanced AI",
      description: language === "ar" 
        ? "تقنيات ذكاء اصطناعي متطورة لتحليل المشاعر بدقة عالية"
        : "Advanced AI technologies for high-precision sentiment analysis"
    },
    {
      icon: Heart,
      title: language === "ar" ? "تحليل المشاعر المتعدد" : "Multi-emotion Analysis",
      description: language === "ar"
        ? "تحليل طيف واسع من المشاعر والعواطف في النصوص"
        : "Analyze a wide spectrum of emotions and feelings in texts"
    },
    {
      icon: TrendingUp,
      title: language === "ar" ? "تتبع الاتجاهات" : "Trend Tracking",
      description: language === "ar"
        ? "تتبع تغيرات المشاعر عبر الزمن واكتشاف الأنماط"
        : "Track sentiment changes over time and discover patterns"
    }
  ];

  const sentimentTypes = [
    {
      icon: Smile,
      label: language === "ar" ? "إيجابي" : "Positive",
      color: "text-green-500",
      bgColor: "bg-green-100",
      percentage: "65%"
    },
    {
      icon: Meh,
      label: language === "ar" ? "محايد" : "Neutral",
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
      percentage: "25%"
    },
    {
      icon: Frown,
      label: language === "ar" ? "سلبي" : "Negative",
      color: "text-red-500",
      bgColor: "bg-red-100",
      percentage: "10%"
    }
  ];

  const useCases = [
    {
      title: language === "ar" ? "إدارة السمعة" : "Reputation Management",
      description: language === "ar"
        ? "راقبوا مشاعر الجمهور تجاه علامتكم التجارية واتخذوا إجراءات استباقية"
        : "Monitor public sentiment towards your brand and take proactive measures"
    },
    {
      title: language === "ar" ? "تحليل المنتجات" : "Product Analysis",
      description: language === "ar"
        ? "فهم آراء العملاء حول منتجاتكم وخدماتكم لتحسينها"
        : "Understand customer opinions about your products and services to improve them"
    },
    {
      title: language === "ar" ? "تحليل الحملات" : "Campaign Analysis",
      description: language === "ar"
        ? "قيسوا فعالية حملاتكم التسويقية من خلال تحليل ردود الأفعال"
        : "Measure the effectiveness of your marketing campaigns through reaction analysis"
    },
    {
      title: language === "ar" ? "خدمة العملاء" : "Customer Service",
      description: language === "ar"
        ? "حسنوا خدمة العملاء من خلال فهم مشاعرهم ومخاوفهم"
        : "Improve customer service by understanding their emotions and concerns"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50" dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              {language === "ar" ? "تحليل المشاعر" : "Sentiment Analysis"}
            </h1>
            <p className="text-xl text-green-100 leading-relaxed mb-8">
              {language === "ar"
                ? "تقنيات متقدمة لتحليل مشاعر الجمهور وآرائهم تجاه علامتكم التجارية ومنتجاتكم عبر جميع المنصات الرقمية والإعلامية."
                : "Advanced technologies to analyze audience emotions and opinions towards your brand and products across all digital and media platforms."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact?type=demo">
                <Button size="lg" variant="secondary" className="text-green-600">
                  {language === "ar" ? "احصل على عرض توضيحي" : "Get a Demo"}
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  {language === "ar" ? "تواصل معنا" : "Contact Us"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sentiment Types Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              {language === "ar" ? "أنواع المشاعر المحللة" : "Analyzed Sentiment Types"}
            </h2>
            <p className="text-slate-600">
              {language === "ar"
                ? "نحلل طيفاً واسعاً من المشاعر لنمنحكم فهماً عميقاً لآراء جمهوركم"
                : "We analyze a wide spectrum of emotions to give you deep understanding of your audience's opinions"
              }
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {sentimentTypes.map((sentiment, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-20 h-20 ${sentiment.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <sentiment.icon className={`w-10 h-10 ${sentiment.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{sentiment.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-4xl font-bold ${sentiment.color} mb-2`}>
                    {sentiment.percentage}
                  </div>
                  <p className="text-slate-600">
                    {language === "ar" ? "متوسط التوزيع" : "Average Distribution"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-6">
              {language === "ar" ? "مميزات تحليل المشاعر" : "Sentiment Analysis Features"}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {language === "ar"
                ? "تقنيات متطورة لفهم مشاعر جمهوركم بدقة وعمق"
                : "Advanced technologies to understand your audience's emotions with precision and depth"
              }
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-green-600" />
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

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-6">
              {language === "ar" ? "حالات الاستخدام" : "Use Cases"}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {language === "ar"
                ? "كيف يمكن لتحليل المشاعر أن يساعد مؤسستكم في تحقيق أهدافها"
                : "How sentiment analysis can help your organization achieve its goals"
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-6">
                {language === "ar" ? "لماذا تحليل المشاعر مهم؟" : "Why is Sentiment Analysis Important?"}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">
                      {language === "ar" ? "اتخاذ قرارات مدروسة" : "Make Informed Decisions"}
                    </h3>
                    <p className="text-slate-600">
                      {language === "ar"
                        ? "استخدموا بيانات المشاعر لاتخاذ قرارات استراتيجية مدروسة"
                        : "Use sentiment data to make informed strategic decisions"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">
                      {language === "ar" ? "تحسين تجربة العملاء" : "Improve Customer Experience"}
                    </h3>
                    <p className="text-slate-600">
                      {language === "ar"
                        ? "فهم مشاعر العملاء لتحسين منتجاتكم وخدماتكم"
                        : "Understand customer emotions to improve your products and services"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">
                      {language === "ar" ? "إدارة المخاطر" : "Risk Management"}
                    </h3>
                    <p className="text-slate-600">
                      {language === "ar"
                        ? "اكتشفوا المشاكل المحتملة قبل تفاقمها"
                        : "Discover potential issues before they escalate"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-8 rounded-2xl">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">98%</div>
                <p className="text-slate-600 mb-6">
                  {language === "ar" ? "دقة في التحليل" : "Analysis Accuracy"}
                </p>
                <div className="text-4xl font-bold text-green-600 mb-2">15+</div>
                <p className="text-slate-600 mb-6">
                  {language === "ar" ? "لغة مدعومة" : "Supported Languages"}
                </p>
                <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
                <p className="text-slate-600">
                  {language === "ar" ? "مراقبة مستمرة" : "Continuous Monitoring"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            {language === "ar" ? "ابدأوا في فهم مشاعر جمهوركم" : "Start Understanding Your Audience's Emotions"}
          </h2>
          <p className="text-xl text-green-100 mb-8">
            {language === "ar"
              ? "احصلوا على رؤى عميقة حول مشاعر جمهوركم واتخذوا قرارات أفضل لمؤسستكم"
              : "Get deep insights into your audience's emotions and make better decisions for your organization"
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact?type=demo">
              <Button size="lg" variant="secondary" className="text-green-600">
                {language === "ar" ? "احصل على عرض توضيحي مجاني" : "Get Free Demo"}
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
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