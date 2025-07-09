#!/usr/bin/env tsx

/**
 * Database Seeding Script for AlmstkshfBlog
 * 
 * This script seeds the database with:
 * - Initial categories for media intelligence topics
 * - Extracted articles from update_article_links.sql
 * - Proper bilingual content and metadata
 */

import dotenv from "dotenv";
dotenv.config();

import { db } from "../server/db";
import { categories, articles, type CategoryInsert, type ArticleInsert } from "../shared/schema";
import { eq } from "drizzle-orm";

interface SeedOptions {
  force?: boolean;
  verbose?: boolean;
  categoriesOnly?: boolean;
  articlesOnly?: boolean;
}

// Initial categories for the media intelligence blog
const INITIAL_CATEGORIES: CategoryInsert[] = [
  {
    slug: "media-monitoring",
    nameEn: "Media Monitoring",
    nameAr: "مراقبة الإعلام",
    descriptionEn: "Advanced media monitoring techniques, tools, and strategies for comprehensive coverage",
    descriptionAr: "تقنيات وأدوات واستراتيجيات مراقبة الإعلام المتقدمة للتغطية الشاملة",
    iconName: "Monitor"
  },
  {
    slug: "ai-intelligence",
    nameEn: "AI Intelligence",
    nameAr: "الذكاء الاصطناعي",
    descriptionEn: "Artificial intelligence applications in media analysis and business intelligence",
    descriptionAr: "تطبيقات الذكاء الاصطناعي في تحليل الإعلام وذكاء الأعمال",
    iconName: "Brain"
  },
  {
    slug: "crisis-communication",
    nameEn: "Crisis Communication",
    nameAr: "إدارة الأزمات",
    descriptionEn: "Strategic communication during crises and reputation management",
    descriptionAr: "التواصل الاستراتيجي أثناء الأزمات وإدارة السمعة",
    iconName: "AlertTriangle"
  },
  {
    slug: "digital-transformation",
    nameEn: "Digital Transformation",
    nameAr: "التحول الرقمي",
    descriptionEn: "Digital transformation strategies for modern organizations",
    descriptionAr: "استراتيجيات التحول الرقمي للمؤسسات الحديثة",
    iconName: "Zap"
  },
  {
    slug: "data-analytics",
    nameEn: "Data Analytics",
    nameAr: "تحليل البيانات",
    descriptionEn: "Advanced data analytics and insights for strategic decision making",
    descriptionAr: "تحليل البيانات المتقدم والرؤى للقرارات الاستراتيجية",
    iconName: "BarChart3"
  },
  {
    slug: "government-communication",
    nameEn: "Government Communication",
    nameAr: "التواصل الحكومي",
    descriptionEn: "Government communication strategies and public engagement",
    descriptionAr: "استراتيجيات التواصل الحكومي والمشاركة العامة",
    iconName: "Building"
  }
];

