export interface ReadingTimeResult {
  minutes: number;
  words: number;
  text: string;
}

export function calculateReadingTime(content: string, language: 'en' | 'ar' = 'en'): ReadingTimeResult {
  if (!content || content.trim().length === 0) {
    return {
      minutes: 0,
      words: 0,
      text: language === 'ar' ? '0 دقيقة قراءة' : '0 min read'
    };
  }

  // Clean the content - remove markdown syntax and extra whitespace
  const cleanContent = content
    .replace(/#{1,6}\s+/g, '') // Remove markdown headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove markdown links
    .replace(/`(.*?)`/g, '$1') // Remove code markdown
    .replace(/>\s/g, '') // Remove blockquotes
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Different word counting for Arabic vs English
  let words: number;
  
  if (language === 'ar') {
    // Arabic text processing
    // Count Arabic words (sequences of Arabic characters)
    const arabicWords = cleanContent.match(/[\u0600-\u06FF]+/g) || [];
    const latinWords = cleanContent.match(/[a-zA-Z]+/g) || [];
    words = arabicWords.length + latinWords.length;
  } else {
    // English text processing
    // Split by whitespace and filter out empty strings
    words = cleanContent.split(/\s+/).filter(word => word.length > 0).length;
  }

  // Reading speed varies by language
  // English: ~200-250 words per minute
  // Arabic: ~180-220 words per minute (typically slower due to script complexity)
  const wordsPerMinute = language === 'ar' ? 200 : 230;
  
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));

  const text = language === 'ar' 
    ? `${minutes} دقيقة قراءة`
    : `${minutes} min read`;

  return {
    minutes,
    words,
    text
  };
}

export function formatReadingTime(minutes: number, language: 'en' | 'ar' = 'en'): string {
  if (minutes <= 0) {
    return language === 'ar' ? '< 1 دقيقة' : '< 1 min';
  }
  
  if (language === 'ar') {
    if (minutes === 1) return 'دقيقة واحدة';
    if (minutes === 2) return 'دقيقتان';
    if (minutes <= 10) return `${minutes} دقائق`;
    return `${minutes} دقيقة`;
  } else {
    return minutes === 1 ? '1 min' : `${minutes} mins`;
  }
}

export function getReadingProgress(scrollPosition: number, contentHeight: number): number {
  if (contentHeight <= 0) return 0;
  const progress = Math.min(100, Math.max(0, (scrollPosition / contentHeight) * 100));
  return Math.round(progress);
}

export function estimateReadingTimeFromScroll(
  totalReadingTime: number, 
  scrollProgress: number
): number {
  if (scrollProgress <= 0) return totalReadingTime;
  if (scrollProgress >= 100) return 0;
  
  const remainingProgress = 100 - scrollProgress;
  const remainingTime = Math.ceil((totalReadingTime * remainingProgress) / 100);
  
  return Math.max(0, remainingTime);
}