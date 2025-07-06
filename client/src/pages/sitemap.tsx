import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";

export default function Sitemap() {
  const { language } = useLanguage();

  const sitemapSections = [
    {
      title: language === "ar" ? "الصفحات الرئيسية" : "Main Pages",
      links: [
        { href: "/", label: language === "ar" ? "الرئيسية" : "Home" },
        { href: "/about", label: language === "ar" ? "من نحن" : "About Us" },
        { href: "/contact", label: language === "ar" ? "تواصل معنا" : "Contact Us" },
        { href: "/search", label: language === "ar" ? "البحث" : "Search" },
      ],
    },
    {
      title: language === "ar" ? "فئات المدونة" : "Blog Categories",
      links: [
        { href: `/${language}/blog/government`, label: language === "ar" ? "القطاع الحكومي" : "Government" },
        { href: `/${language}/blog/business-intelligence`, label: language === "ar" ? "ذكاء الأعمال" : "Business Intelligence" },
        { href: `/${language}/blog/technology-innovation`, label: language === "ar" ? "التكنولوجيا والابتكار" : "Technology & Innovation" },
        { href: `/${language}/blog/social-media-analysis`, label: language === "ar" ? "تحليل وسائل التواصل" : "Social Media Analysis" },
      ],
    },
    {
      title: language === "ar" ? "الخدمات" : "Services",
      links: [
        { href: "/services/media-monitoring", label: language === "ar" ? "مراقبة الإعلام" : "Media Monitoring" },
        { href: "/services/social-analytics", label: language === "ar" ? "تحليلات وسائل التواصل" : "Social Analytics" },
        { href: "/services/sentiment-analysis", label: language === "ar" ? "تحليل المشاعر" : "Sentiment Analysis" },
        { href: "/services/crisis-management", label: language === "ar" ? "إدارة الأزمات" : "Crisis Management" },
      ],
    },
    {
      title: language === "ar" ? "الصفحات القانونية" : "Legal Pages",
      links: [
        { href: "/privacy-policy", label: language === "ar" ? "سياسة الخصوصية" : "Privacy Policy" },
        { href: "/terms-of-service", label: language === "ar" ? "شروط الخدمة" : "Terms of Service" },
        { href: "/cookie-policy", label: language === "ar" ? "سياسة الكوكيز" : "Cookie Policy" },
        { href: "/data-protection", label: language === "ar" ? "حماية البيانات" : "Data Protection" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-secondary mb-8 text-center">
            {language === "ar" ? "خريطة الموقع" : "Sitemap"}
          </h1>
          
          <p className="text-slate-600 text-center mb-12 max-w-3xl mx-auto">
            {language === "ar" 
              ? "استكشف جميع صفحات موقع المستكشف لمراقبة الإعلام. اعثر على المحتوى والخدمات والموارد التي تحتاجها بسهولة."
              : "Explore all pages of Almstkshf Media Monitoring website. Find the content, services, and resources you need easily."
            }
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sitemapSections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h2 className="text-xl font-semibold text-secondary border-b border-slate-200 pb-2">
                  {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>
                        <span className="text-slate-600 hover:text-primary transition-colors cursor-pointer flex items-center">
                          <span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-16 pt-8 border-t border-slate-200 text-center">
            <h2 className="text-2xl font-semibold text-secondary mb-4">
              {language === "ar" ? "هل تحتاج للمساعدة؟" : "Need Help?"}
            </h2>
            <p className="text-slate-600 mb-6">
              {language === "ar" 
                ? "لا تجد ما تبحث عنه؟ تواصل معنا وسنكون سعداء لمساعدتك."
                : "Can't find what you're looking for? Contact us and we'll be happy to help."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <span className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
                  {language === "ar" ? "تواصل معنا" : "Contact Us"}
                </span>
              </Link>
              <a 
                href="mailto:rased@almstkshf.com" 
                className="inline-block border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                {language === "ar" ? "راسلنا مباشرة" : "Email Us Directly"}
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}