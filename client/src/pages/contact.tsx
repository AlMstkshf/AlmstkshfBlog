import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import { insertContactSubmissionSchema } from "@shared/schema";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { z } from "zod";
import { ContactFormSkeleton } from "@/components/ui/skeletons";

const contactFormSchema = insertContactSubmissionSchema.extend({
  type: z.enum(["demo", "contact", "support"]),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const [location] = useLocation();

  // Extract type from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const typeFromUrl = urlParams.get('type') as 'demo' | 'contact' | 'support' | null;

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: typeFromUrl === 'demo' 
        ? (language === "ar" 
          ? "أرغب في الحصول على عرض توضيحي لخدمات مراقبة الإعلام والتحليلات الخاصة بكم." 
          : "I would like to request a demo of your media monitoring and analytics services.")
        : "",
      type: typeFromUrl || "contact",
      language,
    },
  });

  // Update form when URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') as 'demo' | 'contact' | 'support' | null;
    
    if (type && ['demo', 'contact', 'support'].includes(type)) {
      form.setValue('type', type);
      
      // Pre-fill message for demo requests
      if (type === 'demo') {
        const demoMessage = language === "ar" 
          ? "أرغب في الحصول على عرض توضيحي لخدمات مراقبة الإعلام والتحليلات الخاصة بكم."
          : "I would like to request a demo of your media monitoring and analytics services.";
        form.setValue('message', demoMessage);
      }
    }
  }, [location, language, form]);

  const submitMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: language === "ar" ? "تم إرسال الرسالة بنجاح!" : "Message sent successfully!",
        description: language === "ar" 
          ? "شكراً لتواصلكم معنا. سنقوم بالرد عليكم في أقرب وقت ممكن."
          : "Thank you for contacting us. We will respond as soon as possible.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: language === "ar" ? "خطأ في إرسال الرسالة" : "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    submitMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-slate-50" dir={isRTL ? "rtl" : "ltr"}>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              {language === "ar" ? "تواصل معنا" : "Contact Us"}
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              {language === "ar"
                ? "نحن هنا لمساعدتكم في تحقيق أهدافكم في مراقبة الإعلام وتحليل البيانات. تواصلوا معنا اليوم للحصول على استشارة مجانية."
                : "We're here to help you achieve your media monitoring and data analysis goals. Contact us today for a free consultation."
              }
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-secondary mb-6">
                {language === "ar" ? "معلومات التواصل" : "Get in Touch"}
              </h2>
              <p className="text-slate-600 mb-8">
                {language === "ar"
                  ? "فريقنا من الخبراء مستعد لمساعدتكم في تطوير استراتيجية مراقبة الإعلام المناسبة لمؤسستكم."
                  : "Our team of experts is ready to help you develop the right media monitoring strategy for your organization."
                }
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-1">
                      {language === "ar" ? "العنوان" : "Address"}
                    </h3>
                    <p className="text-slate-600">
                      DIFC, Dubai, UAE
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-1">
                      {language === "ar" ? "الهاتف" : "Phone"}
                    </h3>
                    <p className="text-slate-600">+971585400191</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-1">
                      {language === "ar" ? "البريد الإلكتروني" : "Email"}
                    </h3>
                    <p className="text-slate-600">rased@almstkshf.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary mb-1">
                      {language === "ar" ? "ساعات العمل" : "Business Hours"}
                    </h3>
                    <p className="text-slate-600">
                      {language === "ar" 
                        ? "الأحد - الخميس: 9:00 ص - 6:00 م (توقيت الإمارات)"
                        : "Sunday - Thursday: 9:00 AM - 6:00 PM (UAE Time)"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "ar" ? "أرسل لنا رسالة" : "Send us a message"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">
                        {language === "ar" ? "الاسم" : "Name"} *
                      </Label>
                      <Input
                        id="name"
                        {...form.register("name")}
                        placeholder={language === "ar" ? "اسمك الكامل" : "Your full name"}
                        dir={isRTL ? "rtl" : "ltr"}
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">
                        {language === "ar" ? "البريد الإلكتروني" : "Email"} *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register("email")}
                        placeholder={language === "ar" ? "your@email.com" : "your@email.com"}
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company">
                      {language === "ar" ? "الشركة/المؤسسة" : "Company/Organization"}
                    </Label>
                    <Input
                      id="company"
                      {...form.register("company")}
                      placeholder={language === "ar" ? "اسم الشركة أو المؤسسة" : "Company or organization name"}
                      dir={isRTL ? "rtl" : "ltr"}
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">
                      {language === "ar" ? "نوع الاستفسار" : "Inquiry Type"}
                    </Label>
                    <Select
                      value={form.watch("type")}
                      onValueChange={(value) => form.setValue("type", value as "demo" | "contact" | "support")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demo">
                          {language === "ar" ? "طلب عرض توضيحي" : "Request Demo"}
                        </SelectItem>
                        <SelectItem value="contact">
                          {language === "ar" ? "استفسار عام" : "General Inquiry"}
                        </SelectItem>
                        <SelectItem value="support">
                          {language === "ar" ? "الدعم التقني" : "Technical Support"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">
                      {language === "ar" ? "الرسالة" : "Message"} *
                    </Label>
                    <Textarea
                      id="message"
                      {...form.register("message")}
                      placeholder={language === "ar" 
                        ? "اكتب رسالتك هنا..."
                        : "Write your message here..."
                      }
                      rows={5}
                      dir={isRTL ? "rtl" : "ltr"}
                    />
                    {form.formState.errors.message && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full"
                  >
                    {submitMutation.isPending
                      ? (language === "ar" ? "جاري الإرسال..." : "Sending...")
                      : (language === "ar" ? "إرسال الرسالة" : "Send Message")
                    }
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}