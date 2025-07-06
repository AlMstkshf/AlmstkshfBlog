import React from 'react';

// Regular expression to match URLs
const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/g;

// Regular expression to match markdown-style links [text](url)
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;

// Regular expression to match reference patterns like [1], [2], etc.
const REFERENCE_REGEX = /\[(\d+)\]/g;

/**
 * Converts URLs in text to clickable links and formats references
 */
export function convertLinksToClickable(text: string): React.ReactNode[] {
  if (!text) return [];

  const parts: React.ReactNode[] = [];
  let processedText = text;
  let matchIndex = 0;

  // First, handle markdown-style links [text](url)
  const markdownMatches: Array<{ match: string; text: string; url: string; index: number }> = [];
  let markdownMatch;
  
  while ((markdownMatch = MARKDOWN_LINK_REGEX.exec(text)) !== null) {
    markdownMatches.push({
      match: markdownMatch[0],
      text: markdownMatch[1],
      url: markdownMatch[2],
      index: markdownMatch.index
    });
  }

  // Sort matches by index in reverse order to replace from end to beginning
  markdownMatches.sort((a, b) => b.index - a.index);

  // Replace markdown links with placeholders
  const linkReplacements: { [key: string]: React.ReactNode } = {};
  markdownMatches.forEach((match, idx) => {
    const placeholder = `__MARKDOWN_LINK_${idx}__`;
    processedText = processedText.replace(match.match, placeholder);
    linkReplacements[placeholder] = (
      <a
        key={`markdown-link-${idx}`}
        href={match.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-1 underline-offset-2 transition-colors duration-200 font-medium"
      >
        {match.text}
      </a>
    );
  });

  // Now handle plain URLs in the processed text
  const urlMatches: Array<{ match: string; url: string; index: number }> = [];
  let urlMatch;
  const urlRegex = new RegExp(URL_REGEX.source, 'g');
  
  while ((urlMatch = urlRegex.exec(processedText)) !== null) {
    urlMatches.push({
      match: urlMatch[0],
      url: urlMatch[1],
      index: urlMatch.index
    });
  }

  // Process the text and create React nodes
  let currentIndex = 0;
  
  // Combine all matches and sort by index
  const allMatches = [
    ...urlMatches.map(m => ({ ...m, type: 'url' })),
    ...Object.keys(linkReplacements).map(placeholder => ({
      match: placeholder,
      url: '',
      index: processedText.indexOf(placeholder),
      type: 'markdown'
    }))
  ].sort((a, b) => a.index - b.index);

  allMatches.forEach((match, idx) => {
    // Add text before the match
    if (match.index > currentIndex) {
      const beforeText = processedText.slice(currentIndex, match.index);
      if (beforeText) {
        parts.push(<span key={`text-${idx}`}>{beforeText}</span>);
      }
    }

    // Add the link
    if (match.type === 'markdown') {
      parts.push(linkReplacements[match.match]);
    } else {
      parts.push(
        <a
          key={`url-link-${idx}`}
          href={match.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-1 underline-offset-2 transition-colors duration-200"
        >
          {match.url}
        </a>
      );
    }

    currentIndex = match.index + match.match.length;
  });

  // Add remaining text
  if (currentIndex < processedText.length) {
    const remainingText = processedText.slice(currentIndex);
    if (remainingText) {
      parts.push(<span key="text-final">{remainingText}</span>);
    }
  }

  // If no matches were found, return the original text
  if (parts.length === 0) {
    parts.push(<span key="original">{text}</span>);
  }

  return parts;
}

/**
 * Process paragraph content to make URLs clickable
 */
export function processParagraphContent(content: string): React.ReactNode {
  const paragraphs = content.split('\n\n');
  
  return (
    <div>
      {paragraphs.map((paragraph, index) => {
        if (paragraph.trim() === '') return null;
        
        return (
          <p key={index} className="mb-6 leading-relaxed text-slate-700 dark:text-slate-300">
            {convertLinksToClickable(paragraph)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Enhanced content processor that handles both URLs and markdown-style links
 */
export function processArticleContent(content: string): React.ReactNode {
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
              {headerText}
            </h2>
          );
        }
        
        if (trimmedParagraph.startsWith('#')) {
          const headerText = trimmedParagraph.replace(/^#\s*/, '');
          return (
            <h1 key={index} className="text-3xl font-bold mt-8 mb-6 text-slate-900 dark:text-slate-100">
              {headerText}
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
                    {convertLinksToClickable(cleanItem)}
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
                    {convertLinksToClickable(cleanItem)}
                  </li>
                );
              })}
            </ol>
          );
        }

        // Handle regular paragraphs
        return (
          <p key={index} className="mb-6 leading-relaxed text-slate-700 dark:text-slate-300">
            {convertLinksToClickable(trimmedParagraph)}
          </p>
        );
      })}
    </div>
  );
}