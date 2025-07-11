import { useState, useEffect } from "react";
import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { useLanguage } from "@/hooks/use-language";
import { MetaTags } from "@/components/seo/meta-tags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, FileText, Image, File } from "lucide-react";

export default function Downloads() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language, isRTL } = useLanguage();

  useEffect(() => {
    fetch('/api/downloads')
      .then(res => res.json())
      .then(data => {
        setDownloads(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'image':
        return <Image className="w-6 h-6 text-blue-500" />;
      default:
        return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir={isRTL ? "rtl" : "ltr"}>
      <MetaTags
        title={language === "ar" ? "التحميلات | المستكشف - منصة الذكاء الإعلامي" : "Downloads | Al-Mustakshef - Media Intelligence Platform"}
        description={language === "ar" ? "تحميل الموارد والملفات المتخصصة من منصة المستكشف للذكاء الإعلامي" : "Download specialized resources and files from Al-Mustakshef Media Intelligence Platform"}
        keywords="downloads, resources, files, media intelligence, المستكشف, تحميلات"
        language={language}
      />
      <Header />

      {/* Page Header */}
      <section className="relative bg-gradient-to-br from-primary via-blue-600 to-purple-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full -translate-x-32 translate-y-32"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Download className="w-4 h-4 mr-2" />
              {language === "ar" ? "مركز التحميلات" : "Download Center"}
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight">
              {language === "ar" ? "التحميلات" : "Downloads"}
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed opacity-90 max-w-3xl">
              {language === "ar" 
                ? "اكتشف مجموعة شاملة من الموارد والملفات المتخصصة في مجال الذكاء الإعلامي ومراقبة الإعلام"
                : "Discover our comprehensive collection of specialized resources and files in media intelligence and monitoring"
              }
            </p>
          </div>
        </div>
      </section>

      {/* Downloads Content */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/50 to-blue-50/30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : downloads.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-12 animate-fade-in-up">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent mb-2">
                    {language === "ar" ? "جميع التحميلات" : "All Downloads"}
                  </h2>
                  <p className="text-slate-600">
                    {language === "ar" ? "اكتشف مجموعة شاملة من الموارد المتخصصة" : "Discover our comprehensive collection of specialized resources"}
                  </p>
                </div>
                <div className="bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-primary font-semibold">
                    {downloads.length} {language === "ar" ? "ملف" : "files"}
                  </span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {downloads.map((file: any, index) => (
                  <Card 
                    key={file.id} 
                    className="animate-fade-in-up hover:shadow-lg transition-shadow duration-300" 
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file.fileType)}
                          <div>
                            <CardTitle className="text-lg line-clamp-2">
                              {language === "ar" && file.titleAr ? file.titleAr : file.title}
                            </CardTitle>
                            <div className="flex items-center space-x-2 text-sm text-slate-500 mt-1">
                              <span>{file.fileType?.toUpperCase()}</span>
                              <span>•</span>
                              <span>{formatFileSize(file.fileSizeBytes)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-3">
                        {language === "ar" && file.descriptionAr ? file.descriptionAr : file.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                          <span className="bg-slate-100 px-2 py-1 rounded-full">
                            {language === "ar" && file.categoryAr ? file.categoryAr : file.category}
                          </span>
                        </div>
                        <Button 
                          onClick={() => window.open(`/api/downloads/${file.id}/file`, '_blank')}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {language === "ar" ? "تحميل" : "Download"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 animate-fade-in-up">
              <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-br from-slate-100 to-blue-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
                  <Download className="w-12 h-12 text-slate-400" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent mb-4">
                  {language === "ar" ? "لا توجد تحميلات متاحة" : "No Downloads Available"}
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  {language === "ar"
                    ? "لم يتم رفع أي ملفات للتحميل بعد. نحن نعمل باستمرار على إضافة موارد جديدة ومتخصصة."
                    : "No files have been uploaded for download yet. We're constantly working on adding new, specialized resources."
                  }
                </p>
                <div className="mt-8">
                  <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    <Download className="w-4 h-4 mr-2" />
                    {language === "ar" ? "المحتوى قادم قريباً" : "Content Coming Soon"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}