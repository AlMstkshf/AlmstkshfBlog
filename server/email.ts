import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface ContactEmail {
  name: string;
  email: string;
  company?: string;
  type: string;
  message: string;
  language: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const config: EmailConfig = {
      host: 'smtp.zoho.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.ZOHO_EMAIL_USER || 'rased@almstkshf.com',
        pass: process.env.ZOHO_EMAIL_PASS || 'almstkshf@2025',
      },
    };

    if (!config.auth.user || !config.auth.pass) {
      console.warn('Email credentials not configured. Email functionality disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport(config);
  }

  async sendContactFormEmail(contactData: ContactEmail): Promise<boolean> {
    if (!this.transporter) {
      throw new Error('Email service not configured');
    }

    const isArabic = contactData.language === 'ar';
    
    const subject = isArabic 
      ? `رسالة جديدة من موقع المستكشف - ${contactData.type}`
      : `New Contact Form Submission - ${contactData.type}`;

    const htmlContent = isArabic ? this.getArabicEmailTemplate(contactData) : this.getEnglishEmailTemplate(contactData);

    const mailOptions = {
      from: process.env.ZOHO_EMAIL_USER,
      to: process.env.CONTACT_EMAIL || process.env.ZOHO_EMAIL_USER,
      subject,
      html: htmlContent,
      replyTo: contactData.email,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  private getEnglishEmailTemplate(data: ContactEmail): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #1e40af; }
          .value { margin-top: 5px; }
          .message-box { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #1e40af; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
            <p>Al-Mstkshf Media Monitoring Platform</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${data.name}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${data.email}</div>
            </div>
            ${data.company ? `
            <div class="field">
              <div class="label">Company/Organization:</div>
              <div class="value">${data.company}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">Inquiry Type:</div>
              <div class="value">${data.type}</div>
            </div>
            <div class="field">
              <div class="label">Message:</div>
              <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="field">
              <div class="label">Submission Time:</div>
              <div class="value">${new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' })} (Dubai Time)</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getArabicEmailTemplate(data: ContactEmail): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; direction: rtl; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #1e40af; }
          .value { margin-top: 5px; }
          .message-box { background: white; padding: 15px; border-radius: 4px; border-right: 4px solid #1e40af; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>رسالة جديدة من نموذج التواصل</h1>
            <p>منصة المستكشف لمراقبة الإعلام</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">الاسم:</div>
              <div class="value">${data.name}</div>
            </div>
            <div class="field">
              <div class="label">البريد الإلكتروني:</div>
              <div class="value">${data.email}</div>
            </div>
            ${data.company ? `
            <div class="field">
              <div class="label">الشركة/المؤسسة:</div>
              <div class="value">${data.company}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">نوع الاستفسار:</div>
              <div class="value">${data.type}</div>
            </div>
            <div class="field">
              <div class="label">الرسالة:</div>
              <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="field">
              <div class="label">وقت الإرسال:</div>
              <div class="value">${new Date().toLocaleString('ar-AE', { timeZone: 'Asia/Dubai' })} (توقيت دبي)</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();