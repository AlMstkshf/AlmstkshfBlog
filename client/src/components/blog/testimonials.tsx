import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    nameEn: "Dr. Fatima Al-Zahra",
    nameAr: "د. فاطمة الزهراء",
    titleEn: "Director of Communications, Ministry of Interior",
    titleAr: "مديرة الاتصالات، وزارة الداخلية",
    contentEn: "The insights from Almstkshf's blog have fundamentally changed how we approach public communication. Their analysis of regional media trends is unmatched.",
    contentAr: "لقد غيّرت الرؤى من مدونة المستكشف بشكل جذري الطريقة التي نتعامل بها مع التواصل العام. تحليلهم لاتجاهات الإعلام الإقليمي لا مثيل له.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1ab?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: 2,
    nameEn: "Michael Thompson",
    nameAr: "مايكل طومسون",
    titleEn: "VP of Strategy, Regional Corporate Group",
    titleAr: "نائب رئيس الاستراتيجية، المجموعة الإقليمية للشركات",
    contentEn: "As a Fortune 500 company operating in the Middle East, we rely on Almstkshf's analysis to understand market sentiment and competitive positioning.",
    contentAr: "كشركة من ضمن قائمة فورتشن 500 تعمل في الشرق الأوسط، نعتمد على تحليل المستكشف لفهم مشاعر السوق والموقع التنافسي.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: 3,
    nameEn: "Dr. Hassan Al-Rashid",
    nameAr: "د. حسان الراشد",
    titleEn: "Chief Data Officer, National Bank",
    titleAr: "كبير موظفي البيانات، البنك الوطني",
    contentEn: "The technical depth combined with practical applications makes this blog essential reading for anyone serious about media intelligence in our region.",
    contentAr: "العمق التقني مع التطبيقات العملية يجعل هذه المدونة قراءة أساسية لأي شخص جاد في مجال استخبارات الإعلام في منطقتنا.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
  },
];

export function Testimonials() {
  const { language, isRTL } = useLanguage();

  return (
    <section className="py-16 bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary mb-4">
            {language === "ar" ? "موثوق من قبل المؤسسات الرائدة" : "Trusted by Leading Organizations"}
          </h2>
          <p className="text-slate-600 text-lg">
            {language === "ar" 
              ? "اطلع على كيفية استخدام المؤسسات الحكومية والشركات لرؤانا"
              : "See how government institutions and enterprises use our insights"
            }
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-slate-600 mb-4">
                  "{language === "ar" ? testimonial.contentAr : testimonial.contentEn}"
                </blockquote>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={language === "ar" ? testimonial.nameAr : testimonial.nameEn}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <div className="font-semibold text-secondary">
                      {language === "ar" ? testimonial.nameAr : testimonial.nameEn}
                    </div>
                    <div className="text-sm text-slate-500">
                      {language === "ar" ? testimonial.titleAr : testimonial.titleEn}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
