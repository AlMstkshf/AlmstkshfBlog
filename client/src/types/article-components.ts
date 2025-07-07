import { type ArticleWithCategory } from "@shared/schema";

// Base interface for common article component props
export interface BaseArticleProps {
  article: ArticleWithCategory;
  language: string;
  isRTL: boolean;
}

// Article Header component props
export interface ArticleHeaderProps extends BaseArticleProps {
  title: string;
  categoryName: string;
  readingTime: number;
  publishedDate: Date;
  onShare: () => void;
}

// Article Content component props
export interface ArticleContentProps {
  content: string | null;
  isRTL: boolean;
  language: string;
  articleSlug: string;
}

// Article Footer component props
export interface ArticleFooterProps extends BaseArticleProps {}

// Article SEO component props
export interface ArticleSEOProps extends BaseArticleProps {
  title: string;
  excerpt: string;
  categoryName: string;
  content: string;
  readingTime: number;
  canonicalUrl: string;
  absoluteImageUrl: string;
  publishedDate: Date;
  hasCharts: boolean;
  chartTitles: string[];
}

// Article Enhancements component props
export interface ArticleEnhancementsProps {
  article: ArticleWithCategory;
  title: string;
  excerpt: string;
  content: string;
  canonicalUrl: string;
  absoluteImageUrl: string;
  readingTime: number;
}

// Article Breadcrumb component props
export interface ArticleBreadcrumbProps extends BaseArticleProps {
  title: string;
  categoryName: string;
}

// Chart data interface
export interface ChartData {
  hasCharts: boolean;
  chartTitles: string[];
  datasetName?: string;
}

// Article metadata interface
export interface ArticleMetadata {
  publishedTime: string;
  modifiedTime?: string;
  author: string;
  section: string;
  tags: string[];
  readingTime: number;
  wordCount: number;
  category: string;
}

// Structured data props
export interface StructuredDataArticle {
  headline?: string;
  description?: string;
  image: string;
  author?: string;
  datePublished: string;
  dateModified?: string;
  category?: string;
  keywords: string[];
  wordCount: number;
  readingTime: number;
  language: string;
  url: string;
}

// Performance optimization interfaces
export interface MemoizedComponentProps {
  shouldUpdate?: (prevProps: any, nextProps: any) => boolean;
}

// Component state interfaces
export interface ArticleState {
  isAccessibilityPanelOpen: boolean;
  isLoading: boolean;
  error?: string;
}

// Hook return types
export interface UseArticleData {
  article: ArticleWithCategory | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseArticleComputed {
  title: string;
  content: string;
  excerpt: string;
  categoryName: string;
  readingTime: number;
  canonicalUrl: string;
  absoluteImageUrl: string;
  publishedDate: Date;
  hasCharts: boolean;
  chartTitles: string[];
}