# Repository Documentation

## Testing Framework
- **Primary E2E Testing Framework**: Playwright
- **Alternative**: Puppeteer (available as dependency)
- **Framework Choice**: Defaulting to Playwright for comprehensive e2e testing capabilities

## Test Configuration
- **Test Directory**: `tests/e2e/`
- **Config File**: `playwright.config.ts`
- **Base URL**: `http://localhost:5000`
- **Test Scripts**:
  - `npm run test:e2e` - Run all e2e tests
  - `npm run test:e2e:headed` - Run tests in headed mode
  - `npm run test:e2e:debug` - Run tests in debug mode
  - `npm run test:e2e:ui` - Run tests with UI mode

## Project Structure
- **Type**: Full-stack web application (React + Express)
- **Frontend**: React with TypeScript, Vite build
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Netlify Functions

## Application Details
- **Name**: AlmstkshfBlog
- **Description**: Blog application with content management system
- **Technology Stack**: React, Express.js, TypeScript, PostgreSQL, Drizzle ORM
- **Features**: Bilingual support (Arabic/English), Admin panel, Article management

## E2E Test Coverage
- **Blog Navigation**: Homepage access, language switching, blog section navigation
- **Article Management**: Article listing, article reading
- **Page Accessibility**: Contact page, search functionality, footer navigation
- **Multi-browser Support**: Chromium, Firefox, WebKit, Mobile browsers