import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { useLanguage } from "@/hooks/use-language";

export default function DataProtection() {
  const { language, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {language === "ar" ? "حماية البيانات" : "Data Protection"}
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
                <h2 className="text-2xl font-semibold mb-4">1. التزامنا بحماية البيانات</h2>
                <p>تلتزم شركة المستكشف لمراقبة الإعلام بحماية خصوصية وأمان البيانات الشخصية لعملائنا وزوار موقعنا. نطبق أعلى معايير الأمان والحماية وفقاً للقوانين المحلية والدولية.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. مبادئ حماية البيانات</h2>
                <h3 className="text-xl font-medium mb-3">الشفافية</h3>
                <p>نوضح بوضوح كيفية جمع واستخدام ومشاركة بياناتك الشخصية.</p>
                
                <h3 className="text-xl font-medium mb-3">تقليل البيانات</h3>
                <p>نجمع فقط البيانات الضرورية لتقديم خدماتنا وتحقيق الأغراض المحددة.</p>
                
                <h3 className="text-xl font-medium mb-3">دقة البيانات</h3>
                <p>نحافظ على دقة وحداثة البيانات ونوفر طرق لتصحيح أي معلومات غير دقيقة.</p>
                
                <h3 className="text-xl font-medium mb-3">تحديد الغرض</h3>
                <p>نستخدم البيانات فقط للأغراض المحددة وقت الجمع أو لأغراض متوافقة.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. التدابير الأمنية</h2>
                
                <h3 className="text-xl font-medium mb-3">الحماية التقنية</h3>
                <ul>
                  <li>تشفير البيانات أثناء النقل والتخزين</li>
                  <li>جدران حماية متقدمة</li>
                  <li>أنظمة كشف التسلل</li>
                  <li>تحديثات أمنية منتظمة</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">الحماية الإدارية</h3>
                <ul>
                  <li>سياسات صارمة للوصول للبيانات</li>
                  <li>تدريب الموظفين على أمان البيانات</li>
                  <li>مراجعات أمنية دورية</li>
                  <li>خطط الاستجابة للحوادث</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">الحماية الفيزيائية</h3>
                <ul>
                  <li>مراكز بيانات آمنة</li>
                  <li>أنظمة مراقبة على مدار الساعة</li>
                  <li>تحكم صارم في الوصول المادي</li>
                  <li>أنظمة نسخ احتياطي متعددة</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. حقوق حماية البيانات</h2>
                <p>بموجب قوانين حماية البيانات، لديك الحقوق التالية:</p>
                
                <h3 className="text-xl font-medium mb-3">الحق في المعرفة</h3>
                <p>معرفة البيانات الشخصية التي نجمعها عنك وكيفية استخدامها.</p>
                
                <h3 className="text-xl font-medium mb-3">الحق في الوصول</h3>
                <p>طلب نسخة من بياناتك الشخصية التي نحتفظ بها.</p>
                
                <h3 className="text-xl font-medium mb-3">الحق في التصحيح</h3>
                <p>طلب تصحيح أي بيانات شخصية غير دقيقة أو غير مكتملة.</p>
                
                <h3 className="text-xl font-medium mb-3">الحق في الحذف</h3>
                <p>طلب حذف بياناتك الشخصية في ظروف معينة.</p>
                
                <h3 className="text-xl font-medium mb-3">الحق في تقييد المعالجة</h3>
                <p>طلب تقييد كيفية استخدام بياناتك الشخصية.</p>
                
                <h3 className="text-xl font-medium mb-3">الحق في نقل البيانات</h3>
                <p>طلب نقل بياناتك إلى منظمة أخرى في تنسيق منظم.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. احتفاظ البيانات</h2>
                <p>نحتفظ بالبيانات الشخصية فقط للمدة اللازمة لتحقيق الأغراض التي جُمعت من أجلها أو كما يتطلب القانون.</p>
                
                <h3 className="text-xl font-medium mb-3">فترات الاحتفاظ</h3>
                <ul>
                  <li>بيانات العملاء: حتى 7 سنوات بعد انتهاء العلاقة التجارية</li>
                  <li>بيانات الاتصال: حتى 3 سنوات بعد آخر تفاعل</li>
                  <li>بيانات الموقع الإلكتروني: حتى سنتين</li>
                  <li>البيانات التسويقية: حتى إلغاء الاشتراك أو 5 سنوات</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. نقل البيانات الدولي</h2>
                <p>قد نقل بياناتك إلى دول أخرى لمعالجتها. نضمن أن أي نقل يتم وفقاً لمعايير الحماية المناسبة:</p>
                <ul>
                  <li>اتفاقيات حماية البيانات</li>
                  <li>شهادات الامتثال الدولية</li>
                  <li>بنود تعاقدية معيارية</li>
                  <li>قرارات كفاية الحماية</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. الامتثال للقوانين</h2>
                <p>نلتزم بجميع القوانين واللوائح المعمول بها لحماية البيانات، بما في ذلك:</p>
                <ul>
                  <li>قانون حماية البيانات في دولة الإمارات العربية المتحدة</li>
                  <li>اللائحة العامة لحماية البيانات (GDPR)</li>
                  <li>قوانين حماية البيانات في دول مجلس التعاون الخليجي</li>
                  <li>المعايير الدولية لأمان المعلومات (ISO 27001)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. الإبلاغ عن انتهاكات البيانات</h2>
                <p>في حالة حدوث انتهاك للبيانات الشخصية:</p>
                <ul>
                  <li>سنُبلغ السلطات المختصة خلال 72 ساعة</li>
                  <li>سنُخطرك فوراً إذا كان الانتهاك يشكل مخاطر عالية</li>
                  <li>سنتخذ إجراءات فورية لاحتواء الانتهاك</li>
                  <li>سنحقق في السبب ونمنع تكراره</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. التواصل معنا</h2>
                <p>لممارسة حقوقك أو لأي استفسارات حول حماية البيانات:</p>
                <ul>
                  <li>مسؤول حماية البيانات: rased@almstkshf.com</li>
                  <li>الهاتف: +971585400191</li>
                  <li>العنوان: مركز دبي المالي العالمي، دبي، الإمارات العربية المتحدة</li>
                </ul>
                <p>سنرد على جميع الطلبات خلال 30 يوماً.</p>
              </section>
            </div>
          ) : (
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Our Data Protection Commitment</h2>
                <p>Almstkshf Media Monitoring is committed to protecting the privacy and security of personal data of our customers and website visitors. We apply the highest security and protection standards in accordance with local and international laws.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Data Protection Principles</h2>
                <h3 className="text-xl font-medium mb-3">Transparency</h3>
                <p>We clearly explain how we collect, use, and share your personal data.</p>
                
                <h3 className="text-xl font-medium mb-3">Data Minimization</h3>
                <p>We collect only the data necessary to provide our services and achieve specified purposes.</p>
                
                <h3 className="text-xl font-medium mb-3">Data Accuracy</h3>
                <p>We maintain accurate and up-to-date data and provide ways to correct any inaccurate information.</p>
                
                <h3 className="text-xl font-medium mb-3">Purpose Limitation</h3>
                <p>We use data only for the purposes specified at the time of collection or for compatible purposes.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Security Measures</h2>
                
                <h3 className="text-xl font-medium mb-3">Technical Protection</h3>
                <ul>
                  <li>Data encryption in transit and at rest</li>
                  <li>Advanced firewalls</li>
                  <li>Intrusion detection systems</li>
                  <li>Regular security updates</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Administrative Protection</h3>
                <ul>
                  <li>Strict data access policies</li>
                  <li>Employee training on data security</li>
                  <li>Regular security audits</li>
                  <li>Incident response plans</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Physical Protection</h3>
                <ul>
                  <li>Secure data centers</li>
                  <li>24/7 monitoring systems</li>
                  <li>Strict physical access control</li>
                  <li>Multiple backup systems</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Data Protection Rights</h2>
                <p>Under data protection laws, you have the following rights:</p>
                
                <h3 className="text-xl font-medium mb-3">Right to Know</h3>
                <p>Know what personal data we collect about you and how it is used.</p>
                
                <h3 className="text-xl font-medium mb-3">Right to Access</h3>
                <p>Request a copy of your personal data that we hold.</p>
                
                <h3 className="text-xl font-medium mb-3">Right to Rectification</h3>
                <p>Request correction of any inaccurate or incomplete personal data.</p>
                
                <h3 className="text-xl font-medium mb-3">Right to Erasure</h3>
                <p>Request deletion of your personal data under certain circumstances.</p>
                
                <h3 className="text-xl font-medium mb-3">Right to Restrict Processing</h3>
                <p>Request restriction on how your personal data is used.</p>
                
                <h3 className="text-xl font-medium mb-3">Right to Data Portability</h3>
                <p>Request transfer of your data to another organization in a structured format.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
                <p>We retain personal data only for the period necessary to achieve the purposes for which it was collected or as required by law.</p>
                
                <h3 className="text-xl font-medium mb-3">Retention Periods</h3>
                <ul>
                  <li>Customer data: Up to 7 years after business relationship ends</li>
                  <li>Contact data: Up to 3 years after last interaction</li>
                  <li>Website data: Up to 2 years</li>
                  <li>Marketing data: Until unsubscribed or 5 years</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. International Data Transfers</h2>
                <p>We may transfer your data to other countries for processing. We ensure any transfer is conducted with appropriate protection standards:</p>
                <ul>
                  <li>Data protection agreements</li>
                  <li>International compliance certifications</li>
                  <li>Standard contractual clauses</li>
                  <li>Adequacy decisions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Legal Compliance</h2>
                <p>We comply with all applicable data protection laws and regulations, including:</p>
                <ul>
                  <li>UAE Data Protection Law</li>
                  <li>General Data Protection Regulation (GDPR)</li>
                  <li>GCC data protection laws</li>
                  <li>International information security standards (ISO 27001)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Data Breach Reporting</h2>
                <p>In case of a personal data breach:</p>
                <ul>
                  <li>We will notify competent authorities within 72 hours</li>
                  <li>We will notify you immediately if the breach poses high risks</li>
                  <li>We will take immediate action to contain the breach</li>
                  <li>We will investigate the cause and prevent recurrence</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
                <p>To exercise your rights or for any data protection inquiries:</p>
                <ul>
                  <li>Data Protection Officer: rased@almstkshf.com</li>
                  <li>Phone: +971585400191</li>
                  <li>Address: Dubai International Financial Centre, Dubai, UAE</li>
                </ul>
                <p>We will respond to all requests within 30 days.</p>
              </section>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}