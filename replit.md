# Al-Mustakshef Platform - Media Intelligence System

## Overview
Al-Mustakshef is a bilingual (English/Arabic) media intelligence platform designed for the Middle East market. The system provides automated content aggregation, AI-powered analysis, and comprehensive media monitoring capabilities for government and enterprise clients.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing with language-specific paths
- **UI Components**: Radix UI with Tailwind CSS for consistent design system
- **State Management**: TanStack React Query for server state and caching
- **Internationalization**: Custom language detection with RTL support for Arabic
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js and TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints with comprehensive error handling
- **Authentication**: Session-based authentication (currently disabled for demo)
- **File Management**: Multer for handling uploads with organized directory structure

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Design**: Comprehensive tables for articles, categories, users, newsletters, contacts, and automation settings
- **File Storage**: Local filesystem with organized structure (uploads/pdfs, uploads/images, uploads/documents)
- **Caching**: In-memory caching for categories with TTL expiration

## Key Components

### Content Management System
- **Articles**: Full CRUD operations with bilingual content support
- **Categories**: Hierarchical organization with Arabic and English names
- **Featured Content**: Promoted articles with enhanced visibility
- **SEO Optimization**: Meta tags, structured data, and sitemap generation

### AI Integration (Currently Disabled)
- **Content Generation**: Anthropic Claude integration for automated content creation
- **Quality Validation**: Content quality scoring and ratio validation
- **Translation Services**: AI-powered Arabic content generation
- **Sentiment Analysis**: Media sentiment tracking capabilities

### Media Monitoring Features
- **News Aggregation**: Integration with NewsData.io API for real-time content
- **Multi-language Processing**: Automated translation and content adaptation
- **Analytics Tracking**: User behavior analysis and content performance metrics
- **Search Functionality**: Full-text search across English and Arabic content

### Administrative Interface
- **Dashboard**: Comprehensive admin panel for content management
- **User Management**: Role-based access control (prepared for future implementation)
- **Analytics**: Content performance tracking and user engagement metrics
- **Automation Settings**: Configuration for AI services and content scheduling

## Data Flow

### Content Creation Pipeline
1. Manual content creation through admin interface
2. Optional AI enhancement for Arabic translation
3. Quality validation and approval workflow
4. Publication with SEO optimization
5. Analytics tracking and performance monitoring

### News Aggregation Workflow
1. API integration with NewsData.io for regional content
2. Content filtering by keywords and geographical relevance
3. AI processing for translation and enhancement
4. Quality validation before publication
5. Automated categorization and tagging

### User Interaction Flow
1. Language detection and routing based on URL structure
2. Content delivery with appropriate language variant
3. User engagement tracking and analytics
4. Newsletter subscription and contact form processing
5. Search functionality with cross-language support

## External Dependencies

### Core Services
- **Database**: PostgreSQL (required for production deployment)
- **Email Service**: Zoho SMTP for transactional emails
- **CDN/Assets**: Local file storage with potential for cloud migration

### AI Services (Optional)
- **Anthropic Claude**: Content generation and translation
- **NewsData.io**: Real-time news aggregation
- **SendGrid**: Newsletter and bulk email delivery (configured but not actively used)

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Production build optimization
- **TypeScript**: Type safety across the entire stack

## Deployment Strategy

### Environment Configuration
- **Development**: Local PostgreSQL with hot reloading
- **Production**: Autoscale deployment with optimized builds
- **Environment Variables**: Secure configuration for API keys and database connections

### Build Process
1. Frontend: Vite build with code splitting and optimization
2. Backend: ESBuild compilation with external package bundling
3. Assets: Static file optimization and compression
4. Database: Automated migrations with Drizzle

### Performance Optimizations
- **Caching**: Strategic caching for categories and frequently accessed data
- **Code Splitting**: Lazy loading for admin components
- **Database Optimization**: Indexed queries and connection pooling
- **Image Optimization**: Responsive images with proper sizing

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- June 16, 2025: Completed Phase 4 - Advanced Performance Optimization System
- Phase 4 Implementation: Built comprehensive parallel data loading system with intelligent caching, implemented lazy loading components for heavy visualizations, created advanced cache management with automatic optimization
- Performance Features: Parallel blog data loading with progress indicators, lazy chart loading with intersection observer, intelligent cache prefetching based on user behavior, automatic cache cleanup at 50MB threshold
- Loading Optimizations: Progressive image loading with placeholder support, smart cache invalidation strategies, cache warming for essential data, performance monitoring with real-time metrics
- Architecture Improvements: Advanced memory management hooks, sophisticated caching strategies with stale-time optimization, lazy component wrapper system for heavy elements
- Previous Phases: Completed Phase 1 & 2 systematic performance optimization with database batching, Circuit Breaker pattern, Memory Manager with 30-second monitoring, Rate Limiter with API-specific limits
- June 15, 2025: Completed comprehensive ongoing content production and refresh system
- Built thought leadership publishing system with specialized outlets and citation tracking
- June 14, 2025: Fixed Share button functionality across blog platform
- All core features working without external API dependencies

## Changelog

Changelog:
- June 14, 2025. Initial setup