// Extract article data from the SQL content
const INITIAL_ARTICLES: Omit<ArticleInsert, 'categoryId'>[] = [
  {
    slug: "media-monitoring-first-line-defense-rumors",
    titleEn: "Media Monitoring: The First Line of Defense Against Rumors in the Age of Digital Chaos",
    titleAr: "مراقبة الإعلام: خط الدفاع الأول ضد الشائعات في عصر الفوضى الرقمية",
    excerptEn: "Smart media monitoring is no longer a luxury. It's a preemptive shield that protects societies and restores balance between public narratives and institutional facts.",
    excerptAr: "لم تعد مراقبة الإعلام الذكية ترفاً. إنها درع وقائي يحمي المجتمعات ويعيد التوازن بين السرديات العامة والحقائق المؤسسية.",
    contentEn: `# Media Monitoring: The First Line of Defense Against Rumors in the Age of Digital Chaos

## Can you stop a rumor before it spreads?

In a world where information moves at the speed of a click, rumors often travel faster than the truth—and hit harder. Smart media monitoring is no longer a luxury. It's a preemptive shield that protects societies and restores balance between public narratives and institutional facts.

## Media Monitoring: A National Security Imperative

Modern media monitoring has evolved into a real-time intelligence infrastructure that does more than collect headlines. According to the [Reuters Institute for the Study of Journalism (2024)](https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2024), misinformation spreads six times faster than factual news on social media platforms¹. The [UAE Government Excellence Program](https://u.ae/en/about-the-uae/strategies-initiatives-and-awards/federal-governments-strategies-and-plans/government-excellence-program) emphasizes that effective media monitoring enables:

- Instant tracking of digital content across platforms
- Sentiment analysis and detection of public unrest
- Identification of coordinated disinformation campaigns
- Measuring the virality and velocity of narratives

Research from the [Oxford Internet Institute (2023)](https://www.oii.ox.ac.uk/research/projects/social-media-monitoring-and-political-stability/) demonstrates that nations with robust media monitoring systems experience 67% fewer instances of prolonged social unrest caused by misinformation².

## How Rumors Spread and Why They are Dangerous

**Speed**: [MIT study in Science journal (2023)](https://www.science.org/doi/10.1126/science.aap9559) found that false news stories spread significantly faster than true stories, reaching 1,500 people six times faster³.

**Viral Platforms**: The [World Economic Forum Global Risks Report 2024](https://www.weforum.org/reports/global-risks-report-2024/) identifies social media platforms as primary vectors for information disorder⁴.

**Delays in Official Response**: Research by the [International Telecommunication Union (ITU)](https://www.itu.int/dms_pub/itu-d/opb/stg/D-STG-SG01.14-2024-PDF-E.pdf) shows that each hour of delayed official response increases rumor engagement by 23%⁵.

**Emotional Overload**: [IEEE Computer Society research (2024)](https://ieeexplore.ieee.org/document/10234567) confirms that emotionally charged content, including manipulated media, bypasses critical thinking processes⁶.

## How Monitoring Disrupts the Rumor Cycle

**Early Detection**: [OECD Digital Government Review (2024)](https://www.oecd.org/governance/digital-government-review-ai-public-sector-communication.htm) highlights AI-powered monitoring systems that flag suspicious hashtags and keyword spikes with 89% accuracy⁷.

**Real-Time Analysis**: The [UN Global Pulse initiative](https://www.unglobalpulse.org/project/real-time-analytics-crisis-response/) demonstrates that advanced sentiment analysis can distinguish between organic concern and coordinated campaigns⁸.

**Tactical Response Recommendations**:
- Timing of the official statement based on viral momentum analysis
- Tone calibration using sentiment mapping data
- Most effective channel optimization (TV, social media, press briefings)

**Post-Response Tracking**: Academic research from [Springer Nature (2024)](https://link.springer.com/article/10.1007/s13278-024-01089-3) shows that effective post-response monitoring reduces secondary rumor formation by 78%⁹.

## Strategic Frameworks for Implementation

The [UAE Digital Government Strategy 2025](https://u.ae/en/about-the-uae/strategies-initiatives-and-awards/federal-governments-strategies-and-plans/digital-government-strategy-2025) provides a comprehensive framework for media monitoring integration¹⁰:

| Component | Implementation Strategy | Success Metrics |
|-----------|------------------------|-----------------|
| Detection Infrastructure | 24/7 AI-powered monitoring centers | <3 minute detection time |
| Response Protocols | Pre-approved communication playbooks | <1 hour response time |
| Verification Systems | Multi-source fact-checking integration | 95% accuracy rate |
| Public Education | Digital literacy campaigns | 40% reduction in rumor sharing |

## Evidence-Based Impact Measurement

Research from the [Journal of Computer-Mediated Communication (2024)](https://onlinelibrary.wiley.com/doi/abs/10.1093/jcmc/zmae001) provides quantified benefits of systematic media monitoring¹¹:

- **45% reduction** in rumor engagement after early monitoring intervention
- **73% improvement** in government response time (from 24 hours to 6.5 hours average)
- **56% increase** in public trust in official communication channels
- **67% decrease** in economic impact from rumor-induced market volatility

## Conclusion

Media monitoring represents a fundamental shift from reactive to proactive governance. The evidence overwhelmingly supports investment in comprehensive monitoring infrastructure as essential for national stability, economic protection, and public trust maintenance.

In the digital age, the choice is clear: monitor and respond effectively, or risk losing control of the narrative entirely.`,
    contentAr: `# مراقبة الإعلام: خط الدفاع الأول ضد الشائعات في عصر الفوضى الرقمية

## هل يمكنك إيقاف الشائعة قبل انتشارها؟

في عالم تتحرك فيه المعلومات بسرعة النقرة، غالباً ما تنتشر الشائعات أسرع من الحقيقة - وتضرب بقوة أكبر. لم تعد مراقبة الإعلام الذكية ترفاً. إنها درع وقائي يحمي المجتمعات ويعيد التوازن بين السرديات العامة والحقائق المؤسسية.

## مراقبة الإعلام: ضرورة أمنية وطنية

تطورت مراقبة الإعلام الحديثة إلى بنية تحتية استخباراتية في الوقت الفعلي تفعل أكثر من مجرد جمع العناوين. وفقاً لمعهد رويترز لدراسة الصحافة (2024)، تنتشر المعلومات المضللة ستة أضعاف أسرع من الأخبار الحقيقية على منصات التواصل الاجتماعي.

## كيف تنتشر الشائعات ولماذا هي خطيرة

**السرعة**: وجدت دراسة معهد ماساتشوستس للتكنولوجيا في مجلة العلوم (2023) أن القصص الإخبارية الكاذبة تنتشر بشكل أسرع بكثير من القصص الحقيقية، حيث تصل إلى 1500 شخص ستة أضعاف أسرع.

**المنصات الفيروسية**: يحدد تقرير المخاطر العالمية للمنتدى الاقتصادي العالمي 2024 منصات التواصل الاجتماعي كناقلات أولية لاضطراب المعلومات.

## الخلاصة

تمثل مراقبة الإعلام تحولاً جوهرياً من الحوكمة التفاعلية إلى الاستباقية. الأدلة تدعم بشكل ساحق الاستثمار في البنية التحتية الشاملة للمراقبة كأمر أساسي للاستقرار الوطني وحماية الاقتصاد والحفاظ على الثقة العامة.`,
    metaDescriptionEn: "Discover how advanced media monitoring serves as the first line of defense against rumors and misinformation in the digital age. Evidence-based strategies for proactive governance.",
    metaDescriptionAr: "اكتشف كيف تعمل مراقبة الإعلام المتقدمة كخط الدفاع الأول ضد الشائعات والمعلومات المضللة في العصر الرقمي.",
    authorName: "Al-Mustakshef Team",
    authorImage: "/images/authors/almustakshef-team.jpg",
    published: true,
    featured: true,
    readingTime: 12,
    publishedAt: new Date("2024-01-15T10:00:00Z"),
    featuredImage: "/images/articles/media-monitoring-defense.jpg"
  },
  {
    slug: "almustakshef-ai-assistant-revolutionizing-media-monitoring",
    titleEn: "Al-Mustakshef AI Assistant: Revolutionizing Media Monitoring and Business Intelligence",
    titleAr: "مساعد المستكشف الذكي: ثورة في مراقبة الإعلام وذكاء الأعمال",
    excerptEn: "Al-Mustakshef AI Assistant represents a paradigm shift in media intelligence, combining advanced artificial intelligence with deep cultural understanding to deliver unparalleled insights.",
    excerptAr: "يمثل مساعد المستكشف الذكي تحولاً جذرياً في ذكاء الإعلام، حيث يجمع بين الذكاء الاصطناعي المتقدم والفهم الثقافي العميق لتقديم رؤى لا مثيل لها.",
    contentEn: `# Al-Mustakshef AI Assistant: Revolutionizing Media Monitoring and Business Intelligence

## Executive Summary

Al-Mustakshef AI Assistant represents a paradigm shift in media intelligence, combining advanced artificial intelligence with deep cultural understanding to deliver unparalleled insights into Middle Eastern media landscapes. This comprehensive analysis demonstrates how AI-powered systems transform traditional monitoring into strategic intelligence platforms.

## The Evolution of Media Intelligence Systems

### From Manual to Intelligent Automation

The [Stanford AI Laboratory's "Media Intelligence Evolution Study" (2024)](https://ai.stanford.edu/research/media-intelligence-evolution-2024) documents the transformation from manual media monitoring to AI-powered intelligence systems¹. Traditional approaches required teams of analysts spending 40+ hours weekly processing content that modern AI systems analyze in real-time.

**Traditional Media Monitoring Limitations:**
- Manual content categorization with 67% accuracy
- Language barriers limiting cross-cultural analysis
- Time delays of 6-12 hours for comprehensive reports
- Subjective interpretation leading to inconsistent insights

**AI-Enhanced Intelligence Capabilities:**
Research from the [MIT Computer Science and AI Laboratory (2024)](https://www.csail.mit.edu/research/media-ai-intelligence-2024) demonstrates significant improvements²:
- Automated content analysis with 94% accuracy
- Real-time multilingual processing across 15+ languages
- Instant sentiment analysis with cultural context awareness
- Predictive modeling for narrative trajectory forecasting

### Cultural Intelligence Integration

The [American University of Beirut's "Arab Media AI Research 2024"](https://www.aub.edu.lb/research/arab-media-ai-2024) emphasizes the critical importance of cultural intelligence in AI systems³. Generic AI models achieve only 34% accuracy in Arabic sentiment analysis, while culturally-trained systems reach 91% accuracy.

**Cultural Context Requirements:**
- Religious and social reference interpretation
- Regional dialect recognition across 12+ variants
- Historical and political context integration
- Generational communication pattern analysis

## Technical Architecture and Capabilities

### Advanced Natural Language Processing

The [King Abdullah University of Science and Technology (KAUST) AI Lab's "Arabic NLP Advancement Report 2024"](https://cemse.kaust.edu.sa/ai/research/arabic-nlp-2024) outlines breakthrough achievements in Arabic language processing⁴:

**Multi-Dialect Processing:**
- Modern Standard Arabic: 97% accuracy
- Gulf Arabic dialects: 93% accuracy
- Levantine Arabic: 91% accuracy
- Egyptian Arabic: 94% accuracy
- Maghreb Arabic: 89% accuracy

**Cross-Language Correlation:**
- English-Arabic sentiment alignment: 96% accuracy
- Code-switching detection: 92% precision
- Cultural metaphor interpretation: 87% success rate
- Religious reference recognition: 95% accuracy

### Real-Time Analytics and Prediction

The [IEEE Intelligent Systems Journal (2024)](https://ieeexplore.ieee.org/document/10456789) validates Al-Mustakshef's predictive capabilities⁵:

**Viral Content Prediction:**
- 89% accuracy in predicting content virality within first hour
- 94% precision in identifying coordinated amplification campaigns
- 87% success rate in forecasting narrative evolution
- 91% accuracy in audience engagement prediction

## Conclusion: Strategic Transformation Through AI Intelligence

Al-Mustakshef AI Assistant represents more than technological advancement—it embodies a strategic transformation enabling organizations to navigate complex media landscapes with unprecedented precision and cultural intelligence. The evidence demonstrates substantial competitive advantages through enhanced accuracy, reduced response times, and deeper cultural understanding.

The combination of advanced AI capabilities with regional expertise creates unique value propositions unmatched by global competitors. Organizations implementing Al-Mustakshef gain strategic intelligence capabilities that transform reactive monitoring into proactive narrative leadership.

Investment in AI-powered media intelligence is not merely technological upgrading—it represents essential infrastructure for competitive success in the modern information environment. The quantified benefits demonstrate clear ROI while providing strategic advantages that compound over time.`,
    contentAr: `# مساعد المستكشف الذكي: ثورة في مراقبة الإعلام وذكاء الأعمال

## الملخص التنفيذي

يمثل مساعد المستكشف الذكي تحولاً جذرياً في ذكاء الإعلام، حيث يجمع بين الذكاء الاصطناعي المتقدم والفهم الثقافي العميق لتقديم رؤى لا مثيل لها في المشهد الإعلامي للشرق الأوسط. يوضح هذا التحليل الشامل كيف تحول الأنظمة المدعومة بالذكاء الاصطناعي المراقبة التقليدية إلى منصات استخبارات استراتيجية.

## تطور أنظمة ذكاء الإعلام

### من اليدوي إلى الأتمتة الذكية

توثق دراسة "تطور ذكاء الإعلام" لمختبر الذكاء الاصطناعي بجامعة ستانفورد (2024) التحول من مراقبة الإعلام اليدوية إلى أنظمة الذكاء المدعومة بالذكاء الاصطناعي. تطلبت الأساليب التقليدية فرق محللين يقضون أكثر من 40 ساعة أسبوعياً في معالجة المحتوى الذي تحلله الأنظمة الحديثة للذكاء الاصطناعي في الوقت الفعلي.

## الذكاء الثقافي المتكامل

تؤكد الجامعة الأمريكية في بيروت في بحث "الذكاء الاصطناعي للإعلام العربي 2024" على الأهمية الحاسمة للذكاء الثقافي في أنظمة الذكاء الاصطناعي. تحقق نماذج الذكاء الاصطناعي العامة دقة 34% فقط في تحليل المشاعر العربية، بينما تصل الأنظمة المدربة ثقافياً إلى دقة 91%.

## الخلاصة: التحول الاستراتيجي من خلال ذكاء الذكاء الاصطناعي

يمثل مساعد المستكشف الذكي أكثر من مجرد تقدم تكنولوجي - إنه يجسد تحولاً استراتيجياً يمكن المؤسسات من التنقل في المشاهد الإعلامية المعقدة بدقة وذكاء ثقافي لا مثيل لهما.`,
    metaDescriptionEn: "Discover how Al-Mustakshef AI Assistant revolutionizes media monitoring with advanced AI and cultural intelligence for Middle Eastern markets.",
    metaDescriptionAr: "اكتشف كيف يحدث مساعد المستكشف الذكي ثورة في مراقبة الإعلام بالذكاء الاصطناعي المتقدم والذكاء الثقافي للأسواق الشرق أوسطية.",
    authorName: "Al-Mustakshef Team",
    authorImage: "/images/authors/almustakshef-team.jpg",
    published: true,
    featured: true,
    readingTime: 15,
    publishedAt: new Date("2024-01-10T14:00:00Z"),
    featuredImage: "/images/articles/ai-assistant-revolution.jpg"
  }
];

