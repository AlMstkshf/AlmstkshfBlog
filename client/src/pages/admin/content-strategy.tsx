import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentStrategyOptimizer } from "@/components/seo/content-strategy-optimizer";
import { CornerstoneContentManager } from "@/components/admin/cornerstone-content-manager";
import { StructuredDataManager } from "@/components/seo/structured-data-manager";
import { GovernmentAlignmentTracker } from "@/components/seo/government-alignment-tracker";
import { LeadMagnetGenerator } from "@/components/marketing/lead-magnet-generator";
import { PartnershipManager } from "@/components/marketing/partnership-manager";
import { ContentProductionScheduler } from "@/components/admin/content-production-scheduler";
import { useLanguage } from "@/hooks/use-language";
import { ProtectedRoute } from "@/components/auth/protected-route";

function ContentStrategyPageContent() {
  const { language, isRTL } = useLanguage();

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === "ar" ? "استراتيجية المحتوى المتقدمة" : "Advanced Content Strategy"}
          </h1>
          <p className="text-gray-600">
            {language === "ar" 
              ? "تحسين المحتوى لمقاومة عصر الذكاء الاصطناعي والحفاظ على الرؤية في محركات البحث"
              : "Optimize content for AI-era resistance and maintain search engine visibility"
            }
          </p>
        </div>

        <Tabs defaultValue="strategy" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="strategy">
              {language === "ar" ? "محسن الاستراتيجية" : "Strategy Optimizer"}
            </TabsTrigger>
            <TabsTrigger value="cornerstone">
              {language === "ar" ? "المحتوى الأساسي" : "Cornerstone Content"}
            </TabsTrigger>
            <TabsTrigger value="structured-data">
              {language === "ar" ? "البيانات المنظمة" : "Structured Data"}
            </TabsTrigger>
            <TabsTrigger value="government-alignment">
              {language === "ar" ? "الامتثال الحكومي" : "Gov Alignment"}
            </TabsTrigger>
            <TabsTrigger value="distribution">
              {language === "ar" ? "التوزيع الذكي" : "Smart Distribution"}
            </TabsTrigger>
            <TabsTrigger value="partnerships">
              {language === "ar" ? "الشراكات" : "Partnerships"}
            </TabsTrigger>
            <TabsTrigger value="production">
              {language === "ar" ? "جدولة الإنتاج" : "Production"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="strategy" className="mt-6">
            <ContentStrategyOptimizer />
          </TabsContent>

          <TabsContent value="cornerstone" className="mt-6">
            <CornerstoneContentManager />
          </TabsContent>

          <TabsContent value="structured-data" className="mt-6">
            <StructuredDataManager />
          </TabsContent>

          <TabsContent value="government-alignment" className="mt-6">
            <GovernmentAlignmentTracker />
          </TabsContent>

          <TabsContent value="distribution" className="mt-6">
            <LeadMagnetGenerator />
          </TabsContent>

          <TabsContent value="partnerships" className="mt-6">
            <PartnershipManager />
          </TabsContent>

          <TabsContent value="production" className="mt-6">
            <ContentProductionScheduler />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ContentStrategyPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ContentStrategyPageContent />
    </ProtectedRoute>
  );
}