import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/blog/header";
import { MetaTags } from "@/components/seo/meta-tags";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Search, FileText, Image, Calendar, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DownloadFile {
  id: number;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  fileName: string;
  originalFileName?: string;
  fileSize: string;
  fileType: "pdf" | "image" | "document";
  category: string;
  categoryAr?: string;
  downloadCount: number;
  uploadedAt: string;
  featured: boolean;
  tags: string[];
  previewUrl?: string;
  filePath?: string;
}

export default function Downloads() {
  const { language, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Fetch downloads data
  const { data: downloads, isLoading } = useQuery<DownloadFile[]>({
    queryKey: ["/api/downloads"],
    queryFn: async () => {
      const response = await fetch('/api/downloads');
      if (!response.ok) {
        throw new Error('Failed to fetch downloads');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3
  });

  const filteredDownloads = downloads?.filter(file => {
    const title = language === "ar" && file.titleAr ? file.titleAr : file.title;
    const description = language === "ar" && file.descriptionAr ? file.descriptionAr : file.description;
    const category = language === "ar" && file.categoryAr ? file.categoryAr : file.category;
    
    const matchesSearch = !searchQuery || 
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || category === selectedCategory;
    const matchesType = selectedType === "all" || file.fileType === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  }) || [];

  const featuredDownloads = filteredDownloads.filter(file => file.featured);
  const regularDownloads = filteredDownloads.filter(file => !file.featured);

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'image':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = async (file: DownloadFile) => {
    try {
      // Track download
      await fetch(`/api/downloads/${file.id}/download`, { method: 'POST' });
      
      // Download file using the correct path
      const downloadUrl = `/api/downloads/${file.id}/file`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open file in new tab
      window.open(`/api/downloads/${file.id}/file`, '_blank');
    }
  };

  const metaTitle = language === "ar" 
    ? "التحميلات - المستكشف للذكاء الإعلامي"
    : "Downloads - Al-Mustakshef Media Intelligence";
  
  const metaDescription = language === "ar"
    ? "تحميل التقارير والدراسات والموارد المجانية حول الذكاء الإعلامي ومراقبة وسائل الإعلام في الشرق الأوسط"
    : "Download free reports, studies, and resources on media intelligence and monitoring in the Middle East";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir={isRTL ? "rtl" : "ltr"}>
      <MetaTags
        title={metaTitle}
        description={metaDescription}
        keywords={`downloads, ${language === "ar" ? "تحميلات، تقارير، دراسات" : "reports, studies, resources"}, media intelligence, Middle East`}
        ogTitle={metaTitle}
        ogDescription={metaDescription}
        canonical={`${window.location.origin}/${language}/downloads`}
        language={language}
      />
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-blue-600 to-purple-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full -translate-x-32 translate-y-32"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Download className="w-4 h-4 mr-2" />
              {language === "ar" ? "مكتبة الموارد" : "Resource Library"}
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight">
              {language === "ar" ? "التحميلات والموارد" : "Downloads & Resources"}
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed opacity-90 max-w-3xl">
              {language === "ar"
                ? "تحميل التقارير والدراسات والموارد المجانية حول الذكاء الإعلامي ومراقبة وسائل الإعلام في الشرق الأوسط"
                : "Download free reports, studies, and resources on media intelligence and monitoring in the Middle East"
              }
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-4 animate-fade-in-up">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={language === "ar" ? "البحث في الملفات..." : "Search files..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={language === "ar" ? "جميع الفئات" : "All Categories"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "ar" ? "جميع الفئات" : "All Categories"}</SelectItem>
                <SelectItem value="reports">{language === "ar" ? "التقارير" : "Reports"}</SelectItem>
                <SelectItem value="studies">{language === "ar" ? "الدراسات" : "Studies"}</SelectItem>
                <SelectItem value="guides">{language === "ar" ? "الأدلة" : "Guides"}</SelectItem>
                <SelectItem value="infographics">{language === "ar" ? "الإنفوجرافيك" : "Infographics"}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder={language === "ar" ? "جميع الأنواع" : "All Types"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "ar" ? "جميع الأنواع" : "All Types"}</SelectItem>
                <SelectItem value="pdf">{language === "ar" ? "ملفات PDF" : "PDF Files"}</SelectItem>
                <SelectItem value="image">{language === "ar" ? "الصور" : "Images"}</SelectItem>
                <SelectItem value="document">{language === "ar" ? "المستندات" : "Documents"}</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-sm text-gray-500 flex items-center">
              {isLoading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <span>
                  {filteredDownloads.length} {language === "ar" ? "ملف" : "files"}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Downloads */}
      {featuredDownloads.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in-up">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 backdrop-blur-sm rounded-full text-primary text-sm font-medium mb-4">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {language === "ar" ? "الموارد المميزة" : "Featured Resources"}
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent mb-4">
                {language === "ar" ? "التحميلات المميزة" : "Featured Downloads"}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDownloads.map((file, index) => (
                <DownloadCard key={file.id} file={file} featured onDownload={handleDownload} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Downloads */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <Skeleton className="h-64 rounded-xl" />
                </div>
              ))}
            </div>
          ) : regularDownloads.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularDownloads.map((file, index) => (
                <DownloadCard key={file.id} file={file} onDownload={handleDownload} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 text-lg">
                {language === "ar" ? "لا توجد ملفات متاحة للتحميل حالياً" : "No files available for download at the moment"}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

interface DownloadCardProps {
  file: DownloadFile;
  featured?: boolean;
  onDownload: (file: DownloadFile) => void;
  index: number;
}

function DownloadCard({ file, featured = false, onDownload, index }: DownloadCardProps) {
  const { language, isRTL } = useLanguage();
  
  const title = language === "ar" && file.titleAr ? file.titleAr : file.title;
  const description = language === "ar" && file.descriptionAr ? file.descriptionAr : file.description;
  const category = language === "ar" && file.categoryAr ? file.categoryAr : file.category;
  
  const timeAgo = formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true });

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'image':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="animate-fade-in-up" 
      style={{ animationDelay: `${index * 0.15}s` }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Card className={`group overflow-hidden hover:shadow-xl transition-all duration-400 hover:-translate-y-1 cursor-pointer border border-slate-200/50 bg-white/90 backdrop-blur-sm hover:border-primary/30 ${featured ? 'ring-2 ring-primary/20' : ''}`}>
        {file.previewUrl && (
          <div className="aspect-[16/10] overflow-hidden relative">
            <img
              src={file.previewUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
        
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {getFileIcon(file.fileType)}
              <Badge className={`text-xs ${getFileTypeColor(file.fileType)}`}>
                {file.fileType.toUpperCase()}
              </Badge>
            </div>
            {featured && (
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs shadow-md backdrop-blur-sm animate-pulse">
                ⭐ {language === "ar" ? "مميز" : "Featured"}
              </Badge>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-snug">
            {title}
          </h3>
          
          <p className="text-slate-600 mb-4 line-clamp-2 leading-relaxed text-sm">
            {description}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
            <span>{category}</span>
            <span>{file.fileSize}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {timeAgo}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {file.downloadCount} {language === "ar" ? "تحميل" : "downloads"}
            </span>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => onDownload(file)} 
              className="flex-1 group/btn"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2 group-hover/btn:animate-bounce" />
              {language === "ar" ? "تحميل" : "Download"}
            </Button>
            {file.previewUrl && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(file.previewUrl, '_blank')}
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}