class DatabaseSeeder {
  private verbose: boolean;

  constructor(options: SeedOptions = {}) {
    this.verbose = options.verbose || false;
  }

  private log(message: string) {
    if (this.verbose) {
      console.log(`[DB-SEED] ${message}`);
    }
  }

  private error(message: string) {
    console.error(`[DB-SEED ERROR] ${message}`);
  }

  private success(message: string) {
    console.log(`[DB-SEED SUCCESS] ${message}`);
  }

  /**
   * Seed categories
   */
  async seedCategories(force: boolean = false): Promise<boolean> {
    try {
      this.log("Seeding categories...");

      // Check existing categories
      const existingCategories = await db.select().from(categories);
      
      if (existingCategories.length > 0 && !force) {
        this.log(`Found ${existingCategories.length} existing categories, skipping`);
        return true;
      }

      if (force && existingCategories.length > 0) {
        this.log("Force mode: clearing existing categories");
        await db.delete(categories);
      }

      // Insert categories
      const insertedCategories = await db
        .insert(categories)
        .values(INITIAL_CATEGORIES)
        .returning();

      this.success(`Seeded ${insertedCategories.length} categories`);
      return true;
    } catch (error) {
      this.error(`Failed to seed categories: ${error.message}`);
      return false;
    }
  }

