import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { useLanguage } from "@/hooks/use-language";
import { Download, Search, FileText, Image } from "lucide-react";

export default function Downloads() {
  const { language, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch downloads data
  const { data: downloads = [], isLoading } = useQuery({
    queryKey: ['/api/downloads'],
    queryFn: async () => {
      const response = await fetch('/api/downloads');
      if (!response.ok) return [];
      return response.json();
    },
    staleTime: 5 * 60 * 1000
  });

  const filteredDownloads = downloads.filter((file: any) => {
    const title = language === "ar" && file.titleAr ? file.titleAr : file.title;
    const description = language === "ar" && file.descriptionAr ? file.descriptionAr : file.description;
    const category = language === "ar" && file.categoryAr ? file.categoryAr : file.category;
    
    const matchesSearch = !searchQuery || 
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || file.fileType === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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

  const handleDownload = async (file: any) => {
    try {
      // Track download
      await fetch(`/api/downloads/${file.id}/download`, { method: 'POST' });
      
      // Download file
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

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {language === "ar" ? "التحميلات" : "Downloads"}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {language === "ar"
                ? "تحميل التقارير والدراسات والموارد المجانية حول الذكاء الإعلامي"
                : "Download free reports, studies, and resources on media intelligence"
              }
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={language === "ar" ? "البحث في التحميلات..." : "Search downloads..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">
                {language === "ar" ? "جميع الأنواع" : "All Types"}
              </option>
              <option value="pdf">PDF</option>
              <option value="image">
                {language === "ar" ? "صور" : "Images"}
              </option>
              <option value="document">
                {language === "ar" ? "مستندات" : "Documents"}
              </option>
            </select>
          </div>
        </div>
      </section>

      {/* Downloads Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                {language === "ar" ? "جاري التحميل..." : "Loading..."}
              </p>
            </div>
          ) : filteredDownloads.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDownloads.map((file: any) => (
                <div key={file.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {getFileIcon(file.fileType)}
                      <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {file.fileType?.toUpperCase()}
                      </span>
                    </div>
                    {file.featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                        {language === "ar" ? "مميز" : "Featured"}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">
                    {language === "ar" && file.titleAr ? file.titleAr : file.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {language === "ar" && file.descriptionAr ? file.descriptionAr : file.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>
                      {language === "ar" ? "الحجم:" : "Size:"} {file.fileSize}
                    </span>
                    <span>
                      {language === "ar" ? "التحميلات:" : "Downloads:"} {file.downloadCount || 0}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleDownload(file)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {language === "ar" ? "تحميل" : "Download"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg">
                {language === "ar" ? "لا توجد تحميلات متاحة" : "No downloads available"}
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}