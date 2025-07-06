import { useEffect } from 'react';

interface SEOEnhancerProps {
  article: {
    titleEn?: string;
    titleAr?: string;
    excerptEn?: string;
    excerptAr?: string;
    contentEn?: string;
    contentAr?: string;
    featuredImage?: string;
    authorName?: string;
    slug?: string;
    category?: {
      nameEn?: string;
      nameAr?: string;
      slug?: string;
    };
    createdAt?: string;
    updatedAt?: string;
  };
  language: 'en' | 'ar';
}

export function SEOEnhancer({ article, language }: SEOEnhancerProps) {
  useEffect(() => {
    if (!article) return;

    const isRTL = language === 'ar';
    const title = language === 'ar' && article.titleAr ? article.titleAr : article.titleEn;
    const excerpt = language === 'ar' && article.excerptAr ? article.excerptAr : article.excerptEn;
    const categoryName = language === 'ar' && article.category?.nameAr 
      ? article.category.nameAr 
      : article.category?.nameEn;

    // Clear existing meta tags
    const existingMetas = document.querySelectorAll('meta[data-seo="true"]');
    existingMetas.forEach(meta => meta.remove());

    const existingLinks = document.querySelectorAll('link[data-seo="true"]');
    existingLinks.forEach(link => link.remove());

    // Set page title
    const pageTitle = title 
      ? `${title} | ${language === 'ar' ? 'المستكشف - منصة الذكاء الإعلامي' : 'Al-Mustakshef - Middle East Media Intelligence'}`
      : (language === 'ar' ? 'المستكشف - منصة الذكاء الإعلامي' : 'Al-Mustakshef - Middle East Media Intelligence');
    
    document.title = pageTitle;

    // Generate absolute URLs
    const currentUrl = window.location.href;
    const canonicalUrl = `${window.location.origin}/${language}/blog/${article.category?.slug || 'uncategorized'}/${article.slug || ''}`;
    const imageUrl = article.featuredImage?.startsWith('http') 
      ? article.featuredImage 
      : `${window.location.origin}${article.featuredImage || '/api/placeholder/800/400'}`;

    // Meta tags configuration
    const metaTags = [
      // Basic SEO
      { name: 'description', content: excerpt || (language === 'ar' 
        ? 'اقرأ أحدث المقالات والتحليلات في مجال الذكاء الإعلامي والتحول الرقمي من المستكشف' 
        : 'Read the latest articles and insights on media intelligence and digital transformation from Al-Mustakshef') },
      { name: 'keywords', content: `${language === 'ar' ? 'المستكشف، ذكاء إعلامي، تحليل بيانات، الشرق الأوسط' : 'Al-Mustakshef, media intelligence, data analysis, Middle East'}, ${categoryName || ''}` },
      { name: 'author', content: article.authorName || 'Al-Mustakshef Editorial Team' },
      { name: 'language', content: language },
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      { name: 'googlebot', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { name: 'theme-color', content: '#2563eb' },
      
      // Open Graph tags for LinkedIn/Facebook sharing
      { property: 'og:type', content: 'article' },
      { property: 'og:title', content: title || pageTitle },
      { property: 'og:description', content: excerpt || (language === 'ar' 
        ? 'اقرأ أحدث المقالات والتحليلات في مجال الذكاء الإعلامي والتحول الرقمي من المستكشف' 
        : 'Read the latest articles and insights on media intelligence and digital transformation from Al-Mustakshef') },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:site_name', content: 'المستكشف - Al-Mustakshef' },
      { property: 'og:image', content: imageUrl },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: title || 'Al-Mustakshef Article' },
      { property: 'og:locale', content: language === 'ar' ? 'ar_AE' : 'en_US' },
      
      // Article specific Open Graph
      { property: 'article:published_time', content: article.createdAt || new Date().toISOString() },
      { property: 'article:modified_time', content: article.updatedAt || article.createdAt || new Date().toISOString() },
      { property: 'article:author', content: article.authorName || 'Al-Mustakshef Editorial Team' },
      { property: 'article:section', content: categoryName || 'News' },
      { property: 'article:publisher', content: 'Al-Mustakshef' },
      
      // Twitter Card tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@almstkshf' },
      { name: 'twitter:creator', content: '@almstkshf' },
      { name: 'twitter:title', content: title || pageTitle },
      { name: 'twitter:description', content: excerpt || (language === 'ar' 
        ? 'اقرأ أحدث المقالات والتحليلات في مجال الذكاء الإعلامي والتحول الرقمي من المستكشف' 
        : 'Read the latest articles and insights on media intelligence and digital transformation from Al-Mustakshef') },
      { name: 'twitter:image', content: imageUrl },
      { name: 'twitter:image:alt', content: title || 'Al-Mustakshef Article' },
      
      // LinkedIn specific
      { property: 'linkedin:owner', content: 'Al-Mustakshef' },
      
      // Additional SEO tags
      { name: 'application-name', content: 'Al-Mustakshef' },
      { name: 'apple-mobile-web-app-title', content: 'Al-Mustakshef' },
      { name: 'msapplication-TileColor', content: '#2563eb' },
      { name: 'format-detection', content: 'telephone=no' }
    ];

    // Create and append meta tags
    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('data-seo', 'true');
      
      if ('name' in tag && tag.name) {
        meta.name = tag.name;
        meta.content = tag.content;
      } else if ('property' in tag && tag.property) {
        meta.setAttribute('property', tag.property);
        meta.content = tag.content;
      }
      
      document.head.appendChild(meta);
    });

    // Canonical link
    const canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = canonicalUrl;
    canonicalLink.setAttribute('data-seo', 'true');
    document.head.appendChild(canonicalLink);

    // Alternate language links
    const alternateLang = language === 'ar' ? 'en' : 'ar';
    const alternateUrl = `${window.location.origin}/${alternateLang}/blog/${article.category?.slug || 'uncategorized'}/${article.slug || ''}`;
    
    const alternateLink = document.createElement('link');
    alternateLink.rel = 'alternate';
    alternateLink.hreflang = alternateLang;
    alternateLink.href = alternateUrl;
    alternateLink.setAttribute('data-seo', 'true');
    document.head.appendChild(alternateLink);

    // Self language link
    const selfLink = document.createElement('link');
    selfLink.rel = 'alternate';
    selfLink.hreflang = language;
    selfLink.href = canonicalUrl;
    selfLink.setAttribute('data-seo', 'true');
    document.head.appendChild(selfLink);

    // Preload critical resources
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = imageUrl;
    preloadLink.as = 'image';
    preloadLink.setAttribute('data-seo', 'true');
    document.head.appendChild(preloadLink);

    // JSON-LD structured data
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: excerpt,
      image: imageUrl,
      author: {
        '@type': 'Person',
        name: article.authorName || 'Al-Mustakshef Editorial Team'
      },
      publisher: {
        '@type': 'Organization',
        name: 'المستكشف - Al-Mustakshef',
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/logo.png`
        }
      },
      datePublished: article.createdAt || new Date().toISOString(),
      dateModified: article.updatedAt || article.createdAt || new Date().toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl
      },
      articleSection: categoryName,
      inLanguage: language === 'ar' ? 'ar-AE' : 'en-US',
      url: canonicalUrl
    };

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"][data-seo="true"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Set document language and direction
    document.documentElement.lang = language === 'ar' ? 'ar-AE' : 'en-US';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

    // Cleanup function
    return () => {
      const dynamicMetas = document.querySelectorAll('meta[data-seo="true"]');
      dynamicMetas.forEach(meta => meta.remove());
      
      const dynamicLinks = document.querySelectorAll('link[data-seo="true"]');
      dynamicLinks.forEach(link => link.remove());
      
      const dynamicScript = document.querySelector('script[type="application/ld+json"][data-seo="true"]');
      if (dynamicScript) {
        dynamicScript.remove();
      }
    };
  }, [article, language]);

  return null; // This component doesn't render anything visible
}