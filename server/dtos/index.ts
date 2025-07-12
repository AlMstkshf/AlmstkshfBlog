// Data Transfer Objects for API responses
// These DTOs help optimize data transfer and provide different views of the same data

export interface ArticleListDTO {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  publishedAt: string;
  featured: boolean;
  categoryId?: number;
  categoryName?: string;
  language: string;
  readingTime?: number;
}

export interface ArticleDetailDTO {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  publishedAt: string;
  updatedAt: string;
  featured: boolean;
  categoryId?: number;
  categoryName?: string;
  language: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  readingTime?: number;
  viewCount?: number;
}

export interface ArticleAdminDTO extends ArticleDetailDTO {
  createdAt: string;
  published: boolean;
  authorId?: string;
  seoScore?: number;
  lastModifiedBy?: string;
}

export interface CategoryListDTO {
  id: number;
  name: string;
  slug: string;
  description?: string;
  articleCount: number;
  language: string;
}

export interface CategoryDetailDTO extends CategoryListDTO {
  createdAt: string;
  updatedAt: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface DownloadListDTO {
  id: number;
  title: string;
  description?: string;
  fileType: string;
  fileSize: number;
  downloadCount: number;
  createdAt: string;
  language: string;
  categoryId?: number;
  categoryName?: string;
}

export interface DownloadDetailDTO extends DownloadListDTO {
  fileName: string;
  filePath: string;
  updatedAt: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    totalPages: number;
    currentPage: number;
  };
}

export interface CacheMetadata {
  cacheKey: string;
  ttl: number;
  lastModified: string;
  etag: string;
}

// DTO Transformation utilities
export class DTOTransformer {
  
  static toArticleListDTO(article: any): ArticleListDTO {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || article.content?.substring(0, 200) + '...',
      featuredImage: article.featuredImage,
      publishedAt: article.publishedAt,
      featured: article.featured,
      categoryId: article.categoryId,
      categoryName: article.categoryName,
      language: article.language,
      readingTime: article.readingTime || this.calculateReadingTime(article.content)
    };
  }

  static toArticleDetailDTO(article: any): ArticleDetailDTO {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      featuredImage: article.featuredImage,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      featured: article.featured,
      categoryId: article.categoryId,
      categoryName: article.categoryName,
      language: article.language,
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      tags: article.tags ? JSON.parse(article.tags) : [],
      readingTime: article.readingTime || this.calculateReadingTime(article.content),
      viewCount: article.viewCount
    };
  }

  static toArticleAdminDTO(article: any): ArticleAdminDTO {
    return {
      ...this.toArticleDetailDTO(article),
      createdAt: article.createdAt,
      published: article.published,
      authorId: article.authorId,
      seoScore: article.seoScore,
      lastModifiedBy: article.lastModifiedBy
    };
  }

  static toCategoryListDTO(category: any, articleCount: number = 0): CategoryListDTO {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      articleCount,
      language: category.language
    };
  }

  static toCategoryDetailDTO(category: any, articleCount: number = 0): CategoryDetailDTO {
    return {
      ...this.toCategoryListDTO(category, articleCount),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      metaTitle: category.metaTitle,
      metaDescription: category.metaDescription
    };
  }

  static toDownloadListDTO(download: any): DownloadListDTO {
    return {
      id: download.id,
      title: download.title,
      description: download.description,
      fileType: download.fileType,
      fileSize: download.fileSize,
      downloadCount: download.downloadCount || 0,
      createdAt: download.createdAt,
      language: download.language,
      categoryId: download.categoryId,
      categoryName: download.categoryName
    };
  }

  static toDownloadDetailDTO(download: any): DownloadDetailDTO {
    return {
      ...this.toDownloadListDTO(download),
      fileName: download.fileName,
      filePath: download.filePath,
      updatedAt: download.updatedAt,
      metaTitle: download.metaTitle,
      metaDescription: download.metaDescription,
      tags: download.tags ? JSON.parse(download.tags) : []
    };
  }

  // Utility function to calculate reading time
  private static calculateReadingTime(content: string): number {
    if (!content) return 0;
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Create paginated response
  static createPaginatedResponse<T>(
    data: T[],
    total: number,
    limit: number,
    offset: number,
    nextCursor?: string
  ): PaginatedResponse<T> {
    return {
      data,
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
        nextCursor,
        totalPages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1
      }
    };
  }
}