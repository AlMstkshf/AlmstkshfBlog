import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { MousePointer, Eye, Clock, TrendingUp } from "lucide-react";

interface HeatmapData {
  x: number;
  y: number;
  intensity: number;
  action: 'click' | 'hover' | 'scroll' | 'select';
  timestamp: number;
}

interface EngagementMetrics {
  totalClicks: number;
  totalScrollDepth: number;
  avgTimeOnPage: number;
  hotspots: Array<{ element: string; engagement: number }>;
}

export function EngagementHeatmap() {
  const { language } = useLanguage();
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [metrics, setMetrics] = useState<EngagementMetrics>({
    totalClicks: 0,
    totalScrollDepth: 0,
    avgTimeOnPage: 0,
    hotspots: []
  });
  const [isRecording, setIsRecording] = useState(true);
  const startTime = useRef(Date.now());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isRecording) return;

    const recordInteraction = (x: number, y: number, action: HeatmapData['action']) => {
      const newData: HeatmapData = {
        x: (x / window.innerWidth) * 100,
        y: (y / window.innerHeight) * 100,
        intensity: 1,
        action,
        timestamp: Date.now()
      };

      setHeatmapData(prev => [...prev.slice(-99), newData]); // Keep last 100 interactions
    };

    // Track clicks
    const handleClick = (e: MouseEvent) => {
      recordInteraction(e.clientX, e.clientY, 'click');
      setMetrics(prev => ({ ...prev, totalClicks: prev.totalClicks + 1 }));
    };

    // Track mouse movement for hover hotspots
    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() < 0.1) { // Sample 10% of mouse movements
        recordInteraction(e.clientX, e.clientY, 'hover');
      }
    };

    // Track scroll depth
    const handleScroll = () => {
      const scrollDepth = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      setMetrics(prev => ({ 
        ...prev, 
        totalScrollDepth: Math.max(prev.totalScrollDepth, scrollDepth)
      }));
    };

    // Track text selection
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 5) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        recordInteraction(rect.left + rect.width / 2, rect.top + rect.height / 2, 'select');
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('mouseup', handleSelection);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseup', handleSelection);
    };
  }, [isRecording]);

  useEffect(() => {
    // Update time on page every second
    const interval = setInterval(() => {
      const timeOnPage = (Date.now() - startTime.current) / 1000;
      setMetrics(prev => ({ ...prev, avgTimeOnPage: timeOnPage }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Generate hotspot data from interactions
    const generateHotspots = () => {
      const elementCounts: Record<string, number> = {};
      
      heatmapData.forEach(point => {
        const element = document.elementFromPoint(
          (point.x / 100) * window.innerWidth,
          (point.y / 100) * window.innerHeight
        );
        
        if (element) {
          const identifier = element.tagName.toLowerCase() + 
            (element.className ? '.' + element.className.split(' ')[0] : '') +
            (element.id ? '#' + element.id : '');
          
          elementCounts[identifier] = (elementCounts[identifier] || 0) + 1;
        }
      });

      const hotspots = Object.entries(elementCounts)
        .map(([element, count]) => ({ element, engagement: count }))
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 5);

      setMetrics(prev => ({ ...prev, hotspots }));
    };

    if (heatmapData.length > 0) {
      generateHotspots();
    }
  }, [heatmapData]);

  const renderHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 200;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw heatmap points
    heatmapData.forEach(point => {
      const x = (point.x / 100) * canvas.width;
      const y = (point.y / 100) * canvas.height;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
      
      switch (point.action) {
        case 'click':
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
          break;
        case 'hover':
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          break;
        case 'scroll':
          gradient.addColorStop(0, 'rgba(34, 197, 94, 0.6)');
          gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
          break;
        case 'select':
          gradient.addColorStop(0, 'rgba(168, 85, 247, 0.7)');
          gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
          break;
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(x - 15, y - 15, 30, 30);
    });
  };

  useEffect(() => {
    renderHeatmap();
  }, [heatmapData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {language === "ar" ? "تحليل تفاعل المستخدمين" : "User Engagement Analytics"}
          </div>
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              isRecording 
                ? "bg-red-100 text-red-700" 
                : "bg-green-100 text-green-700"
            }`}
          >
            {isRecording 
              ? (language === "ar" ? "جاري التسجيل" : "Recording") 
              : (language === "ar" ? "متوقف" : "Paused")
            }
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <MousePointer className="w-5 h-5 mx-auto mb-2 text-red-600" />
            <div className="text-lg font-semibold text-red-700">{metrics.totalClicks}</div>
            <div className="text-xs text-red-600">
              {language === "ar" ? "نقرات" : "Clicks"}
            </div>
          </div>

          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Eye className="w-5 h-5 mx-auto mb-2 text-blue-600" />
            <div className="text-lg font-semibold text-blue-700">
              {Math.round(metrics.totalScrollDepth)}%
            </div>
            <div className="text-xs text-blue-600">
              {language === "ar" ? "عمق التمرير" : "Scroll Depth"}
            </div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Clock className="w-5 h-5 mx-auto mb-2 text-green-600" />
            <div className="text-lg font-semibold text-green-700">
              {formatTime(metrics.avgTimeOnPage)}
            </div>
            <div className="text-xs text-green-600">
              {language === "ar" ? "وقت الصفحة" : "Time on Page"}
            </div>
          </div>

          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-purple-600" />
            <div className="text-lg font-semibold text-purple-700">{heatmapData.length}</div>
            <div className="text-xs text-purple-600">
              {language === "ar" ? "تفاعلات" : "Interactions"}
            </div>
          </div>
        </div>

        {/* Heatmap Visualization */}
        <div>
          <h4 className="font-semibold text-secondary mb-3">
            {language === "ar" ? "خريطة التفاعل الحراري" : "Interaction Heatmap"}
          </h4>
          <div className="bg-slate-100 rounded-lg p-4 flex justify-center">
            <canvas
              ref={canvasRef}
              className="border border-slate-300 rounded"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          <div className="flex justify-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>{language === "ar" ? "نقرات" : "Clicks"}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span>{language === "ar" ? "تمرير" : "Hover"}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>{language === "ar" ? "تمرير" : "Scroll"}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span>{language === "ar" ? "تحديد" : "Select"}</span>
            </div>
          </div>
        </div>

        {/* Hotspots */}
        {metrics.hotspots.length > 0 && (
          <div>
            <h4 className="font-semibold text-secondary mb-3">
              {language === "ar" ? "النقاط الساخنة" : "Engagement Hotspots"}
            </h4>
            <div className="space-y-2">
              {metrics.hotspots.map((hotspot, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm font-mono text-slate-600">
                    {hotspot.element}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {hotspot.engagement} {language === "ar" ? "تفاعل" : "interactions"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}