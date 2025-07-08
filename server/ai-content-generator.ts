import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

interface ContentGenerationRequest {
  type: 'title' | 'excerpt' | 'content';
  language: 'en' | 'ar';
  title?: string;
  category?: string;
  existingContent?: string;
  tone?: 'professional' | 'casual' | 'academic' | 'conversational';
  length?: 'short' | 'medium' | 'long';
}

interface ContentGenerationResponse {
  content: string;
  service: string;
  tokensUsed?: number;
}

export class AIContentGenerator {
  private gemini: GoogleGenerativeAI | null = null;
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;

  constructor() {
    // Initialize services based on available API keys
    if (process.env.GOOGLE_AI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    }
    
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  async generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const prompt = this.buildPrompt(request);
    
    // Try services in order of preference: Gemini -> OpenAI -> Anthropic
    const services = [
      { name: 'gemini', generator: () => this.generateWithGemini(prompt) },
      { name: 'openai', generator: () => this.generateWithOpenAI(prompt) },
      { name: 'anthropic', generator: () => this.generateWithAnthropic(prompt) }
    ];

    for (const service of services) {
      try {
        const result = await service.generator();
        if (result) {
          return {
            content: result,
            service: service.name
          };
        }
      } catch (error) {
        console.error(`${service.name} generation failed:`, error);
        continue;
      }
    }

    throw new Error('All AI services failed to generate content');
  }

  private buildPrompt(request: ContentGenerationRequest): string {
    const { type, language, title, category, existingContent, tone = 'professional', length = 'medium' } = request;
    
    const languageInstructions = language === 'ar' 
      ? 'Generate content in Arabic. Use proper Arabic grammar and vocabulary.'
      : 'Generate content in English. Use clear, professional English.';

    const toneInstructions = {
      professional: 'Use a professional, authoritative tone suitable for business and industry content.',
      casual: 'Use a casual, friendly tone that feels conversational and approachable.',
      academic: 'Use an academic, scholarly tone with proper citations and formal language.',
      conversational: 'Use a conversational tone that engages the reader directly.'
    };

    const lengthInstructions = {
      short: type === 'content' ? '300-500 words' : type === 'excerpt' ? '50-100 words' : '5-8 words',
      medium: type === 'content' ? '800-1200 words' : type === 'excerpt' ? '100-150 words' : '8-12 words',
      long: type === 'content' ? '1500-2500 words' : type === 'excerpt' ? '150-200 words' : '12-15 words'
    };

    let basePrompt = `${languageInstructions}\n\n${toneInstructions[tone]}\n\n`;

    switch (type) {
      case 'title':
        basePrompt += `Generate a compelling, SEO-friendly title for an article about the following topic.
        Category: ${category || 'General'}
        Context: ${title || 'Create an engaging title'}
        
        Requirements:
        - Length: ${lengthInstructions[length]}
        - Should be attention-grabbing and clickable
        - Include relevant keywords naturally
        - Avoid clickbait or misleading content
        
        Generate only the title, no additional text.`;
        break;

      case 'excerpt':
        basePrompt += `Generate a compelling excerpt/summary for an article with the following title:
        Title: ${title}
        Category: ${category || 'General'}
        
        Requirements:
        - Length: ${lengthInstructions[length]}
        - Should entice readers to read the full article
        - Include key points or benefits
        - End with a hook or question if appropriate
        
        Generate only the excerpt, no additional text.`;
        break;

      case 'content':
        basePrompt += `Generate comprehensive article content for the following:
        Title: ${title}
        Category: ${category || 'General'}
        ${existingContent ? `Existing content to expand on: ${existingContent}` : ''}
        
        Requirements:
        - Length: ${lengthInstructions[length]}
        - Use proper HTML formatting with headings (h2, h3), paragraphs, lists
        - Include relevant subheadings to break up content
        - Make it informative, engaging, and valuable to readers
        - Include actionable insights where appropriate
        - Use bullet points or numbered lists for better readability
        
        Generate well-structured HTML content ready for publication.`;
        break;
    }

    return basePrompt;
  }

  private async generateWithGemini(prompt: string): Promise<string | null> {
    if (!this.gemini) return null;

    try {
      const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini generation error:', error);
      return null;
    }
  }

  private async generateWithOpenAI(prompt: string): Promise<string | null> {
    if (!this.openai) return null;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional content writer and SEO expert. Generate high-quality, engaging content that provides value to readers.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('OpenAI generation error:', error);
      return null;
    }
  }

  private async generateWithAnthropic(prompt: string): Promise<string | null> {
    if (!this.anthropic) return null;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      });

      const content = message.content[0];
      return content.type === 'text' ? content.text : null;
    } catch (error) {
      console.error('Anthropic generation error:', error);
      return null;
    }
  }

  // Method to check which services are available
  getAvailableServices(): string[] {
    const services: string[] = [];
    if (this.gemini) services.push('gemini');
    if (this.openai) services.push('openai');
    if (this.anthropic) services.push('anthropic');
    return services;
  }
}

export const aiContentGenerator = new AIContentGenerator();