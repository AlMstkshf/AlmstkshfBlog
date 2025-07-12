import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { Shield, AlertTriangle, Clock, Users, Phone, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function CrisisManagementPage() {
  const { language, isRTL } = useLanguage();

  const features = [
    {
      icon: AlertTriangle,
      title: language === "ar" ? "الكشف المبكر" : "Early Detection",
      description: language === "ar" 
        ? "نظام إنذار مبكر لاكتشاف الأزمات المحتملة قبل تفاقمها"
        : "Early warning system to detect potential crises before they escalate"
    },
    {
      icon: Clock,
      title: language === "ar" ? "استجابة سريعة" : "Rapid Response",
      description: language === "ar"
        ? "فريق متخصص للاستجابة السريعة والتعامل مع الأزمات على مدار الساعة"
        : "Specialized team for rapid response and 24/7 crisis management"
    },
    {
      icon: Users,
      title: language === "ar" ? "إدارة التواصل" : "Communication Management",
      description: language === "ar"
        ? "استراتيجيات تواصل فعالة للحفاظ على سمعة المؤسسة أثناء الأزمات"
        : "Effective communication strategies to maintain organizational reputation during crises"
    },
    {
      icon: Shield,
      title: language === "ar" ? "حماية السمعة" : "Reputation Protection",
      description: language === "ar"
        ? "حماية شاملة لسمعة المؤسسة وتقليل الأضرار المحتملة"
        : "Comprehensive reputation protection and damage mitigation"
    },
    {
      icon: Phone,
      title: language === "ar" ? "خط ساخن للطوارئ" : "Emergency Hotline",
      description: language === "ar"
        ? "خط ساخن متاح على مدار الساعة للتعامل مع الحالات الطارئة"
        : "24/7 emergency hotline for urgent crisis situations"
    },
    {
      icon: CheckCircle,
      title: language === "ar" ? "تقييم ما بعد الأزمة" : "Post-Crisis Assessment",
      description: language === "ar"
        ? "تقييم شامل للأزمة واستخلاص الدروس لتحسين الاستعداد المستقبلي"
        : "Comprehensive crisis assessment and lessons learned for future preparedness"
    }
  ];

  const crisisTypes = [
    {
      title: language === "ar" ? "أزمات إعلامية" : "Media Crises",
      description: language === "ar" 
        ? "التعامل مع التغطية الإعلامية السلبية والشائعات"
        : "Managing negative media coverage and rumors"
    },
    {
      title: language === "ar" ? "أزمات وسائل التواصل" : "Social Media Crises",
      description: language === "ar"
        ? "إدارة الأزمات المنتشرة عبر منصات التواصل الاجتماعي"
        : "Managing crises spreading through social media platforms"
    },
    {
      title: language === "ar" ? "أزمات المنتجات" : "Product Crises",
      description: language === "ar"
        ? "التعامل مع مشاكل المنتجات وسحبها من السوق"
        : "Handling product issues and market recalls"
    },
    {
      title: language === "ar" ? "أزمات الموظفين" : "Employee Crises",
      description: language === "ar"
        ? "إدارة الأزمات المتعلقة بالموظفين والقيادة"
        : "Managing employee and leadership-related crises"
    }
  ];

  const responseSteps = [
    {
      step: "1",
      title: language === "ar" ? "التقييم السريع" : "Rapid Assessment",
      description: language === "ar"
        ? "تقييم فوري لحجم الأزمة ومدى انتشارها"
        : "Immediate assessment of crisis scope and spread"
    },
    {
      step: "2",
      title: language === "ar" ? "تفعيل الفريق" : "Team Activation",
      description: language === "ar"
        ? "تفعيل فريق إدارة الأزمات المتخصص"
        : "Activation of specialized crisis management team"
    },
    {
      step: "3",
      title: language === "ar" ? "وضع الاستراتيجية" : "Strategy Development",
      description: language === "ar"
        ? "وضع استراتيجية شاملة للتعامل مع الأزمة"
        : "Development of comprehensive crisis response strategy"
    },
    {
      step: "4",
      title: language === "ar" ? "التنفيذ والمتابعة" : "Implementation & Monitoring",
      description: language === "ar"
        ? "تنفيذ الخطة ومراقبة النتائج باستمرار"
        : "Plan implementation and continuous results monitoring"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50" dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              {language === "ar" ? "إدارة الأزمات" : "Crisis Management"}
            </h1>
            <p className="text-xl text-red-100 leading-relaxed mb-8">
              {language === "ar"
                ? "خدمات متخصصة في إدارة الأزمات وحماية سمعة المؤسسات مع فريق من الخبراء المتاحين على مدار الساعة للتعامل مع أي طارئ."
                : "Specialized crisis management services and organizational reputation protection with expert team available 24/7 to handle any emergency."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact?type=demo">
                <Button size="lg" variant="secondary" className="text-red-600">
                  {language === "ar" ? "احصل على استشارة طارئة" : "Get Emergency Consultation"}
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600">
                  {language === "ar" ? "تواصل معنا" : "Contact Us"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact Section */}
      <section className="py-12 bg-red-50 border-l-4 border-red-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-800">
                  {language === "ar" ? "خط الطوارئ - متاح 24/7" : "Emergency Hotline - Available 24/7"}
                </h3>
                <p className="text-red-600">
                  {language === "ar" 
                    ? "للحالات الطارئة والأزمات الفورية"
                    : "For urgent situations and immediate crises"
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-800">+971585400191</div>
              <p className="text-red-600">rased@almstkshf.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* Crisis Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-6">
              {language === "ar" ? "أنواع الأزمات التي نتعامل معها" : "Types of Crises We Handle"}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {language === "ar"
                ? "خبرة واسعة في التعامل مع جميع أنواع الأزمات المؤسسية والإعلامية"
                : "Extensive experience in handling all types of organizational and media crises"
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {crisisTypes.map((crisis, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{crisis.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{crisis.description}</p>
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
              {language === "ar" ? "مميزات خدمة إدارة الأزمات" : "Crisis Management Features"}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {language === "ar"
                ? "حلول شاملة ومتقدمة لإدارة الأزمات وحماية سمعة مؤسستكم"
                : "Comprehensive and advanced solutions for crisis management and organizational reputation protection"
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-red-600" />
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

      {/* Response Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-6">
              {language === "ar" ? "عملية الاستجابة للأزمات" : "Crisis Response Process"}
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {language === "ar"
                ? "منهجية مدروسة وسريعة للتعامل مع الأزمات بفعالية"
                : "Systematic and rapid methodology for effective crisis management"
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {responseSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-3">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-secondary mb-6">
                {language === "ar" ? "لماذا تختارون خدماتنا؟" : "Why Choose Our Services?"}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">
                      {language === "ar" ? "خبرة متخصصة" : "Specialized Expertise"}
                    </h3>
                    <p className="text-slate-600">
                      {language === "ar"
                        ? "فريق من الخبراء المتخصصين في إدارة الأزمات والتواصل"
                        : "Team of experts specialized in crisis management and communication"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">
                      {language === "ar" ? "استجابة سريعة" : "Rapid Response"}
                    </h3>
                    <p className="text-slate-600">
                      {language === "ar"
                        ? "استجابة فورية خلال دقائق من تلقي الإنذار"
                        : "Immediate response within minutes of receiving alert"
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">
                      {language === "ar" ? "نتائج مثبتة" : "Proven Results"}
                    </h3>
                    <p className="text-slate-600">
                      {language === "ar"
                        ? "سجل حافل في إدارة الأزمات بنجاح وحماية السمعة"
                        : "Proven track record in successful crisis management and reputation protection"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-red-600 mb-2">15min</div>
                  <p className="text-slate-600 text-sm">
                    {language === "ar" ? "متوسط وقت الاستجابة" : "Average Response Time"}
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600 mb-2">24/7</div>
                  <p className="text-slate-600 text-sm">
                    {language === "ar" ? "توفر الخدمة" : "Service Availability"}
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600 mb-2">95%</div>
                  <p className="text-slate-600 text-sm">
                    {language === "ar" ? "معدل نجاح إدارة الأزمات" : "Crisis Management Success Rate"}
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600 mb-2">100+</div>
                  <p className="text-slate-600 text-sm">
                    {language === "ar" ? "أزمة تم التعامل معها" : "Crises Handled"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            {language === "ar" ? "كونوا مستعدين للأزمات" : "Be Prepared for Crises"}
          </h2>
          <p className="text-xl text-red-100 mb-8">
            {language === "ar"
              ? "لا تنتظروا حدوث الأزمة. ابدأوا التخطيط والاستعداد اليوم مع فريق الخبراء لدينا"
              : "Don't wait for a crisis to happen. Start planning and preparing today with our expert team"
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact?type=demo">
              <Button size="lg" variant="secondary" className="text-red-600">
                {language === "ar" ? "احصل على استشارة مجانية" : "Get Free Consultation"}
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-600">
                {language === "ar" ? "تحدث مع خبير الأزمات" : "Talk to Crisis Expert"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}