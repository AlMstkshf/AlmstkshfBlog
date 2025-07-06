import React from 'react';

/**
 * Simple and reliable function to convert URLs in text to clickable links
 */
export function convertTextToClickableLinks(text: string): React.ReactNode[] {
  if (!text) return [<span key="empty">{text}</span>];

  // Enhanced regex patterns to match all URL formats
  const patterns = [
    // Markdown links [text](url)
    /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    // Plain URLs
    /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g,
  ];

  let processedText = text;
  const replacements: { [key: string]: React.ReactNode } = {};
  let placeholderIndex = 0;

  // First pass: handle markdown-style links
  processedText = processedText.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, (match, linkText, url) => {
    const placeholder = `__LINK_${placeholderIndex}__`;
    replacements[placeholder] = (
      <a
        key={`link-${placeholderIndex}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-1 underline-offset-2 transition-colors duration-200 font-medium bg-blue-50 dark:bg-blue-950 px-1 py-0.5 rounded"
      >
        {linkText}
      </a>
    );
    placeholderIndex++;
    return placeholder;
  });

  // Second pass: handle plain URLs (that aren't already in markdown format)
  processedText = processedText.replace(/(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g, (match, url) => {
    // Check if this URL is already part of a markdown link
    if (Object.values(replacements).some(replacement => 
      React.isValidElement(replacement) && replacement.props.href === url
    )) {
      return match; // Skip if already processed as markdown
    }

    const placeholder = `__LINK_${placeholderIndex}__`;
    replacements[placeholder] = (
      <a
        key={`link-${placeholderIndex}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-1 underline-offset-2 transition-colors duration-200"
      >
        {url}
      </a>
    );
    placeholderIndex++;
    return placeholder;
  });

  // Split by placeholders and create final elements
  const parts = processedText.split(/(__LINK_\d+__)/);
  const result: React.ReactNode[] = [];

  parts.forEach((part, index) => {
    if (part.startsWith('__LINK_') && part.endsWith('__')) {
      const replacement = replacements[part];
      if (replacement) {
        result.push(replacement);
      }
    } else if (part) {
      result.push(<span key={`text-${index}`}>{part}</span>);
    }
  });

  return result.length > 0 ? result : [<span key="fallback">{text}</span>];
}

/**
 * Process article content with enhanced link conversion and proper formatting
 */
export function processArticleContentWithLinks(content: string): React.ReactNode {
  if (!content) return null;

  // Split content into paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  return (
    <div className="prose prose-lg max-w-none dark:prose-invert">
      {paragraphs.map((paragraph, index) => {
        const trimmedParagraph = paragraph.trim();
        
        // Handle headers
        if (trimmedParagraph.startsWith('##')) {
          const headerText = trimmedParagraph.replace(/^##\s*/, '');
          return (
            <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-slate-900 dark:text-slate-100">
              {convertTextToClickableLinks(headerText)}
            </h2>
          );
        }
        
        if (trimmedParagraph.startsWith('#')) {
          const headerText = trimmedParagraph.replace(/^#\s*/, '');
          return (
            <h1 key={index} className="text-3xl font-bold mt-8 mb-6 text-slate-900 dark:text-slate-100">
              {convertTextToClickableLinks(headerText)}
            </h1>
          );
        }

        // Handle bullet points
        if (trimmedParagraph.startsWith('- ') || trimmedParagraph.startsWith('• ')) {
          const items = trimmedParagraph.split('\n').filter(item => item.trim());
          return (
            <ul key={index} className="list-disc list-inside mb-6 space-y-2">
              {items.map((item, itemIndex) => {
                const cleanItem = item.replace(/^[-•]\s*/, '');
                return (
                  <li key={itemIndex} className="text-slate-700 dark:text-slate-300">
                    {convertTextToClickableLinks(cleanItem)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Handle numbered lists
        if (/^\d+\.\s/.test(trimmedParagraph)) {
          const items = trimmedParagraph.split('\n').filter(item => item.trim() && /^\d+\.\s/.test(item));
          return (
            <ol key={index} className="list-decimal list-inside mb-6 space-y-2">
              {items.map((item, itemIndex) => {
                const cleanItem = item.replace(/^\d+\.\s*/, '');
                return (
                  <li key={itemIndex} className="text-slate-700 dark:text-slate-300">
                    {convertTextToClickableLinks(cleanItem)}
                  </li>
                );
              })}
            </ol>
          );
        }

        // Handle regular paragraphs with link conversion
        return (
          <p key={index} className="mb-6 leading-relaxed text-slate-700 dark:text-slate-300">
            {convertTextToClickableLinks(trimmedParagraph)}
          </p>
        );
      })}
    </div>
  );
}