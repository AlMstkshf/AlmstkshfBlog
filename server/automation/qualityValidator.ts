interface ContentQuality {
  arabicRatio: number;
  englishWordCount: number;
  arabicWordCount: number;
  qualityScore: number;
  issues: string[];
  passed: boolean;
}

export class ContentQualityValidator {
  private readonly MIN_RATIO = 50;
  private readonly MAX_RATIO = 150;
  private readonly MIN_WORDS = 200;

  validateContent(titleEn: string, contentEn: string, titleAr?: string, contentAr?: string): ContentQuality {
    const issues: string[] = [];
    
    const englishWordCount = this.countWords(contentEn);
    const arabicWordCount = this.countWords(contentAr || '');
    const arabicRatio = englishWordCount > 0 ? (arabicWordCount / englishWordCount) * 100 : 0;
    
    // Check minimum content length
    if (englishWordCount < this.MIN_WORDS) {
      issues.push(`English content too short: ${englishWordCount} words (minimum ${this.MIN_WORDS})`);
    }
    
    // Check Arabic completion ratio
    if (arabicRatio < this.MIN_RATIO) {
      issues.push(`Arabic content incomplete: ${arabicRatio.toFixed(1)}% (minimum ${this.MIN_RATIO}%)`);
    }
    
    if (arabicRatio > this.MAX_RATIO) {
      issues.push(`Arabic content excessive: ${arabicRatio.toFixed(1)}% (maximum ${this.MAX_RATIO}%)`);
    }
    
    // Check title presence
    if (!titleAr || titleAr.trim().length === 0) {
      issues.push('Missing Arabic title');
    }
    
    // Check for repeated phrases (duplication detection)
    if (contentAr && this.hasExcessiveRepetition(contentAr)) {
      issues.push('Content contains excessive repetition');
    }
    
    const qualityScore = this.calculateQualityScore(englishWordCount, arabicWordCount, arabicRatio, issues.length);
    
    return {
      arabicRatio,
      englishWordCount,
      arabicWordCount,
      qualityScore,
      issues,
      passed: issues.length === 0 && qualityScore >= 70
    };
  }

  private countWords(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private hasExcessiveRepetition(text: string): boolean {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length < 3) return false;
    
    const uniqueSentences = new Set(sentences.map(s => s.trim()));
    const repetitionRatio = (sentences.length - uniqueSentences.size) / sentences.length;
    
    return repetitionRatio > 0.3; // More than 30% repetition
  }

  private calculateQualityScore(englishWords: number, arabicWords: number, ratio: number, issueCount: number): number {
    let score = 100;
    
    // Deduct points for issues
    score -= issueCount * 15;
    
    // Bonus for good ratio
    if (ratio >= this.MIN_RATIO && ratio <= this.MAX_RATIO) {
      score += 10;
    }
    
    // Bonus for substantial content
    if (englishWords >= 500 && arabicWords >= 250) {
      score += 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }
}

export const qualityValidator = new ContentQualityValidator();