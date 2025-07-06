import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { calculateReadingTime, getReadingProgress, estimateReadingTimeFromScroll } from "@/utils/reading-time";
import { Clock, BookOpen, Eye } from "lucide-react";

interface ReadingProgressProps {
  content: string;
  className?: string;
  variant?: "floating" | "inline" | "compact";
}

export function ReadingProgress({ content, className = "", variant = "floating" }: ReadingProgressProps) {
  const { language } = useLanguage();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const readingTime = calculateReadingTime(content, language);
  const remainingTime = estimateReadingTimeFromScroll(readingTime.minutes, scrollProgress);

  useEffect(() => {
    const handleScroll = () => {
      const articleElement = document.querySelector('article');
      if (!articleElement) return;

      const rect = articleElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const documentHeight = articleElement.scrollHeight;
      
      // Calculate scroll progress within the article
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const articleTop = articleElement.offsetTop;
      const articleHeight = articleElement.offsetHeight;
      
      const articleScrollStart = articleTop - windowHeight * 0.2; // Start tracking when article is 20% visible
      const articleScrollEnd = articleTop + articleHeight - windowHeight * 0.8;
      
      if (scrollTop >= articleScrollStart && scrollTop <= articleScrollEnd) {
        const progress = getReadingProgress(
          scrollTop - articleScrollStart,
          articleScrollEnd - articleScrollStart
        );
        setScrollProgress(progress);
        setIsVisible(true);
      } else if (scrollTop < articleScrollStart) {
        setScrollProgress(0);
        setIsVisible(scrollTop > 100); // Show when user has scrolled a bit
      } else {
        setScrollProgress(100);
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (variant === "compact") {
    return (
      <div className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}>
        <Clock className="w-3 h-3" />
        <span>{readingTime.text}</span>
        {scrollProgress > 0 && (
          <>
            <span>•</span>
            <span>{scrollProgress}% {language === 'ar' ? 'مكتمل' : 'complete'}</span>
          </>
        )}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span className="font-medium">
                {language === 'ar' ? 'تقدم القراءة' : 'Reading Progress'}
              </span>
            </div>
            <Badge variant="outline">
              {scrollProgress}%
            </Badge>
          </div>
          
          <Progress value={scrollProgress} className="h-2" />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3" />
              <span>{readingTime.text}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-3 h-3" />
              <span>
                {remainingTime > 0 
                  ? (language === 'ar' 
                      ? `${remainingTime} دقيقة متبقية`
                      : `${remainingTime} min left`)
                  : (language === 'ar' ? 'انتهيت!' : 'Completed!')
                }
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Floating variant (default)
  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${className}`}
    >
      <div className="bg-background/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>{language === 'ar' ? 'تقدم القراءة' : 'Reading Progress'}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {scrollProgress}%
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{readingTime.text}</span>
              </div>
              {remainingTime > 0 && (
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span className="text-xs">
                    {language === 'ar' 
                      ? `${remainingTime} دقيقة متبقية`
                      : `${remainingTime} min left`
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <Progress value={scrollProgress} className="h-1 mt-2" />
        </div>
      </div>
    </div>
  );
}