  /**
   * Seed articles
   */
  async seedArticles(force: boolean = false): Promise<boolean> {
    try {
      this.log("Seeding articles...");

      // Get categories for reference
      const allCategories = await db.select().from(categories);
      if (allCategories.length === 0) {
        this.error("No categories found. Please seed categories first.");
        return false;
      }

      // Check existing articles
      const existingArticles = await db.select().from(articles);
      
      if (existingArticles.length > 0 && !force) {
        this.log(`Found ${existingArticles.length} existing articles, skipping`);
        return true;
      }

      if (force && existingArticles.length > 0) {
        this.log("Force mode: clearing existing articles");
        await db.delete(articles);
      }

      // Assign categories to articles
      const mediaMonitoringCategory = allCategories.find(c => c.slug === "media-monitoring");
      const aiIntelligenceCategory = allCategories.find(c => c.slug === "ai-intelligence");

      const articlesToInsert: ArticleInsert[] = [
        {
          ...INITIAL_ARTICLES[0],
          categoryId: mediaMonitoringCategory?.id || allCategories[0].id
        },
        {
          ...INITIAL_ARTICLES[1],
          categoryId: aiIntelligenceCategory?.id || allCategories[1].id
        }
      ];

      // Insert articles
      const insertedArticles = await db
        .insert(articles)
        .values(articlesToInsert)
        .returning();

      this.success(`Seeded ${insertedArticles.length} articles`);
      return true;
    } catch (error) {
      this.error(`Failed to seed articles: ${error.message}`);
      return false;
    }
  }

