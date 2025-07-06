import { useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";

interface EnhancedMetaTagsProps {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  keywords?: string;
  canonicalUrl?: string;
  articleType?: "Article" | "GovernmentService" | "FAQPage" | "TechnicalDocument";
  publishedDate?: string;
  modifiedDate?: string;
  authorName?: string;
  authorTitle?: string;
  organization?: string;
  expertQuotes?: Array<{
    author: string;
    title: string;
    organization: string;
    quote: string;
  }>;
  governmentStrategy?: {
    strategy: string;
    agency: string;
    alignmentScore: number;
  };
  faqData?: Array<{
    question: string;
    answer: string;
  }>;
  imageUrl?: string;
  readingTime?: number;
  difficulty?: "beginner" | "intermediate" | "advanced" | "expert";
  targetAudience?: "decision_makers" | "government_officials" | "analysts" | "executives";
}

export function EnhancedMetaTags({
  title,
  titleAr,
  description,
  descriptionAr,
  keywords,
  canonicalUrl,
  articleType = "Article",
  publishedDate,
  modifiedDate,
  authorName = "Al-Mustakshef Research Team",
  authorTitle = "Media Intelligence Specialists",
  organization = "Al-Mustakshef Platform",
  expertQuotes = [],
  governmentStrategy,
  faqData = [],
  imageUrl,
  readingTime,
  difficulty = "intermediate",
  targetAudience = "analysts"
}: EnhancedMetaTagsProps) {
  const { language } = useLanguage();
  
  const currentTitle = language === "ar" && titleAr ? titleAr : title;
  const currentDescription = language === "ar" && descriptionAr ? descriptionAr : description;
  const currentUrl = canonicalUrl || (typeof window !== "undefined" ? window.location.href : "");
  const baseUrl = "https://almustakshef.com";
  const logoUrl = `${baseUrl}/logo.png`;
  const defaultImageUrl = imageUrl || `${baseUrl}/og-image.png`;

  // Generate comprehensive structured data
  const generateStructuredData = () => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": articleType,
      "headline": currentTitle,
      "description": currentDescription,
      "url": currentUrl,
      "datePublished": publishedDate || new Date().toISOString(),
      "dateModified": modifiedDate || new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": authorName,
        "jobTitle": authorTitle,
        "worksFor": {
          "@type": "Organization",
          "name": organization,
          "url": baseUrl,
          "logo": logoUrl
        }
      },
      "publisher": {
        "@type": "Organization",
        "name": "Al-Mustakshef",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": logoUrl
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": currentUrl
      },
      "image": {
        "@type": "ImageObject",
        "url": defaultImageUrl
      }
    };

    // Add FAQ schema if FAQ data exists
    if (faqData.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      };
      
      return [baseSchema, faqSchema];
    }

    // Add government service schema for government-related content
    if (governmentStrategy) {
      const govSchema = {
        "@context": "https://schema.org",
        "@type": "GovernmentService",
        "name": currentTitle,
        "description": currentDescription,
        "provider": {
          "@type": "GovernmentOrganization",
          "name": governmentStrategy.agency
        },
        "serviceType": "Media Intelligence",
        "audience": {
          "@type": "Audience",
          "audienceType": targetAudience
        }
      };
      
      return [baseSchema, govSchema];
    }

    // Add expert quotes as structured data
    if (expertQuotes.length > 0) {
      const quotesSchema = expertQuotes.map(quote => ({
        "@context": "https://schema.org",
        "@type": "Quotation",
        "text": quote.quote,
        "author": {
          "@type": "Person",
          "name": quote.author,
          "jobTitle": quote.title,
          "worksFor": {
            "@type": "Organization",
            "name": quote.organization
          }
        }
      }));
      
      return [baseSchema, ...quotesSchema];
    }

    return baseSchema;
  };

  // Generate advanced meta keywords based on content type and government alignment
  const generateAdvancedKeywords = () => {
    const baseKeywords = keywords ? keywords.split(',').map(k => k.trim()) : [];
    
    // Add government-intent keywords
    const governmentKeywords = [
      "UAE government AI",
      "GEM 2.1 implementation",
      "Arabic sentiment analysis",
      "government media monitoring",
      "strategic intelligence UAE"
    ];

    // Add audience-specific keywords
    const audienceKeywords = {
      decision_makers: ["executive decision making", "strategic planning", "government leadership"],
      government_officials: ["public administration", "government efficiency", "policy implementation"],
      analysts: ["data analysis", "performance metrics", "intelligence reports"],
      executives: ["business intelligence", "strategic insights", "competitive analysis"]
    };

    // Add difficulty-based keywords
    const difficultyKeywords = {
      beginner: ["introduction", "basic guide", "fundamentals"],
      intermediate: ["implementation", "best practices", "methodology"],
      advanced: ["optimization", "advanced techniques", "expert analysis"],
      expert: ["strategic framework", "specialized implementation", "executive consultation"]
    };

    const allKeywords = [
      ...baseKeywords,
      ...governmentKeywords,
      ...(audienceKeywords[targetAudience] || []),
      ...(difficultyKeywords[difficulty] || [])
    ];

    if (governmentStrategy) {
      allKeywords.push(
        `${governmentStrategy.strategy} implementation`,
        `${governmentStrategy.agency} services`,
        "UAE national strategy"
      );
    }

    return allKeywords.join(", ");
  };

  useEffect(() => {
    // Update document title
    document.title = `${currentTitle} | Al-Mustakshef - Media Intelligence Platform`;

    // Remove existing meta tags
    const existingMetas = document.querySelectorAll('meta[data-enhanced-seo="true"]');
    existingMetas.forEach(meta => meta.remove());

    const existingStructuredData = document.querySelectorAll('script[type="application/ld+json"][data-enhanced-seo="true"]');
    existingStructuredData.forEach(script => script.remove());

    // Create and append new meta tags
    const metaTags = [
      { name: "description", content: currentDescription },
      { name: "keywords", content: generateAdvancedKeywords() },
      { name: "author", content: `${authorName}, ${authorTitle}` },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
      
      // Open Graph tags
      { property: "og:title", content: currentTitle },
      { property: "og:description", content: currentDescription },
      { property: "og:type", content: "article" },
      { property: "og:url", content: currentUrl },
      { property: "og:image", content: defaultImageUrl },
      { property: "og:site_name", content: "Al-Mustakshef" },
      { property: "og:locale", content: language === "ar" ? "ar_AE" : "en_US" },
      
      // Twitter Card tags
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: currentTitle },
      { name: "twitter:description", content: currentDescription },
      { name: "twitter:image", content: defaultImageUrl },
      
      // LinkedIn specific tags
      { property: "article:author", content: authorName },
      { property: "article:publisher", content: "Al-Mustakshef" },
      
      // Government and professional tags
      { name: "classification", content: "government, media intelligence, strategic analysis" },
      { name: "audience", content: targetAudience },
      { name: "content-level", content: difficulty },
      
      // UAE government alignment
      ...(governmentStrategy ? [
        { name: "government-strategy", content: governmentStrategy.strategy },
        { name: "government-agency", content: governmentStrategy.agency },
        { name: "alignment-score", content: governmentStrategy.alignmentScore.toString() }
      ] : []),
      
      // Reading time and engagement
      ...(readingTime ? [{ name: "reading-time", content: `${readingTime} minutes` }] : []),
      
      // Canonical URL
      ...(canonicalUrl ? [{ rel: "canonical", href: canonicalUrl }] : [])
    ];

    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.setAttribute('data-enhanced-seo', 'true');
      
      if (tag.name) meta.setAttribute('name', tag.name);
      if (tag.property) meta.setAttribute('property', tag.property);
      if (tag.content) meta.setAttribute('content', tag.content);
      if (tag.rel) {
        meta.setAttribute('rel', tag.rel);
        meta.setAttribute('href', tag.href!);
      }
      
      document.head.appendChild(meta);
    });

    // Add structured data
    const structuredData = generateStructuredData();
    const schemas = Array.isArray(structuredData) ? structuredData : [structuredData];
    
    schemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-enhanced-seo', 'true');
      script.textContent = JSON.stringify(schema, null, 2);
      document.head.appendChild(script);
    });

    // Add hreflang for bilingual content
    if (titleAr) {
      const hreflangEn = document.createElement('link');
      hreflangEn.rel = 'alternate';
      hreflangEn.hreflang = 'en';
      hreflangEn.href = currentUrl.replace('/ar/', '/en/');
      hreflangEn.setAttribute('data-enhanced-seo', 'true');
      document.head.appendChild(hreflangEn);

      const hreflangAr = document.createElement('link');
      hreflangAr.rel = 'alternate';
      hreflangAr.hreflang = 'ar';
      hreflangAr.href = currentUrl.replace('/en/', '/ar/');
      hreflangAr.setAttribute('data-enhanced-seo', 'true');
      document.head.appendChild(hreflangAr);
    }

    // Cleanup function
    return () => {
      const enhancedMetas = document.querySelectorAll('[data-enhanced-seo="true"]');
      enhancedMetas.forEach(meta => meta.remove());
    };
  }, [
    currentTitle, 
    currentDescription, 
    currentUrl, 
    keywords, 
    authorName, 
    authorTitle, 
    organization, 
    targetAudience, 
    difficulty,
    governmentStrategy,
    expertQuotes,
    faqData,
    language
  ]);

  return null; // This component only manages head elements
}