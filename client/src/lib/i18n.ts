export const languages = {
  en: "English",
  ar: "العربية"
} as const;

export type Language = keyof typeof languages;

export const translations = {
  en: {
    // Navigation
    home: "Home",
    government: "Government",
    businessIntelligence: "Business Intelligence",
    technology: "Technology",
    socialMedia: "Social Media",
    requestDemo: "Request Demo",
    
    // Hero section
    heroTitle: "Media Intelligence Insights for",
    heroTitleHighlight: "Government & Enterprise",
    heroDescription: "Expert analysis, case studies, and industry insights on media monitoring, social media intelligence, and data-driven decision making in the Middle East.",
    subscribeNewsletter: "Subscribe to Newsletter",
    downloadGuide: "Download Free Guide",
    
    // Categories
    exploreCategories: "Explore by Category",
    categoriesSubtitle: "Specialized content for different sectors and use cases",
    governmentDesc: "Public opinion analysis, crisis management, and policy impact monitoring",
    businessDesc: "Market trends, competitor analysis, and brand reputation monitoring",
    technologyDesc: "AI, NLP, machine learning applications in media monitoring",
    socialMediaDesc: "Sentiment analysis, influencer tracking, and engagement metrics",
    articlesCount: "Articles",
    
    // Articles
    featuredInsights: "Featured Insights",
    featuredSubtitle: "Latest analysis and expert perspectives on media intelligence and data-driven strategies",
    latestArticles: "Latest Articles",
    latestSubtitle: "Stay updated with the newest insights and analysis",
    viewAllArticles: "View All Articles",
    readMore: "Read More",
    
    // Newsletter
    newsletterTitle: "Stay Ahead of the Curve",
    newsletterSubtitle: "Get weekly insights on media intelligence, government communications, and business analytics delivered to your inbox.",
    emailPlaceholder: "Enter your email address",
    subscribeNow: "Subscribe Now",
    newsletterDisclaimer: "Join 3,000+ government officials, analysts, and business leaders. Unsubscribe anytime.",
    
    // Testimonials
    testimonialTitle: "Trusted by Leading Organizations",
    testimonialSubtitle: "See how government institutions and enterprises use our insights",
    
    // Footer
    companyDescription: "Leading media monitoring and data analysis solutions for government institutions and enterprises across the Middle East.",
    blogCategories: "Blog Categories",
    resources: "Resources",
    getInTouch: "Get in Touch",
    languages: "Languages",
    contactUs: "Contact Us",
    support: "Support",
    caseStudies: "Case Studies",
    whitePapers: "White Papers",
    webinars: "Webinars",
    newsletterArchive: "Newsletter Archive",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    sitemap: "Sitemap",
    allRightsReserved: "All rights reserved.",
    
    // Forms
    name: "Name",
    email: "Email",
    company: "Company",
    message: "Message",
    submit: "Submit",
    required: "Required",
    
    // Search
    search: "Search",
    searchPlaceholder: "Search articles...",
    noResults: "No articles found",
    searchResults: "Search Results",
    
    // Time
    daysAgo: "days ago",
    weeksAgo: "weeks ago",
    monthsAgo: "months ago",
    
    // Loading states
    loading: "Loading...",
    loadingArticles: "Loading articles...",
    
    // Error states
    errorLoadingArticles: "Error loading articles",
    errorLoadingCategories: "Error loading categories",
    tryAgain: "Try again",
  },
  ar: {
    // Navigation
    home: "الرئيسية",
    government: "القطاع الحكومي",
    businessIntelligence: "ذكاء الأعمال",
    technology: "التكنولوجيا",
    socialMedia: "وسائل التواصل الاجتماعي",
    requestDemo: "طلب عرض توضيحي",
    
    // Hero section
    heroTitle: "رؤى استخبارات الإعلام للـ",
    heroTitleHighlight: "الحكومات والمؤسسات",
    heroDescription: "تحليلات الخبراء ودراسات الحالة والرؤى الصناعية حول مراقبة الإعلام وذكاء وسائل التواصل الاجتماعي واتخاذ القرارات المبنية على البيانات في الشرق الأوسط.",
    subscribeNewsletter: "اشترك في النشرة الإخبارية",
    downloadGuide: "تحميل الدليل المجاني",
    
    // Categories
    exploreCategories: "استكشف حسب الفئة",
    categoriesSubtitle: "محتوى متخصص لقطاعات وحالات استخدام مختلفة",
    governmentDesc: "تحليل الرأي العام وإدارة الأزمات ومراقبة تأثير السياسات",
    businessDesc: "اتجاهات السوق وتحليل المنافسين ومراقبة سمعة العلامة التجارية",
    technologyDesc: "الذكاء الاصطناعي ومعالجة اللغة الطبيعية وتطبيقات التعلم الآلي في مراقبة الإعلام",
    socialMediaDesc: "تحليل المشاعر وتتبع المؤثرين ومقاييس المشاركة",
    articlesCount: "مقالات",
    
    // Articles
    featuredInsights: "رؤى مميزة",
    featuredSubtitle: "أحدث التحليلات ووجهات نظر الخبراء حول استخبارات الإعلام والاستراتيجيات المبنية على البيانات",
    latestArticles: "أحدث المقالات",
    latestSubtitle: "ابق على اطلاع بأحدث الرؤى والتحليلات",
    viewAllArticles: "عرض جميع المقالات",
    readMore: "اقرأ المزيد",
    
    // Newsletter
    newsletterTitle: "ابق في المقدمة",
    newsletterSubtitle: "احصل على رؤى أسبوعية حول استخبارات الإعلام واتصالات الحكومة وتحليلات الأعمال في صندوق البريد الوارد.",
    emailPlaceholder: "أدخل عنوان بريدك الإلكتروني",
    subscribeNow: "اشترك الآن",
    newsletterDisclaimer: "انضم إلى أكثر من 3000 مسؤول حكومي ومحلل وقائد أعمال. يمكن إلغاء الاشتراك في أي وقت.",
    
    // Testimonials
    testimonialTitle: "موثوق من قبل المؤسسات الرائدة",
    testimonialSubtitle: "اطلع على كيفية استخدام المؤسسات الحكومية والمؤسسات لرؤانا",
    
    // Footer
    companyDescription: "حلول رائدة لمراقبة الإعلام وتحليل البيانات للمؤسسات الحكومية والشركات في جميع أنحاء الشرق الأوسط.",
    blogCategories: "فئات المدونة",
    resources: "الموارد",
    getInTouch: "تواصل معنا",
    languages: "اللغات",
    contactUs: "اتصل بنا",
    support: "الدعم",
    caseStudies: "دراسات الحالة",
    whitePapers: "الأوراق البيضاء",
    webinars: "الندوات عبر الإنترنت",
    newsletterArchive: "أرشيف النشرة الإخبارية",
    privacyPolicy: "سياسة الخصوصية",
    termsOfService: "شروط الخدمة",
    sitemap: "خريطة الموقع",
    allRightsReserved: "جميع الحقوق محفوظة.",
    
    // Forms
    name: "الاسم",
    email: "البريد الإلكتروني",
    company: "الشركة",
    message: "الرسالة",
    submit: "إرسال",
    required: "مطلوب",
    
    // Search
    search: "بحث",
    searchPlaceholder: "البحث في المقالات...",
    noResults: "لم يتم العثور على مقالات",
    searchResults: "نتائج البحث",
    
    // Time
    daysAgo: "منذ أيام",
    weeksAgo: "منذ أسابيع",
    monthsAgo: "منذ شهور",
    
    // Loading states
    loading: "جاري التحميل...",
    loadingArticles: "جاري تحميل المقالات...",
    
    // Error states
    errorLoadingArticles: "خطأ في تحميل المقالات",
    errorLoadingCategories: "خطأ في تحميل الفئات",
    tryAgain: "حاول مرة أخرى",
  }
};

export type TranslationKey = keyof typeof translations.en;

export function getTranslation(key: TranslationKey, language: Language): string {
  return translations[language][key] || translations.en[key];
}
