import { useState, useEffect } from "react";
import { Header } from "@/components/blog/header";
import { Footer } from "@/components/blog/footer";
import { useLanguage } from "@/hooks/use-language";

export default function Downloads() {
  const { language, isRTL } = useLanguage();
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const response = await fetch('/api/downloads');
        if (response.ok) {
          const data = await response.json();
          setDownloads(data);
        }
      } catch (error) {
        console.error('Failed to fetch downloads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, []);

  const handleDownload = async (file: any) => {
    try {
      await fetch(`/api/downloads/${file.id}/download`, { method: 'POST' });
      const link = document.createElement('a');
      link.href = `/api/downloads/${file.id}/file`;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      window.open(`/api/downloads/${file.id}/file`, '_blank');
    }
  };

  const filteredDownloads = downloads.filter(file => {
    if (!searchQuery) return true;
    const title = language === "ar" && file.titleAr ? file.titleAr : file.title;
    const description = language === "ar" && file.descriptionAr ? file.descriptionAr : file.description;
    return title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            {language === "ar" ? "التحميلات" : "Downloads"}
          </h1>
          <p className="text-xl opacity-90">
            {language === "ar"
              ? "تحميل التقارير والدراسات والموارد المجانية"
              : "Download free reports, studies, and resources"
            }
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <input
              type="text"
              placeholder={language === "ar" ? "البحث..." : "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-3 border rounded-lg"
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">
                {language === "ar" ? "جاري التحميل..." : "Loading..."}
              </p>
            </div>
          ) : filteredDownloads.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDownloads.map((file) => (
                <div key={file.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="mb-4">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {file.fileType?.toUpperCase() || "FILE"}
                    </span>
                    {file.featured && (
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                        {language === "ar" ? "مميز" : "Featured"}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">
                    {language === "ar" && file.titleAr ? file.titleAr : file.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {language === "ar" && file.descriptionAr ? 
                      file.descriptionAr?.substring(0, 150) + "..." : 
                      file.description?.substring(0, 150) + "..."
                    }
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{language === "ar" ? "الحجم:" : "Size:"} {file.fileSize}</span>
                    <span>{language === "ar" ? "التحميلات:" : "Downloads:"} {file.downloadCount || 0}</span>
                  </div>
                  
                  <button
                    onClick={() => handleDownload(file)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                  >
                    {language === "ar" ? "تحميل" : "Download"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">
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