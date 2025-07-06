import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { useLanguage } from "@/hooks/use-language";

export default function CookiesPolicy() {
  const { language, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {language === "ar" ? "سياسة ملفات تعريف الارتباط" : "Cookies Policy"}
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {language === "ar" 
              ? "آخر تحديث: ديسمبر 2024"
              : "Last updated: December 2024"
            }
          </p>

          {language === "ar" ? (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. ما هي ملفات تعريف الارتباط</h2>
                <p>ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم حفظها على جهازك عند زيارة موقعنا الإلكتروني. تساعدنا هذه الملفات في تحسين تجربتك وتقديم خدمات مخصصة.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. أنواع ملفات تعريف الارتباط التي نستخدمها</h2>
                
                <h3 className="text-xl font-medium mb-3">ملفات تعريف الارتباط الضرورية</h3>
                <p>هذه الملفات ضرورية لتشغيل الموقع بشكل صحيح وتتضمن:</p>
                <ul>
                  <li>ملفات جلسة المستخدم</li>
                  <li>ملفات إعدادات اللغة</li>
                  <li>ملفات الأمان والحماية</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">ملفات تعريف الارتباط التحليلية</h3>
                <p>نستخدم هذه الملفات لفهم كيفية استخدام الزوار لموقعنا:</p>
                <ul>
                  <li>عدد الزيارات والصفحات المشاهدة</li>
                  <li>مدة البقاء في الموقع</li>
                  <li>مصادر الزيارات</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">ملفات تعريف الارتباط الوظيفية</h3>
                <p>تساعد في تحسين تجربة المستخدم:</p>
                <ul>
                  <li>تذكر تفضيلات اللغة</li>
                  <li>حفظ إعدادات العرض</li>
                  <li>تخصيص المحتوى</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. ملفات تعريف الارتباط من طرف ثالث</h2>
                <p>قد نسمح لشركاء موثوقين بوضع ملفات تعريف ارتباط على موقعنا:</p>
                <ul>
                  <li>خدمات التحليلات (Google Analytics)</li>
                  <li>منصات وسائل التواصل الاجتماعي</li>
                  <li>خدمات الدعم الفني</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. إدارة ملفات تعريف الارتباط</h2>
                <p>يمكنك التحكم في ملفات تعريف الارتباط من خلال:</p>
                <ul>
                  <li>إعدادات المتصفح الخاص بك</li>
                  <li>حذف ملفات تعريف الارتباط الموجودة</li>
                  <li>منع حفظ ملفات تعريف ارتباط جديدة</li>
                  <li>تلقي تنبيهات عند حفظ ملفات جديدة</li>
                </ul>
                <p><strong>تنبيه:</strong> قد يؤثر تعطيل ملفات تعريف الارتباط على وظائف الموقع.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. موافقتك</h2>
                <p>باستخدام موقعنا، تقر بأنك قرأت وفهمت سياسة ملفات تعريف الارتباط هذه وتوافق على استخدامنا لملفات تعريف الارتباط وفقاً لهذه السياسة.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. التحديثات</h2>
                <p>قد نحدث هذه السياسة من وقت لآخر. سنقوم بإشعارك بأي تغييرات جوهرية من خلال الموقع أو البريد الإلكتروني.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. اتصل بنا</h2>
                <p>لأي استفسارات حول سياسة ملفات تعريف الارتباط:</p>
                <ul>
                  <li>البريد الإلكتروني: rased@almstkshf.com</li>
                  <li>الهاتف: +971585400191</li>
                  <li>العنوان: مركز دبي المالي العالمي، دبي، الإمارات العربية المتحدة</li>
                </ul>
              </section>
            </div>
          ) : (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
                <p>Cookies are small text files that are stored on your device when you visit our website. These files help us improve your experience and provide personalized services.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Types of Cookies We Use</h2>
                
                <h3 className="text-xl font-medium mb-3">Essential Cookies</h3>
                <p>These cookies are necessary for the website to function properly and include:</p>
                <ul>
                  <li>User session files</li>
                  <li>Language preference files</li>
                  <li>Security and protection files</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Analytics Cookies</h3>
                <p>We use these cookies to understand how visitors use our website:</p>
                <ul>
                  <li>Number of visits and page views</li>
                  <li>Time spent on the website</li>
                  <li>Traffic sources</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Functional Cookies</h3>
                <p>These help improve user experience:</p>
                <ul>
                  <li>Remember language preferences</li>
                  <li>Save display settings</li>
                  <li>Personalize content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Third-Party Cookies</h2>
                <p>We may allow trusted partners to place cookies on our website:</p>
                <ul>
                  <li>Analytics services (Google Analytics)</li>
                  <li>Social media platforms</li>
                  <li>Technical support services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Managing Cookies</h2>
                <p>You can control cookies through:</p>
                <ul>
                  <li>Your browser settings</li>
                  <li>Deleting existing cookies</li>
                  <li>Blocking new cookies from being saved</li>
                  <li>Receiving alerts when new cookies are saved</li>
                </ul>
                <p><strong>Note:</strong> Disabling cookies may affect website functionality.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Your Consent</h2>
                <p>By using our website, you acknowledge that you have read and understood this Cookie Policy and agree to our use of cookies in accordance with this policy.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Updates</h2>
                <p>We may update this policy from time to time. We will notify you of any material changes through the website or email.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
                <p>For any inquiries about this Cookie Policy:</p>
                <ul>
                  <li>Email: rased@almstkshf.com</li>
                  <li>Phone: +971585400191</li>
                  <li>Address: Dubai International Financial Centre, Dubai, UAE</li>
                </ul>
              </section>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}