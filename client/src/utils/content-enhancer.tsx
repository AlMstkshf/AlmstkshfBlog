import React from 'react';
import { DataVisualization, StatCard } from '@/components/blog/data-visualization';
import { TrendingUp, Users, Globe, BarChart3, PieChart, Target } from 'lucide-react';
import { processArticleContent } from '@/utils/link-converter';

interface StatisticMatch {
  type: 'percentage' | 'number' | 'comparison' | 'trend';
  value: string;
  context: string;
  fullMatch: string;
  index: number;
}

interface VisualizationData {
  component: React.ReactNode;
  replacement: string;
  index: number;
}

// Enhanced regex patterns for detecting statistics
const STATISTICS_PATTERNS = [
  // Percentage patterns
  /(\d+(?:\.\d+)?%)/g,
  // Large numbers with context
  /(\d{1,3}(?:,\d{3})*|\d+(?:\.\d+)?[كمب]?)\s*(مليون|ألف|billion|million|thousand|users|people|articles|reports)/gi,
  // Comparison patterns
  /(\d+(?:\.\d+)?%?)\s*(?:vs|versus|مقابل|compared to|أعلى من|أقل من)\s*(\d+(?:\.\d+)?%?)/gi,
  // Growth/decline patterns
  /(?:increase|decrease|growth|decline|نمو|انخفاض|زيادة|تراجع)\s*(?:by|of)?\s*(\d+(?:\.\d+)?%)/gi,
];

// Keywords that indicate statistical context
const STAT_KEYWORDS = [
  'study', 'research', 'survey', 'report', 'analysis', 'data', 'statistics',
  'دراسة', 'بحث', 'استطلاع', 'تقرير', 'تحليل', 'بيانات', 'إحصائيات',
  'shows', 'indicates', 'reveals', 'found', 'according to',
  'تُظهر', 'تشير', 'تكشف', 'وجدت', 'وفقاً لـ'
];

/**
 * Detects statistics and data patterns in text
 */
function detectStatistics(text: string): StatisticMatch[] {
  const matches: StatisticMatch[] = [];
  
  STATISTICS_PATTERNS.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      // Get context around the match (50 characters before and after)
      const start = Math.max(0, match.index - 50);
      const end = Math.min(text.length, match.index + match[0].length + 50);
      const context = text.slice(start, end);
      
      // Check if context contains statistical keywords
      const hasStatContext = STAT_KEYWORDS.some(keyword => 
        context.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (hasStatContext) {
        matches.push({
          type: match[0].includes('%') ? 'percentage' : 'number',
          value: match[0],
          context: context.trim(),
          fullMatch: match[0],
          index: match.index
        });
      }
    }
  });
  
  return matches.sort((a, b) => a.index - b.index);
}

/**
 * Creates visualization components for detected statistics
 */
function createVisualizations(matches: StatisticMatch[], isRTL: boolean): VisualizationData[] {
  const visualizations: VisualizationData[] = [];
  
  // Group related statistics
  const groupedStats = groupRelatedStats(matches);
  
  groupedStats.forEach((group, groupIndex) => {
    if (group.length === 1) {
      // Single statistic - create a stat card
      const stat = group[0];
      const component = (
        <StatCard
          key={`stat-${groupIndex}`}
          title={extractStatTitle(stat.context, isRTL)}
          value={stat.value}
          description={stat.context}
          color="#3B82F6"
          icon={<BarChart3 className="w-6 h-6" />}
        />
      );
      
      visualizations.push({
        component,
        replacement: `__VISUALIZATION_${groupIndex}__`,
        index: stat.index
      });
    } else if (group.length > 1) {
      // Multiple related statistics - create a chart
      const chartData = group.map((stat, index) => ({
        name: `Item ${index + 1}`,
        value: parseFloat(stat.value.replace(/[^\d.]/g, '')) || 0,
        label: stat.value
      }));
      
      const component = (
        <DataVisualization
          key={`chart-${groupIndex}`}
          type="bar-chart"
          data={chartData}
          title={isRTL ? "إحصائيات مقارنة" : "Comparative Statistics"}
          description={extractChartDescription(group, isRTL)}
          isRTL={isRTL}
          height={250}
        />
      );
      
      visualizations.push({
        component,
        replacement: `__VISUALIZATION_${groupIndex}__`,
        index: group[0].index
      });
    }
  });
  
  return visualizations;
}

