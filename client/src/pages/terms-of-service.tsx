import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { useLanguage } from "@/hooks/use-language";

export default function TermsOfService() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-secondary mb-8">
            {language === "ar" ? "شروط الخدمة" : "Terms of Service"}
          </h1>
          
          <div className="prose max-w-none">
            {language === "ar" ? (
              <div className="space-y-6 text-right" dir="rtl">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">الموافقة على الشروط</h2>
                  <p className="text-slate-700 leading-relaxed">
                    باستخدام موقع المستكشف لمراقبة الإعلام وخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام خدماتنا.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">الخدمات المقدمة</h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    تقدم شركة المستكشف لمراقبة الإعلام الخدمات التالية:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>مراقبة وتحليل الإعلام الرقمي والتقليدي</li>
                    <li>تحليل وسائل التواصل الاجتماعي</li>
                    <li>تقارير استخبارات الأعمال</li>
                    <li>خدمات الاستشارات الإعلامية</li>
                    <li>تحليل المشاعر والاتجاهات</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">التزامات المستخدم</h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    يلتزم المستخدم بما يلي:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>استخدام الخدمات للأغراض القانونية فقط</li>
                    <li>عدم مشاركة بيانات الدخول مع أطراف أخرى</li>
                    <li>احترام حقوق الملكية الفكرية</li>
                    <li>عدم محاولة الوصول غير المصرح به للأنظمة</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">الملكية الفكرية</h2>
                  <p className="text-slate-700 leading-relaxed">
                    جميع المحتويات والتقارير والتحليلات المقدمة من خلال خدماتنا محمية بحقوق الطبع والنشر وتخص شركة المستكشف لمراقبة الإعلام. لا يجوز إعادة النشر أو التوزيع دون إذن كتابي مسبق.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibond mb-4">قيود المسؤولية</h2>
                  <p className="text-slate-700 leading-relaxed">
                    لا تتحمل شركة المستكشف لمراقبة الإعلام مسؤولية أي أضرار مباشرة أو غير مباشرة قد تنتج عن استخدام خدماتنا. نحن نبذل قصارى جهدنا لضمان دقة المعلومات ولكن لا نضمن الدقة المطلقة.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">التعديل والإنهاء</h2>
                  <p className="text-slate-700 leading-relaxed">
                    نحتفظ بالحق في تعديل هذه الشروط في أي وقت. كما نحتفظ بالحق في إنهاء أو تعليق الخدمات في حالة مخالفة هذه الشروط.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">القانون المطبق</h2>
                  <p className="text-slate-700 leading-relaxed">
                    تخضع هذه الشروط لقوانين دولة الإمارات العربية المتحدة، وتحل أي منازعات وفقاً لهذه القوانين.
                  </p>
                </section>
              </div>
            ) : (
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
                  <p className="text-slate-700 leading-relaxed">
                    By using the Almstkshf Media Monitoring website and services, you agree to be bound by these terms and conditions. If you do not agree to any of these terms, please do not use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Services Provided</h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Almstkshf for Media Monitoring provides the following services:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>Digital and traditional media monitoring and analysis</li>
                    <li>Social media analytics</li>
                    <li>Business intelligence reports</li>
                    <li>Media consulting services</li>
                    <li>Sentiment analysis and trend monitoring</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">User Obligations</h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Users are obligated to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>Use services for lawful purposes only</li>
                    <li>Not share login credentials with other parties</li>
                    <li>Respect intellectual property rights</li>
                    <li>Not attempt unauthorized access to systems</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
                  <p className="text-slate-700 leading-relaxed">
                    All content, reports, and analyses provided through our services are protected by copyright and belong to Almstkshf for Media Monitoring. Redistribution or republication is not permitted without prior written authorization.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
                  <p className="text-slate-700 leading-relaxed">
                    Almstkshf for Media Monitoring shall not be liable for any direct or indirect damages that may result from using our services. We strive to ensure information accuracy but do not guarantee absolute precision.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Modification and Termination</h2>
                  <p className="text-slate-700 leading-relaxed">
                    We reserve the right to modify these terms at any time. We also reserve the right to terminate or suspend services in case of violations of these terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
                  <p className="text-slate-700 leading-relaxed">
                    These terms are governed by the laws of the United Arab Emirates, and any disputes shall be resolved according to these laws.
                  </p>
                </section>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}