  /**
   * Run complete seeding process
   */
  async seed(options: SeedOptions = {}): Promise<boolean> {
    this.log("Starting database seeding...");

    const { force = false, categoriesOnly = false, articlesOnly = false } = options;

    // Seed categories (unless articles-only)
    if (!articlesOnly) {
      if (!(await this.seedCategories(force))) {
        return false;
      }
    }

    // Seed articles (unless categories-only)
    if (!categoriesOnly) {
      if (!(await this.seedArticles(force))) {
        return false;
      }
    }

    this.success("Database seeding completed successfully");
    return true;
  }
}

// Export function for use in migration script
export async function seedDatabase(options: SeedOptions = {}): Promise<boolean> {
  const seeder = new DatabaseSeeder(options);
  return await seeder.seed(options);
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options: SeedOptions = {
    force: args.includes("--force"),
    verbose: args.includes("--verbose") || args.includes("-v"),
    categoriesOnly: args.includes("--categories-only"),
    articlesOnly: args.includes("--articles-only")
  };

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Database Seeding Tool for AlmstkshfBlog

Usage: tsx scripts/db-seed.ts [options]

Options:
  --force            Force seeding even if data exists
  --verbose          Enable verbose logging
  -v                 Short for --verbose
  --categories-only  Seed only categories
  --articles-only    Seed only articles
  --help             Show this help message
  -h                 Short for --help

Examples:
  tsx scripts/db-seed.ts                    # Seed all data
  tsx scripts/db-seed.ts --force            # Force seed all data
  tsx scripts/db-seed.ts --categories-only  # Seed only categories
  tsx scripts/db-seed.ts --articles-only -v # Seed only articles with verbose output
`);
    process.exit(0);
  }

  const success = await seedDatabase(options);
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
}