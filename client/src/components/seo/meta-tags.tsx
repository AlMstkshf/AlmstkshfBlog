import { useEffect } from 'react';

interface MetaTagsProps {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  language?: string;
  articleData?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
    readingTime?: number;
    wordCount?: number;
    category?: string;
  };
  chartData?: {
    hasCharts?: boolean;
    chartTitles?: string[];
    datasetName?: string;
  };
}

export function MetaTags({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  canonical,
  language = 'en',
  articleData,
  chartData
}: MetaTagsProps) {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Remove existing meta tags
    const existingMetas = document.querySelectorAll('meta[data-dynamic="true"]');
    existingMetas.forEach(meta => meta.remove());

    // Remove existing link tags
    const existingLinks = document.querySelectorAll('link[data-dynamic="true"]');
    existingLinks.forEach(link => link.remove());

    // Basic meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'language', content: language },
      { httpEquiv: 'Content-Language', content: language },
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      { name: 'googlebot', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { name: 'theme-color', content: '#2563eb' },
      { name: 'generator', content: 'Al-Mustakshef Media Intelligence Platform' },
      { name: 'application-name', content: 'المستكشف - Al-Mustakshef' },
      { name: 'author', content: articleData?.author || 'Al-Mustakshef Editorial Team' },
      { name: 'publisher', content: 'Al-Mustakshef' },
      { name: 'copyright', content: 'Al-Mustakshef - All rights reserved' },
      { name: 'revisit-after', content: '7 days' },
      { name: 'rating', content: 'general' },
      { name: 'distribution', content: 'global' },
      { name: 'format-detection', content: 'telephone=no' },
    ];

    // Enhanced content meta tags
    if (articleData?.readingTime) {
      metaTags.push({ name: 'twitter:label1', content: language === 'ar' ? 'وقت القراءة' : 'Reading time' });
      metaTags.push({ name: 'twitter:data1', content: `${articleData.readingTime} ${language === 'ar' ? 'دقيقة' : 'min'}` });
    }

    if (articleData?.wordCount) {
      metaTags.push({ name: 'twitter:label2', content: language === 'ar' ? 'عدد الكلمات' : 'Word count' });
      metaTags.push({ name: 'twitter:data2', content: articleData.wordCount.toString() });
    }

    if (chartData?.hasCharts) {
      metaTags.push({ name: 'analytics:charts', content: 'true' });
      metaTags.push({ name: 'content:visual-data', content: 'interactive-charts' });
      if (chartData.datasetName) {
        metaTags.push({ name: 'dataset:name', content: chartData.datasetName });
      }
    }

    if (keywords) {
      metaTags.push({ name: 'keywords', content: keywords });
    }

    // Open Graph tags
    const ogTags = [
      { property: 'og:title', content: ogTitle || title },
      { property: 'og:description', content: ogDescription || description },
      { property: 'og:type', content: articleData ? 'article' : 'website' },
      { property: 'og:url', content: ogUrl || window.location.href },
      { property: 'og:site_name', content: 'المستكشف - Almstkshf' },
      { property: 'og:locale', content: language === 'ar' ? 'ar_AE' : 'en_US' },
    ];

    if (ogImage) {
      ogTags.push({ property: 'og:image', content: ogImage });
      ogTags.push({ property: 'og:image:alt', content: ogTitle || title });
    }

    // Article specific Open Graph tags
    if (articleData) {
      if (articleData.publishedTime) {
        ogTags.push({ property: 'article:published_time', content: articleData.publishedTime });
      }
      if (articleData.modifiedTime) {
        ogTags.push({ property: 'article:modified_time', content: articleData.modifiedTime });
      }
      if (articleData.author) {
        ogTags.push({ property: 'article:author', content: articleData.author });
      }
      if (articleData.section) {
        ogTags.push({ property: 'article:section', content: articleData.section });
      }
      if (articleData.tags) {
        articleData.tags.forEach(tag => {
          ogTags.push({ property: 'article:tag', content: tag });
        });
      }
    }

    // Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: ogTitle || title },
      { name: 'twitter:description', content: ogDescription || description },
      { name: 'twitter:site', content: '@almstkshf' },
    ];

    if (ogImage) {
      twitterTags.push({ name: 'twitter:image', content: ogImage });
    }

    // Create and append meta tags
    [...metaTags, ...ogTags, ...twitterTags].forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('data-dynamic', 'true');
      
      if ('name' in tag && tag.name && tag.content) {
        meta.name = tag.name;
        meta.content = tag.content;
      } else if ('property' in tag && tag.property && tag.content) {
        meta.setAttribute('property', tag.property);
        meta.content = tag.content;
      } else if ('httpEquiv' in tag && tag.httpEquiv && tag.content) {
        meta.httpEquiv = tag.httpEquiv;
        meta.content = tag.content;
      }
      
      document.head.appendChild(meta);
    });

    // Canonical link
    if (canonical) {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = canonical;
      link.setAttribute('data-dynamic', 'true');
      document.head.appendChild(link);
    }

    // Language alternates
    const alternateLinks = [
      { hreflang: 'en', href: window.location.href.replace('/ar/', '/en/') },
      { hreflang: 'ar', href: window.location.href.replace('/en/', '/ar/') },
      { hreflang: 'x-default', href: window.location.href.replace('/ar/', '/en/') }
    ];

    alternateLinks.forEach(alt => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = alt.hreflang;
      link.href = alt.href || window.location.href;
      link.setAttribute('data-dynamic', 'true');
      document.head.appendChild(link);
    });

  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogUrl, canonical, language, articleData]);

  return null;
}