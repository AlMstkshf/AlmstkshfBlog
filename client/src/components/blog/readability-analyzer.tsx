import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/use-language";
import { BarChart3, BookOpen, Clock, Eye } from "lucide-react";

interface ReadabilityAnalyzerProps {
  content: string;
  language: "en" | "ar";
}

interface ReadabilityMetrics {
  score: number;
  grade: string;
  complexity: "Easy" | "Medium" | "Hard";
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  avgWordsPerSentence: number;
  avgSentencesPerParagraph: number;
  readingTime: number;
  recommendations: string[];
}

export function ReadabilityAnalyzer({ content, language: contentLang }: ReadabilityAnalyzerProps) {
  const { language, isRTL } = useLanguage();
  const [metrics, setMetrics] = useState<ReadabilityMetrics | null>(null);

  useEffect(() => {
    if (!content) return;

    const analyzeReadability = () => {
      // Clean content from HTML tags and markdown
      const cleanContent = content
        .replace(/<[^>]*>/g, '')
        .replace(/[#*`]/g, '')
        .replace(/\n+/g, ' ')
        .trim();

      if (!cleanContent) return;

      // Basic text metrics
      const words = cleanContent.split(/\s+/).filter(word => word.length > 0);
      const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

      const wordCount = words.length;
      const sentenceCount = sentences.length;
      const paragraphCount = paragraphs.length;
      const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
      const avgSentencesPerParagraph = sentenceCount / Math.max(paragraphCount, 1);

      // Reading time estimation (200 words per minute for English, 180 for Arabic)
      const wordsPerMinute = contentLang === "ar" ? 180 : 200;
      const readingTime = Math.ceil(wordCount / wordsPerMinute);

      // Readability scoring algorithm
      let score = 100;
      const recommendations: string[] = [];

      // Sentence length penalty
      if (avgWordsPerSentence > 20) {
        score -= (avgWordsPerSentence - 20) * 2;
        recommendations.push(
          contentLang === "ar" 
            ? "قم بتقسيم الجمل الطويلة لتحسين القراءة"
            : "Break down long sentences for better readability"
        );
      }

      // Paragraph length assessment
      if (avgSentencesPerParagraph > 6) {
        score -= (avgSentencesPerParagraph - 6) * 3;
        recommendations.push(
          contentLang === "ar"
            ? "قسم الفقرات الطويلة إلى فقرات أصغر"
            : "Break long paragraphs into smaller sections"
        );
      }

      // Word complexity analysis (simplified)
      const complexWords = words.filter(word => {
        if (contentLang === "ar") {
          return word.length > 8; // Arabic complex word heuristic
        } else {
          return word.length > 6 && !word.match(/ing$|ed$|ly$/); // English complex word heuristic
        }
      });

      const complexWordRatio = complexWords.length / wordCount;
      if (complexWordRatio > 0.15) {
        score -= complexWordRatio * 30;
        recommendations.push(
          contentLang === "ar"
            ? "استخدم كلمات أبسط حيث أمكن ذلك"
            : "Use simpler words where possible"
        );
      }

      // Document structure assessment
      const headerCount = (content.match(/^#{1,6}\s/gm) || []).length;
      const listCount = (content.match(/^[-*+]\s/gm) || []).length;
      
      if (headerCount < Math.floor(paragraphCount / 5)) {
        recommendations.push(
          contentLang === "ar"
            ? "أضف عناوين فرعية لتحسين البنية"
            : "Add more subheadings to improve structure"
        );
      }

      if (wordCount > 500 && listCount === 0) {
        recommendations.push(
          contentLang === "ar"
            ? "استخدم القوائم لتنظيم المعلومات"
            : "Use bullet points to organize information"
        );
      }

      // Grade and complexity determination
      score = Math.max(0, Math.min(100, score));
      
      let grade: string;
      let complexity: "Easy" | "Medium" | "Hard";

      if (score >= 80) {
        grade = contentLang === "ar" ? "ممتاز" : "Excellent";
        complexity = "Easy";
      } else if (score >= 60) {
        grade = contentLang === "ar" ? "جيد" : "Good";
        complexity = "Medium";
      } else if (score >= 40) {
        grade = contentLang === "ar" ? "متوسط" : "Average";
        complexity = "Medium";
      } else {
        grade = contentLang === "ar" ? "يحتاج تحسين" : "Needs Improvement";
        complexity = "Hard";
      }

      setMetrics({
        score: Math.round(score),
        grade,
        complexity,
        wordCount,
        sentenceCount,
        paragraphCount,
        avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        avgSentencesPerParagraph: Math.round(avgSentencesPerParagraph * 10) / 10,
        readingTime,
        recommendations
      });
    };

    analyzeReadability();
  }, [content, contentLang]);

  if (!metrics) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          {language === "ar" ? "تحليل قابلية القراءة" : "Readability Analysis"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${getScoreColor(metrics.score)} mb-2`}>
            {metrics.score}/100
          </div>
          <Badge className={getComplexityColor(metrics.complexity)}>
            {metrics.grade}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>{language === "ar" ? "سهولة القراءة" : "Readability Score"}</span>
            <span>{metrics.score}%</span>
          </div>
          <Progress value={metrics.score} className="h-2" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <BookOpen className="w-5 h-5 mx-auto mb-2 text-slate-600" />
            <div className="text-lg font-semibold text-secondary">{metrics.wordCount}</div>
            <div className="text-xs text-slate-600">
              {language === "ar" ? "كلمات" : "Words"}
            </div>
          </div>

          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <Eye className="w-5 h-5 mx-auto mb-2 text-slate-600" />
            <div className="text-lg font-semibold text-secondary">{metrics.sentenceCount}</div>
            <div className="text-xs text-slate-600">
              {language === "ar" ? "جمل" : "Sentences"}
            </div>
          </div>

          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <Clock className="w-5 h-5 mx-auto mb-2 text-slate-600" />
            <div className="text-lg font-semibold text-secondary">{metrics.readingTime}</div>
            <div className="text-xs text-slate-600">
              {language === "ar" ? "دقيقة" : "min read"}
            </div>
          </div>

          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <BarChart3 className="w-5 h-5 mx-auto mb-2 text-slate-600" />
            <div className="text-lg font-semibold text-secondary">{metrics.avgWordsPerSentence}</div>
            <div className="text-xs text-slate-600">
              {language === "ar" ? "كلمات/جملة" : "Words/Sentence"}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {metrics.recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-secondary mb-3">
              {language === "ar" ? "توصيات للتحسين" : "Improvement Recommendations"}
            </h4>
            <ul className="space-y-2">
              {metrics.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Complexity Indicator */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              {language === "ar" ? "مستوى التعقيد" : "Complexity Level"}
            </span>
            <Badge className={getComplexityColor(metrics.complexity)}>
              {language === "ar" 
                ? metrics.complexity === "Easy" ? "سهل" 
                  : metrics.complexity === "Medium" ? "متوسط" : "صعب"
                : metrics.complexity
              }
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}