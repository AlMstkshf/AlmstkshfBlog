import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'article' | 'website' | 'organization' | 'breadcrumb' | 'dataset' | 'chart';
  data: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[data-structured-data="true"]');
    existingScripts.forEach(script => script.remove());

    let structuredData: any = {};

    switch (type) {
      case 'article':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data.headline || data.title,
          "description": data.description,
          "image": data.image ? [data.image] : [],
          "datePublished": data.datePublished || data.publishedAt,
          "dateModified": data.dateModified || data.updatedAt || data.datePublished || data.publishedAt,
          "author": data.author ? {
            "@type": "Person",
            "name": typeof data.author === 'string' ? data.author : data.author.name,
            "url": "https://almstkshf.com"
          } : {
            "@type": "Person",
            "name": "Al-Mustakshef Editorial Team",
            "url": "https://almstkshf.com"
          },
          "publisher": data.publisher || {
            "@type": "Organization",
            "name": "المستكشف - Al-Mustakshef",
            "logo": {
              "@type": "ImageObject",
              "url": "https://almstkshf.com/logo.png"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": data.url
          },
          "articleSection": data.category || data.section,
          "keywords": data.keywords || [],
          "wordCount": data.wordCount,
          "timeRequired": data.readingTime ? `PT${data.readingTime}M` : undefined,
          "inLanguage": data.language || "ar",
          "url": data.url,
          "about": data.about || {
            "@type": "Thing",
            "name": "Media Intelligence",
            "description": "Advanced media monitoring and intelligence analysis"
          },
          "mentions": data.mentions || [],
          "isAccessibleForFree": true,
          "copyrightHolder": {
            "@type": "Organization",
            "name": "المستكشف - Al-Mustakshef"
          }
        };
        break;

      case 'website':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "المستكشف - Almstkshf",
          "description": data.description,
          "url": "https://almstkshf.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://almstkshf.com/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          },
          "inLanguage": ["ar", "en"],
          "publisher": {
            "@type": "Organization",
            "name": "المستكشف - Almstkshf",
            "url": "https://almstkshf.com"
          }
        };
        break;

      case 'organization':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "المستكشف - Almstkshf",
          "alternateName": "Almstkshf Media Monitoring",
          "url": "https://almstkshf.com",
          "logo": "https://almstkshf.com/logo.png",
          "description": data.description,
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+971-50-123-4567",
            "contactType": "customer service",
            "email": "rased@almstkshf.com",
            "availableLanguage": ["Arabic", "English"]
          },
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "AE",
            "addressRegion": "Dubai"
          },
          "sameAs": [
            "https://twitter.com/almstkshf",
            "https://linkedin.com/company/almstkshf"
          ]
        };
        break;

      case 'breadcrumb':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.items.map((item: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          }))
        };
        break;

      case 'dataset':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Dataset",
          "name": data.name || "Media Monitoring Data",
          "description": data.description || "Statistical data from media monitoring research",
          "url": data.url,
          "sameAs": data.sourceUrl,
          "creator": {
            "@type": "Organization",
            "name": data.creator || "Al-Mustakshef Research Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "المستكشف - Al-Mustakshef",
            "url": "https://almstkshf.com"
          },
          "datePublished": data.datePublished,
          "dateModified": data.dateModified,
          "license": "https://creativecommons.org/licenses/by/4.0/",
          "keywords": data.keywords || ["media monitoring", "statistics", "research"],
          "distribution": {
            "@type": "DataDownload",
            "encodingFormat": "application/json",
            "contentUrl": data.dataUrl
          },
          "variableMeasured": data.variables || [
            {
              "@type": "PropertyValue",
              "name": "effectiveness",
              "description": "Monitoring system effectiveness percentage"
            }
          ]
        };
        break;

      case 'chart':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "ImageObject",
          "name": data.title || "Media Monitoring Chart",
          "description": data.description || "Visual representation of media monitoring data",
          "url": data.imageUrl,
          "width": data.width || 800,
          "height": data.height || 400,
          "encodingFormat": "image/svg+xml",
          "creator": {
            "@type": "Organization",
            "name": "Al-Mustakshef Analytics"
          },
          "copyrightHolder": {
            "@type": "Organization",
            "name": "المستكشف - Al-Mustakshef"
          },
          "license": "https://creativecommons.org/licenses/by/4.0/",
          "about": {
            "@type": "Thing",
            "name": data.topic || "Media Monitoring Effectiveness",
            "description": data.topicDescription
          }
        };
        break;
    }

    // Create and append the script tag
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

  }, [type, data]);

  return null;
}