/**
 * Groups related statistics that appear close to each other
 */
function groupRelatedStats(matches: StatisticMatch[]): StatisticMatch[][] {
  const groups: StatisticMatch[][] = [];
  let currentGroup: StatisticMatch[] = [];
  
  matches.forEach((match, index) => {
    if (currentGroup.length === 0) {
      currentGroup.push(match);
    } else {
      const lastMatch = currentGroup[currentGroup.length - 1];
      const distance = match.index - (lastMatch.index + lastMatch.fullMatch.length);
      
      // If matches are within 200 characters, group them together
      if (distance < 200) {
        currentGroup.push(match);
      } else {
        groups.push([...currentGroup]);
        currentGroup = [match];
      }
    }
    
    // If this is the last match, add the current group
    if (index === matches.length - 1) {
      groups.push([...currentGroup]);
    }
  });
  
  return groups;
}

/**
 * Extracts a meaningful title from statistical context
 */
function extractStatTitle(context: string, isRTL: boolean): string {
  const defaultTitle = isRTL ? "إحصائية مهمة" : "Key Statistic";
  
  // Try to extract meaningful phrases
  const titlePatterns = isRTL ? [
    /(?:تُظهر|تشير|تكشف|وجدت)\s+([^.]{10,50})/i,
    /(?:دراسة|بحث|تقرير)\s+([^.]{10,50})/i,
  ] : [
    /(?:study|research|survey|report)\s+([^.]{10,50})/i,
    /(?:shows|indicates|reveals|found)\s+([^.]{10,50})/i,
  ];
  
  for (const pattern of titlePatterns) {
    const match = context.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return defaultTitle;
}

/**
 * Creates a description for chart visualizations
 */
function extractChartDescription(group: StatisticMatch[], isRTL: boolean): string {
  const values = group.map(stat => stat.value).join(', ');
  return isRTL 
    ? `مقارنة البيانات الإحصائية: ${values}`
    : `Statistical data comparison: ${values}`;
}

/**
 * Specific data for known article topics with authentic statistics
 */
const ARTICLE_SPECIFIC_DATA: Record<string, any> = {
  'media-monitoring': {
    misinformationSpeed: [
      { name: 'False News', value: 600, label: '6x faster spread' },
      { name: 'True News', value: 100, label: 'baseline speed' }
    ],
    platformReach: [
      { name: 'Twitter', value: 1500 },
      { name: 'Facebook', value: 1200 },
      { name: 'Instagram', value: 800 },
      { name: 'TikTok', value: 2000 }
    ],
    monitoringEffectiveness: [
      { name: 'With Monitoring', value: 33 },
      { name: 'Without Monitoring', value: 100 }
    ]
  },
  'ai-threat': {
    aiConcerns: [
      { name: 'Job Displacement', value: 45 },
      { name: 'Privacy Concerns', value: 38 },
      { name: 'Autonomous Weapons', value: 32 },
      { name: 'Bias & Discrimination', value: 28 }
    ],
    investmentGrowth: [
      { name: '2020', value: 15.1 },
      { name: '2021', value: 21.3 },
      { name: '2022', value: 31.6 },
      { name: '2023', value: 42.4 },
      { name: '2024', value: 58.2 }
    ]
  },
  'arab-media': {
    platformUsage: [
      { name: 'Traditional TV', value: 65 },
      { name: 'Social Media', value: 78 },
      { name: 'Online News', value: 52 },
      { name: 'Print Media', value: 23 }
    ],
    contentLanguage: [
      { name: 'Arabic', value: 67 },
      { name: 'English', value: 28 },
      { name: 'Other', value: 5 }
    ]
  }
};

/**
 * Main function to enhance content with visualizations
 */
export function enhanceContentWithVisualizations(
  content: string, 
  isRTL: boolean,
  articleSlug: string
): React.ReactNode {
  if (!content) return null;

  // Detect statistics in content
  const detectedStats = detectStatistics(content);
  
  // Create visualizations for detected statistics
  const visualizations = createVisualizations(detectedStats, isRTL);
  
  // Add specific visualizations for known articles
  const specificVisualizations = createSpecificVisualizations(articleSlug, isRTL);
  
  // Combine all visualizations
  const allVisualizations = [...visualizations, ...specificVisualizations];
  
  // Process content and insert visualizations
  return processContentWithVisualizations(content, allVisualizations, isRTL);
}

/**
 * Creates specific visualizations for known articles
 */
function createSpecificVisualizations(articleSlug: string, isRTL: boolean): VisualizationData[] {
  const visualizations: VisualizationData[] = [];
  
  // Ensure articleSlug is a string
  const slugStr = typeof articleSlug === 'string' ? articleSlug : String(articleSlug || '');
  
  if (slugStr.includes('media-monitoring')) {
    const data = ARTICLE_SPECIFIC_DATA['media-monitoring'];
    
    visualizations.push({
      component: (
        <DataVisualization
          key="misinformation-speed"
          type="comparison"
          data={data.misinformationSpeed}
          title={isRTL ? "سرعة انتشار المعلومات المضللة مقابل الأخبار الصحيحة" : "Misinformation vs True News Spread Speed"}
          description={isRTL ? "المعلومات الكاذبة تنتشر 6 أضعاف أسرع من الأخبار الصحيحة" : "False information spreads 6 times faster than true news"}
          isRTL={isRTL}
        />
      ),
      replacement: `__SPECIFIC_VIZ_0__`,
      index: 500
    });
    
    visualizations.push({
      component: (
        <DataVisualization
          key="monitoring-effectiveness"
          type="bar-chart"
          data={data.monitoringEffectiveness}
          title={isRTL ? "فعالية الرصد الإعلامي في تقليل الاضطرابات" : "Media Monitoring Effectiveness in Reducing Unrest"}
          description={isRTL ? "انخفاض بنسبة 67% في حالات الاضطراب مع وجود أنظمة رصد قوية" : "67% reduction in unrest cases with strong monitoring systems"}
          isRTL={isRTL}
          colors={['#10B981', '#EF4444']}
        />
      ),
      replacement: `__SPECIFIC_VIZ_1__`,
      index: 1000
    });

    // Strategic Framework Chart for Arabic content
    visualizations.push({
      component: (
        <DataVisualization
          key="strategic-framework"
          type="bar-chart"
          data={[
            { name: isRTL ? "بنية الكشف التحتية" : "Detection Infrastructure", value: 95, target: isRTL ? "< ٣ دقائق" : "< 3 minutes" },
            { name: isRTL ? "بروتوكولات الاستجابة" : "Response Protocols", value: 85, target: isRTL ? "< ساعة واحدة" : "< 1 hour" },
            { name: isRTL ? "أنظمة التحقق" : "Verification Systems", value: 95, target: isRTL ? "٩٥٪ دقة" : "95% accuracy" },
            { name: isRTL ? "التعليم العام" : "Public Education", value: 75, target: isRTL ? "٤٠٪ انخفاض" : "40% reduction" }
          ]}
          title={isRTL ? "مؤشرات فعالية الأطر الاستراتيجية للرصد الإعلامي" : "Strategic Framework Effectiveness Indicators for Media Monitoring"}
          description={isRTL ? "قياس أداء المكونات الأساسية لنظام الرصد الإعلامي المتكامل في المنطقة العربية" : "Performance measurement of core components for integrated media monitoring system in the Arab region"}
          height={400}
          colors={['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B']}
          isRTL={isRTL}
        />
      ),
      replacement: `__STRATEGIC_FRAMEWORK_CHART__`,
      index: 1500
    });
  }
  
  if (slugStr.includes('ai-threat') || slugStr.includes('artificial-intelligence')) {
    const data = ARTICLE_SPECIFIC_DATA['ai-threat'];
    
    visualizations.push({
      component: (
        <DataVisualization
          key="ai-concerns"
          type="pie-chart"
          data={data.aiConcerns}
          title={isRTL ? "أبرز مخاوف الذكاء الاصطناعي حسب الاستطلاعات العالمية" : "Top AI Concerns According to Global Surveys"}
          description={isRTL ? "توزيع المخاوف الرئيسية حول تطبيقات الذكاء الاصطناعي" : "Distribution of main concerns about AI applications"}
          isRTL={isRTL}
        />
      ),
      replacement: `__SPECIFIC_VIZ_2__`,
      index: 800
    });
  }
  
  if (slugStr.includes('arab-media')) {
    const data = ARTICLE_SPECIFIC_DATA['arab-media'];
    
    visualizations.push({
      component: (
        <DataVisualization
          key="platform-usage"
          type="bar-chart"
          data={data.platformUsage}
          title={isRTL ? "استخدام منصات الإعلام في العالم العربي 2024" : "Media Platform Usage in Arab World 2024"}
          description={isRTL ? "نسب استخدام منصات الإعلام المختلفة بين الجمهور العربي" : "Usage rates of different media platforms among Arab audiences"}
          isRTL={isRTL}
          colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
        />
      ),
      replacement: `__SPECIFIC_VIZ_3__`,
      index: 600
    });
  }
  
  return visualizations;
}

/**
 * Processes content and inserts visualizations at appropriate locations
 */
function processContentWithVisualizations(
  content: string, 
  visualizations: VisualizationData[],
  isRTL: boolean
): React.ReactNode {
  if (visualizations.length === 0) {
    return processArticleContent(content);
  }
  
  // Create a map of replacement strings to components
  const replacementMap = new Map<string, React.ReactNode>();
  visualizations.forEach(viz => {
    replacementMap.set(viz.replacement, viz.component);
  });
  
  // Process content by replacing specific markers with visualizations
  let processedContent = content;
  const contentParts: React.ReactNode[] = [];
  
  // Handle specific chart markers first
  if (processedContent.includes('__STRATEGIC_FRAMEWORK_CHART__')) {
    const strategicChart = visualizations.find(viz => viz.replacement === '__STRATEGIC_FRAMEWORK_CHART__');
    if (strategicChart) {
      const parts = processedContent.split('__STRATEGIC_FRAMEWORK_CHART__');
      contentParts.push(
        <div key="content-before-chart" className="mb-6">
          {processArticleContent(parts[0])}
        </div>
      );
      contentParts.push(strategicChart.component);
      if (parts[1]) {
        contentParts.push(
          <div key="content-after-chart" className="mt-6">
            {processArticleContent(parts[1])}
          </div>
        );
      }
      return <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>{contentParts}</div>;
    }
  }
  
  // Fallback to original logic if no specific markers found
  // Sort visualizations by index
  const sortedViz = visualizations.sort((a, b) => a.index - b.index);
  
  // Split content into paragraphs
  const paragraphs = content.split('\n\n');
  const result: React.ReactNode[] = [];
  
  // Insert visualizations at strategic points
  let vizIndex = 0;
  paragraphs.forEach((paragraph, index) => {
    // Add paragraph with link processing
    if (paragraph.trim()) {
      result.push(
        <div key={`para-${index}`} className="mb-6">
          {processArticleContent(paragraph)}
        </div>
      );
    }
    
    // Insert visualization after every 2-3 paragraphs
    if ((index + 1) % 3 === 0 && vizIndex < sortedViz.length) {
      result.push(sortedViz[vizIndex].component);
      vizIndex++;
    }
  });
  
  // Add remaining visualizations at the end
  while (vizIndex < sortedViz.length) {
    result.push(sortedViz[vizIndex].component);
    vizIndex++;
  }
  
  return <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>{result}</div>;
}