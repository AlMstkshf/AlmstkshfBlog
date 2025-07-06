import { storage } from "../storage";
import { MailService } from '@sendgrid/mail';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  subjectAr?: string;
  bodyEn: string;
  bodyAr?: string;
  type: 'welcome' | 'newsletter' | 'notification' | 'digest';
  variables: string[];
}

interface EmailJob {
  id: string;
  templateId: string;
  recipients: string[];
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'failed';
  variables: Record<string, string>;
  language: 'en' | 'ar';
}

interface NewsletterDigest {
  weeklyDigest: boolean;
  monthlyDigest: boolean;
  breakingNews: boolean;
  categoryUpdates: number[];
}

class EmailAutomation {
  private templates: Map<string, EmailTemplate> = new Map();
  private emailQueue: EmailJob[] = [];
  private isProcessing = false;
  private mailService: MailService;

  constructor() {
    this.mailService = new MailService();
    if (process.env.SENDGRID_API_KEY) {
      this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
    }
    this.initializeTemplates();
    this.startEmailProcessor();
  }

  private initializeTemplates(): void {
    const templates: EmailTemplate[] = [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to ALMSTKSHF - Your Media Intelligence Hub',
        subjectAr: 'مرحباً بك في المستكشف - مركز ذكاء الإعلام',
        bodyEn: `
          <h1>Welcome to ALMSTKSHF, {{name}}!</h1>
          <p>Thank you for subscribing to our newsletter. You'll receive the latest insights on media intelligence, digital transformation, and regional analysis.</p>
          <h2>What to expect:</h2>
          <ul>
            <li>Weekly digest of trending articles</li>
            <li>Breaking news in media and technology</li>
            <li>Exclusive insights from industry experts</li>
          </ul>
          <p>Best regards,<br>The ALMSTKSHF Team</p>
        `,
        bodyAr: `
          <h1>مرحباً بك في المستكشف، {{name}}!</h1>
          <p>شكراً لك لاشتراكك في نشرتنا الإخبارية. ستتلقى أحدث الأفكار حول ذكاء الإعلام والتحول الرقمي والتحليل الإقليمي.</p>
          <h2>ما يمكن توقعه:</h2>
          <ul>
            <li>ملخص أسبوعي للمقالات الرائجة</li>
            <li>أخبار عاجلة في الإعلام والتكنولوجيا</li>
            <li>رؤى حصرية من خبراء الصناعة</li>
          </ul>
          <p>مع أطيب التحيات،<br>فريق المستكشف</p>
        `,
        type: 'welcome',
        variables: ['name']
      },
      {
        id: 'weekly-digest',
        name: 'Weekly Newsletter',
        subject: 'Weekly Digest - {{weekOf}}',
        subjectAr: 'الملخص الأسبوعي - {{weekOf}}',
        bodyEn: `
          <h1>Your Weekly Media Intelligence Digest</h1>
          <p>Here are this week's most important stories and insights:</p>
          
          <h2>Trending Articles</h2>
          {{trendingArticles}}
          
          <h2>New Publications</h2>
          {{newArticles}}
          
          <h2>Category Highlights</h2>
          {{categoryHighlights}}
          
          <p>Stay informed,<br>The ALMSTKSHF Team</p>
        `,
        bodyAr: `
          <h1>ملخصك الأسبوعي لذكاء الإعلام</h1>
          <p>إليك أهم القصص والرؤى لهذا الأسبوع:</p>
          
          <h2>المقالات الرائجة</h2>
          {{trendingArticles}}
          
          <h2>المنشورات الجديدة</h2>
          {{newArticles}}
          
          <h2>أبرز الفئات</h2>
          {{categoryHighlights}}
          
          <p>ابق على اطلاع،<br>فريق المستكشف</p>
        `,
        type: 'newsletter',
        variables: ['weekOf', 'trendingArticles', 'newArticles', 'categoryHighlights']
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  async sendWelcomeEmail(email: string, name: string, language: 'en' | 'ar' = 'en'): Promise<string> {
    const jobId = this.generateId();
    const emailJob: EmailJob = {
      id: jobId,
      templateId: 'welcome',
      recipients: [email],
      scheduledFor: new Date(),
      status: 'pending',
      variables: { name },
      language
    };

    this.emailQueue.push(emailJob);
    return jobId;
  }

  async scheduleWeeklyDigest(): Promise<void> {
    const subscribers = await storage.getNewsletterSubscribers();
    const articles = await storage.getArticles({ limit: 10, published: true });
    
    // Get trending articles from the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const trendingArticles = articles
      .filter(article => new Date(article.createdAt!) > oneWeekAgo)
      .slice(0, 5);

    const newArticles = articles
      .filter(article => new Date(article.createdAt!) > oneWeekAgo)
      .slice(0, 3);

    // Generate content for each language
    const contentEn = this.generateDigestContent(trendingArticles, newArticles, 'en');
    const contentAr = this.generateDigestContent(trendingArticles, newArticles, 'ar');

    // Group subscribers by language preference (default to English)
    const subscribersByLang = {
      en: subscribers.filter(s => !s.email.includes('.ar') && !s.email.includes('arabic')),
      ar: subscribers.filter(s => s.email.includes('.ar') || s.email.includes('arabic'))
    };

    // Schedule emails for each language group
    for (const [lang, subs] of Object.entries(subscribersByLang)) {
      if (subs.length === 0) continue;

      const jobId = this.generateId();
      const emailJob: EmailJob = {
        id: jobId,
        templateId: 'weekly-digest',
        recipients: subs.map(s => s.email),
        scheduledFor: new Date(),
        status: 'pending',
        variables: {
          weekOf: this.formatWeekOf(new Date()),
          trendingArticles: lang === 'ar' ? contentAr.trending : contentEn.trending,
          newArticles: lang === 'ar' ? contentAr.new : contentEn.new,
          categoryHighlights: lang === 'ar' ? contentAr.highlights : contentEn.highlights
        },
        language: lang as 'en' | 'ar'
      };

      this.emailQueue.push(emailJob);
    }
  }

  private generateDigestContent(trending: any[], newArticles: any[], language: 'en' | 'ar') {
    const content = {
      trending: '',
      new: '',
      highlights: ''
    };

    // Generate trending articles HTML
    content.trending = trending.map(article => {
      const title = language === 'ar' && article.titleAr ? article.titleAr : article.titleEn;
      const excerpt = language === 'ar' && article.excerptAr ? article.excerptAr : article.excerptEn;
      
      return `
        <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
          <h3><a href="${process.env.BASE_URL}/${language}/blog/${article.category?.slug}/${article.slug}">${title}</a></h3>
          <p>${excerpt}</p>
          <small style="color: #666;">${language === 'ar' ? 'بواسطة' : 'By'} ${article.authorName}</small>
        </div>
      `;
    }).join('');

    // Generate new articles HTML
    content.new = newArticles.map(article => {
      const title = language === 'ar' && article.titleAr ? article.titleAr : article.titleEn;
      
      return `
        <div style="margin-bottom: 10px;">
          <a href="${process.env.BASE_URL}/${language}/blog/${article.category?.slug}/${article.slug}">${title}</a>
        </div>
      `;
    }).join('');

    // Generate category highlights
    const categories = Array.from(new Set(newArticles.map(a => a.category?.nameEn || a.category?.nameAr).filter(Boolean)));
    content.highlights = categories.map(cat => `<li>${cat}</li>`).join('');

    return content;
  }

  private async startEmailProcessor(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    setInterval(async () => {
      await this.processEmailQueue();
    }, 30000); // Process every 30 seconds
  }

  private async processEmailQueue(): Promise<void> {
    const pendingJobs = this.emailQueue.filter(job => job.status === 'pending');
    
    for (const job of pendingJobs) {
      try {
        await this.sendEmail(job);
        job.status = 'sent';
      } catch (error) {
        console.error(`Failed to send email job ${job.id}:`, error);
        job.status = 'failed';
      }
    }
  }

  private async sendEmail(job: EmailJob): Promise<void> {
    const template = this.templates.get(job.templateId);
    if (!template) {
      throw new Error(`Template ${job.templateId} not found`);
    }

    const subject = job.language === 'ar' && template.subjectAr 
      ? template.subjectAr 
      : template.subject;
    
    const body = job.language === 'ar' && template.bodyAr 
      ? template.bodyAr 
      : template.bodyEn;

    // Replace variables in subject and body
    let processedSubject = subject;
    let processedBody = body;

    Object.entries(job.variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value);
      processedBody = processedBody.replace(new RegExp(placeholder, 'g'), value);
    });

    // Send email using SendGrid
    try {
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SendGrid API key not configured');
      }

      const msg = {
        to: job.recipients,
        from: {
          email: 'rased@almstkshf.com',
          name: 'Almstkshf Media Monitoring'
        },
        subject: processedSubject,
        html: processedBody,
      };

      await this.mailService.send(msg);
      console.log(`Email sent successfully to ${job.recipients.length} recipients`);
    } catch (error) {
      console.error('SendGrid email error:', error);
      throw error;
    }
  }

  async scheduleArticleNotification(articleId: number): Promise<void> {
    const article = await storage.getArticles({ limit: 1 });
    if (!article.length) return;

    const subscribers = await storage.getNewsletterSubscribers();
    
    // Notify subscribers about new high-value content
    if (article[0].featured) {
      // Schedule immediate notification for featured articles
      const jobId = this.generateId();
      const emailJob: EmailJob = {
        id: jobId,
        templateId: 'notification',
        recipients: subscribers.map(s => s.email),
        scheduledFor: new Date(),
        status: 'pending',
        variables: {
          articleTitle: article[0].titleEn || '',
          articleUrl: `${process.env.BASE_URL}/en/blog/${article[0].slug}`
        },
        language: 'en'
      };

      this.emailQueue.push(emailJob);
    }
  }

  private formatWeekOf(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Management methods
  getEmailQueue(): EmailJob[] {
    return this.emailQueue;
  }

  getTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  updateTemplate(id: string, updates: Partial<EmailTemplate>): boolean {
    const template = this.templates.get(id);
    if (template) {
      Object.assign(template, updates);
      return true;
    }
    return false;
  }

  async sendTestEmail(recipientEmail: string, language: 'en' | 'ar' = 'en'): Promise<void> {
    const testEmailJob: EmailJob = {
      id: this.generateId(),
      templateId: 'test',
      recipients: [recipientEmail],
      scheduledFor: new Date(),
      status: 'pending',
      variables: {
        name: 'Admin',
        testDate: new Date().toLocaleString(),
        systemStatus: 'All systems operational'
      },
      language
    };

    // Add test template if not exists
    if (!this.templates.has('test')) {
      this.templates.set('test', {
        id: 'test',
        name: 'Test Email',
        subject: 'Test Email from Almstkshf Media Monitoring',
        subjectAr: 'بريد إلكتروني تجريبي من المستكشف لمراقبة الإعلام',
        bodyEn: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1e40af;">Test Email Successful!</h1>
            <p>Hello {{name}},</p>
            <p>This is a test email from your Almstkshf Media Monitoring system to verify that email functionality is working correctly.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>System Status</h3>
              <p><strong>Status:</strong> {{systemStatus}}</p>
              <p><strong>Test Date:</strong> {{testDate}}</p>
              <p><strong>Email Service:</strong> SendGrid Integration Active</p>
            </div>
            <p>If you received this email, your automation system is ready to send newsletters, notifications, and reports.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              Almstkshf Media Monitoring Team<br>
              <a href="mailto:rased@almstkshf.com">rased@almstkshf.com</a>
            </p>
          </div>
        `,
        bodyAr: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <h1 style="color: #1e40af;">نجح إرسال البريد الإلكتروني التجريبي!</h1>
            <p>مرحباً {{name}}،</p>
            <p>هذا بريد إلكتروني تجريبي من نظام المستكشف لمراقبة الإعلام للتحقق من أن وظيفة البريد الإلكتروني تعمل بشكل صحيح.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>حالة النظام</h3>
              <p><strong>الحالة:</strong> {{systemStatus}}</p>
              <p><strong>تاريخ الاختبار:</strong> {{testDate}}</p>
              <p><strong>خدمة البريد الإلكتروني:</strong> تكامل SendGrid نشط</p>
            </div>
            <p>إذا تلقيت هذا البريد الإلكتروني، فإن نظام الأتمتة الخاص بك جاهز لإرسال النشرات الإخبارية والإشعارات والتقارير.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              مع أطيب التحيات،<br>
              فريق المستكشف لمراقبة الإعلام<br>
              <a href="mailto:rased@almstkshf.com">rased@almstkshf.com</a>
            </p>
          </div>
        `,
        type: 'notification',
        variables: ['name', 'testDate', 'systemStatus']
      });
    }

    await this.sendEmail(testEmailJob);
  }

  async generateWeeklyReport(): Promise<string> {
    const articles = await storage.getArticles({ limit: 50 });
    const subscribers = await storage.getNewsletterSubscribers();
    const categories = await storage.getCategories();

    const thisWeek = new Date();
    const weekStart = new Date(thisWeek);
    weekStart.setDate(thisWeek.getDate() - 7);

    const weeklyArticles = articles.filter(article => 
      article.createdAt && new Date(article.createdAt) >= weekStart
    );

    const publishedThisWeek = weeklyArticles.filter(a => a.published);
    const categoriesWithCounts = categories.map(cat => ({
      ...cat,
      articleCount: weeklyArticles.filter(a => a.categoryId === cat.id).length
    }));

    const report = {
      weekOf: this.formatWeekOf(weekStart),
      totalArticles: weeklyArticles.length,
      publishedArticles: publishedThisWeek.length,
      draftArticles: weeklyArticles.length - publishedThisWeek.length,
      totalSubscribers: subscribers.length,
      activeSubscribers: subscribers.filter(s => s.active).length,
      categoriesData: categoriesWithCounts,
      topPerformingArticles: publishedThisWeek
        .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        .slice(0, 5)
        .map(article => ({
          title: article.titleEn,
          titleAr: article.titleAr,
          category: article.category?.nameEn || 'Uncategorized',
          published: article.createdAt,
          featured: article.featured
        }))
    };

    return JSON.stringify(report, null, 2);
  }

  async sendWeeklyReport(adminEmail: string): Promise<void> {
    const reportData = await this.generateWeeklyReport();
    const parsedReport = JSON.parse(reportData);

    const reportEmailJob: EmailJob = {
      id: this.generateId(),
      templateId: 'weekly-report',
      recipients: [adminEmail],
      scheduledFor: new Date(),
      status: 'pending',
      variables: {
        weekOf: parsedReport.weekOf,
        totalArticles: parsedReport.totalArticles.toString(),
        publishedArticles: parsedReport.publishedArticles.toString(),
        draftArticles: parsedReport.draftArticles.toString(),
        totalSubscribers: parsedReport.totalSubscribers.toString(),
        activeSubscribers: parsedReport.activeSubscribers.toString(),
        topArticles: parsedReport.topPerformingArticles.map((article: any) => 
          `<li><strong>${article.title}</strong> (${article.category})</li>`
        ).join('')
      },
      language: 'en'
    };

    // Add weekly report template if not exists
    if (!this.templates.has('weekly-report')) {
      this.templates.set('weekly-report', {
        id: 'weekly-report',
        name: 'Weekly Report',
        subject: 'Weekly Report - Almstkshf Media Monitoring ({{weekOf}})',
        bodyEn: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1e40af;">Weekly Report - {{weekOf}}</h1>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #374151;">Content Summary</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <p><strong>Total Articles:</strong> {{totalArticles}}</p>
                  <p><strong>Published:</strong> {{publishedArticles}}</p>
                  <p><strong>Drafts:</strong> {{draftArticles}}</p>
                </div>
                <div>
                  <p><strong>Total Subscribers:</strong> {{totalSubscribers}}</p>
                  <p><strong>Active Subscribers:</strong> {{activeSubscribers}}</p>
                </div>
              </div>
            </div>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Top Performing Articles</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                {{topArticles}}
              </ul>
            </div>

            <p style="color: #6b7280;">
              This automated report is generated weekly to track your blog's performance and engagement metrics.
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Almstkshf Media Monitoring<br>
              <a href="mailto:rased@almstkshf.com">rased@almstkshf.com</a>
            </p>
          </div>
        `,
        type: 'digest',
        variables: ['weekOf', 'totalArticles', 'publishedArticles', 'draftArticles', 'totalSubscribers', 'activeSubscribers', 'topArticles']
      });
    }

    await this.sendEmail(reportEmailJob);
  }
}

export const emailAutomation = new EmailAutomation();