import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { Monitor, TrendingUp, AlertTriangle, BarChart3, Globe, Shield } from "lucide-react";
import { Link } from "wouter";

export default function MediaMonitoringPage() {
  const { language, isRTL } = useLanguage();

  const features = [
    {
      icon: Monitor,
      title: language === "ar" ? "مراقبة شاملة" : "Comprehensive Monitoring",
      description: language === "ar" 
        ? "مراقبة جميع منصات الإعلام التقليدي والرقمي على مدار الساعة"
        : "24/7 monitoring across all traditional and digital media platforms"
    },
    {
      icon: TrendingUp,
      title: language === "ar" ? "تحليل الاتجاهات" : "Trend Analysis",
      description: language === "ar"
        ? "تحليل متقدم للاتجاهات والموضوعات الرائجة في الإعلام"
        : "Advanced analysis of trending topics and media patterns"
    },
    {
      icon: AlertTriangle,
      title: language === "ar" ? "تنبيهات فورية" : "Real-time Alerts",
      description: language === "ar"
        ? "تنبيهات فورية عند ذكر علامتكم التجارية أو الموضوعات المهمة"
        : "Instant alerts when your brand or important topics are mentioned"
    },
    {
      icon: BarChart3,
      title: language === "ar" ? "تقارير تفصيلية" : "Detailed Reports",
      description: language === "ar"
        ? "تقارير شاملة مع رؤى قابلة للتنفيذ ومؤشرات الأداء"
        : "Comprehensive reports with actionable insights and KPIs"
    },
    {
      icon: Globe,
      title: language === "ar" ? "تغطية عالمية" : "Global Coverage",
      description: language === "ar"
        ? "مراقبة الإعلام على نطاق عالمي بلغات متعددة"
        : "Worldwide media monitoring in multiple languages"
    },
    {
      icon: Shield,
      title: language === "ar" ? "إدارة المخاطر" : "Risk Management",
      description: language === "ar"
        ? "تحديد وإدارة المخاطر الإعلامية قبل تفاقمها"
        : "Identify and manage media risks before they escalate"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50" dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              {language === "ar" ? "مراقبة الإعلام" : "Media Monitoring"}
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed mb-8">
              {language === "ar"
                ? "خدمة مراقبة الإعلام الشاملة التي تمنحكم رؤية كاملة حول ما يُقال عن علامتكم التجارية ومجال عملكم عبر جميع المنصات الإعلامية."
                : "Comprehensive media monitoring service that gives you complete visibility into what's being said about your brand and industry across all media platforms."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact?type=demo">
                <Button size="lg" variant="secondary" className="text-primary">
                  {language === "ar" ? "احصل على عرض توضيحي" : "Get a Demo"}
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  {language === "ar" ? "تواصل معنا" : "Contact Us"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-6">
              {language === "ar" ? "مميزات خدمة مراقبة الإعلام" : "Media Monitoring Features"}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {language === "ar"
                ? "نقدم لكم أدوات متقدمة لمراقبة وتحليل الإعلام بطريقة ذكية وفعالة"
                : "We provide advanced tools for intelligent and effective media monitoring and analysis"
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
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

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-6">
                {language === "ar" ? "لماذا تحتاجون مراقبة الإعلام؟" : "Why Do You Need Media Monitoring?"}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">
                      {language === "ar" ? "حماية السمعة" : "Reputation Protection"}
                    </h3>
                    <p className="text-slate-600">
                      {language === "ar"
                        ? "راقبوا ما يُقال عن علامتكم التجارية واستجيبوا بسرعة للحفاظ على سمعتكم"
                        : "Monitor what's being said about your brand and respond quickly to protect your reputation"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">
                      {language === "ar" ? "فهم الجمهور" : "Audience Understanding"}
                    </h3>
                    <p className="text-slate-600">
                      {language === "ar"
                        ? "احصلوا على رؤى عميقة حول آراء جمهوركم واتجاهاتهم"
                        : "Gain deep insights into your audience's opinions and trends"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">
                      {language === "ar" ? "تحليل المنافسين" : "Competitor Analysis"}
                    </h3>
                    <p className="text-slate-600">
                      {language === "ar"
                        ? "راقبوا أنشطة منافسيكم واكتشفوا الفرص الجديدة"
                        : "Monitor your competitors' activities and discover new opportunities"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-blue-50 p-8 rounded-2xl">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-slate-600 mb-6">
                  {language === "ar" ? "مراقبة مستمرة" : "Continuous Monitoring"}
                </p>
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <p className="text-slate-600 mb-6">
                  {language === "ar" ? "مصدر إعلامي" : "Media Sources"}
                </p>
                <div className="text-4xl font-bold text-primary mb-2">99%</div>
                <p className="text-slate-600">
                  {language === "ar" ? "دقة في التحليل" : "Analysis Accuracy"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            {language === "ar" ? "ابدأوا مراقبة إعلامكم اليوم" : "Start Your Media Monitoring Today"}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {language === "ar"
              ? "احصلوا على رؤية شاملة حول ما يُقال عن علامتكم التجارية واتخذوا قرارات مدروسة"
              : "Get comprehensive insights into what's being said about your brand and make informed decisions"
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact?type=demo">
              <Button size="lg" variant="secondary" className="text-primary">
                {language === "ar" ? "احصل على عرض توضيحي مجاني" : "Get Free Demo"}
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
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