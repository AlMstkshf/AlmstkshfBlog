import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import { Linkedin, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const { language } = useLanguage();

  const handleDownloadGuide = async () => {
    try {
      const response = await fetch('/api/download/media-monitoring-guide');
      const data = await response.json();
      
      // For now, show contact information for guide access
      if (data.email) {
        window.open(`mailto:${data.email}?subject=${encodeURIComponent(
          language === "ar" 
            ? "طلب تحميل دليل مراقبة الإعلام" 
            : "Request Media Monitoring Guide Download"
        )}&body=${encodeURIComponent(
          language === "ar"
            ? "مرحباً، أرغب في تحميل دليل مراقبة الإعلام. شكراً لكم."
            : "Hello, I would like to download the media monitoring guide. Thank you."
        )}`, '_blank');
      }
    } catch (error) {
      console.error('Download guide error:', error);
    }
  };

  const footerSections = {
    services: {
      title: language === "ar" ? "خدماتنا" : "Our Services",
      links: [
        { href: "https://almstkshf.com/#media-monitoring", label: language === "ar" ? "مراقبة الإعلام" : "Media Monitoring", external: true },
        { href: "https://almstkshf.com/#social-analytics", label: language === "ar" ? "تحليلات وسائل التواصل" : "Social Analytics", external: true },
        { href: "https://almstkshf.com/#sentiment-analysis", label: language === "ar" ? "تحليل المشاعر" : "Sentiment Analysis", external: true },
        { href: "https://almstkshf.com/#crisis-management", label: language === "ar" ? "إدارة الأزمات" : "Crisis Management", external: true },
      ],
    },
    content: {
      title: language === "ar" ? "المحتوى" : "Content",
      links: [
        { href: "/", label: language === "ar" ? "الرئيسية" : "Home" },
        { href: `/${language}/blog/government`, label: language === "ar" ? "القطاع الحكومي" : "Government" },
        { href: `/${language}/blog/business-intelligence`, label: language === "ar" ? "ذكاء الأعمال" : "Business Intelligence" },
        { href: `/${language}/blog/technology-innovation`, label: language === "ar" ? "التكنولوجيا" : "Technology" },
        { href: `/${language}/blog/social-media-analysis`, label: language === "ar" ? "وسائل التواصل" : "Social Media" },
      ],
    },
    company: {
      title: language === "ar" ? "الشركة" : "Company",
      links: [
        { href: "https://almstkshf.com/#about", label: language === "ar" ? "من نحن" : "About Us", external: true },
        { href: "/contact", label: language === "ar" ? "تواصل معنا" : "Contact Us" },
        { href: "/sitemap", label: language === "ar" ? "خريطة الموقع" : "Sitemap" },
      ],
    },
    legal: {
      title: language === "ar" ? "قانوني" : "Legal",
      links: [
        { href: "/privacy-policy", label: language === "ar" ? "سياسة الخصوصية" : "Privacy Policy" },
        { href: "/terms-of-service", label: language === "ar" ? "شروط الخدمة" : "Terms of Service" },
        { href: "/cookies-policy", label: language === "ar" ? "سياسة الكوكيز" : "Cookie Policy" },
        { href: "/data-protection", label: language === "ar" ? "حماية البيانات" : "Data Protection" },
      ],
    },
  };

  return (
    <footer className="bg-secondary text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Almstkshf</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                {language === "ar" 
                  ? "شركة رائدة في مراقبة وسائل الإعلام والتحليلات الرقمية في الشرق الأوسط"
                  : "Leading media monitoring and digital analytics company in the Middle East"
                }
              </p>
              

            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h4 className="text-lg font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, index) => (
                  <li key={`${key}-${link.href}-${index}`}>
                    {'external' in link && link.external ? (
                      <a 
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 hover:text-white transition-colors text-sm cursor-pointer"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href}>
                        <span className="text-slate-300 hover:text-white transition-colors text-sm cursor-pointer">
                          {link.label}
                        </span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact & Support Section */}
        <div className="border-t border-slate-600 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                {language === "ar" ? "معلومات التواصل" : "Contact Information"}
              </h4>
              <div className="space-y-3">
                <div className="flex items-center text-slate-300">
                  <MapPin className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="text-sm">DIFC, Dubai, UAE</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                  <a href="tel:+971585400191" className="text-sm hover:text-white transition-colors">
                    +971 58 540 0191
                  </a>
                </div>
                <div className="flex items-center text-slate-300">
                  <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                  <a href="mailto:rased@almstkshf.com" className="text-sm hover:text-white transition-colors">
                    rased@almstkshf.com
                  </a>
                </div>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                {language === "ar" ? "الدعم والمساعدة" : "Support & Help"}
              </h4>
              <div className="space-y-3">
                <div className="text-slate-300 text-sm">
                  <span className="block mb-1">
                    {language === "ar" ? "دعم العملاء:" : "Customer Support:"}
                  </span>
                  <a href="mailto:rased@almstkshf.com" className="hover:text-white transition-colors">
                    rased@almstkshf.com
                  </a>
                </div>
                <div className="text-slate-300 text-sm">
                  <span className="block mb-1">
                    {language === "ar" ? "ساعات العمل:" : "Business Hours:"}
                  </span>
                  <span>{language === "ar" ? "الإثنين - الجمعة: 9:00 - 18:00" : "Monday - Friday: 9:00 AM - 6:00 PM"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-600 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-300 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Almstkshf for Media Monitoring. {language === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}.
            </div>
            
            {/* LinkedIn Only */}
            <div className="flex items-center space-x-4">
              <span className="text-slate-400 text-sm">
                {language === "ar" ? "تابعنا على:" : "Follow us:"}
              </span>
              <a 
                href="https://linkedin.com/company/almstkshf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}