import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { useLanguage } from "@/hooks/use-language";

export default function PrivacyPolicy() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-secondary mb-8">
            {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
          </h1>
          
          <div className="prose max-w-none">
            {language === "ar" ? (
              <div className="space-y-6 text-right" dir="rtl">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">المقدمة</h2>
                  <p className="text-slate-700 leading-relaxed">
                    تحترم شركة المستكشف لمراقبة الإعلام خصوصيتك وتلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحماية معلوماتك عند زيارة موقعنا الإلكتروني أو استخدام خدماتنا.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">المعلومات التي نجمعها</h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    نجمع أنواعاً مختلفة من المعلومات لتقديم خدماتنا وتحسينها:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>معلومات الاتصال مثل الاسم والبريد الإلكتروني ورقم الهاتف</li>
                    <li>معلومات الشركة والمنصب الوظيفي</li>
                    <li>بيانات استخدام الموقع ومعلومات تقنية</li>
                    <li>تفضيلات المحتوى واهتمامات القطاع</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">كيفية استخدام المعلومات</h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    نستخدم معلوماتك للأغراض التالية:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>تقديم خدمات مراقبة الإعلام والتحليلات</li>
                    <li>إرسال النشرات الإخبارية والتحديثات</li>
                    <li>تحسين موقعنا وخدماتنا</li>
                    <li>التواصل معك بشأن خدماتنا</li>
                    <li>الامتثال للمتطلبات القانونية</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">مشاركة المعلومات</h2>
                  <p className="text-slate-700 leading-relaxed">
                    لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط في الحالات التالية: مع مقدمي الخدمات الموثوقين، للامتثال للقوانين، أو بموافقتك الصريحة.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">أمان البيانات</h2>
                  <p className="text-slate-700 leading-relaxed">
                    نطبق تدابير أمنية متقدمة لحماية معلوماتك من الوصول غير المصرح به أو التغيير أو الكشف أو التدمير. تشمل هذه التدابير التشفير وضوابط الوصول والمراقبة المستمرة.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibond mb-4">حقوقك</h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    لديك الحقوق التالية فيما يتعلق بمعلوماتك الشخصية:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>الوصول إلى معلوماتك الشخصية</li>
                    <li>تصحيح المعلومات غير الدقيقة</li>
                    <li>طلب حذف معلوماتك</li>
                    <li>الاعتراض على معالجة معلوماتك</li>
                    <li>نقل معلوماتك إلى جهة أخرى</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">التواصل معنا</h2>
                  <p className="text-slate-700 leading-relaxed">
                    إذا كان لديك أي استفسارات حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر البريد الإلكتروني: rased@almstkshf.com أو الهاتف: +971 58 540 0191
                  </p>
                </section>
              </div>
            ) : (
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                  <p className="text-slate-700 leading-relaxed">
                    Almstkshf for Media Monitoring respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website or use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    We collect various types of information to provide and improve our services:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>Contact information such as name, email address, and phone number</li>
                    <li>Company information and job title</li>
                    <li>Website usage data and technical information</li>
                    <li>Content preferences and industry interests</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    We use your information for the following purposes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>Providing media monitoring and analytics services</li>
                    <li>Sending newsletters and updates</li>
                    <li>Improving our website and services</li>
                    <li>Communicating with you about our services</li>
                    <li>Complying with legal requirements</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
                  <p className="text-slate-700 leading-relaxed">
                    We do not sell or rent your personal information to third parties. We may share your information only in the following cases: with trusted service providers, to comply with laws, or with your explicit consent.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
                  <p className="text-slate-700 leading-relaxed">
                    We implement advanced security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. These measures include encryption, access controls, and continuous monitoring.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    You have the following rights regarding your personal information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>Access to your personal information</li>
                    <li>Correction of inaccurate information</li>
                    <li>Request deletion of your information</li>
                    <li>Object to processing of your information</li>
                    <li>Transfer your information to another party</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                  <p className="text-slate-700 leading-relaxed">
                    If you have any questions about this privacy policy, please contact us at: rased@almstkshf.com or phone: +971 58 540 0191
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